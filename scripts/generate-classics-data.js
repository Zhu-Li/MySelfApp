/**
 * generate-classics-data.js - 古籍数据生成脚本
 * 观己 - 静观己心，内外澄明
 * 
 * 递归扫描 D:\work\古书籍 下的古籍目录，生成索引文件供前端按需加载。
 * 只处理 .txt 文件，忽略其他格式（如 .rar）。
 * 
 * 输出到 D:\Publish\MySelf-App\Home\classics\：
 *   index.json         - 十大分类概览（首页用，极小）
 *   catalog/{分类}.json - 每个分类的完整目录树（按需加载）
 *   book-map.json       - bookId → 源文件相对路径映射（API 查找用）
 * 
 * 用法：node scripts/generate-classics-data.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置
const CLASSICS_SOURCE_DIR = 'D:\\work\\古书籍';
const CLASSICS_PUBLISH_DIR = 'D:\\Publish\\MySelf-App\\Home\\classics';

// 十大分类的图标和描述
const CATEGORY_META = {
  '佛藏': { icon: '☸', description: '佛教经律论典籍' },
  '道藏': { icon: '☯', description: '道教经典文献' },
  '儒藏': { icon: '📖', description: '儒家经典著作' },
  '史藏': { icon: '📜', description: '历代史书典籍' },
  '子藏': { icon: '📚', description: '诸子百家著作' },
  '医藏': { icon: '🏥', description: '中医药典籍' },
  '易藏': { icon: '☰', description: '易经术数典籍' },
  '诗藏': { icon: '🎋', description: '诗词歌赋文集' },
  '集藏': { icon: '📕', description: '文集小说话本' },
  '艺藏': { icon: '🎨', description: '艺术文化典籍' }
};

/**
 * 根据相对路径生成稳定的 bookId
 * 使用 md5 前 10 位，加分类前缀确保唯一性
 */
function generateBookId(relativePath) {
  const hash = crypto.createHash('md5').update(relativePath, 'utf8').digest('hex').slice(0, 10);
  // 取分类首字的拼音首字母作前缀（简化：直接用 hash）
  return 'c-' + hash;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 递归扫描目录，构建目录树
 * @param {string} dirPath - 当前扫描的绝对路径
 * @param {string} relBase - 相对于源目录的路径
 * @param {object} bookMap - bookId → 相对路径映射（累积填充）
 * @returns {{ children: Array, bookCount: number }}
 */
function scanDirectory(dirPath, relBase, bookMap) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const children = [];
  let bookCount = 0;

  // 先收集子目录
  const dirs = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  // 再收集 txt 文件
  const files = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.txt')).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  // 处理子目录
  for (const dir of dirs) {
    const childRel = relBase ? `${relBase}/${dir.name}` : dir.name;
    const result = scanDirectory(path.join(dirPath, dir.name), childRel, bookMap);
    if (result.bookCount > 0) {
      children.push({
        type: 'directory',
        name: dir.name,
        bookCount: result.bookCount,
        children: result.children
      });
      bookCount += result.bookCount;
    }
  }

  // 处理 txt 文件
  for (const file of files) {
    const relPath = relBase ? `${relBase}/${file.name}` : file.name;
    const bookId = generateBookId(relPath);
    const bookName = path.basename(file.name, '.txt');

    let fileSize = 0;
    try {
      fileSize = fs.statSync(path.join(dirPath, file.name)).size;
    } catch (e) { /* ignore */ }

    children.push({
      type: 'book',
      id: bookId,
      name: bookName,
      size: fileSize
    });

    bookMap[bookId] = relPath;
    bookCount++;
  }

  return { children, bookCount };
}

/**
 * 主流程
 */
function main() {
  console.log('=== 古籍数据生成 ===');
  console.log('源目录: ' + CLASSICS_SOURCE_DIR);
  console.log('输出目录: ' + CLASSICS_PUBLISH_DIR);
  console.log('');

  if (!fs.existsSync(CLASSICS_SOURCE_DIR)) {
    console.error('源目录不存在: ' + CLASSICS_SOURCE_DIR);
    process.exit(1);
  }

  // 读取十大分类（顶级目录）
  const topEntries = fs.readdirSync(CLASSICS_SOURCE_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  if (topEntries.length === 0) {
    console.error('源目录下没有子目录');
    process.exit(1);
  }

  // 确保输出目录
  ensureDir(CLASSICS_PUBLISH_DIR);
  ensureDir(path.join(CLASSICS_PUBLISH_DIR, 'catalog'));

  const categories = [];
  const bookMap = {};
  let totalBooks = 0;

  for (const entry of topEntries) {
    const categoryName = entry.name;
    const categoryDir = path.join(CLASSICS_SOURCE_DIR, categoryName);
    const meta = CATEGORY_META[categoryName] || { icon: '📄', description: '' };

    console.log(`扫描分类: ${categoryName} ...`);
    const startTime = Date.now();

    const result = scanDirectory(categoryDir, categoryName, bookMap);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  -> ${result.bookCount} 本古籍, 耗时 ${elapsed}s`);

    // 写入分类 catalog JSON
    const catalogData = {
      id: categoryName,
      name: categoryName,
      bookCount: result.bookCount,
      children: result.children
    };

    const catalogPath = path.join(CLASSICS_PUBLISH_DIR, 'catalog', `${categoryName}.json`);
    fs.writeFileSync(catalogPath, JSON.stringify(catalogData), 'utf-8');

    // 添加到分类概览
    categories.push({
      id: categoryName,
      name: categoryName,
      icon: meta.icon,
      description: meta.description,
      bookCount: result.bookCount
    });

    totalBooks += result.bookCount;
  }

  // 写入 index.json（分类概览）
  const indexData = {
    categories: categories,
    totalBooks: totalBooks,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(CLASSICS_PUBLISH_DIR, 'index.json'),
    JSON.stringify(indexData, null, 2),
    'utf-8'
  );

  // 写入 book-map.json（ID → 路径映射）
  fs.writeFileSync(
    path.join(CLASSICS_PUBLISH_DIR, 'book-map.json'),
    JSON.stringify(bookMap),
    'utf-8'
  );

  console.log('');
  console.log('=== 生成完成 ===');
  console.log(`分类数: ${categories.length}`);
  console.log(`古籍总数: ${totalBooks}`);
  console.log(`映射表条目: ${Object.keys(bookMap).length}`);
  console.log('');
  console.log('输出文件:');
  console.log(`  ${path.join(CLASSICS_PUBLISH_DIR, 'index.json')}`);
  console.log(`  ${path.join(CLASSICS_PUBLISH_DIR, 'catalog', '*.json')} (${categories.length} 个)`);
  console.log(`  ${path.join(CLASSICS_PUBLISH_DIR, 'book-map.json')}`);
}

main();
