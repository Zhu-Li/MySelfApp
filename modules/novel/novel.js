/**
 * novel.js - 小说模块协调器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：小说数据管理、阅读进度追踪、模块协调
 */

const Novel = {
  /** 当前浏览的书 */
  currentBook: null,

  /** 阅读器设置缓存 */
  settings: {
    fontSize: 'medium',   // small | medium | large
    theme: 'light'        // light | dark | eye
  },

  /**
   * 初始化模块（首次访问时调用一次）
   */
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    // 从 IndexedDB 恢复阅读器设置
    try {
      const saved = await Storage.getRaw('novelSettings', 'readerSettings');
      if (saved) {
        this.settings.fontSize = saved.fontSize || 'medium';
        this.settings.theme = saved.theme || 'light';
      }
    } catch (e) {
      // 首次使用或数据库尚未升级，忽略
    }
  },

  /**
   * 获取所有书籍
   */
  getBooks() {
    return (window.NovelsData && NovelsData.books) || [];
  },

  /**
   * 根据ID获取书籍
   */
  getBook(bookId) {
    return this.getBooks().find(b => b.id === bookId) || null;
  },

  /**
   * 获取章节内容URL
   */
  getChapterUrl(book, chapter) {
    const base = NovelsData.baseUrl;
    return `${base}/${encodeURIComponent(book.folder)}/正文/${encodeURIComponent(chapter.filename)}`;
  },

  /**
   * 拉取章节文本
   */
  async fetchChapter(book, chapter) {
    const url = this.getChapterUrl(book, chapter);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`加载失败 (${resp.status})`);
    const text = await resp.text();
    return text;
  },

  // ============ 阅读进度 ============

  /**
   * 保存阅读进度
   */
  async saveProgress(bookId, chapterId, scrollPercent) {
    try {
      await Storage.setRaw('novelProgress', {
        id: bookId,
        chapterId,
        scrollPercent: scrollPercent || 0,
        updatedAt: Date.now()
      });
    } catch (e) {
      // 静默失败（数据库未升级时）
    }
  },

  /**
   * 获取阅读进度
   */
  async getProgress(bookId) {
    try {
      return await Storage.getRaw('novelProgress', bookId);
    } catch (e) {
      return null;
    }
  },

  /**
   * 获取所有阅读进度
   */
  async getAllProgress() {
    try {
      return await Storage.getAllRaw('novelProgress') || [];
    } catch (e) {
      return [];
    }
  },

  // ============ 设置管理 ============

  /**
   * 保存阅读器设置
   */
  async saveSettings() {
    try {
      await Storage.setRaw('novelSettings', {
        id: 'readerSettings',
        fontSize: this.settings.fontSize,
        theme: this.settings.theme
      });
    } catch (e) {
      // 静默
    }
  },

  // ============ 渲染入口 ============

  /**
   * 渲染书架页（书籍列表）
   */
  async renderBookList(container) {
    await this.init();
    this.addStyles();
    this.currentBook = null;
    await NovelRenderer.renderBookList(container);
  },

  /**
   * 渲染章节列表
   */
  async renderChapterList(container, bookId) {
    await this.init();
    this.addStyles();
    const book = this.getBook(bookId);
    if (!book) {
      container.innerHTML = '<div class="novel-empty"><div class="novel-empty-icon">📚</div><p class="novel-empty-text">未找到该书籍</p></div>';
      return;
    }
    this.currentBook = book;
    await NovelRenderer.renderChapterList(container, book);
  },

  /**
   * 打开阅读器
   */
  async openReader(bookId, chapterId) {
    await this.init();
    this.addStyles();
    const book = this.getBook(bookId);
    if (!book) return;
    const chapter = book.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    this.currentBook = book;
    await NovelRenderer.openReader(book, chapter);
  },

  /**
   * 关闭阅读器
   */
  closeReader() {
    NovelRenderer.closeReader();
    // 导航回章节列表
    if (this.currentBook) {
      window.location.hash = `#/novel/${this.currentBook.id}`;
    } else {
      window.location.hash = '#/novel';
    }
  }
};

// 导出到全局
window.Novel = Novel;
