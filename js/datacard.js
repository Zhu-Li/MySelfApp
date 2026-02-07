/**
 * datacard.js - 数据卡片生成与解析模块
 * 观己 - 静观己心，内外澄明
 * 
 * 将用户数据编码到图片中，生成可分享的个人画像卡片
 */

const DataCard = {
  // 卡片尺寸
  WIDTH: 800,
  HEIGHT: 400,
  
  // 数据区域配置（图片底部用于存储数据的像素行数）
  DATA_ROWS: 60,
  
  // 魔数标识（用于识别有效的数据卡片）
  MAGIC: 'GUANJI',

  /**
   * 导出数据为图片
   */
  async exportAsImage() {
    try {
      // 1. 获取所有数据
      const exportData = await Storage.exportAll();
      const profile = await Storage.getProfile();
      const tests = await Storage.getAll('tests');
      const diaries = await Storage.getAll('diary');
      
      // 2. 准备统计信息
      const stats = {
        testCount: tests?.length || 0,
        diaryCount: diaries?.length || 0,
        mbtiType: null,
        bigfiveScores: null
      };
      
      // 获取最新的MBTI结果
      const mbtiTest = tests?.find(t => t.type === 'mbti');
      if (mbtiTest?.result?.type) {
        stats.mbtiType = mbtiTest.result.type;
      }
      
      // 获取大五人格分数
      const bigfiveTest = tests?.find(t => t.type === 'bigfive');
      if (bigfiveTest?.result?.dimensions) {
        stats.bigfiveScores = bigfiveTest.result.dimensions;
      }
      
      // 3. 创建Canvas
      const canvas = document.createElement('canvas');
      canvas.width = this.WIDTH;
      canvas.height = this.HEIGHT;
      const ctx = canvas.getContext('2d');
      
      // 4. 绘制卡片视觉效果
      this.drawCard(ctx, stats, profile);
      
      // 5. 压缩数据
      const jsonStr = JSON.stringify(exportData);
      const compressed = LZString.compressToUint8Array(jsonStr);
      
      // 6. 将数据编码到图片底部像素
      const imageData = ctx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
      const success = this.encodeData(imageData, compressed);
      
      if (!success) {
        throw new Error('数据量过大，无法编码到图片中');
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 7. 导出为PNG
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const filename = `guanji-card-${Utils.formatDate(Date.now(), 'YYYYMMDD-HHmmss')}.png`;
      
      // 下载文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      Utils.showToast('数据卡片已生成', 'success');
      return true;
      
    } catch (error) {
      console.error('导出数据卡片失败:', error);
      Utils.showToast('导出失败: ' + error.message, 'error');
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
      
      // 4. 解码数据
      const compressed = this.decodeData(imageData);
      if (!compressed) {
        throw new Error('无法识别的图片格式，请确保是观己数据卡片');
      }
      
      // 5. 解压数据
      const jsonStr = LZString.decompressFromUint8Array(compressed);
      if (!jsonStr) {
        throw new Error('数据解压失败');
      }
      
      // 6. 解析JSON
      const data = JSON.parse(jsonStr);
      
      // 7. 确认导入
      const confirmed = await Utils.confirm(
        '检测到有效的数据卡片，导入将覆盖现有数据，确定继续吗？'
      );
      
      if (!confirmed) return false;
      
      // 8. 导入数据
      await Storage.importAll(data);
      
      Utils.showToast('数据导入成功，即将刷新页面', 'success');
      setTimeout(() => location.reload(), 1500);
      
      return true;
      
    } catch (error) {
      console.error('导入数据卡片失败:', error);
      Utils.showToast('导入失败: ' + error.message, 'error');
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
  drawCard(ctx, stats, profile) {
    const { WIDTH, HEIGHT, DATA_ROWS } = this;
    
    // ===== 深色科技背景 =====
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#0d1025');
    bgGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // ===== 网格背景 =====
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    for (let x = 0; x < WIDTH; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    
    // ===== 发光装饰 =====
    const glow1 = ctx.createRadialGradient(700, 80, 0, 700, 80, 180);
    glow1.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    glow1.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
    glow1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(520, 0, 280, 260);
    
    const glow2 = ctx.createRadialGradient(100, HEIGHT - 80, 0, 100, HEIGHT - 80, 150);
    glow2.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    glow2.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
    glow2.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, HEIGHT - 230, 250, 230);
    
    // ===== 电路板装饰 =====
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(40, 60);
    ctx.lineTo(60, 40);
    ctx.lineTo(120, 40);
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(120, 40, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.beginPath();
    ctx.moveTo(WIDTH, HEIGHT - 60);
    ctx.lineTo(WIDTH - 60, HEIGHT - 60);
    ctx.lineTo(WIDTH - 80, HEIGHT - 80);
    ctx.lineTo(WIDTH - 140, HEIGHT - 80);
    ctx.stroke();
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(WIDTH - 140, HEIGHT - 80, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== 主内容区域 =====
    const cardX = 30;
    const cardY = 25;
    const cardWidth = WIDTH - 60;
    const cardHeight = HEIGHT - 50;
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 12);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    this.roundRect(ctx, cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2, 11);
    ctx.fill();
    
    this.drawCornerDecor(ctx, cardX, cardY, cardWidth, cardHeight);
    
    // ===== 头部区域 =====
    const headerY = cardY + 20;
    
    ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#e0e7ff';
    ctx.fillText('🔮 观己', cardX + 25, headerY + 5);
    
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PERSONAL PROFILE CARD', cardX + 85, headerY + 5);
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cardX + cardWidth - 40, headerY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('ACTIVE', cardX + cardWidth - 32, headerY + 4);
    
    const lineGradient = ctx.createLinearGradient(cardX + 25, 0, cardX + cardWidth - 25, 0);
    lineGradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
    lineGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.5)');
    lineGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 25, headerY + 20);
    ctx.lineTo(cardX + cardWidth - 25, headerY + 20);
    ctx.stroke();
    
    // ===== 左侧：MBTI =====
    const leftX = cardX + 30;
    const contentY = headerY + 45;
    
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('◆ PERSONALITY TYPE', leftX, contentY);
    
    if (stats.mbtiType) {
      ctx.font = 'bold 52px "Consolas", monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;
      ctx.fillText(stats.mbtiType, leftX, contentY + 60);
      ctx.shadowBlur = 0;
      
      const mbtiNames = {
        'INTJ': '策略家 Architect', 'INTP': '逻辑学家 Logician',
        'ENTJ': '指挥官 Commander', 'ENTP': '辩论家 Debater',
        'INFJ': '提倡者 Advocate', 'INFP': '调停者 Mediator',
        'ENFJ': '主人公 Protagonist', 'ENFP': '竞选者 Campaigner',
        'ISTJ': '物流师 Logistician', 'ISFJ': '守卫者 Defender',
        'ESTJ': '总经理 Executive', 'ESFJ': '执政官 Consul',
        'ISTP': '鉴赏家 Virtuoso', 'ISFP': '探险家 Adventurer',
        'ESTP': '企业家 Entrepreneur', 'ESFP': '表演者 Entertainer'
      };
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(mbtiNames[stats.mbtiType] || '', leftX, contentY + 80);
    } else {
      ctx.font = 'bold 28px "Consolas", monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText('----', leftX, contentY + 55);
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('未完成测试', leftX, contentY + 75);
    }
    
    // ===== 统计数据 =====
    const statsY = contentY + 110;
    this.drawStatBox(ctx, leftX, statsY, stats.testCount, '测试', '#8b5cf6');
    this.drawStatBox(ctx, leftX + 90, statsY, stats.diaryCount, '日记', '#06b6d4');
    
    // ===== 右侧：大五人格 =====
    const rightX = cardX + 240;
    
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('◆ BIG FIVE PERSONALITY', rightX, contentY);
    
    if (stats.bigfiveScores) {
      this.drawRadarChart(ctx, rightX + 150, contentY + 90, 70, stats.bigfiveScores);
      
      const dimensions = [
        { key: 'O', name: '开放性' },
        { key: 'C', name: '尽责性' },
        { key: 'E', name: '外向性' },
        { key: 'A', name: '宜人性' },
        { key: 'N', name: '情绪性' }
      ];
      
      const listX = rightX + 260;
      dimensions.forEach((dim, i) => {
        const y = contentY + 30 + i * 32;
        const score = stats.bigfiveScores[dim.key] || 0;
        
        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(dim.name, listX, y);
        
        ctx.font = 'bold 18px "Consolas", monospace';
        ctx.fillStyle = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
        ctx.textAlign = 'right';
        ctx.fillText(score.toString().padStart(2, '0'), listX + 90, y + 2);
        ctx.textAlign = 'left';
      });
    } else {
      this.drawRadarChart(ctx, rightX + 150, contentY + 90, 70, null);
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('完成大五人格测试', rightX + 150, contentY + 170);
      ctx.fillText('解锁人格分析', rightX + 150, contentY + 185);
      ctx.textAlign = 'left';
    }
    
    // ===== 底部信息 =====
    const footerY = cardY + cardHeight - 25;
    ctx.font = '10px "Consolas", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('EXPORTED: ' + Utils.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'), cardX + 25, footerY);
    ctx.textAlign = 'right';
    ctx.fillText('v' + (typeof Changelog !== 'undefined' ? Changelog.currentVersion : '1.5.0'), cardX + cardWidth - 25, footerY);
    ctx.textAlign = 'left';
    
    // ===== 数据存储区域（融入设计） =====
    const dataY = HEIGHT - DATA_ROWS;
    
    // 扫描线效果
    for (let y = dataY; y < HEIGHT; y += 3) {
      const alpha = 0.03 + (y - dataY) / DATA_ROWS * 0.05;
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    
    // 底部渐变
    const bottomGradient = ctx.createLinearGradient(0, dataY - 20, 0, HEIGHT);
    bottomGradient.addColorStop(0, 'rgba(10, 10, 26, 0)');
    bottomGradient.addColorStop(0.3, 'rgba(10, 10, 26, 0.5)');
    bottomGradient.addColorStop(1, 'rgba(10, 10, 26, 0.8)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, dataY - 20, WIDTH, DATA_ROWS + 20);
    
    // 装饰性二进制
    ctx.font = '8px "Consolas", monospace';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    const binary = '01001001 01001110 01000110 01001111';
    for (let i = 0; i < 4; i++) {
      ctx.fillText(binary, 20 + i * 200, HEIGHT - 15);
    }
    
    // 底部品牌
    ctx.font = '9px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('静观己心 · 内外澄明', WIDTH / 2, HEIGHT - 5);
    ctx.textAlign = 'left';
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
  encodeData(imageData, data) {
    const { width, height } = imageData;
    const { DATA_ROWS, MAGIC } = this;
    
    const startY = height - DATA_ROWS;
    const availablePixels = width * DATA_ROWS;
    const availableBytes = availablePixels * 3;
    
    const magicBytes = new TextEncoder().encode(MAGIC);
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
    const { DATA_ROWS, MAGIC } = this;
    
    const startY = Math.max(0, height - DATA_ROWS);
    
    const headerBytes = [];
    const headerLength = MAGIC.length + 4;
    
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
    
    const magicBytes = new Uint8Array(headerBytes.slice(0, MAGIC.length));
    const magicStr = new TextDecoder().decode(magicBytes);
    
    if (magicStr !== MAGIC) {
      console.error('魔数不匹配:', magicStr);
      return null;
    }
    
    const lengthBytes = new Uint8Array(headerBytes.slice(MAGIC.length, MAGIC.length + 4));
    const dataLength = new DataView(lengthBytes.buffer).getUint32(0, true);
    
    if (dataLength <= 0 || dataLength > width * height * 3) {
      console.error('数据长度无效:', dataLength);
      return null;
    }
    
    const totalLength = MAGIC.length + 4 + dataLength;
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
    
    const dataStart = MAGIC.length + 4;
    const data = new Uint8Array(allBytes.slice(dataStart, dataStart + dataLength));
    
    return data;
  }
};

// 导出到全局
window.DataCard = DataCard;
