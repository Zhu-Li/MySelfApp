/**
 * utils/index.js - 工具函数统一入口
 * 观己 - 静观己心，内外澄明
 * 
 * 统一导出所有工具模块，便于管理和使用
 */

// 核心工具
export { ErrorHandler } from './errorHandler.js';
export { AppStore } from './appStore.js';
export { Feedback } from './feedback.js';
export { ImageCompressor } from './imageCompressor.js';
export { TestProgress } from './testProgress.js';

// 兼容性处理：同时支持全局变量
if (typeof window !== 'undefined') {
  // 动态加载所有工具模块
  const modules = [
    'errorHandler.js',
    'appStore.js',
    'feedback.js',
    'imageCompressor.js',
    'testProgress.js'
  ];

  // 记录加载状态
  window.UtilsLoaded = window.UtilsLoaded || {};
  
  console.log('[Utils] 工具模块索引已加载');
}
