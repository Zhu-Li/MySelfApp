/**
 * book.js - 书籍模块协调器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：统一书籍入口，Tab 状态管理，委托 Novel / Classics 子模块
 */

const Book = {
  /** 当前激活的 Tab: 'novel' | 'classics' */
  currentTab: 'novel',

  /**
   * 渲染书籍主页（Tab 切换）
   */
  async renderMain(container) {
    this.addStyles();

    // 从 URL hash 检测是否需要切换到古籍 Tab
    const hash = window.location.hash;
    if (hash.includes('/book/classics') || hash.includes('tab=classics')) {
      this.currentTab = 'classics';
    }

    await BookRenderer.renderMain(container);
  },

  /**
   * 切换 Tab
   */
  async switchTab(tab) {
    if (tab === this.currentTab) return;
    this.currentTab = tab;

    const contentEl = document.getElementById('bookTabContent');
    if (!contentEl) return;

    // 更新 Tab 按钮状态
    document.querySelectorAll('.book-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // 渲染对应内容
    contentEl.innerHTML = '<div class="book-loading">加载中...</div>';
    if (tab === 'novel') {
      await Novel.renderBookList(contentEl);
    } else {
      await Classics.renderCategories(contentEl);
    }
  }
};

// 导出到全局
window.Book = Book;
