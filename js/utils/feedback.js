/**
 * feedback.js - 用户反馈组件
 * 观己 - 静观己心，内外澄明
 * 
 * 提供 Toast 提示、加载状态、确认对话框等反馈机制
 */

const Feedback = {
  // 配置
  config: {
    duration: 3000,
    maxToasts: 3,
    position: 'top-center'
  },

  // Toast 队列
  toastQueue: [],
  
  // 当前显示的 Toast
  activeToasts: [],

  /**
   * 初始化
   */
  init() {
    this.ensureContainer();
    console.log('[Feedback] 初始化完成');
  },

  /**
   * 确保容器存在
   */
  ensureContainer() {
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', '通知');
      document.body.appendChild(container);
    }
  },

  /**
   * 显示 Toast 提示
   * @param {string} message - 消息内容
   * @param {string} type - 类型: success, error, warning, info
   * @param {Object} options - 配置选项
   */
  toast(message, type = 'info', options = {}) {
    const {
      duration = this.config.duration,
      closable = true,
      action = null
    } = options;

    // 确保容器存在
    this.ensureContainer();

    // 创建 Toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // 图标映射
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    // 构建内容
    let html = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
    `;

    // 关闭按钮
    if (closable) {
      html += `
        <button class="toast-close" aria-label="关闭">
          <span>×</span>
        </button>
      `;
    }

    // 操作按钮
    if (action) {
      html += `
        <button class="toast-action" onclick="${action.onClick}">
          ${action.text}
        </button>
      `;
    }

    toast.innerHTML = html;

    // 添加到容器
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // 动画进入
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 绑定关闭事件
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideToast(toast));
      }
    }

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => this.hideToast(toast), duration);
    }

    // 限制最大数量
    this.limitToastCount();

    return toast;
  },

  /**
   * 隐藏 Toast
   * @param {HTMLElement} toast - Toast 元素
   */
  hideToast(toast) {
    if (!toast || toast.classList.contains('hiding')) return;

    toast.classList.add('hiding');
    toast.classList.remove('show');

    // 动画结束后移除
    setTimeout(() => {
      toast.remove();
    }, 300);
  },

  /**
   * 限制 Toast 数量
   */
  limitToastCount() {
    const container = document.getElementById('toastContainer');
    const toasts = container.querySelectorAll('.toast');
    
    if (toasts.length > this.config.maxToasts) {
      // 隐藏最早的 Toast
      this.hideToast(toasts[0]);
    }
  },

  /**
   * 成功提示
   * @param {string} message - 消息内容
   * @param {Object} options - 配置选项
   */
  success(message, options = {}) {
    return this.toast(message, 'success', options);
  },

  /**
   * 错误提示
   * @param {string} message - 消息内容
   * @param {Object} options - 配置选项
   */
  error(message, options = {}) {
    return this.toast(message, 'error', { duration: 5000, ...options });
  },

  /**
   * 警告提示
   * @param {string} message - 消息内容
   * @param {Object} options - 配置选项
   */
  warning(message, options = {}) {
    return this.toast(message, 'warning', options);
  },

  /**
   * 信息提示
   * @param {string} message - 消息内容
   * @param {Object} options - 配置选项
   */
  info(message, options = {}) {
    return this.toast(message, 'info', options);
  },

  /**
   * 显示加载状态
   * @param {string} message - 加载消息
   * @returns {Object} 控制器
   */
  loading(message = '加载中...') {
    const toast = this.toast(message, 'info', { duration: 0, closable: false });
    const icon = toast.querySelector('.toast-icon');
    
    if (icon) {
      icon.innerHTML = '<span class="spinner"></span>';
    }

    return {
      toast,
      update: (newMessage) => {
        const msgEl = toast.querySelector('.toast-message');
        if (msgEl) msgEl.textContent = newMessage;
      },
      success: (successMessage) => {
        this.hideToast(toast);
        this.success(successMessage);
      },
      error: (errorMessage) => {
        this.hideToast(toast);
        this.error(errorMessage);
      },
      close: () => this.hideToast(toast)
    };
  },

  /**
   * 确认对话框
   * @param {Object} options - 配置选项
   * @returns {Promise<boolean>}
   */
  confirm(options = {}) {
    const {
      title = '确认',
      message = '确定要执行此操作吗？',
      confirmText = '确定',
      cancelText = '取消',
      type = 'warning'
    } = options;

    return new Promise((resolve) => {
      // 创建模态框
      const modal = document.createElement('div');
      modal.className = 'feedback-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'modal-title');

      modal.innerHTML = `
        <div class="feedback-modal-backdrop"></div>
        <div class="feedback-modal-content">
          <div class="feedback-modal-header">
            <h3 id="modal-title">${this.escapeHtml(title)}</h3>
          </div>
          <div class="feedback-modal-body">
            <p>${this.escapeHtml(message)}</p>
          </div>
          <div class="feedback-modal-footer">
            <button class="btn btn-secondary" data-action="cancel">
              ${this.escapeHtml(cancelText)}
            </button>
            <button class="btn btn-primary" data-action="confirm">
              ${this.escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // 动画进入
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });

      // 绑定事件
      const handleAction = (action) => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        resolve(action === 'confirm');
      };

      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        handleAction('confirm');
      });

      modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        handleAction('cancel');
      });

      modal.querySelector('.feedback-modal-backdrop').addEventListener('click', () => {
        handleAction('cancel');
      });

      // ESC 键关闭
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          handleAction('cancel');
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);

      // 聚焦到确认按钮
      modal.querySelector('[data-action="confirm"]').focus();
    });
  },

  /**
   * 输入对话框
   * @param {Object} options - 配置选项
   * @returns {Promise<string|null>}
   */
  prompt(options = {}) {
    const {
      title = '输入',
      message = '',
      defaultValue = '',
      placeholder = '',
      confirmText = '确定',
      cancelText = '取消'
    } = options;

    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'feedback-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'modal-title');

      modal.innerHTML = `
        <div class="feedback-modal-backdrop"></div>
        <div class="feedback-modal-content">
          <div class="feedback-modal-header">
            <h3 id="modal-title">${this.escapeHtml(title)}</h3>
          </div>
          <div class="feedback-modal-body">
            ${message ? `<p>${this.escapeHtml(message)}</p>` : ''}
            <input type="text" class="feedback-modal-input" 
                   value="${this.escapeHtml(defaultValue)}" 
                   placeholder="${this.escapeHtml(placeholder)}"
                   autocomplete="off">
          </div>
          <div class="feedback-modal-footer">
            <button class="btn btn-secondary" data-action="cancel">
              ${this.escapeHtml(cancelText)}
            </button>
            <button class="btn btn-primary" data-action="confirm">
              ${this.escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      requestAnimationFrame(() => {
        modal.classList.add('show');
        const input = modal.querySelector('.feedback-modal-input');
        input.focus();
        input.select();
      });

      const handleAction = (action) => {
        const value = modal.querySelector('.feedback-modal-input').value;
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        resolve(action === 'confirm' ? value : null);
      };

      modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        handleAction('confirm');
      });

      modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        handleAction('cancel');
      });

      modal.querySelector('.feedback-modal-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleAction('confirm');
        } else if (e.key === 'Escape') {
          handleAction('cancel');
        }
      });
    });
  },

  /**
   * HTML 转义
   * @param {string} html - 原始字符串
   * @returns {string} 转义后的字符串
   */
  escapeHtml(html) {
    if (typeof html !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
};

// 初始化
Feedback.init();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Feedback;
}
