/**
 * imageCompressor.js - 图片压缩模块
 * 观己 - 静观己心，内外澄明
 * 
 * 提供图片压缩、缩略图生成、格式转换等功能
 */

const ImageCompressor = {
  // 默认配置
  defaultOptions: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    type: 'image/jpeg',
    preserveExif: false
  },

  // 缩略图配置
  thumbnailOptions: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    type: 'image/jpeg'
  },

  /**
   * 压缩图片
   * @param {File|Blob|string} source - 图片源（文件、Blob 或 DataURL）
   * @param {Object} options - 压缩选项
   * @returns {Promise<Blob>} 压缩后的图片 Blob
   */
  async compress(source, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      // 获取图片数据
      const imageData = await this.loadImage(source);
      
      // 计算新尺寸
      const dimensions = this.calculateDimensions(
        imageData.width, 
        imageData.height, 
        config.maxWidth, 
        config.maxHeight
      );
      
      // 创建 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      const ctx = canvas.getContext('2d');
      
      // 启用高质量缩放
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 绘制图片
      ctx.drawImage(imageData.image, 0, 0, dimensions.width, dimensions.height);
      
      // 转换为 Blob
      const blob = await this.canvasToBlob(canvas, config.type, config.quality);
      
      return {
        blob,
        width: dimensions.width,
        height: dimensions.height,
        originalWidth: imageData.width,
        originalHeight: imageData.height,
        originalSize: imageData.size,
        compressedSize: blob.size,
        compressionRatio: ((imageData.size - blob.size) / imageData.size * 100).toFixed(2)
      };
    } catch (error) {
      console.error('[ImageCompressor] 压缩失败:', error);
      throw error;
    }
  },

  /**
   * 生成缩略图
   * @param {File|Blob|string} source - 图片源
   * @param {Object} options - 缩略图选项
   * @returns {Promise<Blob>} 缩略图 Blob
   */
  async thumbnail(source, options = {}) {
    const config = { ...this.thumbnailOptions, ...options };
    return this.compress(source, config);
  },

  /**
   * 批量压缩图片
   * @param {Array<File|Blob>} files - 图片文件数组
   * @param {Object} options - 压缩选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 压缩结果数组
   */
  async compressBatch(files, options = {}, onProgress = null) {
    const results = [];
    const total = files.length;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.compress(files[i], options);
        results.push({ success: true, ...result });
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total,
            progress: ((i + 1) / total * 100).toFixed(0),
            currentFile: files[i].name
          });
        }
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          file: files[i].name 
        });
      }
    }
    
    return results;
  },

  /**
   * 加载图片
   * @param {File|Blob|string} source - 图片源
   * @returns {Promise<Object>} 图片数据
   */
  loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        let size = 0;
        
        if (source instanceof File) {
          size = source.size;
        } else if (source instanceof Blob) {
          size = source.size;
        }
        
        resolve({
          image,
          width: image.naturalWidth,
          height: image.naturalHeight,
          size
        });
      };
      
      image.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      // 获取图片 URL
      if (source instanceof File || source instanceof Blob) {
        image.src = URL.createObjectURL(source);
      } else if (typeof source === 'string') {
        image.src = source;
      } else {
        reject(new Error('不支持的图片源类型'));
      }
    });
  },

  /**
   * 计算新尺寸（保持宽高比）
   * @param {number} srcWidth - 原始宽度
   * @param {number} srcHeight - 原始高度
   * @param {number} maxWidth - 最大宽度
   * @param {number} maxHeight - 最大高度
   * @returns {Object} 新尺寸
   */
  calculateDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
    let width = srcWidth;
    let height = srcHeight;
    
    // 如果图片小于限制，不放大
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }
    
    // 计算缩放比例
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    
    return { width, height };
  },

  /**
   * Canvas 转 Blob
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {string} type - 图片类型
   * @param {number} quality - 图片质量
   * @returns {Promise<Blob>}
   */
  canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas 转 Blob 失败'));
          }
        },
        type,
        quality
      );
    });
  },

  /**
   * 获取图片信息
   * @param {File|Blob} file - 图片文件
   * @returns {Promise<Object>} 图片信息
   */
  async getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
          size: file.size,
          type: file.type,
          name: file.name,
          aspectRatio: (image.naturalWidth / image.naturalHeight).toFixed(2)
        });
      };
      
      image.onerror = () => {
        reject(new Error('无法读取图片信息'));
      };
      
      image.src = URL.createObjectURL(file);
    });
  },

  /**
   * 转换为 WebP 格式（如果浏览器支持）
   * @param {File|Blob} file - 图片文件
   * @param {number} quality - 质量
   * @returns {Promise<Blob>}
   */
  async toWebP(file, quality = 0.85) {
    // 检查浏览器是否支持 WebP
    const canvas = document.createElement('canvas');
    if (!canvas.toBlob || !canvas.toDataURL('image/webp').includes('webp')) {
      // 不支持 WebP，返回原格式压缩
      return this.compress(file, { quality });
    }
    
    return this.compress(file, { type: 'image/webp', quality });
  },

  /**
   * 创建图片预览
   * @param {File|Blob} file - 图片文件
   * @param {Object} options - 预览选项
   * @returns {Promise<string>} DataURL
   */
  async createPreview(file, options = {}) {
    const { maxWidth = 100, maxHeight = 100, quality = 0.6 } = options;
    
    const result = await this.compress(file, {
      maxWidth,
      maxHeight,
      quality,
      type: 'image/jpeg'
    });
    
    return this.blobToDataURL(result.blob);
  },

  /**
   * Blob 转 DataURL
   * @param {Blob} blob - Blob 对象
   * @returns {Promise<string>} DataURL
   */
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * DataURL 转 Blob
   * @param {string} dataURL - DataURL
   * @returns {Blob} Blob 对象
   */
  dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  },

  /**
   * 检查文件是否为图片
   * @param {File} file - 文件
   * @returns {boolean}
   */
  isImage(file) {
    return file && file.type.startsWith('image/');
  },

  /**
   * 检查文件大小
   * @param {File} file - 文件
   * @param {number} maxSize - 最大大小（MB）
   * @returns {boolean}
   */
  checkSize(file, maxSize = 10) {
    return file.size <= maxSize * 1024 * 1024;
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的字符串
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageCompressor;
}
