/**
 * appStore.js - 轻量级状态管理
 * 观己 - 静观己心，内外澄明
 * 
 * 基于发布订阅模式的简单状态管理
 */

const AppStore = {
  // 状态存储
  state: {
    // 用户信息
    user: {
      isLoggedIn: false,
      profile: null,
      settings: {}
    },
    
    // 应用状态
    app: {
      isLoading: false,
      currentPage: 'home',
      theme: 'light',
      sidebarOpen: false,
      modalOpen: false
    },
    
    // 测试状态
    tests: {
      currentTest: null,
      answers: {},
      progress: {}
    },
    
    // 日记状态
    diary: {
      currentEntry: null,
      entries: [],
      filters: {}
    },
    
    // 关系网状态
    contacts: {
      list: [],
      currentContact: null,
      filters: {}
    },
    
    // 缓存数据
    cache: {
      testResults: {},
      aiResponses: {},
      lastSync: null
    }
  },

  // 订阅者存储
  listeners: new Map(),

  // 持久化配置
  persistConfig: {
    keys: ['user.settings', 'app.theme'],
    storageKey: 'guanji_app_state'
  },

  /**
   * 初始化状态管理
   */
  init() {
    this.loadPersistedState();
    console.log('[AppStore] 初始化完成');
  },

  /**
   * 获取状态
   * @param {string} path - 状态路径，如 'user.profile'
   * @param {*} defaultValue - 默认值
   * @returns {*} 状态值
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.state;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      value = value[key];
    }
    
    return value !== undefined ? value : defaultValue;
  },

  /**
   * 设置状态
   * @param {string} path - 状态路径
   * @param {*} value - 新值
   * @param {Object} options - 选项
   */
  set(path, value, options = {}) {
    const { silent = false, persist = true } = options;
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    // 获取父对象
    let target = this.state;
    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }
    
    // 获取旧值
    const oldValue = target[lastKey];
    
    // 如果值没有变化，不触发更新
    if (oldValue === value) {
      return;
    }
    
    // 设置新值
    target[lastKey] = value;
    
    // 触发订阅
    if (!silent) {
      this.notify(path, value, oldValue);
    }
    
    // 持久化
    if (persist && this.shouldPersist(path)) {
      this.persistState();
    }
  },

  /**
   * 订阅状态变化
   * @param {string} path - 状态路径
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    
    this.listeners.get(path).add(callback);
    
    // 立即返回当前值
    callback(this.get(path));
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  },

  /**
   * 通知订阅者
   * @param {string} path - 状态路径
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  notify(path, newValue, oldValue) {
    // 通知精确路径的订阅者
    const exactListeners = this.listeners.get(path);
    if (exactListeners) {
      exactListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('[AppStore] 订阅者执行错误:', error);
        }
      });
    }
    
    // 通知父路径的订阅者
    const parentPaths = this.getParentPaths(path);
    for (const parentPath of parentPaths) {
      const parentListeners = this.listeners.get(parentPath);
      if (parentListeners) {
        const parentValue = this.get(parentPath);
        parentListeners.forEach(callback => {
          try {
            callback(parentValue, null, path);
          } catch (error) {
            console.error('[AppStore] 订阅者执行错误:', error);
          }
        });
      }
    }
  },

  /**
   * 获取父路径列表
   * @param {string} path - 完整路径
   * @returns {string[]} 父路径列表
   */
  getParentPaths(path) {
    const keys = path.split('.');
    const parents = [];
    
    for (let i = 1; i < keys.length; i++) {
      parents.push(keys.slice(0, i).join('.'));
    }
    
    return parents;
  },

  /**
   * 判断是否应该持久化
   * @param {string} path - 状态路径
   * @returns {boolean}
   */
  shouldPersist(path) {
    return this.persistConfig.keys.some(key => 
      path === key || path.startsWith(key + '.')
    );
  },

  /**
   * 持久化状态
   */
  persistState() {
    try {
      const stateToPersist = {};
      
      for (const key of this.persistConfig.keys) {
        stateToPersist[key] = this.get(key);
      }
      
      localStorage.setItem(
        this.persistConfig.storageKey,
        JSON.stringify(stateToPersist)
      );
    } catch (error) {
      console.error('[AppStore] 持久化失败:', error);
    }
  },

  /**
   * 加载持久化状态
   */
  loadPersistedState() {
    try {
      const persisted = localStorage.getItem(this.persistConfig.storageKey);
      if (persisted) {
        const state = JSON.parse(persisted);
        
        for (const [key, value] of Object.entries(state)) {
          this.set(key, value, { silent: true, persist: false });
        }
      }
    } catch (error) {
      console.error('[AppStore] 加载持久化状态失败:', error);
    }
  },

  /**
   * 批量更新状态
   * @param {Object} updates - 更新对象
   * @param {Object} options - 选项
   */
  batch(updates, options = {}) {
    const { silent = false } = options;
    
    // 暂存旧值
    const oldValues = {};
    
    // 应用所有更新
    for (const [path, value] of Object.entries(updates)) {
      oldValues[path] = this.get(path);
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      let target = this.state;
      for (const key of keys) {
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      
      target[lastKey] = value;
    }
    
    // 触发通知
    if (!silent) {
      for (const [path, value] of Object.entries(updates)) {
        this.notify(path, value, oldValues[path]);
      }
    }
    
    // 持久化
    this.persistState();
  },

  /**
   * 重置状态
   * @param {string} path - 状态路径，为空则重置全部
   */
  reset(path = null) {
    if (path) {
      this.set(path, null);
    } else {
      // 重置整个状态树
      this.state = {
        user: { isLoggedIn: false, profile: null, settings: {} },
        app: { isLoading: false, currentPage: 'home', theme: 'light', sidebarOpen: false, modalOpen: false },
        tests: { currentTest: null, answers: {}, progress: {} },
        diary: { currentEntry: null, entries: [], filters: {} },
        contacts: { list: [], currentContact: null, filters: {} },
        cache: { testResults: {}, aiResponses: {}, lastSync: null }
      };
      this.listeners.clear();
      this.persistState();
    }
  },

  /**
   * 创建计算属性
   * @param {Function} getter - 计算函数
   * @returns {Object} { get, subscribe }
   */
  computed(getter) {
    return {
      get: () => getter(this.state),
      subscribe: (callback) => {
        // 简化的实现，实际应该追踪依赖
        const value = getter(this.state);
        callback(value);
        return () => {};
      }
    };
  }
};

// 初始化
AppStore.init();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppStore;
}
