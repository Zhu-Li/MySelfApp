/**
 * novel-tts.js - 小说语音朗读模块
 * 观己 - 静观己心，内外澄明
 * 
 * 职责：使用 Web Speech API 实现章节内容语音朗读
 * 特性：逐段朗读、段落高亮、自动滚动、暂停/继续/停止
 */

const NovelTTS = {
  // ========== 状态 ==========
  supported: false,
  state: 'stopped',        // stopped | playing | paused
  currentIndex: 0,         // 当前朗读段落索引
  paragraphEls: [],        // 段落 DOM 元素数组
  voices: [],              // 全部可用语音
  chineseVoices: [],       // 中文语音

  // ========== 初始化 ==========

  /**
   * 初始化 TTS，检测支持性，加载语音列表
   */
  init() {
    if (!('speechSynthesis' in window)) {
      this.supported = false;
      return;
    }
    this.supported = true;
    this._loadVoices();
    // 某些浏览器异步加载语音
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this._loadVoices();
    }
  },

  /**
   * 加载并筛选中文语音
   */
  _loadVoices() {
    this.voices = speechSynthesis.getVoices();
    this.chineseVoices = this.voices.filter(v =>
      v.lang.startsWith('zh') || v.lang.startsWith('cmn')
    );
  },

  /**
   * 获取当前应使用的语音
   */
  _getVoice() {
    const saved = Novel.settings.tts && Novel.settings.tts.voiceURI;
    if (saved) {
      const match = this.voices.find(v => v.voiceURI === saved);
      if (match) return match;
    }
    // 优先选中文语音
    if (this.chineseVoices.length > 0) return this.chineseVoices[0];
    // 无中文语音时用默认
    return this.voices[0] || null;
  },

  // ========== 核心控制 ==========

  /**
   * 开始朗读（从指定段落索引开始）
   */
  speak(startIndex) {
    if (!this.supported) return;

    // iOS 手势唤醒
    this._iosWakeup();

    // 先停止之前的朗读
    speechSynthesis.cancel();

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
    speechSynthesis.pause();
    this.state = 'paused';
    this._updateUI();
  },

  /**
   * 继续朗读
   */
  resume() {
    if (this.state !== 'paused') return;
    speechSynthesis.resume();
    this.state = 'playing';
    this._updateUI();
  },

  /**
   * 停止朗读
   */
  stop() {
    speechSynthesis.cancel();
    this.state = 'stopped';
    this.currentIndex = 0;
    this._clearHighlight();
    this._updateUI();
  },

  // ========== 内部朗读逻辑 ==========

  /**
   * 朗读当前段落
   */
  _speakCurrent() {
    if (this.state !== 'playing') return;
    if (this.currentIndex >= this.paragraphEls.length) {
      // 全部朗读完毕
      this.stop();
      return;
    }

    const el = this.paragraphEls[this.currentIndex];
    const text = (el.textContent || '').trim();

    // 空段落跳过
    if (!text) {
      this.currentIndex++;
      this._speakCurrent();
      return;
    }

    // 高亮当前段落
    this._highlightParagraph(this.currentIndex);

    // 创建 utterance
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this._getVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'zh-CN';
    utterance.rate = (Novel.settings.tts && Novel.settings.tts.rate) || 1.0;
    utterance.volume = (Novel.settings.tts && Novel.settings.tts.volume) || 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (this.state === 'playing') {
        this.currentIndex++;
        this._speakCurrent();
      }
    };

    utterance.onerror = (e) => {
      // interrupted 是正常的（手动停止导致）
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('TTS error:', e.error);
      // 尝试下一段
      if (this.state === 'playing') {
        this.currentIndex++;
        this._speakCurrent();
      }
    };

    speechSynthesis.speak(utterance);
  },

  // ========== 高亮与滚动 ==========

  /**
   * 高亮指定段落并自动滚动
   */
  _highlightParagraph(index) {
    this._clearHighlight();
    const el = this.paragraphEls[index];
    if (!el) return;
    el.classList.add('tts-active');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /**
   * 清除所有高亮
   */
  _clearHighlight() {
    this.paragraphEls.forEach(el => el.classList.remove('tts-active'));
  },

  // ========== UI 更新 ==========

  /**
   * 更新底栏朗读按钮状态
   */
  _updateUI() {
    const reader = NovelRenderer._readerEl;
    if (!reader) return;

    const ttsBtn = reader.querySelector('#readerTtsBtn');
    if (!ttsBtn) return;

    switch (this.state) {
      case 'stopped':
        ttsBtn.innerHTML = '<span>🔊</span><span>朗读</span>';
        ttsBtn.classList.remove('tts-playing', 'tts-paused');
        break;
      case 'playing':
        ttsBtn.innerHTML = '<span>⏸</span><span>暂停</span>';
        ttsBtn.classList.add('tts-playing');
        ttsBtn.classList.remove('tts-paused');
        break;
      case 'paused':
        ttsBtn.innerHTML = '<span>▶</span><span>继续</span>';
        ttsBtn.classList.remove('tts-playing');
        ttsBtn.classList.add('tts-paused');
        break;
    }
  },

  // ========== 工具 ==========

  /**
   * iOS Safari 需要用户手势初始化 speechSynthesis
   */
  _iosWakeup() {
    if (this._iosReady) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const dummy = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(dummy);
      speechSynthesis.cancel();
    }
    this._iosReady = true;
  },

  /**
   * 处理朗读按钮点击（切换播放/暂停/停止）
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

// 页面加载后初始化
NovelTTS.init();

// 导出到全局
window.NovelTTS = NovelTTS;
