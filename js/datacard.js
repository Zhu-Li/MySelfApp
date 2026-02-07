/**
 * datacard.js - 数据卡片生成与解析模块
 * 观己 - 静观己心，内外澄明
 * 
 * 将用户数据编码到图片中，生成可分享的个人画像卡片
 */

const DataCard = {
  // 卡片尺寸
  WIDTH: 800,
  HEIGHT: 450,
  
  // 数据区域配置（图片底部用于存储数据的像素行数）
  DATA_ROWS: 150,
  
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
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#6B8DD6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // 装饰图案 - 圆形
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(650, 80, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 250, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 主卡片区域
    const cardX = 40;
    const cardY = 30;
    const cardWidth = WIDTH - 80;
    const cardHeight = visibleHeight - 60;
    
    // 卡片背景（半透明白色）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();
    
    // 顶部装饰条
    const headerGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
    headerGradient.addColorStop(0, '#667eea');
    headerGradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = headerGradient;
    this.roundRectTop(ctx, cardX, cardY, cardWidth, 8, 20);
    ctx.fill();
    
    // Logo 和标题
    ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText('🔮 观己 · 个人画像卡', cardX + 30, cardY + 55);
    
    // 分割线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 30, cardY + 75);
    ctx.lineTo(cardX + cardWidth - 30, cardY + 75);
    ctx.stroke();
    
    // MBTI 类型显示
    if (stats.mbtiType) {
      ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#667eea';
      ctx.textAlign = 'center';
      ctx.fillText(stats.mbtiType, WIDTH / 2, cardY + 135);
      
      // MBTI 类型名称
      const mbtiName = Utils.getMBTIName ? Utils.getMBTIName(stats.mbtiType) : '';
      if (mbtiName) {
        ctx.font = '20px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(mbtiName, WIDTH / 2, cardY + 165);
      }
      ctx.textAlign = 'left';
    } else {
      ctx.font = '24px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('尚未完成性格测试', WIDTH / 2, cardY + 140);
      ctx.textAlign = 'left';
    }
    
    // 大五人格条形图（如有数据）
    if (stats.bigfiveScores) {
      const barY = cardY + 190;
      const barHeight = 12;
      const barSpacing = 22;
      const dimensions = [
        { key: 'O', name: '开放性', color: '#8b5cf6' },
        { key: 'C', name: '尽责性', color: '#10b981' },
        { key: 'E', name: '外向性', color: '#f59e0b' },
        { key: 'A', name: '宜人性', color: '#ec4899' },
        { key: 'N', name: '神经质', color: '#6366f1' }
      ];
      
      dimensions.forEach((dim, i) => {
        const y = barY + i * barSpacing;
        const score = stats.bigfiveScores[dim.key] || 0;
        
        // 标签
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(dim.name, cardX + 50, y + 10);
        
        // 背景条
        ctx.fillStyle = '#f0f0f0';
        this.roundRect(ctx, cardX + 110, y, 200, barHeight, 6);
        ctx.fill();
        
        // 进度条
        ctx.fillStyle = dim.color;
        const barWidth = (score / 100) * 200;
        if (barWidth > 0) {
          this.roundRect(ctx, cardX + 110, y, barWidth, barHeight, 6);
          ctx.fill();
        }
        
        // 分数
        ctx.fillStyle = '#333';
        ctx.fillText(`${score}%`, cardX + 320, y + 10);
      });
    }
    
    // 统计信息
    const statsY = cardY + cardHeight - 50;
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`📊 已完成 ${stats.testCount} 项测试`, cardX + 50, statsY);
    ctx.fillText(`📝 ${stats.diaryCount} 篇日记`, cardX + 250, statsY);
    
    // 导出时间
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'right';
    ctx.fillText(`导出时间: ${Utils.formatDate(Date.now(), 'YYYY-MM-DD HH:mm')}`, cardX + cardWidth - 30, statsY);
    ctx.textAlign = 'left';
    
    // 数据存储区域（纯色背景，用于隐藏数据）
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, visibleHeight, WIDTH, DATA_ROWS);
    
    // 底部装饰文字
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('静观己心，内外澄明', WIDTH / 2, HEIGHT - 10);
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
