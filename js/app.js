/**
 * app.js - 应用入口与初始化（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 此文件为模块协调器，核心功能由以下子文件提供：
 * - setup-wizard.js: 初始设置向导
 * - auth-handler.js: 认证处理
 * - routes.js: 路由注册
 * - home-renderer.js: 首页渲染
 * - test-renderers.js: 基础测试页面渲染
 * - test-renderers-extra.js: 额外测试页面渲染
 * - report-renderer.js: 报告页面渲染
 * - settings-renderer.js: 设置页面渲染
 * - page-renderers.js: 其他页面渲染
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
  // ========== 应用状态 ==========
  isUnlocked: false,
  setupStep: 1,

  // ========== 核心方法 ==========

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
   * 显示模态框
   * @param {string} id - 模态框ID
   */
  showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
    }
  },

  /**
   * 隐藏模态框
   * @param {string} id - 模态框ID
   */
  hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // ========== 以下方法由子文件提供 ==========

  // setup-wizard.js:
  //   - showSetupModal()
  //   - nextSetupStep()
  //   - prevSetupStep()
  //   - updateSetupStep()
  //   - completeSetup()

  // auth-handler.js:
  //   - showUnlockModal()
  //   - unlock(event)
  //   - confirmEmergencyClear()
  //   - emergencyClear()

  // routes.js:
  //   - registerRoutes()

  // home-renderer.js:
  //   - renderHome()
  //   - addHomeStyles()
  //   - getTimeGreeting()
  //   - getDailyQuote()
  //   - getStreakData()
  //   - loadHomeStats()

  // test-renderers.js:
  //   - renderTestList()
  //   - addTestListStyles()
  //   - confirmQuitTest(returnPath)
  //   - renderComprehensive()
  //   - renderMBTI() / renderMBTITest()
  //   - renderBigFive() / renderBigFiveTest()
  //   - renderHolland() / renderHollandTest()

  // test-renderers-extra.js:
  //   - renderAttachment() / renderAttachmentTest()
  //   - renderEQ() / renderEQTest()
  //   - renderValues() / renderValuesTest()
  //   - renderStress() / renderStressTest()

  // report-renderer.js:
  //   - renderReportList()
  //   - renderReport(id)

  // settings-renderer.js:
  //   - renderSettings()
  //   - addSettingsStyles()
  //   - calculateAge(birthday)
  //   - generateYearOptions(birthday)
  //   - generateMonthOptions(birthday)
  //   - generateDayOptions(birthday)
  //   - saveProfile()
  //   - setTheme(theme)
  //   - saveApiSettings()
  //   - testApiConnection()
  //   - exportData()
  //   - importData(event)
  //   - exportAsImage()
  //   - importFromImage(event)
  //   - togglePassword(inputId)

  // page-renderers.js:
  //   - renderDiary()
  //   - renderDiaryEditor(id)
  //   - renderDiaryDetail(id)
  //   - renderContacts()
  //   - renderContactDetail(id)
  //   - renderDonate()
  //   - renderChat()
  //   - renderFeedback()
  //   - renderChangelog()
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
