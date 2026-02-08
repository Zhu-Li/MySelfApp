/**
 * diary.js - 个人日记模块（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 模块结构:
 * - diary.js (本文件) - 核心协调器：数据管理、心情配置
 * - image-handler.js - 图片处理：压缩、上传、预览、查看器
 * - list-renderer.js - 列表渲染：日记列表、卡片、统计
 * - editor-renderer.js - 编辑器：表单渲染、心情选择、提交
 * - detail-renderer.js - 详情页：详情渲染、AI分析、删除确认
 * - diary-styles.js - 页面样式
 */

const Diary = {
  /**
   * 获取所有日记（按日期倒序）
   * @returns {Array} 日记数组
   */
  async getAll() {
    const diaries = await Storage.getAll('diary');
    return diaries.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * 获取单篇日记
   * @param {string} id - 日记ID
   * @returns {Object|null} 日记数据
   */
  async get(id) {
    return Storage.get('diary', id);
  },

  /**
   * 保存日记
   * @param {Object} diaryData - 日记数据
   * @returns {Object} 保存后的日记
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
   * @param {string} id - 日记ID
   */
  async delete(id) {
    return Storage.delete('diary', id);
  },

  /**
   * 生成标题（取内容前20字）
   * @param {string} content - 日记内容
   * @returns {string} 生成的标题
   */
  generateTitle(content) {
    if (!content) return '无标题';
    const text = content.replace(/[#*\n]/g, ' ').trim();
    return text.length > 20 ? text.slice(0, 20) + '...' : text;
  },

  /**
   * 心情选项配置
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
   * @param {string} moodValue - 心情值
   * @returns {Object} 心情信息
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
  imageQuality: 0.8

  // 以下方法由子模块扩展：
  // 
  // image-handler.js:
  // - compressImage(file) - 压缩图片
  // - handleImageUpload(event) - 处理图片上传
  // - removeImage(imageId) - 删除图片
  // - renderImagePreview() - 渲染图片预览
  // - showImageViewer(diaryId, initialIndex) - 显示图片查看器
  // - viewerPrev() - 查看器上一张
  // - viewerNext() - 查看器下一张
  // - closeImageViewer() - 关闭图片查看器
  //
  // list-renderer.js:
  // - renderList(container) - 渲染日记列表
  // - renderDiaryCard(diary) - 渲染日记卡片
  // - groupByMonth(diaries) - 按月份分组
  // - getStreakDays(diaries) - 计算连续天数
  // - getAverageMoodIcon(diaries) - 平均心情图标
  // - getAverageMoodText(diaries) - 平均心情文字
  //
  // editor-renderer.js:
  // - showEditor(diaryId) - 显示编辑器
  // - renderEditor(container, diaryId) - 渲染编辑器
  // - selectMood(value) - 选择心情
  // - handleSubmit(event, diaryId) - 处理表单提交
  //
  // detail-renderer.js:
  // - analyzeContent(content) - AI情感分析
  // - analyzeInBackground(diaryId, content) - 后台异步分析
  // - showDetail(id) - 显示详情
  // - renderDetail(container, diaryId) - 渲染详情
  // - renderContent(content) - 渲染内容
  // - confirmDelete(id) - 确认删除
  //
  // diary-styles.js:
  // - addStyles() - 添加样式
};

// 导出到全局
window.Diary = Diary;
