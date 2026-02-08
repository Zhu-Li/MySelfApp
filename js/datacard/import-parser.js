/**
 * import-parser.js - 数据导入解析模块
 * 观己 - 静观己心，内外澄明
 * 
 * 处理数据包的导入和解析，支持 ZIP 和旧版 PNG 格式
 */

/**
 * 从文件导入数据（支持 ZIP 包和旧版 PNG 图片）
 * @param {File} file - 导入的文件
 * @returns {Promise<boolean>} 是否导入成功
 */
DataCard.importFromImage = async function(file) {
  try {
    const fileName = file.name.toLowerCase();
    
    // 判断文件类型
    if (fileName.endsWith('.zip')) {
      return await this.importFromZip(file);
    } else if (fileName.endsWith('.png')) {
      return await this.importFromPng(file);
    } else {
      throw new Error('不支持的文件格式，请选择 .zip 或 .png 文件');
    }
    
  } catch (error) {
    console.error('导入失败:', error);
    await Utils.alert(error.message, '导入失败', 'error');
    return false;
  }
};

/**
 * 从 ZIP 包导入数据
 * @param {File} file - ZIP 文件
 * @returns {Promise<boolean>} 是否导入成功
 */
DataCard.importFromZip = async function(file) {
  // 1. 读取 ZIP 文件
  const zip = await JSZip.loadAsync(file);
  
  // 2. 检查版本信息
  const versionFile = zip.file('version.json');
  if (!versionFile) {
    throw new Error('无效的数据包：缺少版本信息');
  }
  
  const versionInfo = JSON.parse(await versionFile.async('string'));
  if (versionInfo.format !== 'guanji-v3') {
    throw new Error('不支持的数据包格式');
  }
  
  // 3. 读取加密数据
  const dataFile = zip.file('data.enc');
  if (!dataFile) {
    throw new Error('无效的数据包：缺少数据文件');
  }
  
  const encrypted = new Uint8Array(await dataFile.async('arraybuffer'));
  
  // 4. 获取密码
  const password = await this.showPasswordDialog(
    '输入密码',
    '请输入数据包的加密密码',
    false
  );
  
  if (!password) {
    return false; // 用户取消
  }
  
  Utils.showLoading('正在解密数据...');
  
  // 5. 解密数据
  let decrypted;
  try {
    decrypted = await this.decryptWithPassword(encrypted, password);
  } catch (error) {
    Utils.hideLoading();
    throw new Error('密码错误或数据已损坏');
  }
  
  // 6. 解压数据
  const jsonStr = LZString.decompressFromUint8Array(decrypted);
  if (!jsonStr) {
    Utils.hideLoading();
    throw new Error('数据解压失败');
  }
  
  const importData = JSON.parse(jsonStr);
  
  // 7. 确认导入
  Utils.hideLoading();
  
  const confirmMsg = `即将导入以下数据：\n` +
    `• 测试记录：${importData.tests?.length || 0} 条\n` +
    `• 日记：${importData.diary?.length || 0} 篇\n` +
    `• 关系网联系人：${importData.contacts?.length || 0} 人\n` +
    `• 个人资料：${importData.profile ? '有' : '无'}\n\n` +
    `导入将覆盖现有数据，确认继续？`;
  
  const confirmed = await Utils.confirm(confirmMsg, '确认导入');
  if (!confirmed) {
    return false;
  }
  
  Utils.showLoading('正在导入数据...');
  
  // 8. 导入数据
  // 清空现有数据
  await Storage.clear('tests');
  await Storage.clear('diary');
  await Storage.clear('contacts');
  
  // 导入测试数据
  if (importData.tests && Array.isArray(importData.tests)) {
    for (const test of importData.tests) {
      await Storage.setRaw('tests', test);
    }
  }
  
  // 导入日记数据
  if (importData.diary && Array.isArray(importData.diary)) {
    for (const entry of importData.diary) {
      await Storage.setRaw('diary', entry);
    }
  }
  
  // 导入关系网数据
  if (importData.contacts && Array.isArray(importData.contacts)) {
    for (const contact of importData.contacts) {
      await Storage.setRaw('contacts', contact);
    }
  }
  
  // 导入个人资料
  if (importData.profile) {
    // 清空现有资料并设置新的
    await Storage.clear('profile');
    const profileData = {
      ...importData.profile,
      key: 'userProfile',
      lastUpdated: Date.now()
    };
    await Storage.setRaw('profile', profileData);
  }
  
  Utils.hideLoading();
  Utils.showToast('数据导入成功', 'success');
  
  // 刷新页面
  setTimeout(() => location.reload(), 1000);
  return true;
};

/**
 * 从 PNG 图片导入数据（兼容旧版）
 * @param {File} file - PNG 文件
 * @returns {Promise<boolean>} 是否导入成功
 */
DataCard.importFromPng = async function(file) {
  try {
    // 1. 加载图片
    const img = await this.loadImage(file);
    
    // 2. 绘制到Canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // 3. 获取像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // 4. 检测版本并解码数据
    const { data: encodedData, isEncrypted } = this.decodeData(imageData);
    
    if (!encodedData) {
      throw new Error('无法识别的图片格式，请确保是观己数据卡片');
    }
    
    let decompressed;
    
    if (isEncrypted) {
      // 5a. 加密版本：获取密码并解密
      const password = await this.showPasswordDialog(
        '输入解密密码',
        '此数据卡片已加密，请输入导出时设置的密码。',
        false
      );
      
      if (!password) {
        return false; // 用户取消
      }
      
      Utils.showLoading('正在验证和解密...');
      
      try {
        decompressed = await this.decryptWithPassword(encodedData, password);
      } catch (e) {
        Utils.hideLoading();
        if (e.message.includes('篡改')) {
          throw e;
        }
        throw new Error('密码错误或数据已损坏');
      }
      
      Utils.hideLoading();
    } else {
      // 5b. 旧版未加密数据
      decompressed = encodedData;
    }
    
    // 6. 解压数据
    const jsonStr = LZString.decompressFromUint8Array(decompressed);
    if (!jsonStr) {
      throw new Error('数据解压失败');
    }
    
    // 7. 解析JSON
    const data = JSON.parse(jsonStr);
    
    // 8. 确认导入
    const confirmMsg = `检测到有效的数据卡片${isEncrypted ? '（已验证签名）' : ''}\n` +
      `• 测试记录：${data.tests?.length || 0} 条\n` +
      `• 日记：${data.diary?.length || 0} 篇\n\n` +
      `导入将覆盖现有数据，确定继续吗？`;
    
    const confirmed = await Utils.confirm(confirmMsg, '确认导入');
    
    if (!confirmed) return false;
    
    Utils.showLoading('正在导入数据...');
    
    // 9. 导入数据
    // 清空现有数据
    await Storage.clear('tests');
    await Storage.clear('diary');
    
    // 导入测试数据
    if (data.tests && Array.isArray(data.tests)) {
      for (const test of data.tests) {
        await Storage.setRaw('tests', test);
      }
    }
    
    // 导入日记数据
    if (data.diary && Array.isArray(data.diary)) {
      for (const entry of data.diary) {
        await Storage.setRaw('diary', entry);
      }
    }
    
    // 导入个人资料
    if (data.profile) {
      await Storage.clear('profile');
      const profileData = {
        ...data.profile,
        key: 'userProfile',
        lastUpdated: Date.now()
      };
      await Storage.setRaw('profile', profileData);
    }
    
    Utils.hideLoading();
    Utils.showToast('数据导入成功，即将刷新页面', 'success');
    setTimeout(() => location.reload(), 1500);
    
    return true;
    
  } catch (error) {
    Utils.hideLoading();
    throw error;
  }
};

/**
 * 加载图片文件
 * @param {File} file - 图片文件
 * @returns {Promise<HTMLImageElement>} 加载完成的图片元素
 */
DataCard.loadImage = function(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};
