/**
 * classics-styles.js - 古籍模块样式
 * 观己 - 静观己心，内外澄明
 */

Classics.addStyles = function() {
  if (document.getElementById('classics-styles')) return;
  const style = document.createElement('style');
  style.id = 'classics-styles';
  style.textContent = `
    /* ============ 分类列表页 ============ */
    .classics-page {
      max-width: 960px;
      margin: 0 auto;
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .classics-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .classics-header-icon {
      font-size: 2.5rem;
      margin-bottom: var(--spacing-sm);
    }

    .classics-header-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
    }

    .classics-header-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .classics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--spacing-md);
    }

    .classics-category-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .classics-category-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }

    .classics-category-icon {
      font-size: 2rem;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      border-radius: var(--radius-md);
    }

    .classics-category-body {
      flex: 1;
      min-width: 0;
    }

    .classics-category-name {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 2px;
    }

    .classics-category-desc {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      margin: 0 0 4px;
    }

    .classics-category-count {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      font-weight: 500;
    }

    /* ============ 浏览页 ============ */
    .classics-browse-page {
      max-width: 960px;
      margin: 0 auto;
      padding: var(--spacing-md);
    }

    .classics-breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) 0;
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .classics-breadcrumb-link {
      color: var(--color-primary);
      text-decoration: none;
    }

    .classics-breadcrumb-link:hover {
      text-decoration: underline;
    }

    .classics-breadcrumb-sep {
      color: var(--text-tertiary);
    }

    .classics-breadcrumb-current {
      color: var(--text-primary);
      font-weight: 500;
    }

    .classics-browse-header {
      margin-bottom: var(--spacing-lg);
    }

    .classics-browse-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
    }

    .classics-browse-stats {
      font-size: var(--font-size-sm);
      color: var(--text-tertiary);
    }

    .classics-section-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
      padding-bottom: var(--spacing-xs);
      border-bottom: 1px solid var(--border-color-light);
    }

    /* 子目录网格 */
    .classics-dirs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }

    .classics-dir-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .classics-dir-card:hover {
      background: var(--bg-tertiary);
      border-color: var(--color-primary);
    }

    .classics-dir-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .classics-dir-name {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .classics-dir-count {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      flex-shrink: 0;
    }

    /* 书籍列表 */
    .classics-book-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .classics-book-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .classics-book-item:hover {
      background: var(--bg-tertiary);
      border-color: var(--color-primary);
    }

    .classics-book-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .classics-book-info {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .classics-book-name {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .classics-book-size {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      flex-shrink: 0;
    }

    .classics-book-read-btn {
      flex-shrink: 0;
      padding: 4px 12px;
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      background: transparent;
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .classics-book-read-btn:hover {
      background: var(--color-primary);
      color: white;
    }

    /* 加载更多 */
    .classics-load-more {
      text-align: center;
      padding: var(--spacing-md) 0;
    }

    .classics-load-more-btn {
      padding: var(--spacing-sm) var(--spacing-xl);
      font-size: var(--font-size-sm);
      color: var(--color-primary);
      background: var(--bg-secondary);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .classics-load-more-btn:hover {
      background: var(--color-primary);
      color: white;
    }

    /* 空状态 */
    .classics-empty {
      text-align: center;
      padding: var(--spacing-xxl) var(--spacing-md);
    }

    .classics-empty-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .classics-empty-text {
      font-size: var(--font-size-md);
      color: var(--text-tertiary);
    }

    /* ============ 移动端适配 ============ */
    @media (max-width: 768px) {
      .classics-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--spacing-sm);
      }

      .classics-category-card {
        padding: var(--spacing-md);
      }

      .classics-category-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
      }

      .classics-dirs-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .classics-grid {
        grid-template-columns: 1fr;
      }

      .classics-dirs-grid {
        grid-template-columns: 1fr;
      }

      .classics-book-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
    }
  `;
  document.head.appendChild(style);
};
