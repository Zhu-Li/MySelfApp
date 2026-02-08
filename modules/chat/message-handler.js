/**
 * message-handler.js - 消息处理
 * 观己 - 静观己心，内外澄明
 * 
 * 从 chat.js 拆分
 * 职责：消息的添加、更新、格式化和界面操作
 */

/**
 * 添加消息到界面
 * @param {string} role - 角色 (user/assistant)
 * @param {string} content - 消息内容
 * @param {boolean} isTyping - 是否显示打字指示器
 * @returns {number|null} 消息ID
 */
Chat.addMessage = function(role, content, isTyping = false) {
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
};

/**
 * 更新消息内容
 * @param {number} messageId - 消息ID
 * @param {string} content - 新内容
 */
Chat.updateMessage = function(messageId, content) {
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
};

/**
 * 移除打字指示器
 * @param {number} messageId - 消息ID
 */
Chat.removeTypingIndicator = function(messageId) {
  const indicator = document.querySelector(`[data-message-id="${messageId}"] .chat-typing-indicator`);
  if (indicator) {
    indicator.remove();
  }
};

/**
 * 格式化内容（简单的Markdown支持）
 * @param {string} content - 原始内容
 * @returns {string} 格式化后的HTML
 */
Chat.formatContent = function(content) {
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
};

/**
 * 滚动到底部
 */
Chat.scrollToBottom = function() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

/**
 * 更新发送按钮状态
 */
Chat.updateSendButton = function() {
  const btn = document.getElementById('chatSendBtn');
  if (btn) {
    btn.disabled = this.isGenerating;
    btn.innerHTML = this.isGenerating 
      ? '<span class="chat-loading-icon"></span>' 
      : '<span class="chat-send-icon">➤</span>';
  }
};
