/**
 * chat.js - AI问答模块
 * 观己 - 静观己心，内外澄明
 * 简单的AI对话功能
 */

const Chat = {
  // 对话历史
  messages: [],
  // 是否正在生成
  isGenerating: false,

  /**
   * 渲染聊天页面
   */
  render(container) {
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="chat-page">
          <!-- 头部 -->
          <div class="chat-header">
            <div class="chat-header-icon">🤖</div>
            <div class="chat-header-info">
              <h1 class="chat-header-title">AI 问答</h1>
              <p class="chat-header-subtitle">有问必答，智能助手</p>
            </div>
            <button class="btn btn-text chat-clear-btn" onclick="Chat.clearHistory()" title="清空对话">
              <span>🗑️</span>
            </button>
          </div>

          <!-- 聊天区域 -->
          <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
              <!-- 欢迎消息 -->
              <div class="chat-welcome" id="chatWelcome">
                <div class="chat-welcome-icon">💬</div>
                <h2 class="chat-welcome-title">你好，有什么可以帮你的？</h2>
                <p class="chat-welcome-hint">可以问我任何问题，我会尽力解答</p>
                <div class="chat-suggestions">
                  <button class="chat-suggestion" onclick="Chat.useSuggestion('帮我写一首关于春天的诗')">
                    ✨ 帮我写一首关于春天的诗
                  </button>
                  <button class="chat-suggestion" onclick="Chat.useSuggestion('解释一下什么是人工智能')">
                    🧠 解释一下什么是人工智能
                  </button>
                  <button class="chat-suggestion" onclick="Chat.useSuggestion('给我讲一个有趣的故事')">
                    📖 给我讲一个有趣的故事
                  </button>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="chat-input-area">
              <div class="chat-input-wrapper">
                <textarea 
                  id="chatInput" 
                  class="chat-input" 
                  placeholder="输入你的问题..." 
                  rows="1"
                  onkeydown="Chat.handleKeydown(event)"
                  oninput="Chat.autoResize(this)"
                ></textarea>
                <button 
                  class="chat-send-btn" 
                  id="chatSendBtn"
                  onclick="Chat.send()"
                  title="发送"
                >
                  <span class="chat-send-icon">➤</span>
                </button>
              </div>
              <p class="chat-input-hint">按 Enter 发送，Shift + Enter 换行</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.checkAPIConfig();
  },

  /**
   * 检查API配置
   */
  checkAPIConfig() {
    if (!API.isConfigured()) {
      const welcome = document.getElementById('chatWelcome');
      if (welcome) {
        welcome.innerHTML = `
          <div class="chat-welcome-icon">⚠️</div>
          <h2 class="chat-welcome-title">请先配置 API</h2>
          <p class="chat-welcome-hint">在设置中配置硅基流动 API 密钥后即可使用</p>
          <button class="btn btn-primary" onclick="Router.navigate('/settings')">
            前往设置
          </button>
        `;
      }
    }
  },

  /**
   * 使用建议问题
   */
  useSuggestion(text) {
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = text;
      this.autoResize(input);
      this.send();
    }
  },

  /**
   * 处理键盘事件
   */
  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  },

  /**
   * 自动调整输入框高度
   */
  autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  },

  /**
   * 发送消息
   */
  async send() {
    if (this.isGenerating) return;

    const input = document.getElementById('chatInput');
    const content = input?.value?.trim();
    
    if (!content) return;

    if (!API.isConfigured()) {
      Utils.showToast('请先在设置中配置 API 密钥', 'warning');
      return;
    }

    // 隐藏欢迎界面
    const welcome = document.getElementById('chatWelcome');
    if (welcome) {
      welcome.style.display = 'none';
    }

    // 清空输入框
    input.value = '';
    this.autoResize(input);

    // 添加用户消息
    this.addMessage('user', content);
    this.messages.push({ role: 'user', content });

    // 添加AI消息占位
    const aiMessageId = this.addMessage('assistant', '', true);

    // 开始生成
    this.isGenerating = true;
    this.updateSendButton();

    try {
      // 构建消息
      const systemMessage = {
        role: 'system',
        content: '你是一位友善、专业的AI助手。请用简洁清晰的语言回答问题，必要时使用 Markdown 格式。'
      };

      const messages = [systemMessage, ...this.messages.slice(-10)]; // 保留最近10条对话

      // 流式输出
      await API.chatStream(messages, (chunk, fullContent) => {
        this.updateMessage(aiMessageId, fullContent);
      }, {
        temperature: 0.7,
        maxTokens: 2000
      });

      // 保存AI回复
      const aiMessage = document.querySelector(`[data-message-id="${aiMessageId}"] .chat-message-content`);
      if (aiMessage) {
        this.messages.push({ role: 'assistant', content: aiMessage.textContent });
      }

    } catch (error) {
      console.error('AI回复失败:', error);
      this.updateMessage(aiMessageId, `抱歉，出现了错误：${error.message}`);
    } finally {
      this.isGenerating = false;
      this.updateSendButton();
      this.removeTypingIndicator(aiMessageId);
    }
  },

  /**
   * 添加消息到界面
   */
  addMessage(role, content, isTyping = false) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return null;

    const messageId = Date.now();
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message-${role}`;
    messageEl.setAttribute('data-message-id', messageId);

    const avatar = role === 'user' ? '👤' : '🤖';
    const typingIndicator = isTyping ? '<span class="chat-typing-indicator"><span></span><span></span><span></span></span>' : '';

    messageEl.innerHTML = `
      <div class="chat-message-avatar">${avatar}</div>
      <div class="chat-message-bubble">
        <div class="chat-message-content">${this.formatContent(content)}${typingIndicator}</div>
      </div>
    `;

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    return messageId;
  },

  /**
   * 更新消息内容
   */
  updateMessage(messageId, content) {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"] .chat-message-content`);
    if (messageEl) {
      // 保留打字指示器
      const typingIndicator = messageEl.querySelector('.chat-typing-indicator');
      messageEl.innerHTML = this.formatContent(content);
      if (typingIndicator) {
        messageEl.appendChild(typingIndicator);
      }
      this.scrollToBottom();
    }
  },

  /**
   * 移除打字指示器
   */
  removeTypingIndicator(messageId) {
    const indicator = document.querySelector(`[data-message-id="${messageId}"] .chat-typing-indicator`);
    if (indicator) {
      indicator.remove();
    }
  },

  /**
   * 格式化内容（简单的Markdown支持）
   */
  formatContent(content) {
    if (!content) return '';
    
    return content
      // 代码块
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 粗体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // 换行
      .replace(/\n/g, '<br>');
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  /**
   * 更新发送按钮状态
   */
  updateSendButton() {
    const btn = document.getElementById('chatSendBtn');
    if (btn) {
      btn.disabled = this.isGenerating;
      btn.innerHTML = this.isGenerating 
        ? '<span class="chat-loading-icon"></span>' 
        : '<span class="chat-send-icon">➤</span>';
    }
  },

  /**
   * 清空对话历史
   */
  clearHistory() {
    if (this.messages.length === 0) {
      Utils.showToast('暂无对话记录', 'info');
      return;
    }

    if (confirm('确定要清空所有对话记录吗？')) {
      this.messages = [];
      const messagesContainer = document.getElementById('chatMessages');
      if (messagesContainer) {
        messagesContainer.innerHTML = `
          <div class="chat-welcome" id="chatWelcome">
            <div class="chat-welcome-icon">💬</div>
            <h2 class="chat-welcome-title">你好，有什么可以帮你的？</h2>
            <p class="chat-welcome-hint">可以问我任何问题，我会尽力解答</p>
            <div class="chat-suggestions">
              <button class="chat-suggestion" onclick="Chat.useSuggestion('帮我写一首关于春天的诗')">
                ✨ 帮我写一首关于春天的诗
              </button>
              <button class="chat-suggestion" onclick="Chat.useSuggestion('解释一下什么是人工智能')">
                🧠 解释一下什么是人工智能
              </button>
              <button class="chat-suggestion" onclick="Chat.useSuggestion('给我讲一个有趣的故事')">
                📖 给我讲一个有趣的故事
              </button>
            </div>
          </div>
        `;
      }
      Utils.showToast('对话已清空', 'success');
    }
  },

  /**
   * 添加样式
   */
  addStyles() {
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
          height: calc(100vh - 120px);
        }

        .chat-message-bubble {
          max-width: 85%;
        }

        .chat-suggestions {
          flex-direction: column;
        }

        .chat-suggestion {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Chat = Chat;
