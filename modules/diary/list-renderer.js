/**
 * list-renderer.js - 日记列表渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 diary.js 拆分
 * 职责：日记列表页面渲染、卡片渲染、统计计算
 */

/**
 * 渲染日记列表页面
 * @param {HTMLElement} container - 容器元素
 */
Diary.renderList = async function(container) {
  const diaries = await this.getAll();

  // 按月份分组
  const grouped = this.groupByMonth(diaries);

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="diary-header">
        <div class="diary-header-info">
          <h1 class="diary-page-title">个人日记</h1>
          <p class="diary-page-subtitle">记录生活点滴，倾听内心声音</p>
        </div>
        <button class="btn btn-primary diary-write-btn" onclick="Diary.showEditor()">
          ✏️ <span class="diary-write-text">写日记</span>
        </button>
      </div>

      ${diaries.length === 0 ? `
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <div class="empty-state-icon">📔</div>
              <h3 class="empty-state-title">还没有日记</h3>
              <p class="empty-state-desc">开始记录你的第一篇日记吧</p>
              <button class="btn btn-primary" onclick="Diary.showEditor()">写第一篇</button>
            </div>
          </div>
        </div>
      ` : `
        <!-- 统计概览 -->
        <div class="diary-stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-primary">📝</div>
            <div class="stat-value">${diaries.length}</div>
            <div class="stat-label">日记总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-success">📅</div>
            <div class="stat-value">${this.getStreakDays(diaries)}</div>
            <div class="stat-label">连续天数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-warning">${this.getAverageMoodIcon(diaries)}</div>
            <div class="stat-value">${this.getAverageMoodText(diaries)}</div>
            <div class="stat-label">平均心情</div>
          </div>
        </div>

        <!-- 日记列表 -->
        <div class="diary-list">
          ${Object.entries(grouped).map(([month, items]) => `
            <div class="diary-month-group">
              <h3 class="diary-month-title">${month}</h3>
              <div class="diary-items">
                ${items.map(diary => this.renderDiaryCard(diary)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
    <style>
      .diary-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-lg);
        gap: var(--spacing-md);
      }
      .diary-page-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
      }
      .diary-page-subtitle {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
      }
      .diary-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
      }
      .diary-items {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      @media (max-width: 768px) {
        .diary-page-title {
          font-size: var(--font-size-xl);
        }
        .diary-stats-grid {
          gap: var(--spacing-sm);
        }
      }
      @media (max-width: 480px) {
        .diary-header {
          flex-direction: column;
          align-items: stretch;
        }
        .diary-header-info {
          text-align: center;
        }
        .diary-page-title {
          font-size: var(--font-size-lg);
        }
        .diary-write-btn {
          width: 100%;
          justify-content: center;
        }
      }
    </style>
  `;

  this.addStyles();
};

/**
 * 渲染单个日记卡片
 * @param {Object} diary - 日记数据
 * @returns {string} HTML字符串
 */
Diary.renderDiaryCard = function(diary) {
  const moodInfo = this.getMoodInfo(diary.mood);
  const preview = diary.content.replace(/[#*\n]/g, ' ').trim().slice(0, 100);
  const hasImages = diary.images && diary.images.length > 0;

  return `
    <div class="card card-hover diary-card" onclick="Diary.showDetail('${diary.id}')">
      <div class="card-body">
        <div class="flex items-start gap-md">
          <div class="diary-mood-icon" style="background-color: ${moodInfo.color}20; color: ${moodInfo.color};">
            ${moodInfo.icon}
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-sm">
              <h4 class="font-semibold diary-title">
                ${Utils.escapeHtml(diary.title)}
                ${hasImages ? `<span class="diary-image-indicator" title="${diary.images.length}张图片">🖼️</span>` : ''}
              </h4>
              <span class="text-tertiary" style="font-size: var(--font-size-xs);">
                ${Utils.formatDate(diary.timestamp, 'MM-DD HH:mm')}
              </span>
            </div>
            <p class="text-secondary diary-preview">${Utils.escapeHtml(preview)}${preview.length >= 100 ? '...' : ''}</p>
            ${diary.tags && diary.tags.length > 0 ? `
              <div class="diary-tags mt-sm">
                ${diary.tags.slice(0, 3).map(tag => `
                  <span class="diary-tag">#${Utils.escapeHtml(tag)}</span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * 按月份分组
 * @param {Array} diaries - 日记数组
 * @returns {Object} 分组后的对象
 */
Diary.groupByMonth = function(diaries) {
  const groups = {};
  diaries.forEach(diary => {
    const month = Utils.formatDate(diary.timestamp, 'YYYY年MM月');
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(diary);
  });
  return groups;
};

/**
 * 计算连续记录天数
 * @param {Array} diaries - 日记数组
 * @returns {number} 连续天数
 */
Diary.getStreakDays = function(diaries) {
  if (diaries.length === 0) return 0;

  const dates = [...new Set(diaries.map(d => d.date))].sort().reverse();
  const today = Utils.formatDate(Date.now(), 'YYYY-MM-DD');
  
  // 检查今天或昨天是否有记录
  const yesterday = Utils.formatDate(Date.now() - 86400000, 'YYYY-MM-DD');
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * 计算平均心情图标
 * @param {Array} diaries - 日记数组
 * @returns {string} 心情图标
 */
Diary.getAverageMoodIcon = function(diaries) {
  const withMood = diaries.filter(d => d.moodScore);
  if (withMood.length === 0) return '😊';
  
  const avg = withMood.reduce((sum, d) => sum + d.moodScore, 0) / withMood.length;
  const mood = this.moods.find(m => m.score === Math.round(avg)) || this.moods[2];
  return mood.icon;
};

/**
 * 计算平均心情文字
 * @param {Array} diaries - 日记数组
 * @returns {string} 心情文字
 */
Diary.getAverageMoodText = function(diaries) {
  const withMood = diaries.filter(d => d.moodScore);
  if (withMood.length === 0) return '暂无';
  
  const avg = withMood.reduce((sum, d) => sum + d.moodScore, 0) / withMood.length;
  const mood = this.moods.find(m => m.score === Math.round(avg)) || this.moods[2];
  return mood.label;
};
