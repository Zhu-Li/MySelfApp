/**
 * questions.js - MBTI 测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 题目设计说明：
 * - 每道题测试一个维度的偏好
 * - dimension: E/I, S/N, T/F, J/P
 * - 选项A对应维度字母的第一个（E/S/T/J），选项B对应第二个（I/N/F/P）
 */

const MBTIQuestions = [
  // ===== E/I 维度 (外向/内向) - 18题 =====
  {
    id: 1,
    dimension: 'EI',
    question: '在社交聚会上，你通常会：',
    optionA: '主动与不认识的人交流，结交新朋友',
    optionB: '倾向于和已经认识的朋友待在一起'
  },
  {
    id: 2,
    dimension: 'EI',
    question: '当你需要恢复精力时，你更倾向于：',
    optionA: '与朋友外出活动或聊天',
    optionB: '独自待着，做自己喜欢的事'
  },
  {
    id: 3,
    dimension: 'EI',
    question: '在工作或学习中，你更喜欢：',
    optionA: '团队合作，与他人讨论想法',
    optionB: '独立完成任务，有自己的空间'
  },
  {
    id: 4,
    dimension: 'EI',
    question: '当遇到新环境时，你通常会：',
    optionA: '很快适应并融入其中',
    optionB: '需要一段时间来适应和观察'
  },
  {
    id: 5,
    dimension: 'EI',
    question: '你更享受哪种交流方式：',
    optionA: '面对面的直接交流',
    optionB: '书面或在线的间接交流'
  },
  {
    id: 6,
    dimension: 'EI',
    question: '在表达想法时，你倾向于：',
    optionA: '边说边想，在交流中完善想法',
    optionB: '先在心里想清楚再表达出来'
  },
  {
    id: 7,
    dimension: 'EI',
    question: '关于朋友圈，你更倾向于：',
    optionA: '拥有广泛的社交圈和众多朋友',
    optionB: '拥有少数几个深交的好友'
  },
  {
    id: 8,
    dimension: 'EI',
    question: '当需要做决定时，你更倾向于：',
    optionA: '与他人讨论后再做决定',
    optionB: '自己思考后独立做决定'
  },
  {
    id: 9,
    dimension: 'EI',
    question: '在空闲时间，你更喜欢：',
    optionA: '参加各种活动和社交场合',
    optionB: '享受安静的独处时光'
  },
  {
    id: 10,
    dimension: 'EI',
    question: '当有人问你问题时，你通常会：',
    optionA: '立即回答，即使还没想清楚',
    optionB: '思考一下再给出答案'
  },
  {
    id: 11,
    dimension: 'EI',
    question: '你认为自己是：',
    optionA: '容易被他人了解的人',
    optionB: '不太容易被人完全了解的人'
  },
  {
    id: 12,
    dimension: 'EI',
    question: '在会议或课堂上，你更倾向于：',
    optionA: '积极发言和参与讨论',
    optionB: '安静倾听，必要时才发言'
  },
  {
    id: 13,
    dimension: 'EI',
    question: '长时间独处后，你会：',
    optionA: '渴望与人交流互动',
    optionB: '感到舒适和满足'
  },
  {
    id: 14,
    dimension: 'EI',
    question: '你更喜欢的工作环境是：',
    optionA: '开放式办公，方便交流',
    optionB: '独立的工位或私密空间'
  },
  {
    id: 15,
    dimension: 'EI',
    question: '当接触新技能或知识时，你倾向于：',
    optionA: '通过与他人讨论或实践来学习',
    optionB: '通过阅读和独自思考来学习'
  },
  {
    id: 16,
    dimension: 'EI',
    question: '在团队项目中，你更喜欢担任：',
    optionA: '协调沟通的角色',
    optionB: '独立负责某个模块的角色'
  },
  {
    id: 17,
    dimension: 'EI',
    question: '你的电话使用习惯更接近：',
    optionA: '经常打电话给朋友聊天',
    optionB: '更喜欢发消息而非打电话'
  },
  {
    id: 18,
    dimension: 'EI',
    question: '当你有好消息时，你会：',
    optionA: '迫不及待地想和别人分享',
    optionB: '可能只告诉最亲近的人或独自开心'
  },

  // ===== S/N 维度 (感觉/直觉) - 18题 =====
  {
    id: 19,
    dimension: 'SN',
    question: '你更关注的是：',
    optionA: '当下发生的具体事实和细节',
    optionB: '未来的可能性和潜在联系'
  },
  {
    id: 20,
    dimension: 'SN',
    question: '当解决问题时，你更倾向于：',
    optionA: '使用经验证过的方法',
    optionB: '尝试新的、创新的方式'
  },
  {
    id: 21,
    dimension: 'SN',
    question: '你更喜欢的信息类型是：',
    optionA: '具体、明确、可验证的信息',
    optionB: '抽象、概念性、理论性的信息'
  },
  {
    id: 22,
    dimension: 'SN',
    question: '当描述一件事情时，你更倾向于：',
    optionA: '按照时间顺序或逻辑顺序描述具体细节',
    optionB: '描述整体印象和可能的含义'
  },
  {
    id: 23,
    dimension: 'SN',
    question: '你更欣赏的品质是：',
    optionA: '脚踏实地、注重实际',
    optionB: '富有想象力、有远见'
  },
  {
    id: 24,
    dimension: 'SN',
    question: '当阅读书籍时，你更喜欢：',
    optionA: '情节清晰、描写细腻的内容',
    optionB: '充满隐喻和象征意义的内容'
  },
  {
    id: 25,
    dimension: 'SN',
    question: '在工作中，你更擅长：',
    optionA: '处理需要精确和细节的任务',
    optionB: '处理需要创意和战略思考的任务'
  },
  {
    id: 26,
    dimension: 'SN',
    question: '当接收信息时，你更倾向于：',
    optionA: '关注字面意思和具体事实',
    optionB: '寻找潜在模式和隐藏含义'
  },
  {
    id: 27,
    dimension: 'SN',
    question: '你更相信的是：',
    optionA: '自己的亲身经历和感受',
    optionB: '自己的直觉和预感'
  },
  {
    id: 28,
    dimension: 'SN',
    question: '当学习新东西时，你更喜欢：',
    optionA: '按步骤学习，循序渐进',
    optionB: '先了解整体框架，再深入细节'
  },
  {
    id: 29,
    dimension: 'SN',
    question: '你更容易注意到：',
    optionA: '周围环境的具体细节变化',
    optionB: '事物之间的联系和可能性'
  },
  {
    id: 30,
    dimension: 'SN',
    question: '在讨论中，你更关注：',
    optionA: '"是什么"和"怎么做"',
    optionB: '"为什么"和"如果会怎样"'
  },
  {
    id: 31,
    dimension: 'SN',
    question: '你更喜欢的工作类型是：',
    optionA: '有明确规则和流程的工作',
    optionB: '需要创新和突破的工作'
  },
  {
    id: 32,
    dimension: 'SN',
    question: '当制定计划时，你更关注：',
    optionA: '可行性和实际操作细节',
    optionB: '愿景和长远可能性'
  },
  {
    id: 33,
    dimension: 'SN',
    question: '你认为自己是：',
    optionA: '实际的、现实主义者',
    optionB: '理想化的、可能性思考者'
  },
  {
    id: 34,
    dimension: 'SN',
    question: '当面对选择时，你更看重：',
    optionA: '过去的经验和已证明的方法',
    optionB: '未来的潜力和创新机会'
  },
  {
    id: 35,
    dimension: 'SN',
    question: '你更容易记住的是：',
    optionA: '具体的事实和细节',
    optionB: '整体印象和感受'
  },
  {
    id: 36,
    dimension: 'SN',
    question: '在解释事物时，你更倾向于：',
    optionA: '使用具体例子和实际经验',
    optionB: '使用比喻和抽象概念'
  },

  // ===== T/F 维度 (思考/情感) - 17题 =====
  {
    id: 37,
    dimension: 'TF',
    question: '当做决定时，你更看重：',
    optionA: '逻辑分析和客观事实',
    optionB: '个人价值观和对他人的影响'
  },
  {
    id: 38,
    dimension: 'TF',
    question: '当朋友向你倾诉问题时，你更倾向于：',
    optionA: '帮助分析问题并提供解决方案',
    optionB: '表达理解和情感支持'
  },
  {
    id: 39,
    dimension: 'TF',
    question: '在评价他人工作时，你更看重：',
    optionA: '工作的质量和效率',
    optionB: '付出的努力和态度'
  },
  {
    id: 40,
    dimension: 'TF',
    question: '当需要给出反馈时，你更倾向于：',
    optionA: '直接指出问题，不绕弯子',
    optionB: '考虑对方感受，委婉表达'
  },
  {
    id: 41,
    dimension: 'TF',
    question: '你认为更重要的是：',
    optionA: '公正和公平',
    optionB: '和谐与体谅'
  },
  {
    id: 42,
    dimension: 'TF',
    question: '当面对冲突时，你更倾向于：',
    optionA: '理性分析对错，坚持原则',
    optionB: '考虑各方感受，寻求妥协'
  },
  {
    id: 43,
    dimension: 'TF',
    question: '你更容易被什么说服：',
    optionA: '逻辑严密的论证',
    optionB: '真诚的情感诉求'
  },
  {
    id: 44,
    dimension: 'TF',
    question: '当别人表现不佳时，你更可能：',
    optionA: '直接指出需要改进的地方',
    optionB: '先肯定优点，再温和地提建议'
  },
  {
    id: 45,
    dimension: 'TF',
    question: '在团队讨论中，你更注重：',
    optionA: '讨论内容的逻辑性和可行性',
    optionB: '团队成员之间的关系和氛围'
  },
  {
    id: 46,
    dimension: 'TF',
    question: '当需要做艰难决定时，你更倾向于：',
    optionA: '理性分析利弊，做最优选择',
    optionB: '考虑对相关人员的情感影响'
  },
  {
    id: 47,
    dimension: 'TF',
    question: '你更认同哪种说法：',
    optionA: '诚实比礼貌更重要',
    optionB: '善意比直白更重要'
  },
  {
    id: 48,
    dimension: 'TF',
    question: '当批评他人时，你更看重：',
    optionA: '准确指出问题的本质',
    optionB: '考虑对方的接受程度'
  },
  {
    id: 49,
    dimension: 'TF',
    question: '在评估方案时，你更关注：',
    optionA: '方案的合理性和效率',
    optionB: '方案对人的影响和接受度'
  },
  {
    id: 50,
    dimension: 'TF',
    question: '当面对不公平时，你更可能：',
    optionA: '直接指出并要求纠正',
    optionB: '考虑各方处境，寻求平衡'
  },
  {
    id: 51,
    dimension: 'TF',
    question: '你更欣赏的领导风格是：',
    optionA: '目标明确、决策果断',
    optionB: '关心团队、善于激励'
  },
  {
    id: 52,
    dimension: 'TF',
    question: '当别人请求帮助时，你更倾向于：',
    optionA: '分析是否合理再决定',
    optionB: '尽可能提供帮助'
  },
  {
    id: 53,
    dimension: 'TF',
    question: '在人际关系中，你更看重：',
    optionA: '相互尊重和公平对待',
    optionB: '情感连接和相互理解'
  },

  // ===== J/P 维度 (判断/知觉) - 17题 =====
  {
    id: 54,
    dimension: 'JP',
    question: '你更喜欢的生活方式是：',
    optionA: '有计划、有组织、可预测',
    optionB: '灵活随性、顺其自然'
  },
  {
    id: 55,
    dimension: 'JP',
    question: '面对任务截止日期，你通常会：',
    optionA: '提前完成，留有余地',
    optionB: '在截止日期前才完成'
  },
  {
    id: 56,
    dimension: 'JP',
    question: '当计划被打乱时，你会：',
    optionA: '感到不安，想要恢复秩序',
    optionB: '灵活应对，接受变化'
  },
  {
    id: 57,
    dimension: 'JP',
    question: '你的工作空间通常是：',
    optionA: '整齐有序，物品有固定位置',
    optionB: '看起来有些乱，但自己能找到东西'
  },
  {
    id: 58,
    dimension: 'JP',
    question: '当面对选择时，你更倾向于：',
    optionA: '快速做出决定并执行',
    optionB: '保持开放，继续收集信息'
  },
  {
    id: 59,
    dimension: 'JP',
    question: '在旅行时，你更喜欢：',
    optionA: '提前规划好行程和住宿',
    optionB: '只做基本安排，其余随机应变'
  },
  {
    id: 60,
    dimension: 'JP',
    question: '你更享受的是：',
    optionA: '完成任务后的满足感',
    optionB: '探索过程中的新发现'
  },
  {
    id: 61,
    dimension: 'JP',
    question: '对于日程安排，你倾向于：',
    optionA: '详细规划每天的时间',
    optionB: '只记住重要事项，其余灵活安排'
  },
  {
    id: 62,
    dimension: 'JP',
    question: '当项目进行中出现新想法时，你会：',
    optionA: '评估是否影响进度，谨慎采纳',
    optionB: '愿意调整方向，尝试新想法'
  },
  {
    id: 63,
    dimension: 'JP',
    question: '你更喜欢的工作节奏是：',
    optionA: '稳定、可预期的工作流程',
    optionB: '多变、充满新挑战的环境'
  },
  {
    id: 64,
    dimension: 'JP',
    question: '对于规则和流程，你通常会：',
    optionA: '遵守并帮助他人遵守',
    optionB: '根据情况灵活处理'
  },
  {
    id: 65,
    dimension: 'JP',
    question: '当开始新项目时，你更倾向于：',
    optionA: '先制定详细计划再行动',
    optionB: '边做边调整方向'
  },
  {
    id: 66,
    dimension: 'JP',
    question: '你更喜欢哪种状态：',
    optionA: '事情已经确定和安排好',
    optionB: '保持多种可能性和选择'
  },
  {
    id: 67,
    dimension: 'JP',
    question: '在购物时，你更可能：',
    optionA: '有明确目标，买完就走',
    optionB: '随意浏览，可能买计划外的东西'
  },
  {
    id: 68,
    dimension: 'JP',
    question: '对待待办事项，你通常会：',
    optionA: '列清单并逐项完成',
    optionB: '记在心里，灵活处理'
  },
  {
    id: 69,
    dimension: 'JP',
    question: '当别人询问你的计划时，你更可能说：',
    optionA: '"我已经安排好了"',
    optionB: '"还没确定，到时候看吧"'
  },
  {
    id: 70,
    dimension: 'JP',
    question: '你认为理想的一天应该是：',
    optionA: '按计划进行，完成预定目标',
    optionB: '顺其自然，有惊喜和新体验'
  }
];

// 导出到全局
window.MBTIQuestions = MBTIQuestions;
