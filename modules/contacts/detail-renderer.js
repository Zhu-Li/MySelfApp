/**
 * detail-renderer.js - 联系人详情页渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：联系人详情页渲染、备注编辑、删除确认
 */

/**
 * 渲染联系人详情页
 * @param {HTMLElement} container - 容器元素
 * @param {string} contactId - 联系人ID
 */
Contacts.renderDetail = async function(container, contactId) {
  const contact = await this.get(contactId);

  if (!contact) {
    container.innerHTML = `
      <div class="page-container">
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <h2 class="empty-state-title">联系人不存在</h2>
          <a href="#/contacts" class="btn btn-primary">返回关系网</a>
        </div>
      </div>
    `;
    return;
  }

  const profile = contact.profile || {};
  const tests = contact.tests || [];
  const diary = contact.diary || [];

  // 测试类型映射
  const testTypeInfo = {
    'mbti': { name: 'MBTI', icon: '🧠' },
    'bigfive': { name: '大五人格', icon: '⭐' },
    'holland': { name: '霍兰德', icon: '💼' },
    'attachment': { name: '依恋类型', icon: '💕' },
    'eq': { name: '情商', icon: '💡' },
    'values': { name: '价值观', icon: '🎯' },
    'stress': { name: '心理健康', icon: '🌱' },
    'comprehensive': { name: '综合画像', icon: '📊' }
  };

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="contact-detail-header">
        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/contacts')">
          ← 返回
        </button>
        <div class="contact-detail-actions">
          <button class="btn btn-secondary btn-sm" onclick="Contacts.editRemark('${contact.id}')">
            ✏️ 编辑备注
          </button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="Contacts.confirmDelete('${contact.id}')">
            🗑️ 删除
          </button>
        </div>
      </div>

      <div class="contact-detail-info card mb-lg">
        <div class="card-header">
          <h3>📋 基本资料</h3>
        </div>
        <div class="card-body">
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">姓名</span>
              <span class="profile-value">${contact.name || '-'}</span>
            </div>
            ${contact.remark ? `
              <div class="profile-item">
                <span class="profile-label">备注</span>
                <span class="profile-value">${contact.remark}</span>
              </div>
            ` : ''}
            <div class="profile-item">
              <span class="profile-label">性别</span>
              <span class="profile-value">${profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '-'}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">生日</span>
              <span class="profile-value">${profile.birthday || '-'}</span>
            </div>
            ${profile.contact ? `
              <div class="profile-item">
                <span class="profile-label">联系方式</span>
                <span class="profile-value">${profile.contact}</span>
              </div>
            ` : ''}
            <div class="profile-item">
              <span class="profile-label">导入时间</span>
              <span class="profile-value">${Utils.formatDate(contact.importedAt, 'YYYY-MM-DD HH:mm')}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">数据版本</span>
              <span class="profile-value">${contact.dataVersion || '-'}</span>
            </div>
          </div>
          ${profile.bio ? `
            <div class="profile-bio">
              <span class="profile-label">个人简介</span>
              <p class="profile-bio-text">${profile.bio}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="contact-detail-tests card mb-lg">
        <div class="card-header">
          <h3>📊 测试结果 (${tests.length})</h3>
        </div>
        <div class="card-body">
          ${tests.length > 0 ? `
            <div class="test-result-grid">
              ${tests.map((test, index) => {
                const info = testTypeInfo[test.type] || { name: test.type, icon: '📝' };
                const resultText = this.getTestResultSummary(test);
                return `
                  <div class="test-result-card clickable" onclick="Contacts.showTestDetail('${contact.id}', ${index})">
                    <div class="test-result-icon">${info.icon}</div>
                    <div class="test-result-info">
                      <div class="test-result-name">${info.name}</div>
                      <div class="test-result-value">${resultText}</div>
                      <div class="test-result-date">${Utils.formatDate(test.timestamp, 'YYYY-MM-DD')}</div>
                    </div>
                    <div class="test-result-arrow">›</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state-small">暂无测试数据</div>
          `}
        </div>
      </div>

      <div class="contact-detail-diary card">
        <div class="card-header">
          <h3>📔 日记记录 (${diary.length})</h3>
        </div>
        <div class="card-body">
          ${diary.length > 0 ? `
            <div class="diary-list">
              ${diary.slice(0, 10).map((entry, index) => `
                <div class="diary-item clickable" onclick="Contacts.showDiaryDetail('${contact.id}', ${index})">
                  <div class="diary-item-date">${Utils.formatDate(entry.timestamp, 'YYYY-MM-DD')}</div>
                  <div class="diary-item-title">${entry.title || '无标题'}</div>
                  <div class="diary-item-mood">${entry.mood ? Diary.getMoodInfo(entry.mood).icon : ''}</div>
                  <div class="diary-item-arrow">›</div>
                </div>
              `).join('')}
              ${diary.length > 10 ? `
                <div class="diary-more clickable" onclick="Contacts.showAllDiaries('${contact.id}')">查看全部 ${diary.length} 篇日记 →</div>
              ` : ''}
            </div>
          ` : `
            <div class="empty-state-small">暂无日记数据</div>
          `}
        </div>
      </div>
    </div>
  `;

  this.addDetailStyles();
};

/**
 * 获取测试结果摘要
 * @param {Object} test - 测试数据
 * @returns {string} 摘要文本
 */
Contacts.getTestResultSummary = function(test) {
  if (!test.result) return '-';
  const result = test.result;
  
  switch (test.type) {
    case 'mbti':
      return result.type || '-';
    
    case 'bigfive':
      if (result.dimensions) {
        const dims = result.dimensions;
        const entries = Object.entries(dims).filter(([k]) => ['O', 'C', 'E', 'A', 'N'].includes(k));
        if (entries.length > 0) {
          const topDim = entries.sort((a, b) => b[1] - a[1])[0];
          return `${topDim[0]}:${topDim[1]}`;
        }
      }
      return '-';
    
    case 'holland':
      return result.hollandCode || '-';
    
    case 'attachment':
      if (result.typeInfo?.name) {
        return result.typeInfo.name;
      }
      const typeMap = {
        'secure': '安全型',
        'anxious': '焦虑型', 
        'avoidant': '回避型',
        'fearful': '恐惧型'
      };
      return typeMap[result.type] || result.type || '-';
    
    case 'eq':
      if (result.overallScore !== undefined) {
        return `${result.overallScore}分`;
      }
      return '-';
    
    case 'values':
      if (result.coreValues?.length > 0) {
        return result.coreValues[0].dimension || result.coreValues[0].name || result.coreValues[0];
      }
      if (result.topValues?.length > 0) {
        return result.topValues[0];
      }
      return '-';
    
    case 'stress':
      if (result.anxietyLevel?.name) {
        return result.anxietyLevel.name;
      }
      return result.level || '-';
    
    case 'comprehensive':
      return '已完成';
    
    default:
      return '已完成';
  }
};

/**
 * 编辑备注
 * @param {string} contactId - 联系人ID
 */
Contacts.editRemark = async function(contactId) {
  const contact = await this.get(contactId);
  if (!contact) return;

  const newRemark = await this.showEditRemarkDialog(contact.name, contact.remark || '');
  if (newRemark !== null) {
    contact.remark = newRemark;
    await this.save(contact);
    Utils.showToast('备注已更新', 'success');
    Router.handleRouteChange();
  }
};

/**
 * 显示编辑备注弹窗
 * @param {string} contactName - 联系人名称
 * @param {string} currentRemark - 当前备注
 * @returns {Promise<string|null>}
 */
Contacts.showEditRemarkDialog = function(contactName, currentRemark) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editRemarkModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑备注</h3>
          <button class="modal-close" onclick="Contacts.closeEditRemarkDialog(null)">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-secondary mb-md">
            修改「${contactName}」的备注：
          </p>
          <div class="input-group">
            <label class="input-label">备注</label>
            <input type="text" class="input-field" id="editContactRemark" 
                   placeholder="如：同学、同事、朋友等" maxlength="20" value="${currentRemark}">
            <span class="input-hint">最多20个字符，可留空</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Contacts.closeEditRemarkDialog(null)">取消</button>
          <button class="btn btn-primary" onclick="Contacts.submitEditRemark()">保存</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this._editRemarkResolve = resolve;
  });
};

/**
 * 提交编辑的备注
 */
Contacts.submitEditRemark = function() {
  const remark = document.getElementById('editContactRemark').value.trim();
  this.closeEditRemarkDialog(remark);
};

/**
 * 关闭编辑备注弹窗
 * @param {string|null} remark - 备注或null
 */
Contacts.closeEditRemarkDialog = function(remark) {
  const modal = document.getElementById('editRemarkModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  if (this._editRemarkResolve) {
    this._editRemarkResolve(remark);
    this._editRemarkResolve = null;
  }
};

/**
 * 确认删除联系人
 * @param {string} contactId - 联系人ID
 */
Contacts.confirmDelete = async function(contactId) {
  const contact = await this.get(contactId);
  if (!contact) return;

  const confirmed = await Utils.confirm(
    `确定要删除联系人「${contact.name}」${contact.remark ? `（${contact.remark}）` : ''}吗？\n\n` +
    `该联系人的所有数据将被永久删除，此操作不可撤销。`,
    '确认删除'
  );

  if (confirmed) {
    await this.delete(contactId);
    Utils.showToast('联系人已删除', 'success');
    Router.navigate('/contacts');
  }
};

/**
 * 添加详情页样式
 */
Contacts.addDetailStyles = function() {
  if (document.getElementById('contacts-detail-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-detail-styles';
  style.textContent = `
    .contact-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }
    
    .contact-detail-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    
    .profile-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }
    
    .profile-value {
      font-size: var(--font-size-base);
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .profile-bio {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color-light);
    }
    
    .profile-bio-text {
      margin-top: var(--spacing-sm);
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .test-result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--spacing-md);
    }
    
    .test-result-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    }
    
    .test-result-card.clickable {
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .test-result-card.clickable:hover {
      background: var(--bg-tertiary);
      transform: translateY(-2px);
    }
    
    .test-result-arrow, .diary-item-arrow {
      color: var(--text-tertiary);
      font-size: 1.2rem;
      margin-left: auto;
    }
    
    .test-result-icon {
      font-size: 1.5rem;
    }
    
    .test-result-name {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    
    .test-result-value {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .test-result-date {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }
    
    .diary-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .diary-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-xs);
      border-bottom: 1px solid var(--border-color-light);
    }
    
    .diary-item.clickable {
      cursor: pointer;
      padding: var(--spacing-sm);
      margin: 0 calc(var(--spacing-sm) * -1);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .diary-item.clickable:hover {
      background: var(--bg-secondary);
    }
    
    .diary-item-mood {
      flex-shrink: 0;
    }
    
    .diary-item:last-child {
      border-bottom: none;
    }
    
    .diary-item-date {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    
    .diary-item-title {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .diary-more {
      text-align: center;
      padding: var(--spacing-sm);
      color: var(--text-tertiary);
      font-size: var(--font-size-sm);
    }
    
    .empty-state-small {
      text-align: center;
      padding: var(--spacing-lg);
      color: var(--text-tertiary);
    }
    
    @media (max-width: 640px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      
      .contact-detail-actions {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);
};
