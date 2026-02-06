/**
 * router.js - SPA 路由管理
 * 观己 - 静观己心，内外澄明
 */

const Router = {
  routes: {},
  currentRoute: null,
  beforeEachHooks: [],
  afterEachHooks: [],

  /**
   * 注册路由
   */
  register(path, handler) {
    this.routes[path] = handler;
  },

  /**
   * 批量注册路由
   */
  registerAll(routes) {
    Object.entries(routes).forEach(([path, handler]) => {
      this.register(path, handler);
    });
  },

  /**
   * 添加路由前置守卫
   */
  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  },

  /**
   * 添加路由后置守卫
   */
  afterEach(hook) {
    this.afterEachHooks.push(hook);
  },

  /**
   * 解析当前路由
   */
  parseRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = {};

    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    return { path, params };
  },

  /**
   * 匹配路由
   */
  matchRoute(path) {
    // 精确匹配
    if (this.routes[path]) {
      return { handler: this.routes[path], params: {} };
    }

    // 动态路由匹配 (如 /report/:id)
    for (const routePath in this.routes) {
      const routeParts = routePath.split('/');
      const pathParts = path.split('/');

      if (routeParts.length !== pathParts.length) continue;

      const params = {};
      let matched = true;

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { handler: this.routes[routePath], params };
      }
    }

    return null;
  },

  /**
   * 导航到指定路由
   */
  async navigate(path, replace = false) {
    const fullPath = path.startsWith('#') ? path : `#${path}`;
    
    if (replace) {
      window.location.replace(fullPath);
    } else {
      window.location.hash = path;
    }
  },

  /**
   * 替换当前路由（不产生历史记录）
   */
  replace(path) {
    return this.navigate(path, true);
  },

  /**
   * 返回上一页
   */
  back() {
    window.history.back();
  },

  /**
   * 前进
   */
  forward() {
    window.history.forward();
  },

  /**
   * 处理路由变化
   */
  async handleRouteChange() {
    const { path, params: queryParams } = this.parseRoute();
    const from = this.currentRoute;
    const to = { path, params: queryParams };

    // 执行前置守卫
    for (const hook of this.beforeEachHooks) {
      const result = await hook(to, from);
      if (result === false) {
        // 取消导航
        if (from) {
          window.location.hash = from.path;
        }
        return;
      }
      if (typeof result === 'string') {
        // 重定向
        this.navigate(result);
        return;
      }
    }

    // 匹配路由
    const match = this.matchRoute(path);

    if (match) {
      this.currentRoute = {
        path,
        params: { ...match.params, ...queryParams }
      };

      try {
        await match.handler(this.currentRoute.params);
      } catch (error) {
        console.error('路由处理错误:', error);
        this.handleError(error);
      }
    } else {
      // 404 处理
      this.handleNotFound(path);
    }

    // 执行后置守卫
    for (const hook of this.afterEachHooks) {
      await hook(to, from);
    }

    // 更新导航状态
    this.updateNavState(path);
  },

  /**
   * 更新导航激活状态
   */
  updateNavState(path) {
    // 移除所有激活状态
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.remove('active');
    });

    // 确定当前导航项
    let navKey = 'home';
    if (path.startsWith('/test') || path.startsWith('/mbti')) {
      navKey = 'test';
    } else if (path.startsWith('/diary')) {
      navKey = 'diary';
    } else if (path.startsWith('/report')) {
      navKey = 'report';
    } else if (path.startsWith('/settings')) {
      navKey = 'settings';
    }

    // 添加激活状态
    document.querySelectorAll(`[data-nav="${navKey}"]`).forEach(el => {
      el.classList.add('active');
    });
  },

  /**
   * 处理 404
   */
  handleNotFound(path) {
    const container = document.getElementById('mainContent');
    if (container) {
      container.innerHTML = `
        <div class="page-container">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h2 class="empty-state-title">页面未找到</h2>
            <p class="empty-state-desc">抱歉，您访问的页面 "${Utils.escapeHtml(path)}" 不存在</p>
            <a href="#/" class="btn btn-primary">返回首页</a>
          </div>
        </div>
      `;
    }
  },

  /**
   * 处理错误
   */
  handleError(error) {
    const container = document.getElementById('mainContent');
    if (container) {
      container.innerHTML = `
        <div class="page-container">
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h2 class="empty-state-title">出错了</h2>
            <p class="empty-state-desc">${Utils.escapeHtml(error.message || '页面加载失败')}</p>
            <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
          </div>
        </div>
      `;
    }
  },

  /**
   * 初始化路由
   */
  init() {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.handleRouteChange());
    
    // 初始加载
    this.handleRouteChange();
  }
};

// 导出到全局
window.Router = Router;
