#!/usr/bin/env node
/**
 * release.js - 项目发布打包脚本
 * 观己 - 静观己心，内外澄明
 * 
 * 功能：
 * - 自动读取 changelog.js 中的版本号
 * - 将项目文件打包成 ZIP 压缩包
 * - 输出文件名格式：观己-{版本号}.zip
 * 
 * 使用方式：
 * - 命令行执行：node scripts/release.js
 * - Qoder指令配置：在 .qoder/commands.json 中添加 release 指令
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 需要打包的文件和目录
const INCLUDE_ITEMS = [
  'index.html',
  'css',
  'js',
  'modules',
  'assets',
  'pages',
  '.gitignore',
  'robots.txt',
  'sitemap.xml',
  'README.md'
];

// 需要排除的文件和目录模式
const EXCLUDE_PATTERNS = [
  '.git',
  '.qoder',
  'node_modules',
  'scripts',
  '*.zip',
  '.DS_Store',
  'Thumbs.db'
];

/**
 * 从 changelog.js 中读取版本号
 */
function getVersion() {
  const changelogPath = path.join(PROJECT_ROOT, 'modules', 'changelog', 'changelog.js');
  
  if (!fs.existsSync(changelogPath)) {
    throw new Error(`版本文件不存在: ${changelogPath}`);
  }
  
  const content = fs.readFileSync(changelogPath, 'utf-8');
  
  // 使用正则匹配 currentVersion: 'x.x.x'
  const versionMatch = content.match(/currentVersion:\s*['"]([^'"]+)['"]/);
  
  if (!versionMatch) {
    throw new Error('无法从 changelog.js 中读取版本号，请确保文件包含 currentVersion 属性');
  }
  
  return versionMatch[1];
}

/**
 * 检查文件/目录是否应该被排除
 */
function shouldExclude(itemPath) {
  const itemName = path.basename(itemPath);
  
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.startsWith('*')) {
      // 通配符模式
      const ext = pattern.slice(1);
      if (itemName.endsWith(ext)) return true;
    } else {
      // 精确匹配
      if (itemName === pattern) return true;
    }
  }
  
  return false;
}

/**
 * 创建 ZIP 压缩包
 */
async function createZip(version) {
  const outputFileName = `观己-${version}.zip`;
  const outputPath = path.join(PROJECT_ROOT, outputFileName);
  
  // 如果已存在同名文件，先删除
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log(`已删除旧版本文件: ${outputFileName}`);
  }
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });
    
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      resolve({ path: outputPath, fileName: outputFileName, size: sizeMB });
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('警告:', err.message);
      } else {
        reject(err);
      }
    });
    
    archive.pipe(output);
    
    // 添加文件和目录
    for (const item of INCLUDE_ITEMS) {
      const itemPath = path.join(PROJECT_ROOT, item);
      
      if (!fs.existsSync(itemPath)) {
        console.warn(`跳过不存在的项目: ${item}`);
        continue;
      }
      
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 添加目录（递归）
        archive.directory(itemPath, item, (entry) => {
          // 过滤掉需要排除的文件
          if (shouldExclude(entry.name)) {
            return false;
          }
          return entry;
        });
        console.log(`添加目录: ${item}/`);
      } else {
        // 添加文件
        archive.file(itemPath, { name: item });
        console.log(`添加文件: ${item}`);
      }
    }
    
    archive.finalize();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       观己 - 项目发布打包工具            ║');
  console.log('║       静观己心，内外澄明                 ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  
  try {
    // 1. 读取版本号
    console.log('正在读取版本号...');
    const version = getVersion();
    console.log(`当前版本: v${version}`);
    console.log('');
    
    // 2. 创建 ZIP 文件
    console.log('正在打包项目文件...');
    console.log('─'.repeat(40));
    
    const result = await createZip(version);
    
    console.log('─'.repeat(40));
    console.log('');
    console.log('打包完成!');
    console.log(`文件名称: ${result.fileName}`);
    console.log(`文件大小: ${result.size} MB`);
    console.log(`保存路径: ${result.path}`);
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('发布失败:', error.message);
    console.error('');
    process.exit(1);
  }
}

// 执行主函数
main();
