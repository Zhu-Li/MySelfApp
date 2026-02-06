/**
 * questions.js - 大五人格测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 大五人格模型 (OCEAN):
 * - O: Openness 开放性
 * - C: Conscientiousness 尽责性
 * - E: Extraversion 外向性
 * - A: Agreeableness 宜人性
 * - N: Neuroticism 神经质性
 */

const BigFiveQuestions = [
  // ============ 开放性 (Openness) - 10题 ============
  {
    id: 'O1',
    dimension: 'O',
    question: '我喜欢尝试新事物和新体验',
    reversed: false
  },
  {
    id: 'O2',
    dimension: 'O',
    question: '我对艺术、音乐或文学有浓厚的兴趣',
    reversed: false
  },
  {
    id: 'O3',
    dimension: 'O',
    question: '我经常思考抽象的概念和理论问题',
    reversed: false
  },
  {
    id: 'O4',
    dimension: 'O',
    question: '我喜欢打破常规，用创新的方式解决问题',
    reversed: false
  },
  {
    id: 'O5',
    dimension: 'O',
    question: '我对不同的文化和生活方式充满好奇',
    reversed: false
  },
  {
    id: 'O6',
    dimension: 'O',
    question: '我更喜欢按照既定的方式做事',
    reversed: true
  },
  {
    id: 'O7',
    dimension: 'O',
    question: '我有丰富的想象力，经常沉浸在幻想中',
    reversed: false
  },
  {
    id: 'O8',
    dimension: 'O',
    question: '我对哲学和人生意义有深入的思考',
    reversed: false
  },
  {
    id: 'O9',
    dimension: 'O',
    question: '我倾向于保守和传统的价值观',
    reversed: true
  },
  {
    id: 'O10',
    dimension: 'O',
    question: '我喜欢探索新的想法，即使它们看起来不切实际',
    reversed: false
  },

  // ============ 尽责性 (Conscientiousness) - 10题 ============
  {
    id: 'C1',
    dimension: 'C',
    question: '我做事有条理，喜欢事先规划',
    reversed: false
  },
  {
    id: 'C2',
    dimension: 'C',
    question: '我总是按时完成任务和承诺',
    reversed: false
  },
  {
    id: 'C3',
    dimension: 'C',
    question: '我注重细节，追求完美',
    reversed: false
  },
  {
    id: 'C4',
    dimension: 'C',
    question: '我有很强的自律能力',
    reversed: false
  },
  {
    id: 'C5',
    dimension: 'C',
    question: '我做决定时会仔细权衡利弊',
    reversed: false
  },
  {
    id: 'C6',
    dimension: 'C',
    question: '我经常拖延重要的事情',
    reversed: true
  },
  {
    id: 'C7',
    dimension: 'C',
    question: '我的工作空间总是整洁有序',
    reversed: false
  },
  {
    id: 'C8',
    dimension: 'C',
    question: '我设定目标并努力实现它们',
    reversed: false
  },
  {
    id: 'C9',
    dimension: 'C',
    question: '我做事比较随性，不喜欢太多计划',
    reversed: true
  },
  {
    id: 'C10',
    dimension: 'C',
    question: '我是一个可靠的人，别人可以信赖我',
    reversed: false
  },

  // ============ 外向性 (Extraversion) - 10题 ============
  {
    id: 'E1',
    dimension: 'E',
    question: '我喜欢参加社交活动和聚会',
    reversed: false
  },
  {
    id: 'E2',
    dimension: 'E',
    question: '我在人群中感到精力充沛',
    reversed: false
  },
  {
    id: 'E3',
    dimension: 'E',
    question: '我喜欢成为注意力的中心',
    reversed: false
  },
  {
    id: 'E4',
    dimension: 'E',
    question: '我容易与陌生人交谈',
    reversed: false
  },
  {
    id: 'E5',
    dimension: 'E',
    question: '我是一个活泼开朗的人',
    reversed: false
  },
  {
    id: 'E6',
    dimension: 'E',
    question: '我更喜欢独处而不是和很多人在一起',
    reversed: true
  },
  {
    id: 'E7',
    dimension: 'E',
    question: '我喜欢主导对话和讨论',
    reversed: false
  },
  {
    id: 'E8',
    dimension: 'E',
    question: '我有很多朋友和社交圈子',
    reversed: false
  },
  {
    id: 'E9',
    dimension: 'E',
    question: '我在社交场合中感到不自在',
    reversed: true
  },
  {
    id: 'E10',
    dimension: 'E',
    question: '我喜欢冒险和刺激的活动',
    reversed: false
  },

  // ============ 宜人性 (Agreeableness) - 10题 ============
  {
    id: 'A1',
    dimension: 'A',
    question: '我乐于帮助他人，即使会给自己带来不便',
    reversed: false
  },
  {
    id: 'A2',
    dimension: 'A',
    question: '我相信大多数人都是善良的',
    reversed: false
  },
  {
    id: 'A3',
    dimension: 'A',
    question: '我在冲突中倾向于寻求和解',
    reversed: false
  },
  {
    id: 'A4',
    dimension: 'A',
    question: '我很容易原谅别人的过错',
    reversed: false
  },
  {
    id: 'A5',
    dimension: 'A',
    question: '我尊重他人的感受和意见',
    reversed: false
  },
  {
    id: 'A6',
    dimension: 'A',
    question: '我有时对别人比较苛刻',
    reversed: true
  },
  {
    id: 'A7',
    dimension: 'A',
    question: '我是一个富有同情心的人',
    reversed: false
  },
  {
    id: 'A8',
    dimension: 'A',
    question: '我喜欢与人合作而不是竞争',
    reversed: false
  },
  {
    id: 'A9',
    dimension: 'A',
    question: '我觉得必须保护自己的利益免受他人侵害',
    reversed: true
  },
  {
    id: 'A10',
    dimension: 'A',
    question: '我很少与人发生争执',
    reversed: false
  },

  // ============ 神经质性 (Neuroticism) - 10题 ============
  {
    id: 'N1',
    dimension: 'N',
    question: '我经常感到焦虑或担忧',
    reversed: false
  },
  {
    id: 'N2',
    dimension: 'N',
    question: '我的情绪波动比较大',
    reversed: false
  },
  {
    id: 'N3',
    dimension: 'N',
    question: '我容易感到沮丧或忧郁',
    reversed: false
  },
  {
    id: 'N4',
    dimension: 'N',
    question: '我在压力下容易崩溃',
    reversed: false
  },
  {
    id: 'N5',
    dimension: 'N',
    question: '我经常感到紧张不安',
    reversed: false
  },
  {
    id: 'N6',
    dimension: 'N',
    question: '我是一个情绪稳定的人',
    reversed: true
  },
  {
    id: 'N7',
    dimension: 'N',
    question: '我容易感到愤怒或烦躁',
    reversed: false
  },
  {
    id: 'N8',
    dimension: 'N',
    question: '我经常担心事情会出错',
    reversed: false
  },
  {
    id: 'N9',
    dimension: 'N',
    question: '我能够很好地应对生活中的挫折',
    reversed: true
  },
  {
    id: 'N10',
    dimension: 'N',
    question: '我有时会感到自卑或不自信',
    reversed: false
  }
];

// 导出到全局
window.BigFiveQuestions = BigFiveQuestions;
