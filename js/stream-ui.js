/**
 * stream-ui.js - AI 流式分析 UI 组件
 * 观己 - 静观己心，内外澄明
 * 
 * 提供 AI 流式输出的 UI 组件和交互效果
 */

const StreamUI = {
  /**
   * AI 分析加载状态提示语
   */
  loadingMessages: [
    '正在唤醒 AI 分析师...',
    '正在解读你的测试数据...',
    '正在深入分析性格特征...',
    '正在生成个性化建议...',
    '正在整理分析报告...',
    '即将完成，请稍候...'
  ],

  /**
   * 创建流式分析容器 HTML
   * @param {string} containerId - 容器 ID
   * @returns {string} HTML 字符串
   */
  createContainer(containerId) {
    return `
      <div class="ai-stream-container" id="${containerId}">
        <div class="ai-stream-status">
          <div class="ai-thinking-animation">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
          </div>
          <span class="ai-status-text">正在连接 AI 服务...</span>
        </div>
        <div class="ai-stream-content markdown-body"></div>
        <div class="ai-stream-cursor"></div>
      </div>
    `;
  },

  /**
   * 添加流式分析样式（仅添加一次）
   */
  addStyles() {
    if (document.getElementById('ai-stream-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-stream-styles';
    style.textContent = `
      .ai-stream-container {
        min-height: 100px;
        position: relative;
      }

      .ai-stream-status {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        margin-bottom: var(--spacing-md);
        transition: all var(--transition-normal);
      }

      .ai-stream-status.hidden {
        opacity: 0;
        height: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }

      .ai-thinking-animation {
        display: flex;
        gap: 4px;
      }

      .thinking-dot {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: thinkingBounce 1.4s ease-in-out infinite;
      }

      .thinking-dot:nth-child(1) { animation-delay: 0s; }
      .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
      .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes thinkingBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .ai-status-text {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
      }

      .ai-stream-content {
        line-height: 1.8;
      }

      .ai-stream-content:empty {
        display: none;
      }

      .ai-stream-cursor {
        display: inline-block;
        width: 2px;
        height: 1.2em;
        background: var(--color-primary);
        animation: cursorBlink 1s step-end infinite;
        vertical-align: text-bottom;
        margin-left: 2px;
      }

      .ai-stream-cursor.hidden {
        display: none;
      }

      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .ai-progress-bar {
        height: 3px;
        background: var(--bg-tertiary);
        border-radius: 2px;
        overflow: hidden;
        margin-top: var(--spacing-sm);
      }

      .ai-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light, #818cf8));
        border-radius: 2px;
        transition: width 0.3s ease;
        animation: progressShimmer 2s ease-in-out infinite;
      }

      @keyframes progressShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .ai-stats {
        display: flex;
        gap: var(--spacing-lg);
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 流式分析管理器
   */
  Analyzer: {
    container: null,
    statusEl: null,
    contentEl: null,
    cursorEl: null,
    statusTextEl: null,
    messageIndex: 0,
    messageInterval: null,
    startTime: null,
    charCount: 0,

    /**
     * 初始化流式分析
     * @param {string} containerSelector - 容器选择器
     * @returns {boolean} 是否初始化成功
     */
    init(containerSelector) {
      StreamUI.addStyles();
      
      const wrapper = document.querySelector(containerSelector);
      if (!wrapper) return false;

      wrapper.innerHTML = StreamUI.createContainer('aiStreamContent');
      
      this.container = document.getElementById('aiStreamContent');
      this.statusEl = this.container.querySelector('.ai-stream-status');
      this.contentEl = this.container.querySelector('.ai-stream-content');
      this.cursorEl = this.container.querySelector('.ai-stream-cursor');
      this.statusTextEl = this.container.querySelector('.ai-status-text');
      
      this.messageIndex = 0;
      this.charCount = 0;
      this.startTime = Date.now();
      
      // 开始循环显示状态提示
      this.startStatusRotation();
      
      return true;
    },

    /**
     * 开始状态提示轮换
     */
    startStatusRotation() {
      this.updateStatus(StreamUI.loadingMessages[0]);
      
      this.messageInterval = setInterval(() => {
        this.messageIndex = (this.messageIndex + 1) % StreamUI.loadingMessages.length;
        this.updateStatus(StreamUI.loadingMessages[this.messageIndex]);
      }, 3000);
    },

    /**
     * 更新状态文本
     * @param {string} text - 状态文本
     */
    updateStatus(text) {
      if (this.statusTextEl) {
        this.statusTextEl.textContent = text;
      }
    },

    /**
     * 追加内容（打字效果）
     * @param {string} chunk - 新增内容片段
     */
    appendContent(chunk) {
      if (!this.contentEl) return;
      
      this.charCount += chunk.length;
      
      // 获取当前原始文本，追加新内容，然后渲染
      const currentText = this.contentEl.getAttribute('data-raw') || '';
      const newText = currentText + chunk;
      this.contentEl.setAttribute('data-raw', newText);
      this.contentEl.innerHTML = Utils.renderMarkdown(newText);
      
      // 滚动到底部
      this.contentEl.scrollTop = this.contentEl.scrollHeight;
    },

    /**
     * 完成分析
     */
    complete() {
      // 停止状态轮换
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
        this.messageInterval = null;
      }
      
      // 隐藏状态栏和光标
      if (this.statusEl) {
        this.statusEl.classList.add('hidden');
      }
      if (this.cursorEl) {
        this.cursorEl.classList.add('hidden');
      }
      
      // 显示统计信息
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`AI 分析完成: ${this.charCount} 字, 耗时 ${elapsed}s`);
    },

    /**
     * 显示错误
     * @param {string} message - 错误消息
     */
    showError(message) {
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
      }
      
      if (this.container) {
        this.container.innerHTML = `
          <div class="empty-state" style="padding: var(--spacing-xl);">
            <div class="empty-state-icon">❌</div>
            <h4 class="empty-state-title">分析失败</h4>
            <p class="empty-state-desc">${Utils.escapeHtml(message)}</p>
          </div>
        `;
      }
    },

    /**
     * 获取原始内容
     * @returns {string} 原始文本内容
     */
    getRawContent() {
      return this.contentEl?.getAttribute('data-raw') || '';
    }
  }
};

// 向后兼容：在 Utils 对象上创建代理
// 这样现有代码中的 Utils.StreamAnalyzer 等调用仍然有效
if (typeof Utils !== 'undefined') {
  Utils.aiLoadingMessages = StreamUI.loadingMessages;
  Utils.createStreamContainer = StreamUI.createContainer.bind(StreamUI);
  Utils.addStreamStyles = StreamUI.addStyles.bind(StreamUI);
  Utils.StreamAnalyzer = StreamUI.Analyzer;
}

// 导出到全局
window.StreamUI = StreamUI;
