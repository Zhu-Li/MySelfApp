/**
 * chat.js - AI问答模块（协调器）
 * 观己 - 静观己心，内外澄明
 * 
 * 简单的AI对话功能
 * 
 * 模块结构:
 * - chat.js (本文件) - 核心协调器：页面渲染、消息发送、对话管理
 * - message-handler.js - 消息处理：添加/更新消息、格式化、UI操作
 * - chat-styles.js - 页面样式
 */

const Chat = {
  // 对话历史
  messages: [],
  // 是否正在生成
  isGenerating: false,

  /**
   * 渲染聊天页面
   * @param {HTMLElement} container - 容器元素
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
              <p class="chat-header-subtitle">有问必答，答非所问</p>
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
                <div class="chat-welcome-icon">🤪</div>
                <h2 class="chat-welcome-title">你好，我是 AI 问答</h2>
                <p class="chat-welcome-hint">问我问题，不保证靠谱</p>
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
  async checkAPIConfig() {
    if (!API.isConfigured()) {
      const welcome = document.getElementById('chatWelcome');
      if (welcome) {
        welcome.innerHTML = `
          <div class="chat-welcome-icon">⚠️</div>
          <h2 class="chat-welcome-title">请先配置 API</h2>
          <p class="chat-welcome-hint">配置硅基流动 API 密钥后即可使用 AI 问答</p>
          <button class="btn btn-primary" onclick="API.showConfigModal('not_configured')">
            配置 API
          </button>
        `;
      }
    }
  },

  /**
   * 使用建议问题
   * @param {string} text - 建议文本
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
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  },

  /**
   * 自动调整输入框高度
   * @param {HTMLTextAreaElement} textarea - 输入框元素
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

    // 验证 API 配置和密钥有效性
    const canUseAPI = await API.checkAndPrompt();
    if (!canUseAPI) {
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
            <div class="chat-welcome-icon">🤪</div>
            <h2 class="chat-welcome-title">你好，我是 AI 问答</h2>
            <p class="chat-welcome-hint">问我问题，不保证靠谱</p>
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
  }

  // 以下方法由子模块扩展：
  // - addMessage(role, content, isTyping) -> message-handler.js
  // - updateMessage(messageId, content) -> message-handler.js
  // - removeTypingIndicator(messageId) -> message-handler.js
  // - formatContent(content) -> message-handler.js
  // - scrollToBottom() -> message-handler.js
  // - updateSendButton() -> message-handler.js
  // - addStyles() -> chat-styles.js
};

// 导出到全局
window.Chat = Chat;
