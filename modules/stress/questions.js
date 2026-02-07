/**
 * questions.js - 压力/焦虑自测题库
 * 观己 - 静观己心，内外澄明
 * 
 * 包含两个标准化量表:
 * - GAD-7: 广泛性焦虑障碍量表 (7题)
 * - PHQ-9: 患者健康问卷抑郁量表 (9题)
 * 
 * 评分标准 (过去两周频率):
 * 0 = 完全不会
 * 1 = 好几天
 * 2 = 一半以上的天数
 * 3 = 几乎每天
 */

const StressQuestions = {
  // GAD-7 焦虑量表
  GAD7: [
    {
      id: 'GAD1',
      scale: 'GAD7',
      question: '感觉紧张、焦虑或急切'
    },
    {
      id: 'GAD2',
      scale: 'GAD7',
      question: '不能够停止或控制担忧'
    },
    {
      id: 'GAD3',
      scale: 'GAD7',
      question: '对各种各样的事情担忧过多'
    },
    {
      id: 'GAD4',
      scale: 'GAD7',
      question: '很难放松下来'
    },
    {
      id: 'GAD5',
      scale: 'GAD7',
      question: '由于不安而无法静坐'
    },
    {
      id: 'GAD6',
      scale: 'GAD7',
      question: '变得容易烦恼或急躁'
    },
    {
      id: 'GAD7',
      scale: 'GAD7',
      question: '感到似乎将有可怕的事情发生而害怕'
    }
  ],

  // PHQ-9 抑郁量表
  PHQ9: [
    {
      id: 'PHQ1',
      scale: 'PHQ9',
      question: '做事时提不起劲或没有兴趣'
    },
    {
      id: 'PHQ2',
      scale: 'PHQ9',
      question: '感到心情低落、沮丧或绝望'
    },
    {
      id: 'PHQ3',
      scale: 'PHQ9',
      question: '入睡困难、睡不安稳或睡眠过多'
    },
    {
      id: 'PHQ4',
      scale: 'PHQ9',
      question: '感觉疲倦或没有活力'
    },
    {
      id: 'PHQ5',
      scale: 'PHQ9',
      question: '食欲不振或吃太多'
    },
    {
      id: 'PHQ6',
      scale: 'PHQ9',
      question: '觉得自己很糟糕、是失败者，或让自己或家人失望'
    },
    {
      id: 'PHQ7',
      scale: 'PHQ9',
      question: '对事物专注有困难，例如阅读报纸或看电视时'
    },
    {
      id: 'PHQ8',
      scale: 'PHQ9',
      question: '动作或说话速度缓慢到别人已经察觉，或正好相反——烦躁或坐立不安'
    },
    {
      id: 'PHQ9',
      scale: 'PHQ9',
      question: '有不如死掉或用某种方式伤害自己的念头'
    }
  ]
};

// 导出到全局
window.StressQuestions = StressQuestions;
