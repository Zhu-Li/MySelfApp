/**
 * book-renderer.js - 书籍主页渲染器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：Tab 栏渲染 + 委托给 NovelRenderer / ClassicsRenderer
 */

const BookRenderer = {
  /**
   * 渲染书籍主页
   */
  async renderMain(container) {
    const tab = Book.currentTab;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="book-page">
          <div class="book-tabs">
            <div class="book-tabs-inner">
              <button class="book-tab-btn${tab === 'novel' ? ' active' : ''}" data-tab="novel">
                <span class="book-tab-icon">📖</span>
                <span>小说</span>
              </button>
              <button class="book-tab-btn${tab === 'classics' ? ' active' : ''}" data-tab="classics">
                <span class="book-tab-icon">📜</span>
                <span>古籍</span>
              </button>
            </div>
          </div>
          <div class="book-tab-content" id="bookTabContent">
            <div class="book-loading">加载中...</div>
          </div>
        </div>
      </div>
    `;

    // 绑定 Tab 切换事件
    container.querySelectorAll('.book-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Book.switchTab(btn.dataset.tab);
      });
    });

    // 加载默认 Tab 内容
    const contentEl = document.getElementById('bookTabContent');
    if (tab === 'novel') {
      await Novel.renderBookList(contentEl);
    } else {
      await Classics.renderCategories(contentEl);
    }
  }
};

// 导出到全局
window.BookRenderer = BookRenderer;
