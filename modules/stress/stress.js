/**
 * stress.js - 压力/焦虑自测逻辑
 * 观己 - 静观己心，内外澄明
 */

const Stress = {
  questions: [],
  currentIndex: 0,
  answers: [],
  testId: null,
  isTransitioning: false,
  currentScale: 'GAD7', // 当前量表

  // 4点量表选项 (0-3分)
  scaleOptions: [
    { value: 0, label: '完全不会' },
    { value: 1, label: '好几天' },
    { value: 2, label: '一半以上' },
    { value: 3, label: '几乎每天' }
  ],

  // 焦虑等级定义 (GAD-7)
  anxietyLevels: [
    { min: 0, max: 4, name: '正常', color: '#10b981', description: '你的焦虑水平处于正常范围，继续保持良好的心理状态。' },
    { min: 5, max: 9, name: '轻度焦虑', color: '#f59e0b', description: '存在轻度焦虑症状，建议关注自我调节和放松。' },
    { min: 10, max: 14, name: '中度焦虑', color: '#f97316', description: '焦虑症状较为明显，建议寻求专业心理咨询。' },
    { min: 15, max: 21, name: '重度焦虑', color: '#ef4444', description: '焦虑症状严重，强烈建议尽快寻求专业心理帮助。' }
  ],

  // 抑郁等级定义 (PHQ-9)
  depressionLevels: [
    { min: 0, max: 4, name: '正常', color: '#10b981', description: '你的心理状态良好，没有明显的抑郁症状。' },
    { min: 5, max: 9, name: '轻度抑郁', color: '#f59e0b', description: '存在轻度抑郁症状，建议关注情绪变化和自我关爱。' },
    { min: 10, max: 14, name: '中度抑郁', color: '#f97316', description: '抑郁症状较为明显，建议寻求专业心理咨询。' },
    { min: 15, max: 19, name: '中重度抑郁', color: '#dc2626', description: '抑郁症状明显，建议尽快寻求专业心理帮助。' },
    { min: 20, max: 27, name: '重度抑郁', color: '#ef4444', description: '抑郁症状严重，请立即寻求专业心理医生的帮助。' }
  ],

  /**
   * 初始化测试
   */
  init() {
    // 按顺序排列题目：先GAD-7，后PHQ-9
    this.questions = [
      ...StressQuestions.GAD7,
      ...StressQuestions.PHQ9
    ];
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
    this.currentScale = 'GAD7';
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('stressQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 判断当前量表
    const isGAD = question.scale === 'GAD7';
    const scaleTitle = isGAD ? '焦虑自评 (GAD-7)' : '情绪自评 (PHQ-9)';
    const scaleColor = isGAD ? '#f59e0b' : '#6366f1';

    // 更新进度
    document.getElementById('stressProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('stressProgressBar').style.width = `${progress}%`;
    
    // 更新量表标题
    const scaleBadge = document.getElementById('stressScaleBadge');
    if (scaleBadge) {
      scaleBadge.textContent = scaleTitle;
      scaleBadge.style.background = `${scaleColor}20`;
      scaleBadge.style.color = scaleColor;
    }

    // 渲染题目（4点量表）
    container.innerHTML = `
      <div class="animate-fade-in">
        <p class="text-center text-secondary mb-md" style="font-size: var(--font-size-sm);">
          在过去两周内，你有多少时间受到以下问题的困扰？
        </p>
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options scale-options-4">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option scale-option-4" onclick="Stress.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="Stress.prevQuestion()" 
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
    let gadScore = 0;
    let phqScore = 0;

    this.questions.forEach((question, index) => {
      const score = this.answers[index];
      if (score === undefined) return;

      if (question.scale === 'GAD7') {
        gadScore += score;
      } else {
        phqScore += score;
      }
    });

    // 确定等级
    const anxietyLevel = this.anxietyLevels.find(l => gadScore >= l.min && gadScore <= l.max) 
      || this.anxietyLevels[this.anxietyLevels.length - 1];
    const depressionLevel = this.depressionLevels.find(l => phqScore >= l.min && phqScore <= l.max)
      || this.depressionLevels[this.depressionLevels.length - 1];

    // 检查PHQ-9第9题（自杀意念）
    const phq9Index = this.questions.findIndex(q => q.id === 'PHQ9');
    const suicidalIdeation = this.answers[phq9Index] > 0;

    return {
      gadScore,
      phqScore,
      anxietyLevel,
      depressionLevel,
      suicidalIdeation,
      needsProfessionalHelp: gadScore >= 10 || phqScore >= 10 || suicidalIdeation
    };
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
      type: 'stress',
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
      lastStressTest: Date.now(),
      anxietyLevel: result.anxietyLevel.name,
      depressionLevel: result.depressionLevel.name
    });

    Utils.hideLoading();

    // 跳转到报告页面
    Router.navigate(`/report/${this.testId}`);
  }
};

// 导出到全局
window.Stress = Stress;
