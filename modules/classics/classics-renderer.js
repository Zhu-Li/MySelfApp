/**
 * classics-renderer.js - 古籍分类浏览渲染器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：分类卡片视图、面包屑导航、书籍列表（分页）
 */

const ClassicsRenderer = {
  /** 每页显示数量 */
  PAGE_SIZE: 50,

  // ============ 分类卡片视图 ============

  /**
   * 渲染十大分类列表
   */
  async renderCategories(container) {
    const categories = Classics.getCategories();
    const totalBooks = Classics.getTotalBooks();

    const cardsHtml = categories.length > 0
      ? `<div class="classics-grid">${categories.map(cat => this._renderCategoryCard(cat)).join('')}</div>`
      : `<div class="classics-empty">
           <div class="classics-empty-icon">📜</div>
           <p class="classics-empty-text">古籍数据未初始化，请先运行数据生成脚本</p>
         </div>`;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="classics-page">
          <div class="classics-header">
            <div class="classics-header-icon">📜</div>
            <h1 class="classics-header-title">古籍典藏</h1>
            <p class="classics-header-desc">十大分类，${totalBooks.toLocaleString()} 部古典文献</p>
          </div>
          <div class="classics-search-wrapper">
            <div class="classics-search-box">
              <span class="classics-search-icon">&#x1f50d;</span>
              <input class="classics-search-input" id="classicsSearchInput" type="text" placeholder="搜索古籍名称..." autocomplete="off">
              <span class="classics-search-clear" id="classicsSearchClear" style="display:none">&#x2715;</span>
              <span class="classics-search-spinner" id="classicsSearchSpinner" style="display:none"></span>
            </div>
            <div class="classics-search-results" id="classicsSearchResults" style="display:none"></div>
          </div>
          ${cardsHtml}
        </div>
      </div>
    `;

    // 绑定分类卡片点击
    container.querySelectorAll('.classics-category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.dataset.categoryId;
        if (catId) {
          card.classList.add('is-loading');
          window.location.hash = '#/book/classics?cat=' + encodeURIComponent(catId);
        }
      });
    });

    // 绑定搜索事件
    this._bindSearchEvents(container);
  },

  /**
   * 渲染单个分类卡片
   */
  _renderCategoryCard(cat) {
    return `
      <div class="classics-category-card" data-category-id="${Utils.escapeHtml(cat.id)}">
        <div class="classics-category-icon">${cat.icon || '📄'}</div>
        <div class="classics-category-body">
          <h3 class="classics-category-name">${Utils.escapeHtml(cat.name)}</h3>
          <p class="classics-category-desc">${Utils.escapeHtml(cat.description || '')}</p>
          <span class="classics-category-count">${cat.bookCount.toLocaleString()} 部</span>
        </div>
      </div>
    `;
  },

  // ============ 分类浏览视图 ============

  /**
   * 渲染分类浏览（子目录 + 书籍列表）
   */
  async renderBrowse(container, categoryId, pathStr) {
    // 立即显示骨架屏
    container.innerHTML = this._renderSkeleton(categoryId);

    // 加载分类目录树
    const catalog = await Classics.loadCatalog(categoryId);
    if (!catalog) {
      container.innerHTML = `
        <div class="page-container animate-fade-in">
          <div class="classics-empty">
            <div class="classics-empty-icon">📚</div>
            <p class="classics-empty-text">分类 "${Utils.escapeHtml(categoryId)}" 数据加载失败</p>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/book'">返回书籍</button>
          </div>
        </div>`;
      return;
    }

    // 解析路径
    const pathParts = pathStr ? pathStr.split('/').filter(Boolean) : [];
    const currentNode = pathParts.length > 0 ? Classics.navigateTree(catalog, pathParts) : catalog;

    if (!currentNode) {
      container.innerHTML = `
        <div class="page-container animate-fade-in">
          <div class="classics-empty">
            <div class="classics-empty-icon">📚</div>
            <p class="classics-empty-text">路径不存在</p>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/book/classics?cat=${encodeURIComponent(categoryId)}'">返回分类</button>
          </div>
        </div>`;
      return;
    }

    const children = currentNode.children || [];
    const dirs = children.filter(c => c.type === 'directory');
    const books = children.filter(c => c.type === 'book');

    // 面包屑
    const breadcrumbHtml = this._renderBreadcrumb(categoryId, pathParts);

    // 子目录
    const dirsHtml = dirs.length > 0 ? `
      <div class="classics-section-title">子分类 (${dirs.length})</div>
      <div class="classics-dirs-grid">
        ${dirs.map(dir => {
          const newPath = pathParts.concat(dir.name).join('/');
          return `
            <div class="classics-dir-card" data-path="${Utils.escapeHtml(newPath)}">
              <span class="classics-dir-icon">📁</span>
              <span class="classics-dir-name">${Utils.escapeHtml(dir.name)}</span>
              <span class="classics-dir-count">${dir.bookCount} 部</span>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    // 书籍列表（初始只显示第一页）
    const booksHtml = books.length > 0 ? this._renderBookList(books, 0, categoryId) : '';

    const currentName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : categoryId;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="classics-browse-page">
          ${breadcrumbHtml}
          <div class="classics-browse-header">
            <h2 class="classics-browse-title">${Utils.escapeHtml(currentName)}</h2>
            <span class="classics-browse-stats">${dirs.length > 0 ? dirs.length + ' 个子分类, ' : ''}${books.length} 部古籍</span>
          </div>
          ${dirsHtml}
          <div id="classicsBookListContainer">
            ${booksHtml}
          </div>
        </div>
      </div>
    `;

    // 绑定子目录点击
    container.querySelectorAll('.classics-dir-card').forEach(card => {
      card.addEventListener('click', () => {
        const p = card.dataset.path;
        card.classList.add('is-loading');
        window.location.hash = '#/book/classics?cat=' + encodeURIComponent(categoryId) + '&path=' + encodeURIComponent(p);
      });
    });

    // 绑定书籍点击和加载更多
    this._bindBookListEvents(container, books, categoryId);
  },

  /**
   * 渲染面包屑
   */
  _renderBreadcrumb(categoryId, pathParts) {
    const items = [];
    items.push({ label: '书籍', hash: '#/book' });
    items.push({ label: '古籍', hash: '#/book', isTab: true });

    if (pathParts.length === 0) {
      items.push({ label: categoryId, hash: null });
    } else {
      items.push({
        label: categoryId,
        hash: '#/book/classics?cat=' + encodeURIComponent(categoryId)
      });
      for (let i = 0; i < pathParts.length; i++) {
        const isLast = i === pathParts.length - 1;
        const subPath = pathParts.slice(0, i + 1).join('/');
        items.push({
          label: pathParts[i],
          hash: isLast ? null : '#/book/classics?cat=' + encodeURIComponent(categoryId) + '&path=' + encodeURIComponent(subPath)
        });
      }
    }

    return `
      <nav class="classics-breadcrumb">
        ${items.map((item, idx) => {
          const sep = idx > 0 ? '<span class="classics-breadcrumb-sep">›</span>' : '';
          if (item.hash) {
            return `${sep}<a class="classics-breadcrumb-link" href="${item.hash}">${Utils.escapeHtml(item.label)}</a>`;
          }
          return `${sep}<span class="classics-breadcrumb-current">${Utils.escapeHtml(item.label)}</span>`;
        }).join('')}
      </nav>
    `;
  },

  /**
   * 渲染书籍列表（分页）
   */
  _renderBookList(books, page, categoryId) {
    const start = page * this.PAGE_SIZE;
    const end = Math.min(start + this.PAGE_SIZE, books.length);
    const visibleBooks = books.slice(start, end);

    if (visibleBooks.length === 0) return '';

    const sectionTitle = page === 0 ? `<div class="classics-section-title">古籍列表</div>` : '';

    const listHtml = visibleBooks.map(book => {
      const sizeStr = book.size > 1024 * 1024
        ? (book.size / (1024 * 1024)).toFixed(1) + ' MB'
        : book.size > 1024
          ? Math.round(book.size / 1024) + ' KB'
          : book.size + ' B';
      return `
        <div class="classics-book-item" data-book-id="${Utils.escapeHtml(book.id)}" data-book-name="${Utils.escapeHtml(book.name)}" data-category="${Utils.escapeHtml(categoryId)}">
          <span class="classics-book-icon">📜</span>
          <div class="classics-book-info">
            <span class="classics-book-name">${Utils.escapeHtml(book.name)}</span>
            <span class="classics-book-size">${sizeStr}</span>
          </div>
          <button class="classics-book-read-btn">阅读</button>
        </div>
      `;
    }).join('');

    const hasMore = end < books.length;
    const loadMoreHtml = hasMore ? `
      <div class="classics-load-more" id="classicsLoadMore" data-page="${page + 1}">
        <button class="classics-load-more-btn">加载更多 (${books.length - end} 部)</button>
      </div>
    ` : '';

    return sectionTitle + `<div class="classics-book-list" id="classicsBookList">${listHtml}</div>` + loadMoreHtml;
  },

  /**
   * 绑定书籍列表事件
   */
  _bindBookListEvents(container, allBooks, categoryId) {
    // 书籍点击
    container.querySelectorAll('.classics-book-item').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.bookId;
        const bookName = item.dataset.bookName;
        const cat = item.dataset.category;
        if (bookId) {
          item.classList.add('is-loading');
          Classics.openReader(bookId, bookName, cat);
        }
      });
    });

    // 加载更多
    const loadMoreEl = container.querySelector('#classicsLoadMore');
    if (loadMoreEl) {
      loadMoreEl.querySelector('.classics-load-more-btn').addEventListener('click', () => {
        const page = parseInt(loadMoreEl.dataset.page, 10);
        const start = page * this.PAGE_SIZE;
        const end = Math.min(start + this.PAGE_SIZE, allBooks.length);
        const visibleBooks = allBooks.slice(start, end);

        // 追加书籍
        const list = container.querySelector('#classicsBookList');
        visibleBooks.forEach(book => {
          const sizeStr = book.size > 1024 * 1024
            ? (book.size / (1024 * 1024)).toFixed(1) + ' MB'
            : book.size > 1024
              ? Math.round(book.size / 1024) + ' KB'
              : book.size + ' B';
          const div = document.createElement('div');
          div.className = 'classics-book-item';
          div.dataset.bookId = book.id;
          div.dataset.bookName = book.name;
          div.dataset.category = categoryId;
          div.innerHTML = `
            <span class="classics-book-icon">📜</span>
            <div class="classics-book-info">
              <span class="classics-book-name">${Utils.escapeHtml(book.name)}</span>
              <span class="classics-book-size">${sizeStr}</span>
            </div>
            <button class="classics-book-read-btn">阅读</button>
          `;
          div.addEventListener('click', () => {
            div.classList.add('is-loading');
            Classics.openReader(book.id, book.name, categoryId);
          });
          list.appendChild(div);
        });

        // 更新或移除加载更多按钮
        if (end >= allBooks.length) {
          loadMoreEl.remove();
        } else {
          loadMoreEl.dataset.page = page + 1;
          loadMoreEl.querySelector('.classics-load-more-btn').textContent =
            '加载更多 (' + (allBooks.length - end) + ' 部)';
        }
      });
    }
  },

  /**
   * 渲染骨架屏（数据加载前的占位）
   */
  _renderSkeleton(categoryId) {
    return `
      <div class="page-container animate-fade-in">
        <div class="classics-skeleton">
          <div class="classics-skeleton-breadcrumb">
            <span class="classics-skeleton-crumb" style="width:40px"></span>
            <span class="classics-skeleton-crumb" style="width:30px"></span>
            <span class="classics-skeleton-crumb" style="width:${Math.min(categoryId.length * 14, 80)}px"></span>
          </div>
          <div class="classics-skeleton-header">
            <div class="classics-skeleton-title"></div>
            <div class="classics-skeleton-subtitle"></div>
          </div>
          <div class="classics-skeleton-grid">
            <div class="classics-skeleton-card"></div>
            <div class="classics-skeleton-card"></div>
            <div class="classics-skeleton-card"></div>
            <div class="classics-skeleton-card"></div>
            <div class="classics-skeleton-card"></div>
            <div class="classics-skeleton-card"></div>
          </div>
          <div class="classics-skeleton-list">
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
            <div class="classics-skeleton-row"></div>
          </div>
        </div>
      </div>
    `;
  },

  // ============ 搜索功能 ============

  /**
   * 绑定搜索事件
   */
  _bindSearchEvents(container) {
    const input = container.querySelector('#classicsSearchInput');
    const clearBtn = container.querySelector('#classicsSearchClear');
    const spinner = container.querySelector('#classicsSearchSpinner');
    const resultsPanel = container.querySelector('#classicsSearchResults');
    if (!input) return;

    let debounceTimer = null;
    let currentQuery = '';

    // 输入事件（防抖 300ms）
    input.addEventListener('input', () => {
      const query = input.value.trim();
      clearBtn.style.display = query ? '' : 'none';

      clearTimeout(debounceTimer);
      if (query.length < 2) {
        resultsPanel.style.display = 'none';
        spinner.style.display = 'none';
        currentQuery = '';
        return;
      }

      currentQuery = query;
      spinner.style.display = '';
      debounceTimer = setTimeout(async () => {
        if (input.value.trim() !== currentQuery) return;
        try {
          const data = await Classics.search(currentQuery);
          if (input.value.trim() !== currentQuery) return;
          this._renderSearchResults(resultsPanel, data.results, data.total, currentQuery);
          resultsPanel.style.display = '';
        } catch (e) {
          resultsPanel.innerHTML = '<div class="classics-search-empty">搜索失败，请重试</div>';
          resultsPanel.style.display = '';
        }
        spinner.style.display = 'none';
      }, 300);
    });

    // 清除按钮
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsPanel.style.display = 'none';
      spinner.style.display = 'none';
      currentQuery = '';
      input.focus();
    });

    // 焦点恢复面板
    input.addEventListener('focus', () => {
      if (currentQuery && resultsPanel.innerHTML) {
        resultsPanel.style.display = '';
      }
    });

    // ESC 关闭面板
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        resultsPanel.style.display = 'none';
        input.blur();
      }
    });

    // 点击外部关闭面板
    document.addEventListener('click', (e) => {
      const wrapper = container.querySelector('.classics-search-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        resultsPanel.style.display = 'none';
      }
    });
  },

  /**
   * 渲染搜索结果
   */
  _renderSearchResults(panel, results, total, query) {
    if (!results || results.length === 0) {
      panel.innerHTML = '<div class="classics-search-empty">未找到与 "' + Utils.escapeHtml(query) + '" 相关的古籍</div>';
      return;
    }

    const itemsHtml = results.map(item => {
      const nameHtml = this._highlightText(item.name, query);
      const pathText = item.dir ? item.category + ' / ' + item.dir : item.category;
      return `
        <div class="classics-search-item" data-id="${Utils.escapeHtml(item.id)}" data-name="${Utils.escapeHtml(item.name)}" data-category="${Utils.escapeHtml(item.category)}">
          <span class="classics-search-item-icon">📜</span>
          <div class="classics-search-item-info">
            <span class="classics-search-item-name">${nameHtml}</span>
            <span class="classics-search-item-path">${Utils.escapeHtml(pathText)}</span>
          </div>
        </div>
      `;
    }).join('');

    const moreHtml = total > results.length
      ? `<div class="classics-search-more">共 ${total} 条结果，已显示前 ${results.length} 条</div>`
      : '';

    panel.innerHTML = itemsHtml + moreHtml;

    // 绑定结果项点击
    panel.querySelectorAll('.classics-search-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const name = item.dataset.name;
        const cat = item.dataset.category;
        if (id) Classics.openReader(id, name, cat);
      });
    });
  },

  /**
   * 高亮搜索关键词
   */
  _highlightText(text, query) {
    const escaped = Utils.escapeHtml(text);
    const queryEscaped = Utils.escapeHtml(query);
    const regex = new RegExp('(' + queryEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(regex, '<mark class="classics-search-highlight">$1</mark>');
  }
};

// 导出到全局
window.ClassicsRenderer = ClassicsRenderer;
