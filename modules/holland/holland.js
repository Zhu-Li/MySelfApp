/**
 * holland.js - 霍兰德职业兴趣测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const Holland = {
  questions: [],
  currentIndex: 0,
  answers: [],
  testId: null,
  isTransitioning: false,

  // 李克特5点量表选项
  scaleOptions: [
    { value: 1, label: '非常不符合' },
    { value: 2, label: '不太符合' },
    { value: 3, label: '一般' },
    { value: 4, label: '比较符合' },
    { value: 5, label: '非常符合' }
  ],

  // 维度信息
  dimensions: {
    R: { name: '实际型', icon: '🔧', color: '#ef4444', careers: ['工程师', '技术员', '机械师', '建筑师', '农艺师'] },
    I: { name: '研究型', icon: '🔬', color: '#3b82f6', careers: ['科学家', '研究员', '医生', '程序员', '分析师'] },
    A: { name: '艺术型', icon: '🎨', color: '#a855f7', careers: ['设计师', '艺术家', '作家', '音乐家', '演员'] },
    S: { name: '社会型', icon: '🤝', color: '#22c55e', careers: ['教师', '心理咨询师', '社工', '护士', '培训师'] },
    E: { name: '企业型', icon: '💼', color: '#f59e0b', careers: ['企业家', '销售经理', '律师', '政治家', '市场总监'] },
    C: { name: '常规型', icon: '📊', color: '#6366f1', careers: ['会计', '行政人员', '银行职员', '数据分析', '档案管理'] }
  },

  /**
   * 初始化测试
   */
  init() {
    this.questions = Utils.shuffle([...HollandQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('hollandQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    document.getElementById('hollandProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('hollandProgressBar').style.width = `${progress}%`;

    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option" onclick="Holland.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="Holland.prevQuestion()" 
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

    if (this.answers[this.currentIndex] !== undefined) {
      this.highlightOption(this.answers[this.currentIndex]);
    }
  },

  /**
   * 选择选项
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
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    this.questions.forEach((question, index) => {
      const score = this.answers[index];
      if (score === undefined) return;

      scores[question.dimension] += score;
      counts[question.dimension]++;
    });

    // 计算各维度百分比
    const dimensions = {};
    Object.keys(scores).forEach(dim => {
      const maxScore = counts[dim] * 5;
      dimensions[dim] = Math.round((scores[dim] / maxScore) * 100);
    });

    // 计算 Holland Code（前三个最高维度）
    const sorted = Object.entries(dimensions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const hollandCode = sorted.map(([dim]) => dim).join('');

    return {
      hollandCode,
      dimensions,
      rawScores: scores,
      topThree: sorted.map(([dim, score]) => ({
        code: dim,
        name: this.dimensions[dim].name,
        score
      }))
    };
  },

  /**
   * 完成测试
   */
  async completeTest() {
    Utils.showLoading('正在分析测试结果...');

    try {
      const result = this.calculateResult();

      const testData = {
        id: this.testId,
        type: 'holland',
        timestamp: Date.now(),
        answers: this.answers.map((answer, index) => ({
          questionId: this.questions[index].id,
          answer
        })),
        result
      };

      await Storage.saveTest(testData);

      await Storage.updateProfile({
        holland: {
          hollandCode: result.hollandCode,
          dimensions: result.dimensions,
          testId: this.testId,
          timestamp: Date.now()
        }
      });

      Utils.hideLoading();
      Router.navigate(`/report/${this.testId}`);

    } catch (error) {
      Utils.hideLoading();
      console.error('完成测试失败:', error);
      Utils.showToast('保存结果失败，请重试', 'error');
    }
  },

  /**
   * 获取 Holland Code 描述
   */
  getCodeDescription(code) {
    const descriptions = {
      R: '你喜欢使用工具、机器，从事实际操作性的工作。你动手能力强，注重实际成果。',
      I: '你喜欢思考、分析和研究问题。你对知识和理论有强烈的好奇心，善于解决复杂问题。',
      A: '你富有创造力和想象力，喜欢通过艺术形式表达自己。你追求自由和个性化。',
      S: '你喜欢与人打交道，乐于帮助和服务他人。你善于沟通，具有同理心。',
      E: '你喜欢领导和影响他人，具有较强的说服力和冒险精神。你追求成就和地位。',
      C: '你注重细节和规则，喜欢有条理的工作环境。你做事认真负责，追求准确性。'
    };
    return descriptions[code] || '';
  },

  /**
   * 获取职业建议
   */
  getCareerSuggestions(hollandCode) {
    const firstType = hollandCode.charAt(0);
    const secondType = hollandCode.charAt(1);
    
    // 组合职业建议
    const primary = this.dimensions[firstType]?.careers || [];
    const secondary = this.dimensions[secondType]?.careers || [];
    
    return {
      primary: { type: this.dimensions[firstType]?.name, careers: primary },
      secondary: { type: this.dimensions[secondType]?.name, careers: secondary }
    };
  }
};

// 导出到全局
window.Holland = Holland;
