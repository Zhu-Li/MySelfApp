/**
 * changelog.js - 版本更新日志模块
 * 观己 - 静观己心，内外澄明
 */

const Changelog = {
  // 当前版本
  currentVersion: '1.4.0',

  // 版本历史记录
  versions: [
    {
      version: '1.4.0',
      date: '2026-02-07',
      title: '心理测试扩展',
      changes: [
        { type: 'feature', text: '新增依恋类型测试（30道题），了解亲密关系模式' },
        { type: 'feature', text: '新增情商测试（40道题），评估五大情商维度' },
        { type: 'feature', text: '新增价值观测试（30道题），发现核心价值观' },
        { type: 'feature', text: '新增心理健康自测（GAD-7 + PHQ-9 量表）' },
        { type: 'improve', text: '测试列表新增4个测试入口' },
        { type: 'improve', text: '所有新测试支持AI深度分析报告' }
      ]
    },
    {
      version: '1.3.0',
      date: '2026-02-07',
      title: '移动端体验优化',
      changes: [
        { type: 'improve', text: '全面优化移动端界面适配' },
        { type: 'improve', text: '优化首页、测试、日记等页面布局' },
        { type: 'improve', text: '优化设置页面移动端显示' },
        { type: 'improve', text: '优化 AI 智障聊天界面' },
        { type: 'improve', text: '调整响应式断点和字体大小' }
      ]
    },
    {
      version: '1.2.0',
      date: '2026-02-06',
      title: 'AI 智障上线',
      changes: [
        { type: 'feature', text: '新增 AI 智障模块，有问必答，不保证靠谱' },
        { type: 'feature', text: '流式输出，实时显示 AI 胡说八道' },
        { type: 'feature', text: '支持 Markdown 格式渲染' },
        { type: 'improve', text: '优化版本更新提示，仅在新版本时显示' }
      ]
    },
    {
      version: '1.1.0',
      date: '2026-02-06',
      title: '功能优化更新',
      changes: [
        { type: 'feature', text: '新增意见反馈功能，支持直接提交建议' },
        { type: 'feature', text: '新增版本更新日志，查看历史版本变化' },
        { type: 'feature', text: '日记支持添加图片，最多9张' },
        { type: 'improve', text: '优化移动端数据概览布局' },
        { type: 'improve', text: '优化打赏页面，收款码居中显示' },
        { type: 'improve', text: '打赏入口更低调，移至设置页' }
      ]
    },
    {
      version: '1.0.0',
      date: '2026-02-05',
      title: '首个正式版本',
      changes: [
        { type: 'feature', text: 'MBTI 性格测试（70道题）' },
        { type: 'feature', text: '大五人格测试（50道题）' },
        { type: 'feature', text: '霍兰德职业兴趣测试（60道题）' },
        { type: 'feature', text: '综合画像分析' },
        { type: 'feature', text: '个人日记功能，支持心情记录' },
        { type: 'feature', text: 'AI 智能分析（硅基流动 API）' },
        { type: 'feature', text: '本地加密存储，保护隐私' },
        { type: 'feature', text: '深色/浅色主题切换' },
        { type: 'feature', text: '数据导入导出功能' }
      ]
    }
  ],

  /**
   * 获取已读版本
   */
  async getReadVersion() {
    try {
      const config = await Storage.get('config', 'changelog');
      return config?.readVersion || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * 标记版本已读
   */
  async markAsRead() {
    await Storage.save('config', {
      key: 'changelog',
      readVersion: this.currentVersion
    });
  },

  /**
   * 检查是否有新版本更新
   */
  async hasNewVersion() {
    const readVersion = await this.getReadVersion();
    return readVersion !== this.currentVersion;
  },

  /**
   * 显示更新弹窗（如果有新版本）
   */
  async showUpdateModal() {
    const hasNew = await this.hasNewVersion();
    if (!hasNew) return;

    const latestVersion = this.versions[0];
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'changelogModal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal changelog-modal">
        <div class="modal-header">
          <h3 class="modal-title">🎉 更新内容</h3>
          <button class="modal-close" onclick="Changelog.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="changelog-version-badge">v${latestVersion.version}</div>
          <h4 class="changelog-version-title">${latestVersion.title}</h4>
          <ul class="changelog-list">
            ${latestVersion.changes.map(change => `
              <li class="changelog-item changelog-item-${change.type}">
                <span class="changelog-item-icon">${this.getTypeIcon(change.type)}</span>
                <span class="changelog-item-text">${change.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-block" onclick="Changelog.closeModal()">
            知道了
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.addStyles();

    // 标记已读
    await this.markAsRead();
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 获取类型图标
   */
  getTypeIcon(type) {
    const icons = {
      feature: '✨',
      improve: '💫',
      fix: '🐛',
      remove: '🗑️'
    };
    return icons[type] || '📝';
  },

  /**
   * 获取类型标签
   */
  getTypeLabel(type) {
    const labels = {
      feature: '新功能',
      improve: '优化',
      fix: '修复',
      remove: '移除'
    };
    return labels[type] || '更新';
  },

  /**
   * 渲染完整更新日志页面
   */
  render(container) {
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="changelog-page">
          <!-- 头部 -->
          <div class="changelog-header">
            <div class="changelog-icon">📋</div>
            <h1 class="changelog-title">更新日志</h1>
            <p class="changelog-subtitle">查看「观己」的版本迭代历程</p>
            <div class="changelog-current">
              当前版本：<strong>v${this.currentVersion}</strong>
            </div>
          </div>

          <!-- 版本列表 -->
          <div class="changelog-timeline">
            ${this.versions.map((ver, index) => `
              <div class="changelog-version-card ${index === 0 ? 'latest' : ''}">
                <div class="changelog-version-header">
                  <div class="changelog-version-info">
                    <span class="changelog-version-number">v${ver.version}</span>
                    ${index === 0 ? '<span class="badge badge-success">最新</span>' : ''}
                  </div>
                  <span class="changelog-version-date">${ver.date}</span>
                </div>
                <h3 class="changelog-version-name">${ver.title}</h3>
                <ul class="changelog-changes">
                  ${ver.changes.map(change => `
                    <li class="changelog-change changelog-change-${change.type}">
                      <span class="changelog-change-icon">${this.getTypeIcon(change.type)}</span>
                      <span class="changelog-change-label">${this.getTypeLabel(change.type)}</span>
                      <span class="changelog-change-text">${change.text}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <!-- 返回按钮 -->
          <div class="changelog-footer">
            <button class="btn btn-secondary" onclick="Router.navigate('/settings')">
              ← 返回设置
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
    if (document.getElementById('changelog-styles')) return;

    const style = document.createElement('style');
    style.id = 'changelog-styles';
    style.textContent = `
      .changelog-page {
        max-width: 700px;
        margin: 0 auto;
        padding: var(--spacing-lg) 0;
      }

      .changelog-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
      }

      .changelog-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
      }

      .changelog-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .changelog-subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
      }

      .changelog-current {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-md);
        background-color: var(--color-primary-light);
        color: var(--color-primary);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
      }

      /* 时间线 */
      .changelog-timeline {
        position: relative;
        padding-left: var(--spacing-lg);
      }

      .changelog-timeline::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, var(--color-primary), var(--border-color));
      }

      .changelog-version-card {
        position: relative;
        background-color: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
        box-shadow: var(--shadow-sm);
      }

      .changelog-version-card::before {
        content: '';
        position: absolute;
        left: calc(var(--spacing-lg) * -1 - 4px);
        top: var(--spacing-lg);
        width: 12px;
        height: 12px;
        background-color: var(--border-color);
        border-radius: 50%;
        border: 2px solid var(--bg-primary);
      }

      .changelog-version-card.latest::before {
        background-color: var(--color-primary);
        box-shadow: 0 0 0 4px var(--color-primary-light);
      }

      .changelog-version-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
      }

      .changelog-version-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .changelog-version-number {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--color-primary);
      }

      .changelog-version-date {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
      }

      .changelog-version-name {
        font-size: var(--font-size-base);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
      }

      .changelog-changes {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .changelog-change {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        border-bottom: 1px solid var(--border-color-light);
      }

      .changelog-change:last-child {
        border-bottom: none;
      }

      .changelog-change-icon {
        flex-shrink: 0;
      }

      .changelog-change-label {
        flex-shrink: 0;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .changelog-change-feature .changelog-change-label {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--color-success);
      }

      .changelog-change-improve .changelog-change-label {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
      }

      .changelog-change-fix .changelog-change-label {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--color-warning);
      }

      .changelog-change-text {
        flex: 1;
        color: var(--text-secondary);
      }

      .changelog-footer {
        text-align: center;
        margin-top: var(--spacing-xl);
      }

      /* 弹窗样式 */
      .changelog-modal {
        max-width: 420px;
      }

      .changelog-version-badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-md);
        background: linear-gradient(135deg, var(--color-primary) 0%, #818cf8 100%);
        color: white;
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 600;
        margin-bottom: var(--spacing-md);
      }

      .changelog-version-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-lg);
      }

      .changelog-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .changelog-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .changelog-item-icon {
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .changelog-page {
          padding: var(--spacing-md) 0;
        }

        .changelog-timeline {
          padding-left: var(--spacing-md);
        }

        .changelog-version-card {
          padding: var(--spacing-md);
        }

        .changelog-version-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-xs);
        }

        .changelog-change {
          flex-wrap: wrap;
        }

        .changelog-change-text {
          width: 100%;
          margin-top: var(--spacing-xs);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Changelog = Changelog;
