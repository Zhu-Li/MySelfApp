/**
 * classics.js - 古籍模块协调器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：古籍分类数据加载、阅读进度管理、内容获取
 * 数据按需加载：分类概览 → 分类目录树 → 古籍全文
 */

const Classics = {
  /** 十大分类数据缓存 */
  _categoriesData: null,

  /** 分类目录树缓存 { '佛藏': {...} } */
  _catalogCache: {},

  /**
   * 初始化 - 加载分类概览
   */
  async init() {
    if (this._categoriesData) return;
    await this._loadCategories();
  },

  /**
   * 加载分类概览数据
   */
  async _loadCategories() {
    try {
      const resp = await fetch('/api/classics/categories');
      if (resp.ok && (resp.headers.get('content-type') || '').includes('json')) {
        this._categoriesData = await resp.json();
        return;
      }
    } catch (e) { /* API 不可用 */ }

    // 回退：静态 JSON
    try {
      const resp = await fetch('classics/index.json?t=' + Date.now());
      if (resp.ok) {
        this._categoriesData = await resp.json();
        return;
      }
    } catch (e) {
      console.warn('古籍分类数据加载失败:', e.message);
    }

    if (!this._categoriesData) {
      this._categoriesData = { categories: [], totalBooks: 0 };
    }
  },

  /**
   * 获取分类列表
   */
  getCategories() {
    return (this._categoriesData && this._categoriesData.categories) || [];
  },

  /**
   * 获取总书籍数
   */
  getTotalBooks() {
    return (this._categoriesData && this._categoriesData.totalBooks) || 0;
  },

  /**
   * 加载指定分类的目录树（带缓存）
   */
  async loadCatalog(categoryId) {
    if (this._catalogCache[categoryId]) {
      return this._catalogCache[categoryId];
    }

    try {
      const resp = await fetch('/api/classics/catalog?category=' + encodeURIComponent(categoryId));
      if (resp.ok && (resp.headers.get('content-type') || '').includes('json')) {
        const data = await resp.json();
        this._catalogCache[categoryId] = data;
        return data;
      }
    } catch (e) { /* API 不可用 */ }

    // 回退：静态 JSON
    try {
      const resp = await fetch('classics/catalog/' + encodeURIComponent(categoryId) + '.json?t=' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        this._catalogCache[categoryId] = data;
        return data;
      }
    } catch (e) {
      console.warn('分类目录加载失败:', e.message);
    }

    return null;
  },

  /**
   * 根据路径导航目录树，获取当前节点
   * @param {object} catalog - 分类目录树根节点
   * @param {string[]} pathParts - 路径片段数组 ['乾隆藏', '大乘般若部']
   * @returns {object|null} 当前节点
   */
  navigateTree(catalog, pathParts) {
    let node = catalog;
    for (const part of pathParts) {
      if (!node || !node.children) return null;
      const child = node.children.find(c => c.type === 'directory' && c.name === part);
      if (!child) return null;
      node = child;
    }
    return node;
  },

  /**
   * 获取古籍全文内容
   */
  async fetchContent(bookId) {
    try {
      const resp = await fetch('/api/classics/content?id=' + encodeURIComponent(bookId));
      if (resp.ok) return await resp.text();
      throw new Error('加载失败 (' + resp.status + ')');
    } catch (e) {
      throw e;
    }
  },

  // ============ 阅读进度 ============

  /**
   * 保存阅读进度
   */
  async saveProgress(bookId, name, category, scrollPercent) {
    try {
      await Storage.setRaw('classicsProgress', {
        id: bookId,
        name: name || '',
        category: category || '',
        scrollPercent: scrollPercent || 0,
        updatedAt: Date.now()
      });
    } catch (e) { /* 静默 */ }
  },

  /**
   * 获取阅读进度
   */
  async getProgress(bookId) {
    try {
      return await Storage.getRaw('classicsProgress', bookId);
    } catch (e) {
      return null;
    }
  },

  /**
   * 获取所有阅读进度
   */
  async getAllProgress() {
    try {
      return await Storage.getAllRaw('classicsProgress') || [];
    } catch (e) {
      return [];
    }
  },

  // ============ 渲染入口 ============

  /**
   * 渲染分类列表
   */
  async renderCategories(container) {
    await this.init();
    this.addStyles();
    await ClassicsRenderer.renderCategories(container);
  },

  /**
   * 渲染分类浏览
   */
  async renderBrowse(container, categoryId, pathStr) {
    await this.init();
    this.addStyles();
    await ClassicsRenderer.renderBrowse(container, categoryId, pathStr);
  },

  /**
   * 打开古籍阅读器（复用小说阅读器）
   */
  async openReader(bookId, bookName, categoryName) {
    // 构造兼容 Novel 阅读器的虚拟 book/chapter 对象
    const virtualBook = {
      id: bookId,
      name: bookName || '古籍',
      totalChapters: 1,
      chapters: [{
        id: 'full',
        number: 1,
        title: bookName || '古籍',
        filename: null
      }],
      _isClassic: true,
      _classicCategory: categoryName || '',
      _returnHash: window.location.hash || '#/book'
    };

    Novel.addStyles();
    this.addStyles();
    Novel.currentBook = virtualBook;
    await NovelRenderer.openReader(virtualBook, virtualBook.chapters[0]);
  }
};

// 导出到全局
window.Classics = Classics;
