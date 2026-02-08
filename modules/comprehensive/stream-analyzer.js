/**
 * stream-analyzer.js - 流式分析生成
 * 观己 - 静观己心，内外澄明
 * 
 * 从 comprehensive.js 拆分
 * 职责：处理 AI 流式分析生成和重新分析
 */

/**
 * 流式生成综合分析
 * @param {Object} testData - 测试数据
 */
Comprehensive.streamGenerateAnalysis = async function(testData) {
  const container = document.getElementById('comprehensiveAnalysis');
  if (!container) return;

  if (!API.isConfigured()) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚙️</div>
        <h3 class="empty-state-title">未配置 AI 服务</h3>
        <p class="empty-state-desc">请在设置中配置 API 密钥以获取 AI 分析</p>
        <a href="#/settings" class="btn btn-primary">前往设置</a>
      </div>
    `;
    return;
  }

  // 初始化流式分析容器
  Utils.StreamAnalyzer.init('#comprehensiveAnalysis');

  try {
    const prompt = this.buildPrompt(testData.data);
    const messages = [
      { role: 'system', content: '你是一位资深的心理学专家和职业规划师，擅长整合多维度测评数据，提供深度个性化分析。' },
      { role: 'user', content: prompt }
    ];

    // 使用流式 API
    const fullContent = await API.chatStream(
      messages,
      (chunk, fullText) => {
        Utils.StreamAnalyzer.appendContent(chunk);
      },
      { temperature: 0.8, maxTokens: 3000 }
    );

    // 完成分析
    Utils.StreamAnalyzer.complete();

    // 保存分析结果
    testData.result.aiAnalysis = fullContent;
    await Storage.saveTest(testData);

  } catch (error) {
    console.error('生成分析失败:', error);
    Utils.StreamAnalyzer.showError(error.message);
  }
};

/**
 * 重新生成分析
 * @param {string} reportId - 报告ID
 */
Comprehensive.regenerateAnalysis = async function(reportId) {
  try {
    const report = await this.generateReport();
    Router.navigate(`/report/${report.id}`);
  } catch (error) {
    Utils.showToast(error.message || '分析失败', 'error');
  }
};
