/**
 * profile.js - 用户画像数据模型
 * 观己 - 静观己心，内外澄明
 */

const Profile = {
  /**
   * 获取完整用户画像
   */
  async getFullProfile() {
    const profile = await Storage.getProfile() || {};
    const tests = await Storage.getAll('tests');
    const diary = await Storage.getAll('diary');

    return {
      ...profile,
      testCount: tests.length,
      diaryCount: diary.length,
      latestTests: tests
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
    };
  },

  /**
   * 获取用户画像摘要
   */
  async getSummary() {
    const profile = await this.getFullProfile();
    
    const summary = {
      hasData: false,
      mbtiType: null,
      mbtiName: null,
      testCount: profile.testCount || 0,
      diaryCount: profile.diaryCount || 0,
      lastUpdated: profile.lastUpdated || null
    };

    if (profile.mbti) {
      summary.hasData = true;
      summary.mbtiType = profile.mbti.type;
      summary.mbtiName = Utils.getMBTIName(profile.mbti.type);
    }

    return summary;
  },

  /**
   * 更新 MBTI 画像
   */
  async updateMBTI(mbtiResult) {
    await Storage.updateProfile({
      mbti: {
        type: mbtiResult.type,
        dimensions: mbtiResult.dimensions,
        confidence: this.calculateConfidence(mbtiResult.dimensions),
        timestamp: Date.now()
      }
    });
  },

  /**
   * 计算结果置信度
   * 基于各维度得分的偏离程度
   */
  calculateConfidence(dimensions) {
    const deviations = [
      Math.abs(dimensions.E - 50),
      Math.abs(dimensions.S - 50),
      Math.abs(dimensions.T - 50),
      Math.abs(dimensions.J - 50)
    ];

    // 平均偏离度越高，置信度越高
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 4;
    // 将 0-50 的偏离度映射到 0.5-1 的置信度
    return 0.5 + (avgDeviation / 100);
  },

  /**
   * 获取用户特质标签
   */
  async getTraitTags() {
    const profile = await Storage.getProfile();
    const tags = [];

    if (profile?.mbti) {
      const typeInfo = MBTI.getTypeDescription(profile.mbti.type);
      tags.push(...typeInfo.traits);
    }

    // 后续可以添加更多来源的标签
    // 如日记分析、其他测试等

    return [...new Set(tags)]; // 去重
  },

  /**
   * 分析用户趋势
   */
  async analyzeTrends() {
    const tests = await Storage.getByIndex('tests', 'type', 'mbti');
    
    if (tests.length < 2) {
      return null; // 数据不足
    }

    // 按时间排序
    tests.sort((a, b) => a.timestamp - b.timestamp);

    // 分析维度变化趋势
    const trends = {
      E: [], I: [],
      S: [], N: [],
      T: [], F: [],
      J: [], P: []
    };

    tests.forEach(test => {
      if (test.result?.dimensions) {
        Object.entries(test.result.dimensions).forEach(([dim, value]) => {
          trends[dim].push({
            value,
            timestamp: test.timestamp
          });
        });
      }
    });

    return trends;
  },

  /**
   * 生成画像报告数据
   */
  async generateReportData() {
    const profile = await this.getFullProfile();
    const summary = await this.getSummary();
    const traits = await this.getTraitTags();
    const trends = await this.analyzeTrends();

    return {
      summary,
      traits,
      trends,
      mbti: profile.mbti || null,
      testHistory: profile.latestTests || [],
      generatedAt: Date.now()
    };
  },

  /**
   * 清除用户画像
   */
  async clear() {
    await Storage.delete('profile', 'userProfile');
  }
};

// 导出到全局
window.Profile = Profile;
