/**
 * questions.js - 价值观测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 基于 Schwartz 价值观理论的10个基本价值维度:
 * - AC: Achievement 成就 - 个人成功和能力展示
 * - HE: Hedonism 享乐 - 愉悦和感官满足
 * - SD: Self-Direction 自主 - 独立思考和行动
 * - SE: Security 安全 - 稳定和秩序
 * - BE: Benevolence 仁慈 - 关心身边人的福祉
 * - UN: Universalism 普世 - 关心所有人和自然
 * - TR: Tradition 传统 - 尊重文化和宗教习俗
 * - PO: Power 权力 - 社会地位和控制力
 * - ST: Stimulation 刺激 - 追求新奇和挑战
 * - CO: Conformity 从众 - 遵守社会规范
 */

const ValuesQuestions = [
  // ============ 成就 (Achievement) - 3题 ============
  {
    id: 'AC1',
    dimension: 'AC',
    question: '取得卓越的成就对我来说非常重要',
    reversed: false
  },
  {
    id: 'AC2',
    dimension: 'AC',
    question: '我努力在所做的事情上比别人做得更好',
    reversed: false
  },
  {
    id: 'AC3',
    dimension: 'AC',
    question: '展示自己的能力和才华让我感到满足',
    reversed: false
  },

  // ============ 享乐 (Hedonism) - 3题 ============
  {
    id: 'HE1',
    dimension: 'HE',
    question: '享受生活中的乐趣是我的人生目标',
    reversed: false
  },
  {
    id: 'HE2',
    dimension: 'HE',
    question: '我喜欢让自己过得舒适愉快',
    reversed: false
  },
  {
    id: 'HE3',
    dimension: 'HE',
    question: '满足感官享受（美食、旅行等）对我很重要',
    reversed: false
  },

  // ============ 自主 (Self-Direction) - 3题 ============
  {
    id: 'SD1',
    dimension: 'SD',
    question: '独立思考和做决定对我非常重要',
    reversed: false
  },
  {
    id: 'SD2',
    dimension: 'SD',
    question: '我喜欢按照自己的方式生活，而不是遵循他人的期望',
    reversed: false
  },
  {
    id: 'SD3',
    dimension: 'SD',
    question: '创造力和自由表达是我重视的品质',
    reversed: false
  },

  // ============ 安全 (Security) - 3题 ============
  {
    id: 'SE1',
    dimension: 'SE',
    question: '生活在安全稳定的环境中对我很重要',
    reversed: false
  },
  {
    id: 'SE2',
    dimension: 'SE',
    question: '我倾向于避免冒险，更喜欢确定性',
    reversed: false
  },
  {
    id: 'SE3',
    dimension: 'SE',
    question: '社会秩序和国家安全是重要的价值',
    reversed: false
  },

  // ============ 仁慈 (Benevolence) - 3题 ============
  {
    id: 'BE1',
    dimension: 'BE',
    question: '帮助身边的亲人朋友让我感到满足',
    reversed: false
  },
  {
    id: 'BE2',
    dimension: 'BE',
    question: '对朋友和家人忠诚是我坚守的原则',
    reversed: false
  },
  {
    id: 'BE3',
    dimension: 'BE',
    question: '我愿意为了亲近的人牺牲自己的利益',
    reversed: false
  },

  // ============ 普世 (Universalism) - 3题 ============
  {
    id: 'UN1',
    dimension: 'UN',
    question: '保护环境和自然对我很重要',
    reversed: false
  },
  {
    id: 'UN2',
    dimension: 'UN',
    question: '我相信每个人都应该享有平等的机会',
    reversed: false
  },
  {
    id: 'UN3',
    dimension: 'UN',
    question: '理解和包容不同文化背景的人是重要的',
    reversed: false
  },

  // ============ 传统 (Tradition) - 3题 ============
  {
    id: 'TR1',
    dimension: 'TR',
    question: '尊重和遵守传统习俗对我来说很重要',
    reversed: false
  },
  {
    id: 'TR2',
    dimension: 'TR',
    question: '我认为保持谦逊和知足是美德',
    reversed: false
  },
  {
    id: 'TR3',
    dimension: 'TR',
    question: '接受生活给予的东西比追求改变更重要',
    reversed: false
  },

  // ============ 权力 (Power) - 3题 ============
  {
    id: 'PO1',
    dimension: 'PO',
    question: '拥有领导地位和影响力对我很重要',
    reversed: false
  },
  {
    id: 'PO2',
    dimension: 'PO',
    question: '财富和物质成功是我追求的目标',
    reversed: false
  },
  {
    id: 'PO3',
    dimension: 'PO',
    question: '我希望别人尊重和服从我',
    reversed: false
  },

  // ============ 刺激 (Stimulation) - 3题 ============
  {
    id: 'ST1',
    dimension: 'ST',
    question: '我喜欢冒险和尝试新事物',
    reversed: false
  },
  {
    id: 'ST2',
    dimension: 'ST',
    question: '生活中需要有惊喜和变化',
    reversed: false
  },
  {
    id: 'ST3',
    dimension: 'ST',
    question: '追求刺激和兴奋是我生活的一部分',
    reversed: false
  },

  // ============ 从众 (Conformity) - 3题 ============
  {
    id: 'CO1',
    dimension: 'CO',
    question: '遵守规则和社会规范对我来说很重要',
    reversed: false
  },
  {
    id: 'CO2',
    dimension: 'CO',
    question: '我避免做可能让他人不满的事情',
    reversed: false
  },
  {
    id: 'CO3',
    dimension: 'CO',
    question: '尊重长辈和权威是重要的品质',
    reversed: false
  }
];

// 导出到全局
window.ValuesQuestions = ValuesQuestions;
