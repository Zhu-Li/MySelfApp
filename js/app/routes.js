/**
 * routes.js - 路由注册
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：注册所有路由和路由守卫
 */

/**
 * 注册路由
 */
App.registerRoutes = function() {
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
    '/contacts': () => this.renderContacts(),
    '/contacts/:id': (params) => this.renderContactDetail(params.id),
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
};
