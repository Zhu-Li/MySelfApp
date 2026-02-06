/**
 * app.js - 应用入口与初始化
 * 观己 - 静观己心，内外澄明
 */

const App = {
  isUnlocked: false,
  setupStep: 1,

  /**
   * 应用初始化
   */
  async init() {
    try {
      // 初始化存储
      await Storage.init();
      
      // 初始化主题
      await Theme.init();

      // 检查是否需要初始化设置
      const hasPassword = await Storage.hasPassword();
      
      if (!hasPassword) {
        // 首次使用，显示设置向导
        this.hideLoading();
        this.showSetupModal();
      } else {
        // 显示解锁界面
        this.hideLoading();
        this.showUnlockModal();
      }

    } catch (error) {
      console.error('应用初始化失败:', error);
      Utils.showToast('应用初始化失败，请刷新页面重试', 'error');
    }
  },

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = document.getElementById('appLoading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 300);
    }
  },

  /**
   * 显示设置向导
   */
  showSetupModal() {
    this.showModal('setupModal');
    this.setupStep = 1;
    this.updateSetupStep();
  },

  /**
   * 下一步设置
   */
  async nextSetupStep() {
    if (this.setupStep === 2) {
      // 验证密码
      const password = document.getElementById('setupPassword').value;
      const confirm = document.getElementById('setupPasswordConfirm').value;
      
      const validation = Utils.validatePassword(password);
      if (!validation.valid) {
        Utils.showToast(validation.message, 'error');
        return;
      }

      if (password !== confirm) {
        Utils.showToast('两次输入的密码不一致', 'error');
        return;
      }

      // 保存密码
      try {
        await Storage.setPassword(password);
        this.isUnlocked = true;
      } catch (error) {
        Utils.showToast('密码设置失败', 'error');
        return;
      }
    }

    this.setupStep++;
    this.updateSetupStep();
  },

  /**
   * 上一步设置
   */
  prevSetupStep() {
    if (this.setupStep > 1) {
      this.setupStep--;
      this.updateSetupStep();
    }
  },

  /**
   * 更新设置步骤显示
   */
  updateSetupStep() {
    document.querySelectorAll('.setup-step').forEach(step => {
      step.classList.remove('active');
    });
    
    const currentStep = document.querySelector(`.setup-step[data-step="${this.setupStep}"]`);
    if (currentStep) {
      currentStep.classList.add('active');
    }
  },

  /**
   * 完成设置
   */
  async completeSetup() {
    const apiKey = document.getElementById('setupApiKey').value;
    const model = document.getElementById('setupModel').value;

    try {
      // 保存 API 配置
      if (apiKey) {
        await API.setApiKey(apiKey);
      }
      await API.setModel(model);

      // 初始化 API
      await API.init();

      // 隐藏设置模态框
      this.hideModal('setupModal');

      // 注册路由并启动
      this.registerRoutes();
      Router.init();

      Utils.showToast('设置完成，欢迎使用「观己」！', 'success');

    } catch (error) {
      console.error('完成设置失败:', error);
      Utils.showToast('设置保存失败', 'error');
    }
  },

  /**
   * 显示解锁模态框
   */
  showUnlockModal() {
    this.showModal('unlockModal');
    // 聚焦密码输入框
    setTimeout(() => {
      document.getElementById('unlockPassword')?.focus();
    }, 100);
  },

  /**
   * 解锁应用
   */
  async unlock(event) {
    if (event) event.preventDefault();

    const password = document.getElementById('unlockPassword').value;
    if (!password) {
      Utils.showToast('请输入密码', 'error');
      return;
    }

    try {
      const valid = await Storage.verifyPassword(password);
      if (!valid) {
        Utils.showToast('密码错误', 'error');
        document.getElementById('unlockPassword').value = '';
        return;
      }

      // 设置加密密钥
      await Storage.setEncryptionKey(password);
      this.isUnlocked = true;

      // 初始化 API
      await API.init();

      // 隐藏解锁模态框
      this.hideModal('unlockModal');

      // 注册路由并启动
      this.registerRoutes();
      Router.init();

      Utils.showToast('欢迎回来！', 'success');

    } catch (error) {
      console.error('解锁失败:', error);
      Utils.showToast('解锁失败', 'error');
    }
  },

  /**
   * 确认紧急清除
   */
  confirmEmergencyClear() {
    this.showModal('confirmClearModal');
  },

  /**
   * 紧急清除所有数据
   */
  async emergencyClear() {
    const confirmInput = document.getElementById('confirmClearInput').value;
    if (confirmInput !== '确认删除') {
      Utils.showToast('请输入"确认删除"以继续', 'error');
      return;
    }

    try {
      await Storage.clearAll();
      
      // 删除数据库
      indexedDB.deleteDatabase('MySelfApp');

      Utils.showToast('数据已清除', 'success');

      // 刷新页面
      setTimeout(() => {
        location.reload();
      }, 1000);

    } catch (error) {
      console.error('清除数据失败:', error);
      Utils.showToast('清除失败', 'error');
    }
  },

  /**
   * 注册路由
   */
  registerRoutes() {
    Router.registerAll({
      '/': () => this.renderHome(),
      '/test': () => this.renderTestList(),
      '/mbti': () => this.renderMBTI(),
      '/mbti/test': () => this.renderMBTITest(),
      '/report': () => this.renderReportList(),
      '/report/:id': (params) => this.renderReport(params.id),
      '/diary': () => this.renderDiary(),
      '/settings': () => this.renderSettings()
    });

    // 路由守卫：确保已解锁
    Router.beforeEach((to, from) => {
      if (!this.isUnlocked) {
        return false;
      }
      return true;
    });
  },

  /**
   * 渲染首页
   */
  async renderHome() {
    const container = document.getElementById('mainContent');
    const profile = await Storage.getProfile();
    const latestMBTI = await Storage.getLatestTest('mbti');

    let profileCard = '';
    if (latestMBTI && latestMBTI.result) {
      const mbtiType = latestMBTI.result.type;
      profileCard = `
        <div class="card card-hover mb-lg">
          <div class="card-body">
            <div class="flex items-center gap-lg">
              <div class="avatar avatar-xl" style="background-color: ${Utils.getMBTIColor(mbtiType)}20; color: ${Utils.getMBTIColor(mbtiType)};">
                ${mbtiType.charAt(0)}
              </div>
              <div class="flex-1">
                <h3 class="text-primary font-bold" style="font-size: var(--font-size-2xl);">${mbtiType}</h3>
                <p class="text-secondary">${Utils.getMBTIName(mbtiType)}</p>
                <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                  测试于 ${Utils.formatRelativeTime(latestMBTI.timestamp)}
                </p>
              </div>
              <a href="#/report/${latestMBTI.id}" class="btn btn-outline">
                查看报告
              </a>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 欢迎区域 -->
        <div class="hero-section card mb-xl" style="padding: var(--spacing-2xl);">
          <div class="text-center">
            <h1 style="font-size: var(--font-size-3xl); font-weight: 700; margin-bottom: var(--spacing-md);">
              欢迎使用「观己」
            </h1>
            <p class="text-secondary" style="font-size: var(--font-size-lg); max-width: 500px; margin: 0 auto;">
              静观己心，内外澄明。探索真实的自己，了解你的性格特征与内在世界
            </p>
          </div>
        </div>

        <!-- 用户画像卡片 -->
        ${profileCard || `
          <div class="card card-hover mb-lg">
            <div class="card-body">
              <div class="empty-state" style="padding: var(--spacing-xl);">
                <div class="empty-state-icon">🎯</div>
                <h3 class="empty-state-title">开始你的自我探索之旅</h3>
                <p class="empty-state-desc">完成性格测试，生成专属于你的用户画像</p>
                <a href="#/test" class="btn btn-primary btn-lg">开始测试</a>
              </div>
            </div>
          </div>
        `}

        <!-- 快捷入口 -->
        <h2 class="font-semibold mb-md" style="font-size: var(--font-size-xl);">快捷入口</h2>
        <div class="grid grid-cols-3 gap-md mb-xl">
          <a href="#/test" class="card card-hover">
            <div class="card-body text-center">
              <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📝</div>
              <h3 class="font-medium">性格测试</h3>
              <p class="text-secondary" style="font-size: var(--font-size-sm);">了解你的性格类型</p>
            </div>
          </a>
          <a href="#/diary" class="card card-hover">
            <div class="card-body text-center">
              <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📔</div>
              <h3 class="font-medium">个人日记</h3>
              <p class="text-secondary" style="font-size: var(--font-size-sm);">记录日常感受</p>
            </div>
          </a>
          <a href="#/report" class="card card-hover">
            <div class="card-body text-center">
              <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📊</div>
              <h3 class="font-medium">分析报告</h3>
              <p class="text-secondary" style="font-size: var(--font-size-sm);">查看画像报告</p>
            </div>
          </a>
        </div>

        <!-- 统计卡片 -->
        <h2 class="font-semibold mb-md" style="font-size: var(--font-size-xl);">数据概览</h2>
        <div class="grid grid-cols-3 gap-md">
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

    // 加载统计数据
    this.loadHomeStats();
  },

  /**
   * 加载首页统计
   */
  async loadHomeStats() {
    try {
      const tests = await Storage.getAll('tests');
      const diary = await Storage.getAll('diary');
      
      document.getElementById('testCount').textContent = tests.length;
      document.getElementById('diaryCount').textContent = diary.length;
      document.getElementById('reportCount').textContent = tests.filter(t => t.result).length;
    } catch (e) {
      console.error('加载统计失败:', e);
    }
  },

  /**
   * 渲染测试列表
   */
  async renderTestList() {
    const container = document.getElementById('mainContent');
    
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <h1 class="font-bold mb-lg" style="font-size: var(--font-size-2xl);">性格测试</h1>
        <p class="text-secondary mb-xl">选择测试类型，开始探索自己</p>

        <div class="grid grid-cols-2 gap-lg">
          <!-- MBTI 测试 -->
          <div class="card card-hover">
            <div class="card-body">
              <div class="flex items-start gap-md">
                <div style="font-size: 3rem;">🧠</div>
                <div class="flex-1">
                  <h3 class="font-semibold" style="font-size: var(--font-size-lg);">MBTI 性格测试</h3>
                  <p class="text-secondary mt-sm">探索你的16种性格类型，了解内在性格特征</p>
                  <div class="flex items-center gap-sm mt-md">
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

          <!-- 大五人格（待开发） -->
          <div class="card" style="opacity: 0.6;">
            <div class="card-body">
              <div class="flex items-start gap-md">
                <div style="font-size: 3rem;">🌟</div>
                <div class="flex-1">
                  <h3 class="font-semibold" style="font-size: var(--font-size-lg);">大五人格测试</h3>
                  <p class="text-secondary mt-sm">科学测量五大人格特质，全面了解性格维度</p>
                  <div class="flex items-center gap-sm mt-md">
                    <span class="badge badge-warning">即将推出</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-secondary btn-block" disabled>敬请期待</button>
            </div>
          </div>

          <!-- 霍兰德职业兴趣（待开发） -->
          <div class="card" style="opacity: 0.6;">
            <div class="card-body">
              <div class="flex items-start gap-md">
                <div style="font-size: 3rem;">💼</div>
                <div class="flex-1">
                  <h3 class="font-semibold" style="font-size: var(--font-size-lg);">霍兰德职业兴趣测试</h3>
                  <p class="text-secondary mt-sm">发现适合你的职业方向，规划职业发展</p>
                  <div class="flex items-center gap-sm mt-md">
                    <span class="badge badge-warning">即将推出</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-secondary btn-block" disabled>敬请期待</button>
            </div>
          </div>

          <!-- 综合画像（待开发） -->
          <div class="card" style="opacity: 0.6;">
            <div class="card-body">
              <div class="flex items-start gap-md">
                <div style="font-size: 3rem;">🎯</div>
                <div class="flex-1">
                  <h3 class="font-semibold" style="font-size: var(--font-size-lg);">综合画像分析</h3>
                  <p class="text-secondary mt-sm">整合多维度数据，生成完整用户画像</p>
                  <div class="flex items-center gap-sm mt-md">
                    <span class="badge badge-warning">即将推出</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-secondary btn-block" disabled>敬请期待</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染 MBTI 介绍页
   */
  async renderMBTI() {
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
  },

  /**
   * 渲染 MBTI 测试页
   */
  async renderMBTITest() {
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
              <button class="btn btn-ghost" onclick="App.confirmQuitTest()">退出测试</button>
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
  },

  /**
   * 确认退出测试
   */
  async confirmQuitTest() {
    const confirmed = await Utils.confirm('确定要退出测试吗？当前进度将不会保存。');
    if (confirmed) {
      Router.navigate('/mbti');
    }
  },

  /**
   * 渲染报告列表
   */
  async renderReportList() {
    const container = document.getElementById('mainContent');
    const tests = await Storage.getAll('tests');
    
    // 按时间倒序排列
    tests.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <h1 class="font-bold mb-lg" style="font-size: var(--font-size-2xl);">分析报告</h1>
        
        ${tests.length === 0 ? `
          <div class="card">
            <div class="card-body">
              <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3 class="empty-state-title">暂无报告</h3>
                <p class="empty-state-desc">完成测试后，这里会显示你的分析报告</p>
                <a href="#/test" class="btn btn-primary">开始测试</a>
              </div>
            </div>
          </div>
        ` : `
          <div class="grid gap-md">
            ${tests.map(test => `
              <a href="#/report/${test.id}" class="card card-hover">
                <div class="card-body">
                  <div class="flex items-center gap-lg">
                    <div class="avatar avatar-lg" style="background-color: ${test.result ? Utils.getMBTIColor(test.result.type) + '20' : 'var(--bg-tertiary)'}; color: ${test.result ? Utils.getMBTIColor(test.result.type) : 'var(--text-tertiary)'};">
                      ${test.result ? test.result.type.charAt(0) : '?'}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold">
                        ${test.type === 'mbti' ? 'MBTI 性格测试' : test.type}
                        ${test.result ? ` - ${test.result.type}` : ''}
                      </h3>
                      <p class="text-secondary" style="font-size: var(--font-size-sm);">
                        ${Utils.formatDate(test.timestamp, 'YYYY-MM-DD HH:mm')}
                      </p>
                    </div>
                    <span class="badge ${test.result?.aiAnalysis ? 'badge-success' : 'badge-warning'}">
                      ${test.result?.aiAnalysis ? '已分析' : '待分析'}
                    </span>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  /**
   * 渲染报告详情
   */
  async renderReport(id) {
    const container = document.getElementById('mainContent');
    const test = await Storage.get('tests', id);

    if (!test) {
      container.innerHTML = `
        <div class="page-container">
          <div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h2 class="empty-state-title">报告未找到</h2>
            <p class="empty-state-desc">该报告可能已被删除</p>
            <a href="#/report" class="btn btn-primary">返回报告列表</a>
          </div>
        </div>
      `;
      return;
    }

    // 渲染报告
    MBTIReport.render(container, test);
  },

  /**
   * 渲染日记页
   */
  async renderDiary() {
    const container = document.getElementById('mainContent');
    
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="flex items-center justify-between mb-lg">
          <h1 class="font-bold" style="font-size: var(--font-size-2xl);">个人日记</h1>
          <button class="btn btn-primary" onclick="App.showNewDiaryModal()">写日记</button>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <div class="empty-state-icon">📔</div>
              <h3 class="empty-state-title">日记功能即将推出</h3>
              <p class="empty-state-desc">记录你的日常感受，AI 将帮助分析你的情绪变化和思维模式</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染设置页
   */
  async renderSettings() {
    const container = document.getElementById('mainContent');
    const currentTheme = Theme.get();
    const hasApiKey = API.isConfigured();
    const currentModel = API.model;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <h1 class="font-bold mb-lg" style="font-size: var(--font-size-2xl);">设置</h1>

        <!-- 主题设置 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">外观设置</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">主题模式</h4>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">选择浅色或深色主题</p>
              </div>
              <div class="flex gap-sm">
                <button class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="App.setTheme('light')">
                  ☀️ 浅色
                </button>
                <button class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="App.setTheme('dark')">
                  🌙 深色
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- API 设置 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">AI 服务配置</h3>
          </div>
          <div class="card-body">
            <div class="input-group mb-lg">
              <label class="input-label">API 密钥</label>
              <div class="password-input-wrapper">
                <input type="password" class="input-field" id="settingsApiKey" 
                       placeholder="${hasApiKey ? '已配置（输入新密钥以更新）' : '请输入硅基流动 API Key'}">
                <button type="button" class="password-toggle btn btn-ghost btn-sm" 
                        onclick="App.togglePassword('settingsApiKey')">👁️</button>
              </div>
              <span class="input-hint">可在 <a href="https://cloud.siliconflow.cn" target="_blank">硅基流动控制台</a> 获取</span>
            </div>

            <div class="input-group mb-lg">
              <label class="input-label">AI 模型</label>
              <select class="input-field" id="settingsModel">
                <option value="deepseek-ai/DeepSeek-V3" ${currentModel === 'deepseek-ai/DeepSeek-V3' ? 'selected' : ''}>DeepSeek-V3（推荐）</option>
                <option value="deepseek-ai/DeepSeek-V2.5" ${currentModel === 'deepseek-ai/DeepSeek-V2.5' ? 'selected' : ''}>DeepSeek-V2.5</option>
                <option value="Qwen/Qwen2.5-72B-Instruct" ${currentModel === 'Qwen/Qwen2.5-72B-Instruct' ? 'selected' : ''}>Qwen2.5-72B</option>
                <option value="Qwen/Qwen2.5-32B-Instruct" ${currentModel === 'Qwen/Qwen2.5-32B-Instruct' ? 'selected' : ''}>Qwen2.5-32B</option>
              </select>
            </div>

            <div class="flex gap-sm">
              <button class="btn btn-primary" onclick="App.saveApiSettings()">保存配置</button>
              <button class="btn btn-secondary" onclick="App.testApiConnection()">测试连接</button>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">数据管理</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center justify-between mb-lg">
              <div>
                <h4 class="font-medium">导出数据</h4>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">将所有数据导出为 JSON 文件</p>
              </div>
              <button class="btn btn-secondary" onclick="App.exportData()">导出数据</button>
            </div>

            <div class="flex items-center justify-between mb-lg">
              <div>
                <h4 class="font-medium">导入数据</h4>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">从 JSON 文件恢复数据</p>
              </div>
              <div>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="App.importData(event)">
                <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">导入数据</button>
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-danger">清除所有数据</h4>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">永久删除所有本地数据，此操作不可撤销</p>
              </div>
              <button class="btn btn-danger" onclick="App.confirmEmergencyClear()">清除数据</button>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">关于</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-md mb-md">
              <span style="font-size: 2rem;">🔮</span>
              <div>
                <h4 class="font-bold">观己 - 静观己心，内外澄明</h4>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">版本 1.0.0</p>
              </div>
            </div>
            <p class="text-secondary" style="font-size: var(--font-size-sm);">
              帮助你全方位了解自己的性格特征与内在世界，生成个性化用户画像。
            </p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 设置主题
   */
  async setTheme(theme) {
    await Theme.set(theme);
    // 重新渲染设置页以更新按钮状态
    this.renderSettings();
  },

  /**
   * 保存 API 设置
   */
  async saveApiSettings() {
    const apiKey = document.getElementById('settingsApiKey').value;
    const model = document.getElementById('settingsModel').value;

    try {
      if (apiKey) {
        await API.setApiKey(apiKey);
      }
      await API.setModel(model);
      
      Utils.showToast('配置已保存', 'success');
    } catch (error) {
      Utils.showToast('保存失败', 'error');
    }
  },

  /**
   * 测试 API 连接
   */
  async testApiConnection() {
    if (!API.isConfigured()) {
      Utils.showToast('请先配置 API 密钥', 'warning');
      return;
    }

    Utils.showLoading('正在测试连接...');

    try {
      await API.testConnection();
      Utils.hideLoading();
      Utils.showToast('连接成功！', 'success');
    } catch (error) {
      Utils.hideLoading();
      Utils.showToast(`连接失败: ${error.message}`, 'error');
    }
  },

  /**
   * 导出数据
   */
  async exportData() {
    try {
      const data = await Storage.exportAll();
      const json = JSON.stringify(data, null, 2);
      const filename = `myself-backup-${Utils.formatDate(new Date(), 'YYYYMMDD-HHmmss')}.json`;
      Utils.downloadFile(json, filename);
      Utils.showToast('数据导出成功', 'success');
    } catch (error) {
      Utils.showToast('导出失败', 'error');
    }
  },

  /**
   * 导入数据
   */
  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const content = await Utils.readFile(file);
      const data = JSON.parse(content);
      
      const confirmed = await Utils.confirm('导入将覆盖现有数据，确定继续吗？');
      if (!confirmed) return;

      await Storage.importAll(data);
      Utils.showToast('数据导入成功', 'success');
      
      // 刷新页面
      location.reload();
    } catch (error) {
      Utils.showToast('导入失败: 无效的数据格式', 'error');
    }

    // 清空文件选择
    event.target.value = '';
  },

  /**
   * 切换密码显示
   */
  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  /**
   * 显示模态框
   */
  showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
    }
  },

  /**
   * 隐藏模态框
   */
  hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
    }
  }
};

// 绑定主题切换按钮
document.getElementById('themeToggle')?.addEventListener('click', () => {
  Theme.toggle();
});

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出到全局
window.App = App;
