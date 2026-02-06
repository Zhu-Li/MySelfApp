/**
 * api.js - 硅基流动 API 调用层
 * 观己 - 静观己心，内外澄明
 */

const API = {
  baseUrl: 'https://api.siliconflow.cn/v1',
  apiKey: null,
  model: 'deepseek-ai/DeepSeek-V3',
  maxRetries: 2,
  timeout: 60000,

  /**
   * 初始化 API 配置
   */
  async init() {
    // 从存储中加载配置
    const apiKeyConfig = await Storage.getRaw('config', 'apiKey');
    const modelConfig = await Storage.getRaw('config', 'model');

    if (apiKeyConfig && apiKeyConfig.value) {
      // 如果 API Key 是加密的，需要解密
      if (apiKeyConfig.encrypted && Storage.cryptoKey) {
        this.apiKey = await Storage.decryptData(apiKeyConfig.value);
      } else {
        this.apiKey = apiKeyConfig.value;
      }
    }

    if (modelConfig && modelConfig.value) {
      this.model = modelConfig.value;
    }
  },

  /**
   * 设置 API Key
   */
  async setApiKey(key) {
    this.apiKey = key;
    // 加密存储
    if (Storage.cryptoKey) {
      const encrypted = await Storage.encryptData(key);
      await Storage.setRaw('config', { key: 'apiKey', value: encrypted, encrypted: true });
    } else {
      await Storage.setRaw('config', { key: 'apiKey', value: key });
    }
  },

  /**
   * 设置模型
   */
  async setModel(model) {
    this.model = model;
    await Storage.setConfig('model', model);
  },

  /**
   * 检查 API 是否已配置
   */
  isConfigured() {
    return !!this.apiKey;
  },

  /**
   * 发送聊天请求
   */
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('请先配置 API 密钥');
    }

    const {
      model = this.model,
      temperature = 0.7,
      maxTokens = 2000,
      stream = false
    } = options;

    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    };

    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
        }

        if (stream) {
          return response.body;
        }

        const data = await response.json();
        return data.choices[0].message.content;

      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请稍后重试');
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.maxRetries) {
          await Utils.sleep(1000 * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('API 请求失败');
  },

  /**
   * 流式聊天请求
   */
  async chatStream(messages, onChunk, options = {}) {
    const stream = await this.chat(messages, { ...options, stream: true });
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onChunk(content, fullContent);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  },

  /**
   * MBTI 分析
   */
  async analyzeMBTI(result) {
    const { type, dimensions } = result;
    
    const prompt = `你是一位专业的心理分析师。根据用户的MBTI测试结果，提供个性化的性格分析报告。

用户测试结果：
- 类型：${type}
- 各维度得分：
  - 外向(E) ${dimensions.E}% vs 内向(I) ${dimensions.I}%
  - 感觉(S) ${dimensions.S}% vs 直觉(N) ${dimensions.N}%
  - 思考(T) ${dimensions.T}% vs 情感(F) ${dimensions.F}%
  - 判断(J) ${dimensions.J}% vs 知觉(P) ${dimensions.P}%

请从以下方面进行分析，使用 Markdown 格式输出：

## 性格特征概述
（约200字，描述该类型的核心特征）

## 核心优势
（列出3-5个优势，每个用一句话解释）

## 潜在挑战
（列出3-5个挑战，每个用一句话解释）

## 职业发展建议
（基于性格特点给出适合的职业方向和发展建议）

## 人际关系特点
（描述在社交、友情、爱情中的表现特点）

## 个人成长建议
（给出3-5条具体可操作的成长建议）

要求：
- 语言亲切自然，避免过于学术化
- 给出具体可操作的建议
- 基于维度得分的具体数值进行个性化分析
- 突出该类型的独特之处`;

    const messages = [
      { role: 'system', content: '你是一位专业、温和的心理分析师，擅长 MBTI 性格分析。' },
      { role: 'user', content: prompt }
    ];

    return this.chat(messages, { temperature: 0.8, maxTokens: 2500 });
  },

  /**
   * 日记情感分析
   */
  async analyzeDiary(content) {
    const prompt = `请分析以下日记内容，提取关键信息：

日记内容：
${content}

请以 JSON 格式返回分析结果：
{
  "mood": "情绪状态（如：愉快、平静、焦虑、低落等）",
  "moodScore": 情绪分数（1-10，10为最积极）,
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "themes": ["主题1", "主题2"],
  "insights": "简短的洞察（约50字）"
}

只返回 JSON，不要其他内容。`;

    const messages = [
      { role: 'system', content: '你是一位情感分析专家，善于从文字中提取情感和主题信息。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, { temperature: 0.3, maxTokens: 500 });
    
    try {
      // 尝试提取 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析响应');
    } catch (e) {
      console.error('日记分析解析失败:', e);
      return null;
    }
  },

  /**
   * 生成综合画像分析
   */
  async generateProfileSummary(profileData) {
    const { mbti, diaryAnalysis, testHistory } = profileData;

    let context = '用户画像数据：\n';

    if (mbti) {
      context += `\n【MBTI类型】${mbti.type} - ${Utils.getMBTIName(mbti.type)}\n`;
      context += `测试时间：${Utils.formatDate(mbti.timestamp)}\n`;
    }

    if (diaryAnalysis && diaryAnalysis.length > 0) {
      const avgMood = diaryAnalysis.reduce((sum, d) => sum + (d.moodScore || 5), 0) / diaryAnalysis.length;
      const allKeywords = diaryAnalysis.flatMap(d => d.keywords || []);
      const topKeywords = [...new Set(allKeywords)].slice(0, 10);
      
      context += `\n【日记分析】\n`;
      context += `平均情绪分数：${avgMood.toFixed(1)}/10\n`;
      context += `常见关键词：${topKeywords.join('、')}\n`;
    }

    const prompt = `${context}

请基于以上数据，生成一份简洁的用户画像摘要（约150字），包括：
1. 性格特点概括
2. 当前状态评估
3. 一句鼓励或建议

语气温和友好，像朋友间的对话。`;

    const messages = [
      { role: 'system', content: '你是一位温和的心理咨询师，善于给出正向、有建设性的反馈。' },
      { role: 'user', content: prompt }
    ];

    return this.chat(messages, { temperature: 0.8, maxTokens: 500 });
  },

  /**
   * 测试 API 连接
   */
  async testConnection() {
    try {
      const messages = [
        { role: 'user', content: '请回复"连接成功"四个字。' }
      ];
      const response = await this.chat(messages, { maxTokens: 20 });
      return response.includes('连接成功') || response.includes('成功');
    } catch (error) {
      throw error;
    }
  }
};

// 导出到全局
window.API = API;
