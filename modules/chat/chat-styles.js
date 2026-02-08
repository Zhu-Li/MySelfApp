/**
 * chat-styles.js - 聊天页面样式
 * 观己 - 静观己心，内外澄明
 * 
 * 从 chat.js 拆分
 * 职责：聊天页面的所有CSS样式
 */

/**
 * 添加聊天页面样式
 */
Chat.addStyles = function() {
  if (document.getElementById('chat-styles')) return;

  const style = document.createElement('style');
  style.id = 'chat-styles';
  style.textContent = `
    .chat-page {
      height: calc(100vh - 140px);
      display: flex;
      flex-direction: column;
      max-width: 800px;
      margin: 0 auto;
    }

    /* 头部 */
    .chat-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .chat-header-icon {
      font-size: 2rem;
    }

    .chat-header-info {
      flex: 1;
    }

    .chat-header-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary);
    }

    .chat-header-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .chat-clear-btn {
      padding: var(--spacing-sm);
      font-size: 1.25rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .chat-clear-btn:hover {
      opacity: 1;
    }

    /* 聊天容器 */
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md) 0;
    }

    /* 欢迎界面 */
    .chat-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: var(--spacing-xl);
    }

    .chat-welcome-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-md);
    }

    .chat-welcome-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm);
    }

    .chat-welcome-hint {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg);
    }

    .chat-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      justify-content: center;
    }

    .chat-suggestion {
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .chat-suggestion:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* 消息 */
    .chat-message {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      animation: messageSlideIn 0.3s ease;
    }

    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-message-user {
      flex-direction: row-reverse;
    }

    .chat-message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .chat-message-user .chat-message-avatar {
      background: var(--primary-color);
    }

    .chat-message-bubble {
      max-width: 80%;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-lg);
      background: var(--bg-secondary);
    }

    .chat-message-user .chat-message-bubble {
      background: var(--primary-color);
      color: white;
    }

    .chat-message-content {
      font-size: 0.9375rem;
      line-height: 1.6;
      word-break: break-word;
    }

    .chat-message-content pre {
      background: var(--bg-primary);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      overflow-x: auto;
      margin: var(--spacing-sm) 0;
    }

    .chat-message-content code {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.875em;
    }

    .chat-message-user .chat-message-content pre {
      background: rgba(255,255,255,0.1);
    }

    /* 打字指示器 */
    .chat-typing-indicator {
      display: inline-flex;
      gap: 4px;
      margin-left: var(--spacing-xs);
    }

    .chat-typing-indicator span {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      opacity: 0.4;
      animation: typingBounce 1.4s infinite ease-in-out both;
    }

    .chat-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .chat-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* 输入区域 */
    .chat-input-area {
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .chat-input-wrapper {
      display: flex;
      gap: var(--spacing-sm);
      align-items: flex-end;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--spacing-sm);
      transition: border-color 0.2s;
    }

    .chat-input-wrapper:focus-within {
      border-color: var(--primary-color);
    }

    .chat-input {
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--text-primary);
      max-height: 120px;
      padding: var(--spacing-xs);
    }

    .chat-input:focus {
      outline: none;
    }

    .chat-input::placeholder {
      color: var(--text-tertiary);
    }

    .chat-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .chat-send-btn:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: scale(1.05);
    }

    .chat-send-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .chat-send-icon {
      font-size: 1.25rem;
    }

    .chat-loading-icon {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .chat-input-hint {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
      margin-top: var(--spacing-xs);
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      .chat-page {
        height: calc(100vh - 136px);
      }

      .chat-header {
        padding: var(--spacing-sm) 0;
      }

      .chat-header-icon {
        font-size: 1.5rem;
      }

      .chat-header-title {
        font-size: 1rem;
      }

      .chat-header-subtitle {
        font-size: 0.75rem;
      }

      .chat-message-bubble {
        max-width: 85%;
        padding: var(--spacing-xs) var(--spacing-sm);
      }

      .chat-message-content {
        font-size: 0.875rem;
      }

      .chat-message-avatar {
        width: 32px;
        height: 32px;
        font-size: 1rem;
      }

      .chat-welcome-icon {
        font-size: 3rem;
      }

      .chat-welcome-title {
        font-size: 1.25rem;
      }

      .chat-welcome-hint {
        font-size: 0.875rem;
      }

      .chat-suggestions {
        flex-direction: column;
      }

      .chat-suggestion {
        width: 100%;
        font-size: 0.8125rem;
      }

      .chat-input-wrapper {
        padding: var(--spacing-xs);
      }

      .chat-input {
        font-size: 0.875rem;
      }

      .chat-send-btn {
        width: 36px;
        height: 36px;
      }

      .chat-input-hint {
        font-size: 0.6875rem;
      }
    }

    @media (max-width: 480px) {
      .chat-page {
        height: calc(100vh - 128px);
      }

      .chat-header {
        gap: var(--spacing-sm);
      }

      .chat-header-icon {
        font-size: 1.25rem;
      }

      .chat-message-avatar {
        width: 28px;
        height: 28px;
        font-size: 0.875rem;
      }

      .chat-message-bubble {
        max-width: 88%;
      }

      .chat-message-content {
        font-size: 0.8125rem;
        line-height: 1.5;
      }

      .chat-welcome {
        padding: var(--spacing-md);
      }

      .chat-welcome-icon {
        font-size: 2.5rem;
      }

      .chat-welcome-title {
        font-size: 1.125rem;
      }

      .chat-suggestion {
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.75rem;
      }
    }
  `;
  document.head.appendChild(style);
};
