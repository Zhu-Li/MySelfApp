/**
 * generate-novel-data.js - 小说数据生成脚本
 * 观己 - 静观己心，内外澄明
 * 
 * 扫描 D:\Publish\novel\ 下的小说目录，生成 index.json 配置文件到发布目录，
 * 同时将章节文件以 ASCII 安全文件名拷贝到发布目录，避免中文路径 404 问题。
 * 前端通过 fetch('novel/index.json') 动态加载书籍数据。
 * 
 * 用法：node scripts/generate-novel-data.js
 * 
 * 源目录结构：D:\Publish\novel\书名\第01章 标题.txt
 * 输出目录结构：D:\Publish\MySelf-App\Home\novel\{bookId}\ch001.txt
 */

const fs = require('fs');
const path = require('path');

// 配置
const NOVEL_SOURCE_DIR = 'D:\\Publish\\novel';
const NOVEL_PUBLISH_DIR = 'D:\\Publish\\MySelf-App\\Home\\novel';


/**
 * 将中文书名转为简单ID
 */
function generateBookId(folderName) {
  return folderName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .split('')
    .map((ch) => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      return ch.charCodeAt(0).toString(16).slice(-4);
    })
    .join('');
}

/**
 * 解析章节文件名
 * 支持格式：第01章 标题.txt、第1章 标题.txt、01 标题.txt
 */
function parseChapterFilename(filename) {
  const name = path.basename(filename, '.txt');
  
  let match = name.match(/^第(\d+)章\s+(.+)$/);
  if (match) {
    return { number: parseInt(match[1], 10), title: match[2].trim() };
  }
  
  match = name.match(/^(\d+)\s+(.+)$/);
  if (match) {
    return { number: parseInt(match[1], 10), title: match[2].trim() };
  }
  
  return { number: 0, title: name };
}

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 扫描小说目录并拷贝文件到发布目录（ASCII文件名）
 */
function scanAndCopyNovels() {
  const books = [];

  if (!fs.existsSync(NOVEL_SOURCE_DIR)) {
    console.error('小说源目录不存在: ' + NOVEL_SOURCE_DIR);
    process.exit(1);
  }

  const folders = fs.readdirSync(NOVEL_SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log('找到 ' + folders.length + ' 本小说：');

  // 清理旧的发布目录
  if (fs.existsSync(NOVEL_PUBLISH_DIR)) {
    fs.rmSync(NOVEL_PUBLISH_DIR, { recursive: true });
  }
  ensureDir(NOVEL_PUBLISH_DIR);

  for (const folderName of folders) {
    const bookDir = path.join(NOVEL_SOURCE_DIR, folderName);

    const txtFiles = fs.readdirSync(bookDir)
      .filter(f => f.endsWith('.txt'))
      .sort();

    if (txtFiles.length === 0) {
      console.log('  跳过 "' + folderName + '"：无 txt 文件');
      continue;
    }

    const bookId = generateBookId(folderName);
    const bookPublishDir = path.join(NOVEL_PUBLISH_DIR, bookId);
    ensureDir(bookPublishDir);

    const chapters = txtFiles.map((filename, index) => {
      const parsed = parseChapterFilename(filename);
      const chapterNum = parsed.number || (index + 1);
      const safeFilename = 'ch' + String(chapterNum).padStart(3, '0') + '.txt';

      // 拷贝文件到发布目录（ASCII文件名）
      const srcPath = path.join(bookDir, filename);
      const destPath = path.join(bookPublishDir, safeFilename);
      fs.copyFileSync(srcPath, destPath);

      return {
        id: 'ch' + String(chapterNum).padStart(3, '0'),
        number: chapterNum,
        title: parsed.title,
        filename: safeFilename
      };
    });

    chapters.sort((a, b) => a.number - b.number);

    const book = {
      id: bookId,
      name: folderName,
      totalChapters: chapters.length,
      chapters: chapters
    };

    books.push(book);
    console.log('  "' + folderName + '" -> ' + bookId + '/ (' + chapters.length + ' 章已拷贝)');
  }

  return books;
}

/**
 * 生成输出文件（index.json 供前端动态加载）
 */
function generateOutput(books) {
  // 生成 index.json 到发布目录（前端运行时通过 fetch 加载）
  const indexData = {
    baseUrl: 'novel',
    books: books.map(book => ({
      id: book.id,
      name: book.name,
      totalChapters: book.totalChapters,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        number: ch.number,
        title: ch.title,
        filename: ch.filename
      }))
    }))
  };

  const indexJsonPath = path.join(NOVEL_PUBLISH_DIR, 'index.json');
  ensureDir(NOVEL_PUBLISH_DIR);
  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log('\nindex.json：' + indexJsonPath);
  console.log('发布目录：' + NOVEL_PUBLISH_DIR);
  console.log('共 ' + books.length + ' 本书，' + books.reduce((sum, b) => sum + b.totalChapters, 0) + ' 章');
}

// 主流程
const books = scanAndCopyNovels();
generateOutput(books);
