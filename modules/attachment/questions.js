/**
 * questions.js - 依恋类型测试题库
 * 观己 - 静观己心，内外澄明
 * 
 * 依恋类型模型 (Attachment Style):
 * 基于 Bartholomew & Horowitz (1991) 的二维模型
 * - Anxiety: 焦虑维度 (对被抛弃的恐惧)
 * - Avoidance: 回避维度 (对亲密关系的回避)
 * 
 * 四种依恋类型:
 * - 安全型 (Secure): 低焦虑 + 低回避
 * - 焦虑型 (Anxious/Preoccupied): 高焦虑 + 低回避
 * - 回避型 (Dismissive-Avoidant): 低焦虑 + 高回避
 * - 恐惧型 (Fearful-Avoidant): 高焦虑 + 高回避
 */

const AttachmentQuestions = [
  // ============ 焦虑维度 (Anxiety) - 15题 ============
  {
    id: 'A1',
    dimension: 'anxiety',
    question: '我经常担心伴侣不是真心爱我',
    reversed: false
  },
  {
    id: 'A2',
    dimension: 'anxiety',
    question: '我害怕一旦对方真正了解我，就会不喜欢我',
    reversed: false
  },
  {
    id: 'A3',
    dimension: 'anxiety',
    question: '当伴侣不在身边时，我会感到焦虑不安',
    reversed: false
  },
  {
    id: 'A4',
    dimension: 'anxiety',
    question: '我经常需要伴侣的肯定来确认关系的稳定',
    reversed: false
  },
  {
    id: 'A5',
    dimension: 'anxiety',
    question: '当伴侣没有及时回复消息时，我会胡思乱想',
    reversed: false
  },
  {
    id: 'A6',
    dimension: 'anxiety',
    question: '我对亲密关系充满信心，不太担心被抛弃',
    reversed: true
  },
  {
    id: 'A7',
    dimension: 'anxiety',
    question: '我常常觉得自己对伴侣的依赖超过对方对我的依赖',
    reversed: false
  },
  {
    id: 'A8',
    dimension: 'anxiety',
    question: '争吵后我会反复回想，担心关系出问题',
    reversed: false
  },
  {
    id: 'A9',
    dimension: 'anxiety',
    question: '我很少怀疑伴侣对我的感情',
    reversed: true
  },
  {
    id: 'A10',
    dimension: 'anxiety',
    question: '我害怕如果表现出真实的自己会被拒绝',
    reversed: false
  },
  {
    id: 'A11',
    dimension: 'anxiety',
    question: '我经常需要伴侣的关注和陪伴才能安心',
    reversed: false
  },
  {
    id: 'A12',
    dimension: 'anxiety',
    question: '我担心自己不够好，配不上现在的伴侣',
    reversed: false
  },
  {
    id: 'A13',
    dimension: 'anxiety',
    question: '在关系中我通常感到安全和放松',
    reversed: true
  },
  {
    id: 'A14',
    dimension: 'anxiety',
    question: '我会仔细观察伴侣的情绪变化，担心关系有问题',
    reversed: false
  },
  {
    id: 'A15',
    dimension: 'anxiety',
    question: '我常常担心伴侣会离开我',
    reversed: false
  },

  // ============ 回避维度 (Avoidance) - 15题 ============
  {
    id: 'V1',
    dimension: 'avoidance',
    question: '我更喜欢独自处理问题，不太愿意向伴侣倾诉',
    reversed: false
  },
  {
    id: 'V2',
    dimension: 'avoidance',
    question: '过于亲密的关系让我感到不自在',
    reversed: false
  },
  {
    id: 'V3',
    dimension: 'avoidance',
    question: '我觉得完全信任另一个人是困难的',
    reversed: false
  },
  {
    id: 'V4',
    dimension: 'avoidance',
    question: '我很容易向伴侣敞开心扉',
    reversed: true
  },
  {
    id: 'V5',
    dimension: 'avoidance',
    question: '当伴侣想要更亲密时，我有时会想要保持距离',
    reversed: false
  },
  {
    id: 'V6',
    dimension: 'avoidance',
    question: '我不太喜欢向伴侣展示自己的脆弱面',
    reversed: false
  },
  {
    id: 'V7',
    dimension: 'avoidance',
    question: '我觉得依赖别人是不明智的',
    reversed: false
  },
  {
    id: 'V8',
    dimension: 'avoidance',
    question: '我很享受与伴侣分享内心深处的想法',
    reversed: true
  },
  {
    id: 'V9',
    dimension: 'avoidance',
    question: '我更看重个人独立，而非情感依赖',
    reversed: false
  },
  {
    id: 'V10',
    dimension: 'avoidance',
    question: '我需要大量的个人空间，即使在亲密关系中也是如此',
    reversed: false
  },
  {
    id: 'V11',
    dimension: 'avoidance',
    question: '与伴侣进行深层次的情感交流对我来说很自然',
    reversed: true
  },
  {
    id: 'V12',
    dimension: 'avoidance',
    question: '我不太喜欢过多的身体接触和亲密举动',
    reversed: false
  },
  {
    id: 'V13',
    dimension: 'avoidance',
    question: '遇到困难时，我首先想到的是依靠自己',
    reversed: false
  },
  {
    id: 'V14',
    dimension: 'avoidance',
    question: '我能够轻松地信任和依赖伴侣',
    reversed: true
  },
  {
    id: 'V15',
    dimension: 'avoidance',
    question: '我觉得在关系中保持一定距离更舒服',
    reversed: false
  }
];

// 导出到全局
window.AttachmentQuestions = AttachmentQuestions;
