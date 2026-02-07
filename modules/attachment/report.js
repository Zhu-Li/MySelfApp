/**
 * report.js - 依恋类型测试报告生成
 * 观己 - 静观己心，内外澄明
 */

const AttachmentReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const { type, typeInfo, dimensions } = result;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">${typeInfo.icon}</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">依恋类型测试报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- 依恋类型结果 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">你的依恋类型</h3>
          </div>
          <div class="card-body">
            <div class="attachment-result">
              <div class="attachment-type-badge" style="background: ${typeInfo.color}20; border-color: ${typeInfo.color};">
                <span class="type-icon">${typeInfo.icon}</span>
                <span class="type-name" style="color: ${typeInfo.color};">${typeInfo.name}</span>
              </div>
              <p class="type-description mt-lg">${typeInfo.description}</p>
              
              <div class="type-traits mt-lg">
                <h4 class="text-secondary mb-md">核心特质</h4>
                <div class="traits-grid">
                  ${typeInfo.traits.map(trait => `
                    <span class="trait-tag" style="background: ${typeInfo.color}15; color: ${typeInfo.color};">${trait}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 维度分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">维度分析</h3>
          </div>
          <div class="card-body">
            <div class="attachment-dimensions">
              <!-- 焦虑维度 -->
              <div class="attachment-dimension">
                <div class="dimension-header">
                  <span class="dimension-icon">💓</span>
                  <span class="dimension-name">焦虑维度</span>
                  <span class="dimension-score" style="color: #f59e0b;">${dimensions.anxiety}%</span>
                </div>
                <div class="dimension-bar">
                  <div class="dimension-fill" style="width: ${dimensions.anxiety}%; background-color: #f59e0b;"></div>
                </div>
                <div class="dimension-desc">
                  ${Attachment.getDimensionDescription('anxiety', dimensions.anxiety).description}
                </div>
              </div>

              <!-- 回避维度 -->
              <div class="attachment-dimension">
                <div class="dimension-header">
                  <span class="dimension-icon">🏔️</span>
                  <span class="dimension-name">回避维度</span>
                  <span class="dimension-score" style="color: #6366f1;">${dimensions.avoidance}%</span>
                </div>
                <div class="dimension-bar">
                  <div class="dimension-fill" style="width: ${dimensions.avoidance}%; background-color: #6366f1;"></div>
                </div>
                <div class="dimension-desc">
                  ${Attachment.getDimensionDescription('avoidance', dimensions.avoidance).description}
                </div>
              </div>
            </div>

            <!-- 四象限图示 -->
            <div class="attachment-quadrant mt-xl">
              <h4 class="text-secondary mb-md text-center">依恋类型象限图</h4>
              <div class="quadrant-chart">
                <div class="quadrant-grid">
                  <div class="quadrant q1 ${type === 'anxious' ? 'active' : ''}">
                    <span class="q-icon">💓</span>
                    <span class="q-name">焦虑型</span>
                  </div>
                  <div class="quadrant q2 ${type === 'fearful' ? 'active' : ''}">
                    <span class="q-icon">🌊</span>
                    <span class="q-name">恐惧型</span>
                  </div>
                  <div class="quadrant q3 ${type === 'secure' ? 'active' : ''}">
                    <span class="q-icon">🛡️</span>
                    <span class="q-name">安全型</span>
                  </div>
                  <div class="quadrant q4 ${type === 'avoidant' ? 'active' : ''}">
                    <span class="q-icon">🏔️</span>
                    <span class="q-name">回避型</span>
                  </div>
                </div>
                <div class="quadrant-labels">
                  <span class="label-top">高焦虑</span>
                  <span class="label-bottom">低焦虑</span>
                  <span class="label-left">低回避</span>
                  <span class="label-right">高回避</span>
                </div>
                <!-- 用户位置点 -->
                <div class="user-dot" style="left: ${dimensions.avoidance}%; bottom: ${100 - dimensions.anxiety}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 成长建议 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">成长建议</h3>
          </div>
          <div class="card-body">
            <div class="advice-box" style="background: ${typeInfo.color}10; border-left: 4px solid ${typeInfo.color};">
              <p>${typeInfo.advice}</p>
            </div>
          </div>
        </div>

        <!-- AI 深度分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">AI 深度分析</h3>
          </div>
          <div class="card-body">
            <div id="attachmentAnalysis">
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
              <button class="btn btn-primary" onclick="AttachmentReport.regenerateAnalysis('${id}')">
                重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="AttachmentReport.exportReport('${id}')">
                导出报告
              </button>
              <button class="btn btn-secondary" onclick="AttachmentReport.copyResult('${id}')">
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
    if (document.getElementById('attachment-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'attachment-report-styles';
    style.textContent = `
      .attachment-result {
        text-align: center;
      }

      .attachment-type-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg) var(--spacing-2xl);
        border: 2px solid;
        border-radius: var(--radius-xl);
      }

      .type-icon {
        font-size: 2.5rem;
      }

      .type-name {
        font-size: var(--font-size-2xl);
        font-weight: 700;
      }

      .type-description {
        font-size: var(--font-size-lg);
        color: var(--text-secondary);
        line-height: 1.8;
        max-width: 600px;
        margin: 0 auto;
      }

      .traits-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        justify-content: center;
      }

      .trait-tag {
        padding: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .attachment-dimensions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .attachment-dimension {
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .quadrant-chart {
        position: relative;
        width: 280px;
        height: 280px;
        margin: 0 auto;
      }

      .quadrant-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        width: 100%;
        height: 100%;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .quadrant {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        background: var(--bg-secondary);
        transition: all var(--transition-fast);
      }

      .quadrant.active {
        background: var(--color-primary);
        color: white;
      }

      .quadrant.active .q-name {
        color: white;
      }

      .q-icon {
        font-size: 1.5rem;
      }

      .q-name {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--text-secondary);
      }

      .quadrant-labels {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .quadrant-labels span {
        position: absolute;
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
      }

      .label-top { top: -20px; left: 50%; transform: translateX(-50%); }
      .label-bottom { bottom: -20px; left: 50%; transform: translateX(-50%); }
      .label-left { left: -45px; top: 50%; transform: translateY(-50%); }
      .label-right { right: -45px; top: 50%; transform: translateY(-50%); }

      .user-dot {
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--color-primary);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: translate(-50%, 50%);
        z-index: 10;
      }

      .advice-box {
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-base);
        line-height: 1.8;
      }

      @media (max-width: 640px) {
        .attachment-type-badge {
          padding: var(--spacing-md) var(--spacing-lg);
        }

        .type-icon {
          font-size: 2rem;
        }

        .type-name {
          font-size: var(--font-size-xl);
        }

        .type-description {
          font-size: var(--font-size-base);
        }

        .quadrant-chart {
          width: 240px;
          height: 240px;
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('attachmentAnalysis');
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
    Utils.StreamAnalyzer.init('#attachmentAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业的心理学分析师，擅长依恋理论分析，用温暖、积极的语气提供个性化建议。' },
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
    const { type, typeInfo, dimensions } = result;
    
    return `你是一位专业的心理学分析师，请根据用户的依恋类型测试结果进行深入分析。

## 测试结果

- 依恋类型: ${typeInfo.name}
- 焦虑维度: ${dimensions.anxiety}% (对被抛弃的恐惧程度)
- 回避维度: ${dimensions.avoidance}% (对亲密关系的回避程度)

## 类型说明
${typeInfo.description}

## 请提供以下分析

1. **依恋模式解读**：深入分析用户的依恋模式是如何形成的，可能与早期经历有什么关联
2. **关系中的表现**：分析这种依恋类型在亲密关系中可能的表现模式
3. **优势与挑战**：指出这种依恋类型的独特优势和可能面临的挑战
4. **成长路径**：提供具体的建议，帮助用户向更安全的依恋模式发展
5. **与不同类型相处**：分析如何与其他依恋类型的人建立健康关系

请用温暖、积极的语气进行分析，注重正面引导，避免贴标签或负面评判。用 markdown 格式输出。`;
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
    const filename = `attachment-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;
    const { typeInfo, dimensions } = result;

    let text = `# 依恋类型测试报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 依恋类型

**${typeInfo.name}** ${typeInfo.icon}

${typeInfo.description}

## 维度分析

- 焦虑维度: ${dimensions.anxiety}%
- 回避维度: ${dimensions.avoidance}%

## 核心特质

${typeInfo.traits.map(t => `- ${t}`).join('\n')}

## 成长建议

${typeInfo.advice}

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
window.AttachmentReport = AttachmentReport;
