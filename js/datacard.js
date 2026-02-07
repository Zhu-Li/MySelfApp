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
   * 绘制卡片视觉效果
   */
  drawCard(ctx, stats, profile) {
    const { WIDTH, HEIGHT, DATA_ROWS } = this;
    const visibleHeight = HEIGHT - DATA_ROWS;
    
    // 背景渐变 - 更现代的配色
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // 装饰图案 - 几何形状
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    // 右上角大圆
    ctx.beginPath();
    ctx.arc(720, 50, 150, 0, Math.PI * 2);
    ctx.fill();
    // 左下角圆
    ctx.beginPath();
    ctx.arc(80, visibleHeight - 30, 100, 0, Math.PI * 2);
    ctx.fill();
    // 小装饰圆
    ctx.beginPath();
    ctx.arc(600, visibleHeight - 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 主卡片区域
    const cardX = 30;
    const cardY = 25;
    const cardWidth = WIDTH - 60;
    const cardHeight = visibleHeight - 50;
    
    // 卡片阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    // 卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 16);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // 左侧装饰色条
    const accentGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
    accentGradient.addColorStop(0, '#6366f1');
    accentGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = accentGradient;
    this.roundRectLeft(ctx, cardX, cardY, 6, cardHeight, 16);
    ctx.fill();
    
    // ===== 左侧区域：个人信息 =====
    const leftX = cardX + 35;
    const contentY = cardY + 35;
    
    // Logo 和标题
    ctx.font = 'bold 22px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText('🔮 观己', leftX, contentY);
    
    // 副标题
    ctx.font = '12px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('个人画像数据卡', leftX + 85, contentY);
    
    // MBTI 类型区域
    const mbtiY = contentY + 50;
    
    if (stats.mbtiType) {
      // MBTI 背景框
      ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      this.roundRect(ctx, leftX, mbtiY - 5, 160, 80, 12);
      ctx.fill();
      
      // MBTI 类型
      ctx.font = 'bold 42px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillStyle = '#6366f1';
      ctx.fillText(stats.mbtiType, leftX + 20, mbtiY + 45);
      
      // MBTI 名称
      const mbtiNames = {
        'INTJ': '策略家', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
        'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
        'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
        'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
      };
      ctx.font = '14px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(mbtiNames[stats.mbtiType] || '', leftX + 105, mbtiY + 45);
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      this.roundRect(ctx, leftX, mbtiY - 5, 160, 80, 12);
      ctx.fill();
      
      ctx.font = '16px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('暂无MBTI', leftX + 35, mbtiY + 40);
    }
    
    // 统计数据
    const statsY = mbtiY + 100;
    
    // 测试数量
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    this.roundRect(ctx, leftX, statsY, 75, 55, 10);
    ctx.fill();
    ctx.font = 'bold 24px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(stats.testCount, leftX + 25, statsY + 30);
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('项测试', leftX + 18, statsY + 47);
    
    // 日记数量
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    this.roundRect(ctx, leftX + 85, statsY, 75, 55, 10);
    ctx.fill();
    ctx.font = 'bold 24px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(stats.diaryCount, leftX + 110, statsY + 30);
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('篇日记', leftX + 103, statsY + 47);
    
    // ===== 右侧区域：大五人格 =====
    const rightX = cardX + 220;
    const rightWidth = cardWidth - 250;
    
    // 分割线
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rightX - 20, cardY + 25);
    ctx.lineTo(rightX - 20, cardY + cardHeight - 25);
    ctx.stroke();
    
    // 大五人格标题
    ctx.font = 'bold 15px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText('大五人格特质', rightX, contentY);
    
    if (stats.bigfiveScores) {
      const barY = contentY + 25;
      const barHeight = 18;
      const barSpacing = 40;
      const barMaxWidth = rightWidth - 80;
      
      const dimensions = [
        { key: 'O', name: '开放性', color: '#8b5cf6', desc: '想象力·好奇心' },
        { key: 'C', name: '尽责性', color: '#10b981', desc: '自律·条理性' },
        { key: 'E', name: '外向性', color: '#f59e0b', desc: '社交·活力' },
        { key: 'A', name: '宜人性', color: '#ec4899', desc: '合作·信任' },
        { key: 'N', name: '情绪性', color: '#6366f1', desc: '敏感·情绪波动' }
      ];
      
      dimensions.forEach((dim, i) => {
        const y = barY + i * barSpacing;
        const score = stats.bigfiveScores[dim.key] || 0;
        
        // 维度名称
        ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(dim.name, rightX, y + 12);
        
        // 描述
        ctx.font = '10px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(dim.desc, rightX + 52, y + 12);
        
        // 背景条
        const barStartX = rightX;
        const barActualY = y + 20;
        ctx.fillStyle = '#f1f5f9';
        this.roundRect(ctx, barStartX, barActualY, barMaxWidth, barHeight, 9);
        ctx.fill();
        
        // 进度条
        const barWidth = Math.max(0, (score / 100) * barMaxWidth);
        if (barWidth > 0) {
          const barGradient = ctx.createLinearGradient(barStartX, barActualY, barStartX + barWidth, barActualY);
          barGradient.addColorStop(0, dim.color);
          barGradient.addColorStop(1, this.lightenColor(dim.color, 20));
          ctx.fillStyle = barGradient;
          this.roundRect(ctx, barStartX, barActualY, barWidth, barHeight, 9);
          ctx.fill();
        }
        
        // 分数
        ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = dim.color;
        ctx.textAlign = 'right';
        ctx.fillText(`${score}`, rightX + barMaxWidth + 30, barActualY + 14);
        ctx.textAlign = 'left';
      });
    } else {
      // 无数据提示
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      this.roundRect(ctx, rightX, contentY + 30, rightWidth - 40, 180, 12);
      ctx.fill();
      
      ctx.font = '15px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('完成大五人格测试后', rightX + (rightWidth - 40) / 2, contentY + 110);
      ctx.fillText('将在此展示人格特质', rightX + (rightWidth - 40) / 2, contentY + 135);
      ctx.textAlign = 'left';
    }
    
    // 底部时间戳
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(Utils.formatDate(Date.now(), 'YYYY-MM-DD HH:mm'), cardX + cardWidth - 20, cardY + cardHeight - 15);
    ctx.textAlign = 'left';
    
    // 底部数据存储区域 - 渐变过渡
    const dataGradient = ctx.createLinearGradient(0, visibleHeight - 20, 0, HEIGHT);
    dataGradient.addColorStop(0, '#a855f7');
    dataGradient.addColorStop(0.3, '#8b5cf6');
    dataGradient.addColorStop(1, '#6366f1');
    ctx.fillStyle = dataGradient;
    ctx.fillRect(0, visibleHeight, WIDTH, DATA_ROWS);
    
    // 底部装饰纹理
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(100 * i + 50, visibleHeight + 30, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // 底部slogan
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('静观己心 · 内外澄明', WIDTH / 2, HEIGHT - 8);
    ctx.textAlign = 'left';
  },

  /**
   * 颜色变亮
   */
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R},${G},${B})`;
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
   * 绘制左侧圆角矩形
   */
  roundRectLeft(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  /**
   * 绘制顶部圆角矩形
   */
  roundRectTop(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  /**
   * 将数据编码到图片像素中
   * 使用图片底部区域存储数据
   */
  encodeData(imageData, data) {
    const { width, height } = imageData;
    const { DATA_ROWS, MAGIC } = this;
    
    // 计算可用像素数（底部区域）
    const startY = height - DATA_ROWS;
    const availablePixels = width * DATA_ROWS;
    const availableBytes = availablePixels * 3; // RGB各1字节
    
    // 准备数据：魔数 + 长度 + 实际数据
    const magicBytes = new TextEncoder().encode(MAGIC);
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, data.length, true);
    
    const totalLength = magicBytes.length + lengthBytes.length + data.length;
    
    if (totalLength > availableBytes) {
      console.error(`数据过大: ${totalLength} > ${availableBytes}`);
      return false;
    }
    
    // 合并所有数据
    const allData = new Uint8Array(totalLength);
    allData.set(magicBytes, 0);
    allData.set(lengthBytes, magicBytes.length);
    allData.set(data, magicBytes.length + lengthBytes.length);
    
    // 编码到像素
    let dataIndex = 0;
    for (let y = startY; y < height && dataIndex < allData.length; y++) {
      for (let x = 0; x < width && dataIndex < allData.length; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        // R通道
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex] = allData[dataIndex++];
        }
        // G通道
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex + 1] = allData[dataIndex++];
        }
        // B通道
        if (dataIndex < allData.length) {
          imageData.data[pixelIndex + 2] = allData[dataIndex++];
        }
        // A通道保持255（不透明）
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
    
    // 如果图片尺寸不匹配，尝试从底部读取
    const startY = Math.max(0, height - DATA_ROWS);
    
    // 读取前几个像素获取魔数和长度
    const headerBytes = [];
    const headerLength = MAGIC.length + 4; // 魔数 + 4字节长度
    
    let pixelCount = 0;
    outer: for (let y = startY; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        headerBytes.push(imageData.data[pixelIndex]);     // R
        headerBytes.push(imageData.data[pixelIndex + 1]); // G
        headerBytes.push(imageData.data[pixelIndex + 2]); // B
        
        if (headerBytes.length >= headerLength) {
          break outer;
        }
      }
    }
    
    // 验证魔数
    const magicBytes = new Uint8Array(headerBytes.slice(0, MAGIC.length));
    const magicStr = new TextDecoder().decode(magicBytes);
    
    if (magicStr !== MAGIC) {
      console.error('魔数不匹配:', magicStr);
      return null;
    }
    
    // 读取数据长度
    const lengthBytes = new Uint8Array(headerBytes.slice(MAGIC.length, MAGIC.length + 4));
    const dataLength = new DataView(lengthBytes.buffer).getUint32(0, true);
    
    if (dataLength <= 0 || dataLength > width * height * 3) {
      console.error('数据长度无效:', dataLength);
      return null;
    }
    
    // 读取实际数据
    const totalLength = MAGIC.length + 4 + dataLength;
    const allBytes = [];
    
    outer2: for (let y = startY; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        
        allBytes.push(imageData.data[pixelIndex]);     // R
        allBytes.push(imageData.data[pixelIndex + 1]); // G
        allBytes.push(imageData.data[pixelIndex + 2]); // B
        
        if (allBytes.length >= totalLength) {
          break outer2;
        }
      }
    }
    
    // 提取数据部分
    const dataStart = MAGIC.length + 4;
    const data = new Uint8Array(allBytes.slice(dataStart, dataStart + dataLength));
    
    return data;
  }
};

// 导出到全局
window.DataCard = DataCard;
