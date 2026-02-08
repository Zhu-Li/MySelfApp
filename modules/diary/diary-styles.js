/**
 * diary-styles.js - 日记页面样式
 * 观己 - 静观己心，内外澄明
 * 
 * 从 diary.js 拆分
 * 职责：日记模块的所有CSS样式
 */

/**
 * 添加日记页面样式
 */
Diary.addStyles = function() {
  if (document.getElementById('diary-styles')) return;

  const style = document.createElement('style');
  style.id = 'diary-styles';
  style.textContent = `
    .diary-month-group {
      margin-bottom: var(--spacing-xl);
    }

    .diary-month-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-sm);
      border-bottom: 1px solid var(--border-color);
    }

    .diary-card {
      cursor: pointer;
    }

    .diary-mood-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .diary-title {
      font-size: var(--font-size-base);
      line-height: 1.4;
    }

    .diary-image-indicator {
      margin-left: var(--spacing-xs);
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }

    .diary-preview {
      font-size: var(--font-size-sm);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .diary-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .diary-tag {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      background-color: var(--color-primary-light);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .diary-textarea {
      min-height: 300px;
      resize: vertical;
      line-height: 1.8;
    }

    .mood-selector {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .mood-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-md);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      min-width: 70px;
    }

    .mood-option:hover {
      border-color: var(--mood-color);
      background-color: color-mix(in srgb, var(--mood-color) 10%, transparent);
    }

    .mood-option.selected {
      border-color: var(--mood-color);
      background-color: color-mix(in srgb, var(--mood-color) 15%, transparent);
    }

    .mood-icon {
      font-size: 1.5rem;
    }

    .mood-label {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .mood-option.selected .mood-label {
      color: var(--mood-color);
      font-weight: 500;
    }

    .diary-mood-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .diary-content-view {
      line-height: 1.8;
      font-size: var(--font-size-base);
    }

    .diary-content-view p {
      margin-bottom: var(--spacing-md);
    }

    @media (max-width: 640px) {
      .mood-selector {
        justify-content: center;
      }

      .mood-option {
        min-width: 60px;
        padding: var(--spacing-sm);
      }
    }

    /* 图片上传区域 */
    .image-upload-area {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }

    /* 图片预览网格 */
    .image-preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
    }

    .image-preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      background-color: var(--bg-secondary);
    }

    .image-preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast);
    }

    .image-remove-btn:hover {
      background-color: rgba(239, 68, 68, 0.9);
    }

    /* 日记详情页图片网格 */
    .diary-images-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
    }

    .diary-image-item {
      aspect-ratio: 1;
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-fast);
    }

    .diary-image-item:hover {
      transform: scale(1.02);
    }

    .diary-image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* 图片查看器 */
    .image-viewer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-viewer-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
    }

    .image-viewer-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .image-viewer-content img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: var(--radius-md);
    }

    .image-viewer-controls {
      margin-top: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      color: white;
    }

    .image-viewer-controls .btn {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .image-viewer-controls .btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .image-viewer-controls .btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .image-viewer-close {
      position: absolute;
      top: -40px;
      right: 0;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast);
    }

    .image-viewer-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 640px) {
      .image-preview-grid,
      .diary-images-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .image-viewer-controls {
        gap: var(--spacing-md);
      }

      .image-viewer-controls .btn {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
      }

      .diary-mood-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
      }

      .diary-title {
        font-size: var(--font-size-sm);
      }

      .diary-preview {
        font-size: var(--font-size-xs);
        -webkit-line-clamp: 2;
      }

      .diary-textarea {
        min-height: 200px;
      }

      .diary-month-title {
        font-size: var(--font-size-base);
      }
    }

    @media (max-width: 480px) {
      .mood-option {
        min-width: 50px;
        padding: var(--spacing-xs);
      }

      .mood-icon {
        font-size: 1.25rem;
      }

      .mood-label {
        font-size: var(--font-size-xs);
      }

      .diary-mood-icon {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }
    }
  `;
  document.head.appendChild(style);
};
