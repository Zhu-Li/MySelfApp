/**
 * ui.js - UI 交互组件库
 * 观己 - 静观己心，内外澄明
 * 
 * 提供 Toast 提示、加载遮罩、确认对话框等通用 UI 组件
 */

const UI = {
  /**
   * 显示 Toast 提示
   * @param {string} message - 提示消息
   * @param {string} type - 类型: success/error/warning/info
   * @param {number} duration - 显示时长（毫秒）
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
      <span class="toast-message">${Utils.escapeHtml(message)}</span>
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
   * @param {string} message - 加载提示文字
   */
  showLoading(message = '加载中...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner loading-spinner-lg"></div>
        <p class="loading-text">${Utils.escapeHtml(message)}</p>
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
   * @param {string} message - 确认消息
   * @param {string} title - 对话框标题
   * @returns {Promise<boolean>} 用户选择结果
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
   * @param {string} message - 提示消息
   * @param {string} title - 对话框标题
   * @param {string} type - 类型: info/success/warning/error
   * @returns {Promise<void>}
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
  }
};

// 向后兼容：在 Utils 对象上创建代理方法
// 这样现有代码中的 Utils.showToast() 等调用仍然有效
if (typeof Utils !== 'undefined') {
  Utils.showToast = UI.showToast.bind(UI);
  Utils.showLoading = UI.showLoading.bind(UI);
  Utils.hideLoading = UI.hideLoading.bind(UI);
  Utils.confirm = UI.confirm.bind(UI);
  Utils.alert = UI.alert.bind(UI);
}

// 导出到全局
window.UI = UI;
