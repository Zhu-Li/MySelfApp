/**
 * testProgress.js - 测试进度管理模块
 * 观己 - 静观己心，内外澄明
 * 
 * 提供测试进度保存、恢复、过期清理等功能
 */

const TestProgress = {
  // 存储键前缀
  STORAGE_KEY_PREFIX: 'guanji_test_progress_',
  
  // 进度过期时间（7天）
  EXPIRE_DAYS: 7,
  
  // 自动保存间隔（毫秒）
  AUTO_SAVE_INTERVAL: 30000, // 30秒
  
  // 当前测试状态
  currentTest: null,
  
  // 自动保存定时器
  autoSaveTimer: null,

  /**
   * 初始化
   */
  init() {
    this.cleanupExpiredProgress();
    console.log('[TestProgress] 初始化完成');
  },

  /**
   * 保存测试进度
   * @param {string} testType - 测试类型（mbti, bigfive, holland 等）
   * @param {Array} answers - 答题结果数组
   * @param {number} currentIndex - 当前题目索引
   * @param {Object} extraData - 额外数据
   */
  save(testType, answers, currentIndex, extraData = {}) {
    if (!testType || !Array.isArray(answers)) {
      console.warn('[TestProgress] 保存失败：参数无效');
      return false;
    }

    try {
      const progressData = {
        testType,
        answers,
        currentIndex,
        totalQuestions: extraData.totalQuestions || answers.length,
        timestamp: Date.now(),
        version: '1.0',
        extraData
      };

      const key = this.getStorageKey(testType);
      localStorage.setItem(key, JSON.stringify(progressData));
      
      console.log(`[TestProgress] ${testType} 进度已保存：${currentIndex + 1}/${progressData.totalQuestions}`);
      return true;
    } catch (error) {
      console.error('[TestProgress] 保存失败:', error);
      return false;
    }
  },

  /**
   * 加载测试进度
   * @param {string} testType - 测试类型
   * @returns {Object|null} 进度数据
   */
  load(testType) {
    try {
      const key = this.getStorageKey(testType);
      const saved = localStorage.getItem(key);
      
      if (!saved) {
        return null;
      }

      const data = JSON.parse(saved);
      
      // 检查是否过期
      if (this.isExpired(data.timestamp)) {
        console.log(`[TestProgress] ${testType} 进度已过期，已清除`);
        this.clear(testType);
        return null;
      }

      // 验证数据完整性
      if (!this.validateData(data)) {
        console.warn(`[TestProgress] ${testType} 进度数据无效，已清除`);
        this.clear(testType);
        return null;
      }

      console.log(`[TestProgress] ${testType} 进度已恢复：${data.currentIndex + 1}/${data.totalQuestions}`);
      return data;
    } catch (error) {
      console.error('[TestProgress] 加载失败:', error);
      return null;
    }
  },

  /**
   * 清除测试进度
   * @param {string} testType - 测试类型
   */
  clear(testType) {
    try {
      const key = this.getStorageKey(testType);
      localStorage.removeItem(key);
      console.log(`[TestProgress] ${testType} 进度已清除`);
    } catch (error) {
      console.error('[TestProgress] 清除失败:', error);
    }
  },

  /**
   * 检查是否有保存的进度
   * @param {string} testType - 测试类型
   * @returns {boolean}
   */
  hasProgress(testType) {
    return this.load(testType) !== null;
  },

  /**
   * 获取进度摘要
   * @param {string} testType - 测试类型
   * @returns {Object|null} 进度摘要
   */
  getSummary(testType) {
    const data = this.load(testType);
    if (!data) return null;

    const progress = ((data.currentIndex + 1) / data.totalQuestions * 100).toFixed(0);
    const remaining = data.totalQuestions - data.currentIndex - 1;
    const savedTime = new Date(data.timestamp).toLocaleString('zh-CN');

    return {
      testType: data.testType,
      progress: parseInt(progress),
      currentQuestion: data.currentIndex + 1,
      totalQuestions: data.totalQuestions,
      remainingQuestions: remaining,
      savedTime,
      isCompleted: data.currentIndex >= data.totalQuestions - 1
    };
  },

  /**
   * 开始测试
   * @param {string} testType - 测试类型
   * @param {Object} options - 选项
   */
  startTest(testType, options = {}) {
    const { totalQuestions, resume = true } = options;
    
    this.currentTest = {
      type: testType,
      startTime: Date.now(),
      answers: [],
      currentIndex: 0,
      totalQuestions
    };

    // 检查是否有保存的进度
    if (resume) {
      const saved = this.load(testType);
      if (saved) {
        return {
          hasProgress: true,
          progress: saved,
          summary: this.getSummary(testType)
        };
      }
    }

    // 启动自动保存
    this.startAutoSave();

    return { hasProgress: false };
  },

  /**
   * 更新答案
   * @param {number} index - 题目索引
   * @param {*} answer - 答案
   */
  updateAnswer(index, answer) {
    if (!this.currentTest) return;

    this.currentTest.answers[index] = answer;
    this.currentTest.currentIndex = index;
  },

  /**
   * 完成测试
   */
  finishTest() {
    if (!this.currentTest) return;

    // 清除进度
    this.clear(this.currentTest.type);
    
    // 停止自动保存
    this.stopAutoSave();
    
    // 记录完成时间
    const duration = Date.now() - this.currentTest.startTime;
    console.log(`[TestProgress] 测试完成，用时：${this.formatDuration(duration)}`);
    
    this.currentTest = null;
  },

  /**
   * 暂停测试（保存进度）
   */
  pauseTest() {
    if (!this.currentTest) return;

    this.save(
      this.currentTest.type,
      this.currentTest.answers,
      this.currentTest.currentIndex,
      { totalQuestions: this.currentTest.totalQuestions }
    );

    this.stopAutoSave();
  },

  /**
   * 启动自动保存
   */
  startAutoSave() {
    this.stopAutoSave();
    
    this.autoSaveTimer = setInterval(() => {
      if (this.currentTest) {
        this.save(
          this.currentTest.type,
          this.currentTest.answers,
          this.currentTest.currentIndex,
          { totalQuestions: this.currentTest.totalQuestions }
        );
      }
    }, this.AUTO_SAVE_INTERVAL);
  },

  /**
   * 停止自动保存
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  },

  /**
   * 获取存储键
   * @param {string} testType - 测试类型
   * @returns {string} 存储键
   */
  getStorageKey(testType) {
    return `${this.STORAGE_KEY_PREFIX}${testType}`;
  },

  /**
   * 检查是否过期
   * @param {number} timestamp - 时间戳
   * @returns {boolean}
   */
  isExpired(timestamp) {
    const expireTime = this.EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > expireTime;
  },

  /**
   * 验证数据完整性
   * @param {Object} data - 进度数据
   * @returns {boolean}
   */
  validateData(data) {
    return (
      data &&
      typeof data.testType === 'string' &&
      Array.isArray(data.answers) &&
      typeof data.currentIndex === 'number' &&
      typeof data.totalQuestions === 'number' &&
      typeof data.timestamp === 'number'
    );
  },

  /**
   * 清理过期进度
   */
  cleanupExpiredProgress() {
    try {
      const keys = Object.keys(localStorage);
      let cleaned = 0;

      for (const key of keys) {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (this.isExpired(data.timestamp)) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch (e) {
            // 数据解析失败，删除
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }

      if (cleaned > 0) {
        console.log(`[TestProgress] 清理了 ${cleaned} 个过期进度`);
      }
    } catch (error) {
      console.error('[TestProgress] 清理失败:', error);
    }
  },

  /**
   * 获取所有保存的进度
   * @returns {Array} 进度列表
   */
  getAllProgress() {
    const progressList = [];
    
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const testType = key.replace(this.STORAGE_KEY_PREFIX, '');
          const summary = this.getSummary(testType);
          if (summary) {
            progressList.push(summary);
          }
        }
      }
    } catch (error) {
      console.error('[TestProgress] 获取失败:', error);
    }

    return progressList.sort((a, b) => 
      new Date(b.savedTime) - new Date(a.savedTime)
    );
  },

  /**
   * 清除所有进度
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      let cleared = 0;

      for (const key of keys) {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
          cleared++;
        }
      }

      console.log(`[TestProgress] 清除了 ${cleared} 个进度`);
    } catch (error) {
      console.error('[TestProgress] 清除失败:', error);
    }
  },

  /**
   * 格式化时长
   * @param {number} ms - 毫秒
   * @returns {string} 格式化后的时长
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
  }
};

// 初始化
TestProgress.init();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestProgress;
}
