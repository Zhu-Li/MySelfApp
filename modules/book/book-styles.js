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

    .book-tabs {
      display: flex;
      justify-content: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-md) var(--spacing-md) 0;
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-primary);
    }

    .book-tab-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-xl);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color-light);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .book-tab-btn:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }

    .book-tab-btn.active {
      color: white;
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .book-tab-icon {
      font-size: 1rem;
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
        padding: var(--spacing-sm) var(--spacing-sm) 0;
      }

      .book-tab-btn {
        padding: var(--spacing-xs) var(--spacing-lg);
        font-size: var(--font-size-xs);
      }
    }
  `;
  document.head.appendChild(style);
};
