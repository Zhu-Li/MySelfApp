/**
 * page-renderers.js - 其他页面渲染
 * 观己 - 静观己心，内外澄明
 * 
 * 从 app.js 拆分
 * 职责：日记、关系网、聊天、打赏等页面渲染
 */

/**
 * 渲染日记页
 */
App.renderDiary = async function() {
  const container = document.getElementById('mainContent');
  await Diary.renderList(container);
};

/**
 * 渲染日记编辑器
 * @param {string|null} id - 日记ID，新建时为null
 */
App.renderDiaryEditor = async function(id = null) {
  const container = document.getElementById('mainContent');
  await Diary.renderEditor(container, id);
};

/**
 * 渲染日记详情
 * @param {string} id - 日记ID
 */
App.renderDiaryDetail = async function(id) {
  const container = document.getElementById('mainContent');
  await Diary.renderDetail(container, id);
};

/**
 * 渲染关系网列表
 */
App.renderContacts = async function() {
  const container = document.getElementById('mainContent');
  await Contacts.renderList(container);
};

/**
 * 渲染联系人详情
 * @param {string} id - 联系人ID
 */
App.renderContactDetail = async function(id) {
  const container = document.getElementById('mainContent');
  await Contacts.renderDetail(container, id);
};

/**
 * 渲染打赏页面
 */
App.renderDonate = function() {
  const container = document.getElementById('mainContent');
  Donate.render(container);
};

/**
 * 渲染AI问答页面
 */
App.renderChat = function() {
  const container = document.getElementById('mainContent');
  Chat.render(container);
};

/**
 * 渲染反馈页面
 */
App.renderFeedback = function() {
  const container = document.getElementById('mainContent');
  Feedback.render(container);
};

/**
 * 渲染更新日志页面
 */
App.renderChangelog = function() {
  const container = document.getElementById('mainContent');
  Changelog.render(container);
};
