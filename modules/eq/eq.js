/**
 * eq.js - 情商测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const EQ = {
  questions: [],
  currentIndex: 0,
  answers: [],
  testId: null,
  isTransitioning: false,

  // 李克特5点量表选项
  scaleOptions: [
    { value: 1, label: '非常不同意' },
    { value: 2, label: '不同意' },
    { value: 3, label: '中立' },
    { value: 4, label: '同意' },
    { value: 5, label: '非常同意' }
  ],

  // 维度定义
  dimensions: {
    SA: { name: '自我认知', icon: '🔍', color: '#8b5cf6', description: '了解自己的情绪、优势和局限' },
    SM: { name: '自我管理', icon: '🎯', color: '#10b981', description: '调节和控制自己的情绪反应' },
    MO: { name: '自我激励', icon: '🔥', color: '#f59e0b', description: '保持动力和积极心态' },
    EM: { name: '共情能力', icon: '💗', color: '#ec4899', description: '理解和感受他人的情绪' },
    SS: { name: '社交技巧', icon: '🤝', color: '#6366f1', description: '有效地与他人互动和沟通' }
  },

  // EQ等级定义
  levels: [
    { min: 0, max: 40, name: '待提升', color: '#ef4444', description: '情商有较大的提升空间，建议关注情绪管理和人际交往的学习' },
    { min: 40, max: 60, name: '一般', color: '#f59e0b', description: '情商处于平均水平，在某些方面表现良好，但仍有成长空间' },
    { min: 60, max: 80, name: '良好', color: '#10b981', description: '情商较高，能够较好地管理情绪和人际关系' },
    { min: 80, max: 100, name: '优秀', color: '#8b5cf6', description: '情商出色，在情绪管理和社交方面表现突出' }
  ],

  /**
   * 初始化测试
   */
  init() {
    this.questions = Utils.shuffle([...EQQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('eqQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 更新进度
    document.getElementById('eqProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('eqProgressBar').style.width = `${progress}%`;

    // 渲染题目（5点量表）
    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option" onclick="EQ.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="EQ.prevQuestion()" 
                  ${this.currentIndex === 0 ? 'disabled' : ''}>
            上一题
          </button>
          <span class="text-tertiary" style="font-size: var(--font-size-sm);">
            点击选项自动跳转下一题
          </span>
          <span class="text-secondary" style="min-width: 80px; text-align: right;">
            ${this.currentIndex + 1} / ${this.questions.length}
          </span>
        </div>
      </div>
    `;

    // 如果之前已经回答过这题，恢复选择状态
    if (this.answers[this.currentIndex] !== undefined) {
      this.highlightOption(this.answers[this.currentIndex]);
    }
  },

  /**
   * 选择选项（自动跳转下一题）
   */
  selectOption(value) {
    if (this.isTransitioning) return;
    
    this.answers[this.currentIndex] = value;
    this.highlightOption(value);
    this.isTransitioning = true;

    setTimeout(() => {
      this.isTransitioning = false;
      
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.renderQuestion();
      } else {
        this.completeTest();
      }
    }, 300);
  },

  /**
   * 高亮选中的选项
   */
  highlightOption(value) {
    document.querySelectorAll('.scale-option').forEach(item => {
      item.classList.remove('selected');
    });

    const selected = document.querySelector(`.scale-option[data-value="${value}"]`);
    if (selected) {
      selected.classList.add('selected');
    }
  },

  /**
   * 上一题
   */
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderQuestion();
    }
  },

  /**
   * 计算测试结果
   */
  calculateResult() {
    const scores = { SA: 0, SM: 0, MO: 0, EM: 0, SS: 0 };
    const counts = { SA: 0, SM: 0, MO: 0, EM: 0, SS: 0 };

    this.questions.forEach((question, index) => {
      let score = this.answers[index];
      if (score === undefined) return;

      // 反向计分
      if (question.reversed) {
        score = 6 - score;
      }

      scores[question.dimension] += score;
      counts[question.dimension]++;
    });

    // 计算各维度百分比 (8题 * 5分 = 40满分)
    const dimensionScores = {};
    let totalScore = 0;
    let totalCount = 0;

    Object.keys(scores).forEach(dim => {
      dimensionScores[dim] = Math.round((scores[dim] / (counts[dim] * 5)) * 100);
      totalScore += scores[dim];
      totalCount += counts[dim];
    });

    // 计算总体EQ分数
    const overallScore = Math.round((totalScore / (totalCount * 5)) * 100);

    // 确定EQ等级
    const level = this.levels.find(l => overallScore >= l.min && overallScore < l.max) || this.levels[this.levels.length - 1];

    return {
      overallScore,
      level,
      dimensionScores,
      strengths: this.getStrengths(dimensionScores),
      improvements: this.getImprovements(dimensionScores)
    };
  },

  /**
   * 获取优势维度
   */
  getStrengths(scores) {
    return Object.entries(scores)
      .filter(([_, score]) => score >= 70)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([dim]) => dim);
  },

  /**
   * 获取待提升维度
   */
  getImprovements(scores) {
    return Object.entries(scores)
      .filter(([_, score]) => score < 50)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([dim]) => dim);
  },

  /**
   * 完成测试
   */
  async completeTest() {
    const result = this.calculateResult();
    
    // 询问是否保存结果
    const shouldSave = await Utils.confirm(
      '测试完成！是否保存本次测试结果？\n\n如果本次测试非本人操作，可选择不保存。',
      '保存测试结果'
    );

    if (!shouldSave) {
      Utils.showToast('测试结果未保存', 'info');
      Router.navigate('/test');
      return;
    }

    Utils.showLoading('正在保存...');

    // 保存测试结果
    const testData = {
      id: this.testId,
      type: 'eq',
      timestamp: Date.now(),
      result,
      answers: this.answers.map((answer, index) => ({
        questionId: this.questions[index].id,
        answer
      }))
    };

    await Storage.saveTest(testData);

    // 更新用户画像
    await Storage.updateProfile({
      eqScore: result.overallScore,
      eqLevel: result.level.name,
      eqDimensions: result.dimensionScores
    });

    Utils.hideLoading();

    // 跳转到报告页面
    Router.navigate(`/report/${this.testId}`);
  },

  /**
   * 获取维度描述
   */
  getDimensionDescription(dimension, score) {
    const descriptions = {
      SA: {
        low: '你可能需要更多地关注和了解自己的情绪变化',
        medium: '你对自己有一定的了解，但还可以更深入',
        high: '你非常了解自己，能清晰地认识自己的情绪和特点'
      },
      SM: {
        low: '情绪管理可能是你的挑战领域',
        medium: '你能在一定程度上管理情绪，但仍有提升空间',
        high: '你善于调节情绪，能在各种情况下保持冷静'
      },
      MO: {
        low: '你可能需要找到更强的内在动力',
        medium: '你有一定的自我激励能力',
        high: '你充满动力，能持续追求目标'
      },
      EM: {
        low: '理解他人的感受可能对你来说有些困难',
        medium: '你能理解他人，但有时可能会忽略细节',
        high: '你非常善解人意，能敏锐地察觉他人的情绪'
      },
      SS: {
        low: '社交技巧是你可以着重提升的领域',
        medium: '你具备基本的社交能力',
        high: '你是社交高手，善于与人交往和沟通'
      }
    };

    const level = score < 50 ? 'low' : score < 70 ? 'medium' : 'high';
    return descriptions[dimension][level];
  }
};

// 导出到全局
window.EQ = EQ;
