/**
 * import-handler.js - 数据导入处理
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：处理本人数据和关系网数据的导入
 */

/**
 * 导入本人数据
 */
Contacts.importSelfData = async function() {
  this._importMode = 'self';
  document.getElementById('contactsImportFile').click();
};

/**
 * 导入关系网数据
 */
Contacts.importNetworkData = async function() {
  this._importMode = 'network';
  document.getElementById('contactsImportFile').click();
};

/**
 * 处理文件选择
 * @param {Event} event - 文件选择事件
 */
Contacts.handleFileSelect = async function(event) {
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
};

/**
 * 读取并解密 ZIP 文件
 * @param {File} file - ZIP文件
 * @returns {Object|null} 解密后的数据
 */
Contacts.readAndDecryptZip = async function(file) {
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
};

/**
 * 处理导入本人数据
 * @param {Object} importData - 导入的数据
 */
Contacts.processSelfImport = async function(importData) {
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
    await Utils.confirm(
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
};

/**
 * 处理导入关系网数据
 * @param {Object} importData - 导入的数据
 */
Contacts.processNetworkImport = async function(importData) {
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
};

/**
 * 显示本人数据冲突对比弹窗
 * @param {Object} local - 本地数据
 * @param {Object} imported - 导入数据
 * @param {Object} importData - 完整导入数据
 * @returns {Promise<string>} 用户选择
 */
Contacts.showSelfConflictDialog = async function(local, imported, importData) {
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
    `;

    this.addConflictStyles();
    document.body.appendChild(modal);
    this._selfConflictResolve = resolve;
  });
};

/**
 * 关闭本人数据冲突弹窗
 * @param {string} choice - 用户选择
 */
Contacts.closeSelfConflictDialog = function(choice) {
  const modal = document.getElementById('selfConflictModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  if (this._selfConflictResolve) {
    this._selfConflictResolve(choice);
    this._selfConflictResolve = null;
  }
};

/**
 * 显示关系网数据冲突弹窗
 * @param {Object} existing - 已有联系人
 * @param {Object} importData - 导入数据
 * @returns {Promise<void>}
 */
Contacts.showNetworkConflictDialog = function(existing, importData) {
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
    `;

    this.addConflictStyles();
    document.body.appendChild(modal);
    this._networkConflictResolve = resolve;
  });
};

/**
 * 关闭关系网冲突弹窗
 * @param {string} choice - 用户选择
 */
Contacts.closeNetworkConflictDialog = async function(choice) {
  const modal = document.getElementById('networkConflictModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }

  const importData = this._pendingImportData;
  const existing = this._pendingExistingContact;

  if (choice === 'overwrite' && existing && importData) {
    await this.save({
      id: existing.id,
      name: importData.profile.name,
      remark: existing.remark,
      tests: importData.tests || [],
      diary: importData.diary || [],
      profile: importData.profile,
      importedAt: Date.now(),
      dataVersion: importData.version
    });
    Utils.showToast('联系人已更新', 'success');
    await Router.handleRouteChange();
  } else if (choice === 'add-new' && importData) {
    const remark = await this.showRemarkDialog(importData.profile.name);
    if (remark !== null) {
      await this.addNewContact(importData, remark);
    }
  }

  this._pendingImportData = null;
  this._pendingExistingContact = null;
  
  if (this._networkConflictResolve) {
    this._networkConflictResolve();
    this._networkConflictResolve = null;
  }
};

/**
 * 显示备注输入弹窗
 * @param {string} contactName - 联系人名称
 * @returns {Promise<string|null>}
 */
Contacts.showRemarkDialog = function(contactName) {
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
};

/**
 * 提交备注
 */
Contacts.submitRemark = function() {
  const remark = document.getElementById('contactRemark').value.trim();
  if (!remark) {
    Utils.showToast('请输入备注以区分同名联系人', 'error');
    return;
  }
  this.closeRemarkDialog(remark);
};

/**
 * 关闭备注弹窗
 * @param {string|null} remark - 备注或null
 */
Contacts.closeRemarkDialog = function(remark) {
  const modal = document.getElementById('remarkModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  if (this._remarkResolve) {
    this._remarkResolve(remark);
    this._remarkResolve = null;
  }
};

/**
 * 添加新联系人
 * @param {Object} importData - 导入数据
 * @param {string} remark - 备注
 */
Contacts.addNewContact = async function(importData, remark = '') {
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
  await Router.handleRouteChange();
};

/**
 * 添加冲突弹窗样式
 */
Contacts.addConflictStyles = function() {
  if (document.getElementById('contacts-conflict-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-conflict-styles';
  style.textContent = `
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
  `;
  document.head.appendChild(style);
};
