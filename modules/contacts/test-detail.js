/**
 * test-detail.js - 测试详情弹窗
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：测试结果详情弹窗的渲染
 */

/**
 * 显示测试详情弹窗
 * @param {string} contactId - 联系人ID
 * @param {number} testIndex - 测试索引
 */
Contacts.showTestDetail = async function(contactId, testIndex) {
  const contact = await this.get(contactId);
  if (!contact || !contact.tests || !contact.tests[testIndex]) return;

  const test = contact.tests[testIndex];
  const result = test.result || {};
  
  const typeInfo = {
    'mbti': { name: 'MBTI人格类型', icon: '🧠' },
    'bigfive': { name: '大五人格', icon: '⭐' },
    'holland': { name: '霍兰德职业兴趣', icon: '💼' },
    'attachment': { name: '依恋类型', icon: '💕' },
    'eq': { name: '情商测试', icon: '💡' },
    'values': { name: '价值观测试', icon: '🎯' },
    'stress': { name: '心理健康', icon: '🌱' },
    'comprehensive': { name: '综合画像', icon: '📊' }
  };
  
  const info = typeInfo[test.type] || { name: test.type, icon: '📝' };
  const detailContent = this.renderTestDetailContent(test);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'testDetailModal';
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px; max-height: 90vh;">
      <div class="modal-header">
        <h3 class="modal-title">${info.icon} ${info.name}</h3>
        <button class="modal-close" onclick="Contacts.closeTestDetailModal()">✕</button>
      </div>
      <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px);">
        <div class="test-detail-meta">
          <span class="test-detail-user">👤 ${contact.name}</span>
          <span class="test-detail-time">📅 ${Utils.formatDate(test.timestamp, 'YYYY-MM-DD HH:mm')}</span>
        </div>
        ${detailContent}
      </div>
    </div>
  `;

  this.addTestDetailStyles();
  document.body.appendChild(modal);
};

/**
 * 渲染测试详情内容
 * @param {Object} test - 测试数据
 * @returns {string} HTML字符串
 */
Contacts.renderTestDetailContent = function(test) {
  const result = test.result || {};
  
  switch (test.type) {
    case 'mbti':
      return this.renderMBTIDetail(result);
    case 'bigfive':
      return this.renderBigFiveDetail(result);
    case 'holland':
      return this.renderHollandDetail(result);
    case 'attachment':
      return this.renderAttachmentDetail(result);
    case 'eq':
      return this.renderEQDetail(result);
    case 'values':
      return this.renderValuesDetail(result);
    case 'stress':
      return this.renderStressDetail(result);
    case 'comprehensive':
      return this.renderComprehensiveDetail(result);
    default:
      return `<div class="test-detail-text">${JSON.stringify(result, null, 2)}</div>`;
  }
};

/**
 * 渲染MBTI详情
 */
Contacts.renderMBTIDetail = function(result) {
  const dims = result.dimensions || {};
  const mbtiColors = {
    E: '#f59e0b', I: '#3b82f6',
    S: '#22c55e', N: '#a855f7',
    T: '#ef4444', F: '#ec4899',
    J: '#6366f1', P: '#14b8a6'
  };
  
  const mbtiDims = [
    { left: 'E', right: 'I', leftName: '外向', rightName: '内向' },
    { left: 'S', right: 'N', leftName: '感觉', rightName: '直觉' },
    { left: 'T', right: 'F', leftName: '思考', rightName: '情感' },
    { left: 'J', right: 'P', leftName: '判断', rightName: '知觉' }
  ];
  
  return `
    <div class="test-detail-result">${result.type || '-'}</div>
    <div class="test-detail-section">
      <div class="test-detail-section-title">维度分析</div>
      <div class="test-detail-dims">
        ${mbtiDims.map(dim => {
          const leftScore = dims[dim.left] || 50;
          const rightScore = 100 - leftScore;
          return `
            <div class="mbti-dim-row">
              <span class="mbti-dim-label" style="color: ${mbtiColors[dim.left]};">${dim.left} ${dim.leftName}</span>
              <div class="mbti-dim-bar">
                <div class="mbti-dim-fill-left" style="width: ${leftScore}%; background-color: ${mbtiColors[dim.left]};"></div>
                <div class="mbti-dim-fill-right" style="width: ${rightScore}%; background-color: ${mbtiColors[dim.right]};"></div>
              </div>
              <span class="mbti-dim-label" style="color: ${mbtiColors[dim.right]};">${dim.rightName} ${dim.right}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染大五人格详情
 */
Contacts.renderBigFiveDetail = function(result) {
  const dims = result.dimensions || {};
  const bigFiveDims = [
    { key: 'O', name: '开放性', color: '#a855f7' },
    { key: 'C', name: '尽责性', color: '#3b82f6' },
    { key: 'E', name: '外向性', color: '#f59e0b' },
    { key: 'A', name: '宜人性', color: '#22c55e' },
    { key: 'N', name: '神经质', color: '#ef4444' }
  ];
  
  return `
    <div class="test-detail-section">
      <div class="test-detail-section-title">五大维度得分</div>
      <div class="test-detail-dims">
        ${bigFiveDims.map(dim => `
          <div class="test-detail-dim">
            <span class="test-detail-dim-label">${dim.name}(${dim.key})</span>
            <div class="test-detail-dim-bar">
              <div class="test-detail-dim-fill" style="width: ${dims[dim.key] || 0}%; background-color: ${dim.color};"></div>
            </div>
            <span class="test-detail-dim-value" style="color: ${dim.color};">${dims[dim.key] || 0}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染霍兰德详情
 */
Contacts.renderHollandDetail = function(result) {
  const dims = result.dimensions || {};
  const hollandDims = {
    R: { name: '现实型', icon: '🔧', color: '#ef4444' },
    I: { name: '研究型', icon: '🔬', color: '#3b82f6' },
    A: { name: '艺术型', icon: '🎨', color: '#a855f7' },
    S: { name: '社会型', icon: '🤝', color: '#22c55e' },
    E: { name: '企业型', icon: '💼', color: '#f59e0b' },
    C: { name: '常规型', icon: '📊', color: '#6366f1' }
  };
  
  return `
    ${result.hollandCode ? `<div class="test-detail-result">${result.hollandCode}</div>` : ''}
    <div class="test-detail-section">
      <div class="test-detail-section-title">六大类型得分</div>
      <div class="test-detail-dims">
        ${Object.entries(hollandDims).map(([key, info]) => `
          <div class="test-detail-dim">
            <span class="test-detail-dim-label">${info.icon} ${info.name}(${key})</span>
            <div class="test-detail-dim-bar">
              <div class="test-detail-dim-fill" style="width: ${dims[key] || 0}%; background-color: ${info.color};"></div>
            </div>
            <span class="test-detail-dim-value" style="color: ${info.color};">${dims[key] || 0}%</span>
          </div>
        `).join('')}
      </div>
    </div>
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染依恋类型详情
 */
Contacts.renderAttachmentDetail = function(result) {
  const dims = result.dimensions || {};
  const anxiety = dims.anxiety || 0;
  const avoidance = dims.avoidance || 0;
  
  let typeName = result.typeInfo?.name || '';
  let typeDesc = result.typeInfo?.description || '';
  let typeColor = result.typeInfo?.color || '#ec4899';
  
  if (!typeName && result.type) {
    const typeMap = {
      'secure': { name: '安全型', desc: '低焦虑、低回避', color: '#22c55e' },
      'anxious': { name: '焦虑型', desc: '高焦虑、低回避', color: '#f59e0b' },
      'avoidant': { name: '回避型', desc: '低焦虑、高回避', color: '#3b82f6' },
      'fearful': { name: '恐惧型', desc: '高焦虑、高回避', color: '#ef4444' }
    };
    const info = typeMap[result.type] || {};
    typeName = info.name || result.type;
    typeDesc = info.desc || '';
    typeColor = info.color || '#ec4899';
  }
  
  return `
    <div class="test-detail-result" style="color: ${typeColor};">${typeName || '-'}</div>
    ${typeDesc ? `<p class="text-center text-secondary mb-lg">${typeDesc}</p>` : ''}
    <div class="test-detail-section">
      <div class="test-detail-section-title">依恋维度</div>
      <div class="test-detail-dims">
        <div class="test-detail-dim">
          <span class="test-detail-dim-label">焦虑程度</span>
          <div class="test-detail-dim-bar">
            <div class="test-detail-dim-fill" style="width: ${anxiety}%; background-color: #f59e0b;"></div>
          </div>
          <span class="test-detail-dim-value" style="color: #f59e0b;">${anxiety}%</span>
        </div>
        <div class="test-detail-dim">
          <span class="test-detail-dim-label">回避程度</span>
          <div class="test-detail-dim-bar">
            <div class="test-detail-dim-fill" style="width: ${avoidance}%; background-color: #3b82f6;"></div>
          </div>
          <span class="test-detail-dim-value" style="color: #3b82f6;">${avoidance}%</span>
        </div>
      </div>
    </div>
    ${result.typeInfo?.traits?.length > 0 ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">核心特质</div>
        <div class="test-detail-tags">
          ${result.typeInfo.traits.map(t => `<span class="test-detail-tag" style="background: ${typeColor}20; color: ${typeColor};">${t}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染情商详情
 */
Contacts.renderEQDetail = function(result) {
  const dims = result.dimensions || {};
  const eqDims = [
    { key: 'selfAwareness', name: '自我意识', color: '#3b82f6' },
    { key: 'selfManagement', name: '自我管理', color: '#22c55e' },
    { key: 'socialAwareness', name: '社会意识', color: '#f59e0b' },
    { key: 'relationshipManagement', name: '关系管理', color: '#ef4444' },
    { key: 'selfMotivation', name: '自我激励', color: '#a855f7' }
  ];
  
  return `
    <div class="test-detail-result">${result.overallScore || result.totalScore || 0} 分</div>
    <div class="test-detail-section">
      <div class="test-detail-section-title">各维度得分</div>
      <div class="test-detail-dims">
        ${eqDims.map(dim => {
          const score = dims[dim.key] || dims[dim.name] || 0;
          return `
            <div class="test-detail-dim">
              <span class="test-detail-dim-label">${dim.name}</span>
              <div class="test-detail-dim-bar">
                <div class="test-detail-dim-fill" style="width: ${score}%; background-color: ${dim.color};"></div>
              </div>
              <span class="test-detail-dim-value" style="color: ${dim.color};">${score}%</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染价值观详情
 */
Contacts.renderValuesDetail = function(result) {
  const topValues = result.topValues || result.values || [];
  const scores = result.scores || {};
  
  return `
    <div class="test-detail-section">
      <div class="test-detail-section-title">核心价值观排序</div>
      ${topValues.length > 0 ? `
        <div class="values-list">
          ${topValues.map((v, i) => {
            const value = typeof v === 'object' ? v.name : v;
            const score = typeof v === 'object' ? v.score : (scores[value] || 0);
            return `
              <div class="value-item">
                <span class="value-rank">${i + 1}</span>
                <span class="value-name">${value}</span>
                ${score ? `<span class="value-score">${score}%</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="text-secondary">暂无数据</div>'}
    </div>
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染心理健康详情
 */
Contacts.renderStressDetail = function(result) {
  const anxietyLevel = result.anxietyLevel || {};
  const levelName = anxietyLevel.name || result.level || '-';
  const levelColor = anxietyLevel.color || '#22c55e';
  const levelDesc = anxietyLevel.description || '';
  
  return `
    <div class="test-detail-result" style="color: ${levelColor};">${levelName}</div>
    ${levelDesc ? `<p class="text-center text-secondary mb-lg">${levelDesc}</p>` : ''}
    ${result.anxietyScore !== undefined ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">焦虑得分</div>
        <div class="stress-score-display">
          <div class="stress-score" style="color: ${levelColor};">${result.anxietyScore}</div>
          <div class="stress-label">分</div>
        </div>
      </div>
    ` : ''}
    ${result.depressionLevel ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">抑郁状态</div>
        <div class="stress-level-display" style="color: ${result.depressionLevel.color || '#22c55e'};">
          ${result.depressionLevel.name || '-'}
        </div>
      </div>
    ` : ''}
    ${result.aiAnalysis ? `
      <div class="test-detail-section">
        <div class="test-detail-section-title">AI 分析</div>
        <div class="test-detail-ai">${this.formatMarkdown(result.aiAnalysis)}</div>
      </div>
    ` : ''}
  `;
};

/**
 * 渲染综合画像详情
 */
Contacts.renderComprehensiveDetail = function(result) {
  const content = result.analysis || result.aiAnalysis || '';
  return `
    <div class="test-detail-section">
      <div class="test-detail-section-title">综合分析报告</div>
      <div class="test-detail-ai">${content ? this.formatMarkdown(content) : '暂无分析内容'}</div>
    </div>
  `;
};

/**
 * 格式化Markdown为HTML
 * @param {string} text - Markdown文本
 * @returns {string} HTML字符串
 */
Contacts.formatMarkdown = function(text) {
  if (!text) return '';
  if (typeof text !== 'string') {
    text = JSON.stringify(text, null, 2);
  }
  
  return text
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="md-li-num">$2</li>')
    .replace(/^---$/gm, '<hr class="md-hr">')
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/\n/g, '<br>')
    .replace(/^(?!<)/, '<p class="md-p">')
    .replace(/(?!>)$/, '</p>');
};

/**
 * 关闭测试详情弹窗
 */
Contacts.closeTestDetailModal = function() {
  const modal = document.getElementById('testDetailModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * 添加测试详情样式
 */
Contacts.addTestDetailStyles = function() {
  if (document.getElementById('contacts-test-detail-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-test-detail-styles';
  style.textContent = `
    .test-detail-meta {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    .test-detail-section {
      margin-bottom: var(--spacing-lg);
    }
    .test-detail-section-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-sm);
      border-bottom: 1px solid var(--border-color-light);
    }
    .test-detail-result {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary-color);
      text-align: center;
      padding: var(--spacing-lg);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      margin-bottom: var(--spacing-lg);
    }
    .test-detail-dims {
      display: grid;
      gap: var(--spacing-md);
    }
    .test-detail-dim {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    .test-detail-dim-label {
      width: 80px;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    .test-detail-dim-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
    }
    .test-detail-dim-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 4px;
    }
    .test-detail-dim-value {
      width: 50px;
      text-align: right;
      font-size: var(--font-size-sm);
      font-weight: 600;
    }
    .test-detail-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
    .test-detail-tag {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--primary-color-light);
      color: var(--primary-color);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }
    .test-detail-text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .test-detail-ai {
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      line-height: 1.8;
      color: var(--text-secondary);
    }
    .test-detail-ai .md-h2 { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin: var(--spacing-md) 0 var(--spacing-sm); }
    .test-detail-ai .md-h3 { font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary); margin: var(--spacing-md) 0 var(--spacing-sm); }
    .test-detail-ai .md-h4 { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); margin: var(--spacing-sm) 0; }
    .test-detail-ai .md-p { margin: var(--spacing-sm) 0; }
    .test-detail-ai .md-li { margin-left: var(--spacing-lg); list-style: disc; }
    .test-detail-ai .md-li-num { margin-left: var(--spacing-lg); list-style: decimal; }
    .test-detail-ai .md-hr { border: none; border-top: 1px solid var(--border-color-light); margin: var(--spacing-md) 0; }
    .test-detail-ai strong { color: var(--text-primary); font-weight: 600; }
    
    .mbti-dim-row { display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
    .mbti-dim-label { font-size: var(--font-size-xs); width: 70px; text-align: center; font-weight: 500; }
    .mbti-dim-bar { flex: 1; height: 12px; display: flex; border-radius: 6px; overflow: hidden; }
    .mbti-dim-fill-left, .mbti-dim-fill-right { height: 100%; transition: width 0.3s; }
    
    .values-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .value-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-md); }
    .value-rank { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; border-radius: 50%; font-size: var(--font-size-xs); font-weight: 600; }
    .value-name { flex: 1; font-weight: 500; }
    .value-score { color: var(--primary-color); font-weight: 600; }
    
    .stress-score-display { display: flex; align-items: baseline; justify-content: center; gap: var(--spacing-xs); padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); }
    .stress-score { font-size: var(--font-size-3xl); font-weight: 700; }
    .stress-label { font-size: var(--font-size-lg); color: var(--text-secondary); }
    .stress-level-display { text-align: center; font-size: var(--font-size-xl); font-weight: 600; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); }
  `;
  document.head.appendChild(style);
};
