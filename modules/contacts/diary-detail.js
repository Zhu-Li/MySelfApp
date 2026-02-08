/**
 * diary-detail.js - 日记详情弹窗
 * 观己 - 静观己心，内外澄明
 * 
 * 从 contacts.js 拆分
 * 职责：联系人日记详情弹窗的渲染
 */

/**
 * 显示日记详情弹窗
 * @param {string} contactId - 联系人ID
 * @param {number} diaryIndex - 日记索引
 */
Contacts.showDiaryDetail = async function(contactId, diaryIndex) {
  const contact = await this.get(contactId);
  if (!contact || !contact.diary || !contact.diary[diaryIndex]) return;

  const entry = contact.diary[diaryIndex];
  const moodInfo = entry.mood ? Diary.getMoodInfo(entry.mood) : null;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'diaryDetailModal';
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px; max-height: 90vh;">
      <div class="modal-header">
        <h3 class="modal-title">📔 ${entry.title || '无标题'}</h3>
        <button class="modal-close" onclick="Contacts.closeDiaryDetailModal()">✕</button>
      </div>
      <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px);">
        <div class="diary-detail-meta">
          <span class="diary-detail-user">👤 ${contact.name}</span>
          <span class="diary-detail-time">📅 ${Utils.formatDate(entry.timestamp, 'YYYY-MM-DD HH:mm')}</span>
          ${moodInfo ? `<span class="diary-detail-mood">${moodInfo.icon} ${moodInfo.label}</span>` : ''}
        </div>
        
        ${entry.tags && entry.tags.length > 0 ? `
          <div class="diary-detail-tags">
            ${entry.tags.map(tag => `<span class="diary-detail-tag">#${tag}</span>`).join('')}
          </div>
        ` : ''}
        
        <div class="diary-detail-content">${this.formatDiaryContent(entry.content)}</div>
        
        ${entry.images && entry.images.length > 0 ? `
          <div class="diary-detail-images">
            ${entry.images.map((img, idx) => {
              const imgSrc = typeof img === 'object' ? img.data : img;
              return `<img src="${imgSrc}" class="diary-detail-image" onclick="Contacts.viewDiaryImage('${entry.id || ''}', ${idx})">`;
            }).join('')}
          </div>
        ` : ''}
        
        ${entry.analysis ? `
          <div class="diary-detail-analysis">
            <div class="diary-detail-analysis-title">🤖 AI 情绪分析</div>
            ${this.renderAnalysisContent(entry.analysis)}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  this.addDiaryDetailStyles();
  document.body.appendChild(modal);
};

/**
 * 格式化日记内容
 * @param {string} content - 日记内容
 * @returns {string} 格式化后的HTML
 */
Contacts.formatDiaryContent = function(content) {
  if (!content) return '';
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
};

/**
 * 渲染AI分析内容
 * @param {Object|string} analysis - 分析数据
 * @returns {string} HTML字符串
 */
Contacts.renderAnalysisContent = function(analysis) {
  if (!analysis) return '';
  
  if (typeof analysis === 'string') {
    return `<div class="diary-detail-analysis-text">${analysis}</div>`;
  }
  
  const moodLabels = {
    '兴奋': '😊', '开心': '😄', '平静': '😌', '忧虑': '😟', 
    '焦虑': '😰', '悲伤': '😢', '愤怒': '😠', '疲惫': '😴'
  };
  
  let html = '<div class="analysis-formatted">';
  
  if (analysis.mood) {
    const moodIcon = moodLabels[analysis.mood] || '💭';
    html += `
      <div class="analysis-item">
        <span class="analysis-label">心情</span>
        <span class="analysis-value">${moodIcon} ${analysis.mood}${analysis.moodScore ? ` (${analysis.moodScore}/5)` : ''}</span>
      </div>
    `;
  }
  
  if (analysis.keywords && analysis.keywords.length > 0) {
    html += `
      <div class="analysis-item">
        <span class="analysis-label">关键词</span>
        <div class="analysis-keywords">
          ${analysis.keywords.map(k => `<span class="analysis-keyword">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (analysis.themes && analysis.themes.length > 0) {
    html += `
      <div class="analysis-item">
        <span class="analysis-label">主题</span>
        <div class="analysis-themes">
          ${analysis.themes.map(t => `<span class="analysis-theme">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (analysis.insights) {
    html += `
      <div class="analysis-item analysis-insights">
        <span class="analysis-label">AI 洞察</span>
        <p class="analysis-insight-text">${analysis.insights}</p>
      </div>
    `;
  }
  
  html += '</div>';
  return html;
};

/**
 * 查看日记图片
 * @param {string} diaryId - 日记ID
 * @param {number} imageIndex - 图片索引
 */
Contacts.viewDiaryImage = function(diaryId, imageIndex) {
  const modal = document.getElementById('diaryDetailModal');
  if (!modal) return;
  
  const images = modal.querySelectorAll('.diary-detail-image');
  if (images[imageIndex]) {
    this.viewImage(images[imageIndex].src);
  }
};

/**
 * 关闭日记详情弹窗
 */
Contacts.closeDiaryDetailModal = function() {
  const modal = document.getElementById('diaryDetailModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * 查看大图
 * @param {string} src - 图片源
 */
Contacts.viewImage = function(src) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'imageViewModal';
  modal.style.cssText = 'background: rgba(0,0,0,0.9); cursor: zoom-out;';
  modal.innerHTML = `
    <img src="${src}" style="max-width: 95%; max-height: 95%; object-fit: contain; border-radius: var(--radius-md);">
  `;
  modal.onclick = () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  };
  document.body.appendChild(modal);
};

/**
 * 显示所有日记列表
 * @param {string} contactId - 联系人ID
 */
Contacts.showAllDiaries = async function(contactId) {
  const contact = await this.get(contactId);
  if (!contact || !contact.diary) return;

  const diary = contact.diary;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'allDiariesModal';
  modal.innerHTML = `
    <div class="modal" style="max-width: 500px; max-height: 90vh;">
      <div class="modal-header">
        <h3 class="modal-title">📔 ${contact.name} 的日记 (${diary.length}篇)</h3>
        <button class="modal-close" onclick="Contacts.closeAllDiariesModal()">✕</button>
      </div>
      <div class="modal-body" style="overflow-y: auto; max-height: calc(90vh - 120px); padding: 0;">
        <div class="all-diaries-list">
          ${diary.map((entry, index) => {
            const moodInfo = entry.mood ? Diary.getMoodInfo(entry.mood) : null;
            return `
              <div class="all-diaries-item" onclick="Contacts.closeAllDiariesModal(); Contacts.showDiaryDetail('${contactId}', ${index})">
                <div class="all-diaries-date">${Utils.formatDate(entry.timestamp, 'MM-DD')}</div>
                <div class="all-diaries-info">
                  <div class="all-diaries-title">${entry.title || '无标题'}</div>
                  <div class="all-diaries-preview">${(entry.content || '').slice(0, 50)}${(entry.content || '').length > 50 ? '...' : ''}</div>
                </div>
                ${moodInfo ? `<div class="all-diaries-mood">${moodInfo.icon}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  this.addAllDiariesStyles();
  document.body.appendChild(modal);
};

/**
 * 关闭所有日记列表弹窗
 */
Contacts.closeAllDiariesModal = function() {
  const modal = document.getElementById('allDiariesModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * 添加日记详情样式
 */
Contacts.addDiaryDetailStyles = function() {
  if (document.getElementById('contacts-diary-detail-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-diary-detail-styles';
  style.textContent = `
    .diary-detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    .diary-detail-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
    }
    .diary-detail-tag {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--primary-color-light);
      color: var(--primary-color);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
    }
    .diary-detail-content {
      font-size: var(--font-size-base);
      line-height: 1.8;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .diary-detail-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }
    .diary-detail-image {
      width: 100%;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: transform var(--transition-fast);
    }
    .diary-detail-image:hover {
      transform: scale(1.02);
    }
    .diary-detail-analysis {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    }
    .diary-detail-analysis-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .analysis-formatted {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    .analysis-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    .analysis-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 500;
    }
    .analysis-value {
      font-size: var(--font-size-base);
      color: var(--text-primary);
    }
    .analysis-keywords, .analysis-themes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }
    .analysis-keyword {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--primary-color-light);
      color: var(--primary-color);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
    }
    .analysis-theme {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
    }
    .analysis-insight-text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
  `;
  document.head.appendChild(style);
};

/**
 * 添加所有日记列表样式
 */
Contacts.addAllDiariesStyles = function() {
  if (document.getElementById('contacts-all-diaries-styles')) return;

  const style = document.createElement('style');
  style.id = 'contacts-all-diaries-styles';
  style.textContent = `
    .all-diaries-list {
      display: flex;
      flex-direction: column;
    }
    .all-diaries-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .all-diaries-item:hover {
      background: var(--bg-secondary);
    }
    .all-diaries-date {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      flex-shrink: 0;
      width: 50px;
    }
    .all-diaries-info {
      flex: 1;
      min-width: 0;
    }
    .all-diaries-title {
      font-size: var(--font-size-base);
      color: var(--text-primary);
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .all-diaries-preview {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      margin-top: var(--spacing-xs);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .all-diaries-mood {
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
};
