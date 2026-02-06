/**
 * questions.js - 霍兰德职业兴趣测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 霍兰德职业兴趣模型 (RIASEC):
 * - R: Realistic 实际型
 * - I: Investigative 研究型
 * - A: Artistic 艺术型
 * - S: Social 社会型
 * - E: Enterprising 企业型
 * - C: Conventional 常规型
 */

const HollandQuestions = [
  // ============ 实际型 (Realistic) - 10题 ============
  {
    id: 'R1',
    dimension: 'R',
    question: '我喜欢动手制作或修理东西',
    category: 'activity'
  },
  {
    id: 'R2',
    dimension: 'R',
    question: '我对机械、工具或技术设备感兴趣',
    category: 'interest'
  },
  {
    id: 'R3',
    dimension: 'R',
    question: '我喜欢户外活动或体力劳动',
    category: 'activity'
  },
  {
    id: 'R4',
    dimension: 'R',
    question: '我擅长使用工具和操作设备',
    category: 'skill'
  },
  {
    id: 'R5',
    dimension: 'R',
    question: '我喜欢从事有具体成果的工作',
    category: 'preference'
  },
  {
    id: 'R6',
    dimension: 'R',
    question: '我对建筑、工程或制造类工作感兴趣',
    category: 'career'
  },
  {
    id: 'R7',
    dimension: 'R',
    question: '我喜欢与实物打交道而非抽象概念',
    category: 'preference'
  },
  {
    id: 'R8',
    dimension: 'R',
    question: '我有较强的动手能力和空间感',
    category: 'skill'
  },
  {
    id: 'R9',
    dimension: 'R',
    question: '我喜欢体育运动或竞技活动',
    category: 'activity'
  },
  {
    id: 'R10',
    dimension: 'R',
    question: '我倾向于选择需要实际操作的职业',
    category: 'career'
  },

  // ============ 研究型 (Investigative) - 10题 ============
  {
    id: 'I1',
    dimension: 'I',
    question: '我喜欢分析问题和寻找答案',
    category: 'activity'
  },
  {
    id: 'I2',
    dimension: 'I',
    question: '我对科学研究和实验感兴趣',
    category: 'interest'
  },
  {
    id: 'I3',
    dimension: 'I',
    question: '我喜欢阅读科技或学术类书籍',
    category: 'activity'
  },
  {
    id: 'I4',
    dimension: 'I',
    question: '我擅长逻辑推理和解决复杂问题',
    category: 'skill'
  },
  {
    id: 'I5',
    dimension: 'I',
    question: '我对事物的原理和规律充满好奇',
    category: 'preference'
  },
  {
    id: 'I6',
    dimension: 'I',
    question: '我对研究员、科学家等职业感兴趣',
    category: 'career'
  },
  {
    id: 'I7',
    dimension: 'I',
    question: '我喜欢独立思考和深入研究',
    category: 'preference'
  },
  {
    id: 'I8',
    dimension: 'I',
    question: '我有较强的数据分析和观察能力',
    category: 'skill'
  },
  {
    id: 'I9',
    dimension: 'I',
    question: '我喜欢探索未知领域和挑战难题',
    category: 'activity'
  },
  {
    id: 'I10',
    dimension: 'I',
    question: '我倾向于选择需要智力挑战的职业',
    category: 'career'
  },

  // ============ 艺术型 (Artistic) - 10题 ============
  {
    id: 'A1',
    dimension: 'A',
    question: '我喜欢艺术创作，如绘画、音乐或写作',
    category: 'activity'
  },
  {
    id: 'A2',
    dimension: 'A',
    question: '我对美学和设计有敏锐的感觉',
    category: 'interest'
  },
  {
    id: 'A3',
    dimension: 'A',
    question: '我喜欢欣赏艺术作品和文化活动',
    category: 'activity'
  },
  {
    id: 'A4',
    dimension: 'A',
    question: '我擅长用创意表达自己的想法',
    category: 'skill'
  },
  {
    id: 'A5',
    dimension: 'A',
    question: '我喜欢自由、不受约束的工作环境',
    category: 'preference'
  },
  {
    id: 'A6',
    dimension: 'A',
    question: '我对艺术家、设计师等职业感兴趣',
    category: 'career'
  },
  {
    id: 'A7',
    dimension: 'A',
    question: '我有丰富的想象力和创造力',
    category: 'preference'
  },
  {
    id: 'A8',
    dimension: 'A',
    question: '我擅长将抽象概念转化为具体作品',
    category: 'skill'
  },
  {
    id: 'A9',
    dimension: 'A',
    question: '我喜欢表演或在公众面前展示才华',
    category: 'activity'
  },
  {
    id: 'A10',
    dimension: 'A',
    question: '我倾向于选择能发挥创意的职业',
    category: 'career'
  },

  // ============ 社会型 (Social) - 10题 ============
  {
    id: 'S1',
    dimension: 'S',
    question: '我喜欢帮助他人解决问题',
    category: 'activity'
  },
  {
    id: 'S2',
    dimension: 'S',
    question: '我对教育或辅导工作感兴趣',
    category: 'interest'
  },
  {
    id: 'S3',
    dimension: 'S',
    question: '我喜欢参与志愿服务或公益活动',
    category: 'activity'
  },
  {
    id: 'S4',
    dimension: 'S',
    question: '我擅长倾听和理解他人',
    category: 'skill'
  },
  {
    id: 'S5',
    dimension: 'S',
    question: '我喜欢与人合作共同完成任务',
    category: 'preference'
  },
  {
    id: 'S6',
    dimension: 'S',
    question: '我对教师、心理咨询师等职业感兴趣',
    category: 'career'
  },
  {
    id: 'S7',
    dimension: 'S',
    question: '我关心社会问题和他人福祉',
    category: 'preference'
  },
  {
    id: 'S8',
    dimension: 'S',
    question: '我有较强的沟通和人际交往能力',
    category: 'skill'
  },
  {
    id: 'S9',
    dimension: 'S',
    question: '我喜欢组织团队活动或培训',
    category: 'activity'
  },
  {
    id: 'S10',
    dimension: 'S',
    question: '我倾向于选择能帮助他人的职业',
    category: 'career'
  },

  // ============ 企业型 (Enterprising) - 10题 ============
  {
    id: 'E1',
    dimension: 'E',
    question: '我喜欢领导和影响他人',
    category: 'activity'
  },
  {
    id: 'E2',
    dimension: 'E',
    question: '我对商业和创业感兴趣',
    category: 'interest'
  },
  {
    id: 'E3',
    dimension: 'E',
    question: '我喜欢参与竞争和追求成功',
    category: 'activity'
  },
  {
    id: 'E4',
    dimension: 'E',
    question: '我擅长说服和激励他人',
    category: 'skill'
  },
  {
    id: 'E5',
    dimension: 'E',
    question: '我喜欢冒险和抓住机会',
    category: 'preference'
  },
  {
    id: 'E6',
    dimension: 'E',
    question: '我对管理者、销售等职业感兴趣',
    category: 'career'
  },
  {
    id: 'E7',
    dimension: 'E',
    question: '我有强烈的成就动机和野心',
    category: 'preference'
  },
  {
    id: 'E8',
    dimension: 'E',
    question: '我擅长谈判和处理商务关系',
    category: 'skill'
  },
  {
    id: 'E9',
    dimension: 'E',
    question: '我喜欢主导项目或创办事业',
    category: 'activity'
  },
  {
    id: 'E10',
    dimension: 'E',
    question: '我倾向于选择有权力和影响力的职业',
    category: 'career'
  },

  // ============ 常规型 (Conventional) - 10题 ============
  {
    id: 'C1',
    dimension: 'C',
    question: '我喜欢有条理、有规律的工作',
    category: 'activity'
  },
  {
    id: 'C2',
    dimension: 'C',
    question: '我对数据处理和文档管理感兴趣',
    category: 'interest'
  },
  {
    id: 'C3',
    dimension: 'C',
    question: '我喜欢遵循明确的规则和流程',
    category: 'activity'
  },
  {
    id: 'C4',
    dimension: 'C',
    question: '我擅长整理信息和处理细节',
    category: 'skill'
  },
  {
    id: 'C5',
    dimension: 'C',
    question: '我喜欢稳定、可预测的工作环境',
    category: 'preference'
  },
  {
    id: 'C6',
    dimension: 'C',
    question: '我对会计、行政等职业感兴趣',
    category: 'career'
  },
  {
    id: 'C7',
    dimension: 'C',
    question: '我注重准确性和效率',
    category: 'preference'
  },
  {
    id: 'C8',
    dimension: 'C',
    question: '我擅长使用办公软件和系统',
    category: 'skill'
  },
  {
    id: 'C9',
    dimension: 'C',
    question: '我喜欢完成有明确标准的任务',
    category: 'activity'
  },
  {
    id: 'C10',
    dimension: 'C',
    question: '我倾向于选择结构化程度高的职业',
    category: 'career'
  }
];

// 导出到全局
window.HollandQuestions = HollandQuestions;
