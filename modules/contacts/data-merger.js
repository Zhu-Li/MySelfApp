/**
 * data-merger.js - 数据合并工具
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：数据冲突检测、覆盖、合并操作
 */

/**
 * 检测 profile 冲突
 * @param {Object} local - 本地数据
 * @param {Object} imported - 导入数据
 * @returns {Array} 冲突列表
 */
Contacts.detectProfileConflicts = function(local, imported) {
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
};

/**
 * 覆盖本人数据
 * @param {Object} importData - 导入的数据
 */
Contacts.overwriteSelfData = async function(importData) {
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
};

/**
 * 合并本人数据
 * @param {Object} importData - 导入的数据
 * @param {Object} localProfile - 本地用户资料
 */
Contacts.mergeSelfData = async function(importData, localProfile) {
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
};

/**
 * 按 ID 合并数组
 * @param {Array} localArr - 本地数组
 * @param {Array} importArr - 导入数组
 * @param {string} timeField - 时间字段
 * @returns {Array} 合并后的数组
 */
Contacts.mergeArrayById = function(localArr, importArr, timeField) {
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
};
