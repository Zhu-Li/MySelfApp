/**
 * report-renderer.js - 报告页面渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：报告列表和报告详情渲染
 */

/**
 * 渲染报告列表
 */
App.renderReportList = async function() {
  const container = document.getElementById('mainContent');
  const tests = await Storage.getAll('tests');
  
  // 按时间倒序排列
  tests.sort((a, b) => b.timestamp - a.timestamp);

  // 测试类型映射
  const testTypeInfo = {
    mbti: { name: 'MBTI 性格测试', icon: '🧠', color: '#6366f1' },
    bigfive: { name: '大五人格测试', icon: '🌟', color: '#8b5cf6' },
    holland: { name: '霍兰德职业兴趣', icon: '💼', color: '#f59e0b' },
    attachment: { name: '依恋类型测试', icon: '💕', color: '#ec4899' },
    eq: { name: '情商测试', icon: '💡', color: '#10b981' },
    values: { name: '价值观测试', icon: '🎯', color: '#f43f5e' },
    stress: { name: '心理健康自测', icon: '🌱', color: '#06b6d4' },
    comprehensive: { name: '综合画像分析', icon: '📊', color: '#8b5cf6' }
  };

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <h1 class="font-bold mb-lg" style="font-size: var(--font-size-2xl);">分析报告</h1>
      
      ${tests.length === 0 ? `
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <h3 class="empty-state-title">暂无报告</h3>
              <p class="empty-state-desc">完成测试后，这里会显示你的分析报告</p>
              <a href="#/test" class="btn btn-primary">开始测试</a>
            </div>
          </div>
        </div>
      ` : `
        <div class="grid gap-md">
          ${tests.map(test => {
            const info = testTypeInfo[test.type] || { name: test.type, icon: '📝', color: '#6b7280' };
            let resultText = '';
            if (test.type === 'mbti' && test.result?.type) {
              resultText = test.result.type;
            } else if (test.type === 'holland' && test.result?.hollandCode) {
              resultText = test.result.hollandCode;
            }
            
            return `
              <a href="#/report/${test.id}" class="card card-hover">
                <div class="card-body">
                  <div class="flex items-center gap-lg">
                    <div class="avatar avatar-lg" style="background-color: ${info.color}20; font-size: 1.5rem;">
                      ${info.icon}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold">
                        ${info.name}${resultText ? ` - ${resultText}` : ''}
                      </h3>
                      <p class="text-secondary" style="font-size: var(--font-size-sm);">
                        ${Utils.formatDate(test.timestamp, 'YYYY-MM-DD HH:mm')}
                      </p>
                    </div>
                    <span class="badge ${test.result?.aiAnalysis ? 'badge-success' : 'badge-warning'}">
                      ${test.result?.aiAnalysis ? '已分析' : '待分析'}
                    </span>
                  </div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
};

/**
 * 渲染报告详情
 * @param {string} id - 报告ID
 */
App.renderReport = async function(id) {
  const container = document.getElementById('mainContent');
  const test = await Storage.get('tests', id);

  if (!test) {
    container.innerHTML = `
      <div class="page-container">
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <h2 class="empty-state-title">报告未找到</h2>
          <p class="empty-state-desc">该报告可能已被删除</p>
          <a href="#/report" class="btn btn-primary">返回报告列表</a>
        </div>
      </div>
    `;
    return;
  }

  // 根据测试类型渲染不同报告
  switch (test.type) {
    case 'mbti':
      MBTIReport.render(container, test);
      break;
    case 'bigfive':
      BigFiveReport.render(container, test);
      break;
    case 'holland':
      HollandReport.render(container, test);
      break;
    case 'attachment':
      AttachmentReport.render(container, test);
      break;
    case 'eq':
      EQReport.render(container, test);
      break;
    case 'values':
      ValuesReport.render(container, test);
      break;
    case 'stress':
      StressReport.render(container, test);
      break;
    case 'comprehensive':
      Comprehensive.renderReport(container, test);
      break;
    default:
      container.innerHTML = `
        <div class="page-container">
          <div class="empty-state">
            <div class="empty-state-icon">❓</div>
            <h2 class="empty-state-title">未知报告类型</h2>
            <p class="empty-state-desc">无法识别的报告类型: ${test.type}</p>
            <a href="#/report" class="btn btn-primary">返回报告列表</a>
          </div>
        </div>
      `;
  }
};
