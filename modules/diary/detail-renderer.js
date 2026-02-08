/**
 * detail-renderer.js - 日记详情页
 * 观己 - 静观己心，内外澄明
 * 
 * 从 diary.js 拆分
 * 职责：日记详情渲染、AI分析、删除确认
 */

/**
 * AI 情感分析
 * @param {string} content - 日记内容
 * @returns {Object|null} 分析结果
 */
Diary.analyzeContent = async function(content) {
  if (!API.isConfigured()) {
    return null;
  }

  const prompt = `请分析以下日记内容，提取关键信息：

日记内容：
${content}

请以 JSON 格式返回分析结果：
{
  "mood": "情绪状态（如：愉快、平静、焦虑、低落、兴奋、感恩等）",
  "moodScore": 情绪分数（1-5，5为最积极）,
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "themes": ["主题1", "主题2"],
  "insights": "简短的洞察和建议（约50字）"
}

只返回 JSON，不要其他内容。`;

  try {
    const messages = [
      { role: 'system', content: '你是一位温和的情感分析专家，善于从文字中提取情感和主题信息，给予正向引导。' },
      { role: 'user', content: prompt }
    ];

    const response = await API.chat(messages, { temperature: 0.3, maxTokens: 500 });
    
    // 提取 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error('日记分析失败:', e);
    return null;
  }
};

/**
 * 后台异步分析日记内容
 * @param {string} diaryId - 日记ID
 * @param {string} content - 日记内容
 */
Diary.analyzeInBackground = async function(diaryId, content) {
  try {
    const analysis = await this.analyzeContent(content);
    if (analysis) {
      // 获取已保存的日记
      const diary = await this.get(diaryId);
      if (diary) {
        diary.analysis = analysis;
        // 如果用户没选心情，使用 AI 分析的
        if (!diary.moodScore && analysis.moodScore) {
          diary.moodScore = analysis.moodScore;
        }
        // 更新日记
        await this.save(diary);
        console.log('日记 AI 分析已完成并更新');
      }
    }
  } catch (error) {
    console.error('后台分析日记失败:', error);
  }
};

/**
 * 显示日记详情
 * @param {string} id - 日记ID
 */
Diary.showDetail = function(id) {
  Router.navigate(`/diary/${id}`);
};

/**
 * 渲染日记详情
 * @param {HTMLElement} container - 容器元素
 * @param {string} diaryId - 日记ID
 */
Diary.renderDetail = async function(container, diaryId) {
  const diary = await this.get(diaryId);
  
  if (!diary) {
    container.innerHTML = `
      <div class="page-container">
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <h2 class="empty-state-title">日记不存在</h2>
          <a href="#/diary" class="btn btn-primary">返回日记列表</a>
        </div>
      </div>
    `;
    return;
  }

  const moodInfo = this.getMoodInfo(diary.mood);

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <div class="card mb-lg">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-md">
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/diary')">
                ← 返回
              </button>
              <span class="text-tertiary">|</span>
              <span class="text-secondary">${Utils.formatDate(diary.timestamp, 'YYYY年MM月DD日 HH:mm')}</span>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn-secondary btn-sm" onclick="Diary.showEditor('${diary.id}')">
                ✏️ 编辑
              </button>
              <button class="btn btn-ghost btn-sm" onclick="Diary.confirmDelete('${diary.id}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- 标题和心情 -->
          <div class="flex items-center gap-md mb-lg">
            ${diary.mood ? `
              <div class="diary-mood-badge" style="background-color: ${moodInfo.color}20; color: ${moodInfo.color};">
                ${moodInfo.icon} ${moodInfo.label}
              </div>
            ` : ''}
            <h1 class="font-bold flex-1" style="font-size: var(--font-size-2xl);">
              ${Utils.escapeHtml(diary.title)}
            </h1>
          </div>

          <!-- 日记内容 -->
          <div class="diary-content-view">
            ${this.renderContent(diary.content)}
          </div>

          <!-- 图片展示 -->
          ${diary.images && diary.images.length > 0 ? `
            <div class="diary-images mt-lg">
              <div class="diary-images-grid">
                ${diary.images.map((img, index) => `
                  <div class="diary-image-item" onclick="Diary.showImageViewer('${diary.id}', ${index})">
                    <img src="${img.data}" alt="${img.name || '图片'}" loading="lazy">
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 标签 -->
          ${diary.tags && diary.tags.length > 0 ? `
            <div class="diary-tags mt-xl">
              ${diary.tags.map(tag => `
                <span class="diary-tag">#${Utils.escapeHtml(tag)}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- AI 分析 -->
      ${diary.analysis ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🤖 AI 情感分析</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 gap-lg">
              <div>
                <h4 class="font-medium mb-sm">情绪状态</h4>
                <p class="text-secondary">${diary.analysis.mood || '未分析'}</p>
              </div>
              <div>
                <h4 class="font-medium mb-sm">关键词</h4>
                <div class="flex flex-wrap gap-sm">
                  ${(diary.analysis.keywords || []).map(k => `
                    <span class="badge badge-info">${k}</span>
                  `).join('')}
                </div>
              </div>
            </div>
            ${diary.analysis.insights ? `
              <div class="mt-lg">
                <h4 class="font-medium mb-sm">洞察与建议</h4>
                <p class="text-secondary">${diary.analysis.insights}</p>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  this.addStyles();
};

/**
 * 渲染日记内容（简单 markdown）
 * @param {string} content - 日记内容
 * @returns {string} HTML字符串
 */
Diary.renderContent = function(content) {
  return Utils.renderMarkdown(content);
};

/**
 * 确认删除
 * @param {string} id - 日记ID
 */
Diary.confirmDelete = async function(id) {
  const confirmed = await Utils.confirm('确定要删除这篇日记吗？此操作不可撤销。');
  if (confirmed) {
    await this.delete(id);
    Utils.showToast('日记已删除', 'success');
    Router.navigate('/diary');
  }
};
