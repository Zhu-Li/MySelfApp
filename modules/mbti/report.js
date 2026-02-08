/**
 * report.js - MBTI 报告生成与展示
 * 观己 - 静观己心，内外澄明
 */

const MBTIReport = {
  /**
   * 渲染报告页面
   */
  async render(container, testData) {
    const { result } = testData;
    const typeInfo = MBTI.getTypeDescription(result.type);
    const color = Utils.getMBTIColor(result.type);

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <!-- 报告头部 -->
        <div class="card mb-lg" style="background: linear-gradient(135deg, ${color}15 0%, ${color}05 100%);">
          <div class="card-body" style="padding: var(--spacing-2xl);">
            <div class="flex items-center gap-xl">
              <div class="avatar" style="width: 100px; height: 100px; font-size: 2.5rem; background-color: ${color}20; color: ${color};">
                ${result.type}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-md mb-sm">
                  <h1 class="font-bold" style="font-size: var(--font-size-3xl); color: ${color};">${result.type}</h1>
                  <span class="badge" style="background-color: ${color}20; color: ${color};">${typeInfo.title}</span>
                </div>
                <p class="text-secondary" style="font-size: var(--font-size-lg);">${typeInfo.summary}</p>
                <p class="text-tertiary mt-md" style="font-size: var(--font-size-sm);">
                  测试时间：${Utils.formatDate(testData.timestamp, 'YYYY-MM-DD HH:mm')}
                </p>
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
            <div class="grid grid-cols-2 gap-xl">
              ${this.renderDimensionBar('E', 'I', '外向', '内向', result.dimensions, color)}
              ${this.renderDimensionBar('S', 'N', '感觉', '直觉', result.dimensions, color)}
              ${this.renderDimensionBar('T', 'F', '思考', '情感', result.dimensions, color)}
              ${this.renderDimensionBar('J', 'P', '判断', '知觉', result.dimensions, color)}
            </div>
          </div>
        </div>

        <!-- 性格特质标签 -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">核心特质</h3>
          </div>
          <div class="card-body">
            <div class="flex flex-wrap gap-sm">
              ${typeInfo.traits.map(trait => `
                <span class="badge" style="background-color: ${color}15; color: ${color}; padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-base);">
                  ${trait}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- AI 分析报告 -->
        <div class="card mb-lg" id="aiAnalysisCard">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="card-title">AI 深度分析</h3>
              ${result.aiAnalysis ? '' : `
                <button class="btn btn-primary btn-sm" onclick="MBTIReport.generateAIAnalysis('${testData.id}')" id="generateAIBtn">
                  生成分析报告
                </button>
              `}
            </div>
          </div>
          <div class="card-body" id="aiAnalysisContent">
            ${result.aiAnalysis ? 
              `<div class="prose">${this.renderMarkdown(result.aiAnalysis)}</div>` :
              `<div class="empty-state" style="padding: var(--spacing-xl);">
                <div class="empty-state-icon">🤖</div>
                <h4 class="empty-state-title">AI 分析报告</h4>
                <p class="empty-state-desc">点击上方按钮，让 AI 为你生成个性化的深度分析报告</p>
              </div>`
            }
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card">
          <div class="card-body">
            <div class="flex gap-md justify-end">
              <button class="btn btn-secondary" onclick="MBTIReport.exportReport('${testData.id}')">
                📥 导出报告
              </button>
              <button class="btn btn-secondary" onclick="MBTIReport.copyReport('${testData.id}')">
                📋 复制文本
              </button>
              <a href="#/mbti/test" class="btn btn-outline">
                🔄 重新测试
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染维度条形图
   */
  renderDimensionBar(dim1, dim2, label1, label2, dimensions, color) {
    const value1 = dimensions[dim1];
    const value2 = dimensions[dim2];
    const dominant = value1 >= value2 ? dim1 : dim2;

    return `
      <div class="bar-item">
        <div class="flex justify-between mb-sm">
          <span class="font-medium ${dominant === dim1 ? '' : 'text-tertiary'}">${label1} (${dim1})</span>
          <span class="font-medium ${dominant === dim2 ? '' : 'text-tertiary'}">${label2} (${dim2})</span>
        </div>
        <div class="flex items-center gap-sm">
          <span class="text-sm font-semibold" style="width: 40px; text-align: right; color: ${dominant === dim1 ? color : 'var(--text-tertiary)'};">${value1}%</span>
          <div class="flex-1 flex" style="height: 12px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: ${value1}%; background: ${dominant === dim1 ? color : 'var(--text-tertiary)'}; transition: width 0.5s ease;"></div>
            <div style="width: ${value2}%; background: ${dominant === dim2 ? color : 'var(--text-tertiary)'}; opacity: 0.4; transition: width 0.5s ease;"></div>
          </div>
          <span class="text-sm font-semibold" style="width: 40px; color: ${dominant === dim2 ? color : 'var(--text-tertiary)'};">${value2}%</span>
        </div>
      </div>
    `;
  },

  /**
   * 生成 AI 分析报告（流式）
   */
  async generateAIAnalysis(testId) {
    const btn = document.getElementById('generateAIBtn');
    const contentWrapper = document.getElementById('aiAnalysisContent');

    // 验证 API 配置和密钥有效性
    const canUseAPI = await API.checkAndPrompt();
    if (!canUseAPI) {
      return;
    }

    // 禁用按钮
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner loading-spinner-sm"></span> 生成中...';
    }

    // 初始化流式分析容器
    Utils.StreamAnalyzer.init('#aiAnalysisContent');

    try {
      // 获取测试数据
      const testData = await Storage.get('tests', testId);
      if (!testData || !testData.result) {
        throw new Error('测试数据不存在');
      }

      // 构建消息
      const { type, dimensions } = testData.result;
      const prompt = `你是一位专业的心理分析师。根据用户的MBTI测试结果，提供个性化的性格分析报告。

用户测试结果：
- 类型：${type}
- 各维度得分：
  - 外向(E) ${dimensions.E}% vs 内向(I) ${dimensions.I}%
  - 感觉(S) ${dimensions.S}% vs 直觉(N) ${dimensions.N}%
  - 思考(T) ${dimensions.T}% vs 情感(F) ${dimensions.F}%
  - 判断(J) ${dimensions.J}% vs 知觉(P) ${dimensions.P}%

请从以下方面进行分析，使用 Markdown 格式输出：

## 性格特征概述
（约200字，描述该类型的核心特征）

## 核心优势
（列出3-5个优势，每个用一句话解释）

## 潜在挑战
（列出3-5个挑战，每个用一句话解释）

## 职业发展建议
（基于性格特点给出适合的职业方向和发展建议）

## 人际关系特点
（描述在社交、友情、爱情中的表现特点）

## 个人成长建议
（给出3-5条具体可操作的成长建议）`;

      const messages = [
        { role: 'system', content: '你是一位专业、温和的心理分析师，擅长 MBTI 性格分析。' },
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

      // 更新测试记录
      testData.result.aiAnalysis = fullContent;
      await Storage.saveTest(testData);

      // 移除生成按钮
      if (btn) btn.remove();

      Utils.showToast('分析报告生成成功', 'success');

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
        Utils.StreamAnalyzer.showError(errorMsg || '请检查网络连接和 API 配置');
      }
      
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '重试';
      }
      
      Utils.showToast('分析报告生成失败', 'error');
    }
  },

  /**
   * 简单的 Markdown 渲染
   */
  renderMarkdown(text) {
    if (!text) return '';

    return text
      // 标题
      .replace(/^### (.+)$/gm, '<h4 class="font-semibold mt-lg mb-sm" style="font-size: var(--font-size-lg);">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="font-bold mt-xl mb-md" style="font-size: var(--font-size-xl);">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="font-bold mt-xl mb-md" style="font-size: var(--font-size-2xl);">$1</h2>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="ml-lg">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-lg" style="list-style: decimal;">$2</li>')
      // 段落
      .replace(/\n\n/g, '</p><p class="mb-md">')
      // 换行
      .replace(/\n/g, '<br>')
      // 包装
      .replace(/^/, '<p class="mb-md">')
      .replace(/$/, '</p>')
      // 修复列表
      .replace(/<\/p><li/g, '<ul class="mb-md"><li')
      .replace(/<\/li><p/g, '</li></ul><p');
  },

  /**
   * 导出报告
   */
  async exportReport(testId) {
    try {
      const testData = await Storage.get('tests', testId);
      if (!testData) {
        Utils.showToast('报告数据不存在', 'error');
        return;
      }

      const report = this.generateTextReport(testData);
      const filename = `MBTI报告-${testData.result.type}-${Utils.formatDate(testData.timestamp, 'YYYYMMDD')}.txt`;
      
      Utils.downloadFile(report, filename, 'text/plain');
      Utils.showToast('报告导出成功', 'success');

    } catch (error) {
      Utils.showToast('导出失败', 'error');
    }
  },

  /**
   * 复制报告文本
   */
  async copyReport(testId) {
    try {
      const testData = await Storage.get('tests', testId);
      if (!testData) {
        Utils.showToast('报告数据不存在', 'error');
        return;
      }

      const report = this.generateTextReport(testData);
      const success = await Utils.copyToClipboard(report);
      
      if (success) {
        Utils.showToast('已复制到剪贴板', 'success');
      } else {
        Utils.showToast('复制失败', 'error');
      }

    } catch (error) {
      Utils.showToast('复制失败', 'error');
    }
  },

  /**
   * 生成纯文本报告
   */
  generateTextReport(testData) {
    const { result, timestamp } = testData;
    const typeInfo = MBTI.getTypeDescription(result.type);

    let report = `
========================================
        MBTI 性格测试报告
========================================

测试时间：${Utils.formatDate(timestamp, 'YYYY-MM-DD HH:mm')}

【测试结果】
类型：${result.type} - ${typeInfo.title}
描述：${typeInfo.summary}

【维度分析】
外向(E) ${result.dimensions.E}% vs 内向(I) ${result.dimensions.I}%
感觉(S) ${result.dimensions.S}% vs 直觉(N) ${result.dimensions.N}%
思考(T) ${result.dimensions.T}% vs 情感(F) ${result.dimensions.F}%
判断(J) ${result.dimensions.J}% vs 知觉(P) ${result.dimensions.P}%

【核心特质】
${typeInfo.traits.map(t => '• ' + t).join('\n')}
`;

    if (result.aiAnalysis) {
      report += `
【AI 深度分析】
${result.aiAnalysis}
`;
    }

    report += `
========================================
     由「观己」生成 - 静观己心，内外澄明
========================================
`;

    return report.trim();
  }
};

// 导出到全局
window.MBTIReport = MBTIReport;
