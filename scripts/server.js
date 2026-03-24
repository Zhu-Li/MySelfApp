/**
 * server.js - 观己书籍 API 服务
 * 静观己心，内外澄明
 * 
 * 功能：
 * 1. /api/novel/refresh - 小说数据增量同步接口
 *    进入小说模块时自动扫描源目录，增量拷贝新章节，返回最新书籍数据
 * 2. /api/classics/* - 古籍数据接口
 *    分类列表、目录树、古籍内容读取
 * 3. 静态文件服务（可选，IIS 部署时由 IIS 提供静态服务）
 * 
 * 部署方式：注册为 Windows 服务，后台持续运行
 * 用法：node server.js [端口号]
 * 默认端口：3001
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

// ============ 配置 ============

const PORT = parseInt(process.argv[2], 10) || 3001;
const STATIC_DIR = 'D:\\Publish\\MySelf-App\\Home';

// ============ TTS 配置 ============

const TTS_MAX_TEXT_LENGTH = 2000;        // 单次合成最大字符数
const TTS_CACHE_MAX_SIZE = 50 * 1024 * 1024;  // LRU 缓存上限 50MB
const TTS_DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';
const TTS_DEFAULT_RATE = '+0%';

// TTS LRU 缓存
const ttsCache = new Map();
let ttsCacheSize = 0;

// TTS 语音列表缓存
let ttsVoicesCache = null;

/**
 * 生成 TTS 缓存 key
 */
function ttsCacheKey(text, voice, rate) {
  return `${voice}|${rate}|${text}`;
}

/**
 * LRU 缓存 - 写入
 */
function ttsCacheSet(key, buffer) {
  // 如果已存在，先删除旧的（Map 迭代序会更新）
  if (ttsCache.has(key)) {
    ttsCacheSize -= ttsCache.get(key).length;
    ttsCache.delete(key);
  }
  // 淘汰最旧的条目直到空间足够
  while (ttsCacheSize + buffer.length > TTS_CACHE_MAX_SIZE && ttsCache.size > 0) {
    const oldest = ttsCache.keys().next().value;
    ttsCacheSize -= ttsCache.get(oldest).length;
    ttsCache.delete(oldest);
  }
  ttsCache.set(key, buffer);
  ttsCacheSize += buffer.length;
}

/**
 * LRU 缓存 - 读取（读取后移到末尾保持活跃）
 */
function ttsCacheGet(key) {
  if (!ttsCache.has(key)) return null;
  const val = ttsCache.get(key);
  ttsCache.delete(key);
  ttsCache.set(key, val);
  return val;
}
const NOVEL_SOURCE_DIR = 'D:\\Publish\\novel';
const NOVEL_PUBLISH_DIR = path.join(STATIC_DIR, 'novel');

// ============ 古籍配置 ============

const CLASSICS_SOURCE_DIR = 'D:\\work\\古书籍';
const CLASSICS_PUBLISH_DIR = path.join(STATIC_DIR, 'classics');

// 古籍 bookId → 源文件相对路径映射（启动时加载）
let classicsBookMap = {};

function loadClassicsBookMap() {
  const mapPath = path.join(CLASSICS_PUBLISH_DIR, 'book-map.json');
  try {
    if (fs.existsSync(mapPath)) {
      classicsBookMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
      console.log('[古籍] 已加载映射表: ' + Object.keys(classicsBookMap).length + ' 条');
    }
  } catch (e) {
    console.warn('[古籍] 映射表加载失败:', e.message);
    classicsBookMap = {};
  }
}

// ============ MIME 类型 ============

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.zip': 'application/zip'
};

// ============ 小说数据工具函数 ============

/**
 * 中文书名 → ASCII ID
 */
function generateBookId(folderName) {
  return folderName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .split('')
    .map(ch => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      return ch.charCodeAt(0).toString(16).slice(-4);
    })
    .join('');
}

/**
 * 解析章节文件名
 * 支持：第01章 标题.txt、第1章 标题.txt、01 标题.txt
 */
function parseChapterFilename(filename) {
  const name = path.basename(filename, '.txt');

  let match = name.match(/^第(\d+)章\s+(.+)$/);
  if (match) return { number: parseInt(match[1], 10), title: match[2].trim() };

  match = name.match(/^(\d+)\s+(.+)$/);
  if (match) return { number: parseInt(match[1], 10), title: match[2].trim() };

  return { number: 0, title: name };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * 加载已有的 index.json
 */
function loadExistingIndex() {
  const indexPath = path.join(NOVEL_PUBLISH_DIR, 'index.json');
  try {
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }
  } catch (e) { /* 文件损坏则视为空 */ }
  return { baseUrl: 'novel', books: [] };
}

// ============ 增量同步核心逻辑 ============

/**
 * 扫描小说源目录，与已有数据对比，增量拷贝新增/变更文件
 * 返回最新的小说数据
 */
function refreshNovels() {
  if (!fs.existsSync(NOVEL_SOURCE_DIR)) {
    return { baseUrl: 'novel', books: [] };
  }

  const existing = loadExistingIndex();
  const existingMap = {};
  existing.books.forEach(b => { existingMap[b.id] = b; });

  const folders = fs.readdirSync(NOVEL_SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const newBooks = [];
  const processedIds = new Set();
  let totalCopied = 0;
  let totalSkipped = 0;

  for (const folderName of folders) {
    const bookDir = path.join(NOVEL_SOURCE_DIR, folderName);
    const txtFiles = fs.readdirSync(bookDir).filter(f => f.endsWith('.txt')).sort();
    if (txtFiles.length === 0) continue;

    const bookId = generateBookId(folderName);
    processedIds.add(bookId);
    const bookPublishDir = path.join(NOVEL_PUBLISH_DIR, bookId);
    ensureDir(bookPublishDir);

    const chapters = [];

    for (let i = 0; i < txtFiles.length; i++) {
      const filename = txtFiles[i];
      const parsed = parseChapterFilename(filename);
      const chapterNum = parsed.number || (i + 1);
      const safeFilename = 'ch' + String(chapterNum).padStart(3, '0') + '.txt';

      const srcPath = path.join(bookDir, filename);
      const destPath = path.join(bookPublishDir, safeFilename);

      // 增量判断：目标不存在 或 源文件更新/大小不同 → 拷贝
      let needCopy = false;
      if (!fs.existsSync(destPath)) {
        needCopy = true;
      } else {
        const srcStat = fs.statSync(srcPath);
        const destStat = fs.statSync(destPath);
        if (srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size) {
          needCopy = true;
        }
      }

      if (needCopy) {
        fs.copyFileSync(srcPath, destPath);
        totalCopied++;
      } else {
        totalSkipped++;
      }

      chapters.push({
        id: 'ch' + String(chapterNum).padStart(3, '0'),
        number: chapterNum,
        title: parsed.title,
        filename: safeFilename
      });
    }

    chapters.sort((a, b) => a.number - b.number);

    newBooks.push({
      id: bookId,
      name: folderName,
      totalChapters: chapters.length,
      chapters
    });
  }

  // 清理已删除的书籍目录
  for (const oldBook of existing.books) {
    if (!processedIds.has(oldBook.id)) {
      const oldDir = path.join(NOVEL_PUBLISH_DIR, oldBook.id);
      if (fs.existsSync(oldDir)) {
        fs.rmSync(oldDir, { recursive: true });
        console.log('  [删除] ' + oldBook.name + ' (' + oldBook.id + ')');
      }
    }
  }

  const result = { baseUrl: 'novel', books: newBooks };

  // 写入 index.json
  ensureDir(NOVEL_PUBLISH_DIR);
  fs.writeFileSync(
    path.join(NOVEL_PUBLISH_DIR, 'index.json'),
    JSON.stringify(result, null, 2),
    'utf-8'
  );

  console.log('[小说刷新] ' + newBooks.length + ' 本书, 拷贝 ' + totalCopied + ' 文件, 跳过 ' + totalSkipped + ' 文件');

  return result;
}

// ============ 静态文件服务 ============

function serveStatic(req, res) {
  let pathname = url.parse(req.url).pathname;
  if (pathname === '/') pathname = '/index.html';

  // 去掉查询参数部分
  const filePath = path.join(STATIC_DIR, decodeURIComponent(pathname));

  // 防止目录穿越
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA 回退：非资源请求返回 index.html
        if (!ext || ext === '.html') {
          fs.readFile(path.join(STATIC_DIR, 'index.html'), (err2, html) => {
            if (err2) {
              res.writeHead(500);
              res.end('Server Error');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
          });
          return;
        }
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ============ TTS API 处理函数 ============

/**
 * GET /api/novel/tts/voices
 * 返回可用的中文语音列表
 */
async function handleTTSVoices(req, res) {
  try {
    if (ttsVoicesCache) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      });
      res.end(JSON.stringify(ttsVoicesCache));
      return;
    }

    const tts = new MsEdgeTTS();
    const allVoices = await tts.getVoices();
    tts.close();

    // 筛选中文语音，返回精简格式
    const zhVoices = allVoices
      .filter(v => v.Locale && v.Locale.startsWith('zh'))
      .map(v => ({
        id: v.ShortName,
        name: v.FriendlyName.replace(/Microsoft\s+/, '').replace(/\s+Online\s+\(Natural\)/, ''),
        gender: v.Gender === 'Female' ? '女' : '男',
        locale: v.Locale
      }));

    ttsVoicesCache = { voices: zhVoices, default: TTS_DEFAULT_VOICE };

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(JSON.stringify(ttsVoicesCache));
  } catch (e) {
    console.error('[TTS 语音列表错误]', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '获取语音列表失败: ' + e.message }));
  }
}

/**
 * GET /api/novel/tts?text=...&voice=zh-CN-XiaoxiaoNeural&rate=+0%
 * 合成语音并返回 MP3 音频流
 */
async function handleTTSSynth(req, res) {
  const params = new URL(req.url, 'http://localhost').searchParams;
  const text = params.get('text');
  let voice = params.get('voice') || TTS_DEFAULT_VOICE;
  const rate = params.get('rate') || TTS_DEFAULT_RATE;

  if (!text) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '缺少 text 参数' }));
    return;
  }

  if (text.length > TTS_MAX_TEXT_LENGTH) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '文本过长，最大 ' + TTS_MAX_TEXT_LENGTH + ' 字符' }));
    return;
  }

  // 校验 voice 参数格式（Edge TTS ShortName 格式: xx-XX-XxxNeural）
  // 如果传入的是旧版 Web Speech API 的 FriendlyName，回退到默认语音
  if (!/^[a-z]{2}-[A-Z]{2}/i.test(voice)) {
    console.warn('[TTS] 无效的 voice 参数，回退默认:', voice.substring(0, 50));
    voice = TTS_DEFAULT_VOICE;
  }

  // 检查缓存
  const cacheKey = ttsCacheKey(text, voice, rate);
  const cached = ttsCacheGet(cacheKey);
  if (cached) {
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': cached.length,
      'Cache-Control': 'public, max-age=86400'
    });
    res.end(cached);
    return;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
      rate: rate
    });

    const result = tts.toStream(text);
    const chunks = [];

    result.audioStream.on('data', chunk => chunks.push(chunk));
    result.audioStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      tts.close();

      // 写入缓存
      ttsCacheSet(cacheKey, buffer);

      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=86400'
      });
      res.end(buffer);
    });
    result.audioStream.on('error', err => {
      tts.close();
      console.error('[TTS 合成错误]', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '语音合成失败: ' + err.message }));
    });
  } catch (e) {
    console.error('[TTS 合成错误]', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '语音合成失败: ' + e.message }));
  }
}

// ============ 启动服务器 ============

const server = http.createServer((req, res) => {
  // CORS 头（允许 IIS 等其他域名的前端调用此 API）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 路由：小说增量刷新
  if (req.url.startsWith('/api/novel/refresh')) {
    try {
      const data = refreshNovels();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error('[小说刷新错误]', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API 路由：读取章节内容
  // GET /api/novel/chapter?book=bookId&file=ch001.txt
  if (req.url.startsWith('/api/novel/chapter')) {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const bookId = params.get('book');
    const filename = params.get('file');

    if (!bookId || !filename) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '缺少 book 或 file 参数' }));
      return;
    }

    // 安全检查：防止路径穿越
    if (bookId.includes('..') || bookId.includes('/') || bookId.includes('\\') ||
        filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '非法路径' }));
      return;
    }

    const chapterPath = path.join(NOVEL_PUBLISH_DIR, bookId, filename);
    fs.readFile(chapterPath, 'utf-8', (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '章节文件不存在' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
    return;
  }

  // API 路由：TTS 语音列表
  // GET /api/novel/tts/voices
  if (req.url.startsWith('/api/novel/tts/voices')) {
    handleTTSVoices(req, res);
    return;
  }

  // API 路由：TTS 语音合成
  // GET /api/novel/tts?text=...&voice=zh-CN-XiaoxiaoNeural&rate=+0%
  if (req.url.startsWith('/api/novel/tts')) {
    handleTTSSynth(req, res);
    return;
  }

  // ============ 古籍 API 路由 ============

  // API 路由：古籍分类列表
  // GET /api/classics/categories
  if (req.url.startsWith('/api/classics/categories')) {
    const indexPath = path.join(CLASSICS_PUBLISH_DIR, 'index.json');
    fs.readFile(indexPath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.code === 'ENOENT' ? '古籍数据未初始化' : err.message }));
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      });
      res.end(data);
    });
    return;
  }

  // API 路由：古籍分类目录树
  // GET /api/classics/catalog?category=佛藏
  if (req.url.startsWith('/api/classics/catalog')) {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const category = params.get('category');

    if (!category) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '缺少 category 参数' }));
      return;
    }

    if (category.includes('..') || category.includes('/') || category.includes('\\')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '非法参数' }));
      return;
    }

    const catalogPath = path.join(CLASSICS_PUBLISH_DIR, 'catalog', category + '.json');
    fs.readFile(catalogPath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.code === 'ENOENT' ? '分类不存在: ' + category : err.message }));
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      });
      res.end(data);
    });
    return;
  }

  // API 路由：古籍内容读取（流式返回）
  // GET /api/classics/content?id=xxx
  if (req.url.startsWith('/api/classics/content')) {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const bookId = params.get('id');

    if (!bookId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '缺少 id 参数' }));
      return;
    }

    const relativePath = classicsBookMap[bookId];
    if (!relativePath) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '古籍不存在: ' + bookId }));
      return;
    }

    const filePath = path.join(CLASSICS_SOURCE_DIR, relativePath);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(CLASSICS_SOURCE_DIR))) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '非法路径' }));
      return;
    }

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
    stream.pipe(res);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.code === 'ENOENT' ? '文件不存在' : err.message }));
      } else {
        res.end();
      }
    });
    return;
  }

  // API 路由：古籍数据刷新（手动触发）
  // GET /api/classics/refresh
  if (req.url.startsWith('/api/classics/refresh')) {
    try {
      const { execSync } = require('child_process');
      const scriptPath = path.join(__dirname, 'generate-classics-data.js');
      if (fs.existsSync(scriptPath)) {
        execSync('node "' + scriptPath + '"', { timeout: 600000 });
        loadClassicsBookMap();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, bookCount: Object.keys(classicsBookMap).length }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '生成脚本不存在' }));
      }
    } catch (e) {
      console.error('[古籍刷新错误]', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 静态文件
  serveStatic(req, res);
});

server.listen(PORT, () => {
  loadClassicsBookMap();
  const ts = new Date().toLocaleString('zh-CN');
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   观己书籍 API 服务已启动             ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  API:  http://localhost:' + String(PORT).padEnd(5) + '         ║');
  console.log('  ║  小说: ' + NOVEL_SOURCE_DIR.substring(0, 28).padEnd(28) + '  ║');
  console.log('  ║  古籍: ' + CLASSICS_SOURCE_DIR.substring(0, 28).padEnd(28) + '  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('  启动时间: ' + ts);
  console.log('  API 端点:');
  console.log('    GET /api/novel/refresh');
  console.log('    GET /api/novel/chapter?book=&file=');
  console.log('    GET /api/novel/tts/voices');
  console.log('    GET /api/novel/tts?text=&voice=&rate=');
  console.log('    GET /api/classics/categories');
  console.log('    GET /api/classics/catalog?category=');
  console.log('    GET /api/classics/content?id=');
  console.log('    GET /api/classics/refresh');
  console.log('');
  console.log('');
});
