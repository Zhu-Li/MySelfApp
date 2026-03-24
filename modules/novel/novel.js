/**
 * novel.js - 小说模块协调器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：小说数据管理、阅读进度追踪、模块协调
 * 每次进入模块时调用后台 Windows 服务 API 触发增量扫描同步，
 * 若服务不可用则回退到静态 novel/index.json
 */

const Novel = {
  /** 当前浏览的书 */
  currentBook: null,

  /** 动态加载的小说数据 */
  _data: null,

  /** 阅读器设置缓存 */
  settings: {
    fontSize: 'medium',   // small | medium | large
    theme: 'light',       // light | dark | eye
    tts: {
      rate: 1.0,          // 语速 0.5 - 2.0
      voiceURI: 'zh-CN-XiaoxiaoNeural',  // Edge TTS 默认语音
      volume: 1.0         // 音量 0 - 1
    }
  },

  /**
   * 初始化模块（每次进入模块时调用，动态加载最新数据）
   */
  async init() {
    // 每次进入模块都重新加载数据，实现动态刷新
    await this._loadData();

    // 阅读器设置只需恢复一次
    if (!this._settingsLoaded) {
      this._settingsLoaded = true;
      try {
        const saved = await Storage.getRaw('novelSettings', 'readerSettings');
        if (saved) {
          this.settings.fontSize = saved.fontSize || 'medium';
          this.settings.theme = saved.theme || 'light';
          if (saved.tts) {
            this.settings.tts = Object.assign(this.settings.tts, saved.tts);
          }
        }
      } catch (e) {
        // 首次使用或数据库尚未升级，忽略
      }
    }
  },

  /**
   * 从服务器动态加载小说数据
   * 优先调用后台 Windows 服务 API（触发增量扫描同步）
   * 若服务不可用，回退到静态 novel/index.json
   */
  async _loadData() {
    // 优先：调用 API（通过 Nginx 反向代理转发到 Node.js 服务）
    try {
      const resp = await fetch('/api/novel/refresh');
      if (resp.ok) {
        this._data = await resp.json();
        return;
      }
    } catch (e) {
      // API 不可用，回退静态文件
    }

    // 回退：读取静态 index.json
    try {
      const resp = await fetch('novel/index.json?t=' + Date.now());
      if (resp.ok) {
        this._data = await resp.json();
        return;
      }
    } catch (e) {
      console.warn('小说数据加载失败:', e.message);
    }

    if (!this._data) {
      this._data = { baseUrl: 'novel', books: [] };
    }
  },

  /**
   * 获取所有书籍
   */
  getBooks() {
    return (this._data && this._data.books) || [];
  },

  /**
   * 根据ID获取书籍
   */
  getBook(bookId) {
    return this.getBooks().find(b => b.id === bookId) || null;
  },

  /**
   * 获取章节内容URL（相对路径，ASCII文件名）
   */
  getChapterUrl(book, chapter) {
    const base = (this._data && this._data.baseUrl) || 'novel';
    return `${base}/${book.id}/${chapter.filename}`;
  },

  /**
   * 拉取章节文本（通过 API 读取，不直接访问 txt 文件）
   */
  async fetchChapter(book, chapter) {
    // 古籍：通过古籍 API 读取
    if (book._isClassic) {
      const resp = await fetch('/api/classics/content?id=' + encodeURIComponent(book.id));
      if (resp.ok) return await resp.text();
      throw new Error('古籍加载失败 (' + resp.status + ')');
    }

    // 小说：优先通过 API 读取章节内容（Nginx 代理转发）
    try {
      const apiUrl = `/api/novel/chapter?book=${encodeURIComponent(book.id)}&file=${encodeURIComponent(chapter.filename)}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) return await resp.text();
    } catch (e) {
      // API 不可用，尝试直接访问静态文件
    }

    // 回退：直接 fetch 静态 txt 文件
    const url = this.getChapterUrl(book, chapter);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`加载失败 (${resp.status})`);
    return await resp.text();
  },

  // ============ 阅读进度 ============

  /**
   * 保存阅读进度
   */
  async saveProgress(bookId, chapterId, scrollPercent) {
    try {
      // 古籍：保存到 classicsProgress 表
      const book = this.currentBook;
      if (book && book._isClassic) {
        await Storage.setRaw('classicsProgress', {
          id: bookId,
          name: book.name || '',
          category: book._classicCategory || '',
          scrollPercent: scrollPercent || 0,
          updatedAt: Date.now()
        });
        return;
      }

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
        theme: this.settings.theme,
        tts: this.settings.tts
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
    // 导航回对应页面
    if (this.currentBook && this.currentBook._isClassic) {
      window.location.hash = '#/book';
    } else if (this.currentBook) {
      window.location.hash = `#/book/novel/${this.currentBook.id}`;
    } else {
      window.location.hash = '#/book';
    }
  }
};

// 导出到全局
window.Novel = Novel;
