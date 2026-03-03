/**
 * arcade-renderer.js - 电玩城渲染器
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：游戏列表页和 iframe 游玩页的渲染
 */

const ArcadeRenderer = {
  /**
   * 渲染游戏列表页
   * @param {HTMLElement} container - 主内容容器
   */
  renderList(container) {
    const games = Arcade.games;

    const cardsHtml = games.length > 0
      ? `<div class="arcade-grid">${games.map(game => this.renderCard(game)).join('')}</div>`
      : `<div class="arcade-empty">
           <div class="arcade-empty-icon">🎮</div>
           <p class="arcade-empty-text">暂无游戏，敬请期待</p>
         </div>`;

    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="arcade-page">
          <div class="arcade-header">
            <div class="arcade-header-icon">🕹️</div>
            <h1 class="arcade-header-title">电玩城</h1>
            <p class="arcade-header-desc">休闲时光，畅玩精选小游戏</p>
          </div>
          ${cardsHtml}
        </div>
      </div>
    `;

    // 绑定卡片点击事件
    container.querySelectorAll('.arcade-card').forEach(card => {
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        if (gameId) Arcade.openGame(gameId);
      });
    });
  },

  /**
   * 渲染单个游戏卡片
   * @param {Object} game - 游戏配置对象
   * @returns {string} 卡片HTML
   */
  renderCard(game) {
    const gradient = `linear-gradient(135deg, ${game.color[0]}, ${game.color[1]})`;
    const tagsHtml = game.tags.map(tag => `<span class="arcade-tag">${Utils.escapeHtml(tag)}</span>`).join('');

    return `
      <div class="arcade-card" data-game-id="${Utils.escapeHtml(game.id)}">
        <div class="arcade-card-bg" style="background: ${gradient}">
          <span class="arcade-card-icon">${game.icon}</span>
        </div>
        <div class="arcade-card-body">
          <h3 class="arcade-card-name">${Utils.escapeHtml(game.name)}</h3>
          <p class="arcade-card-desc">${Utils.escapeHtml(game.desc)}</p>
          <div class="arcade-card-tags">${tagsHtml}</div>
          <button class="arcade-card-action">开始游戏</button>
        </div>
      </div>
    `;
  },

  /**
   * 渲染游戏 iframe 页
   * @param {HTMLElement} container - 主内容容器
   * @param {Object} game - 游戏配置对象
   */
  renderGame(container, game) {
    container.innerHTML = `
      <div class="arcade-game-view">
        <div class="arcade-game-bar">
          <button class="arcade-back-btn" id="arcadeBackBtn">
            <span>←</span>
            <span>返回</span>
          </button>
          <h2 class="arcade-game-title">${Utils.escapeHtml(game.name)}</h2>
          <button class="arcade-fullscreen-btn" id="arcadeFullscreenBtn" title="全屏">
            <span id="arcadeFullscreenIcon">⛶</span>
          </button>
        </div>
        <div class="arcade-iframe-wrapper">
          <iframe
            class="arcade-iframe"
            src="${Utils.escapeHtml(game.url)}"
            allow="fullscreen; autoplay"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          ></iframe>
          <div class="arcade-load-hint" id="arcadeLoadHint">
            游戏加载中，如长时间未响应请 <a id="arcadeRetryBtn">点击重试</a>
          </div>
        </div>
      </div>
    `;

    this.bindGameEvents(game);
  },

  /**
   * 绑定游戏页面事件
   * @param {Object} game - 游戏配置对象
   */
  bindGameEvents(game) {
    // 返回按钮
    const backBtn = document.getElementById('arcadeBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => Arcade.backToList());
    }

    // 全屏按钮
    const fullscreenBtn = document.getElementById('arcadeFullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => Arcade.toggleFullscreen());
    }

    // 监听全屏状态变化
    const updateFullscreenIcon = () => {
      const icon = document.getElementById('arcadeFullscreenIcon');
      if (icon) {
        icon.textContent = document.fullscreenElement ? '⛶' : '⛶';
      }
    };
    document.addEventListener('fullscreenchange', updateFullscreenIcon);

    // 加载提示：10秒后如果还在显示则出现提示
    const loadHint = document.getElementById('arcadeLoadHint');
    const iframe = document.querySelector('.arcade-iframe');
    let loadTimer = null;

    if (loadHint && iframe) {
      loadTimer = setTimeout(() => {
        loadHint.classList.add('visible');
      }, 10000);

      iframe.addEventListener('load', () => {
        clearTimeout(loadTimer);
        loadHint.classList.remove('visible');
      });

      // 重试按钮
      const retryBtn = document.getElementById('arcadeRetryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          loadHint.classList.remove('visible');
          iframe.src = game.url;
          loadTimer = setTimeout(() => {
            loadHint.classList.add('visible');
          }, 10000);
        });
      }
    }
  }
};

// 导出到全局
window.ArcadeRenderer = ArcadeRenderer;
