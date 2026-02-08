/**
 * canvas-renderer.js - 数据卡片画布绘制模块
 * 观己 - 静观己心，内外澄明
 * 
 * 负责绘制数据卡片的视觉效果
 */

/**
 * 绘制卡片视觉效果 - 科技风格
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文
 * @param {Object} stats - 统计数据
 * @param {Object} profile - 用户资料
 * @param {boolean} isEncrypted - 是否为加密版本
 */
DataCard.drawCard = function(ctx, stats, profile, isEncrypted = false) {
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
  const contentHeight = HEIGHT - DATA_ROWS - contentY - 50;
  const leftWidth = 240;
  const dividerX = cardX + leftWidth + 15;
  
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
};

/**
 * 调整颜色透明度
 * @param {string} hex - 十六进制颜色
 * @param {number} alpha - 透明度 0-1
 * @returns {string} RGBA 颜色字符串
 */
DataCard.adjustAlpha = function(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 绘制角落装饰
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 */
DataCard.drawCornerDecor = function(ctx, x, y, width, height) {
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
};

/**
 * 绘制统计数据框
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} value - 数值
 * @param {string} label - 标签
 * @param {string} color - 颜色
 */
DataCard.drawStatBox = function(ctx, x, y, value, label, color) {
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
};

/**
 * 绘制雷达图
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} centerX - 中心 X 坐标
 * @param {number} centerY - 中心 Y 坐标
 * @param {number} radius - 半径
 * @param {Object} scores - 各维度分数
 */
DataCard.drawRadarChart = function(ctx, centerX, centerY, radius, scores) {
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
};

/**
 * 绘制圆角矩形
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number} radius - 圆角半径
 */
DataCard.roundRect = function(ctx, x, y, width, height, radius) {
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
};
