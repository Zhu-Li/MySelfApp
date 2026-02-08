/**
 * export-options.js - 导出选项对话框模块
 * 观己 - 静观己心，内外澄明
 * 
 * 提供数据导出时的内容选择对话框
 */

/**
 * 显示导出内容选择弹窗
 * @returns {Promise<Object|null>} 选择的导出选项，取消返回 null
 */
DataCard.showExportOptionsDialog = async function() {
  // 先获取可用的数据
  const tests = await Storage.getAll('tests') || [];
  const diaries = await Storage.getAll('diary') || [];
  const contacts = await Storage.getAllContacts() || [];
  const profile = await Storage.getProfile();
  
  // 构建可选项
  const testTypes = {
    'mbti': { name: 'MBTI 性格测试', icon: '🧠' },
    'bigfive': { name: '大五人格测试', icon: '⭐' },
    'holland': { name: '霍兰德职业兴趣', icon: '💼' },
    'attachment': { name: '依恋类型测试', icon: '💕' },
    'eq': { name: '情商测试', icon: '💡' },
    'values': { name: '价值观测试', icon: '🎯' },
    'stress': { name: '心理健康自测', icon: '🌱' },
    'comprehensive': { name: '综合画像分析', icon: '📊' }
  };
  
  // 检查每种测试是否有数据
  const availableTests = [];
  for (const [type, info] of Object.entries(testTypes)) {
    const test = tests.find(t => t.type === type);
    if (test?.result) {
      availableTests.push({ type, ...info, data: test });
    }
  }
  
  const hasDiary = diaries.length > 0;
  const hasContacts = contacts.length > 0;
  const hasProfile = profile && (profile.name || profile.bio || profile.gender || profile.birthday);
  
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'exportOptionsModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">📤 选择导出内容</h3>
          <button class="modal-close" onclick="DataCard.closeExportOptions(null)">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-secondary mb-md" style="font-size: var(--font-size-sm);">
            选择你想要导出到数据卡片的内容，可以控制分享给他人的信息量
          </p>
          
          <div class="export-options-list">
            <!-- 测试结果 -->
            <div class="export-option-group">
              <div class="export-option-group-title">📊 测试结果</div>
              ${availableTests.length > 0 ? availableTests.map(test => `
                <label class="export-option-item">
                  <input type="checkbox" name="export_test" value="${test.type}" checked>
                  <span class="export-option-icon">${test.icon}</span>
                  <span class="export-option-name">${test.name}</span>
                  <span class="export-option-check">✓</span>
                </label>
              `).join('') : `
                <div class="export-option-empty">暂无测试数据</div>
              `}
            </div>
            
            <!-- 日记数据 -->
            <div class="export-option-group">
              <div class="export-option-group-title">📔 日记数据</div>
              ${hasDiary ? `
                <label class="export-option-item">
                  <input type="checkbox" name="export_diary" value="diary" checked>
                  <span class="export-option-icon">📝</span>
                  <span class="export-option-name">个人日记 (${diaries.length}篇)</span>
                  <span class="export-option-check">✓</span>
                </label>
              ` : `
                <div class="export-option-empty">暂无日记数据</div>
              `}
            </div>
            
            <!-- 关系网数据 -->
            <div class="export-option-group">
              <div class="export-option-group-title">👥 关系网数据</div>
              ${hasContacts ? `
                <label class="export-option-item">
                  <input type="checkbox" name="export_contacts" value="contacts" checked>
                  <span class="export-option-icon">🔗</span>
                  <span class="export-option-name">关系网联系人 (${contacts.length}人)</span>
                  <span class="export-option-check">✓</span>
                </label>
              ` : `
                <div class="export-option-empty">暂无关系网数据</div>
              `}
            </div>
            
            <!-- 个人资料 -->
            <div class="export-option-group">
              <div class="export-option-group-title">👤 个人资料</div>
              ${hasProfile ? `
                <label class="export-option-item">
                  <input type="checkbox" name="export_profile" value="profile" checked>
                  <span class="export-option-icon">📋</span>
                  <span class="export-option-name">基本资料</span>
                  <span class="export-option-check">✓</span>
                </label>
              ` : `
                <div class="export-option-empty">暂无个人资料</div>
              `}
            </div>
          </div>
          
          <div class="export-options-actions">
            <button class="btn btn-ghost btn-sm" onclick="DataCard.toggleAllOptions(true)">全选</button>
            <button class="btn btn-ghost btn-sm" onclick="DataCard.toggleAllOptions(false)">取消全选</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="DataCard.closeExportOptions(null)">取消</button>
          <button class="btn btn-primary" onclick="DataCard.submitExportOptions()">下一步</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.addExportOptionsStyles();
    
    this._exportOptionsResolve = resolve;
  });
};

/**
 * 切换全选/取消全选
 * @param {boolean} checked - 是否选中
 */
DataCard.toggleAllOptions = function(checked) {
  const checkboxes = document.querySelectorAll('#exportOptionsModal input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = checked);
};

/**
 * 提交导出选项
 */
DataCard.submitExportOptions = function() {
  const selectedTests = Array.from(
    document.querySelectorAll('#exportOptionsModal input[name="export_test"]:checked')
  ).map(cb => cb.value);
  
  const exportDiary = document.querySelector('#exportOptionsModal input[name="export_diary"]:checked');
  const exportContacts = document.querySelector('#exportOptionsModal input[name="export_contacts"]:checked');
  const exportProfile = document.querySelector('#exportOptionsModal input[name="export_profile"]:checked');
  
  if (selectedTests.length === 0 && !exportDiary && !exportContacts && !exportProfile) {
    Utils.showToast('请至少选择一项导出内容', 'warning');
    return;
  }
  
  const options = {
    tests: selectedTests,
    diary: !!exportDiary,
    contacts: !!exportContacts,
    profile: !!exportProfile
  };
  
  this.closeExportOptions(options);
};

/**
 * 关闭导出选项弹窗
 * @param {Object|null} options - 导出选项或 null
 */
DataCard.closeExportOptions = function(options) {
  const modal = document.getElementById('exportOptionsModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  
  if (this._exportOptionsResolve) {
    this._exportOptionsResolve(options);
    this._exportOptionsResolve = null;
  }
};

/**
 * 添加导出选项样式
 */
DataCard.addExportOptionsStyles = function() {
  if (document.getElementById('export-options-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'export-options-styles';
  style.textContent = `
    .export-options-list {
      max-height: 350px;
      overflow-y: auto;
    }
    
    .export-option-group {
      margin-bottom: var(--spacing-md);
    }
    
    .export-option-group-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--text-tertiary);
      margin-bottom: var(--spacing-sm);
      padding-left: var(--spacing-xs);
    }
    
    .export-option-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xs);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .export-option-item:hover {
      background-color: var(--bg-tertiary);
    }
    
    .export-option-item input[type="checkbox"] {
      display: none;
    }
    
    .export-option-icon {
      font-size: 1.1rem;
    }
    
    .export-option-name {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--text-primary);
    }
    
    .export-option-check {
      width: 20px;
      height: 20px;
      border-radius: var(--radius-sm);
      background-color: var(--bg-primary);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: transparent;
      transition: all 0.2s ease;
    }
    
    .export-option-item input:checked + .export-option-icon + .export-option-name + .export-option-check,
    .export-option-item input:checked ~ .export-option-check {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
    
    .export-option-empty {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      padding: var(--spacing-sm) var(--spacing-md);
      text-align: center;
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
    }
    
    .export-options-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color-light);
    }
    
    @media (max-width: 640px) {
      .export-options-list {
        max-height: 280px;
      }
    }
  `;
  document.head.appendChild(style);
};
