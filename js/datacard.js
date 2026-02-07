/**
 * datacard.js - 数据卡片生成与解析模块
 * 观己 - 静观己心，内外澄明
 * 
 * 将用户数据编码到图片中，生成可分享的个人画像卡片
 * 支持 AES-256-GCM 加密和 HMAC-SHA256 签名防篡改
 */

const DataCard = {
  // 卡片尺寸
  WIDTH: 800,
  HEIGHT: 450,
  
  // 数据区域配置（图片底部用于存储数据的像素行数）
  DATA_ROWS: 50,
  
  // 魔数标识（用于识别有效的数据卡片）
  MAGIC: 'GUANJIV2', // V2 表示加密版本
  
  // 旧版魔数（兼容未加密版本）
  MAGIC_V1: 'GUANJI',

  /**
   * 从密码派生加密密钥和签名密钥
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

  /**
   * 显示密码输入弹窗
   */
  showPasswordDialog(title, message, isExport = true) {
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
  },

  /**
   * 切换密码可见性
   */
  togglePasswordVisibility(inputId = 'cardPassword') {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  /**
   * 提交密码
   */
  submitPassword() {
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
  },

  /**
   * 关闭密码弹窗
   */
  closePasswordDialog(password) {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
    
    if (this._passwordResolve) {
      this._passwordResolve(password);
      this._passwordResolve = null;
    }
  },

  /**
   * 导出数据为加密图片
   */
  async exportAsImage() {
    try {
      // 1. 获取密码
      const password = await this.showPasswordDialog(
        '设置加密密码',
        '为数据卡片设置密码，防止他人读取您的数据。'
      );
      
      if (!password) {
        return false; // 用户取消
      }
      
      Utils.showToast('正在生成加密数据卡片...', 'info');
      
      // 2. 获取所有数据
      const exportData = await Storage.exportAll();
      const profile = await Storage.getProfile();
      const tests = await Storage.getAll('tests');
      const diaries = await Storage.getAll('diary');
      
      // 3. 准备统计信息
      const stats = {
        testCount: tests?.length || 0,
        diaryCount: diaries?.length || 0,
        mbtiType: null,
        bigfiveScores: null
      };
      
      const mbtiTest = tests?.find(t => t.type === 'mbti');
      if (mbtiTest?.result?.type) {
        stats.mbtiType = mbtiTest.result.type;
      }
      
      const bigfiveTest = tests?.find(t => t.type === 'bigfive');
      if (bigfiveTest?.result?.dimensions) {
        stats.bigfiveScores = bigfiveTest.result.dimensions;
      }
      
      // 4. 创建Canvas
      const canvas = document.createElement('canvas');
      canvas.width = this.WIDTH;
      canvas.height = this.HEIGHT;
      const ctx = canvas.getContext('2d');
      
      // 5. 绘制卡片视觉效果
      this.drawCard(ctx, stats, profile, true); // true 表示加密版本
      
      // 6. 压缩数据
      const jsonStr = JSON.stringify(exportData);
      const compressed = LZString.compressToUint8Array(jsonStr);
      
      // 7. 加密数据
      const encrypted = await this.encryptWithPassword(compressed, password);
      
      // 8. 将数据编码到图片底部像素
      const imageData = ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
      const success = this.encodeData(imageData, encrypted, true); // true 表示加密版本
      
      if (!success) {
        throw new Error('数据量过大，无法编码到图片中');
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 9. 导出为PNG
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const filename = `guanji-card-${Utils.formatDate(Date.now(), 'YYYYMMDD-HHmmss')}.png`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      Utils.showToast('加密数据卡片已生成', 'success');
      return true;
      
    } catch (error) {
      console.error('导出数据卡片失败:', error);
      await Utils.alert(error.message, '导出失败', 'error');
      return false;
    }
  },

  /**
   * 从图片导入数据
   */
  async importFromImage(file) {
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
        
        Utils.showToast('正在验证和解密...', 'info');
        
        try {
          decompressed = await this.decryptWithPassword(encodedData, password);
        } catch (e) {
          if (e.message.includes('篡改')) {
            throw e;
          }
          throw new Error('密码错误或数据已损坏');
        }
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
      const confirmed = await Utils.confirm(
        `检测到有效的数据卡片${isEncrypted ? '（已验证签名）' : ''}，导入将覆盖现有数据，确定继续吗？`
      );
      
      if (!confirmed) return false;
      
      // 9. 导入数据
      await Storage.importAll(data);
      
      Utils.showToast('数据导入成功，即将刷新页面', 'success');
      setTimeout(() => location.reload(), 1500);
      
      return true;
      
    } catch (error) {
      console.error('导入数据卡片失败:', error);
      await Utils.alert(error.message, '导入失败', 'error');
      return false;
    }
  },

  /**
   * 加载图片文件
   */
  loadImage(file) {
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
  },

  /**
   * 绘制卡片视觉效果 - 科技风格
   */
  drawCard(ctx, stats, profile, isEncrypted = false) {
    const { WIDTH, HEIGHT, DATA_ROWS } = this;
    
    // ===== 深色科技背景 =====
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#0d1025');
    bgGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // ===== 网格背景 =====
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < HEIGHT; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    for (let x = 0; x < WIDTH; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    
    // ===== 发光装饰 =====
    const glow1 = ctx.createRadialGradient(680, 60, 0, 680, 60, 150);
    glow1.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    glow1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(530, 0, 270, 200);
    
    const glow2 = ctx.createRadialGradient(120, HEIGHT - 60, 0, 120, HEIGHT - 60, 120);
    glow2.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
    glow2.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, HEIGHT - 180, 240, 180);
    
    // ===== 电路板装饰 =====
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(30, 50);
    ctx.lineTo(45, 35);
    ctx.lineTo(90, 35);
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(90, 35, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.beginPath();
    ctx.moveTo(WIDTH, HEIGHT - 50);
    ctx.lineTo(WIDTH - 50, HEIGHT - 50);
    ctx.lineTo(WIDTH - 65, HEIGHT - 65);
    ctx.lineTo(WIDTH - 110, HEIGHT - 65);
    ctx.stroke();
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(WIDTH - 110, HEIGHT - 65, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== 主内容区域 =====
    const cardX = 25;
    const cardY = 20;
    const cardWidth = WIDTH - 50;
    const cardHeight = HEIGHT - 40;
    
    // 边框
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 10);
    ctx.stroke();
    
    // 背景
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    this.roundRect(ctx, cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2, 9);
    ctx.fill();
    
    // 角落装饰
    this.drawCornerDecor(ctx, cardX, cardY, cardWidth, cardHeight);
    
    // ===== 头部区域 =====
    const headerY = cardY + 18;
    
    ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText('🔮 观己', cardX + 20, headerY + 3);
    
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PERSONAL PROFILE CARD', cardX + 78, headerY + 3);
    
    // 加密状态
    if (isEncrypted) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cardX + cardWidth - 80, headerY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '9px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('🔒 ENCRYPTED', cardX + cardWidth - 73, headerY + 3);
    }
    
    // 分割线
    const lineGradient = ctx.createLinearGradient(cardX + 20, 0, cardX + cardWidth - 20, 0);
    lineGradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
    lineGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)');
    lineGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.strokeStyle = lineGradient;
    ctx.beginPath();
    ctx.moveTo(cardX + 20, headerY + 18);
    ctx.lineTo(cardX + cardWidth - 20, headerY + 18);
    ctx.stroke();
    
    // ===== 内容区域 =====
    const contentY = headerY + 35;
    const contentHeight = HEIGHT - DATA_ROWS - contentY - 50; // 可用内容高度
    const leftWidth = 240;  // 左侧区域宽度
    const dividerX = cardX + leftWidth + 15;  // 分割线位置
    
    // ===== 左侧：MBTI + 统计 =====
    const leftX = cardX + 25;
    
    ctx.font = '9px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('◆ PERSONALITY TYPE', leftX, contentY);
    
    if (stats.mbtiType) {
      // MBTI 类型
      ctx.font = 'bold 44px "Consolas", monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillText(stats.mbtiType, leftX, contentY + 50);
      ctx.shadowBlur = 0;
      
      // MBTI 名称
      const mbtiNames = {
        'INTJ': '策略家', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
        'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
        'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
        'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
      };
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(mbtiNames[stats.mbtiType] || '', leftX, contentY + 68);
    } else {
      ctx.font = 'bold 24px "Consolas", monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText('----', leftX, contentY + 45);
      ctx.font = '10px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('未完成测试', leftX, contentY + 65);
    }
    
    // 统计数据
    const statsY = contentY + 100;
    this.drawStatBox(ctx, leftX, statsY, stats.testCount, '测试', '#8b5cf6');
    this.drawStatBox(ctx, leftX + 90, statsY, stats.diaryCount, '日记', '#06b6d4');
    
    // ===== 垂直分割线 =====
    const dividerGradient = ctx.createLinearGradient(0, contentY - 10, 0, contentY + 200);
    dividerGradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
    dividerGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
    dividerGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.strokeStyle = dividerGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dividerX, contentY - 10);
    ctx.lineTo(dividerX, contentY + 200);
    ctx.stroke();
    
    // ===== 右侧：大五人格 =====
    const rightX = dividerX + 20;
    const rightWidth = cardWidth - leftWidth - 55;
    
    ctx.font = '9px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('◆ BIG FIVE PERSONALITY', rightX, contentY);
    
    if (stats.bigfiveScores) {
      const dimensions = [
        { key: 'O', name: '开放性', fullName: 'Openness', color: '#8b5cf6' },
        { key: 'C', name: '尽责性', fullName: 'Conscientiousness', color: '#10b981' },
        { key: 'E', name: '外向性', fullName: 'Extraversion', color: '#f59e0b' },
        { key: 'A', name: '宜人性', fullName: 'Agreeableness', color: '#ec4899' },
        { key: 'N', name: '情绪性', fullName: 'Neuroticism', color: '#6366f1' }
      ];
      
      const barStartY = contentY + 25;
      const barHeight = 16;
      const barSpacing = 35;
      const barMaxWidth = rightWidth - 90;
      
      dimensions.forEach((dim, i) => {
        const y = barStartY + i * barSpacing;
        const score = stats.bigfiveScores[dim.key] || 0;
        
        // 维度标签
        ctx.font = 'bold 12px "Consolas", monospace';
        ctx.fillStyle = dim.color;
        ctx.fillText(dim.key, rightX, y + 12);
        
        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(dim.name, rightX + 20, y + 12);
        
        // 进度条背景
        const barX = rightX + 70;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this.roundRect(ctx, barX, y, barMaxWidth, barHeight, 4);
        ctx.fill();
        
        // 进度条边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        this.roundRect(ctx, barX, y, barMaxWidth, barHeight, 4);
        ctx.stroke();
        
        // 进度条填充
        const barWidth = Math.max(0, (score / 100) * barMaxWidth);
        if (barWidth > 0) {
          const barGradient = ctx.createLinearGradient(barX, y, barX + barWidth, y);
          barGradient.addColorStop(0, dim.color);
          barGradient.addColorStop(1, this.adjustAlpha(dim.color, 0.5));
          ctx.fillStyle = barGradient;
          this.roundRect(ctx, barX, y, barWidth, barHeight, 4);
          ctx.fill();
          
          // 发光效果
          ctx.shadowColor = dim.color;
          ctx.shadowBlur = 6;
          this.roundRect(ctx, barX, y, barWidth, barHeight, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        // 分数
        ctx.font = 'bold 12px "Consolas", monospace';
        ctx.fillStyle = '#e0e7ff';
        ctx.textAlign = 'right';
        ctx.fillText(score.toString(), barX + barMaxWidth + 30, y + 12);
        ctx.textAlign = 'left';
      });
    } else {
      // 无数据状态
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      this.roundRect(ctx, rightX, contentY + 25, rightWidth - 30, 170, 8);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, rightX, contentY + 25, rightWidth - 30, 170, 8);
      ctx.stroke();
      
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('完成大五人格测试', rightX + (rightWidth - 30) / 2, contentY + 100);
      ctx.fillText('解锁人格特质分析', rightX + (rightWidth - 30) / 2, contentY + 125);
      ctx.textAlign = 'left';
    }
    
    // ===== 底部信息 =====
    const footerY = HEIGHT - DATA_ROWS - 25;
    ctx.font = '9px "Consolas", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('EXPORTED: ' + Utils.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'), cardX + 20, footerY);
    ctx.textAlign = 'right';
    ctx.fillText('v' + (typeof Changelog !== 'undefined' ? Changelog.currentVersion : '1.6.2'), cardX + cardWidth - 20, footerY);
    ctx.textAlign = 'left';
    
    // ===== 数据存储区域 =====
    const dataY = HEIGHT - DATA_ROWS;
    
    // 扫描线效果
    for (let y = dataY; y < HEIGHT; y += 4) {
      const alpha = 0.02 + (y - dataY) / DATA_ROWS * 0.04;
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    
    // 底部渐变
    const bottomGradient = ctx.createLinearGradient(0, dataY - 15, 0, HEIGHT);
    bottomGradient.addColorStop(0, 'rgba(10, 10, 26, 0)');
    bottomGradient.addColorStop(0.4, 'rgba(10, 10, 26, 0.6)');
    bottomGradient.addColorStop(1, 'rgba(10, 10, 26, 0.9)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, dataY - 15, WIDTH, DATA_ROWS + 15);
    
    // 底部文字
    ctx.font = '8px "Consolas", monospace';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    const binary = isEncrypted ? 'AES-256-GCM · HMAC-SHA256 · ENCRYPTED' : '01001111 01001011';
    ctx.textAlign = 'center';
    ctx.fillText(binary, WIDTH / 2, HEIGHT - 18);
    
    ctx.font = '8px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fillText('静观己心 · 内外澄明', WIDTH / 2, HEIGHT - 6);
    ctx.textAlign = 'left';
  },

  /**
   * 调整颜色透明度
   */
  adjustAlpha(hex, alpha) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * 绘制角落装饰
   */
  drawCornerDecor(ctx, x, y, width, height) {
    const size = 15;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - size, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y + height - size);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + size, y + height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - size, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - size);
    ctx.stroke();
  },

  /**
   * 绘制统计数据框
   */
  drawStatBox(ctx, x, y, value, label, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 75, 50);
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 8, 2);
    ctx.fillRect(x, y, 2, 8);
    ctx.fillRect(x + 67, y + 48, 8, 2);
    ctx.fillRect(x + 73, y + 42, 2, 8);
    
    ctx.font = 'bold 24px "Consolas", monospace';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(value.toString().padStart(2, '0'), x + 10, y + 30);
    ctx.shadowBlur = 0;
    
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(label, x + 45, y + 30);
  },

  /**
   * 绘制雷达图
   */
  drawRadarChart(ctx, centerX, centerY, radius, scores) {
    const dimensions = ['O', 'C', 'E', 'A', 'N'];
    const angleStep = (Math.PI * 2) / 5;
    const startAngle = -Math.PI / 2;
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    
    for (let r = radius; r > 0; r -= radius / 4) {
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        const angle = startAngle + i * angleStep;
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.stroke();
    }
    
    if (scores) {
      ctx.beginPath();
      dimensions.forEach((dim, i) => {
        const score = (scores[dim] || 0) / 100;
        const angle = startAngle + i * angleStep;
        const px = centerX + Math.cos(angle) * radius * score;
        const py = centerY + Math.sin(angle) * radius * score;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.fill();
      
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      dimensions.forEach((dim, i) => {
        const score = (scores[dim] || 0) / 100;
        const angle = startAngle + i * angleStep;
        const px = centerX + Math.cos(angle) * radius * score;
        const py = centerY + Math.sin(angle) * radius * score;
        
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      });
    }
    
    const labels = ['O', 'C', 'E', 'A', 'N'];
    ctx.font = 'bold 10px "Consolas", monospace';
    ctx.fillStyle = '#8b5cf6';
    ctx.textAlign = 'center';
    
    labels.forEach((label, i) => {
      const angle = startAngle + i * angleStep;
      const px = centerX + Math.cos(angle) * (radius + 15);
      const py = centerY + Math.sin(angle) * (radius + 15) + 4;
      ctx.fillText(label, px, py);
    });
    
    ctx.textAlign = 'left';
  },

  /**
   * 绘制圆角矩形
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  /**
   * 将数据编码到图片像素中
   */
  encodeData(imageData, data, isEncrypted = false) {
    const { width, height } = imageData;
    const { DATA_ROWS, MAGIC, MAGIC_V1 } = this;
    const magic = isEncrypted ? MAGIC : MAGIC_V1;
    
    const startY = height - DATA_ROWS;
    const availablePixels = width * DATA_ROWS;
    const availableBytes = availablePixels * 3;
    
    const magicBytes = new TextEncoder().encode(magic);
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, data.length, true);
    
    const totalLength = magicBytes.length + lengthBytes.length + data.length;
    
    if (totalLength > availableBytes) {
      console.error(`数据过大: ${totalLength} > ${availableBytes}`);
      return false;
    }
    
    const allData = new Uint8Array(totalLength);
    allData.set(magicBytes, 0);
    allData.set(lengthBytes, magicBytes.length);
    allData.set(data, magicBytes.length + lengthBytes.length);
    
    let dataIndex = 0;
    for (let y = startY; y < height && dataIndex < allData.length; y++) {
      for (let x = 0; x < width && dataIndex < allData.length; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex] = allData[dataIndex++];
        }
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex + 1] = allData[dataIndex++];
        }
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex + 2] = allData[dataIndex++];
        }
        imageData.data[pixelIndex + 3] = 255;
      }
    }
    
    return true;
  },

  /**
   * 从图片像素中解码数据
   */
  decodeData(imageData) {
    const { width, height } = imageData;
    const { DATA_ROWS, MAGIC, MAGIC_V1 } = this;
    
    const startY = Math.max(0, height - DATA_ROWS);
    
    // 读取足够的字节来检测魔数
    const maxMagicLength = Math.max(MAGIC.length, MAGIC_V1.length);
    const headerBytes = [];
    const headerLength = maxMagicLength + 4;
    
    outer: for (let y = startY; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        headerBytes.push(imageData.data[pixelIndex]);
        headerBytes.push(imageData.data[pixelIndex + 1]);
        headerBytes.push(imageData.data[pixelIndex + 2]);
        
        if (headerBytes.length >= headerLength) {
          break outer;
        }
      }
    }
    
    // 检测版本
    let isEncrypted = false;
    let magicLength = 0;
    
    // 先检测 V2 (加密版本)
    const magicV2Bytes = new Uint8Array(headerBytes.slice(0, MAGIC.length));
    const magicV2Str = new TextDecoder().decode(magicV2Bytes);
    
    if (magicV2Str === MAGIC) {
      isEncrypted = true;
      magicLength = MAGIC.length;
    } else {
      // 检测 V1 (未加密版本)
      const magicV1Bytes = new Uint8Array(headerBytes.slice(0, MAGIC_V1.length));
      const magicV1Str = new TextDecoder().decode(magicV1Bytes);
      
      if (magicV1Str === MAGIC_V1) {
        isEncrypted = false;
        magicLength = MAGIC_V1.length;
      } else {
        console.error('魔数不匹配');
        return { data: null, isEncrypted: false };
      }
    }
    
    // 读取数据长度
    const lengthBytes = new Uint8Array(headerBytes.slice(magicLength, magicLength + 4));
    const dataLength = new DataView(lengthBytes.buffer).getUint32(0, true);
    
    if (dataLength <= 0 || dataLength > width * height * 3) {
      console.error('数据长度无效:', dataLength);
      return { data: null, isEncrypted: false };
    }
    
    // 读取实际数据
    const totalLength = magicLength + 4 + dataLength;
    const allBytes = [];
    
    outer2: for (let y = startY; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        allBytes.push(imageData.data[pixelIndex]);
        allBytes.push(imageData.data[pixelIndex + 1]);
        allBytes.push(imageData.data[pixelIndex + 2]);
        
        if (allBytes.length >= totalLength) {
          break outer2;
        }
      }
    }
    
    const dataStart = magicLength + 4;
    const data = new Uint8Array(allBytes.slice(dataStart, dataStart + dataLength));
    
    return { data, isEncrypted };
  }
};

// 导出到全局
window.DataCard = DataCard;
