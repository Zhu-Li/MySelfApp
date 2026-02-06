/**
 * donate.js - 打赏模块
 * 观己 - 静观己心，内外澄明
 */

const Donate = {
  /**
   * 渲染打赏页面
   */
  render(container) {
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="donate-page">
          <!-- 头部 -->
          <div class="donate-header">
            <div class="donate-icon">☕</div>
            <h1 class="donate-title">请开发者喝杯咖啡</h1>
            <p class="donate-subtitle">如果「观己」对你有帮助，欢迎随意打赏支持</p>
          </div>

          <!-- 二维码卡片 -->
          <div class="card donate-card">
            <div class="card-body">
              <div class="donate-qr-wrapper">
                <img src="assets/images/alipay-qr.jpg" alt="支付宝收款码" class="donate-qr-image">
              </div>
              <div class="donate-tips">
                <p class="donate-tip-main">打开支付宝扫一扫</p>
                <p class="donate-tip-sub">金额随意，心意最重要</p>
              </div>
            </div>
          </div>

          <!-- 感谢语 -->
          <div class="donate-thanks">
            <div class="donate-thanks-icon">💖</div>
            <h3 class="donate-thanks-title">感谢您的支持</h3>
            <p class="donate-thanks-text">
              您的每一份打赏都是对开发者最大的鼓励，<br>
              也是「观己」持续优化的动力。
            </p>
          </div>

          <!-- 开发者寄语 -->
          <div class="card donate-message-card">
            <div class="card-body">
              <div class="donate-message">
                <div class="donate-message-avatar">🧑‍💻</div>
                <div class="donate-message-content">
                  <h4 class="donate-message-title">开发者寄语</h4>
                  <p class="donate-message-text">
                    「观己」是一款帮助你了解自己的小工具。希望它能陪伴你探索内心世界，
                    发现更好的自己。如果你喜欢这个应用，分享给朋友也是一种支持方式！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 开源信息 -->
          <div class="card donate-opensource-card">
            <div class="card-body">
              <div class="donate-opensource">
                <div class="donate-opensource-header">
                  <span class="donate-opensource-icon">📦</span>
                  <h4 class="donate-opensource-title">开源项目</h4>
                </div>
                <p class="donate-opensource-desc">
                  「观己」是一个开源项目，欢迎 Star、Fork 和贡献代码！
                </p>
                <div class="donate-opensource-links">
                  <a href="https://github.com/Zhu-Li/MySelfApp" target="_blank" class="donate-opensource-link">
                    <span class="donate-link-icon">⭐</span>
                    <span class="donate-link-text">GitHub 仓库</span>
                    <span class="donate-link-arrow">→</span>
                  </a>
                </div>
                <div class="donate-opensource-info">
                  <div class="donate-info-item">
                    <span class="donate-info-label">技术栈</span>
                    <span class="donate-info-value">原生 HTML/CSS/JS</span>
                  </div>
                  <div class="donate-info-item">
                    <span class="donate-info-label">AI 能力</span>
                    <span class="donate-info-value">硅基流动 API</span>
                  </div>
                  <div class="donate-info-item">
                    <span class="donate-info-label">数据存储</span>
                    <span class="donate-info-value">本地 IndexedDB 加密</span>
                  </div>
                  <div class="donate-info-item">
                    <span class="donate-info-label">开源协议</span>
                    <span class="donate-info-value">MIT License</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 返回按钮 -->
          <div class="donate-footer">
            <button class="btn btn-secondary" onclick="Router.navigate('/')">
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  },

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('donate-styles')) return;

    const style = document.createElement('style');
    style.id = 'donate-styles';
    style.textContent = `
      .donate-page {
        max-width: 480px;
        margin: 0 auto;
        padding: var(--spacing-lg) 0;
      }

      .donate-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
      }

      .donate-icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-md);
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .donate-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .donate-subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
      }

      .donate-card {
        text-align: center;
        overflow: hidden;
      }

      .donate-card .card-body {
        padding: 0;
      }

      .donate-qr-wrapper {
        background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
        padding: var(--spacing-xl);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .donate-qr-image {
        max-width: 280px;
        width: 100%;
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: block;
      }

      .donate-tips {
        padding: var(--spacing-lg);
      }

      .donate-tip-main {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .donate-tip-sub {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
      }

      .donate-thanks {
        text-align: center;
        padding: var(--spacing-xl) 0;
      }

      .donate-thanks-icon {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-md);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .donate-thanks-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .donate-thanks-text {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.8;
      }

      .donate-message-card {
        background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
      }

      .donate-message {
        display: flex;
        gap: var(--spacing-md);
        align-items: flex-start;
      }

      .donate-message-avatar {
        font-size: 2.5rem;
        flex-shrink: 0;
      }

      .donate-message-content {
        flex: 1;
      }

      .donate-message-title {
        font-size: var(--font-size-base);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .donate-message-text {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.8;
      }

      .donate-footer {
        text-align: center;
        margin-top: var(--spacing-xl);
      }

      /* 开源信息卡片 */
      .donate-opensource-card {
        margin-top: var(--spacing-lg);
      }

      .donate-opensource-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
      }

      .donate-opensource-icon {
        font-size: 1.5rem;
      }

      .donate-opensource-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .donate-opensource-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
        line-height: 1.6;
      }

      .donate-opensource-links {
        margin-bottom: var(--spacing-lg);
      }

      .donate-opensource-link {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s;
      }

      .donate-opensource-link:hover {
        background: var(--primary-color);
        color: white;
        transform: translateX(4px);
      }

      .donate-link-icon {
        font-size: 1.25rem;
      }

      .donate-link-text {
        flex: 1;
        font-weight: 500;
      }

      .donate-link-arrow {
        opacity: 0.6;
      }

      .donate-opensource-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
      }

      .donate-info-item {
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: var(--radius-sm);
      }

      .donate-info-label {
        display: block;
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
        margin-bottom: 2px;
      }

      .donate-info-value {
        display: block;
        font-size: var(--font-size-sm);
        color: var(--text-primary);
        font-weight: 500;
      }

      @media (max-width: 640px) {
        .donate-page {
          padding: var(--spacing-md) 0;
        }

        .donate-icon {
          font-size: 3rem;
        }

        .donate-title {
          font-size: var(--font-size-xl);
        }

        .donate-qr-image {
          max-width: 240px;
        }

        .donate-message {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Donate = Donate;
