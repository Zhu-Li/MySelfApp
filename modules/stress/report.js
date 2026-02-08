/**
 * report.js - 压力/焦虑自测报告生成
 * 观己 - 静观己心，内外澄明
 */

const StressReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const { gadScore, phqScore, anxietyLevel, depressionLevel, suicidalIdeation, needsProfessionalHelp } = result;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 重要提示 -->
        ${needsProfessionalHelp ? `
          <div class="card mb-lg" style="border: 2px solid #ef4444; background: #fef2f2;">
            <div class="card-body">
              <div class="warning-box">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <h3 class="warning-title">重要提示</h3>
                  <p class="warning-text">
                    根据测试结果，建议您寻求专业心理健康服务。
                    ${suicidalIdeation ? '如果您有自我伤害的想法，请立即拨打心理援助热线或前往医院就诊。' : ''}
                  </p>
                  <div class="warning-links mt-md">
                    <p><strong>全国心理援助热线：</strong>400-161-9995</p>
                    <p><strong>北京心理危机研究与干预中心：</strong>010-82951332</p>
                    <p><strong>生命热线：</strong>400-821-1215</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧘</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">心理健康自测报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- 焦虑评估 (GAD-7) -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">😰</span>
              焦虑评估 (GAD-7)
            </h3>
          </div>
          <div class="card-body">
            <div class="score-display">
              <div class="score-circle" style="--score-color: ${anxietyLevel.color};">
                <span class="score-number">${gadScore}</span>
                <span class="score-max">/ 21</span>
              </div>
              <div class="score-level" style="background: ${anxietyLevel.color}20; color: ${anxietyLevel.color};">
                ${anxietyLevel.name}
              </div>
            </div>
            <p class="score-description mt-lg text-center">${anxietyLevel.description}</p>
            
            <!-- 得分解读 -->
            <div class="score-scale mt-xl">
              <div class="scale-bar">
                <div class="scale-segment" style="width: 19%; background: #10b981;"></div>
                <div class="scale-segment" style="width: 24%; background: #f59e0b;"></div>
                <div class="scale-segment" style="width: 24%; background: #f97316;"></div>
                <div class="scale-segment" style="width: 33%; background: #ef4444;"></div>
                <div class="scale-pointer" style="left: ${(gadScore / 21) * 100}%;"></div>
              </div>
              <div class="scale-labels">
                <span>正常 (0-4)</span>
                <span>轻度 (5-9)</span>
                <span>中度 (10-14)</span>
                <span>重度 (15-21)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 抑郁评估 (PHQ-9) -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">😔</span>
              情绪评估 (PHQ-9)
            </h3>
          </div>
          <div class="card-body">
            <div class="score-display">
              <div class="score-circle" style="--score-color: ${depressionLevel.color};">
                <span class="score-number">${phqScore}</span>
                <span class="score-max">/ 27</span>
              </div>
              <div class="score-level" style="background: ${depressionLevel.color}20; color: ${depressionLevel.color};">
                ${depressionLevel.name}
              </div>
            </div>
            <p class="score-description mt-lg text-center">${depressionLevel.description}</p>
            
            <!-- 得分解读 -->
            <div class="score-scale mt-xl">
              <div class="scale-bar">
                <div class="scale-segment" style="width: 15%; background: #10b981;"></div>
                <div class="scale-segment" style="width: 18%; background: #f59e0b;"></div>
                <div class="scale-segment" style="width: 18%; background: #f97316;"></div>
                <div class="scale-segment" style="width: 18%; background: #dc2626;"></div>
                <div class="scale-segment" style="width: 31%; background: #ef4444;"></div>
                <div class="scale-pointer" style="left: ${(phqScore / 27) * 100}%;"></div>
              </div>
              <div class="scale-labels scale-labels-5">
                <span>正常</span>
                <span>轻度</span>
                <span>中度</span>
                <span>中重度</span>
                <span>重度</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 自我关爱建议 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">💚</span>
              自我关爱建议
            </h3>
          </div>
          <div class="card-body">
            <div class="self-care-tips">
              <div class="tip-item">
                <span class="tip-icon">🌿</span>
                <div class="tip-content">
                  <h4>规律作息</h4>
                  <p>保持规律的睡眠时间，每天7-8小时的充足睡眠</p>
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🏃</span>
                <div class="tip-content">
                  <h4>适度运动</h4>
                  <p>每周进行150分钟中等强度运动，如快走、游泳</p>
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🧘</span>
                <div class="tip-content">
                  <h4>放松练习</h4>
                  <p>尝试深呼吸、冥想或渐进式肌肉放松</p>
                </div>
              </div>
              <div class="tip-item">
                <span class="tip-icon">👥</span>
                <div class="tip-content">
                  <h4>社交支持</h4>
                  <p>与亲友保持联系，分享你的感受和想法</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">AI 个性化建议</h3>
          </div>
          <div class="card-body">
            <div id="stressAnalysis">
              <div class="empty-state">
                <div class="loading-spinner loading-spinner-lg"></div>
                <p class="mt-md text-secondary">正在生成个性化建议...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 免责声明 -->
        <div class="card mb-lg" style="background: var(--bg-secondary);">
          <div class="card-body">
            <p class="disclaimer-text">
              <strong>免责声明：</strong>本测试仅供自我了解和参考，不能替代专业的心理健康诊断。
              如果您持续感到困扰，请咨询专业的心理健康服务人员。测试结果不应被用于任何医学诊断或治疗决策。
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card">
          <div class="card-body">
            <div class="flex gap-md justify-center flex-wrap">
              <button class="btn btn-primary" onclick="StressReport.regenerateAnalysis('${id}')">
                重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="StressReport.exportReport('${id}')">
                导出报告
              </button>
              <a href="#/test" class="btn btn-outline">返回测试列表</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加样式
    this.addStyles();

    // 生成 AI 分析
    this.generateAnalysis(testData);
  },

  /**
   * 添加报告样式
   */
  addStyles() {
    if (document.getElementById('stress-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'stress-report-styles';
    style.textContent = `
      .warning-box {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-md);
      }

      .warning-icon {
        font-size: 2.5rem;
        flex-shrink: 0;
      }

      .warning-title {
        color: #dc2626;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
      }

      .warning-text {
        color: #991b1b;
        line-height: 1.6;
      }

      .warning-links p {
        margin: var(--spacing-xs) 0;
        font-size: var(--font-size-sm);
        color: #991b1b;
      }

      .title-icon {
        margin-right: var(--spacing-sm);
      }

      .score-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-lg);
      }

      .score-circle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--score-color)15, var(--score-color)05);
        border: 4px solid var(--score-color);
      }

      .score-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .score-max {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
      }

      .score-level {
        padding: var(--spacing-sm) var(--spacing-xl);
        border-radius: var(--radius-full);
        font-weight: 600;
      }

      .score-description {
        max-width: 500px;
        margin: 0 auto;
        color: var(--text-secondary);
        line-height: 1.8;
      }

      .score-scale {
        max-width: 500px;
        margin: 0 auto;
      }

      .scale-bar {
        position: relative;
        display: flex;
        height: 12px;
        border-radius: 6px;
        overflow: hidden;
      }

      .scale-segment {
        height: 100%;
      }

      .scale-pointer {
        position: absolute;
        top: -4px;
        width: 4px;
        height: 20px;
        background: var(--text-primary);
        border-radius: 2px;
        transform: translateX(-50%);
      }

      .scale-labels {
        display: flex;
        justify-content: space-between;
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
      }

      .scale-labels-5 span {
        flex: 1;
        text-align: center;
      }

      .self-care-tips {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
      }

      .tip-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .tip-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .tip-content h4 {
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
      }

      .tip-content p {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .disclaimer-text {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
        line-height: 1.6;
      }

      /* 4点量表样式 */
      .scale-options-4 {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
      }

      .scale-option-4 {
        min-width: 100px;
        padding: var(--spacing-md);
      }

      @media (max-width: 640px) {
        .warning-box {
          flex-direction: column;
          text-align: center;
        }

        .self-care-tips {
          grid-template-columns: 1fr;
        }

        .scale-labels {
          font-size: 0.625rem;
        }

        .scale-option-4 {
          min-width: 70px;
          padding: var(--spacing-sm);
        }

        .scale-option-4 .scale-label {
          font-size: 0.625rem;
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('stressAnalysis');
    if (!container) return;

    // 验证 API 配置和密钥有效性
    const canUseAPI = await API.checkAndPrompt();
    if (!canUseAPI) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚙️</div>
          <h3 class="empty-state-title">AI 服务不可用</h3>
          <p class="empty-state-desc">请配置有效的 API 密钥以获取个性化建议</p>
          <button class="btn btn-primary" onclick="API.showConfigModal()">配置 API</button>
        </div>
      `;
      return;
    }

    // 检查是否已有分析
    if (testData.result.aiAnalysis) {
      container.innerHTML = `<div class="markdown-body">${Utils.renderMarkdown(testData.result.aiAnalysis)}</div>`;
      return;
    }

    // 初始化流式分析容器
    Utils.StreamAnalyzer.init('#stressAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业且温暖的心理健康顾问。请用关怀、支持的语气提供建议，避免使用诊断性语言。强调自我关爱和积极应对策略。' },
        { role: 'user', content: prompt }
      ];

      // 使用流式 API
      const fullContent = await API.chatStream(
        messages,
        (chunk, fullText) => {
          Utils.StreamAnalyzer.appendContent(chunk);
        },
        { temperature: 0.7, maxTokens: 2000 }
      );

      // 完成分析
      Utils.StreamAnalyzer.complete();

      // 保存分析结果
      testData.result.aiAnalysis = fullContent;
      await Storage.saveTest(testData);

    } catch (error) {
      console.error('生成分析失败:', error);
      const errorMsg = error.message || '';
      if (errorMsg.includes('401') || errorMsg.includes('密钥')) {
        Utils.StreamAnalyzer.showError('API 密钥无效，请重新配置');
        API.showConfigModal('invalid', errorMsg);
      } else if (errorMsg.includes('402') || errorMsg.includes('余额')) {
        Utils.StreamAnalyzer.showError('API 余额不足，请充值后继续使用');
        API.showConfigModal('quota_exceeded', errorMsg);
      } else {
        Utils.StreamAnalyzer.showError(errorMsg);
      }
    }
  },

  /**
   * 构建分析提示词
   */
  buildPrompt(result) {
    const { gadScore, phqScore, anxietyLevel, depressionLevel } = result;

    return `作为一位心理健康顾问，请根据用户的自测结果提供温暖、支持性的个性化建议。

## 自测结果

- 焦虑自评 (GAD-7): ${gadScore}/21 - ${anxietyLevel.name}
- 情绪自评 (PHQ-9): ${phqScore}/27 - ${depressionLevel.name}

## 请提供以下内容

1. **状态理解**：用温暖的语气帮助用户理解自己当前的心理状态（避免使用诊断性语言）

2. **日常建议**：根据测试结果，提供3-4个具体可行的日常调节建议

3. **放松技巧**：推荐1-2个简单易学的放松或减压技巧

4. **积极视角**：提供一些积极的视角和鼓励

**重要提示**：
- 使用温暖、支持性的语气
- 避免使用"抑郁症"、"焦虑症"等诊断性词语
- 强调自我关爱和积极应对
- 如果得分较高，温和地建议寻求专业支持

请用 markdown 格式输出，保持简洁温暖的风格。`;
  },

  /**
   * 重新生成分析
   */
  async regenerateAnalysis(testId) {
    const testData = await Storage.get('tests', testId);
    if (testData) {
      testData.result.aiAnalysis = null;
      await Storage.saveTest(testData);
      this.generateAnalysis(testData);
    }
  },

  /**
   * 导出报告
   */
  async exportReport(testId) {
    const testData = await Storage.get('tests', testId);
    if (!testData) return;

    const content = this.generateReportText(testData);
    const filename = `stress-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;
    const { gadScore, phqScore, anxietyLevel, depressionLevel } = result;

    let text = `# 心理健康自测报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 焦虑评估 (GAD-7)

**得分**: ${gadScore}/21 - ${anxietyLevel.name}

${anxietyLevel.description}

## 情绪评估 (PHQ-9)

**得分**: ${phqScore}/27 - ${depressionLevel.name}

${depressionLevel.description}

`;

    if (result.aiAnalysis) {
      text += `## 个性化建议

${result.aiAnalysis}

`;
    }

    text += `---

**免责声明**: 本测试仅供自我了解和参考，不能替代专业的心理健康诊断。如果您持续感到困扰，请咨询专业的心理健康服务人员。

*报告由「观己」生成 - 静观己心，内外澄明*`;

    return text;
  }
};

// 导出到全局
window.StressReport = StressReport;
