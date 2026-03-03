/**
 * arcade.js - 电玩城模块
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：游戏配置管理与模块协调
 * 扩展方式：在 games 数组中添加新游戏配置即可
 */

const Arcade = {
  /**
   * 游戏配置列表（可扩展）
   * 新增游戏只需在此数组中追加配置对象
   */
  games: [
    {
      id: 'spaceup',
      name: '飞天太空',
      desc: '驾驶飞船穿越星际，挑战无限高度，看看你能飞多远',
      icon: '🚀',
      url: 'https://10226339ismm5.vicp.fun/SpaceUp/',
      tags: ['飞行', '休闲'],
      color: ['#1e3a5f', '#4f6ef7']
    },
    {
      id: 'evolve',
      name: '文明进化',
      desc: '从微生物开始，一步步演化出属于你的伟大文明',
      icon: '🧬',
      url: 'https://10226339ismm5.vicp.fun/Evolve/',
      tags: ['策略', '放置'],
      color: ['#1a3a2a', '#2ecc71']
    }
  ],

  /** 当前正在游玩的游戏（null 表示在列表页） */
  currentGame: null,

  /**
   * 主渲染入口
   * @param {HTMLElement} container - 主内容容器
   */
  render(container) {
    this.addStyles();

    if (this.currentGame) {
      ArcadeRenderer.renderGame(container, this.currentGame);
    } else {
      ArcadeRenderer.renderList(container);
    }
  },

  /**
   * 打开指定游戏
   * @param {string} gameId - 游戏ID
   */
  openGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    this.currentGame = game;
    const container = document.getElementById('mainContent');
    ArcadeRenderer.renderGame(container, game);
  },

  /**
   * 返回游戏列表
   */
  backToList() {
    this.currentGame = null;
    const container = document.getElementById('mainContent');
    ArcadeRenderer.renderList(container);
  },

  /**
   * 切换全屏模式
   */
  toggleFullscreen() {
    const wrapper = document.querySelector('.arcade-iframe-wrapper');
    if (!wrapper) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    }
  }
};

// 导出到全局
window.Arcade = Arcade;
