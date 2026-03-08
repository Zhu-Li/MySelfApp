/**
 * novel-styles.js - 小说模块样式
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：小说书架、章节列表、阅读器的所有CSS样式
 */

/**
 * 添加小说模块样式
 */
Novel.addStyles = function() {
  if (document.getElementById('novel-styles')) return;

  const style = document.createElement('style');
  style.id = 'novel-styles';
  style.textContent = `
    /* ========== 书架页 ========== */
    .novel-page {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--spacing-md) 0;
    }

    .novel-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .novel-header-icon {
      font-size: 3.5rem;
      margin-bottom: var(--spacing-sm);
      display: inline-block;
    }

    .novel-header-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
    }

    .novel-header-desc {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      margin: 0;
    }

    /* 书架网格 */
    .novel-shelf {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--spacing-lg);
    }

    /* 书籍卡片 */
    .novel-book-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }

    .novel-book-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .novel-book-cover {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b);
      position: relative;
      overflow: hidden;
    }

    .novel-book-cover::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.12) 0%, transparent 60%);
    }

    .novel-book-cover-icon {
      font-size: 4rem;
      z-index: 1;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    .novel-book-body {
      padding: var(--spacing-md);
    }

    .novel-book-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm);
    }

    .novel-book-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .novel-book-chapters {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .novel-book-progress {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      background: var(--bg-tertiary);
      padding: 2px var(--spacing-sm);
      border-radius: var(--radius-full);
    }

    .novel-book-action {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-primary);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .novel-book-action:hover {
      background: var(--color-primary-hover);
    }

    /* 空状态 */
    .novel-empty {
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .novel-empty-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    .novel-empty-text {
      color: var(--text-secondary);
      font-size: var(--font-size-base);
    }

    /* ========== 章节列表页 ========== */
    .novel-chapters-page {
      max-width: 700px;
      margin: 0 auto;
      padding: var(--spacing-md) 0;
    }

    .novel-chapters-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--border-color);
    }

    .novel-back-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
      flex-shrink: 0;
    }

    .novel-back-btn:hover {
      background: var(--bg-tertiary);
    }

    .novel-chapters-info {
      flex: 1;
      min-width: 0;
    }

    .novel-chapters-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .novel-chapters-count {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    /* 章节排序 */
    .novel-sort-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }

    .novel-sort-label {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .novel-sort-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-tertiary);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .novel-sort-btn:hover {
      background: var(--border-color);
    }

    /* 章节列表 */
    .novel-chapter-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .novel-chapter-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      gap: var(--spacing-md);
    }

    .novel-chapter-item:hover {
      background: var(--bg-tertiary);
      transform: translateX(4px);
    }

    .novel-chapter-num {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
      min-width: 36px;
      text-align: center;
      font-weight: 500;
    }

    .novel-chapter-title {
      flex: 1;
      font-size: var(--font-size-base);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .novel-chapter-item.read .novel-chapter-title {
      color: var(--text-tertiary);
    }

    .novel-chapter-reading {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      background: var(--bg-tertiary);
      padding: 2px var(--spacing-sm);
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    /* ========== 阅读器 ========== */
    .novel-reader {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: flex;
      flex-direction: column;
      transition: background-color 0.3s ease;
    }

    /* 阅读器主题 */
    .novel-reader[data-theme="light"] {
      background-color: #ffffff;
      color: #333333;
    }

    .novel-reader[data-theme="dark"] {
      background-color: #1a1a2e;
      color: #d4d4d8;
    }

    .novel-reader[data-theme="eye"] {
      background-color: #c7edcc;
      color: #333333;
    }

    /* 阅读器顶栏 */
    .novel-reader-topbar {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 var(--spacing-md);
      border-bottom: 1px solid rgba(128,128,128,0.2);
      flex-shrink: 0;
      transition: opacity 0.3s ease;
    }

    .novel-reader-topbar.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .novel-reader-back {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: none;
      border: none;
      color: inherit;
      font-size: var(--font-size-sm);
      cursor: pointer;
      border-radius: var(--radius-md);
      opacity: 0.8;
    }

    .novel-reader-back:hover {
      opacity: 1;
      background: rgba(128,128,128,0.1);
    }

    .novel-reader-chapter-title {
      flex: 1;
      text-align: center;
      font-size: var(--font-size-base);
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 var(--spacing-md);
    }

    .novel-reader-menu-btn {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      border-radius: var(--radius-md);
      opacity: 0.8;
    }

    .novel-reader-menu-btn:hover {
      opacity: 1;
      background: rgba(128,128,128,0.1);
    }

    /* 阅读器内容区 */
    .novel-reader-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xl) var(--spacing-lg);
      line-height: 1.9;
      -webkit-overflow-scrolling: touch;
    }

    .novel-reader-content-inner {
      max-width: 700px;
      margin: 0 auto;
    }

    .novel-reader-content p {
      text-indent: 2em;
      margin: 0 0 var(--spacing-md);
    }

    .novel-reader-content .chapter-heading {
      text-indent: 0;
      text-align: center;
      font-size: 1.3em;
      font-weight: 700;
      margin: 0 0 var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid rgba(128,128,128,0.15);
    }

    /* 字体大小 */
    .novel-reader-content.font-small {
      font-size: 14px;
    }

    .novel-reader-content.font-medium {
      font-size: 17px;
    }

    .novel-reader-content.font-large {
      font-size: 20px;
    }

    /* 加载状态 */
    .novel-reader-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      opacity: 0.6;
      font-size: var(--font-size-base);
    }

    .novel-reader-error {
      text-align: center;
      padding: var(--spacing-3xl);
    }

    .novel-reader-error-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    .novel-reader-error-text {
      opacity: 0.7;
      margin-bottom: var(--spacing-lg);
    }

    .novel-reader-retry-btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      background: rgba(128,128,128,0.15);
      border: none;
      border-radius: var(--radius-md);
      color: inherit;
      font-size: var(--font-size-sm);
      cursor: pointer;
    }

    .novel-reader-retry-btn:hover {
      background: rgba(128,128,128,0.25);
    }

    /* 底部导航 */
    .novel-reader-bottombar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-top: 1px solid rgba(128,128,128,0.2);
      flex-shrink: 0;
      transition: opacity 0.3s ease;
    }

    .novel-reader-bottombar.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .novel-reader-nav-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: rgba(128,128,128,0.1);
      border: none;
      border-radius: var(--radius-md);
      color: inherit;
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: background 0.2s;
    }

    .novel-reader-nav-btn:hover {
      background: rgba(128,128,128,0.2);
    }

    .novel-reader-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .novel-reader-progress {
      font-size: var(--font-size-xs);
      opacity: 0.6;
    }

    /* 设置面板 */
    .novel-reader-settings {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      padding: var(--spacing-lg);
      z-index: 210;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }

    .novel-reader-settings.visible {
      transform: translateY(0);
    }

    .novel-reader-settings-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 205;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .novel-reader-settings-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .novel-settings-group {
      margin-bottom: var(--spacing-lg);
    }

    .novel-settings-group:last-child {
      margin-bottom: 0;
    }

    .novel-settings-label {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .novel-settings-options {
      display: flex;
      gap: var(--spacing-sm);
    }

    .novel-settings-option {
      flex: 1;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .novel-settings-option:hover {
      border-color: var(--color-primary);
    }

    .novel-settings-option.active {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: var(--text-inverse);
    }

    /* 主题预览色块 */
    .novel-theme-preview {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-sm);
      margin-right: var(--spacing-xs);
      vertical-align: middle;
      border: 1px solid rgba(128,128,128,0.3);
    }

    .novel-theme-preview-light {
      background: #ffffff;
    }

    .novel-theme-preview-dark {
      background: #1a1a2e;
    }

    .novel-theme-preview-eye {
      background: #c7edcc;
    }

    /* ========== TTS 朗读 ========== */

    /* 底栏中间区域 */
    .novel-reader-bottom-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    /* 朗读按钮 */
    .novel-reader-tts-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: rgba(99, 102, 241, 0.15);
      border: 1.5px solid rgba(99, 102, 241, 0.4);
      border-radius: var(--radius-full);
      color: inherit;
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .novel-reader-tts-btn:hover {
      background: rgba(99, 102, 241, 0.25);
      border-color: rgba(99, 102, 241, 0.6);
    }

    .novel-reader-tts-btn.tts-playing {
      background: rgba(99, 102, 241, 0.25);
      border-color: rgba(99, 102, 241, 0.6);
    }

    .novel-reader-tts-btn.tts-paused {
      background: rgba(234, 179, 8, 0.2);
      border-color: rgba(234, 179, 8, 0.5);
    }

    /* 当前朗读段落高亮 */
    .novel-reader-content p.tts-active {
      background-color: rgba(99, 102, 241, 0.1);
      border-left: 3px solid rgba(99, 102, 241, 0.6);
      padding-left: calc(2em - 3px);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      transition: background-color 0.3s ease, border-left 0.3s ease;
    }

    .novel-reader[data-theme="dark"] p.tts-active {
      background-color: rgba(99, 102, 241, 0.2);
      border-left-color: rgba(129, 140, 248, 0.7);
    }

    .novel-reader[data-theme="eye"] p.tts-active {
      background-color: rgba(22, 163, 74, 0.12);
      border-left-color: rgba(22, 163, 74, 0.5);
    }

    /* TTS 激活时段落可点击跳转 */
    .novel-reader.tts-on .novel-reader-content p:not(.chapter-heading) {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .novel-reader.tts-on .novel-reader-content p:not(.chapter-heading):hover {
      background-color: rgba(99, 102, 241, 0.06);
    }
    .novel-reader.tts-on .novel-reader-content p.tts-active:hover {
      background-color: rgba(99, 102, 241, 0.15);
    }
    .novel-reader[data-theme="dark"].tts-on .novel-reader-content p:not(.chapter-heading):hover {
      background-color: rgba(99, 102, 241, 0.12);
    }
    .novel-reader[data-theme="eye"].tts-on .novel-reader-content p:not(.chapter-heading):hover {
      background-color: rgba(22, 163, 74, 0.08);
    }

    /* TTS 设置区域 */
    .novel-tts-settings {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .novel-tts-setting-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .novel-tts-setting-name {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      min-width: 36px;
      flex-shrink: 0;
    }

    .novel-tts-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: var(--border-color);
      border-radius: 2px;
      outline: none;
    }

    .novel-tts-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
    }

    .novel-tts-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-primary);
      border: none;
      cursor: pointer;
    }

    .novel-tts-setting-value {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      min-width: 36px;
      text-align: right;
    }

    .novel-tts-voice-select {
      flex: 1;
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: var(--font-size-xs);
      outline: none;
      min-width: 0;
    }

    .novel-tts-voice-select:focus {
      border-color: var(--color-primary);
    }

    /* TTS 不支持提示 */
    .novel-tts-tip {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 12px 24px;
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      z-index: 300;
      text-align: center;
      max-width: 280px;
      transition: opacity 0.4s ease;
    }

    /* ========== 移动端适配 ========== */
    @media (max-width: 768px) {
      .novel-shelf {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--spacing-md);
      }

      .novel-header-icon {
        font-size: 2.5rem;
      }

      .novel-header-title {
        font-size: var(--font-size-xl);
      }

      .novel-header-desc {
        font-size: var(--font-size-sm);
      }

      .novel-book-cover {
        height: 130px;
      }

      .novel-book-cover-icon {
        font-size: 3rem;
      }

      .novel-chapters-header {
        flex-wrap: wrap;
      }

      .novel-reader-content {
        padding: var(--spacing-lg) var(--spacing-md);
      }

      .novel-reader-content-inner {
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .novel-page {
        padding: var(--spacing-sm) 0;
      }

      .novel-shelf {
        grid-template-columns: 1fr;
      }

      .novel-header {
        margin-bottom: var(--spacing-lg);
      }

      .novel-header-icon {
        font-size: 2rem;
      }

      .novel-header-title {
        font-size: var(--font-size-lg);
      }

      .novel-book-cover {
        height: 110px;
      }

      .novel-book-cover-icon {
        font-size: 2.5rem;
      }

      .novel-book-body {
        padding: var(--spacing-sm);
      }

      .novel-chapters-page {
        padding: var(--spacing-sm) 0;
      }

      .novel-chapter-item {
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .novel-reader-content {
        padding: var(--spacing-md) var(--spacing-sm);
        line-height: 1.8;
      }

      .novel-reader-bottombar {
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .novel-reader-settings {
        padding: var(--spacing-md);
      }
    }
  `;
  document.head.appendChild(style);
};
