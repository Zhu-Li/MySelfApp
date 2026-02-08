/**
 * report.js - 情商测试报告生成
 * 观己 - 静观己心，内外澄明
 */

const EQReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const { overallScore, level, dimensionScores, strengths, improvements } = result;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🧠</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">情商测试报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- 总体得分 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">情商总评</h3>
          </div>
          <div class="card-body">
            <div class="eq-score-display">
              <div class="eq-score-circle" style="--score-color: ${level.color};">
                <span class="score-number">${overallScore}</span>
                <span class="score-label">分</span>
              </div>
              <div class="eq-level-badge" style="background: ${level.color}20; color: ${level.color};">
                ${level.name}
              </div>
              <p class="eq-level-desc mt-lg">${level.description}</p>
            </div>
          </div>
        </div>

        <!-- 维度雷达 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">五维度分析</h3>
          </div>
          <div class="card-body">
            <div class="eq-dimensions">
              ${Object.entries(EQ.dimensions).map(([dim, info]) => {
                const score = dimensionScores[dim];
                return `
                  <div class="eq-dimension">
                    <div class="dimension-header">
                      <span class="dimension-icon">${info.icon}</span>
                      <span class="dimension-name">${info.name}</span>
                      <span class="dimension-score" style="color: ${info.color};">${score}%</span>
                    </div>
                    <div class="dimension-bar">
                      <div class="dimension-fill" style="width: ${score}%; background-color: ${info.color};"></div>
                    </div>
                    <div class="dimension-desc">
                      ${EQ.getDimensionDescription(dim, score)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 优势与待提升 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">个人特质</h3>
          </div>
          <div class="card-body">
            <div class="eq-traits-grid">
              <!-- 优势 -->
              <div class="traits-section">
                <h4 class="traits-title">
                  <span class="traits-icon">✨</span>
                  优势领域
                </h4>
                ${strengths.length > 0 ? `
                  <div class="traits-list">
                    ${strengths.map(dim => `
                      <div class="trait-item strength" style="border-color: ${EQ.dimensions[dim].color};">
                        <span class="trait-icon">${EQ.dimensions[dim].icon}</span>
                        <div class="trait-info">
                          <span class="trait-name">${EQ.dimensions[dim].name}</span>
                          <span class="trait-score" style="color: ${EQ.dimensions[dim].color};">${dimensionScores[dim]}%</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <p class="text-secondary">继续努力，发掘你的优势领域！</p>
                `}
              </div>

              <!-- 待提升 -->
              <div class="traits-section">
                <h4 class="traits-title">
                  <span class="traits-icon">🌱</span>
                  成长空间
                </h4>
                ${improvements.length > 0 ? `
                  <div class="traits-list">
                    ${improvements.map(dim => `
                      <div class="trait-item improvement" style="border-color: ${EQ.dimensions[dim].color};">
                        <span class="trait-icon">${EQ.dimensions[dim].icon}</span>
                        <div class="trait-info">
                          <span class="trait-name">${EQ.dimensions[dim].name}</span>
                          <span class="trait-score" style="color: ${EQ.dimensions[dim].color};">${dimensionScores[dim]}%</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <p class="text-secondary">表现均衡，各方面都很不错！</p>
                `}
              </div>
            </div>
          </div>
        </div>

        <!-- AI 深度分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">AI 深度分析</h3>
          </div>
          <div class="card-body">
            <div id="eqAnalysis">
              <div class="empty-state">
                <div class="loading-spinner loading-spinner-lg"></div>
                <p class="mt-md text-secondary">正在生成 AI 分析报告...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card">
          <div class="card-body">
            <div class="flex gap-md justify-center flex-wrap">
              <button class="btn btn-primary" onclick="EQReport.regenerateAnalysis('${id}')">
                重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="EQReport.exportReport('${id}')">
                导出报告
              </button>
              <button class="btn btn-secondary" onclick="EQReport.copyResult('${id}')">
                复制结果
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
    if (document.getElementById('eq-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'eq-report-styles';
    style.textContent = `
      .eq-score-display {
        text-align: center;
        padding: var(--spacing-xl);
      }

      .eq-score-circle {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--score-color)20, var(--score-color)10);
        border: 4px solid var(--score-color);
      }

      .score-number {
        font-size: 3rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .score-label {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .eq-level-badge {
        display: inline-block;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-full);
        font-weight: 600;
        margin-top: var(--spacing-lg);
      }

      .eq-level-desc {
        max-width: 500px;
        margin: 0 auto;
        color: var(--text-secondary);
        line-height: 1.8;
      }

      .eq-dimensions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .eq-dimension {
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .eq-traits-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-xl);
      }

      .traits-section {
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .traits-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        font-weight: 600;
      }

      .traits-icon {
        font-size: 1.25rem;
      }

      .traits-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .trait-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        border-left: 3px solid;
      }

      .trait-icon {
        font-size: 1.5rem;
      }

      .trait-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .trait-name {
        font-weight: 500;
      }

      .trait-score {
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .eq-score-circle {
          width: 120px;
          height: 120px;
        }

        .score-number {
          font-size: 2.5rem;
        }

        .eq-traits-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('eqAnalysis');
    if (!container) return;

    // 验证 API 配置和密钥有效性
    const canUseAPI = await API.checkAndPrompt();
    if (!canUseAPI) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚙️</div>
          <h3 class="empty-state-title">AI 服务不可用</h3>
          <p class="empty-state-desc">请配置有效的 API 密钥以获取 AI 分析</p>
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
    Utils.StreamAnalyzer.init('#eqAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业的心理学分析师，擅长情商分析，用温暖、积极的语气提供个性化建议。' },
        { role: 'user', content: prompt }
      ];

      // 使用流式 API
      const fullContent = await API.chatStream(
        messages,
        (chunk, fullText) => {
          Utils.StreamAnalyzer.appendContent(chunk);
        },
        { temperature: 0.8, maxTokens: 2500 }
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
    const { overallScore, level, dimensionScores, strengths, improvements } = result;
    
    const dimNames = { SA: '自我认知', SM: '自我管理', MO: '自我激励', EM: '共情能力', SS: '社交技巧' };

    return `你是一位专业的心理学分析师，请根据用户的情商测试结果进行深入分析。

## 测试结果

- 总体情商得分: ${overallScore}%
- 情商等级: ${level.name}

### 五维度得分
${Object.entries(dimensionScores).map(([dim, score]) => `- ${dimNames[dim]}: ${score}%`).join('\n')}

### 优势维度
${strengths.length > 0 ? strengths.map(dim => dimNames[dim]).join('、') : '暂无突出优势'}

### 待提升维度
${improvements.length > 0 ? improvements.map(dim => dimNames[dim]).join('、') : '各维度表现均衡'}

## 请提供以下分析

1. **情商画像**：基于五个维度的得分，描述用户的情商特点
2. **优势发挥**：如何在生活和工作中更好地发挥情商优势
3. **成长建议**：针对待提升维度，提供具体可行的提升方法
4. **情绪管理技巧**：根据用户特点，推荐适合的情绪管理技巧
5. **人际关系建议**：如何运用情商改善人际关系

请用温暖、积极的语气进行分析，注重正面引导和实用建议。用 markdown 格式输出。`;
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
    const filename = `eq-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;
    const { overallScore, level, dimensionScores } = result;
    const dimNames = { SA: '自我认知', SM: '自我管理', MO: '自我激励', EM: '共情能力', SS: '社交技巧' };

    let text = `# 情商测试报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 总体得分

**${overallScore}分** - ${level.name}

${level.description}

## 五维度分析

${Object.entries(dimensionScores).map(([dim, score]) => 
  `- ${dimNames[dim]}: ${score}%`
).join('\n')}

`;

    if (result.aiAnalysis) {
      text += `## AI 分析

${result.aiAnalysis}

`;
    }

    text += `---
*报告由「观己」生成 - 静观己心，内外澄明*`;

    return text;
  },

  /**
   * 复制结果
   */
  async copyResult(testId) {
    const testData = await Storage.get('tests', testId);
    if (!testData) return;

    const text = this.generateReportText(testData);
    await Utils.copyToClipboard(text);
    Utils.showToast('结果已复制到剪贴板', 'success');
  }
};

// 导出到全局
window.EQReport = EQReport;
