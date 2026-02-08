/**
 * list-renderer.js - 联系人列表渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：联系人列表页面渲染、卡片渲染
 */

/**
 * 渲染联系人列表页
 * @param {HTMLElement} container - 容器元素
 */
Contacts.renderList = async function(container) {
  const contacts = await this.getAll();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="contacts-header">
        <div class="contacts-header-info">
          <h1 class="contacts-page-title">👥 关系网</h1>
          <p class="contacts-page-subtitle">管理你的人际关系网络</p>
        </div>
      </div>

      <div class="contacts-import-actions">
        <div class="import-action-card" onclick="Contacts.importSelfData()">
          <div class="import-action-icon">📥</div>
          <div class="import-action-info">
            <div class="import-action-title">导入本人数据</div>
            <div class="import-action-desc">恢复您的备份数据</div>
          </div>
        </div>
        <div class="import-action-card" onclick="Contacts.importNetworkData()">
          <div class="import-action-icon">👤</div>
          <div class="import-action-info">
            <div class="import-action-title">导入关系网数据</div>
            <div class="import-action-desc">添加他人数据到关系网</div>
          </div>
        </div>
      </div>

      <input type="file" id="contactsImportFile" accept="*/*" style="display: none;" onchange="Contacts.handleFileSelect(event)">

      <div class="contacts-list-section">
        <div class="contacts-list-header">
          <span class="contacts-list-title">联系人列表</span>
          <span class="contacts-list-count">${contacts.length}人</span>
        </div>
        
        ${contacts.length > 0 ? `
          <div class="contacts-list">
            ${contacts.map(contact => this.renderContactCard(contact)).join('')}
          </div>
        ` : `
          <div class="contacts-empty">
            <div class="contacts-empty-icon">🔗</div>
            <div class="contacts-empty-title">还没有关系网联系人</div>
            <div class="contacts-empty-desc">导入他人的数据包，开始建立你的关系网络</div>
          </div>
        `}
      </div>
    </div>
  `;

  this.addListStyles();
};

/**
 * 渲染联系人卡片
 * @param {Object} contact - 联系人数据
 * @returns {string} HTML字符串
 */
Contacts.renderContactCard = function(contact) {
  const testCount = contact.tests?.length || 0;
  const diaryCount = contact.diary?.length || 0;
  const importDate = Utils.formatDate(contact.importedAt, 'YYYY-MM-DD');
  const initial = (contact.name || '?')[0];

  return `
    <div class="contact-card" onclick="Contacts.showDetail('${contact.id}')">
      <div class="contact-avatar">${initial}</div>
      <div class="contact-info">
        <div class="contact-name-row">
          <span class="contact-name">${contact.name || '未知'}</span>
          ${contact.remark ? `<span class="contact-remark">${contact.remark}</span>` : ''}
        </div>
        <div class="contact-stats">
          测试: ${testCount} | 日记: ${diaryCount} | 导入: ${importDate}
        </div>
      </div>
      <div class="contact-arrow">›</div>
    </div>
  `;
};

/**
 * 跳转到详情页
 * @param {string} id - 联系人ID
 */
Contacts.showDetail = function(id) {
  Router.navigate(`/contacts/${id}`);
};

/**
 * 添加列表页样式
 */
Contacts.addListStyles = function() {
  if (document.getElementById('contacts-list-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-list-styles';
  style.textContent = `
    .contacts-header {
      margin-bottom: var(--spacing-lg);
    }
    
    .contacts-page-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .contacts-page-subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    
    .contacts-import-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }
    
    .import-action-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .import-action-card:hover {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .import-action-icon {
      font-size: 2rem;
    }
    
    .import-action-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .import-action-desc {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
    }
    
    .contacts-list-section {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
    }
    
    .contacts-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--border-color-light);
    }
    
    .contacts-list-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .contacts-list-count {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }
    
    .contacts-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .contact-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .contact-card:hover {
      background: var(--bg-tertiary);
    }
    
    .contact-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
      flex-shrink: 0;
    }
    
    .contact-info {
      flex: 1;
      min-width: 0;
    }
    
    .contact-name-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }
    
    .contact-name {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .contact-remark {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      background: var(--bg-tertiary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    
    .contact-stats {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
    
    .contact-arrow {
      color: var(--text-tertiary);
      font-size: 1.2rem;
    }
    
    .contacts-empty {
      text-align: center;
      padding: var(--spacing-2xl) var(--spacing-lg);
    }
    
    .contacts-empty-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }
    
    .contacts-empty-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }
    
    .contacts-empty-desc {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }
    
    @media (max-width: 640px) {
      .contacts-import-actions {
        grid-template-columns: 1fr;
      }
      
      .import-action-card {
        padding: var(--spacing-md);
      }
      
      .import-action-icon {
        font-size: 1.5rem;
      }
    }
  `;
  document.head.appendChild(style);
};
