/**
 * generate-novel-data.js - 小说数据生成脚本
 * 观己 - 静观己心，内外澄明
 * 
 * 扫描本地小说目录，自动生成 novels-data.js 配置文件
 * 用法：node scripts/generate-novel-data.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const NOVEL_SOURCE_DIR = 'D:\\Publish\\novel';
const OUTPUT_FILE = path.join(__dirname, '..', 'modules', 'novel', 'novels-data.js');
const BASE_URL = 'novel';

/**
 * 将中文书名转为简单ID（取拼音首字母或使用文件夹名哈希）
 */
function generateBookId(folderName) {
  // 简单方案：将文件夹名转为小写字母+数字的ID
  // 使用 encodeURIComponent 的结果去掉百分号作为简易ID
  return folderName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .split('')
    .map((ch, i) => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      // 中文字符用其 charCode 的后4位
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
  
  // 匹配：第XX章 标题
  let match = name.match(/^第(\d+)章\s+(.+)$/);
  if (match) {
    return {
      number: parseInt(match[1], 10),
      title: match[2].trim()
    };
  }
  
  // 匹配：XX 标题
  match = name.match(/^(\d+)\s+(.+)$/);
  if (match) {
    return {
      number: parseInt(match[1], 10),
      title: match[2].trim()
    };
  }
  
  // 无法解析，返回原始文件名
  return {
    number: 0,
    title: name
  };
}

/**
 * 扫描小说目录
 */
function scanNovels() {
  const books = [];

  if (!fs.existsSync(NOVEL_SOURCE_DIR)) {
    console.error(`小说源目录不存在: ${NOVEL_SOURCE_DIR}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(NOVEL_SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`找到 ${folders.length} 本小说：`);

  for (const folderName of folders) {
    const bookDir = path.join(NOVEL_SOURCE_DIR, folderName);

    const txtFiles = fs.readdirSync(bookDir)
      .filter(f => f.endsWith('.txt'))
      .sort(); // 按文件名排序

    if (txtFiles.length === 0) {
      console.log(`  跳过 "${folderName}"：无 txt 文件`);
      continue;
    }

    const chapters = txtFiles.map((filename, index) => {
      const parsed = parseChapterFilename(filename);
      return {
        id: `ch${String(parsed.number || (index + 1)).padStart(3, '0')}`,
        number: parsed.number || (index + 1),
        title: parsed.title,
        filename: filename
      };
    });

    // 按章节号排序
    chapters.sort((a, b) => a.number - b.number);

    const book = {
      id: generateBookId(folderName),
      name: folderName,
      folder: folderName,
      totalChapters: chapters.length,
      chapters: chapters
    };

    books.push(book);
    console.log(`  "${folderName}"：${chapters.length} 章`);
  }

  return books;
}

/**
 * 生成输出文件
 */
function generateOutput(books) {
  const chaptersJson = books.map(book => {
    const chaptersStr = book.chapters.map(ch => 
      `      { id: '${ch.id}', number: ${ch.number}, title: '${ch.title.replace(/'/g, "\\'")}', filename: '${ch.filename.replace(/'/g, "\\'")}' }`
    ).join(',\n');

    return `    {
      id: '${book.id}',
      name: '${book.name.replace(/'/g, "\\'")}',
      folder: '${book.folder.replace(/'/g, "\\'")}',
      totalChapters: ${book.totalChapters},
      chapters: [
${chaptersStr}
      ]
    }`;
  }).join(',\n');

  const output = `/**
 * novels-data.js - 小说数据配置（自动生成）
 * 观己 - 静观己心，内外澄明
 * 
 * 由 scripts/generate-novel-data.js 自动生成
 * 生成时间：${new Date().toLocaleString('zh-CN')}
 * 请勿手动编辑此文件
 */

const NovelsData = {
  baseUrl: '${BASE_URL}',
  books: [
${chaptersJson}
  ]
};

window.NovelsData = NovelsData;
`;

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`\n数据文件已生成：${OUTPUT_FILE}`);
  console.log(`共 ${books.length} 本书，${books.reduce((sum, b) => sum + b.totalChapters, 0)} 章`);
}

// 主流程
const books = scanNovels();
generateOutput(books);
