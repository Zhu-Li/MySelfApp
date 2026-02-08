/**
 * datacard.js - 数据卡片生成与解析模块（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 将用户数据编码到图片中，生成可分享的个人画像卡片
 * 支持 AES-256-GCM 加密和 HMAC-SHA256 签名防篡改
 * 
 * 模块拆分说明：
 * - steganography.js    数据隐写编解码
 * - password-dialog.js  密码对话框
 * - canvas-renderer.js  画布绘制逻辑
 * - export-options.js   导出选项对话框
 * - import-parser.js    导入数据解析
 */

const DataCard = {
  // ===== 配置常量 =====
  
  // 卡片尺寸
  WIDTH: 800,
  HEIGHT: 600,
  
  // 数据区域配置（图片底部用于存储数据的像素行数）
  DATA_ROWS: 120,
  
  // 魔数标识（用于识别有效的数据卡片）
  MAGIC: 'GUANJIV2', // V2 表示加密版本
  
  // 旧版魔数（兼容未加密版本）
  MAGIC_V1: 'GUANJI',

  // ===== 加密相关方法 =====

  /**
   * 从密码派生加密密钥和签名密钥
   * @param {string} password - 用户密码
   * @param {Uint8Array|null} salt - 盐值（可选）
   * @returns {Promise<{encryptKey: CryptoKey, hmacKey: CryptoKey, salt: Uint8Array}>}
   */
  async deriveKeys(password, salt = null) {
    const encoder = new TextEncoder();
    
    // 如果没有提供 salt，生成新的
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
    }
    
    // 导入密码作为密钥材料
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // 派生 AES-GCM 加密密钥
    const encryptKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // 派生 HMAC 签名密钥（使用不同的 salt 派生）
    const hmacSalt = new Uint8Array(salt.length);
    salt.forEach((b, i) => hmacSalt[i] = b ^ 0xFF); // 简单异或生成不同 salt
    
    const hmacKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: hmacSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256', length: 256 },
      false,
      ['sign', 'verify']
    );

    return { encryptKey, hmacKey, salt };
  },

  /**
   * 加密数据
   * @param {Uint8Array} data - 要加密的数据
   * @param {string} password - 密码
   * @returns {Promise<Uint8Array>} 加密后的数据
   */
  async encryptWithPassword(data, password) {
    const { encryptKey, hmacKey, salt } = await this.deriveKeys(password);
    
    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // 加密数据
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptKey,
      data
    );
    
    // 构建加密包：salt(16) + iv(12) + encrypted(n)
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);
    
    // 计算 HMAC 签名
    const signature = await crypto.subtle.sign(
      'HMAC',
      hmacKey,
      combined
    );
    
    // 最终数据：signature(32) + combined
    const signatureArray = new Uint8Array(signature);
    const final = new Uint8Array(signatureArray.length + combined.length);
    final.set(signatureArray, 0);
    final.set(combined, signatureArray.length);
    
    return final;
  },

  /**
   * 解密数据
   * @param {Uint8Array} encryptedData - 加密的数据
   * @param {string} password - 密码
   * @returns {Promise<Uint8Array>} 解密后的数据
   */
  async decryptWithPassword(encryptedData, password) {
    // 提取签名和加密数据
    const signature = encryptedData.slice(0, 32);
    const combined = encryptedData.slice(32);
    
    // 提取 salt, iv, encrypted
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // 派生密钥
    const { encryptKey, hmacKey } = await this.deriveKeys(password, salt);
    
    // 验证签名
    const isValid = await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      signature,
      combined
    );
    
    if (!isValid) {
      throw new Error('数据签名验证失败，可能已被篡改');
    }
    
    // 解密数据
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptKey,
      encrypted
    );
    
    return new Uint8Array(decrypted);
  },

  // ===== 导出入口方法 =====

  /**
   * 导出数据为 ZIP 包（包含数据卡片 + 完整加密数据）
   * @returns {Promise<boolean>} 是否导出成功
   */
  async exportAsImage() {
    try {
      // 0. 检查用户是否已设置名称
      const profile = await Storage.getProfile();
      if (!profile || !profile.name || !profile.name.trim()) {
        await Utils.alert(
          '请先在「个人资料」中设置您的名称，再进行数据导出。',
          '请先设置名称',
          'warning'
        );
        return false;
      }
      
      // 1. 显示导出内容选择
      const exportOptions = await this.showExportOptionsDialog();
      
      if (!exportOptions) {
        return false; // 用户取消
      }
      
      // 2. 获取密码
      const password = await this.showPasswordDialog(
        '设置加密密码',
        '为数据包设置密码，防止他人读取您的数据。'
      );
      
      if (!password) {
        return false; // 用户取消
      }
      
      Utils.showToast('正在生成数据包...', 'info');
      
      // 3. 根据选择获取数据（保留完整数据，包括图片）
      const allTests = await Storage.getAll('tests') || [];
      const allDiaries = await Storage.getAll('diary') || [];
      const allContacts = await Storage.getAllContacts() || [];
      
      // 筛选要导出的测试（保留完整数据）
      const selectedTests = allTests.filter(t => exportOptions.tests.includes(t.type));
      
      // 筛选日记（保留完整数据，包括图片）
      let selectedDiaries = [];
      if (exportOptions.diary) {
        selectedDiaries = allDiaries;
      }
      
      // 筛选关系网数据
      let selectedContacts = [];
      if (exportOptions.contacts) {
        selectedContacts = allContacts;
      }
      
      // 构建完整导出数据
      const exportData = {
        tests: selectedTests,
        diary: selectedDiaries,
        contacts: selectedContacts,
        profile: exportOptions.profile ? profile : null,
        exportedAt: Date.now(),
        version: Changelog.currentVersion
      };
      
      // 4. 准备统计信息（用于卡片显示）
      const stats = {
        testCount: selectedTests.length,
        diaryCount: selectedDiaries.length,
        mbtiType: null,
        bigfiveScores: null
      };
      
      const mbtiTest = selectedTests.find(t => t.type === 'mbti');
      if (mbtiTest?.result?.type) {
        stats.mbtiType = mbtiTest.result.type;
      }
      
      const bigfiveTest = selectedTests.find(t => t.type === 'bigfive');
      if (bigfiveTest?.result?.dimensions) {
        stats.bigfiveScores = bigfiveTest.result.dimensions;
      }
      
      // 5. 创建数据卡片图片（仅用于展示，不编码数据）
      const canvas = document.createElement('canvas');
      canvas.width = this.WIDTH;
      canvas.height = this.HEIGHT;
      const ctx = canvas.getContext('2d');
      this.drawCard(ctx, stats, profile, true);
      
      // 6. 生成卡片图片 Blob
      const cardBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      // 7. 压缩和加密数据
      const jsonStr = JSON.stringify(exportData);
      const compressed = LZString.compressToUint8Array(jsonStr);
      const encrypted = await this.encryptWithPassword(compressed, password);
      
      // 8. 创建 ZIP 包
      const zip = new JSZip();
      
      // 添加数据卡片图片
      zip.file('card.png', cardBlob);
      
      // 添加加密数据文件
      zip.file('data.enc', encrypted);
      
      // 添加版本信息（明文，用于兼容性检查）
      zip.file('version.json', JSON.stringify({
        version: Changelog.currentVersion,
        format: 'guanji-v3',
        exportedAt: Date.now()
      }));
      
      // 9. 生成 ZIP 文件
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });
      
      // 10. 下载
      const filename = `观己-${profile.name}-${Utils.formatDate(Date.now(), 'YYYYMMDD-HHmmss')}.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      Utils.showToast('数据包已生成', 'success');
      return true;
      
    } catch (error) {
      console.error('导出数据包失败:', error);
      await Utils.alert(error.message, '导出失败', 'error');
      return false;
    }
  }

  // 其他方法由子模块扩展：
  // - encodeData, decodeData (steganography.js)
  // - showPasswordDialog, submitPassword, closePasswordDialog, togglePasswordVisibility (password-dialog.js)
  // - drawCard, drawCornerDecor, drawStatBox, drawRadarChart, roundRect, adjustAlpha (canvas-renderer.js)
  // - showExportOptionsDialog, toggleAllOptions, submitExportOptions, closeExportOptions (export-options.js)
  // - importFromImage, importFromZip, importFromPng, loadImage (import-parser.js)
};

// 导出到全局
window.DataCard = DataCard;
