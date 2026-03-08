/**
 * server.js - 观己小说 API 服务
 * 静观己心，内外澄明
 * 
 * 功能：
 * 1. /api/novel/refresh - 小说数据增量同步接口
 *    进入小说模块时自动扫描源目录，增量拷贝新章节，返回最新书籍数据
 * 2. 静态文件服务（可选，IIS 部署时由 IIS 提供静态服务）
 * 
 * 部署方式：注册为 Windows 服务，后台持续运行
 * 用法：node server.js [端口号]
 * 默认端口：3001
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ============ 配置 ============

const PORT = parseInt(process.argv[2], 10) || 3001;
const STATIC_DIR = 'D:\\Publish\\MySelf-App\\Home';
const NOVEL_SOURCE_DIR = 'D:\\Publish\\novel';
const NOVEL_PUBLISH_DIR = path.join(STATIC_DIR, 'novel');

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

  // 静态文件
  serveStatic(req, res);
});

server.listen(PORT, () => {
  const ts = new Date().toLocaleString('zh-CN');
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   观己小说 API 服务已启动             ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  API:  http://localhost:' + String(PORT).padEnd(5) + '         ║');
  console.log('  ║  小说: ' + NOVEL_SOURCE_DIR.substring(0, 28).padEnd(28) + '  ║');
  console.log('  ║  发布: ' + NOVEL_PUBLISH_DIR.substring(0, 28).padEnd(28) + '  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('  启动时间: ' + ts);
  console.log('  API 端点: GET /api/novel/refresh');
  console.log('');
});
