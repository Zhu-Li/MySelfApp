/**
 * setup-wizard.js - 初始设置向导
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：首次使用的设置向导流程
 */

/**
 * 显示设置向导
 */
App.showSetupModal = function() {
  this.showModal('setupModal');
  this.setupStep = 1;
  this.updateSetupStep();
};

/**
 * 下一步设置
 */
App.nextSetupStep = async function() {
  if (this.setupStep === 2) {
    // 验证密码
    const password = document.getElementById('setupPassword').value;
    const confirm = document.getElementById('setupPasswordConfirm').value;
    
    const validation = Utils.validatePassword(password);
    if (!validation.valid) {
      Utils.showToast(validation.message, 'error');
      return;
    }

    if (password !== confirm) {
      Utils.showToast('两次输入的密码不一致', 'error');
      return;
    }

    // 保存密码
    try {
      await Storage.setPassword(password);
      this.isUnlocked = true;
    } catch (error) {
      Utils.showToast('密码设置失败', 'error');
      return;
    }
  }
  
  if (this.setupStep === 3) {
    // 验证姓名
    const userName = document.getElementById('setupUserName').value.trim();
    
    if (!userName || userName.length < 2) {
      Utils.showToast('请输入至少2个字符的名称', 'error');
      return;
    }
    
    if (userName.length > 20) {
      Utils.showToast('名称不能超过20个字符', 'error');
      return;
    }
    
    // 保存姓名到 profile
    try {
      await Storage.updateProfile({ name: userName });
    } catch (error) {
      Utils.showToast('名称保存失败', 'error');
      return;
    }
  }

  this.setupStep++;
  this.updateSetupStep();
};

/**
 * 上一步设置
 */
App.prevSetupStep = function() {
  if (this.setupStep > 1) {
    this.setupStep--;
    this.updateSetupStep();
  }
};

/**
 * 更新设置步骤显示
 */
App.updateSetupStep = function() {
  document.querySelectorAll('.setup-step').forEach(step => {
    step.classList.remove('active');
  });
  
  const currentStep = document.querySelector(`.setup-step[data-step="${this.setupStep}"]`);
  if (currentStep) {
    currentStep.classList.add('active');
  }
};

/**
 * 完成设置
 */
App.completeSetup = async function() {
  const apiKey = document.getElementById('setupApiKey').value;
  const model = document.getElementById('setupModel').value;

  try {
    // 保存 API 配置
    if (apiKey) {
      await API.setApiKey(apiKey);
    }
    await API.setModel(model);

    // 初始化 API
    await API.init();

    // 隐藏设置模态框
    this.hideModal('setupModal');

    // 注册路由并启动
    this.registerRoutes();
    Router.init();

    Utils.showToast('设置完成，欢迎使用「观己」！', 'success');

  } catch (error) {
    console.error('完成设置失败:', error);
    Utils.showToast('设置保存失败', 'error');
  }
};
