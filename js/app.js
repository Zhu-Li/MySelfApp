/**
 * app.js - 应用入口与初始化
 * 观己 - 静观己心，内外澄明
 */

// 抑制浏览器扩展导致的 runtime.lastError 错误
// 这些错误来自扩展程序尝试与页面通信，不影响应用功能
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const originalSendMessage = chrome.runtime.sendMessage;
  if (originalSendMessage) {
    chrome.runtime.sendMessage = function(...args) {
      try {
        return originalSendMessage.apply(this, args);
      } catch (e) {
        // 静默处理扩展通信错误
      }
    };
  }
}

// 全局错误处理：过滤扩展相关错误
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Could not establish connection') ||
      event.reason?.message?.includes('Receiving end does not exist')) {
    event.preventDefault();
  }
});

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
        // 尝试恢复会话
        const sessionRestored = await Storage.restoreSession();
        
        if (sessionRestored) {
          // 会话恢复成功，直接进入应用
          this.isUnlocked = true;
          this.hideLoading();
          await this.initAfterUnlock();
        } else {
          // 显示解锁界面
          this.hideLoading();
          this.showUnlockModal();
        }
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
   * 会话恢复后的初始化
   */
  async initAfterUnlock() {
    // 初始化 API
    await API.init();

    // 注册路由并启动
    this.registerRoutes();
    Router.init();

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
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
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
      
      // 创建会话
      await Storage.createSession(password, rememberMe);
      
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
      '/bigfive': () => this.renderBigFive(),
      '/bigfive/test': () => this.renderBigFiveTest(),
      '/holland': () => this.renderHolland(),
      '/holland/test': () => this.renderHollandTest(),
      '/attachment': () => this.renderAttachment(),
      '/attachment/test': () => this.renderAttachmentTest(),
      '/eq': () => this.renderEQ(),
      '/eq/test': () => this.renderEQTest(),
      '/values': () => this.renderValues(),
      '/values/test': () => this.renderValuesTest(),
      '/stress': () => this.renderStress(),
      '/stress/test': () => this.renderStressTest(),
      '/comprehensive': () => this.renderComprehensive(),
      '/report': () => this.renderReportList(),
      '/report/:id': (params) => this.renderReport(params.id),
      '/diary': () => this.renderDiary(),
      '/diary/new': () => this.renderDiaryEditor(),
      '/diary/edit/:id': (params) => this.renderDiaryEditor(params.id),
      '/diary/:id': (params) => this.renderDiaryDetail(params.id),
      '/chat': () => this.renderChat(),
      '/donate': () => this.renderDonate(),
      '/feedback': () => this.renderFeedback(),
      '/changelog': () => this.renderChangelog(),
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
        <div class="hero-section card mb-xl" style="padding: var(--spacing-xl);">
          <div class="text-center">
            <h1 class="home-title">
              欢迎使用「观己」
            </h1>
            <p class="text-secondary home-subtitle">
              静观己心，内外澄明。探索真实的自己，了解你的性格特征与内在世界
            </p>
          </div>
        </div>

        <!-- 用户画像卡片 -->
        ${profileCard || `
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
          <a href="#/report" class="card card-hover quick-entry-card">
            <div class="card-body text-center">
              <div class="quick-entry-icon">📊</div>
              <h3 class="quick-entry-title">分析报告</h3>
              <p class="quick-entry-desc">查看画像报告</p>
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
      <style>
        .home-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--spacing-md);
        }
        .home-subtitle {
          font-size: var(--font-size-base);
          max-width: 500px;
          margin: 0 auto;
        }
        .section-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--spacing-md);
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
          .home-title {
            font-size: var(--font-size-xl);
          }
          .home-subtitle {
            font-size: var(--font-size-sm);
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
          .home-title {
            font-size: var(--font-size-lg);
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
      </style>
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
      <style>
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
      </style>
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
  },

  /**
   * 渲染大五人格介绍页
   */
  async renderBigFive() {
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
  },

  /**
   * 渲染大五人格测试页
   */
  async renderBigFiveTest() {
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
  },

  /**
   * 渲染霍兰德介绍页
   */
  async renderHolland() {
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
  },

  /**
   * 渲染霍兰德测试页
   */
  async renderHollandTest() {
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
  },

  /**
   * 渲染综合分析页
   */
  async renderComprehensive() {
    const container = document.getElementById('mainContent');
    await Comprehensive.renderPage(container);
  },

  /**
   * 确认退出测试
   */
  async confirmQuitTest(returnPath = '/test') {
    const confirmed = await Utils.confirm('确定要退出测试吗？当前进度将不会保存。');
    if (confirmed) {
      Router.navigate(returnPath);
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

    // 测试类型映射
    const testTypeInfo = {
      mbti: { name: 'MBTI 性格测试', icon: '🧠', color: '#6366f1' },
      bigfive: { name: '大五人格测试', icon: '🌟', color: '#8b5cf6' },
      holland: { name: '霍兰德职业兴趣', icon: '💼', color: '#f59e0b' },
      comprehensive: { name: '综合画像分析', icon: '🎯', color: '#10b981' }
    };

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
            ${tests.map(test => {
              const info = testTypeInfo[test.type] || { name: test.type, icon: '📝', color: '#6b7280' };
              let resultText = '';
              if (test.type === 'mbti' && test.result?.type) {
                resultText = test.result.type;
              } else if (test.type === 'holland' && test.result?.hollandCode) {
                resultText = test.result.hollandCode;
              }
              
              return `
                <a href="#/report/${test.id}" class="card card-hover">
                  <div class="card-body">
                    <div class="flex items-center gap-lg">
                      <div class="avatar avatar-lg" style="background-color: ${info.color}20; font-size: 1.5rem;">
                        ${info.icon}
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold">
                          ${info.name}${resultText ? ` - ${resultText}` : ''}
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
              `;
            }).join('')}
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

    // 根据测试类型渲染不同报告
    switch (test.type) {
      case 'mbti':
        MBTIReport.render(container, test);
        break;
      case 'bigfive':
        BigFiveReport.render(container, test);
        break;
      case 'holland':
        HollandReport.render(container, test);
        break;
      case 'attachment':
        AttachmentReport.render(container, test);
        break;
      case 'eq':
        EQReport.render(container, test);
        break;
      case 'values':
        ValuesReport.render(container, test);
        break;
      case 'stress':
        StressReport.render(container, test);
        break;
      case 'comprehensive':
        Comprehensive.renderReport(container, test);
        break;
      default:
        container.innerHTML = `
          <div class="page-container">
            <div class="empty-state">
              <div class="empty-state-icon">❓</div>
              <h2 class="empty-state-title">未知报告类型</h2>
              <p class="empty-state-desc">无法识别的报告类型: ${test.type}</p>
              <a href="#/report" class="btn btn-primary">返回报告列表</a>
            </div>
          </div>
        `;
    }
  },

  /**
   * 渲染日记页
   */
  async renderDiary() {
    const container = document.getElementById('mainContent');
    await Diary.renderList(container);
  },

  /**
   * 渲染日记编辑器
   */
  async renderDiaryEditor(id = null) {
    const container = document.getElementById('mainContent');
    await Diary.renderEditor(container, id);
  },

  /**
   * 渲染日记详情
   */
  async renderDiaryDetail(id) {
    const container = document.getElementById('mainContent');
    await Diary.renderDetail(container, id);
  },

  /**
   * 渲染打赏页面
   */
  renderDonate() {
    const container = document.getElementById('mainContent');
    Donate.render(container);
  },

  /**
   * 渲染AI问答页面
   */
  renderChat() {
    const container = document.getElementById('mainContent');
    Chat.render(container);
  },

  /**
   * 渲染反馈页面
   */
  renderFeedback() {
    const container = document.getElementById('mainContent');
    Feedback.render(container);
  },

  /**
   * 渲染更新日志页面
   */
  renderChangelog() {
    const container = document.getElementById('mainContent');
    Changelog.render(container);
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
        <h1 class="settings-title">设置</h1>

        <!-- 主题设置 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">外观设置</h3>
          </div>
          <div class="card-body">
            <div class="settings-item">
              <div class="settings-item-info">
                <h4 class="settings-item-title">主题模式</h4>
                <p class="settings-item-desc">选择浅色或深色主题</p>
              </div>
              <div class="settings-item-action theme-buttons">
                <button class="btn btn-sm ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="App.setTheme('light')">
                  ☀️ 浅色
                </button>
                <button class="btn btn-sm ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" 
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
              <span class="input-hint">可在 <a href="https://cloud.siliconflow.cn/i/DG53MZpo" target="_blank">硅基流动控制台</a> 获取</span>
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

            <div class="settings-buttons">
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
            <!-- 图片数据卡片（推荐） -->
            <div class="settings-section-title mb-md">
              <span class="badge badge-primary">推荐</span>
              <span>数据卡片</span>
            </div>
            
            <div class="settings-item mb-lg">
              <div class="settings-item-info">
                <h4 class="settings-item-title">导出为图片</h4>
                <p class="settings-item-desc">生成精美个人画像卡，可保存分享</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.exportAsImage()">生成卡片</button>
            </div>

            <div class="settings-item mb-lg">
              <div class="settings-item-info">
                <h4 class="settings-item-title">从图片导入</h4>
                <p class="settings-item-desc">上传数据卡片恢复所有数据</p>
              </div>
              <div>
                <input type="file" id="importImageFile" accept="image/png" style="display: none;" onchange="App.importFromImage(event)">
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('importImageFile').click()">上传卡片</button>
              </div>
            </div>

            <div class="divider mb-lg"></div>
            
            <!-- JSON 备份 -->
            <div class="settings-section-title mb-md">
              <span class="text-secondary">JSON 备份</span>
            </div>

            <div class="settings-item mb-lg">
              <div class="settings-item-info">
                <h4 class="settings-item-title">导出数据</h4>
                <p class="settings-item-desc">将所有数据导出为 JSON 文件</p>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.exportData()">导出</button>
            </div>

            <div class="settings-item mb-lg">
              <div class="settings-item-info">
                <h4 class="settings-item-title">导入数据</h4>
                <p class="settings-item-desc">从 JSON 文件恢复数据</p>
              </div>
              <div>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="App.importData(event)">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('importFile').click()">导入</button>
              </div>
            </div>

            <div class="divider"></div>

            <div class="settings-item">
              <div class="settings-item-info">
                <h4 class="settings-item-title text-danger">清除所有数据</h4>
                <p class="settings-item-desc">永久删除，不可撤销</p>
              </div>
              <button class="btn btn-danger btn-sm" onclick="App.confirmEmergencyClear()">清除</button>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">关于</h3>
          </div>
          <div class="card-body">
            <div class="about-header mb-lg">
              <span class="about-icon">🔮</span>
              <div>
                <h4 class="about-title">观己</h4>
                <p class="about-version">版本 ${Changelog.currentVersion}</p>
              </div>
            </div>
            <p class="about-desc mb-lg">
              静观己心，内外澄明。帮助你全方位了解自己的性格特征与内在世界。
            </p>
            
            <a href="#/changelog" class="btn btn-outline btn-block mb-md">
              📋 查看更新日志
            </a>
            
            <a href="#/feedback" class="btn btn-primary btn-block mb-md">
              💬 意见反馈
            </a>
            
            <div class="text-center">
              <a href="#/donate" class="text-tertiary" style="font-size: var(--font-size-xs);">
                觉得好用？支持一下开发者
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>
        .settings-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          margin-bottom: var(--spacing-lg);
        }
        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
        }
        .settings-item-info {
          flex: 1;
          min-width: 0;
        }
        .settings-item-title {
          font-weight: 500;
          margin-bottom: 2px;
        }
        .settings-item-desc {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }
        .settings-buttons {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }
        .settings-section-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
        }
        .theme-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }
        .about-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        .about-icon {
          font-size: 2rem;
        }
        .about-title {
          font-weight: 700;
        }
        .about-version {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .about-desc {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .settings-title {
            font-size: var(--font-size-xl);
          }
        }
        @media (max-width: 480px) {
          .settings-title {
            font-size: var(--font-size-lg);
          }
          .settings-item {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-sm);
          }
          .settings-item-action {
            align-self: flex-start;
          }
          .theme-buttons {
            width: 100%;
          }
          .theme-buttons .btn {
            flex: 1;
          }
          .settings-buttons {
            flex-direction: column;
          }
          .settings-buttons .btn {
            width: 100%;
          }
          .about-icon {
            font-size: 1.5rem;
          }
        }
      </style>
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
   * 导出为图片数据卡片
   */
  async exportAsImage() {
    try {
      Utils.showToast('正在生成数据卡片...', 'info');
      await DataCard.exportAsImage();
      Utils.showToast('数据卡片已生成并下载', 'success');
    } catch (error) {
      console.error('导出图片失败:', error);
      Utils.showToast('生成失败: ' + error.message, 'error');
    }
  },

  /**
   * 从图片导入数据
   */
  async importFromImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      Utils.showToast('正在解析数据卡片...', 'info');
      
      const confirmed = await Utils.confirm('导入将覆盖现有数据，确定继续吗？');
      if (!confirmed) {
        event.target.value = '';
        return;
      }

      await DataCard.importFromImage(file);
      Utils.showToast('数据导入成功', 'success');
      
      // 刷新页面
      location.reload();
    } catch (error) {
      console.error('导入图片失败:', error);
      Utils.showToast('导入失败: ' + error.message, 'error');
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
  },

  // ============ 依恋类型测试 ============

  /**
   * 渲染依恋类型介绍页
   */
  async renderAttachment() {
    const container = document.getElementById('mainContent');
    const latestTest = await Storage.getLatestTest('attachment');

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card mb-xl">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center mb-xl">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💞</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">依恋类型测试</h1>
              <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
                依恋理论揭示了我们在亲密关系中的行为模式。了解你的依恋类型，
                有助于建立更健康的人际关系。
              </p>
            </div>

            <div class="grid grid-cols-4 gap-md mb-xl">
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🛡️</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">安全型</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💓</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">焦虑型</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🏔️</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">回避型</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🌊</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">恐惧型</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary">共 30 道题目，预计用时 5-8 分钟</p>
                ${latestTest ? `
                  <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                    上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                  </p>
                ` : ''}
              </div>
              <a href="#/attachment/test" class="btn btn-primary btn-lg">
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
                <div style="font-size: 3rem;">${latestTest.result.typeInfo.icon}</div>
                <div class="flex-1">
                  <h3 class="font-bold" style="color: ${latestTest.result.typeInfo.color}; font-size: var(--font-size-xl);">
                    ${latestTest.result.typeInfo.name}
                  </h3>
                  <p class="text-secondary mt-sm">${latestTest.result.typeInfo.description}</p>
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
   * 渲染依恋类型测试页
   */
  async renderAttachmentTest() {
    const container = document.getElementById('mainContent');
    
    Attachment.init();

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title">依恋类型测试</h2>
                <p class="card-subtitle" id="attachmentProgress">第 1 题 / 共 ${Attachment.questions.length} 题</p>
              </div>
              <button class="btn btn-outline" onclick="App.confirmQuitTest('/attachment')">退出测试</button>
            </div>
            <div class="progress mt-md">
              <div class="progress-bar" id="attachmentProgressBar" style="width: 0%;"></div>
            </div>
          </div>
          <div class="card-body" id="attachmentQuestionArea"></div>
        </div>
      </div>
    `;

    Attachment.renderQuestion();
  },

  // ============ 情商测试 ============

  /**
   * 渲染情商测试介绍页
   */
  async renderEQ() {
    const container = document.getElementById('mainContent');
    const latestTest = await Storage.getLatestTest('eq');

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card mb-xl">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center mb-xl">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧠</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">情商测试</h1>
              <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
                情商 (EQ) 是理解和管理自己及他人情绪的能力。
                高情商有助于建立更好的人际关系和职业发展。
              </p>
            </div>

            <div class="grid grid-cols-5 gap-md mb-xl">
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🔍</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">自我认知</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🎯</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">自我管理</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🔥</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">自我激励</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💗</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">共情能力</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🤝</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">社交技巧</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary">共 40 道题目，预计用时 8-10 分钟</p>
                ${latestTest ? `
                  <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                    上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                  </p>
                ` : ''}
              </div>
              <a href="#/eq/test" class="btn btn-primary btn-lg">
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
                <div class="text-center">
                  <div style="font-size: 2.5rem; font-weight: 700;">${latestTest.result.overallScore}</div>
                  <div class="text-secondary" style="font-size: var(--font-size-sm);">总分</div>
                </div>
                <div class="flex-1">
                  <span class="badge" style="background: ${latestTest.result.level.color}20; color: ${latestTest.result.level.color};">
                    ${latestTest.result.level.name}
                  </span>
                  <p class="text-secondary mt-sm">${latestTest.result.level.description}</p>
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
   * 渲染情商测试页
   */
  async renderEQTest() {
    const container = document.getElementById('mainContent');
    
    EQ.init();

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title">情商测试</h2>
                <p class="card-subtitle" id="eqProgress">第 1 题 / 共 ${EQ.questions.length} 题</p>
              </div>
              <button class="btn btn-outline" onclick="App.confirmQuitTest('/eq')">退出测试</button>
            </div>
            <div class="progress mt-md">
              <div class="progress-bar" id="eqProgressBar" style="width: 0%;"></div>
            </div>
          </div>
          <div class="card-body" id="eqQuestionArea"></div>
        </div>
      </div>
    `;

    EQ.renderQuestion();
  },

  // ============ 价值观测试 ============

  /**
   * 渲染价值观测试介绍页
   */
  async renderValues() {
    const container = document.getElementById('mainContent');
    const latestTest = await Storage.getLatestTest('values');

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card mb-xl">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center mb-xl">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💎</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">价值观测试</h1>
              <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
                价值观是我们生活的指南针，影响着我们的选择和行为。
                了解自己的核心价值观，有助于做出更符合内心的决定。
              </p>
            </div>

            <div class="grid grid-cols-5 gap-md mb-xl">
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🏆</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">成就</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🦅</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">自主</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">💗</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">仁慈</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🛡️</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">安全</div>
              </div>
              <div class="text-center p-md">
                <div style="font-size: 1.5rem; margin-bottom: var(--spacing-xs);">🌍</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">普世</div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary">共 30 道题目，预计用时 5-8 分钟</p>
                ${latestTest ? `
                  <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                    上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                  </p>
                ` : ''}
              </div>
              <a href="#/values/test" class="btn btn-primary btn-lg">
                ${latestTest ? '重新测试' : '开始测试'}
              </a>
            </div>
          </div>
        </div>

        ${latestTest && latestTest.result ? `
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">上次测试结果 - 核心价值观</h3>
            </div>
            <div class="card-body">
              <div class="flex items-center gap-lg">
                <div class="flex gap-md">
                  ${latestTest.result.coreValues.slice(0, 3).map((v, i) => `
                    <div class="text-center">
                      <div style="font-size: 2rem;">${v.info.icon}</div>
                      <div class="text-secondary" style="font-size: var(--font-size-sm);">${v.info.name}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="flex-1"></div>
                <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * 渲染价值观测试页
   */
  async renderValuesTest() {
    const container = document.getElementById('mainContent');
    
    Values.init();

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title">价值观测试</h2>
                <p class="card-subtitle" id="valuesProgress">第 1 题 / 共 ${Values.questions.length} 题</p>
              </div>
              <button class="btn btn-outline" onclick="App.confirmQuitTest('/values')">退出测试</button>
            </div>
            <div class="progress mt-md">
              <div class="progress-bar" id="valuesProgressBar" style="width: 0%;"></div>
            </div>
          </div>
          <div class="card-body" id="valuesQuestionArea"></div>
        </div>
      </div>
    `;

    Values.renderQuestion();
  },

  // ============ 压力/焦虑自测 ============

  /**
   * 渲染压力/焦虑自测介绍页
   */
  async renderStress() {
    const container = document.getElementById('mainContent');
    const latestTest = await Storage.getLatestTest('stress');

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card mb-xl">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center mb-xl">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧘</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">心理健康自测</h1>
              <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
                使用国际通用的 GAD-7 和 PHQ-9 量表，帮助你了解自己近期的焦虑和情绪状况。
                本测试仅供自我了解参考，不能替代专业诊断。
              </p>
            </div>

            <div class="grid grid-cols-2 gap-lg mb-xl">
              <div class="p-lg" style="background: var(--bg-secondary); border-radius: var(--radius-lg);">
                <div class="flex items-center gap-md mb-md">
                  <span style="font-size: 1.5rem;">😰</span>
                  <h3 class="font-semibold">GAD-7 焦虑量表</h3>
                </div>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">
                  评估过去两周内的焦虑症状程度，共7道题
                </p>
              </div>
              <div class="p-lg" style="background: var(--bg-secondary); border-radius: var(--radius-lg);">
                <div class="flex items-center gap-md mb-md">
                  <span style="font-size: 1.5rem;">😔</span>
                  <h3 class="font-semibold">PHQ-9 情绪量表</h3>
                </div>
                <p class="text-secondary" style="font-size: var(--font-size-sm);">
                  评估过去两周内的情绪状况，共9道题
                </p>
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary">共 16 道题目，预计用时 3-5 分钟</p>
                ${latestTest ? `
                  <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                    上次测试：${Utils.formatRelativeTime(latestTest.timestamp)}
                  </p>
                ` : ''}
              </div>
              <a href="#/stress/test" class="btn btn-primary btn-lg">
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
              <div class="flex items-center gap-xl">
                <div class="text-center">
                  <div class="text-secondary mb-sm" style="font-size: var(--font-size-sm);">焦虑</div>
                  <span class="badge" style="background: ${latestTest.result.anxietyLevel.color}20; color: ${latestTest.result.anxietyLevel.color};">
                    ${latestTest.result.anxietyLevel.name}
                  </span>
                </div>
                <div class="text-center">
                  <div class="text-secondary mb-sm" style="font-size: var(--font-size-sm);">情绪</div>
                  <span class="badge" style="background: ${latestTest.result.depressionLevel.color}20; color: ${latestTest.result.depressionLevel.color};">
                    ${latestTest.result.depressionLevel.name}
                  </span>
                </div>
                <div class="flex-1"></div>
                <a href="#/report/${latestTest.id}" class="btn btn-outline">查看详细报告</a>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="card mt-lg" style="background: var(--bg-secondary);">
          <div class="card-body">
            <p class="text-tertiary" style="font-size: var(--font-size-sm);">
              <strong>温馨提示：</strong>本测试仅供自我了解和参考，不能替代专业的心理健康诊断。
              如果您持续感到困扰，建议咨询专业的心理健康服务人员。
            </p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染压力/焦虑测试页
   */
  async renderStressTest() {
    const container = document.getElementById('mainContent');
    
    Stress.init();

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title">心理健康自测</h2>
                <p class="card-subtitle" id="stressProgress">第 1 题 / 共 ${Stress.questions.length} 题</p>
              </div>
              <div class="flex items-center gap-md">
                <span class="badge" id="stressScaleBadge" style="background: #f59e0b20; color: #f59e0b;">焦虑自评 (GAD-7)</span>
                <button class="btn btn-outline" onclick="App.confirmQuitTest('/stress')">退出测试</button>
              </div>
            </div>
            <div class="progress mt-md">
              <div class="progress-bar" id="stressProgressBar" style="width: 0%;"></div>
            </div>
          </div>
          <div class="card-body" id="stressQuestionArea"></div>
        </div>
      </div>
    `;

    Stress.renderQuestion();
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
