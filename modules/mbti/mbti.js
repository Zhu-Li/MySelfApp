/**
 * mbti.js - MBTI 测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const MBTI = {
  questions: [],
  currentIndex: 0,
  answers: [],
  testId: null,
  shuffled: false,
  isTransitioning: false,

  /**
   * 初始化测试
   */
  init() {
    // 打乱题目顺序
    this.questions = Utils.shuffle([...MBTIQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.shuffled = true;
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('mbtiQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 更新进度
    document.getElementById('mbtiProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('mbtiProgressBar').style.width = `${progress}%`;

    // 渲染题目
    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6;">
          ${question.question}
        </h3>
        
        <div class="option-list">
          <div class="option-item" onclick="MBTI.selectOption('A')" data-option="A">
            <div class="option-marker">A</div>
            <div class="option-content">
              <div class="option-label">${question.optionA}</div>
            </div>
          </div>
          
          <div class="option-item" onclick="MBTI.selectOption('B')" data-option="B">
            <div class="option-marker">B</div>
            <div class="option-content">
              <div class="option-label">${question.optionB}</div>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="MBTI.prevQuestion()" 
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
    if (this.answers[this.currentIndex]) {
      this.highlightOption(this.answers[this.currentIndex]);
    }
  },

  /**
   * 选择选项（自动跳转下一题）
   */
  selectOption(option) {
    // 防止重复点击
    if (this.isTransitioning) return;
    
    // 保存答案
    this.answers[this.currentIndex] = option;

    // 更新UI
    this.highlightOption(option);

    // 标记正在过渡
    this.isTransitioning = true;

    // 延迟300ms后自动跳转，让用户看到选中效果
    setTimeout(() => {
      this.isTransitioning = false;
      
      if (this.currentIndex < this.questions.length - 1) {
        // 下一题
        this.currentIndex++;
        this.renderQuestion();
      } else {
        // 最后一题，完成测试
        this.completeTest();
      }
    }, 300);
  },

  /**
   * 高亮选中的选项
   */
  highlightOption(option) {
    // 移除所有选中状态
    document.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('selected');
    });

    // 添加选中状态
    const selected = document.querySelector(`.option-item[data-option="${option}"]`);
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
   * 下一题
   */
  async nextQuestion() {
    if (!this.answers[this.currentIndex]) {
      Utils.showToast('请选择一个选项', 'warning');
      return;
    }

    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      // 完成测试
      await this.completeTest();
    }
  },

  /**
   * 计算测试结果
   */
  calculateResult() {
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // 统计各维度得分
    this.questions.forEach((question, index) => {
      const answer = this.answers[index];
      if (!answer) return;

      const dimension = question.dimension;
      const first = dimension.charAt(0);  // E, S, T, J
      const second = dimension.charAt(1); // I, N, F, P

      if (answer === 'A') {
        scores[first]++;
      } else {
        scores[second]++;
      }
    });

    // 计算百分比
    const totalEI = scores.E + scores.I;
    const totalSN = scores.S + scores.N;
    const totalTF = scores.T + scores.F;
    const totalJP = scores.J + scores.P;

    const dimensions = {
      E: Math.round((scores.E / totalEI) * 100),
      I: Math.round((scores.I / totalEI) * 100),
      S: Math.round((scores.S / totalSN) * 100),
      N: Math.round((scores.N / totalSN) * 100),
      T: Math.round((scores.T / totalTF) * 100),
      F: Math.round((scores.F / totalTF) * 100),
      J: Math.round((scores.J / totalJP) * 100),
      P: Math.round((scores.P / totalJP) * 100)
    };

    // 确定类型
    const type = 
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P');

    return {
      type,
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
      // 计算结果
      const result = this.calculateResult();

      // 保存测试记录
      const testData = {
        id: this.testId,
        type: 'mbti',
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
        mbti: {
          type: result.type,
          dimensions: result.dimensions,
          testId: this.testId,
          timestamp: Date.now()
        }
      });

      Utils.hideLoading();

      // 跳转到结果页
      Router.navigate(`/report/${this.testId}`);

    } catch (error) {
      Utils.hideLoading();
      console.error('完成测试失败:', error);
      Utils.showToast('保存结果失败，请重试', 'error');
    }
  },

  /**
   * 获取类型详细描述
   */
  getTypeDescription(type) {
    const descriptions = {
      'INTJ': {
        title: '建筑师',
        summary: '富有想象力和战略性的思想家，一切皆在计划之中。',
        traits: ['战略思维', '独立自主', '追求完美', '高标准', '创新思维']
      },
      'INTP': {
        title: '逻辑学家',
        summary: '创新的发明家，对知识有着永无止境的渴求。',
        traits: ['逻辑思维', '好奇心强', '理论分析', '独立思考', '客观公正']
      },
      'ENTJ': {
        title: '指挥官',
        summary: '大胆、富有想象力且意志强大的领导者，总能找到或创造出解决方法。',
        traits: ['领导力强', '果断决策', '高效执行', '战略规划', '自信坚定']
      },
      'ENTP': {
        title: '辩论家',
        summary: '聪明好奇的思想者，不会放过任何智力挑战。',
        traits: ['思维敏捷', '善于辩论', '创新思维', '适应力强', '享受挑战']
      },
      'INFJ': {
        title: '提倡者',
        summary: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。',
        traits: ['洞察力强', '理想主义', '同理心', '追求意义', '坚持原则']
      },
      'INFP': {
        title: '调停者',
        summary: '诗意、善良的利他主义者，总是热情地为正义事业提供帮助。',
        traits: ['理想主义', '同理心强', '创造力', '真诚热情', '追求和谐']
      },
      'ENFJ': {
        title: '主人公',
        summary: '富有魅力且鼓舞人心的领导者，能够鼓舞听众。',
        traits: ['感染力强', '善于激励', '关心他人', '组织能力', '远见卓识']
      },
      'ENFP': {
        title: '竞选者',
        summary: '热情、有创造力、社交能力强的自由精神，总能找到理由微笑。',
        traits: ['热情洋溢', '创造力强', '善于交际', '乐观积极', '适应力强']
      },
      'ISTJ': {
        title: '物流师',
        summary: '实际、注重事实的人，其可靠性是无可质疑的。',
        traits: ['责任感强', '条理分明', '实际可靠', '坚持原则', '注重细节']
      },
      'ISFJ': {
        title: '守卫者',
        summary: '非常专注且温暖的守护者，时刻准备着保护亲人。',
        traits: ['体贴周到', '责任心强', '踏实可靠', '忠诚奉献', '注重传统']
      },
      'ESTJ': {
        title: '总经理',
        summary: '出色的管理者，在管理事物或人的方面无与伦比。',
        traits: ['组织能力', '实际高效', '坚持原则', '责任感强', '决策果断']
      },
      'ESFJ': {
        title: '执政官',
        summary: '极有同情心、爱交际、受欢迎的人，总是热心助人。',
        traits: ['热心助人', '善于交际', '责任感强', '注重和谐', '关心他人']
      },
      'ISTP': {
        title: '鉴赏家',
        summary: '大胆而实际的实验家，擅长使用各种形式的工具。',
        traits: ['实践能力', '冷静理性', '适应力强', '独立自主', '动手能力']
      },
      'ISFP': {
        title: '探险家',
        summary: '灵活有魅力的艺术家，时刻准备着探索和体验新事物。',
        traits: ['艺术气质', '感性敏锐', '灵活随和', '善良温和', '活在当下']
      },
      'ESTP': {
        title: '企业家',
        summary: '聪明、精力充沛、善于察觉的人，真正享受生活在边缘。',
        traits: ['行动力强', '善于察觉', '灵活应变', '精力充沛', '注重实际']
      },
      'ESFP': {
        title: '表演者',
        summary: '自发的、精力充沛的艺人——生活在他们周围永远不会无聊。',
        traits: ['热情开朗', '善于表现', '享受生活', '慷慨大方', '活在当下']
      }
    };

    return descriptions[type] || {
      title: type,
      summary: '独特的性格类型',
      traits: []
    };
  }
};

// 导出到全局
window.MBTI = MBTI;
