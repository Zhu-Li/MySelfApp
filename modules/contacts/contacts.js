/**
 * contacts.js - 关系网管理模块
 * 观己 - 静观己心，内外澄明
 * 
 * 管理人际关系网络，支持导入他人数据
 */

const Contacts = {
  // 临时存储导入的数据
  _pendingImportData: null,
  _pendingResolve: null,

  /**
   * 获取所有联系人
   */
  async getAll() {
    return Storage.getAllContacts();
  },

  /**
   * 获取单个联系人
   */
  async get(id) {
    return Storage.getContact(id);
  },

  /**
   * 保存联系人
   */
  async save(contactData) {
    return Storage.saveContact(contactData);
  },

  /**
   * 删除联系人
   */
  async delete(id) {
    return Storage.deleteContact(id);
  },

  /**
   * 渲染联系人列表页
   */
  async renderList(container) {
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

      <style>
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
      </style>
    `;
  },

  /**
   * 渲染联系人卡片
   */
  renderContactCard(contact) {
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
  },

  /**
   * 跳转到详情页
   */
  showDetail(id) {
    Router.navigate(`/contacts/${id}`);
  },

  /**
   * 渲染联系人详情页
   */
  async renderDetail(container, contactId) {
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

      <style>
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
      </style>
    `;
  },

  /**
   * 获取测试结果摘要（与首页显示一致）
   */
  getTestResultSummary(test) {
    if (!test.result) return '-';
    const result = test.result;
    
    switch (test.type) {
      case 'mbti':
        return result.type || '-';
      
      case 'bigfive':
        // 显示最高分维度
        if (result.dimensions) {
          const dims = result.dimensions;
          const entries = Object.entries(dims).filter(([k]) => ['O', 'C', 'E', 'A', 'N'].includes(k));
          if (entries.length > 0) {
            const topDim = entries.sort((a, b) => b[1] - a[1])[0];
            const dimNames = { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '情绪性' };
            return `${topDim[0]}:${topDim[1]}`;
          }
        }
        return '-';
      
      case 'holland':
        // 使用hollandCode
        return result.hollandCode || '-';
      
      case 'attachment':
        // 使用typeInfo.name中文名
        if (result.typeInfo?.name) {
          return result.typeInfo.name;
        }
        // 兼容旧格式，将英文转中文
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
        // 使用coreValues
        if (result.coreValues?.length > 0) {
          return result.coreValues[0].dimension || result.coreValues[0].name || result.coreValues[0];
        }
        if (result.topValues?.length > 0) {
          return result.topValues[0];
        }
        return '-';
      
      case 'stress':
        // 使用anxietyLevel.name
        if (result.anxietyLevel?.name) {
          return result.anxietyLevel.name;
        }
        return result.level || '-';
      
      case 'comprehensive':
        return '已完成';
      
      default:
        return '已完成';
    }
  },

  /**
   * 导入本人数据
   */
  async importSelfData() {
    this._importMode = 'self';
    document.getElementById('contactsImportFile').click();
  },

  /**
   * 导入关系网数据
   */
  async importNetworkData() {
    this._importMode = 'network';
    document.getElementById('contactsImportFile').click();
  },

  /**
   * 处理文件选择
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 清空 input 以便重复选择同一文件
    event.target.value = '';

    try {
      const importData = await this.readAndDecryptZip(file);
      if (!importData) return;

      if (this._importMode === 'self') {
        await this.processSelfImport(importData);
      } else {
        await this.processNetworkImport(importData);
      }
    } catch (error) {
      console.error('导入失败:', error);
      await Utils.alert(error.message, '导入失败', 'error');
    }
  },

  /**
   * 读取并解密 ZIP 文件
   */
  async readAndDecryptZip(file) {
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.zip')) {
      await Utils.alert('请选择 ZIP 格式的数据包文件', '文件格式错误', 'error');
      return null;
    }

    // 读取 ZIP
    const zip = await JSZip.loadAsync(file);

    // 检查版本
    const versionFile = zip.file('version.json');
    if (!versionFile) {
      await Utils.alert('无效的数据包：缺少版本信息', '导入失败', 'error');
      return null;
    }

    const versionInfo = JSON.parse(await versionFile.async('string'));
    if (versionInfo.format !== 'guanji-v3') {
      await Utils.alert('不支持的数据包格式', '导入失败', 'error');
      return null;
    }

    // 读取加密数据
    const dataFile = zip.file('data.enc');
    if (!dataFile) {
      await Utils.alert('无效的数据包：缺少数据文件', '导入失败', 'error');
      return null;
    }

    const encrypted = new Uint8Array(await dataFile.async('arraybuffer'));

    // 获取密码
    const password = await DataCard.showPasswordDialog(
      '输入密码',
      '请输入数据包的加密密码',
      false
    );

    if (!password) {
      return null; // 用户取消
    }

    Utils.showLoading('正在解密数据...');

    // 解密
    let decrypted;
    try {
      decrypted = await DataCard.decryptWithPassword(encrypted, password);
    } catch (error) {
      Utils.hideLoading();
      await Utils.alert('密码错误或数据已损坏', '解密失败', 'error');
      return null;
    }

    // 解压
    const jsonStr = LZString.decompressFromUint8Array(decrypted);
    if (!jsonStr) {
      Utils.hideLoading();
      await Utils.alert('数据解压失败', '导入失败', 'error');
      return null;
    }

    Utils.hideLoading();
    return JSON.parse(jsonStr);
  },

  /**
   * 处理导入本人数据
   */
  async processSelfImport(importData) {
    const localProfile = await Storage.getProfile();
    const importProfile = importData.profile || {};

    // 检查本地是否已设置姓名
    if (!localProfile || !localProfile.name) {
      await Utils.alert('请先在设置中填写您的姓名，再进行数据导入', '请先设置姓名', 'warning');
      return;
    }

    // 检查姓名是否匹配
    if (!importProfile.name) {
      await Utils.alert('导入的数据缺少姓名信息，无法验证身份', '导入失败', 'error');
      return;
    }

    if (importProfile.name !== localProfile.name) {
      const confirmed = await Utils.confirm(
        `身份不匹配！\n\n` +
        `本地用户：${localProfile.name}\n` +
        `导入数据：${importProfile.name}\n\n` +
        `这不是您的数据。如果要添加此人到关系网，请使用「导入关系网数据」功能。`,
        '身份验证失败'
      );
      return;
    }

    // 姓名匹配，检查其他字段冲突
    const conflicts = this.detectProfileConflicts(localProfile, importProfile);

    if (conflicts.length > 0) {
      // 有冲突，显示对比弹窗
      const choice = await this.showSelfConflictDialog(localProfile, importProfile, importData);
      if (choice === 'overwrite') {
        await this.overwriteSelfData(importData);
      } else if (choice === 'merge') {
        await this.mergeSelfData(importData, localProfile);
      }
      // cancel 不做任何操作
    } else {
      // 无冲突，自动合并
      const confirmMsg = `即将合并以下数据：\n` +
        `• 测试记录：${importData.tests?.length || 0} 条\n` +
        `• 日记：${importData.diary?.length || 0} 篇\n\n` +
        `确认合并到您的数据中吗？`;

      const confirmed = await Utils.confirm(confirmMsg, '确认合并');
      if (confirmed) {
        await this.mergeSelfData(importData, localProfile);
      }
    }
  },

  /**
   * 检测 profile 冲突
   */
  detectProfileConflicts(local, imported) {
    const conflicts = [];
    const fields = [
      { key: 'gender', label: '性别' },
      { key: 'birthday', label: '生日' },
      { key: 'contact', label: '联系方式' }
    ];

    for (const field of fields) {
      if (local[field.key] && imported[field.key] && local[field.key] !== imported[field.key]) {
        conflicts.push({
          ...field,
          local: local[field.key],
          imported: imported[field.key]
        });
      }
    }

    return conflicts;
  },

  /**
   * 显示本人数据冲突对比弹窗
   */
  async showSelfConflictDialog(local, imported, importData) {
    // 在模板字符串外部获取本地数据计数
    const localTests = await Storage.getAll('tests');
    const localDiary = await Storage.getAll('diary');
    const localTestsCount = localTests?.length || 0;
    const localDiaryCount = localDiary?.length || 0;

    return new Promise((resolve) => {
      const localGender = local.gender === 'male' ? '男' : local.gender === 'female' ? '女' : '-';
      const importedGender = imported.gender === 'male' ? '男' : imported.gender === 'female' ? '女' : '-';

      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.id = 'selfConflictModal';
      modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ 数据冲突</h3>
            <button class="modal-close" onclick="Contacts.closeSelfConflictDialog('cancel')">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-secondary mb-md">检测到个人资料存在差异，请选择处理方式：</p>
            
            <div class="conflict-compare">
              <div class="conflict-column">
                <div class="conflict-column-title">本地数据</div>
                <div class="conflict-item">性别: ${localGender}</div>
                <div class="conflict-item">生日: ${local.birthday || '-'}</div>
                <div class="conflict-item">测试: ${localTestsCount} 条</div>
                <div class="conflict-item">日记: ${localDiaryCount} 篇</div>
              </div>
              <div class="conflict-column">
                <div class="conflict-column-title">导入数据</div>
                <div class="conflict-item">性别: ${importedGender}</div>
                <div class="conflict-item">生日: ${imported.birthday || '-'}</div>
                <div class="conflict-item">测试: ${importData.tests?.length || 0} 条</div>
                <div class="conflict-item">日记: ${importData.diary?.length || 0} 篇</div>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="flex-direction: column; gap: var(--spacing-sm);">
            <button class="btn btn-primary btn-block" onclick="Contacts.closeSelfConflictDialog('merge')">
              智能合并（推荐）
            </button>
            <button class="btn btn-secondary btn-block" onclick="Contacts.closeSelfConflictDialog('overwrite')">
              完全覆盖本地数据
            </button>
            <button class="btn btn-ghost btn-block" onclick="Contacts.closeSelfConflictDialog('cancel')">
              取消
            </button>
          </div>
        </div>
        
        <style>
          .conflict-compare {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md);
            margin-top: var(--spacing-md);
          }
          
          .conflict-column {
            background: var(--bg-secondary);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
          }
          
          .conflict-column-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            padding-bottom: var(--spacing-sm);
            border-bottom: 1px solid var(--border-color-light);
          }
          
          .conflict-item {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            padding: var(--spacing-xs) 0;
          }
        </style>
      `;

      document.body.appendChild(modal);
      this._selfConflictResolve = resolve;
    });
  },

  /**
   * 关闭本人数据冲突弹窗
   */
  closeSelfConflictDialog(choice) {
    const modal = document.getElementById('selfConflictModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
    if (this._selfConflictResolve) {
      this._selfConflictResolve(choice);
      this._selfConflictResolve = null;
    }
  },

  /**
   * 覆盖本人数据
   */
  async overwriteSelfData(importData) {
    Utils.showLoading('正在覆盖数据...');

    // 清空并写入测试数据
    await Storage.clear('tests');
    if (importData.tests) {
      for (const test of importData.tests) {
        await Storage.setRaw('tests', test);
      }
    }

    // 清空并写入日记数据
    await Storage.clear('diary');
    if (importData.diary) {
      for (const entry of importData.diary) {
        await Storage.setRaw('diary', entry);
      }
    }

    // 清空并写入关系网数据
    await Storage.clear('contacts');
    if (importData.contacts) {
      for (const contact of importData.contacts) {
        await Storage.setRaw('contacts', contact);
      }
    }

    // 更新 profile（保留姓名）
    if (importData.profile) {
      const localProfile = await Storage.getProfile();
      await Storage.clear('profile');
      await Storage.setRaw('profile', {
        ...importData.profile,
        key: 'userProfile',
        name: localProfile.name, // 保留本地姓名
        lastUpdated: Date.now()
      });
    }

    Utils.hideLoading();
    Utils.showToast('数据已覆盖', 'success');
    setTimeout(() => location.reload(), 1000);
  },

  /**
   * 合并本人数据
   */
  async mergeSelfData(importData, localProfile) {
    Utils.showLoading('正在合并数据...');

    // 合并测试数据（按 id 去重，保留最新）
    const localTests = await Storage.getAll('tests') || [];
    const mergedTests = this.mergeArrayById(localTests, importData.tests || [], 'timestamp');
    
    await Storage.clear('tests');
    for (const test of mergedTests) {
      await Storage.setRaw('tests', test);
    }

    // 合并日记数据（按 id 去重，保留最新）
    const localDiary = await Storage.getAll('diary') || [];
    const mergedDiary = this.mergeArrayById(localDiary, importData.diary || [], 'updatedAt');
    
    await Storage.clear('diary');
    for (const entry of mergedDiary) {
      await Storage.setRaw('diary', entry);
    }

    // 合并关系网数据（按 id 去重，保留最新）
    const localContacts = await Storage.getAll('contacts') || [];
    const mergedContacts = this.mergeArrayById(localContacts, importData.contacts || [], 'importedAt');
    
    await Storage.clear('contacts');
    for (const contact of mergedContacts) {
      await Storage.setRaw('contacts', contact);
    }

    // 合并 profile（非空字段优先保留本地）
    if (importData.profile) {
      const mergedProfile = { ...localProfile };
      for (const key of ['gender', 'birthday', 'contact', 'bio']) {
        if (!mergedProfile[key] && importData.profile[key]) {
          mergedProfile[key] = importData.profile[key];
        }
      }
      mergedProfile.lastUpdated = Date.now();
      await Storage.clear('profile');
      await Storage.setRaw('profile', {
        ...mergedProfile,
        key: 'userProfile'
      });
    }

    Utils.hideLoading();
    Utils.showToast('数据已合并', 'success');
    setTimeout(() => location.reload(), 1000);
  },

  /**
   * 按 ID 合并数组
   */
  mergeArrayById(localArr, importArr, timeField) {
    const map = new Map();

    // 先放入本地数据
    for (const item of localArr) {
      map.set(item.id, item);
    }

    // 导入数据覆盖（如果更新时间更晚）
    for (const item of importArr) {
      const existing = map.get(item.id);
      if (!existing || (item[timeField] && existing[timeField] && item[timeField] > existing[timeField])) {
        map.set(item.id, item);
      } else if (!existing) {
        map.set(item.id, item);
      }
    }

    return Array.from(map.values());
  },

  /**
   * 处理导入关系网数据
   */
  async processNetworkImport(importData) {
    const importProfile = importData.profile || {};
    const contactName = importProfile.name;

    if (!contactName) {
      await Utils.alert('导入的数据缺少姓名信息', '导入失败', 'error');
      return;
    }

    // 检查是否是本人数据
    const localProfile = await Storage.getProfile();
    if (localProfile && localProfile.name === contactName) {
      const useAsSelf = await Utils.confirm(
        `检测到这是您本人（${contactName}）的数据。\n\n` +
        `是否要作为本人数据导入？`,
        '检测到本人数据'
      );
      if (useAsSelf) {
        await this.processSelfImport(importData);
        return;
      }
    }

    // 查询同名联系人
    const existingContacts = await this.getAll();
    const duplicates = existingContacts.filter(c => c.name === contactName);

    if (duplicates.length > 0) {
      // 存在同名联系人，显示冲突对比
      await this.showNetworkConflictDialog(duplicates[0], importData);
    } else {
      // 不存在同名，直接添加
      const confirmMsg = `即将添加联系人「${contactName}」：\n` +
        `• 测试记录：${importData.tests?.length || 0} 条\n` +
        `• 日记：${importData.diary?.length || 0} 篇\n\n` +
        `确认添加到关系网吗？`;

      const confirmed = await Utils.confirm(confirmMsg, '确认添加');
      if (confirmed) {
        await this.addNewContact(importData);
      }
    }
  },

  /**
   * 显示关系网数据冲突弹窗
   */
  showNetworkConflictDialog(existing, importData) {
    return new Promise((resolve) => {
      this._pendingImportData = importData;
      this._pendingExistingContact = existing;

      const imported = importData.profile || {};

      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.id = 'networkConflictModal';
      modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ 检测到同名联系人</h3>
            <button class="modal-close" onclick="Contacts.closeNetworkConflictDialog('cancel')">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-secondary mb-md">关系网中已存在「${existing.name}」${existing.remark ? `（${existing.remark}）` : ''}，请选择处理方式：</p>
            
            <div class="conflict-compare">
              <div class="conflict-column">
                <div class="conflict-column-title">已有联系人</div>
                <div class="conflict-item">备注: ${existing.remark || '-'}</div>
                <div class="conflict-item">测试: ${existing.tests?.length || 0} 条</div>
                <div class="conflict-item">日记: ${existing.diary?.length || 0} 篇</div>
                <div class="conflict-item">导入: ${Utils.formatDate(existing.importedAt, 'YYYY-MM-DD')}</div>
              </div>
              <div class="conflict-column">
                <div class="conflict-column-title">新导入数据</div>
                <div class="conflict-item">性别: ${imported.gender === 'male' ? '男' : imported.gender === 'female' ? '女' : '-'}</div>
                <div class="conflict-item">测试: ${importData.tests?.length || 0} 条</div>
                <div class="conflict-item">日记: ${importData.diary?.length || 0} 篇</div>
                <div class="conflict-item">版本: ${importData.version || '-'}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="flex-direction: column; gap: var(--spacing-sm);">
            <button class="btn btn-primary btn-block" onclick="Contacts.closeNetworkConflictDialog('overwrite')">
              覆盖现有联系人
            </button>
            <button class="btn btn-secondary btn-block" onclick="Contacts.closeNetworkConflictDialog('add-new')">
              作为新联系人添加
            </button>
            <button class="btn btn-ghost btn-block" onclick="Contacts.closeNetworkConflictDialog('cancel')">
              取消
            </button>
          </div>
        </div>
        
        <style>
          .conflict-compare {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md);
            margin-top: var(--spacing-md);
          }
          
          .conflict-column {
            background: var(--bg-secondary);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
          }
          
          .conflict-column-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            padding-bottom: var(--spacing-sm);
            border-bottom: 1px solid var(--border-color-light);
          }
          
          .conflict-item {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            padding: var(--spacing-xs) 0;
          }
        </style>
      `;

      document.body.appendChild(modal);
      this._networkConflictResolve = resolve;
    });
  },

  /**
   * 关闭关系网冲突弹窗
   */
  async closeNetworkConflictDialog(choice) {
    const modal = document.getElementById('networkConflictModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }

    const importData = this._pendingImportData;
    const existing = this._pendingExistingContact;

    if (choice === 'overwrite' && existing && importData) {
      // 覆盖现有联系人
      await this.save({
        id: existing.id,
        name: importData.profile.name,
        remark: existing.remark, // 保留备注
        tests: importData.tests || [],
        diary: importData.diary || [],
        profile: importData.profile,
        importedAt: Date.now(),
        dataVersion: importData.version
      });
      Utils.showToast('联系人已更新', 'success');
      // 强制刷新页面
      await Router.handleRouteChange();
    } else if (choice === 'add-new' && importData) {
      // 作为新联系人添加，需要输入备注
      const remark = await this.showRemarkDialog(importData.profile.name);
      if (remark !== null) {
        await this.addNewContact(importData, remark);
      }
    }

    this._pendingImportData = null;
    this._pendingExistingContact = null;
    
    // 解决Promise
    if (this._networkConflictResolve) {
      this._networkConflictResolve();
      this._networkConflictResolve = null;
    }
  },

  /**
   * 显示备注输入弹窗
   */
  showRemarkDialog(contactName) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.id = 'remarkModal';
      modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">添加备注</h3>
            <button class="modal-close" onclick="Contacts.closeRemarkDialog(null)">✕</button>
          </div>
          <div class="modal-body">
            <p class="text-secondary mb-md">
              已存在同名联系人「${contactName}」，请添加备注以便区分：
            </p>
            <div class="input-group">
              <label class="input-label">备注 <span class="text-danger">*</span></label>
              <input type="text" class="input-field" id="contactRemark" 
                     placeholder="如：同学、同事、朋友等" maxlength="20" required autofocus>
              <span class="input-hint">最多20个字符</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="Contacts.closeRemarkDialog(null)">取消</button>
            <button class="btn btn-primary" onclick="Contacts.submitRemark()">确定</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this._remarkResolve = resolve;
    });
  },

  /**
   * 提交备注
   */
  submitRemark() {
    const remark = document.getElementById('contactRemark').value.trim();
    if (!remark) {
      Utils.showToast('请输入备注以区分同名联系人', 'error');
      return;
    }
    this.closeRemarkDialog(remark);
  },

  /**
   * 关闭备注弹窗
   */
  closeRemarkDialog(remark) {
    const modal = document.getElementById('remarkModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
    if (this._remarkResolve) {
      this._remarkResolve(remark);
      this._remarkResolve = null;
    }
  },

  /**
   * 添加新联系人
   */
  async addNewContact(importData, remark = '') {
    const contact = {
      id: Utils.generateId(),
      name: importData.profile.name,
      remark: remark,
      tests: importData.tests || [],
      diary: importData.diary || [],
      profile: importData.profile,
      importedAt: Date.now(),
      dataVersion: importData.version
    };

    await this.save(contact);
    Utils.showToast('联系人已添加', 'success');
    
    // 强制刷新页面
    await Router.handleRouteChange();
  },

  /**
   * 编辑备注
   */
  async editRemark(contactId) {
    const contact = await this.get(contactId);
    if (!contact) return;

    const newRemark = await this.showEditRemarkDialog(contact.name, contact.remark || '');
    if (newRemark !== null) {
      contact.remark = newRemark;
      await this.save(contact);
      Utils.showToast('备注已更新', 'success');
      Router.navigate(`/contacts/${contactId}`);
    }
  },

  /**
   * 显示编辑备注弹窗
   */
  showEditRemarkDialog(contactName, currentRemark) {
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
  },

  /**
   * 提交编辑的备注
   */
  submitEditRemark() {
    const remark = document.getElementById('editContactRemark').value.trim();
    this.closeEditRemarkDialog(remark);
  },

  /**
   * 关闭编辑备注弹窗
   */
  closeEditRemarkDialog(remark) {
    const modal = document.getElementById('editRemarkModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
    if (this._editRemarkResolve) {
      this._editRemarkResolve(remark);
      this._editRemarkResolve = null;
    }
  },

  /**
   * 确认删除联系人
   */
  async confirmDelete(contactId) {
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
  },

  /**
   * 显示测试详情弹窗
   */
  async showTestDetail(contactId, testIndex) {
    const contact = await this.get(contactId);
    if (!contact || !contact.tests || !contact.tests[testIndex]) return;

    const test = contact.tests[testIndex];
    const result = test.result || {};
    
    // 测试类型信息
    const typeInfo = {
      'mbti': { name: 'MBTI人格类型', icon: '🧠' },
      'bigfive': { name: '大五人格', icon: '⭐' },
      'holland': { name: '霍兰德职业兴趣', icon: '💼' },
      'attachment': { name: '依恋类型', icon: '💕' },
      'eq': { name: '情商测试', icon: '💡' },
      'values': { name: '价值观测试', icon: '🎯' },
      'stress': { name: '心理健康', icon: '🌱' },
      'comprehensive': { name: '综合画像', icon: '📊' }
    };
    
    const info = typeInfo[test.type] || { name: test.type, icon: '📝' };
    const detailContent = this.renderTestDetailContent(test);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'testDetailModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">${info.icon} ${info.name}</h3>
          <button class="modal-close" onclick="Contacts.closeTestDetailModal()">✕</button>
        </div>
        <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px);">
          <div class="test-detail-meta">
            <span class="test-detail-user">👤 ${contact.name}</span>
            <span class="test-detail-time">📅 ${Utils.formatDate(test.timestamp, 'YYYY-MM-DD HH:mm')}</span>
          </div>
          ${detailContent}
        </div>
      </div>
      <style>
        .test-detail-meta {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .test-detail-section {
          margin-bottom: var(--spacing-lg);
        }
        .test-detail-section-title {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color-light);
        }
        .test-detail-result {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--primary-color);
          text-align: center;
          padding: var(--spacing-lg);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
        }
        .test-detail-dims {
          display: grid;
          gap: var(--spacing-md);
        }
        .test-detail-dim {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        .test-detail-dim-label {
          width: 80px;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .test-detail-dim-bar {
          flex: 1;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }
        .test-detail-dim-fill {
          height: 100%;
          background: var(--primary-color);
          border-radius: 4px;
        }
        .test-detail-dim-value {
          width: 50px;
          text-align: right;
          font-size: var(--font-size-sm);
          font-weight: 600;
        }
        .test-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        .test-detail-tag {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--primary-color-light);
          color: var(--primary-color);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
        }
        .test-detail-text {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.8;
          white-space: pre-wrap;
        }
        .test-detail-ai {
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .test-detail-ai .md-h2 { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin: var(--spacing-md) 0 var(--spacing-sm); }
        .test-detail-ai .md-h3 { font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary); margin: var(--spacing-md) 0 var(--spacing-sm); }
        .test-detail-ai .md-h4 { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: var(--spacing-sm) 0; }
        .test-detail-ai .md-p { margin: var(--spacing-sm) 0; }
        .test-detail-ai .md-li { margin-left: var(--spacing-lg); list-style: disc; }
        .test-detail-ai .md-li-num { margin-left: var(--spacing-lg); list-style: decimal; }
        .test-detail-ai .md-hr { border: none; border-top: 1px solid var(--border-color-light); margin: var(--spacing-md) 0; }
        .test-detail-ai strong { color: var(--text-primary); font-weight: 600; }
      </style>
    `;

    document.body.appendChild(modal);
  },

  /**
   * 渲染测试详情内容
   */
  renderTestDetailContent(test) {
    const result = test.result || {};
    
    switch (test.type) {
      case 'mbti':
        return this.renderMBTIDetail(result);
      case 'bigfive':
        return this.renderBigFiveDetail(result);
      case 'holland':
        return this.renderHollandDetail(result);
      case 'attachment':
        return this.renderAttachmentDetail(result);
      case 'eq':
        return this.renderEQDetail(result);
      case 'values':
        return this.renderValuesDetail(result);
      case 'stress':
        return this.renderStressDetail(result);
      case 'comprehensive':
        return this.renderComprehensiveDetail(result);
      default:
        return `<div class="test-detail-text">${JSON.stringify(result, null, 2)}</div>`;
    }
  },

  renderMBTIDetail(result) {
    const dims = result.dimensions || {};
    const mbtiColors = {
      E: '#f59e0b', I: '#3b82f6',
      S: '#22c55e', N: '#a855f7',
      T: '#ef4444', F: '#ec4899',
      J: '#6366f1', P: '#14b8a6'
    };
    
    const mbtiDims = [
      { left: 'E', right: 'I', leftName: '外向', rightName: '内向' },
      { left: 'S', right: 'N', leftName: '感觉', rightName: '直觉' },
      { left: 'T', right: 'F', leftName: '思考', rightName: '情感' },
      { left: 'J', right: 'P', leftName: '判断', rightName: '知觉' }
    ];
    
    return `
      <div class="test-detail-result">${result.type || '-'}</div>
      <div class="test-detail-section">
        <div class="test-detail-section-title">维度分析</div>
        <div class="test-detail-dims">
          ${mbtiDims.map(dim => {
            const leftScore = dims[dim.left] || 50;
            const rightScore = 100 - leftScore;
            const dominant = leftScore >= 50 ? dim.left : dim.right;
            return `
              <div class="mbti-dim-row">
                <span class="mbti-dim-label" style="color: ${mbtiColors[dim.left]};">${dim.left} ${dim.leftName}</span>
                <div class="mbti-dim-bar">
                  <div class="mbti-dim-fill-left" style="width: ${leftScore}%; background-color: ${mbtiColors[dim.left]};"></div>
                  <div class="mbti-dim-fill-right" style="width: ${rightScore}%; background-color: ${mbtiColors[dim.right]};"></div>
                </div>
                <span class="mbti-dim-label" style="color: ${mbtiColors[dim.right]};">${dim.rightName} ${dim.right}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
      <style>
        .mbti-dim-row { display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
        .mbti-dim-label { font-size: var(--font-size-xs); width: 70px; text-align: center; font-weight: 500; }
        .mbti-dim-bar { flex: 1; height: 12px; display: flex; border-radius: 6px; overflow: hidden; }
        .mbti-dim-fill-left, .mbti-dim-fill-right { height: 100%; transition: width 0.3s; }
      </style>
    `;
  },

  renderBigFiveDetail(result) {
    const dims = result.dimensions || {};
    const bigFiveDims = [
      { key: 'O', name: '开放性', color: '#a855f7', desc: '想象力、创造力' },
      { key: 'C', name: '尽责性', color: '#3b82f6', desc: '自律、责任心' },
      { key: 'E', name: '外向性', color: '#f59e0b', desc: '社交、活力' },
      { key: 'A', name: '宜人性', color: '#22c55e', desc: '合作、信任' },
      { key: 'N', name: '神经质', color: '#ef4444', desc: '情绪稳定性' }
    ];
    
    return `
      <div class="test-detail-section">
        <div class="test-detail-section-title">五大维度得分</div>
        <div class="test-detail-dims">
          ${bigFiveDims.map(dim => `
            <div class="test-detail-dim">
              <span class="test-detail-dim-label">${dim.name}(${dim.key})</span>
              <div class="test-detail-dim-bar">
                <div class="test-detail-dim-fill" style="width: ${dims[dim.key] || 0}%; background-color: ${dim.color};"></div>
              </div>
              <span class="test-detail-dim-value" style="color: ${dim.color};">${dims[dim.key] || 0}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
    `;
  },

  renderHollandDetail(result) {
    // 使用正确的数据结构：result.dimensions
    const dims = result.dimensions || {};
    const hollandDims = {
      R: { name: '现实型', icon: '🔧', color: '#ef4444' },
      I: { name: '研究型', icon: '🔬', color: '#3b82f6' },
      A: { name: '艺术型', icon: '🎨', color: '#a855f7' },
      S: { name: '社会型', icon: '🤝', color: '#22c55e' },
      E: { name: '企业型', icon: '💼', color: '#f59e0b' },
      C: { name: '常规型', icon: '📊', color: '#6366f1' }
    };
    
    return `
      ${result.hollandCode ? `
        <div class="test-detail-result">${result.hollandCode}</div>
      ` : ''}
      <div class="test-detail-section">
        <div class="test-detail-section-title">六大类型得分</div>
        <div class="test-detail-dims">
          ${Object.entries(hollandDims).map(([key, info]) => `
            <div class="test-detail-dim">
              <span class="test-detail-dim-label">${info.icon} ${info.name}(${key})</span>
              <div class="test-detail-dim-bar">
                <div class="test-detail-dim-fill" style="width: ${dims[key] || 0}%; background-color: ${info.color};"></div>
              </div>
              <span class="test-detail-dim-value" style="color: ${info.color};">${dims[key] || 0}%</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
    `;
  },

  renderAttachmentDetail(result) {
    // 使用正确的数据结构：result.typeInfo 和 result.dimensions
    const dims = result.dimensions || {};
    const anxiety = dims.anxiety || 0;
    const avoidance = dims.avoidance || 0;
    
    // 优先使用typeInfo，兼容旧格式
    let typeName = result.typeInfo?.name || '';
    let typeDesc = result.typeInfo?.description || '';
    let typeIcon = result.typeInfo?.icon || '💕';
    let typeColor = result.typeInfo?.color || '#ec4899';
    
    // 兼容旧格式
    if (!typeName && result.type) {
      const typeMap = {
        'secure': { name: '安全型', desc: '低焦虑、低回避', color: '#22c55e' },
        'anxious': { name: '焦虑型', desc: '高焦虑、低回避', color: '#f59e0b' },
        'avoidant': { name: '回避型', desc: '低焦虑、高回避', color: '#3b82f6' },
        'fearful': { name: '恐惧型', desc: '高焦虑、高回避', color: '#ef4444' }
      };
      const info = typeMap[result.type] || {};
      typeName = info.name || result.type;
      typeDesc = info.desc || '';
      typeColor = info.color || '#ec4899';
    }
    
    return `
      <div class="test-detail-result" style="color: ${typeColor};">${typeName || '-'}</div>
      ${typeDesc ? `<p class="text-center text-secondary mb-lg">${typeDesc}</p>` : ''}
      <div class="test-detail-section">
        <div class="test-detail-section-title">💓 依恋维度</div>
        <div class="test-detail-dims">
          <div class="test-detail-dim">
            <span class="test-detail-dim-label">焦虑程度</span>
            <div class="test-detail-dim-bar">
              <div class="test-detail-dim-fill" style="width: ${anxiety}%; background-color: #f59e0b;"></div>
            </div>
            <span class="test-detail-dim-value" style="color: #f59e0b;">${anxiety}%</span>
          </div>
          <div class="test-detail-dim">
            <span class="test-detail-dim-label">回避程度</span>
            <div class="test-detail-dim-bar">
              <div class="test-detail-dim-fill" style="width: ${avoidance}%; background-color: #3b82f6;"></div>
            </div>
            <span class="test-detail-dim-value" style="color: #3b82f6;">${avoidance}%</span>
          </div>
        </div>
      </div>
      ${result.typeInfo?.traits?.length > 0 ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">核心特质</div>
          <div class="test-detail-tags">
            ${result.typeInfo.traits.map(t => `<span class="test-detail-tag" style="background: ${typeColor}20; color: ${typeColor};">${t}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
    `;
  },

  renderEQDetail(result) {
    const dims = result.dimensions || {};
    const eqDims = [
      { key: 'selfAwareness', name: '自我意识', color: '#3b82f6' },
      { key: 'selfManagement', name: '自我管理', color: '#22c55e' },
      { key: 'socialAwareness', name: '社会意识', color: '#f59e0b' },
      { key: 'relationshipManagement', name: '关系管理', color: '#ef4444' },
      { key: 'selfMotivation', name: '自我激励', color: '#a855f7' }
    ];
    
    return `
      <div class="test-detail-result">${result.overallScore || result.totalScore || 0} 分</div>
      <div class="test-detail-section">
        <div class="test-detail-section-title">各维度得分</div>
        <div class="test-detail-dims">
          ${eqDims.map(dim => {
            const score = dims[dim.key] || dims[dim.name] || 0;
            return `
              <div class="test-detail-dim">
                <span class="test-detail-dim-label">${dim.name}</span>
                <div class="test-detail-dim-bar">
                  <div class="test-detail-dim-fill" style="width: ${score}%; background-color: ${dim.color};"></div>
                </div>
                <span class="test-detail-dim-value" style="color: ${dim.color};">${score}%</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
    `;
  },

  renderValuesDetail(result) {
    const topValues = result.topValues || result.values || [];
    const scores = result.scores || {};
    
    return `
      <div class="test-detail-section">
        <div class="test-detail-section-title">核心价值观排序</div>
        ${topValues.length > 0 ? `
          <div class="values-list">
            ${topValues.map((v, i) => {
              const value = typeof v === 'object' ? v.name : v;
              const score = typeof v === 'object' ? v.score : (scores[value] || 0);
              return `
                <div class="value-item">
                  <span class="value-rank">${i + 1}</span>
                  <span class="value-name">${value}</span>
                  ${score ? `<span class="value-score">${score}%</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : '<div class="text-secondary">暂无数据</div>'}
      </div>
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
      <style>
        .values-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .value-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-md); }
        .value-rank { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; border-radius: 50%; font-size: var(--font-size-xs); font-weight: 600; }
        .value-name { flex: 1; font-weight: 500; }
        .value-score { color: var(--primary-color); font-weight: 600; }
      </style>
    `;
  },

  renderStressDetail(result) {
    // 使用正确的数据结构：result.anxietyLevel
    const anxietyLevel = result.anxietyLevel || {};
    const levelName = anxietyLevel.name || result.level || '-';
    const levelColor = anxietyLevel.color || '#22c55e';
    const levelDesc = anxietyLevel.description || '';
    
    return `
      <div class="test-detail-result" style="color: ${levelColor};">${levelName}</div>
      ${levelDesc ? `<p class="text-center text-secondary mb-lg">${levelDesc}</p>` : ''}
      ${result.anxietyScore !== undefined ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">焦虑得分</div>
          <div class="stress-score-display">
            <div class="stress-score" style="color: ${levelColor};">${result.anxietyScore}</div>
            <div class="stress-label">分</div>
          </div>
        </div>
      ` : ''}
      ${result.depressionLevel ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">抑郁状态</div>
          <div class="stress-level-display" style="color: ${result.depressionLevel.color || '#22c55e'};">
            ${result.depressionLevel.name || '-'}
          </div>
        </div>
      ` : ''}
      ${result.aiAnalysis ? `
        <div class="test-detail-section">
          <div class="test-detail-section-title">AI 分析</div>
          <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
        </div>
      ` : ''}
      <style>
        .stress-score-display { display: flex; align-items: baseline; justify-content: center; gap: var(--spacing-xs); padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); }
        .stress-score { font-size: var(--font-size-3xl); font-weight: 700; }
        .stress-label { font-size: var(--font-size-lg); color: var(--text-secondary); }
        .stress-level-display { text-align: center; font-size: var(--font-size-xl); font-weight: 600; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); }
      </style>
    `;
  },

  renderComprehensiveDetail(result) {
    const content = result.analysis || result.aiAnalysis || '';
    return `
      <div class="test-detail-section">
        <div class="test-detail-section-title">综合分析报告</div>
        <div class="test-detail-ai">${content ? this.formatMarkdown(content) : '暂无分析内容'}</div>
      </div>
    `;
  },

  /**
   * 格式化Markdown为HTML
   */
  formatMarkdown(text) {
    if (!text) return '';
    if (typeof text !== 'string') {
      text = JSON.stringify(text, null, 2);
    }
    
    return text
      // 转义HTML特殊字符（但保留已有的HTML标签结构）
      .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
      // 标题
      .replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')
      // 粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="md-li-num">$2</li>')
      // 分隔线
      .replace(/^---$/gm, '<hr class="md-hr">')
      // 换行
      .replace(/\n\n/g, '</p><p class="md-p">')
      .replace(/\n/g, '<br>')
      // 包装段落
      .replace(/^(?!<)/, '<p class="md-p">')
      .replace(/(?!>)$/, '</p>');
  },

  /**
   * 关闭测试详情弹窗
   */
  closeTestDetailModal() {
    const modal = document.getElementById('testDetailModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 显示日记详情弹窗
   */
  async showDiaryDetail(contactId, diaryIndex) {
    const contact = await this.get(contactId);
    if (!contact || !contact.diary || !contact.diary[diaryIndex]) return;

    const entry = contact.diary[diaryIndex];
    const moodInfo = entry.mood ? Diary.getMoodInfo(entry.mood) : null;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'diaryDetailModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">📔 ${entry.title || '无标题'}</h3>
          <button class="modal-close" onclick="Contacts.closeDiaryDetailModal()">✕</button>
        </div>
        <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px);">
          <div class="diary-detail-meta">
            <span class="diary-detail-user">👤 ${contact.name}</span>
            <span class="diary-detail-time">📅 ${Utils.formatDate(entry.timestamp, 'YYYY-MM-DD HH:mm')}</span>
            ${moodInfo ? `<span class="diary-detail-mood">${moodInfo.icon} ${moodInfo.label}</span>` : ''}
          </div>
          
          ${entry.tags && entry.tags.length > 0 ? `
            <div class="diary-detail-tags">
              ${entry.tags.map(tag => `<span class="diary-detail-tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
          
          <div class="diary-detail-content">${this.formatDiaryContent(entry.content)}</div>
          
          ${entry.images && entry.images.length > 0 ? `
            <div class="diary-detail-images">
              ${entry.images.map((img, idx) => {
                const imgSrc = typeof img === 'object' ? img.data : img;
                return `<img src="${imgSrc}" class="diary-detail-image" onclick="Contacts.viewDiaryImage('${entry.id || ''}', ${idx})">`;
              }).join('')}
            </div>
          ` : ''}
          
          ${entry.analysis ? `
            <div class="diary-detail-analysis">
              <div class="diary-detail-analysis-title">🤖 AI 情绪分析</div>
              ${this.renderAnalysisContent(entry.analysis)}
            </div>
          ` : ''}
        </div>
      </div>
      <style>
        .diary-detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .diary-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
        }
        .diary-detail-tag {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--primary-color-light);
          color: var(--primary-color);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
        }
        .diary-detail-content {
          font-size: var(--font-size-base);
          line-height: 1.8;
          color: var(--text-primary);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .diary-detail-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        .diary-detail-image {
          width: 100%;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        .diary-detail-image:hover {
          transform: scale(1.02);
        }
        .diary-detail-analysis {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }
        .diary-detail-analysis-title {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }
        .diary-detail-analysis-content {
          font-size: var(--font-size-sm);
          line-height: 1.6;
          color: var(--text-secondary);
        }
      </style>
    `;

    document.body.appendChild(modal);
  },

  /**
   * 格式化日记内容（简单的Markdown支持）
   */
  formatDiaryContent(content) {
    if (!content) return '';
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  },

  /**
   * 渲染AI分析内容（美化显示）
   */
  renderAnalysisContent(analysis) {
    if (!analysis) return '';
    
    // 如果是字符串，直接显示
    if (typeof analysis === 'string') {
      return `<div class="diary-detail-analysis-text">${analysis}</div>`;
    }
    
    // 如果是对象，格式化显示
    const moodLabels = {
      '兴奋': '😊', '开心': '😄', '平静': '😌', '忧虑': '😟', 
      '焦虑': '😰', '悲伤': '😢', '愤怒': '😠', '疲惫': '😴'
    };
    
    let html = '<div class="analysis-formatted">';
    
    // 心情
    if (analysis.mood) {
      const moodIcon = moodLabels[analysis.mood] || '💭';
      html += `
        <div class="analysis-item">
          <span class="analysis-label">心情</span>
          <span class="analysis-value">${moodIcon} ${analysis.mood}${analysis.moodScore ? ` (${analysis.moodScore}/5)` : ''}</span>
        </div>
      `;
    }
    
    // 关键词
    if (analysis.keywords && analysis.keywords.length > 0) {
      html += `
        <div class="analysis-item">
          <span class="analysis-label">关键词</span>
          <div class="analysis-keywords">
            ${analysis.keywords.map(k => `<span class="analysis-keyword">${k}</span>`).join('')}
          </div>
        </div>
      `;
    }
    
    // 主题
    if (analysis.themes && analysis.themes.length > 0) {
      html += `
        <div class="analysis-item">
          <span class="analysis-label">主题</span>
          <div class="analysis-themes">
            ${analysis.themes.map(t => `<span class="analysis-theme">${t}</span>`).join('')}
          </div>
        </div>
      `;
    }
    
    // 洞察
    if (analysis.insights) {
      html += `
        <div class="analysis-item analysis-insights">
          <span class="analysis-label">AI 洞察</span>
          <p class="analysis-insight-text">${analysis.insights}</p>
        </div>
      `;
    }
    
    html += '</div>';
    
    // 添加样式
    html += `
      <style>
        .analysis-formatted {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .analysis-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        .analysis-label {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .analysis-value {
          font-size: var(--font-size-base);
          color: var(--text-primary);
        }
        .analysis-keywords, .analysis-themes {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }
        .analysis-keyword {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--primary-color-light);
          color: var(--primary-color);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
        }
        .analysis-theme {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
        }
        .analysis-insight-text {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      </style>
    `;
    
    return html;
  },

  /**
   * 查看日记图片（支持对象格式）
   */
  viewDiaryImage(diaryId, imageIndex) {
    // 从当前弹窗获取图片数据
    const modal = document.getElementById('diaryDetailModal');
    if (!modal) return;
    
    const images = modal.querySelectorAll('.diary-detail-image');
    if (images[imageIndex]) {
      this.viewImage(images[imageIndex].src);
    }
  },

  /**
   * 关闭日记详情弹窗
   */
  closeDiaryDetailModal() {
    const modal = document.getElementById('diaryDetailModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 查看大图
   */
  viewImage(src) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'imageViewModal';
    modal.style.cssText = 'background: rgba(0,0,0,0.9); cursor: zoom-out;';
    modal.innerHTML = `
      <img src="${src}" style="max-width: 95%; max-height: 95%; object-fit: contain; border-radius: var(--radius-md);">
    `;
    modal.onclick = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };
    document.body.appendChild(modal);
  },

  /**
   * 显示所有日记列表
   */
  async showAllDiaries(contactId) {
    const contact = await this.get(contactId);
    if (!contact || !contact.diary) return;

    const diary = contact.diary;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'allDiariesModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">📔 ${contact.name} 的日记 (${diary.length}篇)</h3>
          <button class="modal-close" onclick="Contacts.closeAllDiariesModal()">✕</button>
        </div>
        <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px); padding: 0;">
          <div class="all-diaries-list">
            ${diary.map((entry, index) => {
              const moodInfo = entry.mood ? Diary.getMoodInfo(entry.mood) : null;
              return `
                <div class="all-diaries-item" onclick="Contacts.closeAllDiariesModal(); Contacts.showDiaryDetail('${contactId}', ${index})">
                  <div class="all-diaries-date">${Utils.formatDate(entry.timestamp, 'MM-DD')}</div>
                  <div class="all-diaries-info">
                    <div class="all-diaries-title">${entry.title || '无标题'}</div>
                    <div class="all-diaries-preview">${(entry.content || '').slice(0, 50)}${(entry.content || '').length > 50 ? '...' : ''}</div>
                  </div>
                  ${moodInfo ? `<div class="all-diaries-mood">${moodInfo.icon}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      <style>
        .all-diaries-list {
          display: flex;
          flex-direction: column;
        }
        .all-diaries-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          border-bottom: 1px solid var(--border-color-light);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .all-diaries-item:hover {
          background: var(--bg-secondary);
        }
        .all-diaries-date {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          flex-shrink: 0;
          width: 50px;
        }
        .all-diaries-info {
          flex: 1;
          min-width: 0;
        }
        .all-diaries-title {
          font-size: var(--font-size-base);
          color: var(--text-primary);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .all-diaries-preview {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .all-diaries-mood {
          flex-shrink: 0;
        }
      </style>
    `;

    document.body.appendChild(modal);
  },

  /**
   * 关闭所有日记列表弹窗
   */
  closeAllDiariesModal() {
    const modal = document.getElementById('allDiariesModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }
};

// 导出到全局
window.Contacts = Contacts;
