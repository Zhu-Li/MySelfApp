/**
 * bigfive.js - 大五人格测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const BigFive = {
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

  /**
   * 初始化测试
   */
  init() {
    this.questions = Utils.shuffle([...BigFiveQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('bigfiveQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 更新进度
    document.getElementById('bigfiveProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('bigfiveProgressBar').style.width = `${progress}%`;

    // 渲染题目（5点量表）
    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option" onclick="BigFive.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="BigFive.prevQuestion()" 
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
    const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };

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

    // 计算各维度百分比（转换为0-100）
    const dimensions = {};
    Object.keys(scores).forEach(dim => {
      const maxScore = counts[dim] * 5;
      dimensions[dim] = Math.round((scores[dim] / maxScore) * 100);
    });

    return {
      dimensions,
      rawScores: scores
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
        type: 'bigfive',
        timestamp: Date.now(),
        answers: this.answers.map((answer, index) => ({
          questionId: this.questions[index].id,
          answer
        })),
        result
      };

      await Storage.saveTest(testData);

      // 更新用户画像
      await Storage.updateProfile({
        bigfive: {
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
   * 获取维度描述
   */
  getDimensionDescription(dimension, score) {
    const descriptions = {
      O: {
        name: '开放性',
        high: '你富有想象力和创造力，对新事物充满好奇，喜欢探索不同的想法和体验。你欣赏艺术和美学，思维开放且灵活。',
        medium: '你在开放性方面表现均衡，既能接受新事物，也重视传统和稳定。你能在创新和实用之间找到平衡。',
        low: '你倾向于务实和传统，喜欢熟悉和可预测的事物。你注重实际经验，做事脚踏实地。'
      },
      C: {
        name: '尽责性',
        high: '你是一个有组织、有纪律的人，做事认真负责，追求完美。你有很强的自控力和目标导向性，总是努力完成任务。',
        medium: '你在责任心方面表现适中，能够完成重要任务，但也允许自己有一些灵活性和自发性。',
        low: '你倾向于灵活和自发，不喜欢过多的规划和约束。你更注重当下的感受而非长远的目标。'
      },
      E: {
        name: '外向性',
        high: '你是一个活泼、善于社交的人，喜欢与人互动，在社交场合中感到精力充沛。你热情开朗，容易与他人建立联系。',
        medium: '你在社交方面表现均衡，既能享受社交活动，也需要独处的时间来恢复精力。',
        low: '你倾向于内向和安静，喜欢深度的一对一交流而非大型社交活动。你在独处时感到最舒适。'
      },
      A: {
        name: '宜人性',
        high: '你是一个友善、体贴的人，关心他人的感受，乐于助人。你善于合作，容易相处，很少与人发生冲突。',
        medium: '你在人际关系中表现均衡，既能合作也能坚持自己的立场，能够在友善和自我保护之间取得平衡。',
        low: '你倾向于独立和竞争，更注重自己的利益和目标。你可能对他人持怀疑态度，不轻易妥协。'
      },
      N: {
        name: '神经质性',
        high: '你对情绪比较敏感，容易感到焦虑、担忧或情绪波动。在压力下可能会感到不安，需要更多的情感支持。',
        medium: '你的情绪稳定性处于中等水平，能够应对日常压力，但在重大挑战面前可能会感到一些焦虑。',
        low: '你情绪稳定，能够很好地应对压力和挫折。你通常保持冷静和乐观，不容易受到负面情绪的影响。'
      }
    };

    const desc = descriptions[dimension];
    let level = score > 66 ? 'high' : (score > 33 ? 'medium' : 'low');
    
    return {
      name: desc.name,
      description: desc[level],
      level: level === 'high' ? '高' : (level === 'medium' ? '中等' : '低')
    };
  }
};

// 导出到全局
window.BigFive = BigFive;
