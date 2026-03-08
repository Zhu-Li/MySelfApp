/**
 * novel-tts.js - 小说语音朗读模块
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：使用服务端 Edge TTS 生成音频，前端通过 HTML5 Audio 播放
 * 特性：逐段朗读、段落高亮、自动滚动、暂停/继续/停止、预加载下一段
 */

const NovelTTS = {
  // ========== 状态 ==========
  supported: false,        // 是否可用（服务端 TTS 或 Web Speech API）
  state: 'stopped',        // stopped | playing | paused
  currentIndex: 0,         // 当前朗读段落索引
  paragraphEls: [],        // 段落 DOM 元素数组
  _voices: [],             // 服务端语音列表
  _defaultVoice: 'zh-CN-XiaoxiaoNeural',
  _useServerTTS: false,    // 服务端 TTS 是否可用
  _audioEl: null,          // HTML5 Audio 元素
  _prefetchUrl: null,      // 预加载的下一段音频 URL
  _prefetchAudio: null,    // 预加载的 Audio 对象

  // ========== 初始化 ==========

  /**
   * 初始化 TTS：优先检测服务端 Edge TTS，回退到 Web Speech API
   */
  async init() {
    // 尝试服务端 TTS
    try {
      const resp = await fetch('/api/novel/tts/voices');
      if (resp.ok) {
        const data = await resp.json();
        this._voices = data.voices || [];
        this._defaultVoice = data.default || 'zh-CN-XiaoxiaoNeural';
        this._useServerTTS = true;
        this.supported = true;
        return;
      }
    } catch (e) {
      // 服务端不可用
    }

    // 回退：Web Speech API（仅桌面浏览器可能有效）
    if ('speechSynthesis' in window) {
      this.supported = true;
      this._useServerTTS = false;
      this._loadWebSpeechVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this._loadWebSpeechVoices();
      }
    }
  },

  /**
   * 加载 Web Speech API 语音（回退方案）
   */
  _loadWebSpeechVoices() {
    const all = speechSynthesis.getVoices();
    const zhVoices = all.filter(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
    this._voices = zhVoices.map(v => ({
      id: v.voiceURI,
      name: v.name,
      gender: '',
      locale: v.lang,
      _webVoice: v
    }));
  },

  // ========== 核心控制 ==========

  /**
   * 开始朗读（从指定段落索引开始）
   */
  speak(startIndex) {
    if (!this.supported) return;

    // 先停止之前的朗读
    this._stopInternal();

    // 收集段落元素
    const reader = NovelRenderer._readerEl;
    if (!reader) return;
    const inner = reader.querySelector('#readerContentInner');
    if (!inner) return;
    this.paragraphEls = Array.from(inner.querySelectorAll('p:not(.chapter-heading)'));

    if (this.paragraphEls.length === 0) return;

    this.currentIndex = (startIndex >= 0 && startIndex < this.paragraphEls.length) ? startIndex : 0;
    this.state = 'playing';
    this._updateUI();
    this._speakCurrent();
  },

  /**
   * 暂停朗读
   */
  pause() {
    if (this.state !== 'playing') return;
    if (this._useServerTTS) {
      if (this._audioEl) this._audioEl.pause();
    } else {
      speechSynthesis.pause();
    }
    this.state = 'paused';
    this._updateUI();
  },

  /**
   * 继续朗读
   */
  resume() {
    if (this.state !== 'paused') return;
    if (this._useServerTTS) {
      if (this._audioEl) this._audioEl.play();
    } else {
      speechSynthesis.resume();
    }
    this.state = 'playing';
    this._updateUI();
  },

  /**
   * 停止朗读
   */
  stop() {
    this._stopInternal();
    this.state = 'stopped';
    this.currentIndex = 0;
    this._clearHighlight();
    this._updateUI();
  },

  /**
   * 内部停止（不更新 UI）
   */
  _stopInternal() {
    if (this._useServerTTS) {
      if (this._audioEl) {
        this._audioEl.pause();
        this._audioEl.removeAttribute('src');
        this._audioEl = null;
      }
      this._prefetchUrl = null;
      this._prefetchAudio = null;
    } else {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    }
  },

  // ========== 内部朗读逻辑 ==========

  /**
   * 朗读当前段落
   */
  _speakCurrent() {
    if (this.state !== 'playing') return;
    if (this.currentIndex >= this.paragraphEls.length) {
      this.stop();
      return;
    }

    const el = this.paragraphEls[this.currentIndex];
    const text = (el.textContent || '').trim();

    // 空段落或纯符号段落跳过（如分隔线 ---、***）
    if (!text || /^[\s\-=*·_—…]+$/.test(text)) {
      this.currentIndex++;
      this._speakCurrent();
      return;
    }

    // 高亮当前段落
    this._highlightParagraph(this.currentIndex);

    if (this._useServerTTS) {
      this._speakServerTTS(text);
    } else {
      this._speakWebSpeech(text);
    }
  },

  /**
   * 服务端 TTS 朗读
   */
  _speakServerTTS(text) {
    const voice = this._getCurrentVoice();
    const rate = this._getRateParam();
    const audioUrl = '/api/novel/tts?text=' + encodeURIComponent(text) +
      '&voice=' + encodeURIComponent(voice) +
      '&rate=' + encodeURIComponent(rate);

    // 如果预加载的正好是这个 URL，直接使用
    if (this._prefetchUrl === audioUrl && this._prefetchAudio) {
      this._audioEl = this._prefetchAudio;
      this._prefetchUrl = null;
      this._prefetchAudio = null;
    } else {
      this._audioEl = new Audio(audioUrl);
    }

    this._audioEl.onended = () => {
      if (this.state !== 'playing') return;
      this.currentIndex++;
      this._speakCurrent();
    };

    this._audioEl.onerror = () => {
      console.warn('TTS audio error for paragraph', this.currentIndex);
      if (this.state === 'playing') {
        this.currentIndex++;
        this._speakCurrent();
      }
    };

    this._audioEl.play().catch(err => {
      console.warn('TTS play error:', err.message);
      if (this.state === 'playing') {
        this.currentIndex++;
        this._speakCurrent();
      }
    });

    // 预加载下一段
    this._prefetchNext();
  },

  /**
   * 预加载下一段音频
   */
  _prefetchNext() {
    const nextIdx = this.currentIndex + 1;
    if (nextIdx >= this.paragraphEls.length) return;

    // 跳过空段落找到下一个有文本的段落
    let targetIdx = nextIdx;
    while (targetIdx < this.paragraphEls.length) {
      const t = (this.paragraphEls[targetIdx].textContent || '').trim();
      if (t) break;
      targetIdx++;
    }
    if (targetIdx >= this.paragraphEls.length) return;

    const nextText = (this.paragraphEls[targetIdx].textContent || '').trim();
    const voice = this._getCurrentVoice();
    const rate = this._getRateParam();
    const nextUrl = '/api/novel/tts?text=' + encodeURIComponent(nextText) +
      '&voice=' + encodeURIComponent(voice) +
      '&rate=' + encodeURIComponent(rate);

    this._prefetchUrl = nextUrl;
    this._prefetchAudio = new Audio();
    this._prefetchAudio.preload = 'auto';
    this._prefetchAudio.src = nextUrl;
  },

  /**
   * Web Speech API 朗读（回退方案）
   */
  _speakWebSpeech(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceId = this._getCurrentVoice();
    const voiceObj = this._voices.find(v => v.id === voiceId);
    if (voiceObj && voiceObj._webVoice) utterance.voice = voiceObj._webVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = (Novel.settings.tts && Novel.settings.tts.rate) || 1.0;
    utterance.volume = (Novel.settings.tts && Novel.settings.tts.volume) || 1.0;

    const startTime = Date.now();
    utterance.onend = () => {
      if (this.state !== 'playing') return;
      // 假播放检测
      if (text.length > 5 && (Date.now() - startTime) < 500) {
        this._failCount = (this._failCount || 0) + 1;
      } else {
        this._failCount = 0;
      }
      if (this._failCount >= 3) {
        this.stop();
        this._showUnsupportedTip();
        return;
      }
      this.currentIndex++;
      this._speakCurrent();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      if (this.state === 'playing') {
        this.currentIndex++;
        this._speakCurrent();
      }
    };

    speechSynthesis.speak(utterance);
  },

  // ========== 语音与语速 ==========

  /**
   * 获取当前选中的语音 ID（确保是有效的 Edge TTS ShortName）
   */
  _getCurrentVoice() {
    const saved = Novel.settings.tts && Novel.settings.tts.voiceURI;
    if (saved && this._useServerTTS) {
      // 校验已保存的语音是否在服务端语音列表中
      const match = this._voices.find(v => v.id === saved);
      if (match) return saved;
      // 旧版 Web Speech API 的 voiceURI 无效，重置为默认
      Novel.settings.tts.voiceURI = this._defaultVoice;
      Novel.saveSettings();
      return this._defaultVoice;
    }
    if (saved) return saved;
    return this._defaultVoice;
  },

  /**
   * 获取 Edge TTS 语速参数（格式: "+20%", "-10%", "+0%"）
   */
  _getRateParam() {
    const rate = (Novel.settings.tts && Novel.settings.tts.rate) || 1.0;
    const percent = Math.round((rate - 1.0) * 100);
    return (percent >= 0 ? '+' : '') + percent + '%';
  },

  // ========== 高亮与滚动 ==========

  _highlightParagraph(index) {
    this._clearHighlight();
    const el = this.paragraphEls[index];
    if (!el) return;
    el.classList.add('tts-active');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  _clearHighlight() {
    this.paragraphEls.forEach(el => el.classList.remove('tts-active'));
  },

  // ========== UI 更新 ==========

  _updateUI() {
    const reader = NovelRenderer._readerEl;
    if (!reader) return;

    const ttsBtn = reader.querySelector('#readerTtsBtn');
    if (!ttsBtn) return;

    switch (this.state) {
      case 'stopped':
        ttsBtn.innerHTML = '<span>&#x1f50a;</span><span>\u6717\u8bfb</span>';
        ttsBtn.classList.remove('tts-playing', 'tts-paused');
        break;
      case 'playing':
        ttsBtn.innerHTML = '<span>&#x23f8;</span><span>\u6682\u505c</span>';
        ttsBtn.classList.add('tts-playing');
        ttsBtn.classList.remove('tts-paused');
        break;
      case 'paused':
        ttsBtn.innerHTML = '<span>&#x25b6;</span><span>\u7ee7\u7eed</span>';
        ttsBtn.classList.remove('tts-playing');
        ttsBtn.classList.add('tts-paused');
        break;
    }
  },

  // ========== 工具 ==========

  _showUnsupportedTip() {
    const reader = NovelRenderer._readerEl;
    if (!reader) return;
    const tip = document.createElement('div');
    tip.className = 'novel-tts-tip';
    tip.textContent = '\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u8bed\u97f3\u670d\u52a1\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5';
    reader.appendChild(tip);
    setTimeout(() => {
      tip.style.opacity = '0';
      setTimeout(() => tip.remove(), 400);
    }, 3000);
  },

  /**
   * 切换播放/暂停/停止
   */
  toggle() {
    switch (this.state) {
      case 'stopped':
        this.speak(0);
        break;
      case 'playing':
        this.pause();
        break;
      case 'paused':
        this.resume();
        break;
    }
  }
};

// 初始化（异步，存储 promise 供外部 await）
NovelTTS._initPromise = NovelTTS.init();

// 导出到全局
window.NovelTTS = NovelTTS;
