/**
 * utils.js - 工具函数库
 * 观己 - 静观己心，内外澄明
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
   * 显示 Toast 提示
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'fadeIn var(--transition-normal) reverse';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  },

  /**
   * 显示加载遮罩
   */
  showLoading(message = '加载中...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner loading-spinner-lg"></div>
        <p class="loading-text">${this.escapeHtml(message)}</p>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.querySelector('.loading-text').textContent = message;
      overlay.style.display = 'flex';
    }
  },

  /**
   * 隐藏加载遮罩
   */
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  },

  /**
   * 确认对话框（美化版）
   */
  confirm(message, title = '确认') {
    return new Promise((resolve) => {
      // 先清理可能存在的旧confirm弹窗
      const oldModal = document.getElementById('confirmModal');
      if (oldModal) oldModal.remove();
      
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.id = 'confirmModal';
      modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
          </div>
          <div class="modal-body">
            <p class="text-secondary" style="line-height: 1.6;">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary confirm-cancel-btn">取消</button>
            <button class="btn btn-primary confirm-ok-btn">确定</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const closeModal = (result) => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        resolve(result);
      };
      
      // 使用modal内部查询而非全局getElementById，避免ID冲突
      modal.querySelector('.confirm-ok-btn').onclick = () => closeModal(true);
      modal.querySelector('.confirm-cancel-btn').onclick = () => closeModal(false);
      
      // 点击遮罩关闭
      modal.onclick = (e) => {
        if (e.target === modal) closeModal(false);
      };
      
      // ESC 键关闭
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          closeModal(false);
          document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'Enter') {
          closeModal(true);
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
    });
  },

  /**
   * 提示对话框（美化版）
   */
  alert(message, title = '提示', type = 'info') {
    return new Promise((resolve) => {
      const icons = {
        info: '💡',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      const icon = icons[type] || icons.info;
      
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.id = 'alertModal';
      modal.innerHTML = `
        <div class="modal" style="max-width: 380px;">
          <div class="modal-body" style="text-align: center; padding: var(--spacing-xl);">
            <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">${icon}</div>
            <h3 style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md); color: var(--text-primary);">${title}</h3>
            <p class="text-secondary" style="line-height: 1.6; margin-bottom: var(--spacing-lg);">${message}</p>
            <button class="btn btn-primary btn-block" id="alertOk">确定</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        resolve();
      };
      
      document.getElementById('alertOk').onclick = closeModal;
      
      // 点击遮罩关闭
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      
      // 任意键关闭
      const handleKeydown = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          closeModal();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
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
  },

  /**
   * AI 分析加载状态提示语
   */
  aiLoadingMessages: [
    '正在唤醒 AI 分析师...',
    '正在解读你的测试数据...',
    '正在深入分析性格特征...',
    '正在生成个性化建议...',
    '正在整理分析报告...',
    '即将完成，请稍候...'
  ],

  /**
   * 创建流式分析容器
   */
  createStreamContainer(containerId) {
    return `
      <div class="ai-stream-container" id="${containerId}">
        <div class="ai-stream-status">
          <div class="ai-thinking-animation">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
          </div>
          <span class="ai-status-text">正在连接 AI 服务...</span>
        </div>
        <div class="ai-stream-content markdown-body"></div>
        <div class="ai-stream-cursor"></div>
      </div>
    `;
  },

  /**
   * 添加流式分析样式
   */
  addStreamStyles() {
    if (document.getElementById('ai-stream-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-stream-styles';
    style.textContent = `
      .ai-stream-container {
        min-height: 100px;
        position: relative;
      }

      .ai-stream-status {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        margin-bottom: var(--spacing-md);
        transition: all var(--transition-normal);
      }

      .ai-stream-status.hidden {
        opacity: 0;
        height: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }

      .ai-thinking-animation {
        display: flex;
        gap: 4px;
      }

      .thinking-dot {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: thinkingBounce 1.4s ease-in-out infinite;
      }

      .thinking-dot:nth-child(1) { animation-delay: 0s; }
      .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
      .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes thinkingBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .ai-status-text {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
      }

      .ai-stream-content {
        line-height: 1.8;
      }

      .ai-stream-content:empty {
        display: none;
      }

      .ai-stream-cursor {
        display: inline-block;
        width: 2px;
        height: 1.2em;
        background: var(--color-primary);
        animation: cursorBlink 1s step-end infinite;
        vertical-align: text-bottom;
        margin-left: 2px;
      }

      .ai-stream-cursor.hidden {
        display: none;
      }

      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .ai-progress-bar {
        height: 3px;
        background: var(--bg-tertiary);
        border-radius: 2px;
        overflow: hidden;
        margin-top: var(--spacing-sm);
      }

      .ai-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light, #818cf8));
        border-radius: 2px;
        transition: width 0.3s ease;
        animation: progressShimmer 2s ease-in-out infinite;
      }

      @keyframes progressShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .ai-stats {
        display: flex;
        gap: var(--spacing-lg);
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 流式分析管理器
   */
  StreamAnalyzer: {
    container: null,
    statusEl: null,
    contentEl: null,
    cursorEl: null,
    statusTextEl: null,
    messageIndex: 0,
    messageInterval: null,
    startTime: null,
    charCount: 0,

    /**
     * 初始化流式分析
     */
    init(containerSelector) {
      Utils.addStreamStyles();
      
      const wrapper = document.querySelector(containerSelector);
      if (!wrapper) return false;

      wrapper.innerHTML = Utils.createStreamContainer('aiStreamContent');
      
      this.container = document.getElementById('aiStreamContent');
      this.statusEl = this.container.querySelector('.ai-stream-status');
      this.contentEl = this.container.querySelector('.ai-stream-content');
      this.cursorEl = this.container.querySelector('.ai-stream-cursor');
      this.statusTextEl = this.container.querySelector('.ai-status-text');
      
      this.messageIndex = 0;
      this.charCount = 0;
      this.startTime = Date.now();
      
      // 开始循环显示状态提示
      this.startStatusRotation();
      
      return true;
    },

    /**
     * 开始状态提示轮换
     */
    startStatusRotation() {
      this.updateStatus(Utils.aiLoadingMessages[0]);
      
      this.messageInterval = setInterval(() => {
        this.messageIndex = (this.messageIndex + 1) % Utils.aiLoadingMessages.length;
        this.updateStatus(Utils.aiLoadingMessages[this.messageIndex]);
      }, 3000);
    },

    /**
     * 更新状态文本
     */
    updateStatus(text) {
      if (this.statusTextEl) {
        this.statusTextEl.textContent = text;
      }
    },

    /**
     * 追加内容（打字效果）
     */
    appendContent(chunk) {
      if (!this.contentEl) return;
      
      this.charCount += chunk.length;
      
      // 获取当前原始文本，追加新内容，然后渲染
      const currentText = this.contentEl.getAttribute('data-raw') || '';
      const newText = currentText + chunk;
      this.contentEl.setAttribute('data-raw', newText);
      this.contentEl.innerHTML = Utils.renderMarkdown(newText);
      
      // 滚动到底部
      this.contentEl.scrollTop = this.contentEl.scrollHeight;
    },

    /**
     * 完成分析
     */
    complete() {
      // 停止状态轮换
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
        this.messageInterval = null;
      }
      
      // 隐藏状态栏和光标
      if (this.statusEl) {
        this.statusEl.classList.add('hidden');
      }
      if (this.cursorEl) {
        this.cursorEl.classList.add('hidden');
      }
      
      // 显示统计信息
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`AI 分析完成: ${this.charCount} 字, 耗时 ${elapsed}s`);
    },

    /**
     * 显示错误
     */
    showError(message) {
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
      }
      
      if (this.container) {
        this.container.innerHTML = `
          <div class="empty-state" style="padding: var(--spacing-xl);">
            <div class="empty-state-icon">❌</div>
            <h4 class="empty-state-title">分析失败</h4>
            <p class="empty-state-desc">${Utils.escapeHtml(message)}</p>
          </div>
        `;
      }
    },

    /**
     * 获取原始内容
     */
    getRawContent() {
      return this.contentEl?.getAttribute('data-raw') || '';
    }
  }
};

// 导出到全局
window.Utils = Utils;
