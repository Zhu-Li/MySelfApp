/**
 * settings-renderer.js - 设置页面渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：设置页面渲染、个人资料、API配置、数据管理
 */

/**
 * 渲染设置页
 */
App.renderSettings = async function() {
  const container = document.getElementById('mainContent');
  const currentTheme = Theme.get();
  const hasApiKey = API.isConfigured();
  const currentModel = API.model;
  const profile = await Storage.getProfile() || {};

  container.innerHTML = `
    <div class="page-container animate-fade-in">
      <h1 class="settings-title">设置</h1>

      <!-- 个人资料 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">个人资料</h3>
        </div>
        <div class="card-body">
          <div class="profile-form-grid">
            <div class="input-group">
              <label class="input-label">姓名</label>
              <input type="text" class="input-field" id="profileName" 
                     placeholder="请输入姓名" value="${profile.name || ''}" maxlength="20">
            </div>
            
            <div class="input-group">
              <label class="input-label">性别</label>
              <select class="input-field" id="profileGender">
                <option value="">请选择</option>
                <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>男</option>
                <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>女</option>
                <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            
            <div class="input-group">
              <label class="input-label">出生日期</label>
              <div class="birthday-selects">
                <select class="input-field" id="profileBirthYear">
                  <option value="">年</option>
                  ${this.generateYearOptions(profile.birthday)}
                </select>
                <select class="input-field" id="profileBirthMonth">
                  <option value="">月</option>
                  ${this.generateMonthOptions(profile.birthday)}
                </select>
                <select class="input-field" id="profileBirthDay">
                  <option value="">日</option>
                  ${this.generateDayOptions(profile.birthday)}
                </select>
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">联系方式</label>
              <input type="text" class="input-field" id="profileContact" 
                     placeholder="手机号/邮箱/微信" value="${profile.contact || ''}" maxlength="50">
            </div>
          </div>
          
          <div class="input-group mt-md">
            <label class="input-label">个人简介</label>
            <textarea class="input-field" id="profileBio" rows="2" 
                      placeholder="一句话介绍自己" maxlength="100">${profile.bio || ''}</textarea>
          </div>
          
          ${profile.birthday ? `
            <div class="profile-age-display mt-md">
              <span class="text-secondary">当前年龄：</span>
              <span class="text-primary font-semibold">${this.calculateAge(profile.birthday)} 岁</span>
            </div>
          ` : ''}
          
          <div class="mt-lg">
            <button class="btn btn-primary" onclick="App.saveProfile()">保存资料</button>
          </div>
        </div>
      </div>

      <!-- 主题设置 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">外观设置</h3>
        </div>
        <div class="card-body">
          <div class="settings-item">
            <div class="settings-item-info">
              <h4 class="settings-item-title">主题模式</h4>
              <p class="settings-item-desc">选择浅色或深色主题</p>
            </div>
            <div class="settings-item-action theme-buttons">
              <button class="btn btn-sm ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" 
                      onclick="App.setTheme('light')">
                ☀️ 浅色
              </button>
              <button class="btn btn-sm ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" 
                      onclick="App.setTheme('dark')">
                🌙 深色
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- API 设置 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">AI 服务配置</h3>
        </div>
        <div class="card-body">
          <div class="input-group mb-lg">
            <label class="input-label">API 密钥</label>
            <div class="password-input-wrapper">
              <input type="password" class="input-field" id="settingsApiKey" 
                     placeholder="${hasApiKey ? '已配置（输入新密钥以更新）' : '请输入硅基流动 API Key'}">
              <button type="button" class="password-toggle btn btn-ghost btn-sm" 
                      onclick="App.togglePassword('settingsApiKey')">👁️</button>
            </div>
            <span class="input-hint">可在 <a href="https://cloud.siliconflow.cn/i/DG53MZpo" target="_blank">硅基流动控制台</a> 获取</span>
          </div>

          <div class="input-group mb-lg">
            <label class="input-label">AI 模型</label>
            <select class="input-field" id="settingsModel">
              <option value="deepseek-ai/DeepSeek-V3" ${currentModel === 'deepseek-ai/DeepSeek-V3' ? 'selected' : ''}>DeepSeek-V3（推荐）</option>
              <option value="deepseek-ai/DeepSeek-V2.5" ${currentModel === 'deepseek-ai/DeepSeek-V2.5' ? 'selected' : ''}>DeepSeek-V2.5</option>
              <option value="Qwen/Qwen2.5-72B-Instruct" ${currentModel === 'Qwen/Qwen2.5-72B-Instruct' ? 'selected' : ''}>Qwen2.5-72B</option>
              <option value="Qwen/Qwen2.5-32B-Instruct" ${currentModel === 'Qwen/Qwen2.5-32B-Instruct' ? 'selected' : ''}>Qwen2.5-32B</option>
            </select>
          </div>

          <div class="settings-buttons">
            <button class="btn btn-primary" onclick="App.saveApiSettings()">保存配置</button>
            <button class="btn btn-secondary" onclick="App.testApiConnection()">测试连接</button>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">数据管理</h3>
        </div>
        <div class="card-body">
          <!-- 图片数据卡片（推荐） -->
          <div class="settings-section-title mb-md">
            <span class="badge badge-primary">推荐</span>
            <span>数据卡片</span>
          </div>
          
          <div class="settings-item mb-lg">
            <div class="settings-item-info">
              <h4 class="settings-item-title">导出数据包</h4>
              <p class="settings-item-desc">生成数据卡片 + 完整数据 ZIP 包</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.exportAsImage()">生成数据包</button>
          </div>

          <div class="settings-item mb-lg">
            <div class="settings-item-info">
              <h4 class="settings-item-title">导入数据</h4>
              <p class="settings-item-desc">支持 ZIP 数据包</p>
            </div>
            <div>
              <input type="file" id="importImageFile" accept="*/*" style="display: none;" onchange="App.importFromImage(event)">
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('importImageFile').click()">选择文件</button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="settings-item">
            <div class="settings-item-info">
              <h4 class="settings-item-title text-danger">清除所有数据</h4>
              <p class="settings-item-desc">永久删除，不可撤销</p>
            </div>
            <button class="btn btn-danger btn-sm" onclick="App.confirmEmergencyClear()">清除</button>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">关于</h3>
        </div>
        <div class="card-body">
          <div class="about-header mb-lg">
            <span class="about-icon">🔮</span>
            <div>
              <h4 class="about-title">观己</h4>
              <p class="about-version">版本 ${Changelog.currentVersion}</p>
            </div>
          </div>
          <p class="about-desc mb-lg">
            静观己心，内外澄明。帮助你全方位了解自己的性格特征与内在世界。
          </p>
          
          <a href="#/changelog" class="btn btn-outline btn-block mb-md">
            📋 查看更新日志
          </a>
          
          <a href="#/feedback" class="btn btn-primary btn-block mb-md">
            💬 意见反馈
          </a>
          
          <div class="text-center">
            <a href="#/donate" class="text-tertiary" style="font-size: var(--font-size-xs);">
              觉得好用？支持一下开发者
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // 添加设置页面样式
  this.addSettingsStyles();
};

/**
 * 添加设置页面样式
 */
App.addSettingsStyles = function() {
  if (document.getElementById('settings-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'settings-styles';
  style.textContent = `
    .settings-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: var(--spacing-lg);
    }
    .profile-form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
    .birthday-selects {
      display: flex;
      gap: var(--spacing-sm);
    }
    .birthday-selects select {
      flex: 1;
      min-width: 0;
    }
    .profile-age-display {
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      display: inline-block;
    }
    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
    }
    .settings-item-info {
      flex: 1;
      min-width: 0;
    }
    .settings-item-title {
      font-weight: 500;
      margin-bottom: 2px;
    }
    .settings-item-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
    .settings-buttons {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }
    .settings-section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-primary);
    }
    .theme-buttons {
      display: flex;
      gap: var(--spacing-xs);
    }
    .about-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    .about-icon {
      font-size: 2rem;
    }
    .about-title {
      font-weight: 700;
    }
    .about-version {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    .about-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .settings-title {
        font-size: var(--font-size-xl);
      }
      .profile-form-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 480px) {
      .settings-title {
        font-size: var(--font-size-lg);
      }
      .settings-item {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
      }
      .settings-item-action {
        align-self: flex-start;
      }
      .theme-buttons {
        width: 100%;
      }
      .theme-buttons .btn {
        flex: 1;
      }
      .settings-buttons {
        flex-direction: column;
      }
      .settings-buttons .btn {
        width: 100%;
      }
      .about-icon {
        font-size: 1.5rem;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * 计算年龄
 * @param {string} birthday - 生日字符串 (YYYY-MM-DD)
 * @returns {number} 年龄
 */
App.calculateAge = function(birthday) {
  if (!birthday) return 0;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * 生成年份选项
 * @param {string} birthday - 当前生日
 * @returns {string} HTML选项字符串
 */
App.generateYearOptions = function(birthday) {
  const currentYear = new Date().getFullYear();
  const selectedYear = birthday ? new Date(birthday).getFullYear() : null;
  let options = '';
  for (let year = currentYear; year >= currentYear - 100; year--) {
    options += `<option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>`;
  }
  return options;
};

/**
 * 生成月份选项
 * @param {string} birthday - 当前生日
 * @returns {string} HTML选项字符串
 */
App.generateMonthOptions = function(birthday) {
  const selectedMonth = birthday ? new Date(birthday).getMonth() + 1 : null;
  let options = '';
  for (let month = 1; month <= 12; month++) {
    options += `<option value="${month}" ${selectedMonth === month ? 'selected' : ''}>${month}</option>`;
  }
  return options;
};

/**
 * 生成日期选项
 * @param {string} birthday - 当前生日
 * @returns {string} HTML选项字符串
 */
App.generateDayOptions = function(birthday) {
  const selectedDay = birthday ? new Date(birthday).getDate() : null;
  let options = '';
  for (let day = 1; day <= 31; day++) {
    options += `<option value="${day}" ${selectedDay === day ? 'selected' : ''}>${day}</option>`;
  }
  return options;
};

/**
 * 保存个人资料
 */
App.saveProfile = async function() {
  const name = document.getElementById('profileName').value.trim();
  const gender = document.getElementById('profileGender').value;
  const birthYear = document.getElementById('profileBirthYear').value;
  const birthMonth = document.getElementById('profileBirthMonth').value;
  const birthDay = document.getElementById('profileBirthDay').value;
  const contact = document.getElementById('profileContact').value.trim();
  const bio = document.getElementById('profileBio').value.trim();

  // 组合生日
  let birthday = '';
  if (birthYear && birthMonth && birthDay) {
    birthday = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
  }

  try {
    await Storage.updateProfile({
      name,
      gender,
      birthday,
      contact,
      bio
    });
    
    Utils.showToast('个人资料已保存', 'success');
    // 重新渲染以更新年龄显示
    this.renderSettings();
  } catch (error) {
    console.error('保存个人资料失败:', error);
    Utils.showToast('保存失败', 'error');
  }
};

/**
 * 设置主题
 * @param {string} theme - 主题名称
 */
App.setTheme = async function(theme) {
  await Theme.set(theme);
  // 重新渲染设置页以更新按钮状态
  this.renderSettings();
};

/**
 * 保存 API 设置
 */
App.saveApiSettings = async function() {
  const apiKey = document.getElementById('settingsApiKey').value;
  const model = document.getElementById('settingsModel').value;

  try {
    if (apiKey) {
      await API.setApiKey(apiKey);
    }
    await API.setModel(model);
    
    Utils.showToast('配置已保存', 'success');
  } catch (error) {
    Utils.showToast('保存失败', 'error');
  }
};

/**
 * 测试 API 连接
 */
App.testApiConnection = async function() {
  if (!API.isConfigured()) {
    Utils.showToast('请先配置 API 密钥', 'warning');
    return;
  }

  Utils.showLoading('正在测试连接...');

  try {
    await API.testConnection();
    Utils.hideLoading();
    Utils.showToast('连接成功！', 'success');
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast(`连接失败: ${error.message}`, 'error');
  }
};

/**
 * 导出数据
 */
App.exportData = async function() {
  try {
    const data = await Storage.exportAll();
    const json = JSON.stringify(data, null, 2);
    const filename = `myself-backup-${Utils.formatDate(new Date(), 'YYYYMMDD-HHmmss')}.json`;
    Utils.downloadFile(json, filename);
    Utils.showToast('数据导出成功', 'success');
  } catch (error) {
    Utils.showToast('导出失败', 'error');
  }
};

/**
 * 导入数据
 * @param {Event} event - 文件选择事件
 */
App.importData = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const content = await Utils.readFile(file);
    const data = JSON.parse(content);
    
    const confirmed = await Utils.confirm('导入将覆盖现有数据，确定继续吗？');
    if (!confirmed) return;

    await Storage.importAll(data);
    Utils.showToast('数据导入成功', 'success');
    
    // 刷新页面
    location.reload();
  } catch (error) {
    Utils.showToast('导入失败: 无效的数据格式', 'error');
  }

  // 清空文件选择
  event.target.value = '';
};

/**
 * 导出为图片数据卡片
 */
App.exportAsImage = async function() {
  try {
    const success = await DataCard.exportAsImage();
    // DataCard.exportAsImage 内部已处理 toast 提示，这里不需要重复提示
    if (!success) {
      // 用户取消，不显示任何提示
      return;
    }
  } catch (error) {
    console.error('导出图片失败:', error);
    Utils.showToast('生成失败: ' + error.message, 'error');
  }
};

/**
 * 从图片导入数据
 * @param {Event} event - 文件选择事件
 */
App.importFromImage = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    Utils.showToast('正在解析数据卡片...', 'info');
    
    const confirmed = await Utils.confirm('导入将覆盖现有数据，确定继续吗？');
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    await DataCard.importFromImage(file);
    Utils.showToast('数据导入成功', 'success');
    
    // 刷新页面
    location.reload();
  } catch (error) {
    console.error('导入图片失败:', error);
    Utils.showToast('导入失败: ' + error.message, 'error');
  }

  // 清空文件选择
  event.target.value = '';
};

/**
 * 切换密码显示
 * @param {string} inputId - 输入框ID
 */
App.togglePassword = function(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};
