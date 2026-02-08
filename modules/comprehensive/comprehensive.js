/**
 * comprehensive.js - 综合分析模块（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 整合 MBTI、大五人格、霍兰德职业兴趣测试结果，生成综合用户画像
 * 
 * 模块结构:
 * - comprehensive.js (本文件) - 核心协调器：测试就绪检查、报告生成、页面渲染
 * - prompt-builder.js - AI提示词构建
 * - stream-analyzer.js - 流式分析生成
 * - report-renderer.js - 报告渲染与导出
 */

const Comprehensive = {
  /**
   * 检查是否有足够的测试数据进行综合分析
   * @returns {Object} 就绪状态信息
   */
  async checkReadiness() {
    const profile = await Storage.getProfile();
    const hasTests = {
      mbti: !!profile?.mbti?.type,
      bigfive: !!profile?.bigfive?.dimensions,
      holland: !!profile?.holland?.hollandCode
    };

    const completedCount = Object.values(hasTests).filter(Boolean).length;

    return {
      hasTests,
      completedCount,
      isReady: completedCount >= 2, // 至少完成2个测试才能进行综合分析
      missingTests: Object.entries(hasTests)
        .filter(([, completed]) => !completed)
        .map(([test]) => test)
    };
  },

  /**
   * 生成综合分析报告（创建报告记录，流式分析在渲染时进行）
   * @returns {Object} 报告对象
   */
  async generateReport() {
    const profile = await Storage.getProfile();
    const readiness = await this.checkReadiness();

    if (!readiness.isReady) {
      throw new Error('需要至少完成2个测试才能进行综合分析');
    }

    // 收集所有测试结果
    const data = {
      mbti: profile.mbti,
      bigfive: profile.bigfive,
      holland: profile.holland
    };

    // 收集日记数据（最近30篇，用于情绪分析）
    const allDiary = await Storage.getAll('diary') || [];
    const recentDiary = allDiary
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 30)
      .map(d => ({
        date: Utils.formatDate(d.createdAt, 'YYYY-MM-DD'),
        mood: d.mood,
        content: d.content?.substring(0, 200) // 截取前200字
      }));
    data.diary = recentDiary;

    // 收集关系网数据
    const contacts = await Storage.getAllContacts() || [];
    const contactsSummary = contacts.map(c => ({
      name: c.name,
      remark: c.remark,
      testsCount: c.tests?.length || 0,
      diaryCount: c.diary?.length || 0,
      mbtiType: c.profile?.mbti?.type,
      importedAt: Utils.formatDate(c.importedAt, 'YYYY-MM-DD')
    }));
    data.contacts = contactsSummary;

    // 创建报告记录（分析在渲染页面时流式生成）
    const reportId = Utils.generateId();
    const report = {
      id: reportId,
      type: 'comprehensive',
      timestamp: Date.now(),
      sourceTests: {
        mbti: data.mbti?.testId,
        bigfive: data.bigfive?.testId,
        holland: data.holland?.testId
      },
      data,
      result: {
        aiAnalysis: null // 分析将在渲染时流式生成
      }
    };

    await Storage.saveTest(report);

    // 更新用户画像
    await Storage.updateProfile({
      comprehensive: {
        reportId,
        timestamp: Date.now()
      }
    });

    return report;
  },

  /**
   * 渲染综合分析页面
   * @param {HTMLElement} container - 容器元素
   */
  async renderPage(container) {
    const readiness = await this.checkReadiness();
    const profile = await Storage.getProfile();
    
    // 获取最新的综合分析报告
    let latestReport = null;
    if (profile?.comprehensive?.reportId) {
      latestReport = await Storage.get('tests', profile.comprehensive.reportId);
    }

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center mb-xl">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🎯</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">综合画像分析</h1>
              <p class="text-secondary mt-md" style="max-width: 600px; margin: 0 auto;">
                整合多维度测评数据，生成完整的个人画像报告，全面了解真实的自己
              </p>
            </div>

            <!-- 测试完成状态 -->
            <div class="test-status-grid mb-xl">
              <div class="test-status-item ${readiness.hasTests.mbti ? 'completed' : ''}">
                <div class="status-icon">${readiness.hasTests.mbti ? '✅' : '⏳'}</div>
                <div class="status-info">
                  <div class="status-name">MBTI 性格测试</div>
                  <div class="status-desc">${readiness.hasTests.mbti ? profile.mbti.type : '未完成'}</div>
                </div>
                ${!readiness.hasTests.mbti ? '<a href="#/mbti" class="btn btn-sm btn-primary">去测试</a>' : ''}
              </div>

              <div class="test-status-item ${readiness.hasTests.bigfive ? 'completed' : ''}">
                <div class="status-icon">${readiness.hasTests.bigfive ? '✅' : '⏳'}</div>
                <div class="status-info">
                  <div class="status-name">大五人格测试</div>
                  <div class="status-desc">${readiness.hasTests.bigfive ? '已完成' : '未完成'}</div>
                </div>
                ${!readiness.hasTests.bigfive ? '<a href="#/bigfive" class="btn btn-sm btn-primary">去测试</a>' : ''}
              </div>

              <div class="test-status-item ${readiness.hasTests.holland ? 'completed' : ''}">
                <div class="status-icon">${readiness.hasTests.holland ? '✅' : '⏳'}</div>
                <div class="status-info">
                  <div class="status-name">霍兰德职业兴趣</div>
                  <div class="status-desc">${readiness.hasTests.holland ? profile.holland.hollandCode : '未完成'}</div>
                </div>
                ${!readiness.hasTests.holland ? '<a href="#/holland" class="btn btn-sm btn-primary">去测试</a>' : ''}
              </div>
            </div>

            <div class="divider"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary">
                  已完成 ${readiness.completedCount}/3 项测试
                  ${readiness.isReady ? '，可以生成综合分析' : '，至少需要完成2项'}
                </p>
                ${latestReport ? `
                  <p class="text-tertiary mt-sm" style="font-size: var(--font-size-sm);">
                    上次分析：${Utils.formatRelativeTime(latestReport.timestamp)}
                  </p>
                ` : ''}
              </div>
              <button class="btn btn-primary btn-lg" 
                      onclick="Comprehensive.startAnalysis()"
                      ${!readiness.isReady ? 'disabled' : ''}>
                ${latestReport ? '重新生成画像' : '生成综合画像'}
              </button>
            </div>
          </div>
        </div>

        ${latestReport ? this.renderReportPreview(latestReport) : ''}
      </div>
    `;

    this.addStyles();
  },

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('comprehensive-styles')) return;

    const style = document.createElement('style');
    style.id = 'comprehensive-styles';
    style.textContent = `
      .test-status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-md);
      }

      .test-status-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        border: 2px solid var(--border-color);
      }

      .test-status-item.completed {
        border-color: var(--color-success);
        background: var(--color-success-light, rgba(34, 197, 94, 0.1));
      }

      .status-icon {
        font-size: 1.5rem;
      }

      .status-info {
        flex: 1;
      }

      .status-name {
        font-weight: 600;
      }

      .status-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 开始综合分析
   */
  async startAnalysis() {
    try {
      const report = await this.generateReport();
      Router.navigate(`/report/${report.id}`);
    } catch (error) {
      console.error('综合分析失败:', error);
      Utils.showToast(error.message || '分析失败，请重试', 'error');
    }
  }

  // 以下方法由子模块扩展：
  // - buildPrompt(data) -> prompt-builder.js
  // - streamGenerateAnalysis(testData) -> stream-analyzer.js
  // - regenerateAnalysis(reportId) -> stream-analyzer.js
  // - renderReport(container, testData) -> report-renderer.js
  // - renderReportPreview(report) -> report-renderer.js
  // - generateReportText(report) -> report-renderer.js
  // - exportReport(reportId) -> report-renderer.js
  // - copyResult(reportId) -> report-renderer.js
};

// 导出到全局
window.Comprehensive = Comprehensive;
