/**
 * report.js - 价值观测试报告生成
 * 观己 - 静观己心，内外澄明
 */

const ValuesReport = {
  /**
   * 渲染报告
   */
  render(container, testData) {
    const { result, timestamp, id } = testData;
    const { coreValues, ranked, valueProfile, dimensionScores } = result;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="text-center">
              <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💎</div>
              <h1 class="font-bold" style="font-size: var(--font-size-3xl);">价值观测试报告</h1>
              <p class="text-secondary mt-md">
                测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
              </p>
            </div>
          </div>
        </div>

        <!-- 核心价值观 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">核心价值观 TOP 3</h3>
          </div>
          <div class="card-body">
            <div class="core-values-display">
              ${coreValues.map((v, index) => `
                <div class="core-value-item rank-${index + 1}">
                  <div class="value-rank">${index + 1}</div>
                  <div class="value-icon" style="background: ${v.info.color}20;">${v.info.icon}</div>
                  <div class="value-info">
                    <span class="value-name" style="color: ${v.info.color};">${v.info.name}</span>
                    <span class="value-desc">${v.info.description}</span>
                  </div>
                  <div class="value-score" style="color: ${v.info.color};">${v.score}%</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 价值取向分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">价值取向分析</h3>
          </div>
          <div class="card-body">
            <div class="value-orientation">
              <div class="orientation-item">
                <div class="orientation-label">
                  <span class="orientation-icon">🧭</span>
                  ${valueProfile.primaryOrientation.name}
                </div>
                <div class="orientation-desc">${valueProfile.primaryOrientation.desc}</div>
              </div>
              <div class="orientation-item">
                <div class="orientation-label">
                  <span class="orientation-icon">🔄</span>
                  ${valueProfile.secondaryOrientation.name}
                </div>
                <div class="orientation-desc">${valueProfile.secondaryOrientation.desc}</div>
              </div>
            </div>

            <!-- 四维对比 -->
            <div class="value-quadrant mt-xl">
              <div class="quadrant-row">
                <div class="quadrant-item">
                  <span class="q-label">利他超越</span>
                  <div class="q-bar">
                    <div class="q-fill" style="width: ${valueProfile.selfTranscendence}%; background: #10b981;"></div>
                  </div>
                  <span class="q-score">${valueProfile.selfTranscendence}%</span>
                </div>
                <div class="quadrant-item">
                  <span class="q-label">自我提升</span>
                  <div class="q-bar">
                    <div class="q-fill" style="width: ${valueProfile.selfEnhancement}%; background: #f59e0b;"></div>
                  </div>
                  <span class="q-score">${valueProfile.selfEnhancement}%</span>
                </div>
              </div>
              <div class="quadrant-row">
                <div class="quadrant-item">
                  <span class="q-label">开放求变</span>
                  <div class="q-bar">
                    <div class="q-fill" style="width: ${valueProfile.openness}%; background: #8b5cf6;"></div>
                  </div>
                  <span class="q-score">${valueProfile.openness}%</span>
                </div>
                <div class="quadrant-item">
                  <span class="q-label">稳定保守</span>
                  <div class="q-bar">
                    <div class="q-fill" style="width: ${valueProfile.conservation}%; background: #6366f1;"></div>
                  </div>
                  <span class="q-score">${valueProfile.conservation}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 完整排名 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">十大价值维度排名</h3>
          </div>
          <div class="card-body">
            <div class="values-ranking">
              ${ranked.map(v => `
                <div class="ranking-item">
                  <span class="ranking-num">${v.rank}</span>
                  <span class="ranking-icon">${v.info.icon}</span>
                  <span class="ranking-name">${v.info.name}</span>
                  <div class="ranking-bar-container">
                    <div class="ranking-bar">
                      <div class="ranking-fill" style="width: ${v.score}%; background: ${v.info.color};"></div>
                    </div>
                  </div>
                  <span class="ranking-score" style="color: ${v.info.color};">${v.score}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- AI 深度分析 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">AI 深度分析</h3>
          </div>
          <div class="card-body">
            <div id="valuesAnalysis">
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
              <button class="btn btn-primary" onclick="ValuesReport.regenerateAnalysis('${id}')">
                重新生成分析
              </button>
              <button class="btn btn-secondary" onclick="ValuesReport.exportReport('${id}')">
                导出报告
              </button>
              <button class="btn btn-secondary" onclick="ValuesReport.copyResult('${id}')">
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
    if (document.getElementById('values-report-styles')) return;

    const style = document.createElement('style');
    style.id = 'values-report-styles';
    style.textContent = `
      .core-values-display {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .core-value-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        transition: transform var(--transition-fast);
      }

      .core-value-item:hover {
        transform: translateX(4px);
      }

      .core-value-item.rank-1 {
        border-left: 4px solid #f59e0b;
      }

      .core-value-item.rank-2 {
        border-left: 4px solid #94a3b8;
      }

      .core-value-item.rank-3 {
        border-left: 4px solid #cd7c3f;
      }

      .value-rank {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary);
        border-radius: 50%;
        font-weight: 700;
        font-size: var(--font-size-lg);
      }

      .rank-1 .value-rank { background: #f59e0b20; color: #f59e0b; }
      .rank-2 .value-rank { background: #94a3b820; color: #94a3b8; }
      .rank-3 .value-rank { background: #cd7c3f20; color: #cd7c3f; }

      .value-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        font-size: 1.5rem;
      }

      .value-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .value-name {
        font-weight: 600;
        font-size: var(--font-size-lg);
      }

      .value-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .value-score {
        font-size: var(--font-size-xl);
        font-weight: 700;
      }

      .value-orientation {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
      }

      .orientation-item {
        padding: var(--spacing-lg);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        text-align: center;
      }

      .orientation-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-sm);
      }

      .orientation-icon {
        font-size: 1.25rem;
      }

      .orientation-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .value-quadrant {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .quadrant-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
      }

      .quadrant-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .q-label {
        width: 80px;
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .q-bar {
        flex: 1;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
      }

      .q-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .q-score {
        width: 45px;
        text-align: right;
        font-weight: 600;
        font-size: var(--font-size-sm);
      }

      .values-ranking {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .ranking-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
      }

      .ranking-num {
        width: 24px;
        font-weight: 600;
        color: var(--text-tertiary);
      }

      .ranking-icon {
        font-size: 1.25rem;
      }

      .ranking-name {
        width: 60px;
        font-weight: 500;
      }

      .ranking-bar-container {
        flex: 1;
      }

      .ranking-bar {
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
      }

      .ranking-fill {
        height: 100%;
        border-radius: 3px;
      }

      .ranking-score {
        width: 45px;
        text-align: right;
        font-weight: 600;
        font-size: var(--font-size-sm);
      }

      @media (max-width: 640px) {
        .core-value-item {
          flex-wrap: wrap;
        }

        .value-info {
          flex: 100%;
          order: 3;
          margin-top: var(--spacing-sm);
        }

        .value-score {
          margin-left: auto;
        }

        .value-orientation {
          grid-template-columns: 1fr;
        }

        .quadrant-row {
          grid-template-columns: 1fr;
        }

        .ranking-name {
          width: 50px;
          font-size: var(--font-size-sm);
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 生成 AI 分析（流式）
   */
  async generateAnalysis(testData) {
    const container = document.getElementById('valuesAnalysis');
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
    Utils.StreamAnalyzer.init('#valuesAnalysis');

    try {
      const prompt = this.buildPrompt(testData.result);
      const messages = [
        { role: 'system', content: '你是一位专业的心理学分析师，擅长价值观分析，用温暖、积极的语气提供个性化建议。' },
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
    const { coreValues, ranked, valueProfile } = result;

    return `你是一位专业的心理学分析师，请根据用户的价值观测试结果进行深入分析。

## 测试结果

### 核心价值观 (Top 3)
${coreValues.map((v, i) => `${i + 1}. ${v.info.name} (${v.score}%) - ${v.info.description}`).join('\n')}

### 十大价值维度排名
${ranked.map(v => `- ${v.info.name}: ${v.score}%`).join('\n')}

### 价值取向
- 利他超越 vs 自我提升: ${valueProfile.selfTranscendence}% vs ${valueProfile.selfEnhancement}%
- 开放求变 vs 稳定保守: ${valueProfile.openness}% vs ${valueProfile.conservation}%
- 主要取向: ${valueProfile.primaryOrientation.name}
- 次要取向: ${valueProfile.secondaryOrientation.name}

## 请提供以下分析

1. **价值观画像**：基于核心价值观和取向，描述用户的价值观特点
2. **生活决策影响**：这些价值观如何影响用户的日常决策和选择
3. **职业建议**：基于价值观特点，推荐适合的职业方向和工作环境
4. **人际关系**：价值观如何影响用户的人际关系和社交选择
5. **价值观整合**：如何在不同价值观之间找到平衡，活出更和谐的人生

请用温暖、积极的语气进行分析，尊重每种价值观的独特性，避免价值判断。用 markdown 格式输出。`;
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
    const filename = `values-report-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(testData) {
    const { result, timestamp } = testData;
    const { coreValues, ranked, valueProfile } = result;

    let text = `# 价值观测试报告

**测试时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 核心价值观 TOP 3

${coreValues.map((v, i) => `${i + 1}. **${v.info.name}** (${v.score}%) - ${v.info.description}`).join('\n')}

## 价值取向

- ${valueProfile.primaryOrientation.name}: ${valueProfile.primaryOrientation.desc}
- ${valueProfile.secondaryOrientation.name}: ${valueProfile.secondaryOrientation.desc}

## 十大价值维度

${ranked.map(v => `- ${v.info.name}: ${v.score}%`).join('\n')}

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
window.ValuesReport = ValuesReport;
