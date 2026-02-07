/**
 * values.js - 价值观测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const Values = {
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

  // 价值维度定义
  dimensions: {
    AC: { name: '成就', icon: '🏆', color: '#f59e0b', description: '追求个人成功和能力展示' },
    HE: { name: '享乐', icon: '🎉', color: '#ec4899', description: '追求愉悦和感官满足' },
    SD: { name: '自主', icon: '🦅', color: '#8b5cf6', description: '独立思考和自由行动' },
    SE: { name: '安全', icon: '🛡️', color: '#10b981', description: '追求稳定和秩序' },
    BE: { name: '仁慈', icon: '💗', color: '#ef4444', description: '关心身边人的福祉' },
    UN: { name: '普世', icon: '🌍', color: '#06b6d4', description: '关心所有人和自然' },
    TR: { name: '传统', icon: '📜', color: '#84cc16', description: '尊重文化和传统习俗' },
    PO: { name: '权力', icon: '👑', color: '#f97316', description: '追求社会地位和控制力' },
    ST: { name: '刺激', icon: '⚡', color: '#a855f7', description: '追求新奇和挑战' },
    CO: { name: '从众', icon: '🤝', color: '#6366f1', description: '遵守社会规范和期望' }
  },

  /**
   * 初始化测试
   */
  init() {
    this.questions = Utils.shuffle([...ValuesQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('valuesQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 更新进度
    document.getElementById('valuesProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('valuesProgressBar').style.width = `${progress}%`;

    // 渲染题目（5点量表）
    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option" onclick="Values.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="Values.prevQuestion()" 
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
    const scores = {};
    const counts = {};

    // 初始化
    Object.keys(this.dimensions).forEach(dim => {
      scores[dim] = 0;
      counts[dim] = 0;
    });

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

    // 计算各维度百分比 (3题 * 5分 = 15满分)
    const dimensionScores = {};
    Object.keys(scores).forEach(dim => {
      dimensionScores[dim] = Math.round((scores[dim] / (counts[dim] * 5)) * 100);
    });

    // 获取排名
    const ranked = Object.entries(dimensionScores)
      .sort((a, b) => b[1] - a[1])
      .map(([dim, score], index) => ({
        dimension: dim,
        score,
        rank: index + 1,
        info: this.dimensions[dim]
      }));

    // Top 3 核心价值观
    const coreValues = ranked.slice(0, 3);

    // 价值观类型分析
    const valueProfile = this.analyzeProfile(dimensionScores);

    return {
      dimensionScores,
      ranked,
      coreValues,
      valueProfile
    };
  },

  /**
   * 分析价值观类型
   */
  analyzeProfile(scores) {
    // 基于Schwartz理论的价值观圆环：
    // 自我超越(BE, UN) vs 自我提升(AC, PO)
    // 保守(SE, CO, TR) vs 开放变革(SD, ST, HE)

    const selfTranscendence = (scores.BE + scores.UN) / 2;
    const selfEnhancement = (scores.AC + scores.PO) / 2;
    const conservation = (scores.SE + scores.CO + scores.TR) / 3;
    const openness = (scores.SD + scores.ST + scores.HE) / 3;

    let primaryOrientation, secondaryOrientation;

    if (selfTranscendence > selfEnhancement) {
      primaryOrientation = { name: '利他导向', desc: '你关注他人福祉和社会和谐', score: selfTranscendence };
    } else {
      primaryOrientation = { name: '成就导向', desc: '你追求个人成功和影响力', score: selfEnhancement };
    }

    if (openness > conservation) {
      secondaryOrientation = { name: '开放求变', desc: '你欢迎改变和新体验', score: openness };
    } else {
      secondaryOrientation = { name: '稳定保守', desc: '你重视传统和安全', score: conservation };
    }

    return {
      selfTranscendence: Math.round(selfTranscendence),
      selfEnhancement: Math.round(selfEnhancement),
      conservation: Math.round(conservation),
      openness: Math.round(openness),
      primaryOrientation,
      secondaryOrientation
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
      type: 'values',
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
      coreValues: result.coreValues.map(v => v.dimension),
      valueDimensions: result.dimensionScores
    });

    Utils.hideLoading();

    // 跳转到报告页面
    Router.navigate(`/report/${this.testId}`);
  }
};

// 导出到全局
window.Values = Values;
