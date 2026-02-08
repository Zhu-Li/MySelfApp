/**
 * password-dialog.js - 密码对话框模块
 * 观己 - 静观己心，内外澄明
 * 
 * 提供数据卡片导入导出时的密码输入对话框
 */

/**
 * 显示密码输入弹窗
 * @param {string} title - 对话框标题
 * @param {string} message - 提示消息
 * @param {boolean} isExport - 是否为导出模式（需要确认密码）
 * @returns {Promise<string|null>} 用户输入的密码，取消返回 null
 */
DataCard.showPasswordDialog = function(title, message, isExport = true) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'passwordModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="DataCard.closePasswordDialog(null)">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-secondary mb-lg">${message}</p>
          <form id="passwordDialogForm" onsubmit="event.preventDefault(); DataCard.submitPassword();">
            <div class="input-group mb-md">
              <label class="input-label">密码</label>
              <div class="password-input-wrapper">
                <input type="password" class="input-field" id="cardPassword" 
                       placeholder="请输入密码（至少6位）" minlength="6" required autofocus>
                <button type="button" class="password-toggle btn btn-ghost btn-sm" 
                        onclick="DataCard.togglePasswordVisibility()">👁️</button>
              </div>
            </div>
            ${isExport ? `
            <div class="input-group mb-md">
              <label class="input-label">确认密码</label>
              <div class="password-input-wrapper">
                <input type="password" class="input-field" id="cardPasswordConfirm" 
                       placeholder="请再次输入密码" minlength="6" required>
                <button type="button" class="password-toggle btn btn-ghost btn-sm" 
                        onclick="DataCard.togglePasswordVisibility('cardPasswordConfirm')">👁️</button>
              </div>
            </div>
            ` : ''}
          </form>
          <div class="alert alert-info mt-md" style="font-size: var(--font-size-xs);">
            <strong>🔒 安全提示：</strong><br>
            ${isExport ? 
              '密码用于加密数据卡片，导入时需要相同密码。请牢记此密码！' : 
              '请输入导出时设置的密码来解密数据卡片。'}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="DataCard.closePasswordDialog(null)">取消</button>
          <button class="btn btn-primary" onclick="DataCard.submitPassword()">确定</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 保存 resolve 函数
    this._passwordResolve = resolve;
    this._isExportDialog = isExport;
  });
};

/**
 * 切换密码可见性
 * @param {string} inputId - 输入框 ID
 */
DataCard.togglePasswordVisibility = function(inputId = 'cardPassword') {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};

/**
 * 提交密码
 */
DataCard.submitPassword = function() {
  const password = document.getElementById('cardPassword').value;
  
  if (password.length < 6) {
    Utils.showToast('密码至少6位', 'error');
    return;
  }
  
  if (this._isExportDialog) {
    const confirm = document.getElementById('cardPasswordConfirm').value;
    if (password !== confirm) {
      Utils.showToast('两次密码不一致', 'error');
      return;
    }
  }
  
  this.closePasswordDialog(password);
};

/**
 * 关闭密码弹窗
 * @param {string|null} password - 密码或 null
 */
DataCard.closePasswordDialog = function(password) {
  const modal = document.getElementById('passwordModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  
  if (this._passwordResolve) {
    this._passwordResolve(password);
    this._passwordResolve = null;
  }
};
