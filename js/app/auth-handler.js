/**
 * auth-handler.js - 认证处理
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：密码解锁、紧急清除数据
 */

/**
 * 显示解锁模态框
 */
App.showUnlockModal = function() {
  this.showModal('unlockModal');
  // 聚焦密码输入框
  setTimeout(() => {
    document.getElementById('unlockPassword')?.focus();
  }, 100);
};

/**
 * 解锁应用
 * @param {Event} event - 表单提交事件
 */
App.unlock = async function(event) {
  if (event) event.preventDefault();

  const password = document.getElementById('unlockPassword').value;
  const rememberMe = document.getElementById('rememberMe')?.checked || false;
  
  if (!password) {
    Utils.showToast('请输入密码', 'error');
    return;
  }

  try {
    const valid = await Storage.verifyPassword(password);
    if (!valid) {
      Utils.showToast('密码错误', 'error');
      document.getElementById('unlockPassword').value = '';
      return;
    }

    // 设置加密密钥
    await Storage.setEncryptionKey(password);
    
    // 创建会话
    await Storage.createSession(password, rememberMe);
    
    this.isUnlocked = true;

    // 初始化 API
    await API.init();

    // 隐藏解锁模态框
    this.hideModal('unlockModal');

    // 注册路由并启动
    this.registerRoutes();
    Router.init();

    Utils.showToast('欢迎回来！', 'success');

  } catch (error) {
    console.error('解锁失败:', error);
    Utils.showToast('解锁失败', 'error');
  }
};

/**
 * 确认紧急清除
 */
App.confirmEmergencyClear = function() {
  this.showModal('confirmClearModal');
};

/**
 * 紧急清除所有数据
 */
App.emergencyClear = async function() {
  const confirmInput = document.getElementById('confirmClearInput').value;
  if (confirmInput !== '确认删除') {
    Utils.showToast('请输入"确认删除"以继续', 'error');
    return;
  }

  try {
    await Storage.clearAll();
    
    // 删除数据库
    indexedDB.deleteDatabase('MySelfApp');

    Utils.showToast('数据已清除', 'success');

    // 刷新页面
    setTimeout(() => {
      location.reload();
    }, 1000);

  } catch (error) {
    console.error('清除数据失败:', error);
    Utils.showToast('清除失败', 'error');
  }
};
