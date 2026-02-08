/**
 * report-renderer.js - 报告渲染与导出
 * 观己 - 静观己心，内外澄明
 * 
 * 从 comprehensive.js 拆分
 * 职责：渲染综合报告、生成报告文本、导出和复制功能
 */

/**
 * 渲染报告预览
 * @param {Object} report - 报告数据
 * @returns {string} HTML字符串
 */
Comprehensive.renderReportPreview = function(report) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近的综合分析报告</h3>
        <span class="text-tertiary">${Utils.formatDate(report.timestamp, 'YYYY-MM-DD HH:mm')}</span>
      </div>
      <div class="card-body">
        <div class="markdown-body" style="max-height: 400px; overflow-y: auto;">
          ${Utils.renderMarkdown(report.result.aiAnalysis || '暂无分析内容')}
        </div>
      </div>
      <div class="card-footer">
        <div class="flex gap-md justify-end">
          <button class="btn btn-secondary" onclick="Comprehensive.exportReport('${report.id}')">
            📄 导出报告
          </button>
          <a href="#/report/${report.id}" class="btn btn-primary">查看完整报告</a>
        </div>
      </div>
    </div>
  `;
};

/**
 * 渲染综合报告
 * @param {HTMLElement} container - 容器元素
 * @param {Object} testData - 测试数据
 */
Comprehensive.renderReport = function(container, testData) {
  const { result, timestamp, data, id } = testData;

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <!-- 报告头部 -->
      <div class="card mb-lg">
        <div class="card-body" style="padding: var(--spacing-2xl);">
          <div class="text-center">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🎯</div>
            <h1 class="font-bold" style="font-size: var(--font-size-3xl);">综合画像分析报告</h1>
            <p class="text-secondary mt-md">
              测试时间：${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}
            </p>
          </div>
        </div>
      </div>

      <!-- 数据来源概览 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">数据来源</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-3 gap-md">
            ${data.mbti ? `
              <div class="text-center p-md">
                <div style="font-size: 2rem;">🧠</div>
                <div class="font-bold mt-sm">${data.mbti.type}</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">MBTI 类型</div>
              </div>
            ` : ''}
            ${data.bigfive ? `
              <div class="text-center p-md">
                <div style="font-size: 2rem;">🌟</div>
                <div class="font-bold mt-sm">已完成</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">大五人格</div>
              </div>
            ` : ''}
            ${data.holland ? `
              <div class="text-center p-md">
                <div style="font-size: 2rem;">💼</div>
                <div class="font-bold mt-sm">${data.holland.hollandCode}</div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">霍兰德代码</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- 综合分析内容 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">综合画像分析</h3>
        </div>
        <div class="card-body" id="comprehensiveAnalysis">
          ${result.aiAnalysis ? 
            `<div class="markdown-body">${Utils.renderMarkdown(result.aiAnalysis)}</div>` :
            '<div class="text-center text-secondary p-lg">正在准备分析...</div>'
          }
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card">
        <div class="card-body">
          <div class="flex gap-md justify-center flex-wrap">
            <button class="btn btn-primary" onclick="Comprehensive.regenerateAnalysis('${id}')">
              🔄 重新生成分析
            </button>
            <button class="btn btn-secondary" onclick="Comprehensive.exportReport('${id}')">
              📄 导出报告
            </button>
            <button class="btn btn-secondary" onclick="Comprehensive.copyResult('${id}')">
              📋 复制结果
            </button>
            <a href="#/test" class="btn btn-outline">返回测试列表</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // 如果没有分析结果，流式生成
  if (!result.aiAnalysis) {
    this.streamGenerateAnalysis(testData);
  }
};

/**
 * 生成报告文本
 * @param {Object} report - 报告数据
 * @returns {string} Markdown格式的报告文本
 */
Comprehensive.generateReportText = function(report) {
  const { result, timestamp, data } = report;

  let text = `# 综合画像分析报告

**生成时间**: ${Utils.formatDate(timestamp, 'YYYY年MM月DD日 HH:mm')}

## 数据来源

`;

  if (data.mbti) {
    text += `- **MBTI**: ${data.mbti.type}\n`;
  }
  if (data.bigfive) {
    text += `- **大五人格**: 已完成\n`;
  }
  if (data.holland) {
    text += `- **霍兰德代码**: ${data.holland.hollandCode}\n`;
  }

  text += `
## 综合分析

${result.aiAnalysis || '暂无分析内容'}

---
*报告由「观己」生成 - 静观己心，内外澄明*`;

  return text;
};

/**
 * 导出报告
 * @param {string} reportId - 报告ID
 */
Comprehensive.exportReport = async function(reportId) {
  const report = await Storage.get('tests', reportId);
  if (!report) return;

  const content = this.generateReportText(report);
  const filename = `comprehensive-report-${Utils.formatDate(report.timestamp, 'YYYYMMDD')}.md`;
  Utils.downloadFile(content, filename);
  Utils.showToast('报告导出成功', 'success');
};

/**
 * 复制结果
 * @param {string} reportId - 报告ID
 */
Comprehensive.copyResult = async function(reportId) {
  const report = await Storage.get('tests', reportId);
  if (!report) return;

  const text = this.generateReportText(report);
  await Utils.copyToClipboard(text);
  Utils.showToast('结果已复制到剪贴板', 'success');
};
