/**
 * book-styles.js - 书籍模块公共样式
 * 观己 - 静观己心，内外澄明
 */

Book.addStyles = function() {
  if (document.getElementById('book-styles')) return;
  const style = document.createElement('style');
  style.id = 'book-styles';
  style.textContent = `
    .book-page {
      max-width: 960px;
      margin: 0 auto;
    }

    /* 分段控制器容器 */
    .book-tabs {
      display: flex;
      justify-content: center;
      padding: var(--spacing-lg) var(--spacing-md) var(--spacing-sm);
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-primary);
    }

    .book-tabs-inner {
      display: flex;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: 3px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
      position: relative;
    }

    .book-tab-btn {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 28px;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-radius: calc(var(--radius-lg) - 2px);
      cursor: pointer;
      transition: color 0.25s ease;
      white-space: nowrap;
      min-width: 100px;
    }

    .book-tab-btn:hover {
      color: var(--text-primary);
    }

    .book-tab-btn.active {
      color: var(--color-primary);
      background: var(--bg-card);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
      font-weight: 600;
    }

    .book-tab-icon {
      font-size: 1.05rem;
      line-height: 1;
    }

    .book-tab-content {
      min-height: 300px;
    }

    .book-loading {
      text-align: center;
      padding: var(--spacing-xxl);
      color: var(--text-tertiary);
      font-size: var(--font-size-sm);
    }

    /* 移动端适配 */
    @media (max-width: 640px) {
      .book-tabs {
        padding: var(--spacing-md) var(--spacing-sm) var(--spacing-xs);
      }

      .book-tab-btn {
        padding: 7px 22px;
        font-size: var(--font-size-xs);
        min-width: 80px;
      }
    }
  `;
  document.head.appendChild(style);
};
