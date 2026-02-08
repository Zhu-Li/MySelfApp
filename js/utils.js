/**
 * utils.js - 工具函数库
 * 观己 - 静观己心，内外澄明
 * 
 * 通用工具函数集合
 * UI 相关函数已拆分到 ui.js
 * 流式分析 UI 已拆分到 stream-ui.js
 */

const Utils = {
  /**
   * 生成 UUID
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * 格式化日期
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 相对时间格式化
   */
  formatRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now - target;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return this.formatDate(date);
  },

  /**
   * 防抖函数
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },

  /**
   * 节流函数
   */
  throttle(fn, delay = 300) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * 深拷贝对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const copy = {};
      Object.keys(obj).forEach(key => {
        copy[key] = this.deepClone(obj[key]);
      });
      return copy;
    }
    return obj;
  },

  /**
   * 数组随机打乱
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * 延迟执行
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 安全解析 JSON
   */
  safeJsonParse(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * 截取字符串
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * 转义 HTML
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 计算百分比
   */
  percentage(value, total, decimals = 0) {
    if (total === 0) return 0;
    const percent = (value / total) * 100;
    return decimals > 0 ? percent.toFixed(decimals) : Math.round(percent);
  },

  /**
   * 下载文件
   */
  downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 读取文件内容
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  },

  /**
   * 检测是否为移动设备
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * 获取 URL 查询参数
   */
  getQueryParams(url = window.location.href) {
    const params = {};
    const queryString = url.split('?')[1];
    if (!queryString) return params;
    
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
  },

  /**
   * 简单模板引擎
   */
  template(str, data) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data.hasOwnProperty(key) ? data[key] : match;
    });
  },

  /**
   * 验证密码强度
   */
  validatePassword(password) {
    if (!password || password.length < 6) {
      return { valid: false, message: '密码长度至少6位' };
    }
    return { valid: true, message: '' };
  },

  /**
   * 获取 MBTI 类型颜色
   */
  getMBTIColor(type) {
    const colors = {
      // 分析师
      'INTJ': '#6366f1', 'INTP': '#8b5cf6', 'ENTJ': '#a855f7', 'ENTP': '#d946ef',
      // 外交官
      'INFJ': '#10b981', 'INFP': '#14b8a6', 'ENFJ': '#06b6d4', 'ENFP': '#0ea5e9',
      // 守护者
      'ISTJ': '#f59e0b', 'ISFJ': '#f97316', 'ESTJ': '#ef4444', 'ESFJ': '#ec4899',
      // 探险家
      'ISTP': '#84cc16', 'ISFP': '#22c55e', 'ESTP': '#eab308', 'ESFP': '#facc15'
    };
    return colors[type] || '#6366f1';
  },

  /**
   * 获取 MBTI 类型名称
   */
  getMBTIName(type) {
    const names = {
      'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
      'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
      'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
      'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
    };
    return names[type] || type;
  },

  /**
   * 获取维度描述
   */
  getDimensionLabel(dimension) {
    const labels = {
      'E': '外向 (E)', 'I': '内向 (I)',
      'S': '感觉 (S)', 'N': '直觉 (N)',
      'T': '思考 (T)', 'F': '情感 (F)',
      'J': '判断 (J)', 'P': '知觉 (P)'
    };
    return labels[dimension] || dimension;
  },

  /**
   * 简单的 Markdown 渲染
   */
  renderMarkdown(text) {
    if (!text) return '';

    return text
      // 标题
      .replace(/^### (.+)$/gm, '<h4 class="font-semibold mt-lg mb-sm" style="font-size: var(--font-size-lg);">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="font-bold mt-xl mb-md" style="font-size: var(--font-size-xl);">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="font-bold mt-xl mb-md" style="font-size: var(--font-size-2xl);">$1</h2>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="ml-lg">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-lg" style="list-style: decimal;">$2</li>')
      // 段落
      .replace(/\n\n/g, '</p><p class="mb-md">')
      // 换行
      .replace(/\n/g, '<br>')
      // 包装
      .replace(/^/, '<p class="mb-md">')
      .replace(/$/, '</p>')
      // 修复列表
      .replace(/<\/p><li/g, '<ul class="mb-md"><li')
      .replace(/<\/li><p/g, '</li></ul><p');
  }

  // UI 相关函数已迁移到 ui.js:
  // - showToast(), showLoading(), hideLoading(), confirm(), alert()
  
  // 流式分析 UI 已迁移到 stream-ui.js:
  // - aiLoadingMessages, createStreamContainer(), addStreamStyles(), StreamAnalyzer
};

// 导出到全局
window.Utils = Utils;
