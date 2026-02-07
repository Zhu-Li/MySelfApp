/**
 * comprehensive.js - 综合分析模块
 * 观己 - 静观己心，内外澄明
 * 
 * 整合 MBTI、大五人格、霍兰德职业兴趣测试结果，生成综合用户画像
 */

const Comprehensive = {
  /**
   * 检查是否有足够的测试数据进行综合分析
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
   * 构建综合分析提示词
   */
  buildPrompt(data) {
    let prompt = `你是一位资深的心理学专家和职业规划师，请根据用户完成的多项测评结果，进行深度综合分析，绘制完整的用户画像。

## 测评结果汇总

`;

    // MBTI 结果
    if (data.mbti) {
      const mbtiName = Utils.getMBTIName(data.mbti.type);
      prompt += `### MBTI 性格类型
- **类型**: ${data.mbti.type} (${mbtiName})
- **各维度**:
  - E/I (外向/内向): E ${data.mbti.dimensions.E}% / I ${data.mbti.dimensions.I}%
  - S/N (感觉/直觉): S ${data.mbti.dimensions.S}% / N ${data.mbti.dimensions.N}%
  - T/F (思考/情感): T ${data.mbti.dimensions.T}% / F ${data.mbti.dimensions.F}%
  - J/P (判断/知觉): J ${data.mbti.dimensions.J}% / P ${data.mbti.dimensions.P}%

`;
    }

    // 大五人格结果
    if (data.bigfive) {
      prompt += `### 大五人格
- 开放性 (O): ${data.bigfive.dimensions.O}%
- 尽责性 (C): ${data.bigfive.dimensions.C}%
- 外向性 (E): ${data.bigfive.dimensions.E}%
- 宜人性 (A): ${data.bigfive.dimensions.A}%
- 神经质性 (N): ${data.bigfive.dimensions.N}%

`;
    }

    // 霍兰德结果
    if (data.holland) {
      prompt += `### 霍兰德职业兴趣
- **职业代码**: ${data.holland.hollandCode}
- **各维度**:
  - 实际型 (R): ${data.holland.dimensions.R}%
  - 研究型 (I): ${data.holland.dimensions.I}%
  - 艺术型 (A): ${data.holland.dimensions.A}%
  - 社会型 (S): ${data.holland.dimensions.S}%
  - 企业型 (E): ${data.holland.dimensions.E}%
  - 常规型 (C): ${data.holland.dimensions.C}%

`;
    }

    // 日记情绪数据
    if (data.diary && data.diary.length > 0) {
      const moodStats = {};
      data.diary.forEach(d => {
        if (d.mood) {
          moodStats[d.mood] = (moodStats[d.mood] || 0) + 1;
        }
      });
      const moodSummary = Object.entries(moodStats)
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => `${mood}: ${count}次`)
        .join('、');
      
      prompt += `### 日记情绪记录（最近${data.diary.length}篇）
- **情绪分布**: ${moodSummary || '无情绪标签'}
- **近期日记摘要**:
${data.diary.slice(0, 5).map(d => `  - [${d.date}] ${d.mood || ''} ${d.content?.substring(0, 50) || ''}...`).join('\n')}

`;
    }

    // 关系网数据
    if (data.contacts && data.contacts.length > 0) {
      const mbtiContacts = data.contacts.filter(c => c.mbtiType);
      prompt += `### 人际关系网络（${data.contacts.length}人）
- **关系网概览**: 共导入 ${data.contacts.length} 位联系人数据
${mbtiContacts.length > 0 ? `- **联系人MBTI类型分布**: ${mbtiContacts.map(c => `${c.name}${c.remark ? '(' + c.remark + ')' : ''}: ${c.mbtiType}`).join('、')}` : ''}
- **关系网详情**:
${data.contacts.slice(0, 10).map(c => `  - ${c.name}${c.remark ? '(' + c.remark + ')' : ''}: 测试${c.testsCount}条, 日记${c.diaryCount}篇`).join('\n')}

`;
    }

    prompt += `## 请提供以下深度分析

### 1. 综合人格画像
整合多个测评维度，描绘用户完整、立体的性格特征和内在特质。注意不同测评结果之间的关联性和一致性。

### 2. 核心优势分析
- 根据多维度数据，识别用户最突出的3-5个核心优势
- 分析这些优势在不同场景（工作、生活、人际）中的表现

### 3. 情绪与心理状态分析
- 根据日记情绪记录，分析用户近期的心理状态和情绪模式
- 识别可能的压力来源和情绪波动规律
- 提供针对性的情绪管理建议

### 4. 发展建议
- 针对性格中可能的盲点或挑战提供建议
- 提供具体、可行的个人成长方向

### 5. 职业发展规划
- 整合性格特征和职业兴趣，推荐最适合的职业方向
- 分析适合的工作环境和团队角色
- 提供职业发展路径建议

### 6. 人际关系指南
- 分析与不同类型人相处的模式
- 结合关系网中联系人的性格类型，分析互动模式和潜在的相处建议
- 提供改善人际关系的具体建议

### 7. 生活建议
- 适合的生活方式和休闲活动
- 压力管理和情绪调节建议

请用温暖、专业的语气进行分析，注重正面引导和实用建议，每个部分用 markdown 格式清晰输出。`;

    return prompt;
  },

  /**
   * 渲染综合分析页面
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
   * 渲染报告预览
   */
  renderReportPreview(report) {
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
  },

  /**
   * 渲染综合报告
   */
  renderReport(container, testData) {
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
  },

  /**
   * 流式生成综合分析
   */
  async streamGenerateAnalysis(testData) {
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
  },

  /**
   * 重新生成分析
   */
  async regenerateAnalysis(reportId) {
    try {
      const report = await this.generateReport();
      Router.navigate(`/report/${report.id}`);
    } catch (error) {
      Utils.showToast(error.message || '分析失败', 'error');
    }
  },

  /**
   * 导出报告
   */
  async exportReport(reportId) {
    const report = await Storage.get('tests', reportId);
    if (!report) return;

    const content = this.generateReportText(report);
    const filename = `comprehensive-report-${Utils.formatDate(report.timestamp, 'YYYYMMDD')}.md`;
    Utils.downloadFile(content, filename);
    Utils.showToast('报告导出成功', 'success');
  },

  /**
   * 生成报告文本
   */
  generateReportText(report) {
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
  },

  /**
   * 复制结果
   */
  async copyResult(reportId) {
    const report = await Storage.get('tests', reportId);
    if (!report) return;

    const text = this.generateReportText(report);
    await Utils.copyToClipboard(text);
    Utils.showToast('结果已复制到剪贴板', 'success');
  }
};

// 导出到全局
window.Comprehensive = Comprehensive;
