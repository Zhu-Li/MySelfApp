/**
 * report.js - 大五人格测试报告生成
 * 观己 - 静观己心，内外澄明
 */

const BigFiveReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const dimensions = result.dimensions;

    // 维度名称映射
    const dimNames = {
      O: { name: '开放性', icon: '🎨', color: '#8b5cf6' },
      C: { name: '尽责性', icon: '📋', color: '#10b981' },
      E: { name: '外向性', icon: '🎉', color: '#f59e0b' },
      A: { name: '宜人性', icon: '🤝', color: '#ec4899' },
      N: { name: '神经质性', icon: '🌊', color: '#6366f1' }
    };

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🌟</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">大五人格测试报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- 维度雷达图/柱状图 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">人格维度分析</h3>
          </div>
          <div class="card-body">
            <div class="bigfive-chart">
              ${Object.entries(dimensions).map(([dim, score]) => {
                const info = dimNames[dim];
                return `
                  <div class="bigfive-dimension">
                    <div class="dimension-header">
                      <span class="dimension-icon">${info.icon}</span>
                      <span class="dimension-name">${info.name}</span>
                      <span class="dimension-score" style="color: ${info.color};">${score}%</span>
                    </div>
                    <div class="dimension-bar">
                      <div class="dimension-fill" style="width: ${score}%; background-color: ${info.color};"></div>
                    </div>
                    <div class="dimension-desc">
                      ${BigFive.getDimensionDescription(dim, score).description}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 详细解读 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">详细解读</h3>
          </div>
          <div class="card-body">
            <div id="bigfiveAnalysis">
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
              <button class="btn btn-primary" onclick="BigFiveReport.regenerateAnalysis('${id}')">
                🔄 重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="BigFiveReport.exportReport('${id}')">
                📄 导出报告
              </button>
              <button class="btn btn-secondary" onclick="BigFiveReport.copyResult('${id}')">
                📋 复制结果
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
    if (document.getElementById('bigfive-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'bigfive-report-styles';
    style.textContent = `
      .bigfive-chart {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .bigfive-dimension {
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .dimension-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
      }

      .dimension-icon {
        font-size: 1.5rem;
      }

      .dimension-name {
        font-weight: 600;
        flex: 1;
      }

      .dimension-score {
        font-weight: 700;
        font-size: var(--font-size-lg);
      }

      .dimension-bar {
        height: 12px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: var(--spacing-sm);
      }

      .dimension-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.5s ease;
      }

      .dimension-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .scale-options {
        display: flex;
        justify-content: center;
        gap: var(--spacing-md);
        margin: var(--spacing-xl) 0;
      }

      .scale-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        min-width: 80px;
      }

      .scale-option:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }

      .scale-option.selected {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }

      .scale-marker {
        font-size: var(--font-size-xl);
        font-weight: 700;
      }

      .scale-label {
        font-size: var(--font-size-xs);
        text-align: center;
      }

      @media (max-width: 640px) {
        .scale-options {
          flex-wrap: wrap;
        }

        .scale-option {
          min-width: 60px;
          padding: var(--spacing-sm);
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('bigfiveAnalysis');
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

    // 检查是否已有分析
    if (testData.result.aiAnalysis) {
      container.innerHTML = `<div class="markdown-body">${Utils.renderMarkdown(testData.result.aiAnalysis)}</div>`;
      return;
    }

    // 初始化流式分析容器
    Utils.StreamAnalyzer.init('#bigfiveAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业的心理学分析师，擅长大五人格分析，用温暖、积极的语气提供个性化建议。' },
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
      Utils.StreamAnalyzer.showError(error.message);
    }
  },

  /**
   * 构建分析提示词
   */
  buildPrompt(result) {
    const dimensions = result.dimensions;
    
    return `你是一位专业的心理学分析师，请根据用户的大五人格测试结果进行深入分析。

## 测试结果

- 开放性 (Openness): ${dimensions.O}%
- 尽责性 (Conscientiousness): ${dimensions.C}%
- 外向性 (Extraversion): ${dimensions.E}%
- 宜人性 (Agreeableness): ${dimensions.A}%
- 神经质性 (Neuroticism): ${dimensions.N}%

## 请提供以下分析

1. **综合人格画像**：基于五个维度的综合分析，描述用户的整体人格特征
2. **优势与潜能**：根据各维度得分，分析用户的独特优势和发展潜能
3. **成长建议**：针对各维度提供具体、可行的成长建议
4. **人际关系**：分析用户在人际交往中的特点和建议
5. **职业倾向**：根据人格特征，推荐适合的职业方向和工作环境

请用温暖、积极的语气进行分析，注重正面引导，每个部分用 markdown 格式输出。`;
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
    const filename = `bigfive-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;
    const dimNames = { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质性' };

    let text = `# 大五人格测试报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 测试结果

${Object.entries(result.dimensions).map(([dim, score]) => 
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
window.BigFiveReport = BigFiveReport;
