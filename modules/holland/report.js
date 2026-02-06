/**
 * report.js - 霍兰德职业兴趣测试报告生成
 * 观己 - 静观己心，内外澄明
 */

const HollandReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const { hollandCode, dimensions, topThree } = result;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💼</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">霍兰德职业兴趣报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- Holland Code -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">你的职业代码</h3>
          </div>
          <div class="card-body">
            <div class="holland-code-display">
              ${hollandCode.split('').map((code, index) => {
                const dim = Holland.dimensions[code];
                return `
                  <div class="code-item" style="--code-color: ${dim.color};">
                    <div class="code-icon">${dim.icon}</div>
                    <div class="code-letter">${code}</div>
                    <div class="code-name">${dim.name}</div>
                    <div class="code-rank">#${index + 1}</div>
                  </div>
                `;
              }).join('')}
            </div>
            <p class="text-center text-secondary mt-lg">
              你的 Holland 职业代码是 <strong style="color: var(--color-primary);">${hollandCode}</strong>
            </p>
          </div>
        </div>

        <!-- 维度分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">六维度分析</h3>
          </div>
          <div class="card-body">
            <div class="holland-hexagon">
              ${Object.entries(dimensions).map(([dim, score]) => {
                const info = Holland.dimensions[dim];
                return `
                  <div class="holland-dimension">
                    <div class="dimension-header">
                      <span class="dimension-icon">${info.icon}</span>
                      <span class="dimension-name">${info.name} (${dim})</span>
                      <span class="dimension-score" style="color: ${info.color};">${score}%</span>
                    </div>
                    <div class="dimension-bar">
                      <div class="dimension-fill" style="width: ${score}%; background-color: ${info.color};"></div>
                    </div>
                    <div class="dimension-desc">
                      ${Holland.getCodeDescription(dim)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 职业建议 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">职业方向建议</h3>
          </div>
          <div class="card-body">
            <div class="career-suggestions">
              ${topThree.map(({ code, name, score }, index) => {
                const dim = Holland.dimensions[code];
                return `
                  <div class="career-category">
                    <h4 class="category-title">
                      <span class="category-icon">${dim.icon}</span>
                      ${name}类职业
                      <span class="category-match" style="color: ${dim.color};">匹配度 ${score}%</span>
                    </h4>
                    <div class="career-list">
                      ${dim.careers.map(career => `
                        <span class="career-tag" style="border-color: ${dim.color}; color: ${dim.color};">
                          ${career}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- AI 详细解读 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">详细解读</h3>
          </div>
          <div class="card-body">
            <div id="hollandAnalysis">
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
              <button class="btn btn-primary" onclick="HollandReport.regenerateAnalysis('${id}')">
                🔄 重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="HollandReport.exportReport('${id}')">
                📄 导出报告
              </button>
              <button class="btn btn-secondary" onclick="HollandReport.copyResult('${id}')">
                📋 复制结果
              </button>
              <a href="#/test" class="btn btn-outline">返回测试列表</a>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.generateAnalysis(testData);
  },

  /**
   * 添加报告样式
   */
  addStyles() {
    if (document.getElementById('holland-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'holland-report-styles';
    style.textContent = `
      .holland-code-display {
        display: flex;
        justify-content: center;
        gap: var(--spacing-xl);
        padding: var(--spacing-xl);
      }

      .code-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-xl);
        border: 2px solid var(--code-color);
        min-width: 100px;
      }

      .code-icon {
        font-size: 2.5rem;
      }

      .code-letter {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--code-color);
      }

      .code-name {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .code-rank {
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
        background: var(--bg-tertiary);
        padding: 2px 8px;
        border-radius: var(--radius-full);
      }

      .holland-hexagon {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .holland-dimension {
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .career-suggestions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .career-category {
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
      }

      .category-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        font-size: var(--font-size-lg);
      }

      .category-icon {
        font-size: 1.5rem;
      }

      .category-match {
        margin-left: auto;
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .career-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
      }

      .career-tag {
        padding: var(--spacing-xs) var(--spacing-md);
        border: 1px solid;
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        background: var(--bg-primary);
      }

      @media (max-width: 640px) {
        .holland-code-display {
          flex-wrap: wrap;
        }

        .code-item {
          min-width: 80px;
          padding: var(--spacing-md);
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('hollandAnalysis');
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

    if (testData.result.aiAnalysis) {
      container.innerHTML = `<div class="markdown-body">${Utils.renderMarkdown(testData.result.aiAnalysis)}</div>`;
      return;
    }

    // 初始化流式分析容器
    Utils.StreamAnalyzer.init('#hollandAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业的职业规划师，擅长霍兰德职业兴趣分析，提供实用的职业发展建议。' },
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
    const { hollandCode, dimensions, topThree } = result;
    
    return `你是一位专业的职业规划师，请根据用户的霍兰德职业兴趣测试结果进行深入分析。

## 测试结果

**职业代码**: ${hollandCode}

**各维度得分**:
${Object.entries(dimensions).map(([dim, score]) => {
  const name = Holland.dimensions[dim]?.name || dim;
  return `- ${name} (${dim}): ${score}%`;
}).join('\n')}

**主导类型**:
${topThree.map((t, i) => `${i + 1}. ${t.name} (${t.code}): ${t.score}%`).join('\n')}

## 请提供以下分析

1. **职业兴趣画像**：基于霍兰德代码的综合分析，描述用户的职业兴趣特征
2. **优势分析**：根据主导类型，分析用户在职场中的独特优势
3. **职业发展建议**：
   - 推荐具体的职业方向和岗位
   - 适合的工作环境类型
   - 职业发展路径建议
4. **学习发展建议**：推荐相关的技能提升方向和学习资源
5. **注意事项**：在职业选择中需要注意的问题和平衡点

请用专业但易懂的语言进行分析，每个部分用 markdown 格式输出。`;
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
    const filename = `holland-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;

    let text = `# 霍兰德职业兴趣测试报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 职业代码

**${result.hollandCode}**

## 各维度得分

${Object.entries(result.dimensions).map(([dim, score]) => {
  const name = Holland.dimensions[dim]?.name || dim;
  return `- ${name} (${dim}): ${score}%`;
}).join('\n')}

## 主导类型

${result.topThree.map((t, i) => `${i + 1}. ${t.name}: ${t.score}%`).join('\n')}

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
window.HollandReport = HollandReport;
