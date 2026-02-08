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
  
  // API Key 状态跟踪
  keyStatus: 'unknown', // unknown, valid, invalid, quota_exceeded, rate_limited
  lastValidation: null,
  validationCache: 5 * 60 * 1000, // 5分钟缓存

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
  },

  /**
   * 验证 API Key 是否有效
   * @param {boolean} force - 是否强制验证（忽略缓存）
   * @returns {Promise<{valid: boolean, status: string, message: string}>}
   */
  async validateKey(force = false) {
    // 如果没有配置 API Key
    if (!this.apiKey) {
      this.keyStatus = 'not_configured';
      return {
        valid: false,
        status: 'not_configured',
        message: '未配置 API 密钥'
      };
    }

    // 检查缓存（非强制模式下）
    if (!force && this.keyStatus === 'valid' && this.lastValidation) {
      const cacheAge = Date.now() - this.lastValidation;
      if (cacheAge < this.validationCache) {
        return {
          valid: true,
          status: 'valid',
          message: 'API 密钥有效（缓存）'
        };
      }
    }

    try {
      // 发送最小化测试请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.keyStatus = 'valid';
        this.lastValidation = Date.now();
        return {
          valid: true,
          status: 'valid',
          message: 'API 密钥有效'
        };
      }

      // 根据状态码判断错误类型
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;

      if (response.status === 401) {
        this.keyStatus = 'invalid';
        return {
          valid: false,
          status: 'invalid',
          message: 'API 密钥无效或已过期'
        };
      }

      if (response.status === 402 || errorMessage.includes('余额') || errorMessage.includes('quota')) {
        this.keyStatus = 'quota_exceeded';
        return {
          valid: false,
          status: 'quota_exceeded',
          message: 'API 余额不足，请充值后使用'
        };
      }

      if (response.status === 429) {
        this.keyStatus = 'rate_limited';
        return {
          valid: false,
          status: 'rate_limited',
          message: '请求过于频繁，请稍后再试'
        };
      }

      this.keyStatus = 'error';
      return {
        valid: false,
        status: 'error',
        message: errorMessage
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        this.keyStatus = 'timeout';
        return {
          valid: false,
          status: 'timeout',
          message: '网络连接超时，请检查网络'
        };
      }

      this.keyStatus = 'network_error';
      return {
        valid: false,
        status: 'network_error',
        message: '网络连接失败，请检查网络设置'
      };
    }
  },

  /**
   * 检查 API 并在需要时弹出配置窗口
   * @returns {Promise<boolean>} - API 是否可用
   */
  async checkAndPrompt() {
    // 先检查是否配置
    if (!this.isConfigured()) {
      this.showConfigModal('not_configured');
      return false;
    }

    // 验证密钥有效性
    const result = await this.validateKey();
    
    if (!result.valid) {
      this.showConfigModal(result.status, result.message);
      return false;
    }

    return true;
  },

  /**
   * 显示 API 配置弹窗
   * @param {string} status - 状态类型
   * @param {string} message - 错误消息
   */
  showConfigModal(status = 'not_configured', message = '') {
    // 移除已存在的弹窗
    this.closeConfigModal();

    // 添加样式
    this.addConfigModalStyles();

    // 根据状态设置提示内容
    const statusConfig = {
      not_configured: {
        icon: '⚙️',
        title: '配置 AI 服务',
        desc: '请配置 API 密钥以使用 AI 分析功能',
        color: '#6366f1'
      },
      invalid: {
        icon: '🔑',
        title: 'API 密钥无效',
        desc: '您的 API 密钥无效或已过期，请重新配置',
        color: '#ef4444'
      },
      quota_exceeded: {
        icon: '💰',
        title: '余额不足',
        desc: 'API 账户余额不足，请前往硅基流动充值',
        color: '#f59e0b'
      },
      rate_limited: {
        icon: '⏱️',
        title: '请求限制',
        desc: '请求过于频繁，请稍后再试',
        color: '#f59e0b'
      },
      network_error: {
        icon: '🌐',
        title: '网络错误',
        desc: '无法连接到 API 服务器，请检查网络',
        color: '#ef4444'
      },
      timeout: {
        icon: '⏳',
        title: '连接超时',
        desc: '连接 API 服务器超时，请检查网络或稍后重试',
        color: '#f59e0b'
      },
      error: {
        icon: '❌',
        title: 'API 错误',
        desc: message || '发生未知错误，请稍后重试',
        color: '#ef4444'
      }
    };

    const config = statusConfig[status] || statusConfig.error;

    const modal = document.createElement('div');
    modal.id = 'apiConfigModal';
    modal.className = 'api-config-modal-overlay';
    modal.innerHTML = `
      <div class="api-config-modal">
        <div class="api-config-modal-header">
          <div class="api-config-modal-icon" style="background: ${config.color}15; color: ${config.color};">
            ${config.icon}
          </div>
          <h3 class="api-config-modal-title">${config.title}</h3>
          <p class="api-config-modal-desc">${config.desc}</p>
          ${message && status !== 'error' ? `<p class="api-config-modal-error">${message}</p>` : ''}
        </div>
        
        <div class="api-config-modal-body">
          ${status === 'quota_exceeded' ? `
            <div class="api-config-modal-tip" style="background: #fef3c7; border-color: #f59e0b;">
              <strong>提示：</strong>请前往 <a href="https://cloud.siliconflow.cn" target="_blank">硅基流动控制台</a> 充值后再使用
            </div>
          ` : status === 'rate_limited' ? `
            <div class="api-config-modal-tip" style="background: #fef3c7; border-color: #f59e0b;">
              <strong>提示：</strong>请等待几秒后重试，或者升级您的 API 套餐
            </div>
          ` : status === 'network_error' || status === 'timeout' ? `
            <div class="api-config-modal-tip" style="background: #fee2e2; border-color: #ef4444;">
              <strong>提示：</strong>请检查您的网络连接，或尝试使用其他网络
            </div>
          ` : `
            <div class="api-config-modal-form">
              <div class="api-config-modal-field">
                <label class="api-config-modal-label" for="apiConfigKey">API 密钥</label>
                <div class="api-config-modal-input-group">
                  <input type="password" id="apiConfigKey" class="api-config-modal-input" 
                    value="${this.apiKey || ''}" placeholder="请输入 API 密钥">
                  <button type="button" class="api-config-modal-toggle" onclick="API.toggleConfigPassword()">
                    👁️
                  </button>
                </div>
              </div>
              
              <div class="api-config-modal-tip">
                <strong>获取密钥：</strong>
                <a href="https://cloud.siliconflow.cn/i/DG53MZpo" target="_blank">前往硅基流动控制台</a>
                注册并创建 API Key
              </div>
            </div>
          `}
        </div>
        
        <div class="api-config-modal-footer">
          ${status === 'rate_limited' ? `
            <button class="btn btn-primary" onclick="API.closeConfigModal()">知道了</button>
          ` : status === 'network_error' || status === 'timeout' ? `
            <button class="btn btn-secondary" onclick="API.closeConfigModal()">关闭</button>
            <button class="btn btn-primary" onclick="API.retryFromModal()">重试</button>
          ` : status === 'quota_exceeded' ? `
            <button class="btn btn-secondary" onclick="API.closeConfigModal()">关闭</button>
            <button class="btn btn-primary" onclick="window.open('https://cloud.siliconflow.cn', '_blank')">
              前往充值
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="API.closeConfigModal()">取消</button>
            <button class="btn btn-primary" onclick="API.saveConfigFromModal()">
              <span id="apiConfigSaveText">保存并验证</span>
            </button>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // 添加动画
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeConfigModal();
      }
    });
  },

  /**
   * 关闭配置弹窗
   */
  closeConfigModal() {
    const modal = document.getElementById('apiConfigModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 切换密码显示
   */
  toggleConfigPassword() {
    const input = document.getElementById('apiConfigKey');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },

  /**
   * 重试连接
   */
  async retryFromModal() {
    this.closeConfigModal();
    // 强制重新验证
    this.keyStatus = 'unknown';
    this.lastValidation = null;
  },

  /**
   * 从弹窗保存配置
   */
  async saveConfigFromModal() {
    const keyInput = document.getElementById('apiConfigKey');
    const saveBtn = document.querySelector('#apiConfigModal .btn-primary');
    const saveText = document.getElementById('apiConfigSaveText');

    if (!keyInput || !keyInput.value.trim()) {
      Utils.showToast('请输入 API 密钥', 'error');
      return;
    }

    // 显示加载状态
    if (saveBtn) saveBtn.disabled = true;
    if (saveText) saveText.textContent = '验证中...';

    try {
      await this.setApiKey(keyInput.value.trim());

      // 重置验证缓存
      this.keyStatus = 'unknown';
      this.lastValidation = null;

      // 验证新的密钥
      const result = await this.validateKey(true);

      if (result.valid) {
        Utils.showToast('API 配置成功！', 'success');
        this.closeConfigModal();
      } else {
        Utils.showToast(result.message, 'error');
        if (saveText) saveText.textContent = '保存并验证';
        if (saveBtn) saveBtn.disabled = false;
      }
    } catch (error) {
      Utils.showToast('保存失败：' + error.message, 'error');
      if (saveText) saveText.textContent = '保存并验证';
      if (saveBtn) saveBtn.disabled = false;
    }
  },

  /**
   * 添加配置弹窗样式
   */
  addConfigModalStyles() {
    if (document.getElementById('api-config-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'api-config-modal-styles';
    style.textContent = `
      .api-config-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        padding: var(--spacing-md);
      }

      .api-config-modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .api-config-modal {
        background: var(--bg-card);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        max-width: 420px;
        width: 100%;
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }

      .api-config-modal-overlay.active .api-config-modal {
        transform: scale(1) translateY(0);
      }

      .api-config-modal-header {
        text-align: center;
        padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
      }

      .api-config-modal-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin: 0 auto var(--spacing-md);
      }

      .api-config-modal-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .api-config-modal-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin: 0;
      }

      .api-config-modal-error {
        font-size: var(--font-size-xs);
        color: var(--color-error);
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: #fef2f2;
        border-radius: var(--radius-md);
      }

      .api-config-modal-body {
        padding: 0 var(--spacing-lg) var(--spacing-lg);
      }

      .api-config-modal-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .api-config-modal-field {
        display: block;
      }

      .api-config-modal-label {
        display: block;
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }

      .api-config-modal-input {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        background: var(--bg-primary);
        color: var(--text-primary);
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .api-config-modal-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .api-config-modal-input::placeholder {
        color: var(--text-tertiary);
      }

      .api-config-modal-input-group {
        display: flex;
        gap: var(--spacing-xs);
      }

      .api-config-modal-input-group .api-config-modal-input {
        flex: 1;
      }

      .api-config-modal-toggle {
        padding: var(--spacing-sm);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--bg-secondary);
        cursor: pointer;
        transition: background 0.2s;
      }

      .api-config-modal-toggle:hover {
        background: var(--bg-tertiary);
      }

      .api-config-modal-tip {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--color-primary);
      }

      .api-config-modal-tip a {
        color: var(--color-primary);
        text-decoration: none;
      }

      .api-config-modal-tip a:hover {
        text-decoration: underline;
      }

      .api-config-modal-footer {
        display: flex;
        gap: var(--spacing-sm);
        padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
        border-top: 1px solid var(--border-color);
      }

      .api-config-modal-footer .btn {
        flex: 1;
      }

      @media (max-width: 480px) {
        .api-config-modal {
          margin: var(--spacing-md);
        }

        .api-config-modal-header {
          padding: var(--spacing-lg) var(--spacing-md) var(--spacing-sm);
        }

        .api-config-modal-body {
          padding: 0 var(--spacing-md) var(--spacing-md);
        }

        .api-config-modal-footer {
          padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.API = API;
