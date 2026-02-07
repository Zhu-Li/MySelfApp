/**
 * attachment.js - 依恋类型测试逻辑
 * 观己 - 静观己心，内外澄明
 */

const Attachment = {
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

  // 依恋类型定义
  attachmentTypes: {
    secure: {
      name: '安全型',
      icon: '🛡️',
      color: '#10b981',
      description: '你对亲密关系持有积极的态度，能够舒适地与他人建立深层联系，同时保持健康的独立性。',
      traits: ['信任他人', '情感稳定', '善于沟通', '独立且亲密'],
      advice: '继续保持这种健康的关系模式，你的安全感会为关系带来稳定的基础。'
    },
    anxious: {
      name: '焦虑型',
      icon: '💓',
      color: '#f59e0b',
      description: '你渴望亲密和认可，对关系投入很多情感，但有时会担心伴侣的感情和关系的稳定性。',
      traits: ['情感敏感', '渴望亲密', '需要确认', '关注细节'],
      advice: '尝试建立自我价值感，学会自我安抚，理解对方也需要独处时间。'
    },
    avoidant: {
      name: '回避型',
      icon: '🏔️',
      color: '#6366f1',
      description: '你重视独立和自主，在情感上比较自给自足，有时可能会避免过于亲密的关系。',
      traits: ['独立自主', '情感克制', '重视边界', '自我依赖'],
      advice: '尝试适当敞开心扉，信任他人可以成为力量的来源，而非弱点。'
    },
    fearful: {
      name: '恐惧型',
      icon: '🌊',
      color: '#ec4899',
      description: '你既渴望亲密关系，又害怕被伤害，这种矛盾的心态可能让你在关系中感到困惑。',
      traits: ['内心矛盾', '渴望又恐惧', '敏感警觉', '需要安全感'],
      advice: '慢慢建立信任，接受过去的经历，理解健康的关系是可以实现的。'
    }
  },

  /**
   * 初始化测试
   */
  init() {
    this.questions = Utils.shuffle([...AttachmentQuestions]);
    this.currentIndex = 0;
    this.answers = [];
    this.testId = Utils.generateId();
    this.isTransitioning = false;
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const container = document.getElementById('attachmentQuestionArea');
    if (!container) return;

    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;

    // 更新进度
    document.getElementById('attachmentProgress').textContent = 
      `第 ${this.currentIndex + 1} 题 / 共 ${this.questions.length} 题`;
    document.getElementById('attachmentProgressBar').style.width = `${progress}%`;

    // 渲染题目（5点量表）
    container.innerHTML = `
      <div class="animate-fade-in">
        <h3 class="font-semibold mb-xl" style="font-size: var(--font-size-xl); line-height: 1.6; text-align: center;">
          ${question.question}
        </h3>
        
        <div class="scale-options">
          ${this.scaleOptions.map(opt => `
            <div class="scale-option" onclick="Attachment.selectOption(${opt.value})" data-value="${opt.value}">
              <div class="scale-marker">${opt.value}</div>
              <div class="scale-label">${opt.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between mt-xl" style="align-items: center;">
          <button class="btn btn-secondary" onclick="Attachment.prevQuestion()" 
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
    const scores = { anxiety: 0, avoidance: 0 };
    const counts = { anxiety: 0, avoidance: 0 };

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

    // 计算百分比 (15题 * 5分 = 75满分)
    const anxietyPercent = Math.round((scores.anxiety / (counts.anxiety * 5)) * 100);
    const avoidancePercent = Math.round((scores.avoidance / (counts.avoidance * 5)) * 100);

    // 确定依恋类型 (以50%为分界线)
    const highAnxiety = anxietyPercent > 50;
    const highAvoidance = avoidancePercent > 50;

    let type;
    if (!highAnxiety && !highAvoidance) {
      type = 'secure';
    } else if (highAnxiety && !highAvoidance) {
      type = 'anxious';
    } else if (!highAnxiety && highAvoidance) {
      type = 'avoidant';
    } else {
      type = 'fearful';
    }

    return {
      type,
      typeInfo: this.attachmentTypes[type],
      dimensions: {
        anxiety: anxietyPercent,
        avoidance: avoidancePercent
      }
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
      type: 'attachment',
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
      attachmentType: result.type,
      attachmentDimensions: result.dimensions
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
      anxiety: {
        low: { level: '低', description: '你在关系中感到安全，很少担心被抛弃或不被爱。' },
        medium: { level: '中', description: '你有时会担心关系的稳定性，但总体上能够保持平衡。' },
        high: { level: '高', description: '你经常担心伴侣的感情，渴望更多的确认和亲密。' }
      },
      avoidance: {
        low: { level: '低', description: '你乐于与他人建立亲密关系，能够轻松地信任和依赖他人。' },
        medium: { level: '中', description: '你在亲密和独立之间保持着一定的平衡。' },
        high: { level: '高', description: '你更重视独立，在情感上倾向于自给自足。' }
      }
    };

    const level = score <= 35 ? 'low' : score <= 65 ? 'medium' : 'high';
    return descriptions[dimension][level];
  }
};

// 导出到全局
window.Attachment = Attachment;
