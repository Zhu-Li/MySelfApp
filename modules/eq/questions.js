/**
 * questions.js - 情商测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 情商 (EQ) 五维度模型:
 * - SA: Self-Awareness 自我认知
 * - SM: Self-Management 自我管理
 * - MO: Motivation 自我激励
 * - EM: Empathy 共情能力
 * - SS: Social Skills 社交技巧
 */

const EQQuestions = [
  // ============ 自我认知 (Self-Awareness) - 8题 ============
  {
    id: 'SA1',
    dimension: 'SA',
    question: '我能清楚地识别自己当下的情绪状态',
    reversed: false
  },
  {
    id: 'SA2',
    dimension: 'SA',
    question: '我了解自己的优势和劣势',
    reversed: false
  },
  {
    id: 'SA3',
    dimension: 'SA',
    question: '我很难理解自己为什么会有某些情绪反应',
    reversed: true
  },
  {
    id: 'SA4',
    dimension: 'SA',
    question: '我能意识到自己的情绪如何影响我的决策',
    reversed: false
  },
  {
    id: 'SA5',
    dimension: 'SA',
    question: '我对自己有客观而准确的认识',
    reversed: false
  },
  {
    id: 'SA6',
    dimension: 'SA',
    question: '我经常反思自己的行为和想法',
    reversed: false
  },
  {
    id: 'SA7',
    dimension: 'SA',
    question: '别人对我的评价常常让我感到意外',
    reversed: true
  },
  {
    id: 'SA8',
    dimension: 'SA',
    question: '我知道什么事情容易触发我的负面情绪',
    reversed: false
  },

  // ============ 自我管理 (Self-Management) - 8题 ============
  {
    id: 'SM1',
    dimension: 'SM',
    question: '我能在压力下保持冷静',
    reversed: false
  },
  {
    id: 'SM2',
    dimension: 'SM',
    question: '当我生气时，我很难控制自己的言行',
    reversed: true
  },
  {
    id: 'SM3',
    dimension: 'SM',
    question: '我能够调节自己的情绪，不让它影响工作',
    reversed: false
  },
  {
    id: 'SM4',
    dimension: 'SM',
    question: '面对挫折时，我能快速调整心态',
    reversed: false
  },
  {
    id: 'SM5',
    dimension: 'SM',
    question: '我容易被情绪左右而做出冲动的决定',
    reversed: true
  },
  {
    id: 'SM6',
    dimension: 'SM',
    question: '我能接受批评而不感到过度沮丧',
    reversed: false
  },
  {
    id: 'SM7',
    dimension: 'SM',
    question: '我善于用积极的方式表达负面情绪',
    reversed: false
  },
  {
    id: 'SM8',
    dimension: 'SM',
    question: '我能适应环境的变化而不感到过度焦虑',
    reversed: false
  },

  // ============ 自我激励 (Motivation) - 8题 ============
  {
    id: 'MO1',
    dimension: 'MO',
    question: '我对实现目标充满热情和动力',
    reversed: false
  },
  {
    id: 'MO2',
    dimension: 'MO',
    question: '遇到困难时我容易放弃',
    reversed: true
  },
  {
    id: 'MO3',
    dimension: 'MO',
    question: '我总是努力追求卓越，不断提升自己',
    reversed: false
  },
  {
    id: 'MO4',
    dimension: 'MO',
    question: '即使没有外在奖励，我也会主动完成任务',
    reversed: false
  },
  {
    id: 'MO5',
    dimension: 'MO',
    question: '我能从失败中学习并继续前进',
    reversed: false
  },
  {
    id: 'MO6',
    dimension: 'MO',
    question: '我经常为长远目标而延迟即时满足',
    reversed: false
  },
  {
    id: 'MO7',
    dimension: 'MO',
    question: '我对工作或学习缺乏内在动力',
    reversed: true
  },
  {
    id: 'MO8',
    dimension: 'MO',
    question: '我相信通过努力可以改变自己的处境',
    reversed: false
  },

  // ============ 共情能力 (Empathy) - 8题 ============
  {
    id: 'EM1',
    dimension: 'EM',
    question: '我能敏锐地察觉他人的情绪变化',
    reversed: false
  },
  {
    id: 'EM2',
    dimension: 'EM',
    question: '我很难理解别人的感受',
    reversed: true
  },
  {
    id: 'EM3',
    dimension: 'EM',
    question: '看到他人痛苦时，我会感同身受',
    reversed: false
  },
  {
    id: 'EM4',
    dimension: 'EM',
    question: '我能从他人的角度看问题',
    reversed: false
  },
  {
    id: 'EM5',
    dimension: 'EM',
    question: '我善于倾听他人的心声',
    reversed: false
  },
  {
    id: 'EM6',
    dimension: 'EM',
    question: '我常常忽略他人的非语言信号',
    reversed: true
  },
  {
    id: 'EM7',
    dimension: 'EM',
    question: '我能理解不同背景的人的想法和感受',
    reversed: false
  },
  {
    id: 'EM8',
    dimension: 'EM',
    question: '别人愿意向我倾诉他们的烦恼',
    reversed: false
  },

  // ============ 社交技巧 (Social Skills) - 8题 ============
  {
    id: 'SS1',
    dimension: 'SS',
    question: '我能有效地与不同类型的人沟通',
    reversed: false
  },
  {
    id: 'SS2',
    dimension: 'SS',
    question: '在社交场合我经常感到不自在',
    reversed: true
  },
  {
    id: 'SS3',
    dimension: 'SS',
    question: '我善于化解人际冲突',
    reversed: false
  },
  {
    id: 'SS4',
    dimension: 'SS',
    question: '我能激励和影响他人',
    reversed: false
  },
  {
    id: 'SS5',
    dimension: 'SS',
    question: '我善于建立和维护良好的人际关系',
    reversed: false
  },
  {
    id: 'SS6',
    dimension: 'SS',
    question: '在团队合作中，我能发挥协调作用',
    reversed: false
  },
  {
    id: 'SS7',
    dimension: 'SS',
    question: '我不擅长在人前表达自己的观点',
    reversed: true
  },
  {
    id: 'SS8',
    dimension: 'SS',
    question: '我能恰当地处理人际关系中的微妙情况',
    reversed: false
  }
];

// 导出到全局
window.EQQuestions = EQQuestions;
