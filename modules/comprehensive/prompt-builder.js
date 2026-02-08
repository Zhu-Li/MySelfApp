/**
 * prompt-builder.js - 综合分析提示词构建
 * 观己 - 静观己心，内外澄明
 * 
 * 从 comprehensive.js 拆分
 * 职责：构建 AI 综合分析的提示词
 */

/**
 * 构建综合分析提示词
 * @param {Object} data - 测评数据
 * @returns {string} 提示词文本
 */
Comprehensive.buildPrompt = function(data) {
  let prompt = `你是一位资深的心理学专家和职业规划师，请根据用户完成的多项测评结果，进行深度综合分析，绘制完整的用户画像。

## 测评结果汇总

`;

  // MBTI 结果
  if (data.mbti) {
    const mbtiName = Utils.getMBTIName(data.mbti.type);
    prompt += `### MBTI 性格类型
- **类型**: ${data.mbti.type} (${mbtiName})
- **各维度**:
  - E/I (外向/内向): E ${data.mbti.dimensions.E}% / I ${data.mbti.dimensions.I}%
  - S/N (感觉/直觉): S ${data.mbti.dimensions.S}% / N ${data.mbti.dimensions.N}%
  - T/F (思考/情感): T ${data.mbti.dimensions.T}% / F ${data.mbti.dimensions.F}%
  - J/P (判断/知觉): J ${data.mbti.dimensions.J}% / P ${data.mbti.dimensions.P}%

`;
  }

  // 大五人格结果
  if (data.bigfive) {
    prompt += `### 大五人格
- 开放性 (O): ${data.bigfive.dimensions.O}%
- 尽责性 (C): ${data.bigfive.dimensions.C}%
- 外向性 (E): ${data.bigfive.dimensions.E}%
- 宜人性 (A): ${data.bigfive.dimensions.A}%
- 神经质性 (N): ${data.bigfive.dimensions.N}%

`;
  }

  // 霍兰德结果
  if (data.holland) {
    prompt += `### 霍兰德职业兴趣
- **职业代码**: ${data.holland.hollandCode}
- **各维度**:
  - 实际型 (R): ${data.holland.dimensions.R}%
  - 研究型 (I): ${data.holland.dimensions.I}%
  - 艺术型 (A): ${data.holland.dimensions.A}%
  - 社会型 (S): ${data.holland.dimensions.S}%
  - 企业型 (E): ${data.holland.dimensions.E}%
  - 常规型 (C): ${data.holland.dimensions.C}%

`;
  }

  // 日记情绪数据
  if (data.diary && data.diary.length > 0) {
    const moodStats = {};
    data.diary.forEach(d => {
      if (d.mood) {
        moodStats[d.mood] = (moodStats[d.mood] || 0) + 1;
      }
    });
    const moodSummary = Object.entries(moodStats)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => `${mood}: ${count}次`)
      .join('、');
    
    prompt += `### 日记情绪记录（最近${data.diary.length}篇）
- **情绪分布**: ${moodSummary || '无情绪标签'}
- **近期日记摘要**:
${data.diary.slice(0, 5).map(d => `  - [${d.date}] ${d.mood || ''} ${d.content?.substring(0, 50) || ''}...`).join('\n')}

`;
  }

  // 关系网数据
  if (data.contacts && data.contacts.length > 0) {
    const mbtiContacts = data.contacts.filter(c => c.mbtiType);
    prompt += `### 人际关系网络（${data.contacts.length}人）
- **关系网概览**: 共导入 ${data.contacts.length} 位联系人数据
${mbtiContacts.length > 0 ? `- **联系人MBTI类型分布**: ${mbtiContacts.map(c => `${c.name}${c.remark ? '(' + c.remark + ')' : ''}: ${c.mbtiType}`).join('、')}` : ''}
- **关系网详情**:
${data.contacts.slice(0, 10).map(c => `  - ${c.name}${c.remark ? '(' + c.remark + ')' : ''}: 测试${c.testsCount}条, 日记${c.diaryCount}篇`).join('\n')}

`;
  }

  prompt += `## 请提供以下深度分析

### 1. 综合人格画像
整合多个测评维度，描绘用户完整、立体的性格特征和内在特质。注意不同测评结果之间的关联性和一致性。

### 2. 核心优势分析
- 根据多维度数据，识别用户最突出的3-5个核心优势
- 分析这些优势在不同场景（工作、生活、人际）中的表现

### 3. 情绪与心理状态分析
- 根据日记情绪记录，分析用户近期的心理状态和情绪模式
- 识别可能的压力来源和情绪波动规律
- 提供针对性的情绪管理建议

### 4. 发展建议
- 针对性格中可能的盲点或挑战提供建议
- 提供具体、可行的个人成长方向

### 5. 职业发展规划
- 整合性格特征和职业兴趣，推荐最适合的职业方向
- 分析适合的工作环境和团队角色
- 提供职业发展路径建议

### 6. 人际关系指南
- 分析与不同类型人相处的模式
- 结合关系网中联系人的性格类型，分析互动模式和潜在的相处建议
- 提供改善人际关系的具体建议

### 7. 生活建议
- 适合的生活方式和休闲活动
- 压力管理和情绪调节建议

请用温暖、专业的语气进行分析，注重正面引导和实用建议，每个部分用 markdown 格式清晰输出。`;

  return prompt;
};
