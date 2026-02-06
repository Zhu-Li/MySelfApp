/**
 * diary.js - 个人日记模块
 * 观己 - 静观己心，内外澄明
 */

const Diary = {
  /**
   * 获取所有日记（按日期倒序）
   */
  async getAll() {
    const diaries = await Storage.getAll('diary');
    return diaries.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * 获取单篇日记
   */
  async get(id) {
    return Storage.get('diary', id);
  },

  /**
   * 保存日记
   */
  async save(diaryData) {
    const now = Date.now();
    const data = {
      id: diaryData.id || Utils.generateId(),
      title: diaryData.title || this.generateTitle(diaryData.content),
      content: diaryData.content,
      images: diaryData.images || [],
      mood: diaryData.mood || null,
      moodScore: diaryData.moodScore || null,
      tags: diaryData.tags || [],
      weather: diaryData.weather || null,
      analysis: diaryData.analysis || null,
      date: diaryData.date || Utils.formatDate(now, 'YYYY-MM-DD'),
      timestamp: diaryData.timestamp || now,
      updatedAt: now
    };

    await Storage.saveDiary(data);
    return data;
  },

  /**
   * 删除日记
   */
  async delete(id) {
    return Storage.delete('diary', id);
  },

  /**
   * 生成标题（取内容前20字）
   */
  generateTitle(content) {
    if (!content) return '无标题';
    const text = content.replace(/[#*\n]/g, ' ').trim();
    return text.length > 20 ? text.slice(0, 20) + '...' : text;
  },

  /**
   * 心情选项
   */
  moods: [
    { value: 'great', label: '很棒', icon: '😊', score: 5, color: '#10b981' },
    { value: 'good', label: '不错', icon: '🙂', score: 4, color: '#22c55e' },
    { value: 'okay', label: '一般', icon: '😐', score: 3, color: '#f59e0b' },
    { value: 'bad', label: '不好', icon: '😔', score: 2, color: '#f97316' },
    { value: 'terrible', label: '很差', icon: '😢', score: 1, color: '#ef4444' }
  ],

  /**
   * 获取心情信息
   */
  getMoodInfo(moodValue) {
    return this.moods.find(m => m.value === moodValue) || this.moods[2];
  },

  /**
   * 临时存储当前编辑的图片
   */
  currentImages: [],

  /**
   * 图片最大尺寸（像素）
   */
  maxImageSize: 1200,

  /**
   * 图片质量
   */
  imageQuality: 0.8,

  /**
   * 压缩图片
   */
  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // 按比例缩放
          if (width > this.maxImageSize || height > this.maxImageSize) {
            if (width > height) {
              height = (height / width) * this.maxImageSize;
              width = this.maxImageSize;
            } else {
              width = (width / height) * this.maxImageSize;
              height = this.maxImageSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 转为 Base64
          const base64 = canvas.toDataURL('image/jpeg', this.imageQuality);
          resolve({
            id: Utils.generateId(),
            data: base64,
            name: file.name,
            size: Math.round(base64.length * 0.75), // 估算大小
            width,
            height
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * 处理图片上传
   */
  async handleImageUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 限制最多9张图片
    const remaining = 9 - this.currentImages.length;
    if (remaining <= 0) {
      Utils.showToast('最多只能添加9张图片', 'warning');
      return;
    }

    const filesToProcess = files.slice(0, remaining);
    Utils.showLoading('正在处理图片...');

    try {
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          Utils.showToast(`${file.name} 不是图片文件`, 'warning');
          continue;
        }

        const compressed = await this.compressImage(file);
        this.currentImages.push(compressed);
      }

      this.renderImagePreview();
      Utils.hideLoading();

    } catch (error) {
      Utils.hideLoading();
      console.error('图片处理失败:', error);
      Utils.showToast('图片处理失败', 'error');
    }

    // 清空 input 以便重复选择同一文件
    event.target.value = '';
  },

  /**
   * 删除图片
   */
  removeImage(imageId) {
    this.currentImages = this.currentImages.filter(img => img.id !== imageId);
    this.renderImagePreview();
  },

  /**
   * 渲染图片预览
   */
  renderImagePreview() {
    const container = document.getElementById('imagePreviewContainer');
    const countHint = document.getElementById('imageCountHint');
    
    if (countHint) {
      countHint.textContent = this.currentImages.length > 0 
        ? `已选择 ${this.currentImages.length} 张` 
        : '支持 JPG、PNG 格式';
    }

    if (!container) return;

    if (this.currentImages.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="image-preview-grid">
        ${this.currentImages.map(img => `
          <div class="image-preview-item" data-id="${img.id}">
            <img src="${img.data}" alt="${img.name}">
            <button type="button" class="image-remove-btn" onclick="Diary.removeImage('${img.id}')">
              ✕
            </button>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * AI 情感分析
   */
  async analyzeContent(content) {
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
  },

  /**
   * 渲染日记列表页面
   */
  async renderList(container) {
    const diaries = await this.getAll();

    // 按月份分组
    const grouped = this.groupByMonth(diaries);

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="flex items-center justify-between mb-lg">
          <div>
            <h1 class="font-bold" style="font-size: var(--font-size-2xl);">个人日记</h1>
            <p class="text-secondary mt-sm">记录生活点滴，倾听内心声音</p>
          </div>
          <button class="btn btn-primary" onclick="Diary.showEditor()">
            ✏️ 写日记
          </button>
        </div>

        ${diaries.length === 0 ? `
          <div class="card">
            <div class="card-body">
              <div class="empty-state">
                <div class="empty-state-icon">📔</div>
                <h3 class="empty-state-title">还没有日记</h3>
                <p class="empty-state-desc">开始记录你的第一篇日记吧，AI 将帮助分析你的情绪变化</p>
                <button class="btn btn-primary" onclick="Diary.showEditor()">写第一篇日记</button>
              </div>
            </div>
          </div>
        ` : `
          <!-- 统计概览 -->
          <div class="grid grid-cols-3 gap-md mb-lg">
            <div class="stat-card">
              <div class="stat-icon stat-icon-primary">📝</div>
              <div class="stat-value">${diaries.length}</div>
              <div class="stat-label">日记总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon-success">📅</div>
              <div class="stat-value">${this.getStreakDays(diaries)}</div>
              <div class="stat-label">连续记录天数</div>
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
                <div class="grid gap-md">
                  ${items.map(diary => this.renderDiaryCard(diary)).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    this.addStyles();
  },

  /**
   * 渲染单个日记卡片
   */
  renderDiaryCard(diary) {
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
  },

  /**
   * 按月份分组
   */
  groupByMonth(diaries) {
    const groups = {};
    diaries.forEach(diary => {
      const month = Utils.formatDate(diary.timestamp, 'YYYY年MM月');
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(diary);
    });
    return groups;
  },

  /**
   * 计算连续记录天数
   */
  getStreakDays(diaries) {
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
  },

  /**
   * 计算平均心情图标
   */
  getAverageMoodIcon(diaries) {
    const withMood = diaries.filter(d => d.moodScore);
    if (withMood.length === 0) return '😊';
    
    const avg = withMood.reduce((sum, d) => sum + d.moodScore, 0) / withMood.length;
    const mood = this.moods.find(m => m.score === Math.round(avg)) || this.moods[2];
    return mood.icon;
  },

  /**
   * 计算平均心情文字
   */
  getAverageMoodText(diaries) {
    const withMood = diaries.filter(d => d.moodScore);
    if (withMood.length === 0) return '暂无';
    
    const avg = withMood.reduce((sum, d) => sum + d.moodScore, 0) / withMood.length;
    const mood = this.moods.find(m => m.score === Math.round(avg)) || this.moods[2];
    return mood.label;
  },

  /**
   * 显示日记编辑器
   */
  showEditor(diaryId = null) {
    Router.navigate(diaryId ? `/diary/edit/${diaryId}` : '/diary/new');
  },

  /**
   * 渲染日记编辑器
   */
  async renderEditor(container, diaryId = null) {
    let diary = null;
    if (diaryId) {
      diary = await this.get(diaryId);
      if (!diary) {
        Utils.showToast('日记不存在', 'error');
        Router.navigate('/diary');
        return;
      }
      // 加载已有图片
      this.currentImages = diary.images || [];
    } else {
      // 新建日记，清空临时图片
      this.currentImages = [];
    }

    const isEdit = !!diary;
    const today = Utils.formatDate(Date.now(), 'YYYY-MM-DD');

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h2 class="card-title">${isEdit ? '编辑日记' : '写日记'}</h2>
              <button class="btn btn-ghost" onclick="Router.navigate('/diary')">返回</button>
            </div>
          </div>
          <div class="card-body">
            <form id="diaryForm" onsubmit="Diary.handleSubmit(event, '${diaryId || ''}')">
              <!-- 日期选择 -->
              <div class="input-group mb-lg">
                <label class="input-label">日期</label>
                <input type="date" class="input-field" id="diaryDate" 
                       value="${diary?.date || today}" max="${today}">
              </div>

              <!-- 心情选择 -->
              <div class="input-group mb-lg">
                <label class="input-label">今天心情如何？</label>
                <div class="mood-selector" id="moodSelector">
                  ${this.moods.map(mood => `
                    <div class="mood-option ${diary?.mood === mood.value ? 'selected' : ''}" 
                         data-value="${mood.value}" data-score="${mood.score}"
                         onclick="Diary.selectMood('${mood.value}')"
                         style="--mood-color: ${mood.color};">
                      <span class="mood-icon">${mood.icon}</span>
                      <span class="mood-label">${mood.label}</span>
                    </div>
                  `).join('')}
                </div>
                <input type="hidden" id="diaryMood" value="${diary?.mood || ''}">
                <input type="hidden" id="diaryMoodScore" value="${diary?.moodScore || ''}">
              </div>

              <!-- 日记标题 -->
              <div class="input-group mb-lg">
                <label class="input-label">标题（可选）</label>
                <input type="text" class="input-field" id="diaryTitle" 
                       placeholder="给今天起个标题吧" value="${diary?.title || ''}">
              </div>

              <!-- 日记内容 -->
              <div class="input-group mb-lg">
                <label class="input-label">内容</label>
                <textarea class="input-field diary-textarea" id="diaryContent" 
                          placeholder="今天发生了什么？有什么想法和感受？" 
                          required>${diary?.content || ''}</textarea>
              </div>

              <!-- 标签 -->
              <div class="input-group mb-lg">
                <label class="input-label">标签（用空格分隔）</label>
                <input type="text" class="input-field" id="diaryTags" 
                       placeholder="工作 生活 思考" 
                       value="${diary?.tags?.join(' ') || ''}">
              </div>

              <!-- 图片上传 -->
              <div class="input-group mb-lg">
                <label class="input-label">添加图片（最多9张）</label>
                <div class="image-upload-area">
                  <input type="file" id="imageInput" accept="image/*" multiple 
                         style="display: none;" onchange="Diary.handleImageUpload(event)">
                  <button type="button" class="btn btn-secondary" onclick="document.getElementById('imageInput').click()">
                    📷 选择图片
                  </button>
                  <span class="text-tertiary ml-md" id="imageCountHint">
                    ${this.currentImages.length > 0 ? `已选择 ${this.currentImages.length} 张` : '支持 JPG、PNG 格式'}
                  </span>
                </div>
                <div id="imagePreviewContainer" class="mt-md"></div>
              </div>

              <!-- 提交按钮 -->
              <div class="flex gap-md">
                <button type="submit" class="btn btn-primary flex-1">
                  ${isEdit ? '保存修改' : '保存日记'}
                </button>
                ${isEdit ? `
                  <button type="button" class="btn btn-danger" onclick="Diary.confirmDelete('${diaryId}')">
                    删除
                  </button>
                ` : ''}
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    
    // 渲染已有图片预览
    if (this.currentImages.length > 0) {
      this.renderImagePreview();
    }
  },

  /**
   * 选择心情
   */
  selectMood(value) {
    const mood = this.moods.find(m => m.value === value);
    if (!mood) return;

    document.querySelectorAll('.mood-option').forEach(el => {
      el.classList.remove('selected');
    });
    
    document.querySelector(`.mood-option[data-value="${value}"]`)?.classList.add('selected');
    document.getElementById('diaryMood').value = value;
    document.getElementById('diaryMoodScore').value = mood.score;
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(event, diaryId) {
    event.preventDefault();

    const content = document.getElementById('diaryContent').value.trim();
    if (!content) {
      Utils.showToast('请输入日记内容', 'error');
      return;
    }

    Utils.showLoading('正在保存...');

    try {
      const diaryData = {
        id: diaryId || null,
        title: document.getElementById('diaryTitle').value.trim(),
        content: content,
        images: this.currentImages, // 保存图片数据
        mood: document.getElementById('diaryMood').value || null,
        moodScore: parseInt(document.getElementById('diaryMoodScore').value) || null,
        date: document.getElementById('diaryDate').value,
        tags: document.getElementById('diaryTags').value.trim().split(/\s+/).filter(Boolean)
      };

      // 如果是新日记，尝试 AI 分析
      if (!diaryId && API.isConfigured()) {
        const analysis = await this.analyzeContent(content);
        if (analysis) {
          diaryData.analysis = analysis;
          // 如果用户没选心情，使用 AI 分析的
          if (!diaryData.moodScore && analysis.moodScore) {
            diaryData.moodScore = analysis.moodScore;
          }
        }
      }

      await this.save(diaryData);

      // 清空临时图片数组
      this.currentImages = [];

      Utils.hideLoading();
      Utils.showToast(diaryId ? '日记已更新' : '日记已保存', 'success');
      Router.navigate('/diary');

    } catch (error) {
      Utils.hideLoading();
      console.error('保存日记失败:', error);
      Utils.showToast('保存失败', 'error');
    }
  },

  /**
   * 显示日记详情
   */
  showDetail(id) {
    Router.navigate(`/diary/${id}`);
  },

  /**
   * 渲染日记详情
   */
  async renderDetail(container, diaryId) {
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
  },

  /**
   * 渲染日记内容（简单 markdown）
   */
  renderContent(content) {
    return Utils.renderMarkdown(content);
  },

  /**
   * 显示图片查看器
   */
  async showImageViewer(diaryId, initialIndex = 0) {
    const diary = await this.get(diaryId);
    if (!diary || !diary.images || diary.images.length === 0) return;

    let currentIndex = initialIndex;
    const images = diary.images;

    const updateViewer = () => {
      const img = document.getElementById('viewerImage');
      const counter = document.getElementById('viewerCounter');
      if (img) img.src = images[currentIndex].data;
      if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
    };

    // 创建查看器
    const viewer = document.createElement('div');
    viewer.id = 'imageViewer';
    viewer.className = 'image-viewer';
    viewer.innerHTML = `
      <div class="image-viewer-backdrop" onclick="Diary.closeImageViewer()"></div>
      <div class="image-viewer-content">
        <img id="viewerImage" src="${images[currentIndex].data}" alt="查看图片">
        <div class="image-viewer-controls">
          <button class="btn btn-ghost" onclick="Diary.viewerPrev()" ${images.length <= 1 ? 'disabled' : ''}>
            ◀ 上一张
          </button>
          <span id="viewerCounter" class="text-secondary">${currentIndex + 1} / ${images.length}</span>
          <button class="btn btn-ghost" onclick="Diary.viewerNext()" ${images.length <= 1 ? 'disabled' : ''}>
            下一张 ▶
          </button>
        </div>
        <button class="image-viewer-close" onclick="Diary.closeImageViewer()">✕</button>
      </div>
    `;

    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';

    // 存储状态和方法到临时对象
    this._viewer = {
      currentIndex,
      images,
      update: updateViewer
    };
  },

  /**
   * 查看器：上一张
   */
  viewerPrev() {
    if (!this._viewer) return;
    this._viewer.currentIndex = (this._viewer.currentIndex - 1 + this._viewer.images.length) % this._viewer.images.length;
    this._viewer.update();
  },

  /**
   * 查看器：下一张
   */
  viewerNext() {
    if (!this._viewer) return;
    this._viewer.currentIndex = (this._viewer.currentIndex + 1) % this._viewer.images.length;
    this._viewer.update();
  },

  /**
   * 关闭图片查看器
   */
  closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
      viewer.remove();
      document.body.style.overflow = '';
      this._viewer = null;
    }
  },

  /**
   * 确认删除
   */
  async confirmDelete(id) {
    const confirmed = await Utils.confirm('确定要删除这篇日记吗？此操作不可撤销。');
    if (confirmed) {
      await this.delete(id);
      Utils.showToast('日记已删除', 'success');
      Router.navigate('/diary');
    }
  },

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('diary-styles')) return;

    const style = document.createElement('style');
    style.id = 'diary-styles';
    style.textContent = `
      .diary-month-group {
        margin-bottom: var(--spacing-xl);
      }

      .diary-month-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: 1px solid var(--border-color);
      }

      .diary-card {
        cursor: pointer;
      }

      .diary-mood-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .diary-title {
        font-size: var(--font-size-base);
        line-height: 1.4;
      }

      .diary-image-indicator {
        margin-left: var(--spacing-xs);
        font-size: var(--font-size-sm);
        opacity: 0.8;
      }

      .diary-preview {
        font-size: var(--font-size-sm);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .diary-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
      }

      .diary-tag {
        font-size: var(--font-size-xs);
        color: var(--color-primary);
        background-color: var(--color-primary-light);
        padding: 2px 8px;
        border-radius: var(--radius-full);
      }

      .diary-textarea {
        min-height: 300px;
        resize: vertical;
        line-height: 1.8;
      }

      .mood-selector {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
      }

      .mood-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-md);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        min-width: 70px;
      }

      .mood-option:hover {
        border-color: var(--mood-color);
        background-color: color-mix(in srgb, var(--mood-color) 10%, transparent);
      }

      .mood-option.selected {
        border-color: var(--mood-color);
        background-color: color-mix(in srgb, var(--mood-color) 15%, transparent);
      }

      .mood-icon {
        font-size: 1.5rem;
      }

      .mood-label {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .mood-option.selected .mood-label {
        color: var(--mood-color);
        font-weight: 500;
      }

      .diary-mood-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 500;
      }

      .diary-content-view {
        line-height: 1.8;
        font-size: var(--font-size-base);
      }

      .diary-content-view p {
        margin-bottom: var(--spacing-md);
      }

      @media (max-width: 640px) {
        .mood-selector {
          justify-content: center;
        }

        .mood-option {
          min-width: 60px;
          padding: var(--spacing-sm);
        }
      }

      /* 图片上传区域 */
      .image-upload-area {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
      }

      /* 图片预览网格 */
      .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-sm);
      }

      .image-preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md);
        overflow: hidden;
        background-color: var(--bg-secondary);
      }

      .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color var(--transition-fast);
      }

      .image-remove-btn:hover {
        background-color: rgba(239, 68, 68, 0.9);
      }

      /* 日记详情页图片网格 */
      .diary-images-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-md);
      }

      .diary-image-item {
        aspect-ratio: 1;
        border-radius: var(--radius-lg);
        overflow: hidden;
        cursor: pointer;
        transition: transform var(--transition-fast);
      }

      .diary-image-item:hover {
        transform: scale(1.02);
      }

      .diary-image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* 图片查看器 */
      .image-viewer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-viewer-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
      }

      .image-viewer-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .image-viewer-content img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: var(--radius-md);
      }

      .image-viewer-controls {
        margin-top: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        color: white;
      }

      .image-viewer-controls .btn {
        color: white;
        border-color: rgba(255, 255, 255, 0.3);
      }

      .image-viewer-controls .btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .image-viewer-controls .btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .image-viewer-close {
        position: absolute;
        top: -40px;
        right: 0;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color var(--transition-fast);
      }

      .image-viewer-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 640px) {
        .image-preview-grid,
        .diary-images-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .image-viewer-controls {
          gap: var(--spacing-md);
        }

        .image-viewer-controls .btn {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-sm);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Diary = Diary;
