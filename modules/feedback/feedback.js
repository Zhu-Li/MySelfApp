/**
 * feedback.js - 意见反馈模块
 * 观己 - 静观己心，内外澄明
 * 使用 Web3Forms 发送邮件
 */

const Feedback = {
  // Web3Forms Access Key
  accessKey: '6b185605-27d4-4298-a23c-f7a65b171f3a',

  /**
   * 渲染反馈页面
   */
  render(container) {
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="feedback-page">
          <!-- 头部 -->
          <div class="feedback-header">
            <div class="feedback-icon">💬</div>
            <h1 class="feedback-title">意见反馈</h1>
            <p class="feedback-subtitle">您的建议是我们进步的动力</p>
          </div>

          <!-- 反馈表单 -->
          <div class="card feedback-card">
            <div class="card-body">
              <form id="feedbackForm" onsubmit="Feedback.handleSubmit(event)">
                <!-- 反馈类型 -->
                <div class="input-group mb-lg">
                  <label class="input-label">反馈类型</label>
                  <div class="feedback-type-selector">
                    <label class="feedback-type-option selected" data-type="suggestion">
                      <input type="radio" name="feedbackType" value="功能建议" checked>
                      <span class="feedback-type-icon">💡</span>
                      <span class="feedback-type-text">功能建议</span>
                    </label>
                    <label class="feedback-type-option" data-type="bug">
                      <input type="radio" name="feedbackType" value="问题反馈">
                      <span class="feedback-type-icon">🐛</span>
                      <span class="feedback-type-text">问题反馈</span>
                    </label>
                    <label class="feedback-type-option" data-type="other">
                      <input type="radio" name="feedbackType" value="其他">
                      <span class="feedback-type-icon">📝</span>
                      <span class="feedback-type-text">其他</span>
                    </label>
                  </div>
                </div>

                <!-- 反馈标题 -->
                <div class="input-group mb-lg">
                  <label class="input-label">标题</label>
                  <input type="text" class="input-field" id="feedbackTitle" 
                         placeholder="简要描述您的建议或问题" required>
                </div>

                <!-- 反馈内容 -->
                <div class="input-group mb-lg">
                  <label class="input-label">详细描述</label>
                  <textarea class="input-field feedback-textarea" id="feedbackContent" 
                            placeholder="请详细描述您的建议或遇到的问题..."
                            required></textarea>
                </div>

                <!-- 联系方式（可选） -->
                <div class="input-group mb-lg">
                  <label class="input-label">您的联系方式（可选）</label>
                  <input type="text" class="input-field" id="feedbackContact" 
                         placeholder="邮箱或微信，方便我们回复您">
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="btn btn-primary btn-lg btn-block" id="submitBtn">
                  📧 提交反馈
                </button>
              </form>
            </div>
          </div>

          <!-- 返回按钮 -->
          <div class="feedback-footer">
            <button class="btn btn-secondary" onclick="Router.navigate('/settings')">
              ← 返回设置
            </button>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 反馈类型选择
    document.querySelectorAll('.feedback-type-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.feedback-type-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(event) {
    event.preventDefault();

    const type = document.querySelector('input[name="feedbackType"]:checked').value;
    const title = document.getElementById('feedbackTitle').value.trim();
    const content = document.getElementById('feedbackContent').value.trim();
    const contact = document.getElementById('feedbackContact').value.trim();

    if (!title || !content) {
      Utils.showToast('请填写标题和内容', 'error');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ 提交中...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: this.accessKey,
          subject: `[观己反馈] ${type}: ${title}`,
          from_name: '观己用户反馈',
          message: `反馈类型：${type}\n\n标题：${title}\n\n详细描述：\n${content}${contact ? `\n\n联系方式：${contact}` : ''}\n\n---\n发送自「观己」应用`
        })
      });

      const result = await response.json();

      if (result.success) {
        Utils.showToast('反馈提交成功，感谢您的建议！', 'success');
        
        // 清空表单
        document.getElementById('feedbackTitle').value = '';
        document.getElementById('feedbackContent').value = '';
        document.getElementById('feedbackContact').value = '';
        
        // 2秒后返回设置页
        setTimeout(() => {
          Router.navigate('/settings');
        }, 2000);
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      console.error('反馈提交失败:', error);
      Utils.showToast('提交失败，请稍后重试', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '📧 提交反馈';
    }
  },

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('feedback-styles')) return;

    const style = document.createElement('style');
    style.id = 'feedback-styles';
    style.textContent = `
      .feedback-page {
        max-width: 600px;
        margin: 0 auto;
        padding: var(--spacing-lg) 0;
      }

      .feedback-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
      }

      .feedback-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
      }

      .feedback-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .feedback-subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
      }

      .feedback-card {
        margin-bottom: var(--spacing-lg);
      }

      .feedback-type-selector {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
      }

      .feedback-type-option {
        flex: 1;
        min-width: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-md);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .feedback-type-option input {
        display: none;
      }

      .feedback-type-option:hover {
        border-color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .feedback-type-option.selected {
        border-color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .feedback-type-icon {
        font-size: 1.5rem;
      }

      .feedback-type-text {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .feedback-type-option.selected .feedback-type-text {
        color: var(--color-primary);
        font-weight: 500;
      }

      .feedback-textarea {
        min-height: 150px;
        resize: vertical;
        line-height: 1.6;
      }

      .feedback-footer {
        text-align: center;
        margin-top: var(--spacing-xl);
      }

      @media (max-width: 640px) {
        .feedback-page {
          padding: var(--spacing-md) 0;
        }

        .feedback-type-selector {
          flex-direction: column;
        }

        .feedback-type-option {
          flex-direction: row;
          justify-content: flex-start;
          gap: var(--spacing-md);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Feedback = Feedback;
