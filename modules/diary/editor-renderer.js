/**
 * editor-renderer.js - 日记编辑器
 * 观己 - 静观己心，内外澄明
 * 
 * 从 diary.js 拆分
 * 职责：日记编辑器渲染、心情选择、表单提交
 */

/**
 * 显示日记编辑器
 * @param {string|null} diaryId - 日记ID（编辑模式）
 */
Diary.showEditor = function(diaryId = null) {
  Router.navigate(diaryId ? `/diary/edit/${diaryId}` : '/diary/new');
};

/**
 * 渲染日记编辑器
 * @param {HTMLElement} container - 容器元素
 * @param {string|null} diaryId - 日记ID
 */
Diary.renderEditor = async function(container, diaryId = null) {
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
};

/**
 * 选择心情
 * @param {string} value - 心情值
 */
Diary.selectMood = function(value) {
  const mood = this.moods.find(m => m.value === value);
  if (!mood) return;

  document.querySelectorAll('.mood-option').forEach(el => {
    el.classList.remove('selected');
  });
  
  document.querySelector(`.mood-option[data-value="${value}"]`)?.classList.add('selected');
  document.getElementById('diaryMood').value = value;
  document.getElementById('diaryMoodScore').value = mood.score;
};

/**
 * 处理表单提交
 * @param {Event} event - 表单事件
 * @param {string} diaryId - 日记ID
 */
Diary.handleSubmit = async function(event, diaryId) {
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

    // 先保存日记
    const savedDiary = await this.save(diaryData);

    // 清空临时图片数组
    this.currentImages = [];

    Utils.hideLoading();
    Utils.showToast(diaryId ? '日记已更新' : '日记已保存', 'success');
    Router.navigate('/diary');

    // 如果是新日记，在后台异步执行 AI 分析（不阻塞用户）
    if (!diaryId && API.isConfigured()) {
      this.analyzeInBackground(savedDiary.id, content);
    }

  } catch (error) {
    Utils.hideLoading();
    console.error('保存日记失败:', error);
    Utils.showToast('保存失败', 'error');
  }
};
