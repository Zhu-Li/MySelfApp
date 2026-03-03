/**
 * arcade-styles.js - 电玩城页面样式
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：电玩城页面的所有CSS样式
 */

/**
 * 添加电玩城页面样式
 */
Arcade.addStyles = function() {
  if (document.getElementById('arcade-styles')) return;

  const style = document.createElement('style');
  style.id = 'arcade-styles';
  style.textContent = `
    .arcade-page {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--spacing-md) 0;
    }

    /* 头部装饰区 */
    .arcade-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .arcade-header-icon {
      font-size: 3.5rem;
      margin-bottom: var(--spacing-sm);
      display: inline-block;
      animation: arcadeFloat 3s ease-in-out infinite;
    }

    @keyframes arcadeFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .arcade-header-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
    }

    .arcade-header-desc {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      margin: 0;
    }

    /* 游戏卡片网格 */
    .arcade-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }

    /* 游戏卡片 */
    .arcade-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }

    .arcade-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .arcade-card:active {
      transform: translateY(-2px);
    }

    .arcade-card-bg {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .arcade-card-bg::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%);
    }

    .arcade-card-icon {
      font-size: 4rem;
      z-index: 1;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }

    .arcade-card-body {
      padding: var(--spacing-md);
    }

    .arcade-card-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs);
    }

    .arcade-card-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-md);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .arcade-card-tags {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
    }

    .arcade-tag {
      padding: 2px var(--spacing-sm);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
    }

    .arcade-card-action {
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

    .arcade-card-action:hover {
      background: var(--color-primary-hover);
    }

    /* 游戏 iframe 视图 */
    .arcade-game-view {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px - 48px);
      margin: calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg));
    }

    .arcade-game-bar {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 var(--spacing-md);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .arcade-back-btn {
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
    }

    .arcade-back-btn:hover {
      background: var(--bg-tertiary);
    }

    .arcade-game-title {
      flex: 1;
      text-align: center;
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .arcade-fullscreen-btn {
      display: flex;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }

    .arcade-fullscreen-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .arcade-iframe-wrapper {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .arcade-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    .arcade-load-hint {
      position: absolute;
      bottom: var(--spacing-md);
      left: 50%;
      transform: translateX(-50%);
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      background: var(--bg-secondary);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      opacity: 0;
      transition: opacity var(--transition-normal);
      pointer-events: none;
    }

    .arcade-load-hint.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .arcade-load-hint a {
      color: var(--color-primary);
      cursor: pointer;
      text-decoration: none;
    }

    .arcade-load-hint a:hover {
      text-decoration: underline;
    }

    /* 空状态 */
    .arcade-empty {
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .arcade-empty-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    .arcade-empty-text {
      color: var(--text-secondary);
      font-size: var(--font-size-base);
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      .arcade-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .arcade-header-icon {
        font-size: 2.5rem;
      }

      .arcade-header-title {
        font-size: var(--font-size-xl);
      }

      .arcade-header-desc {
        font-size: var(--font-size-sm);
      }

      .arcade-card-bg {
        height: 120px;
      }

      .arcade-card-icon {
        font-size: 3rem;
      }

      .arcade-game-view {
        height: calc(100vh - 64px - 72px - 48px);
        margin: calc(-1 * var(--spacing-md)) calc(-1 * var(--spacing-md));
      }

      .arcade-fullscreen-btn {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .arcade-page {
        padding: var(--spacing-sm) 0;
      }

      .arcade-header {
        margin-bottom: var(--spacing-lg);
      }

      .arcade-header-icon {
        font-size: 2rem;
      }

      .arcade-header-title {
        font-size: var(--font-size-lg);
      }

      .arcade-card-bg {
        height: 100px;
      }

      .arcade-card-icon {
        font-size: 2.5rem;
      }

      .arcade-card-body {
        padding: var(--spacing-sm);
      }

      .arcade-card-name {
        font-size: var(--font-size-base);
      }

      .arcade-game-view {
        height: calc(100vh - 64px - 64px - 48px);
      }
    }
  `;
  document.head.appendChild(style);
};
