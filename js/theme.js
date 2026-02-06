/**
 * theme.js - 主题切换管理
 * 观己 - 静观己心，内外澄明
 */

const Theme = {
  currentTheme: 'light',
  storageKey: 'theme',

  /**
   * 初始化主题
   */
  async init() {
    // 从存储中加载主题设置
    const savedTheme = await Storage.getConfig(this.storageKey, null);
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // 检测系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      }
    }

    this.apply(this.currentTheme);

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // 只有在没有用户手动设置时才跟随系统
      if (!savedTheme) {
        this.set(e.matches ? 'dark' : 'light', false);
      }
    });
  },

  /**
   * 应用主题
   */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.updateThemeIcon();
    this.updateMetaThemeColor();
  },

  /**
   * 设置主题
   */
  async set(theme, save = true) {
    this.apply(theme);
    
    if (save) {
      await Storage.setConfig(this.storageKey, theme);
    }
  },

  /**
   * 切换主题
   */
  async toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    await this.set(newTheme);
    Utils.showToast(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
  },

  /**
   * 获取当前主题
   */
  get() {
    return this.currentTheme;
  },

  /**
   * 更新主题图标
   */
  updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    }
  },

  /**
   * 更新 meta 主题色
   */
  updateMetaThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = this.currentTheme === 'light' ? '#6366f1' : '#818cf8';
    }
  },

  /**
   * 获取可用主题列表
   */
  getAvailableThemes() {
    return [
      { id: 'light', name: '浅色主题', icon: '☀️', description: '简约现代风格' },
      { id: 'dark', name: '深色主题', icon: '🌙', description: '科技感风格' }
    ];
  }
};

// 导出到全局
window.Theme = Theme;
