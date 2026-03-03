/**
 * errorHandler.js - 统一错误处理模块
 * 观己 - 静观己心，内外澄明
 */

const ErrorHandler = {
  // 错误类型定义
  ErrorTypes: {
    STORAGE: 'STORAGE_ERROR',
    NETWORK: 'NETWORK_ERROR',
    API: 'API_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    CRYPTO: 'CRYPTO_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  },

  // 错误配置
  errorConfig: {
    [this.ErrorTypes.STORAGE]: {
      title: '存储错误',
      message: '数据存储出现问题，请检查浏览器存储空间',
      action: '清理数据',
      handler: () => {
        // 跳转到数据管理页面
        window.location.href = '#/settings';
      }
    },
    [this.ErrorTypes.NETWORK]: {
      title: '网络错误',
      message: '网络连接失败，请检查网络设置',
      action: '重试',
      handler: () => {
        window.location.reload();
      }
    },
    [this.ErrorTypes.API]: {
      title: 'API 错误',
      message: '服务暂时不可用，请稍后重试',
      action: '确定',
      handler: null
    },
    [this.ErrorTypes.VALIDATION]: {
      title: '输入错误',
      message: '请检查输入内容是否正确',
      action: '确定',
      handler: null
    },
    [this.ErrorTypes.CRYPTO]: {
      title: '安全错误',
      message: '加密操作失败，请重新输入密码',
      action: '确定',
      handler: null
    },
    [this.ErrorTypes.UNKNOWN]: {
      title: '系统错误',
      message: '发生未知错误，请刷新页面重试',
      action: '刷新',
      handler: () => {
        window.location.reload();
      }
    }
  },

  /**
   * 初始化错误处理
   */
  init() {
    // 全局错误监听
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error);
    });

    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason);
    });

    console.log('[ErrorHandler] 初始化完成');
  },

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   * @returns {Object} 错误处理结果
   */
  handle(error, context = {}) {
    const { source = 'unknown', silent = false, fallback = null } = context;
    
    // 分类错误
    const errorType = this.classifyError(error);
    const config = this.errorConfig[errorType];
    
    // 记录错误日志
    this.logError(error, errorType, source);
    
    // 如果不是静默模式，显示错误提示
    if (!silent) {
      this.showErrorNotification(error, config);
    }
    
    // 返回错误信息
    return {
      success: false,
      error: {
        type: errorType,
        message: this.getUserFriendlyMessage(error, config),
        original: error.message,
        source
      },
      fallback
    };
  },

  /**
   * 分类错误
   * @param {Error} error - 错误对象
   * @returns {string} 错误类型
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const name = error.name || '';

    // 存储相关错误
    if (message.includes('quota') || 
        message.includes('storage') || 
        message.includes('indexeddb') ||
        name === 'QuotaExceededError') {
      return this.ErrorTypes.STORAGE;
    }

    // 网络相关错误
    if (message.includes('network') || 
        message.includes('fetch') || 
        message.includes('timeout') ||
        error instanceof TypeError && message.includes('fetch')) {
      return this.ErrorTypes.NETWORK;
    }

    // API 相关错误
    if (message.includes('api') || 
        message.includes('http') || 
        error.status >= 400) {
      return this.ErrorTypes.API;
    }

    // 验证错误
    if (message.includes('valid') || 
        message.includes('required') || 
        message.includes('invalid')) {
      return this.ErrorTypes.VALIDATION;
    }

    // 加密错误
    if (message.includes('crypto') || 
        message.includes('encrypt') || 
        message.includes('decrypt') ||
        message.includes('password')) {
      return this.ErrorTypes.CRYPTO;
    }

    return this.ErrorTypes.UNKNOWN;
  },

  /**
   * 获取用户友好的错误信息
   * @param {Error} error - 错误对象
   * @param {Object} config - 错误配置
   * @returns {string} 用户友好的消息
   */
  getUserFriendlyMessage(error, config) {
    if (config && config.message) {
      return config.message;
    }
    
    // 默认消息映射
    const messageMap = {
      'QuotaExceededError': '存储空间不足，请清理数据后重试',
      'NotFoundError': '找不到请求的数据',
      'AbortError': '操作已取消',
      'TimeoutError': '操作超时，请重试'
    };

    return messageMap[error.name] || '操作失败，请重试';
  },

  /**
   * 显示错误通知
   * @param {Error} error - 错误对象
   * @param {Object} config - 错误配置
   */
  showErrorNotification(error, config) {
    if (typeof Feedback !== 'undefined' && Feedback.toast) {
      Feedback.toast(config?.message || error.message, 'error');
    } else {
      // 降级到 alert
      console.error('[Error]', error);
    }
  },

  /**
   * 记录错误日志
   * @param {Error} error - 错误对象
   * @param {string} type - 错误类型
   * @param {string} source - 错误来源
   */
  logError(error, type, source) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      source,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('[ErrorHandler]', logEntry);

    // 可以在这里添加错误上报逻辑
    // this.reportError(logEntry);
  },

  /**
   * 处理全局错误
   * @param {Error} error - 错误对象
   */
  handleGlobalError(error) {
    this.handle(error, { source: 'global', silent: true });
  },

  /**
   * 处理 Promise 拒绝
   * @param {*} reason - 拒绝原因
   */
  handlePromiseRejection(reason) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    this.handle(error, { source: 'promise', silent: true });
  },

  /**
   * 包装异步函数，自动处理错误
   * @param {Function} fn - 异步函数
   * @param {Object} context - 错误上下文
   * @returns {Function} 包装后的函数
   */
  wrapAsync(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return this.handle(error, context);
      }
    };
  },

  /**
   * 创建安全的函数包装器
   * @param {Function} fn - 原始函数
   * @param {*} fallback - 失败时的返回值
   * @returns {Function} 安全的函数
   */
  safe(fn, fallback = null) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, { silent: true });
        return fallback;
      }
    };
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
