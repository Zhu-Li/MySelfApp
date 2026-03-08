/**
 * novel-renderer.js - 小说三视图渲染器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：书架视图、章节列表视图、沉浸式阅读器视图
 */

const NovelRenderer = {

  // ============ 书架视图 ============

  /**
   * 渲染书架（书籍列表）
   */
  async renderBookList(container) {
    const books = Novel.getBooks();
    const progressList = await Novel.getAllProgress();
    const progressMap = {};
    progressList.forEach(p => { progressMap[p.id] = p; });

    const cardsHtml = books.length > 0
      ? `<div class="novel-shelf">${books.map(book => this.renderBookCard(book, progressMap[book.id])).join('')}</div>`
      : `<div class="novel-empty">
           <div class="novel-empty-icon">📚</div>
           <p class="novel-empty-text">书架空空如也，敬请期待</p>
         </div>`;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="novel-page">
          <div class="novel-header">
            <div class="novel-header-icon">📖</div>
            <h1 class="novel-header-title">小说书架</h1>
            <p class="novel-header-desc">沉浸式阅读，享受文字之美</p>
          </div>
          ${cardsHtml}
        </div>
      </div>
    `;

    // 绑定事件
    container.querySelectorAll('.novel-book-card').forEach(card => {
      card.addEventListener('click', () => {
        const bookId = card.dataset.bookId;
        if (bookId) window.location.hash = `#/novel/${bookId}`;
      });
    });
  },

  /**
   * 渲染书籍卡片
   */
  renderBookCard(book, progress) {
    let progressText = '';
    if (progress) {
      const ch = book.chapters.find(c => c.id === progress.chapterId);
      if (ch) {
        progressText = `<span class="novel-book-progress">读到 第${ch.number}章</span>`;
      }
    }

    return `
      <div class="novel-book-card" data-book-id="${Utils.escapeHtml(book.id)}">
        <div class="novel-book-cover">
          <span class="novel-book-cover-icon">📖</span>
        </div>
        <div class="novel-book-body">
          <h3 class="novel-book-name">${Utils.escapeHtml(book.name)}</h3>
          <div class="novel-book-meta">
            <span class="novel-book-chapters">${book.totalChapters} 章</span>
            ${progressText}
          </div>
          <button class="novel-book-action">${progress ? '继续阅读' : '开始阅读'}</button>
        </div>
      </div>
    `;
  },

  // ============ 章节列表视图 ============

  /** 排序状态：true=正序 false=倒序 */
  _sortAsc: true,

  /**
   * 渲染章节列表
   */
  async renderChapterList(container, book) {
    const progress = await Novel.getProgress(book.id);
    const currentChapterId = progress ? progress.chapterId : null;

    const chapters = this._sortAsc ? [...book.chapters] : [...book.chapters].reverse();

    // 找到当前阅读章节的序号，用于标记已读
    const currentChapterNum = currentChapterId
      ? (book.chapters.find(c => c.id === currentChapterId) || {}).number || 0
      : 0;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="novel-chapters-page">
          <div class="novel-chapters-header">
            <button class="novel-back-btn" id="novelBackToShelf">
              <span>←</span>
              <span>书架</span>
            </button>
            <div class="novel-chapters-info">
              <h1 class="novel-chapters-title">${Utils.escapeHtml(book.name)}</h1>
              <p class="novel-chapters-count">共 ${book.totalChapters} 章</p>
            </div>
          </div>

          <div class="novel-sort-bar">
            <span class="novel-sort-label">章节目录</span>
            <button class="novel-sort-btn" id="novelSortBtn">
              <span>${this._sortAsc ? '正序' : '倒序'}</span>
              <span>${this._sortAsc ? '↓' : '↑'}</span>
            </button>
          </div>

          <div class="novel-chapter-list">
            ${chapters.map(ch => {
              const isCurrent = ch.id === currentChapterId;
              const isRead = currentChapterNum > 0 && ch.number < currentChapterNum;
              const cls = isCurrent ? ' read' : (isRead ? ' read' : '');
              return `
                <div class="novel-chapter-item${cls}" data-book-id="${book.id}" data-chapter-id="${ch.id}">
                  <span class="novel-chapter-num">${ch.number}</span>
                  <span class="novel-chapter-title">${Utils.escapeHtml(ch.title)}</span>
                  ${isCurrent ? '<span class="novel-chapter-reading">在读</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // 绑定返回按钮
    document.getElementById('novelBackToShelf').addEventListener('click', () => {
      window.location.hash = '#/novel';
    });

    // 绑定排序按钮
    document.getElementById('novelSortBtn').addEventListener('click', () => {
      this._sortAsc = !this._sortAsc;
      this.renderChapterList(container, book);
    });

    // 绑定章节点击
    container.querySelectorAll('.novel-chapter-item').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.bookId;
        const chapterId = item.dataset.chapterId;
        Novel.openReader(bookId, chapterId);
      });
    });
  },

  // ============ 沉浸式阅读器 ============

  /** 阅读器元素引用 */
  _readerEl: null,
  _settingsVisible: false,

  /**
   * 打开阅读器（覆盖全屏）
   */
  async openReader(book, chapter) {
    // 隐藏导航
    this._hideNav();

    // 创建阅读器容器
    const reader = document.createElement('div');
    reader.className = 'novel-reader';
    reader.dataset.theme = Novel.settings.theme;
    this._readerEl = reader;

    const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id);

    reader.innerHTML = `
      <div class="novel-reader-topbar" id="readerTopbar">
        <button class="novel-reader-back" id="readerBackBtn">
          <span>←</span>
          <span>返回</span>
        </button>
        <h2 class="novel-reader-chapter-title" id="readerChapterTitle">第${chapter.number}章 ${Utils.escapeHtml(chapter.title)}</h2>
        <button class="novel-reader-menu-btn" id="readerMenuBtn" title="设置">⚙</button>
      </div>
      <div class="novel-reader-content font-${Novel.settings.fontSize}" id="readerContent">
        <div class="novel-reader-content-inner" id="readerContentInner">
          <div class="novel-reader-loading">加载中...</div>
        </div>
      </div>
      <div class="novel-reader-bottombar" id="readerBottombar">
        <button class="novel-reader-nav-btn" id="readerPrevBtn" ${chapterIndex <= 0 ? 'disabled' : ''}>
          <span>←</span>
          <span>上一章</span>
        </button>
        <div class="novel-reader-bottom-center">
          <span class="novel-reader-progress" id="readerProgress">${chapterIndex + 1} / ${book.totalChapters}</span>
          ${NovelTTS.supported ? '<button class="novel-reader-tts-btn" id="readerTtsBtn"><span>🔊</span><span>朗读</span></button>' : ''}
        </div>
        <button class="novel-reader-nav-btn" id="readerNextBtn" ${chapterIndex >= book.totalChapters - 1 ? 'disabled' : ''}>
          <span>下一章</span>
          <span>→</span>
        </button>
      </div>
      <div class="novel-reader-settings-overlay" id="readerSettingsOverlay"></div>
      <div class="novel-reader-settings" id="readerSettings">
        <div class="novel-settings-group">
          <div class="novel-settings-label">字体大小</div>
          <div class="novel-settings-options">
            <button class="novel-settings-option${Novel.settings.fontSize === 'small' ? ' active' : ''}" data-font="small">小</button>
            <button class="novel-settings-option${Novel.settings.fontSize === 'medium' ? ' active' : ''}" data-font="medium">中</button>
            <button class="novel-settings-option${Novel.settings.fontSize === 'large' ? ' active' : ''}" data-font="large">大</button>
          </div>
        </div>
        <div class="novel-settings-group">
          <div class="novel-settings-label">背景主题</div>
          <div class="novel-settings-options">
            <button class="novel-settings-option${Novel.settings.theme === 'light' ? ' active' : ''}" data-theme="light">
              <span class="novel-theme-preview novel-theme-preview-light"></span>明亮
            </button>
            <button class="novel-settings-option${Novel.settings.theme === 'dark' ? ' active' : ''}" data-theme="dark">
              <span class="novel-theme-preview novel-theme-preview-dark"></span>暗黑
            </button>
            <button class="novel-settings-option${Novel.settings.theme === 'eye' ? ' active' : ''}" data-theme="eye">
              <span class="novel-theme-preview novel-theme-preview-eye"></span>护眼
            </button>
          </div>
        </div>
        ${NovelTTS.supported ? `
        <div class="novel-settings-group">
          <div class="novel-settings-label">语音朗读</div>
          <div class="novel-tts-settings">
            <div class="novel-tts-setting-row">
              <span class="novel-tts-setting-name">语速</span>
              <input type="range" class="novel-tts-slider" id="ttsRateSlider"
                min="0.5" max="2.0" step="0.1" value="${(Novel.settings.tts && Novel.settings.tts.rate) || 1.0}">
              <span class="novel-tts-setting-value" id="ttsRateValue">${(Novel.settings.tts && Novel.settings.tts.rate) || 1.0}x</span>
            </div>
            <div class="novel-tts-setting-row">
              <span class="novel-tts-setting-name">语音</span>
              <select class="novel-tts-voice-select" id="ttsVoiceSelect"></select>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(reader);

    // 绑定事件
    this._bindReaderEvents(book, chapter, chapterIndex);

    // 加载内容
    await this._loadChapterContent(book, chapter);

    // 保存进度
    await Novel.saveProgress(book.id, chapter.id, 0);
  },

  /**
   * 关闭阅读器
   */
  closeReader() {
    NovelTTS.stop();
    if (this._readerEl) {
      this._readerEl.remove();
      this._readerEl = null;
    }
    this._settingsVisible = false;
    this._showNav();
  },

  /**
   * 绑定阅读器事件
   */
  _bindReaderEvents(book, chapter, chapterIndex) {
    const reader = this._readerEl;
    if (!reader) return;

    // 返回按钮
    reader.querySelector('#readerBackBtn').addEventListener('click', () => {
      Novel.closeReader();
    });

    // 设置按钮
    reader.querySelector('#readerMenuBtn').addEventListener('click', () => {
      this._toggleSettings();
    });

    // 设置遮罩
    reader.querySelector('#readerSettingsOverlay').addEventListener('click', () => {
      this._toggleSettings(false);
    });

    // 上一章
    reader.querySelector('#readerPrevBtn').addEventListener('click', () => {
      if (chapterIndex > 0) {
        this._switchChapter(book, book.chapters[chapterIndex - 1]);
      }
    });

    // 下一章
    reader.querySelector('#readerNextBtn').addEventListener('click', () => {
      if (chapterIndex < book.totalChapters - 1) {
        this._switchChapter(book, book.chapters[chapterIndex + 1]);
      }
    });

    // 字体大小选择
    reader.querySelectorAll('[data-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.font;
        Novel.settings.fontSize = size;
        Novel.saveSettings();

        // 更新内容区class
        const content = reader.querySelector('#readerContent');
        content.className = `novel-reader-content font-${size}`;

        // 更新按钮active
        reader.querySelectorAll('[data-font]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 主题选择
    reader.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        Novel.settings.theme = theme;
        Novel.saveSettings();

        // 更新阅读器主题
        reader.dataset.theme = theme;

        // 更新按钮active
        reader.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 阅读内容区滚动 → 保存进度
    let scrollTimer = null;
    const contentEl = reader.querySelector('#readerContent');
    contentEl.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollTop = contentEl.scrollTop;
        const scrollHeight = contentEl.scrollHeight - contentEl.clientHeight;
        const percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
        Novel.saveProgress(book.id, chapter.id, percent);
      }, 500);
    });

    // 点击内容区域切换顶栏/底栏显示
    contentEl.addEventListener('click', (e) => {
      // 避免点击链接等触发
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      const topbar = reader.querySelector('#readerTopbar');
      const bottombar = reader.querySelector('#readerBottombar');
      topbar.classList.toggle('hidden');
      bottombar.classList.toggle('hidden');
    });

    // TTS 朗读按钮
    const ttsBtn = reader.querySelector('#readerTtsBtn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        NovelTTS.toggle();
      });
    }

    // TTS 语速滑块
    const rateSlider = reader.querySelector('#ttsRateSlider');
    if (rateSlider) {
      rateSlider.addEventListener('input', () => {
        const rate = parseFloat(rateSlider.value);
        if (!Novel.settings.tts) Novel.settings.tts = {};
        Novel.settings.tts.rate = rate;
        reader.querySelector('#ttsRateValue').textContent = rate.toFixed(1) + 'x';
        Novel.saveSettings();
      });
    }

    // TTS 语音选择下拉
    const voiceSelect = reader.querySelector('#ttsVoiceSelect');
    if (voiceSelect) {
      this._populateVoiceSelect(voiceSelect);
      voiceSelect.addEventListener('change', () => {
        if (!Novel.settings.tts) Novel.settings.tts = {};
        Novel.settings.tts.voiceURI = voiceSelect.value;
        Novel.saveSettings();
      });
    }
  },

  /**
   * 填充语音选择下拉框
   */
  _populateVoiceSelect(select) {
    select.innerHTML = '';
    const voices = NovelTTS.chineseVoices.length > 0 ? NovelTTS.chineseVoices : NovelTTS.voices.slice(0, 10);
    const savedURI = Novel.settings.tts && Novel.settings.tts.voiceURI;

    if (voices.length === 0) {
      select.innerHTML = '<option value="">加载中...</option>';
      // 语音可能异步加载，延迟重试
      setTimeout(() => this._populateVoiceSelect(select), 500);
      return;
    }

    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = v.name + (v.lang ? ` (${v.lang})` : '');
      if (savedURI && v.voiceURI === savedURI) opt.selected = true;
      select.appendChild(opt);
    });
  },

  /**
   * 加载章节内容到阅读器
   */
  async _loadChapterContent(book, chapter) {
    const inner = this._readerEl.querySelector('#readerContentInner');
    inner.innerHTML = '<div class="novel-reader-loading">加载中...</div>';

    try {
      const text = await Novel.fetchChapter(book, chapter);
      // 分段渲染
      const paragraphs = text.split(/\r?\n/).filter(line => line.trim());
      const heading = `<p class="chapter-heading">第${chapter.number}章 ${Utils.escapeHtml(chapter.title)}</p>`;
      const bodyHtml = paragraphs.map(p => `<p>${Utils.escapeHtml(p.trim())}</p>`).join('');
      inner.innerHTML = heading + bodyHtml;

      // 滚动到顶部
      this._readerEl.querySelector('#readerContent').scrollTop = 0;
    } catch (err) {
      inner.innerHTML = `
        <div class="novel-reader-error">
          <div class="novel-reader-error-icon">📡</div>
          <p class="novel-reader-error-text">${Utils.escapeHtml(err.message)}</p>
          <button class="novel-reader-retry-btn" id="readerRetryBtn">重新加载</button>
        </div>
      `;
      inner.querySelector('#readerRetryBtn').addEventListener('click', () => {
        this._loadChapterContent(book, chapter);
      });
    }
  },

  /**
   * 切换章节
   */
  async _switchChapter(book, chapter) {
    const reader = this._readerEl;
    if (!reader) return;

    // 停止当前朗读
    NovelTTS.stop();

    const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id);

    // 更新标题
    reader.querySelector('#readerChapterTitle').textContent = `第${chapter.number}章 ${Utils.escapeHtml(chapter.title)}`;

    // 更新按钮状态
    const prevBtn = reader.querySelector('#readerPrevBtn');
    const nextBtn = reader.querySelector('#readerNextBtn');
    prevBtn.disabled = chapterIndex <= 0;
    nextBtn.disabled = chapterIndex >= book.totalChapters - 1;

    // 更新进度文字
    reader.querySelector('#readerProgress').textContent = `${chapterIndex + 1} / ${book.totalChapters}`;

    // 重新绑定上下章事件
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.replaceWith(newPrev);
    nextBtn.replaceWith(newNext);

    newPrev.addEventListener('click', () => {
      if (chapterIndex > 0) this._switchChapter(book, book.chapters[chapterIndex - 1]);
    });
    newNext.addEventListener('click', () => {
      if (chapterIndex < book.totalChapters - 1) this._switchChapter(book, book.chapters[chapterIndex + 1]);
    });

    // 重新绑定滚动进度保存
    const contentEl = reader.querySelector('#readerContent');
    let scrollTimer = null;
    // 移除旧的监听器（通过克隆）
    const newContent = contentEl.cloneNode(false);
    while (contentEl.firstChild) {
      newContent.appendChild(contentEl.firstChild);
    }
    contentEl.replaceWith(newContent);

    newContent.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollTop = newContent.scrollTop;
        const scrollHeight = newContent.scrollHeight - newContent.clientHeight;
        const percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
        Novel.saveProgress(book.id, chapter.id, percent);
      }, 500);
    });

    newContent.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      const topbar = reader.querySelector('#readerTopbar');
      const bottombar = reader.querySelector('#readerBottombar');
      topbar.classList.toggle('hidden');
      bottombar.classList.toggle('hidden');
    });

    // 加载新章节
    this._readerEl = reader; // 确保引用正确
    await this._loadChapterContent(book, chapter);

    // 保存进度
    await Novel.saveProgress(book.id, chapter.id, 0);
  },

  /**
   * 切换设置面板
   */
  _toggleSettings(show) {
    const reader = this._readerEl;
    if (!reader) return;

    const panel = reader.querySelector('#readerSettings');
    const overlay = reader.querySelector('#readerSettingsOverlay');

    if (show === undefined) show = !this._settingsVisible;
    this._settingsVisible = show;

    if (show) {
      panel.classList.add('visible');
      overlay.classList.add('visible');
    } else {
      panel.classList.remove('visible');
      overlay.classList.remove('visible');
    }
  },

  /**
   * 隐藏全局导航
   */
  _hideNav() {
    const header = document.querySelector('.header');
    const bottomNav = document.querySelector('.bottom-nav');
    const appContainer = document.querySelector('.app-container');
    if (header) header.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
    if (appContainer) appContainer.style.paddingTop = '0';
  },

  /**
   * 恢复全局导航
   */
  _showNav() {
    const header = document.querySelector('.header');
    const bottomNav = document.querySelector('.bottom-nav');
    const appContainer = document.querySelector('.app-container');
    if (header) header.style.display = '';
    if (bottomNav) bottomNav.style.display = '';
    if (appContainer) appContainer.style.paddingTop = '';
  }
};

// 导出到全局
window.NovelRenderer = NovelRenderer;
