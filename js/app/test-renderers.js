/**
 * test-renderers.js - 测试页面渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：测试列表、各测试介绍页、测试页面渲染
 */

/**
 * 渲染测试列表
 */
App.renderTestList = async function() {
  const container = document.getElementById('mainContent');
  
  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <h1 class="page-title">性格测试</h1>
      <p class="page-subtitle">选择测试类型，开始探索自己</p>

      <div class="test-list">
        <!-- MBTI 测试 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">🧠</div>
              <div class="test-card-info">
                <h3 class="test-card-title">MBTI 性格测试</h3>
                <p class="test-card-desc">探索你的16种性格类型，了解内在性格特征</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">70道题</span>
                  <span class="badge badge-success">约10分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/mbti" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 大五人格 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">🌟</div>
              <div class="test-card-info">
                <h3 class="test-card-title">大五人格测试</h3>
                <p class="test-card-desc">科学测量五大人格特质，全面了解性格维度</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">50道题</span>
                  <span class="badge badge-success">约8分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/bigfive" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 霍兰德职业兴趣 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">💼</div>
              <div class="test-card-info">
                <h3 class="test-card-title">霍兰德职业兴趣测试</h3>
                <p class="test-card-desc">发现适合你的职业方向，规划职业发展</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">60道题</span>
                  <span class="badge badge-success">约10分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/holland" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 依恋类型测试 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">💞</div>
              <div class="test-card-info">
                <h3 class="test-card-title">依恋类型测试</h3>
                <p class="test-card-desc">了解你在亲密关系中的依恋模式</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">30道题</span>
                  <span class="badge badge-success">约5分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/attachment" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 情商测试 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">🧠</div>
              <div class="test-card-info">
                <h3 class="test-card-title">情商测试</h3>
                <p class="test-card-desc">评估情绪智力，提升人际交往能力</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">40道题</span>
                  <span class="badge badge-success">约8分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/eq" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 价值观测试 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">💎</div>
              <div class="test-card-info">
                <h3 class="test-card-title">价值观测试</h3>
                <p class="test-card-desc">发现你的核心价值观，指引人生方向</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">30道题</span>
                  <span class="badge badge-success">约5分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/values" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 心理健康自测 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">🧘</div>
              <div class="test-card-info">
                <h3 class="test-card-title">心理健康自测</h3>
                <p class="test-card-desc">GAD-7 + PHQ-9 国际标准量表</p>
                <div class="test-card-badges">
                  <span class="badge badge-info">16道题</span>
                  <span class="badge badge-success">约3分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/stress" class="btn btn-primary btn-block">开始测试</a>
          </div>
        </div>

        <!-- 综合画像 -->
        <div class="card card-hover test-card">
          <div class="card-body">
            <div class="test-card-content">
              <div class="test-card-icon">🎨</div>
              <div class="test-card-info">
                <h3 class="test-card-title">综合画像分析</h3>
                <p class="test-card-desc">整合多维度测试结果，生成专属用户画像</p>
                <div class="test-card-badges">
                  <span class="badge badge-warning">需完成基础测试</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a href="#/comprehensive" class="btn btn-primary btn-block">查看画像</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // 添加测试列表样式
  this.addTestListStyles();
};

/**
 * 添加测试列表样式
 */
App.addTestListStyles = function() {
  if (document.getElementById('test-list-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'test-list-styles';
  style.textContent = `
    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xl);
    }
    .test-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }
    .test-card-content {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
    }
    .test-card-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }
    .test-card-info {
      flex: 1;
      min-width: 0;
    }
    .test-card-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
    }
    .test-card-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
      line-height: 1.5;
    }
    .test-card-badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }
    @media (max-width: 768px) {
      .page-title {
        font-size: var(--font-size-xl);
      }
      .page-subtitle {
        font-size: var(--font-size-sm);
        margin-bottom: var(--spacing-lg);
      }
      .test-list {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
      .test-card-icon {
        font-size: 2rem;
      }
      .test-card-title {
        font-size: var(--font-size-base);
      }
      .test-card-desc {
        font-size: var(--font-size-xs);
      }
    }
    @media (max-width: 480px) {
      .test-card-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .test-card-badges {
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * 确认退出测试
 * @param {string} returnPath - 返回路径
 */
App.confirmQuitTest = async function(returnPath = '/test') {
  const confirmed = await Utils.confirm('确定要退出测试吗？当前进度将不会保存。');
  if (confirmed) {
    Router.navigate(returnPath);
  }
};

/**
 * 渲染综合分析页
 */
App.renderComprehensive = async function() {
  const container = document.getElementById('mainContent');
  await Comprehensive.renderPage(container);
};

// ============ MBTI 测试 ============

/**
 * 渲染 MBTI 介绍页
 */
App.renderMBTI = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('mbti');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧠</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">MBTI 性格测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              MBTI（迈尔斯-布里格斯类型指标）是世界上应用最广泛的性格测试之一，
              帮助你了解自己的性格类型、优势和发展方向。
            </p>
          </div>

          <div class="grid grid-cols-4 gap-md mb-xl">
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-2xl);">E/I</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">外向/内向</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-2xl);">S/N</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">感觉/直觉</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-2xl);">T/F</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">思考/情感</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-2xl);">J/P</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">判断/知觉</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 70 道题目，预计用时 10-15 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)} · 结果：${latestTest.result?.type || '-'}
                </p>
              ` : ''}
            </div>
            <a href="#/mbti/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-lg">
              <div class="avatar avatar-xl" style="background-color: ${Utils.getMBTIColor(latestTest.result.type)}20; color: ${Utils.getMBTIColor(latestTest.result.type)};">
                ${latestTest.result.type}
              </div>
              <div class="flex-1">
                <h3 class="font-bold" style="font-size: var(--font-size-xl);">${latestTest.result.type} - ${Utils.getMBTIName(latestTest.result.type)}</h3>
                <div class="bar-chart mt-lg">
                  ${Object.entries({
                    'E/I': [latestTest.result.dimensions.E, latestTest.result.dimensions.I],
                    'S/N': [latestTest.result.dimensions.S, latestTest.result.dimensions.N],
                    'T/F': [latestTest.result.dimensions.T, latestTest.result.dimensions.F],
                    'J/P': [latestTest.result.dimensions.J, latestTest.result.dimensions.P]
                  }).map(([dim, [a, b]]) => `
                    <div class="bar-item">
                      <div class="bar-label">
                        <span class="bar-label-text">${dim.split('/')[0]} ${a}%</span>
                        <span class="bar-label-value">${dim.split('/')[1]} ${b}%</span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill bar-fill-primary" style="width: ${a}%;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染 MBTI 测试页
 */
App.renderMBTITest = async function() {
  const container = document.getElementById('mainContent');
  
  // 初始化 MBTI 模块
  MBTI.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">MBTI 性格测试</h2>
              <p class="card-subtitle" id="mbtiProgress">第 1 题 / 共 ${MBTI.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/mbti')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="mbtiProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="mbtiQuestionArea">
          <!-- 题目内容由 JS 动态渲染 -->
        </div>
      </div>
    </div>
  `;

  // 渲染第一题
  MBTI.renderQuestion();
};

// ============ 大五人格测试 ============

/**
 * 渲染大五人格介绍页
 */
App.renderBigFive = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('bigfive');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🌟</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">大五人格测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              大五人格模型 (Big Five / OCEAN) 是心理学中最受认可的人格理论之一，
              通过五个维度全面评估你的人格特质。
            </p>
          </div>

          <div class="grid grid-cols-5 gap-md mb-xl">
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-xl);">O</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">开放性</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-xl);">C</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">尽责性</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-xl);">E</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">外向性</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-xl);">A</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">宜人性</div>
            </div>
            <div class="text-center p-md">
              <div class="font-bold text-primary" style="font-size: var(--font-size-xl);">N</div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">神经质</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 50 道题目，预计用时 8-10 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                </p>
              ` : ''}
            </div>
            <a href="#/bigfive/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果</h3>
          </div>
          <div class="card-body">
            <div class="bar-chart">
              ${Object.entries(latestTest.result.dimensions).map(([dim, score]) => {
                const names = { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质' };
                return `
                  <div class="bar-item">
                    <div class="bar-label">
                      <span class="bar-label-text">${names[dim]}</span>
                      <span class="bar-label-value">${score}%</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill bar-fill-primary" style="width: ${score}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="text-center mt-lg">
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染大五人格测试页
 */
App.renderBigFiveTest = async function() {
  const container = document.getElementById('mainContent');
  
  BigFive.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">大五人格测试</h2>
              <p class="card-subtitle" id="bigfiveProgress">第 1 题 / 共 ${BigFive.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/bigfive')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="bigfiveProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="bigfiveQuestionArea">
        </div>
      </div>
    </div>
  `;

  BigFive.renderQuestion();
};

// ============ 霍兰德测试 ============

/**
 * 渲染霍兰德介绍页
 */
App.renderHolland = async function() {
  const container = document.getElementById('mainContent');
  const latestTest = await Storage.getLatestTest('holland');

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-xl">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center mb-xl">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💼</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">霍兰德职业兴趣测试</h1>
            <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
              霍兰德职业兴趣理论将人的职业兴趣分为六种类型，帮助你发现最适合的职业方向。
            </p>
          </div>

          <div class="grid grid-cols-6 gap-sm mb-xl">
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">🔧</div>
              <div class="font-bold" style="color: #ef4444;">R</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">实际型</div>
            </div>
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">🔬</div>
              <div class="font-bold" style="color: #3b82f6;">I</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">研究型</div>
            </div>
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">🎨</div>
              <div class="font-bold" style="color: #a855f7;">A</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">艺术型</div>
            </div>
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">🤝</div>
              <div class="font-bold" style="color: #22c55e;">S</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">社会型</div>
            </div>
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">💼</div>
              <div class="font-bold" style="color: #f59e0b;">E</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">企业型</div>
            </div>
            <div class="text-center p-sm">
              <div style="font-size: 1.5rem;">📊</div>
              <div class="font-bold" style="color: #6366f1;">C</div>
              <div class="text-secondary" style="font-size: var(--font-size-xs);">常规型</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-secondary">共 60 道题目，预计用时 10-12 分钟</p>
              ${latestTest ? `
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  上次测试：${Utils.formatRelativeTime(latestTest.timestamp)} · 代码：${latestTest.result?.hollandCode || '-'}
                </p>
              ` : ''}
            </div>
            <a href="#/holland/test" class="btn btn-primary btn-lg">
              ${latestTest ? '重新测试' : '开始测试'}
            </a>
          </div>
        </div>
      </div>

      ${latestTest && latestTest.result ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">上次测试结果 - ${latestTest.result.hollandCode}</h3>
          </div>
          <div class="card-body">
            <div class="bar-chart">
              ${Object.entries(latestTest.result.dimensions).map(([dim, score]) => {
                const info = Holland.dimensions[dim];
                return `
                  <div class="bar-item">
                    <div class="bar-label">
                      <span class="bar-label-text">${info.icon} ${info.name}</span>
                      <span class="bar-label-value">${score}%</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: ${score}%; background-color: ${info.color};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="text-center mt-lg">
              <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * 渲染霍兰德测试页
 */
App.renderHollandTest = async function() {
  const container = document.getElementById('mainContent');
  
  Holland.init();

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title">霍兰德职业兴趣测试</h2>
              <p class="card-subtitle" id="hollandProgress">第 1 题 / 共 ${Holland.questions.length} 题</p>
            </div>
            <button class="btn btn-outline" onclick="App.confirmQuitTest('/holland')">退出测试</button>
          </div>
          <div class="progress mt-md">
            <div class="progress-bar" id="hollandProgressBar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="card-body" id="hollandQuestionArea">
        </div>
      </div>
    </div>
  `;

  Holland.renderQuestion();
};
