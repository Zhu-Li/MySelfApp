/**
 * home-renderer.js - 首页渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：首页渲染、问候语、统计数据
 */

/**
 * 渲染首页
 */
App.renderHome = async function() {
  const container = document.getElementById('mainContent');
  const profile = await Storage.getProfile();
  
  // 获取用户名和问候语
  const userName = profile?.name || '探索者';
  const greeting = this.getTimeGreeting();
  const dailyQuote = this.getDailyQuote();
  
  // 获取打卡统计
  const streakData = await this.getStreakData();
  
  // 获取所有主要测试的最新结果
  const latestMBTI = await Storage.getLatestTest('mbti');
  const latestBigFive = await Storage.getLatestTest('bigfive');
  const latestHolland = await Storage.getLatestTest('holland');
  const latestAttachment = await Storage.getLatestTest('attachment');
  const latestEQ = await Storage.getLatestTest('eq');
  const latestValues = await Storage.getLatestTest('values');
  const latestStress = await Storage.getLatestTest('stress');
  const latestComprehensive = await Storage.getLatestTest('comprehensive');

  // 构建测试结果卡片
  let testResultsHtml = '';
  
  // 综合画像结果（放在最前面）
  if (latestComprehensive) {
    const testCount = Object.values(latestComprehensive.sourceTests || {}).filter(Boolean).length;
    testResultsHtml += `
      <a href="#/report/${latestComprehensive.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #8b5cf620; color: #8b5cf6;">📊</div>
        <div class="test-result-info">
          <div class="test-result-type">综合画像</div>
          <div class="test-result-value" style="color: #8b5cf6;">已生成</div>
          <div class="test-result-name">整合${testCount}项测试</div>
        </div>
      </a>
    `;
  }
  
  // MBTI 结果
  if (latestMBTI?.result?.type) {
    testResultsHtml += `
      <a href="#/report/${latestMBTI.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: ${Utils.getMBTIColor(latestMBTI.result.type)}20; color: ${Utils.getMBTIColor(latestMBTI.result.type)};">
          ${latestMBTI.result.type.charAt(0)}
        </div>
        <div class="test-result-info">
          <div class="test-result-type">MBTI</div>
          <div class="test-result-value" style="color: ${Utils.getMBTIColor(latestMBTI.result.type)};">${latestMBTI.result.type}</div>
          <div class="test-result-name">${Utils.getMBTIName(latestMBTI.result.type)}</div>
        </div>
      </a>
    `;
  }
  
  // 大五人格结果
  if (latestBigFive?.result?.dimensions) {
    const dims = latestBigFive.result.dimensions;
    const topDim = Object.entries(dims).sort((a, b) => b[1] - a[1])[0];
    const dimNames = { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '情绪性' };
    testResultsHtml += `
      <a href="#/report/${latestBigFive.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #8b5cf620; color: #8b5cf6;">⭐</div>
        <div class="test-result-info">
          <div class="test-result-type">大五人格</div>
          <div class="test-result-value" style="color: #8b5cf6;">${topDim[0]}</div>
          <div class="test-result-name">${dimNames[topDim[0]]} ${topDim[1]}%</div>
        </div>
      </a>
    `;
  }
  
  // 霍兰德结果
  if (latestHolland?.result?.hollandCode) {
    testResultsHtml += `
      <a href="#/report/${latestHolland.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #f59e0b20; color: #f59e0b;">💼</div>
        <div class="test-result-info">
          <div class="test-result-type">霍兰德</div>
          <div class="test-result-value" style="color: #f59e0b;">${latestHolland.result.hollandCode}</div>
          <div class="test-result-name">职业兴趣代码</div>
        </div>
      </a>
    `;
  }
  
  // 依恋类型结果
  if (latestAttachment?.result?.typeInfo) {
    testResultsHtml += `
      <a href="#/report/${latestAttachment.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: ${latestAttachment.result.typeInfo.color}20; color: ${latestAttachment.result.typeInfo.color};">${latestAttachment.result.typeInfo.icon}</div>
        <div class="test-result-info">
          <div class="test-result-type">依恋类型</div>
          <div class="test-result-value" style="color: ${latestAttachment.result.typeInfo.color};">${latestAttachment.result.typeInfo.name}</div>
          <div class="test-result-name">亲密关系模式</div>
        </div>
      </a>
    `;
  }
  
  // 情商结果
  if (latestEQ?.result?.overallScore !== undefined) {
    const eqLevel = latestEQ.result.overallScore >= 80 ? '优秀' : latestEQ.result.overallScore >= 60 ? '良好' : '待提升';
    testResultsHtml += `
      <a href="#/report/${latestEQ.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #10b98120; color: #10b981;">💡</div>
        <div class="test-result-info">
          <div class="test-result-type">情商</div>
          <div class="test-result-value" style="color: #10b981;">${latestEQ.result.overallScore}</div>
          <div class="test-result-name">${eqLevel}</div>
        </div>
      </a>
    `;
  }
  
  // 价值观结果
  if (latestValues?.result?.coreValues?.length > 0) {
    const topValue = latestValues.result.coreValues[0];
    testResultsHtml += `
      <a href="#/report/${latestValues.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #ec489920; color: #ec4899;">🎯</div>
        <div class="test-result-info">
          <div class="test-result-type">价值观</div>
          <div class="test-result-value" style="color: #ec4899;">${topValue.dimension}</div>
          <div class="test-result-name">核心价值</div>
        </div>
      </a>
    `;
  }
  
  // 心理健康结果
  if (latestStress?.result) {
    const anxietyLevel = latestStress.result.anxietyLevel?.name || '正常';
    testResultsHtml += `
      <a href="#/report/${latestStress.id}" class="test-result-item">
        <div class="test-result-icon" style="background-color: #06b6d420; color: #06b6d4;">🌱</div>
        <div class="test-result-info">
          <div class="test-result-type">心理健康</div>
          <div class="test-result-value" style="color: #06b6d4;">${anxietyLevel}</div>
          <div class="test-result-name">焦虑状态</div>
        </div>
      </a>
    `;
  }

  // 如果没有任何测试结果，显示引导
  const hasAnyTest = testResultsHtml !== '';

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <!-- 个性化问候区域 -->
      <div class="greeting-section mb-lg">
        <div class="greeting-main">
          <span class="greeting-emoji">👋</span>
          <div class="greeting-text">
            <div class="greeting-hello">${greeting}，${userName}</div>
            <div class="greeting-subtitle">今天也要好好认识自己哦</div>
          </div>
        </div>
        
        <!-- 打卡统计 -->
        <div class="streak-badges">
          <div class="streak-badge">
            <span class="streak-icon">🔥</span>
            <span class="streak-value">${streakData.streak}</span>
            <span class="streak-label">连续天数</span>
          </div>
          <div class="streak-badge">
            <span class="streak-icon">📔</span>
            <span class="streak-value">${streakData.weeklyDiary}</span>
            <span class="streak-label">本周日记</span>
          </div>
          <div class="streak-badge">
            <span class="streak-icon">✨</span>
            <span class="streak-value">${streakData.totalTests}</span>
            <span class="streak-label">完成测试</span>
          </div>
        </div>
      </div>

      <!-- 今日语录卡片 -->
      <div class="quote-card card mb-lg">
        <div class="quote-content">
          <span class="quote-icon">💭</span>
          <p class="quote-text">${dailyQuote.text}</p>
          <span class="quote-author">—— ${dailyQuote.author}</span>
        </div>
      </div>

      <!-- 测试结果概览 -->
      ${hasAnyTest ? `
        <h2 class="section-title">我的画像</h2>
        <div class="test-results-grid mb-xl">
          ${testResultsHtml}
        </div>
      ` : `
        <div class="card card-hover mb-lg">
          <div class="card-body">
            <div class="empty-state" style="padding: var(--spacing-lg);">
              <div class="empty-state-icon">🎯</div>
              <h3 class="empty-state-title">开始你的自我探索之旅</h3>
              <p class="empty-state-desc">完成性格测试，生成专属于你的用户画像</p>
              <a href="#/test" class="btn btn-primary">开始测试</a>
            </div>
          </div>
        </div>
      `}

      <!-- 快捷入口 -->
      <h2 class="section-title">快捷入口</h2>
      <div class="quick-entry-grid mb-xl">
        <a href="#/test" class="card card-hover quick-entry-card">
          <div class="card-body text-center">
            <div class="quick-entry-icon">📝</div>
            <h3 class="quick-entry-title">性格测试</h3>
            <p class="quick-entry-desc">了解你的性格类型</p>
          </div>
        </a>
        <a href="#/diary" class="card card-hover quick-entry-card">
          <div class="card-body text-center">
            <div class="quick-entry-icon">📔</div>
            <h3 class="quick-entry-title">个人日记</h3>
            <p class="quick-entry-desc">记录日常感受</p>
          </div>
        </a>
        <a href="#/chat" class="card card-hover quick-entry-card">
          <div class="card-body text-center">
            <div class="quick-entry-icon">🤖</div>
            <h3 class="quick-entry-title">AI 问答</h3>
            <p class="quick-entry-desc">有问必答</p>
          </div>
        </a>
      </div>

      <!-- 统计卡片 -->
      <h2 class="section-title">数据概览</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">📝</div>
          <div class="stat-value" id="testCount">-</div>
          <div class="stat-label">已完成测试</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">📔</div>
          <div class="stat-value" id="diaryCount">-</div>
          <div class="stat-label">日记条目</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">📊</div>
          <div class="stat-value" id="reportCount">-</div>
          <div class="stat-label">分析报告</div>
        </div>
      </div>
    </div>
  `;

  // 添加首页样式
  this.addHomeStyles();

  // 加载统计数据
  this.loadHomeStats();
};

/**
 * 添加首页样式
 */
App.addHomeStyles = function() {
  if (document.getElementById('home-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'home-styles';
  style.textContent = `
    /* 问候区域样式 */
    .greeting-section {
      background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
      border-radius: var(--radius-xl);
      padding: var(--spacing-lg);
      color: white;
    }
    .greeting-main {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }
    .greeting-emoji {
      font-size: 2.5rem;
    }
    .greeting-hello {
      font-size: var(--font-size-xl);
      font-weight: 700;
    }
    .greeting-subtitle {
      font-size: var(--font-size-sm);
      opacity: 0.9;
      margin-top: var(--spacing-xs);
    }
    .streak-badges {
      display: flex;
      gap: var(--spacing-sm);
    }
    .streak-badge {
      flex: 1;
      background: rgba(255,255,255,0.15);
      border-radius: var(--radius-lg);
      padding: var(--spacing-sm) var(--spacing-md);
      text-align: center;
      backdrop-filter: blur(10px);
    }
    .streak-icon {
      display: block;
      font-size: 1.25rem;
      margin-bottom: 2px;
    }
    .streak-value {
      display: block;
      font-size: var(--font-size-xl);
      font-weight: 700;
    }
    .streak-label {
      display: block;
      font-size: var(--font-size-xs);
      opacity: 0.85;
    }
    
    /* 今日语录卡片 */
    .quote-card {
      background: var(--bg-card);
      border-left: 4px solid var(--color-primary);
    }
    .quote-content {
      padding: var(--spacing-md) var(--spacing-lg);
      position: relative;
    }
    .quote-icon {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-md);
      font-size: 1.5rem;
      opacity: 0.3;
    }
    .quote-text {
      font-size: var(--font-size-base);
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: var(--spacing-sm);
      font-style: italic;
    }
    .quote-author {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }
    
    .section-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      margin-bottom: var(--spacing-md);
    }
    
    /* 测试结果网格 */
    .test-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-md);
    }
    .test-result-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-lg) var(--spacing-md);
      background-color: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .test-result-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .test-result-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
    }
    .test-result-info {
      text-align: center;
    }
    .test-result-type {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      margin-bottom: 2px;
    }
    .test-result-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin-bottom: 2px;
    }
    .test-result-name {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
    
    .quick-entry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
    }
    .quick-entry-icon {
      font-size: 2rem;
      margin-bottom: var(--spacing-sm);
    }
    .quick-entry-title {
      font-size: var(--font-size-base);
      font-weight: 500;
    }
    .quick-entry-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
    }
    @media (max-width: 768px) {
      .greeting-section {
        padding: var(--spacing-md);
      }
      .greeting-emoji {
        font-size: 2rem;
      }
      .greeting-hello {
        font-size: var(--font-size-lg);
      }
      .streak-badge {
        padding: var(--spacing-xs) var(--spacing-sm);
      }
      .streak-value {
        font-size: var(--font-size-lg);
      }
      .quote-text {
        font-size: var(--font-size-sm);
      }
      .test-results-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-sm);
      }
      .test-result-item {
        padding: var(--spacing-md) var(--spacing-sm);
      }
      .test-result-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
      .test-result-value {
        font-size: var(--font-size-lg);
      }
      .quick-entry-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-sm);
      }
      .quick-entry-icon {
        font-size: 1.75rem;
      }
      .quick-entry-title {
        font-size: var(--font-size-sm);
      }
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-sm);
      }
    }
    @media (max-width: 480px) {
      .test-results-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .test-result-name {
        display: none;
      }
      .quick-entry-icon {
        font-size: 1.5rem;
      }
      .quick-entry-title {
        font-size: var(--font-size-xs);
      }
      .quick-entry-desc {
        display: none;
      }
      .quick-entry-card .card-body {
        padding: var(--spacing-sm);
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * 获取时段问候语
 * @returns {string} 问候语
 */
App.getTimeGreeting = function() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 22) return '晚上好';
  return '夜深了';
};

/**
 * 获取每日语录
 * @returns {Object} 语录对象 {text, author}
 */
App.getDailyQuote = function() {
  const quotes = [
    { text: '认识你自己，这是一切智慧的开端。', author: '苏格拉底' },
    { text: '人最难认识的是自己，最重要的也是认识自己。', author: '老子' },
    { text: '我们的性格即我们的命运。', author: '赫拉克利特' },
    { text: '真正的勇气是认识自己，接纳自己。', author: '卡尔·荣格' },
    { text: '每个人都是自己故事的主角。', author: '阿德勒' },
    { text: '了解自己是走向成功的第一步。', author: '亚里士多德' },
    { text: '性格决定命运，习惯决定性格。', author: '威廉·詹姆斯' },
    { text: '向内看，去发现你自己的宝藏。', author: '鲁米' },
    { text: '成为你自己，因为别人都有人做了。', author: '王尔德' },
    { text: '内心的平静来自对自己的接纳。', author: '埃克哈特·托利' },
    { text: '你的潜能是无限的，只需要去发现。', author: '马斯洛' },
    { text: '每一天都是认识自己的新机会。', author: '观己' },
    { text: '情绪是了解内心的窗口。', author: '丹尼尔·戈尔曼' },
    { text: '接受自己的不完美，才能真正成长。', author: '布芮尼·布朗' }
  ];
  // 根据日期选择语录，每天固定
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
};

/**
 * 获取打卡统计数据
 * @returns {Promise<Object>} 打卡数据 {streak, weeklyDiary, totalTests}
 */
App.getStreakData = async function() {
  try {
    const diary = await Storage.getAll('diary') || [];
    const tests = await Storage.getAll('tests') || [];
    
    // 计算连续使用天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 获取所有有活动的日期
    const activityDates = new Set();
    diary.forEach(d => {
      const date = new Date(d.timestamp);
      date.setHours(0, 0, 0, 0);
      activityDates.add(date.getTime());
    });
    tests.forEach(t => {
      const date = new Date(t.timestamp);
      date.setHours(0, 0, 0, 0);
      activityDates.add(date.getTime());
    });
    
    // 计算连续天数（如果今天没有活动，从昨天开始算）
    let streak = 0;
    let checkDate = new Date(today);
    
    // 如果今天没有活动记录，从昨天开始检查
    if (!activityDates.has(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (activityDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // 计算本周日记数（周一为一周开始）
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    // 周日是0，需要特殊处理：周日时往前推6天到周一
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(today.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weeklyDiary = diary.filter(d => {
      const diaryDate = new Date(d.timestamp);
      return diaryDate >= weekStart;
    }).length;
    
    return {
      streak: streak || 0,
      weeklyDiary,
      totalTests: tests.length
    };
  } catch (e) {
    console.error('获取打卡数据失败:', e);
    return { streak: 0, weeklyDiary: 0, totalTests: 0 };
  }
};

/**
 * 加载首页统计
 */
App.loadHomeStats = async function() {
  try {
    const tests = await Storage.getAll('tests');
    const diary = await Storage.getAll('diary');
    
    document.getElementById('testCount').textContent = tests.length;
    document.getElementById('diaryCount').textContent = diary.length;
    document.getElementById('reportCount').textContent = tests.filter(t => t.result).length;
  } catch (e) {
    console.error('加载统计失败:', e);
  }
};
