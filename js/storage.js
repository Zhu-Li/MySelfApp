/**
 * storage.js - IndexedDB 存储层（支持加密）
 * 观己 - 静观己心，内外澄明
 */

const Storage = {
  dbName: 'MySelfApp',
  dbVersion: 1,
  db: null,
  cryptoKey: null,
  isInitialized: false,

  // 存储表定义
  stores: {
    config: { keyPath: 'key' },
    tests: { keyPath: 'id', indexes: [{ name: 'type', keyPath: 'type' }, { name: 'timestamp', keyPath: 'timestamp' }] },
    diary: { keyPath: 'id', indexes: [{ name: 'date', keyPath: 'date' }] },
    profile: { keyPath: 'key' }
  },

  /**
   * 初始化数据库
   */
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('数据库打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建存储表
        Object.entries(this.stores).forEach(([name, config]) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: config.keyPath });
            
            // 创建索引
            if (config.indexes) {
              config.indexes.forEach(index => {
                store.createIndex(index.name, index.keyPath, { unique: false });
              });
            }
          }
        });
      };
    });
  },

  /**
   * 从密码派生加密密钥
   */
  async deriveKey(password, salt = null) {
    const encoder = new TextEncoder();
    
    // 如果没有提供 salt，生成新的
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
    } else if (typeof salt === 'string') {
      // 从 Base64 解码
      salt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    }

    // 导入密码作为密钥材料
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // 派生 AES-GCM 密钥
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt };
  },

  /**
   * 设置加密密钥（用户登录后调用）
   */
  async setEncryptionKey(password) {
    // 获取已保存的 salt
    const configSalt = await this.getRaw('config', 'encryptionSalt');
    const salt = configSalt ? configSalt.value : null;

    const { key, salt: newSalt } = await this.deriveKey(password, salt);
    this.cryptoKey = key;

    // 如果是首次设置，保存 salt
    if (!salt) {
      const saltBase64 = btoa(String.fromCharCode(...newSalt));
      await this.setRaw('config', { key: 'encryptionSalt', value: saltBase64 });
    }

    return true;
  },

  /**
   * 验证密码
   */
  async verifyPassword(password) {
    try {
      // 获取已保存的 salt 和验证数据
      const configSalt = await this.getRaw('config', 'encryptionSalt');
      const verifyData = await this.getRaw('config', 'passwordVerify');

      if (!configSalt || !verifyData) {
        return false;
      }

      const { key } = await this.deriveKey(password, configSalt.value);
      
      // 尝试解密验证数据
      try {
        const decrypted = await this.decryptData(verifyData.value, key);
        return decrypted === 'VERIFY_OK';
      } catch (e) {
        return false;
      }
    } catch (e) {
      console.error('密码验证失败:', e);
      return false;
    }
  },

  /**
   * 设置密码
   */
  async setPassword(password) {
    await this.setEncryptionKey(password);
    
    // 保存验证数据
    const encryptedVerify = await this.encryptData('VERIFY_OK');
    await this.setRaw('config', { key: 'passwordVerify', value: encryptedVerify });

    return true;
  },

  /**
   * 检查是否已设置密码
   */
  async hasPassword() {
    const verifyData = await this.getRaw('config', 'passwordVerify');
    return !!verifyData;
  },

  /**
   * 加密数据
   */
  async encryptData(data, key = null) {
    const cryptoKey = key || this.cryptoKey;
    if (!cryptoKey) {
      throw new Error('未设置加密密钥');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(dataString)
    );

    // 将 IV 和加密数据合并后转 Base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  },

  /**
   * 解密数据
   */
  async decryptData(encryptedBase64, key = null) {
    const cryptoKey = key || this.cryptoKey;
    if (!cryptoKey) {
      throw new Error('未设置加密密钥');
    }

    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );

    const decoder = new TextDecoder();
    const text = decoder.decode(decrypted);

    // 尝试解析 JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  },

  /**
   * 原始存储（不加密）
   */
  async setRaw(storeName, data) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 原始读取（不解密）
   */
  async getRaw(storeName, key) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 存储数据（加密敏感字段）
   */
  async set(storeName, data, encryptFields = []) {
    await this.init();

    let dataToStore = { ...data };

    // 加密指定字段
    if (encryptFields.length > 0 && this.cryptoKey) {
      for (const field of encryptFields) {
        if (dataToStore[field] !== undefined) {
          dataToStore[field] = await this.encryptData(dataToStore[field]);
          dataToStore[`${field}_encrypted`] = true;
        }
      }
    }

    return this.setRaw(storeName, dataToStore);
  },

  /**
   * 读取数据（解密加密字段）
   */
  async get(storeName, key) {
    const data = await this.getRaw(storeName, key);
    if (!data) return null;

    // 解密加密字段
    if (this.cryptoKey) {
      for (const field in data) {
        if (data[`${field}_encrypted`]) {
          try {
            data[field.replace('_encrypted', '')] = await this.decryptData(data[field.replace('_encrypted', '')]);
          } catch (e) {
            console.error('解密失败:', field, e);
          }
        }
      }
    }

    return data;
  },

  /**
   * 删除数据
   */
  async delete(storeName, key) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 获取所有数据
   */
  async getAll(storeName) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 通过索引查询
   */
  async getByIndex(storeName, indexName, value) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 清空存储表
   */
  async clear(storeName) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 清空所有数据
   */
  async clearAll() {
    await this.init();

    const promises = Object.keys(this.stores).map(storeName => this.clear(storeName));
    await Promise.all(promises);
    
    this.cryptoKey = null;
  },

  /**
   * 导出所有数据
   */
  async exportAll() {
    await this.init();

    const data = {};
    for (const storeName of Object.keys(this.stores)) {
      data[storeName] = await this.getAll(storeName);
    }

    return {
      version: this.dbVersion,
      exportedAt: new Date().toISOString(),
      data
    };
  },

  /**
   * 导入数据
   */
  async importAll(exportedData) {
    await this.init();

    if (!exportedData || !exportedData.data) {
      throw new Error('无效的导入数据格式');
    }

    for (const [storeName, items] of Object.entries(exportedData.data)) {
      if (this.stores[storeName] && Array.isArray(items)) {
        // 清空现有数据
        await this.clear(storeName);
        
        // 导入新数据
        for (const item of items) {
          await this.setRaw(storeName, item);
        }
      }
    }

    return true;
  },

  // ============ 便捷方法 ============

  /**
   * 获取配置项
   */
  async getConfig(key, defaultValue = null) {
    const result = await this.get('config', key);
    return result ? result.value : defaultValue;
  },

  /**
   * 设置配置项
   */
  async setConfig(key, value, encrypt = false) {
    const data = { key, value };
    if (encrypt && this.cryptoKey) {
      data.value = await this.encryptData(value);
      data.encrypted = true;
    }
    return this.setRaw('config', data);
  },

  /**
   * 保存测试结果
   */
  async saveTest(testData) {
    const data = {
      id: testData.id || Utils.generateId(),
      type: testData.type,
      timestamp: Date.now(),
      ...testData
    };
    return this.set('tests', data);
  },

  /**
   * 获取测试历史
   */
  async getTestHistory(type = null) {
    if (type) {
      return this.getByIndex('tests', 'type', type);
    }
    return this.getAll('tests');
  },

  /**
   * 获取最新测试结果
   */
  async getLatestTest(type) {
    const tests = await this.getByIndex('tests', 'type', type);
    if (tests.length === 0) return null;
    
    // 按时间戳排序，取最新的
    tests.sort((a, b) => b.timestamp - a.timestamp);
    return tests[0];
  },

  /**
   * 保存日记
   */
  async saveDiary(diaryData) {
    const data = {
      id: diaryData.id || Utils.generateId(),
      date: diaryData.date || Utils.formatDate(new Date()),
      timestamp: Date.now(),
      ...diaryData
    };
    return this.set('diary', data, ['content']); // 加密内容字段
  },

  /**
   * 获取用户画像
   */
  async getProfile() {
    return this.get('profile', 'userProfile');
  },

  /**
   * 更新用户画像
   */
  async updateProfile(profileData) {
    const existing = await this.getProfile() || { key: 'userProfile' };
    const updated = {
      ...existing,
      ...profileData,
      lastUpdated: Date.now()
    };
    return this.set('profile', updated);
  },

  // ========== 会话管理 ==========

  /**
   * 会话配置
   */
  sessionConfig: {
    sessionKey: 'guanji_session',
    rememberKey: 'guanji_remember',
    sessionDuration: 30 * 60 * 1000,      // 会话有效期：30分钟
    rememberDuration: 7 * 24 * 60 * 60 * 1000  // 记住我有效期：7天
  },

  /**
   * 创建会话
   * @param {string} password - 用户密码
   * @param {boolean} remember - 是否记住登录
   */
  async createSession(password, remember = false) {
    const now = Date.now();
    
    // 生成会话 token
    const sessionToken = Utils.generateId();
    
    // 会话数据
    const sessionData = {
      token: sessionToken,
      createdAt: now,
      expiresAt: now + (remember ? this.sessionConfig.rememberDuration : this.sessionConfig.sessionDuration)
    };

    // 加密存储密码派生信息（用于恢复加密密钥）
    const configSalt = await this.getRaw('config', 'encryptionSalt');
    if (configSalt) {
      sessionData.salt = configSalt.value;
      // 使用 session token 加密密码（简单混淆，非高安全场景）
      sessionData.encKey = btoa(password.split('').reverse().join('') + ':' + sessionToken.slice(0, 8));
    }

    // 根据是否记住登录选择存储位置
    if (remember) {
      localStorage.setItem(this.sessionConfig.rememberKey, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(this.sessionConfig.sessionKey, JSON.stringify(sessionData));
    }

    return sessionToken;
  },

  /**
   * 恢复会话
   * @returns {boolean} 是否成功恢复会话
   */
  async restoreSession() {
    // 优先检查 sessionStorage，然后检查 localStorage（记住我）
    let sessionData = null;
    let isRemembered = false;

    const sessionStr = sessionStorage.getItem(this.sessionConfig.sessionKey);
    const rememberStr = localStorage.getItem(this.sessionConfig.rememberKey);

    if (sessionStr) {
      try {
        sessionData = JSON.parse(sessionStr);
      } catch (e) {
        sessionStorage.removeItem(this.sessionConfig.sessionKey);
      }
    } else if (rememberStr) {
      try {
        sessionData = JSON.parse(rememberStr);
        isRemembered = true;
      } catch (e) {
        localStorage.removeItem(this.sessionConfig.rememberKey);
      }
    }

    if (!sessionData) return false;

    // 检查是否过期
    const now = Date.now();
    if (now > sessionData.expiresAt) {
      this.clearSession();
      return false;
    }

    // 尝试恢复加密密钥
    if (sessionData.salt && sessionData.encKey) {
      try {
        // 解密密码
        const decoded = atob(sessionData.encKey);
        const parts = decoded.split(':');
        if (parts.length === 2 && parts[1] === sessionData.token.slice(0, 8)) {
          const password = parts[0].split('').reverse().join('');
          
          // 恢复加密密钥
          await this.setEncryptionKey(password);
          
          // 延长会话有效期
          sessionData.expiresAt = now + (isRemembered ? this.sessionConfig.rememberDuration : this.sessionConfig.sessionDuration);
          
          if (isRemembered) {
            localStorage.setItem(this.sessionConfig.rememberKey, JSON.stringify(sessionData));
          } else {
            sessionStorage.setItem(this.sessionConfig.sessionKey, JSON.stringify(sessionData));
          }
          
          return true;
        }
      } catch (e) {
        console.error('会话恢复失败:', e);
      }
    }

    this.clearSession();
    return false;
  },

  /**
   * 清除会话
   */
  clearSession() {
    sessionStorage.removeItem(this.sessionConfig.sessionKey);
    localStorage.removeItem(this.sessionConfig.rememberKey);
    this.cryptoKey = null;
  },

  /**
   * 检查是否有有效会话
   */
  hasValidSession() {
    const sessionStr = sessionStorage.getItem(this.sessionConfig.sessionKey);
    const rememberStr = localStorage.getItem(this.sessionConfig.rememberKey);
    
    const sessionData = sessionStr ? JSON.parse(sessionStr) : (rememberStr ? JSON.parse(rememberStr) : null);
    
    if (!sessionData) return false;
    return Date.now() < sessionData.expiresAt;
  }
};

// 导出到全局
window.Storage = Storage;
