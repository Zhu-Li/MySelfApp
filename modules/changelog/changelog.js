/**
 * changelog.js - 版本更新日志模块
 * 观己 - 静观己心，内外澄明
 * 
 * 数据结构说明：
 * - date: 格式为 'YYYY-MM-DD HH:MM'，精确到分钟
 * - files: 内部字段，记录该版本涉及的文件/模块，不对用户显示
 * - changes: 用户可见的变更说明
 */

const Changelog = {
  // 当前版本
  currentVersion: '2.5.0',

  // 版本历史记录（完整记录，用于内部逻辑）
  versions: [
    {
      version: '2.5.0',
      date: '2026-04-04',
      title: '古籍模糊搜索 + 阅读加载动画',
      changes: [
        { type: 'feature', text: '新增古籍模糊搜索功能，支持按书名快速检索 16,487 部古籍' },
        { type: 'feature', text: '搜索结果关键词高亮，显示分类路径，点击直接打开阅读' },
        { type: 'improve', text: '阅读器内容加载升级为骨架屏动画，减少等待感知' }
      ],
      files: ['scripts/server.js', 'modules/classics/classics.js', 'modules/classics/classics-renderer.js', 'modules/classics/classics-styles.js', 'modules/novel/novel-renderer.js', 'modules/novel/novel-styles.js']
    },
    {
      version: '2.4.5',
      date: '2026-04-04',
      title: '古籍阅读器返回导航修复',
      changes: [
        { type: 'fix', text: '修复古籍阅读器"返回"按钮直接跳回书籍首页，现在正确返回上一级目录' }
      ],
      files: ['modules/classics/classics.js', 'modules/novel/novel.js']
    },
    {
      version: '2.4.4',
      date: '2026-04-04',
      title: '古籍模块加载体验优化',
      changes: [
        { type: 'improve', text: '分类点击、子目录进入、书籍打开时显示加载状态反馈，消除点击无响应感' },
        { type: 'improve', text: '浏览页数据加载期间显示骨架屏占位，视觉过渡更流畅' }
      ],
      files: ['modules/classics/classics-renderer.js', 'modules/classics/classics-styles.js']
    },
    {
      version: '2.4.3',
      date: '2026-04-04',
      title: '小说章节数据修复',
      changes: [
        { type: 'fix', text: '修复小说源文件存在重复章节号时，生成的章节数与实际文件数不一致的问题' },
        { type: 'improve', text: '章节编号改为按排序后顺序分配，避免重复章节号导致文件覆盖' }
      ],
      files: ['scripts/generate-novel-data.js', 'scripts/server.js']
    },
    {
      version: '2.4.2',
      date: '2026-04-04',
      title: '服务架构简化：单服务统一部署',
      changes: [
        { type: 'improve', text: 'Node.js 服务统一监听 80 端口，同时提供 API 和静态文件，无需 Nginx/IIS' },
        { type: 'improve', text: '移除 Nginx 反向代理依赖，简化部署架构为单一 Windows 服务' },
        { type: 'fix', text: '修复 novel/index.json 在 IIS 下 404 的问题（改由 Node.js 直接服务）' }
      ],
      files: ['scripts/server.js', 'scripts/install-service.ps1', 'scripts/start.bat']
    },
    {
      version: '2.4.1',
      date: '2026-03-25',
      title: '书籍模块修复与优化',
      changes: [
        { type: 'fix', text: 'API 容错：增加 Content-Type 校验，防止服务返回 HTML 时 JSON 解析失败' },
        { type: 'fix', text: '修复古籍分类加载和小说书架在 API 异常时无法正确回退静态数据的问题' },
        { type: 'improve', text: '书籍模块 Tab 切换改为分段控件风格，视觉体验更精致' }
      ],
      files: ['modules/classics/classics.js', 'modules/novel/novel.js', 'modules/book/book-styles.js', 'modules/book/book-renderer.js']
    },
    {
      version: '2.4.0',
      date: '2026-03-24',
      title: '古籍阅读模块上线，书籍模块统一入口',
      changes: [
        { type: 'feature', text: '新增古籍阅读模块，支持浏览 10 大分类、16000+ 古籍文献' },
        { type: 'feature', text: '三级懒加载：分类概览 → 目录树 → 按需加载内容，节省带宽' },
        { type: 'feature', text: '古籍复用小说沉浸式阅读器，支持字体/主题/朗读等全部功能' },
        { type: 'feature', text: '分类面包屑导航，支持深层目录浏览和分页展示' },
        { type: 'improve', text: '小说与古籍合并为「书籍」模块，Tab 切换统一入口' },
        { type: 'improve', text: '数据导出新增古籍阅读进度选项' },
        { type: 'improve', text: 'API 服务新增古籍内容流式读取端点，支持 7.3GB 源文件按需加载' }
      ],
      files: ['modules/classics/classics.js', 'modules/classics/classics-renderer.js', 'modules/classics/classics-styles.js', 'modules/book/book.js', 'modules/book/book-renderer.js', 'modules/book/book-styles.js', 'scripts/generate-classics-data.js', 'scripts/server.js', 'js/storage.js', 'js/router.js', 'js/app/routes.js', 'js/app/page-renderers.js', 'modules/novel/novel.js', 'modules/novel/novel-renderer.js', 'js/datacard/export-options.js', 'js/datacard.js', 'js/datacard/import-parser.js', 'index.html']
    },
    {
      version: '2.3.8',
      date: '2026-03-08',
      title: '朗读功能优化：段落跳转与自动跨章',
      changes: [
        { type: 'feature', text: '朗读时点击任意段落可直接跳转到该段落开始朗读' },
        { type: 'feature', text: '一章读完自动加载下一章继续朗读，无需手动切换' },
        { type: 'improve', text: '朗读激活时段落显示可点击的视觉提示（hover 变色 + 指针光标）' }
      ],
      files: ['modules/novel/novel-tts.js', 'modules/novel/novel-renderer.js', 'modules/novel/novel-styles.js']
    },
    {
      version: '2.3.7',
      date: '2026-03-08',
      title: '服务端 Edge TTS 语音朗读',
      changes: [
        { type: 'feature', text: '新增服务端 Edge TTS 语音合成，移动端（含微信浏览器）可正常朗读小说' },
        { type: 'feature', text: '支持 14 种中文语音切换，含普通话、粤语、台湾腔等' },
        { type: 'feature', text: '音频预加载：朗读当前段落时自动预加载下一段，无缝衔接' },
        { type: 'improve', text: '服务端 LRU 缓存已合成音频（50MB），相同文本不重复合成' },
        { type: 'improve', text: '桌面浏览器在服务端不可用时自动回退 Web Speech API' }
      ],
      files: ['scripts/server.js', 'modules/novel/novel-tts.js', 'modules/novel/novel-renderer.js', 'modules/novel/novel.js']
    },
    {
      version: '2.3.6',
      date: '2026-03-08',
      title: 'Nginx 反向代理统一入口',
      changes: [
        { type: 'improve', text: '引入 Nginx 反向代理，PC 和移动端统一通过域名访问 API，不再依赖 localhost' },
        { type: 'improve', text: '前端 API 调用改为相对路径，移动端小说模块可正常加载' },
        { type: 'fix', text: '修复发布脚本 robocopy 排除规则导致 novel-tts.js 未被同步的问题' },
        { type: 'fix', text: '修复移动端因 localhost:3001 不可达导致小说数据加载失败的问题' }
      ],
      files: ['modules/novel/novel.js', 'scripts/publish.ps1']
    },
    {
      version: '2.3.5',
      date: '2026-03-09 01:00',
      title: '小说阅读器语音朗读',
      changes: [
        { type: 'feature', text: '新增语音朗读功能，使用浏览器内置 Web Speech API，零第三方依赖' },
        { type: 'feature', text: '逐段朗读并高亮当前段落，自动滚动到阅读位置' },
        { type: 'feature', text: '支持暂停/继续/停止控制，底栏一键操作' },
        { type: 'feature', text: '设置面板支持语速调节和语音选择，偏好自动保存' },
        { type: 'improve', text: '切换章节或关闭阅读器时自动停止朗读' }
      ],
      files: ['modules/novel/novel-tts.js', 'modules/novel/novel-renderer.js', 'modules/novel/novel-styles.js', 'modules/novel/novel.js', 'index.html']
    },
    {
      version: '2.3.4',
      date: '2026-03-08 23:00',
      title: '小说 API 注册为 Windows 后台服务',
      changes: [
        { type: 'feature', text: '小说增量同步 API 注册为 Windows 后台服务（GuanJiNovelAPI），系统启动后自动运行' },
        { type: 'feature', text: '新增 install-service.ps1 一键安装/卸载/重启/查看服务状态' },
        { type: 'improve', text: '前端通过 CORS 调用 localhost:3001 后台服务，兼容 IIS 静态部署' },
        { type: 'improve', text: '服务不可用时自动回退到静态 index.json，确保离线可用' },
        { type: 'improve', text: '发布脚本自动重启后台服务，部署后立即生效' }
      ],
      files: ['scripts/server.js', 'scripts/install-service.ps1', 'modules/novel/novel.js', 'scripts/publish.ps1']
    },
    {
      version: '2.3.3',
      date: '2026-03-08 22:00',
      title: '小说模块自动增量同步',
      changes: [
        { type: 'feature', text: '新增 Node.js 应用服务器，替代简单静态服务，支持小说增量同步 API' },
        { type: 'improve', text: '进入小说模块时自动扫描源目录，增量拷贝新增/更新章节，无需手动操作' },
        { type: 'improve', text: '增量对比：仅拷贝新文件或修改过的文件，已有文件自动跳过' },
        { type: 'improve', text: 'API 不可用时自动回退到静态 index.json，兼容纯静态部署' }
      ],
      files: ['scripts/server.js', 'modules/novel/novel.js', 'modules/changelog/changelog.js']
    },
    {
      version: '2.3.2',
      date: '2026-03-08 21:00',
      title: '小说模块动态数据加载',
      changes: [
        { type: 'improve', text: '小说数据改为动态加载，每次进入模块自动获取最新书籍和章节' },
        { type: 'improve', text: '发布脚本自动运行小说数据生成，无需手动执行' },
        { type: 'improve', text: '移除静态 novels-data.js 依赖，数据通过 index.json 按需加载' }
      ],
      files: ['modules/novel/novel.js', 'scripts/generate-novel-data.js', 'scripts/publish.ps1', 'index.html']
    },
    {
      version: '2.3.1',
      date: '2026-03-08 19:00',
      title: '小说模块内容加载修复',
      changes: [
        { type: 'fix', text: '修复小说章节内容404问题，中文文件名转为ASCII安全路径' },
        { type: 'improve', text: '生成脚本自动将章节文件以ch001.txt格式拷贝到发布目录' },
        { type: 'improve', text: '前端通过fetch相对路径动态加载章节内容' }
      ],
      files: ['modules/novel/novel.js', 'modules/novel/novels-data.js', 'scripts/generate-novel-data.js', 'scripts/publish.ps1']
    },
    {
      version: '2.3.0',
      date: '2026-03-08 18:00',
      title: '小说阅读模块上线',
      changes: [
        { type: 'feature', text: '新增小说阅读模块，支持在线阅读连载小说' },
        { type: 'feature', text: '书架页展示所有书籍，显示阅读进度' },
        { type: 'feature', text: '沉浸式阅读器：支持字体大小（小/中/大）、背景主题（明亮/暗黑/护眼）切换' },
        { type: 'feature', text: '自动记录阅读进度，下次打开自动定位' },
        { type: 'feature', text: '章节列表支持正序/倒序切换，上下章节快速跳转' },
        { type: 'improve', text: '移动端底部导航重构：首页/关系/游戏/小说/更多' },
        { type: 'improve', text: 'PC 端顶部导航新增「小说」入口' },
        { type: 'improve', text: '数据导出新增小说阅读进度选项' }
      ],
      files: ['modules/novel/novel.js', 'modules/novel/novel-renderer.js', 'modules/novel/novel-styles.js', 'modules/novel/novels-data.js', 'scripts/generate-novel-data.js', 'index.html', 'js/storage.js', 'js/router.js', 'js/app/routes.js', 'js/app/page-renderers.js', 'js/datacard/export-options.js']
    },
    {
      version: '2.2.1',
      date: '2026-03-04 00:00',
      title: '代码修复与清理',
      changes: [
        { type: 'fix', text: '回滚误提交的破坏性重构，恢复完整的应用功能' },
        { type: 'fix', text: '清理多余文件（报告文件、vite 配置、dist 目录等）' }
      ],
      files: ['index.html', 'css/components.css', 'package.json']
    },
    {
      version: '2.2.0',
      date: '2026-03-03 12:00',
      title: '电玩城模块上线',
      changes: [
        { type: 'feature', text: '新增电玩城模块，内嵌飞天太空、文明进化两款游戏' },
        { type: 'feature', text: '游戏列表支持卡片式展示，可扩展添加更多游戏' },
        { type: 'feature', text: '支持 iframe 全屏游玩，PC 端可切换全屏模式' },
        { type: 'improve', text: '移动端底部导航新增「更多」弹出菜单，容纳更多功能入口' },
        { type: 'improve', text: 'PC 端顶部导航新增「游戏」入口' }
      ],
      files: ['modules/arcade/arcade.js', 'modules/arcade/arcade-renderer.js', 'modules/arcade/arcade-styles.js', 'index.html', 'js/app/routes.js', 'js/app/page-renderers.js', 'js/router.js', 'js/ui.js']
    },
    {
      version: '2.1.0',
      date: '2026-02-08 19:45',
      title: '发布打包工具',
      changes: [
        { type: 'feature', text: '新增项目发布打包脚本，一键生成 ZIP 压缩包' },
        { type: 'feature', text: '自动读取版本号，输出文件名：观己-{版本号}.zip' },
        { type: 'improve', text: '支持 npm run release 命令快速打包' }
      ],
      files: ['scripts/release.js', 'package.json', '.gitignore']
    },
    {
      version: '2.0.9',
      date: '2026-02-08 15:30',
      title: '版本日志优化',
      changes: [
        { type: 'improve', text: '版本时间格式精确到分钟（YYYY-MM-DD HH:MM）' },
        { type: 'improve', text: '同日多版本合并显示，界面更简洁' },
        { type: 'improve', text: '新增内部文件追踪机制，便于维护' }
      ],
      files: ['modules/changelog/changelog.js']
    },
    {
      version: '2.0.8',
      date: '2026-02-08 14:50',
      title: '导出选项优化',
      changes: [
        { type: 'fix', text: '修复导出选项对话框不必要的解密操作' },
        { type: 'improve', text: '新增 getAllRaw 方法，显示选项时只统计数量不解密' }
      ],
      files: ['js/datacard/export-options.js', 'js/storage.js']
    },
    {
      version: '2.0.7',
      date: '2026-02-08 14:30',
      title: '移除解密错误提示',
      changes: [
        { type: 'fix', text: '移除控制台的解密错误提示，静默处理异常数据' }
      ],
      files: ['js/storage.js']
    },
    {
      version: '2.0.6',
      date: '2026-02-08 14:10',
      title: '解密错误处理优化',
      changes: [
        { type: 'fix', text: '修复解密时遇到非 base64 数据导致的崩溃' },
        { type: 'improve', text: '增强 decryptData 方法的健壮性' }
      ],
      files: ['js/storage.js']
    },
    {
      version: '2.0.5',
      date: '2026-02-08 13:50',
      title: 'API 配置导出导入',
      changes: [
        { type: 'feature', text: '数据导出支持包含 API 密钥配置' },
        { type: 'feature', text: '导入时可选择是否覆盖当前 API 配置' },
        { type: 'improve', text: '方便跨设备迁移时同步 API 配置' },
        { type: 'improve', text: 'API 密钥默认不勾选，保护敏感信息' }
      ],
      files: ['js/datacard/export-options.js', 'js/datacard/datacard.js', 'js/datacard/import-parser.js']
    },
    {
      version: '2.0.4',
      date: '2026-02-08 13:30',
      title: '简化 API 配置弹窗',
      changes: [
        { type: 'improve', text: '隐藏 API 地址输入框，简化配置流程' },
        { type: 'improve', text: '用户只需填写 API 密钥即可使用' }
      ],
      files: ['js/api.js']
    },
    {
      version: '2.0.3',
      date: '2026-02-08 13:10',
      title: '配置弹窗输入框修复',
      changes: [
        { type: 'fix', text: '修复 API 配置弹窗中输入框无法编辑的问题' },
        { type: 'improve', text: '优化表单结构，提升输入框交互体验' }
      ],
      files: ['js/api.js']
    },
    {
      version: '2.0.2',
      date: '2026-02-08 12:50',
      title: 'API 密钥验证弹窗引导',
      changes: [
        { type: 'feature', text: 'API 密钥无效时显示美观的配置弹窗' },
        { type: 'feature', text: '根据错误类型显示不同的引导内容和操作按钮' },
        { type: 'feature', text: '支持在弹窗中直接配置和验证 API 密钥' },
        { type: 'improve', text: '所有 AI 模块统一使用弹窗引导机制' },
        { type: 'improve', text: '网络错误、余额不足等情况提供针对性解决方案' }
      ],
      files: ['js/api.js', 'index.html']
    },
    {
      version: '2.0.1',
      date: '2026-02-08 12:30',
      title: 'API 密钥验证与错误引导',
      changes: [
        { type: 'feature', text: '新增 API 密钥有效性验证，使用前自动检测' },
        { type: 'feature', text: '密钥无效或余额不足时弹窗引导重新配置' },
        { type: 'feature', text: '验证结果缓存5分钟，减少重复检测' },
        { type: 'improve', text: '所有 AI 分析模块统一使用新的验证机制' },
        { type: 'improve', text: '错误分类：密钥无效、余额不足、频率限制、网络错误' }
      ],
      files: ['js/api.js']
    },
    {
      version: '2.0.0',
      date: '2026-02-08 12:00',
      title: '代码架构重构',
      changes: [
        { type: 'improve', text: '重构 app.js 为模块协调器，拆分为9个子文件' },
        { type: 'improve', text: '重构 contacts.js 为模块协调器，拆分为6个子文件' },
        { type: 'improve', text: '重构 diary.js 为模块协调器，拆分为5个子文件' },
        { type: 'improve', text: '重构 chat.js 为模块协调器，拆分为3个子文件' },
        { type: 'improve', text: '重构 comprehensive.js 为模块协调器，拆分为4个子文件' },
        { type: 'improve', text: '重构 datacard.js 为模块协调器，拆分为6个子文件' },
        { type: 'improve', text: '重构 utils.js，拆分 UI 相关功能到独立文件' },
        { type: 'improve', text: '统一采用模块协调器模式，提升代码可维护性' }
      ],
      files: ['js/app/*.js', 'js/contacts/*.js', 'js/diary/*.js', 'js/chat/*.js', 'js/comprehensive/*.js', 'js/datacard/*.js', 'js/utils/*.js']
    },
    {
      version: '1.9.7',
      date: '2026-02-08 11:40',
      title: '联系人信息补全',
      changes: [
        { type: 'feature', text: '联系人详情页新增联系方式展示' }
      ],
      files: ['js/contacts/detail-render.js']
    },
    {
      version: '1.9.6',
      date: '2026-02-08 11:20',
      title: '画像排序优化',
      changes: [
        { type: 'improve', text: '综合画像调整至首页画像列表首位' }
      ],
      files: ['js/app/portrait-render.js']
    },
    {
      version: '1.9.5',
      date: '2026-02-08 11:00',
      title: '首页画像补全',
      changes: [
        { type: 'fix', text: '首页"我的画像"新增综合画像展示' }
      ],
      files: ['js/app/portrait-render.js']
    },
    {
      version: '1.9.4',
      date: '2026-02-08 10:40',
      title: '备注编辑体验优化',
      changes: [
        { type: 'fix', text: '修复编辑联系人备注后页面不刷新的问题' }
      ],
      files: ['js/contacts/contacts.js']
    },
    {
      version: '1.9.3',
      date: '2026-02-08 10:20',
      title: '本人数据导入修复',
      changes: [
        { type: 'fix', text: '修复导入本人数据时关系网数据未导入的问题' },
        { type: 'improve', text: '覆盖导入与合并导入均支持关系网数据同步' }
      ],
      files: ['js/datacard/import-parser.js']
    },
    {
      version: '1.9.2',
      date: '2026-02-08 10:00',
      title: '统一测试结果显示',
      changes: [
        { type: 'fix', text: '统一联系人列表与首页的测试结果摘要显示' },
        { type: 'fix', text: '修复霍兰德显示hollandCode、依恋显示中文名、价值观显示coreValues' },
        { type: 'fix', text: '修复心理健康显示anxietyLevel' },
        { type: 'improve', text: '依恋类型详情显示核心特质标签' }
      ],
      files: ['js/contacts/list-render.js', 'js/app/portrait-render.js']
    },
    {
      version: '1.9.1',
      date: '2026-02-08 09:40',
      title: '测试报告详情优化',
      changes: [
        { type: 'improve', text: '重构联系人测试详情渲染，使用正确的数据结构' },
        { type: 'improve', text: '霍兰德、MBTI、大五等测试显示彩色进度条和图标' },
        { type: 'improve', text: 'AI分析内容支持Markdown格式化显示' },
        { type: 'fix', text: '修复霍兰德测试维度得分显示为0的问题' }
      ],
      files: ['js/contacts/detail-render.js']
    },
    {
      version: '1.9.0',
      date: '2026-02-08 09:20',
      title: '日记详情显示优化',
      changes: [
        { type: 'fix', text: '修复联系人日记图片显示问题（支持对象格式图片数据）' },
        { type: 'improve', text: '优化AI情绪分析展示样式，格式化显示心情、关键词、主题和洞察' }
      ],
      files: ['js/contacts/detail-render.js', 'js/diary/diary-render.js']
    },
    {
      version: '1.8.9',
      date: '2026-02-08 09:00',
      title: '数据导出解密与页面刷新修复',
      changes: [
        { type: 'fix', text: '修复Storage.getAll未解密加密字段导致导出数据加密的问题' },
        { type: 'fix', text: '修复导入关系网成功后页面不自动刷新的问题' },
        { type: 'fix', text: '修复日记AI分析显示为[object Object]的问题' }
      ],
      files: ['js/storage.js', 'js/contacts/contacts.js', 'js/diary/diary-render.js']
    },
    {
      version: '1.8.8',
      date: '2026-02-08 08:40',
      title: '关系网详情页增强',
      changes: [
        { type: 'feature', text: '联系人详情页支持点击查看测试报告完整内容' },
        { type: 'feature', text: '联系人详情页支持点击查看日记详细内容' },
        { type: 'feature', text: '支持查看联系人日记的图片、标签、AI分析' },
        { type: 'feature', text: '新增查看全部日记列表功能' },
        { type: 'improve', text: '测试卡片和日记条目添加点击交互样式' }
      ],
      files: ['js/contacts/detail-render.js', 'js/contacts/contacts.js']
    },
    {
      version: '1.8.7',
      date: '2026-02-08 08:20',
      title: '关键问题修复',
      changes: [
        { type: 'fix', text: '修复首页连续天数统计逻辑（今天无活动时从昨天开始计算）' },
        { type: 'fix', text: '修复关系网导入确定按钮无响应的问题' },
        { type: 'fix', text: '修复确认弹窗按钮点击无效的问题（ID冲突导致事件绑定失败）' }
      ],
      files: ['js/app/stats-render.js', 'js/contacts/contacts.js', 'js/utils/dialog.js']
    },
    {
      version: '1.8.6',
      date: '2026-02-08 08:00',
      title: '首页体验优化、综合画像增强与多项修复',
      changes: [
        { type: 'feature', text: '首页新增个性化问候语，根据时段显示不同问候' },
        { type: 'feature', text: '首页新增每日心理学语录卡片' },
        { type: 'feature', text: '首页新增打卡统计：连续使用天数、本周日记数、完成测试数' },
        { type: 'feature', text: '综合画像分析整合日记情绪记录，分析心理状态和情绪模式' },
        { type: 'feature', text: '综合画像分析整合关系网数据，提供人际互动建议' },
        { type: 'improve', text: 'SEO优化：新增meta标签、Open Graph、结构化数据' },
        { type: 'improve', text: '新增sitemap.xml和robots.txt，提升搜索引擎收录' },
        { type: 'improve', text: '「AI 问答」模块更名（原AI智障）' },
        { type: 'improve', text: '优化导航栏顺序：首页→测试→报告→日记→关系→问答' },
        { type: 'improve', text: '移动端顶部栏显示「观己 - 静观己心，内外澄明」品牌标语' },
        { type: 'improve', text: 'CSS/JS文件添加版本号参数，解决微信等浏览器缓存问题' },
        { type: 'fix', text: '修复关系网模块在移动端无法加载的问题' },
        { type: 'fix', text: '修复PC端关系网导航入口缺失的问题' },
        { type: 'fix', text: '修复本周日记统计计算错误（周一作为一周开始）' },
        { type: 'fix', text: '修复日记统计使用错误字段名导致计算不准确的问题' }
      ],
      files: ['js/app/app.js', 'js/app/stats-render.js', 'js/comprehensive/comprehensive.js', 'index.html', 'sitemap.xml', 'robots.txt']
    },
    {
      version: '1.8.0',
      date: '2026-02-07 23:00',
      title: '关系网管理模块',
      changes: [
        { type: 'feature', text: '新增关系网管理模块，可导入他人数据建立关系网络' },
        { type: 'feature', text: '支持「导入本人数据」恢复备份，智能身份验证和数据合并' },
        { type: 'feature', text: '支持「导入关系网数据」添加联系人，自动检测同名冲突' },
        { type: 'feature', text: '联系人详情页展示完整测试结果和日记记录' },
        { type: 'feature', text: '支持为同名联系人添加备注以区分' },
        { type: 'improve', text: '数据导出新增关系网数据选项' },
        { type: 'improve', text: '底部导航新增「关系」入口' }
      ],
      files: ['modules/contacts/contacts.js', 'js/datacard/export-options.js', 'index.html']
    },
    {
      version: '1.7.6',
      date: '2026-02-07 22:30',
      title: '日记保存性能优化',
      changes: [
        { type: 'improve', text: '优化日记保存速度，AI 分析改为后台异步执行' },
        { type: 'improve', text: '保存后立即跳转，不再等待 AI 响应' }
      ],
      files: ['modules/diary/diary.js']
    },
    {
      version: '1.7.5',
      date: '2026-02-07 22:00',
      title: '首次登录填写名称',
      changes: [
        { type: 'feature', text: '首次登录设置向导增加名称填写步骤' },
        { type: 'improve', text: '名称为必填项，2-20个字符' }
      ],
      files: ['js/app/first-run.js']
    },
    {
      version: '1.7.4',
      date: '2026-02-07 21:30',
      title: '导出名称校验',
      changes: [
        { type: 'feature', text: '导出前检查用户名称，未设置时提示先维护' },
        { type: 'improve', text: '导出文件名包含用户名称，便于识别管理' }
      ],
      files: ['js/datacard/datacard.js']
    },
    {
      version: '1.7.3',
      date: '2026-02-07 21:00',
      title: '微信浏览器兼容',
      changes: [
        { type: 'fix', text: '修复微信内置浏览器无法选择 ZIP 文件的问题' },
        { type: 'improve', text: '移除文件类型限制，支持选择任意文件' }
      ],
      files: ['js/datacard/import-parser.js']
    },
    {
      version: '1.7.2',
      date: '2026-02-07 20:30',
      title: '移动端兼容优化',
      changes: [
        { type: 'fix', text: '修复移动端导入数据时无法选择 ZIP 文件的问题' },
        { type: 'improve', text: '简化导入提示信息为"支持 ZIP 数据包"' }
      ],
      files: ['js/datacard/import-parser.js']
    },
    {
      version: '1.7.1',
      date: '2026-02-07 20:00',
      title: 'ZIP 导入修复',
      changes: [
        { type: 'fix', text: '修复 ZIP 数据包导入失败的问题' },
        { type: 'fix', text: '修复旧版 PNG 卡片导入失败的问题' },
        { type: 'improve', text: '优化数据导入逻辑，直接写入存储' }
      ],
      files: ['js/datacard/import-parser.js']
    },
    {
      version: '1.7.0',
      date: '2026-02-07 19:30',
      title: 'ZIP 数据包导出',
      changes: [
        { type: 'feature', text: '全新 ZIP 打包导出方案，支持无限容量数据' },
        { type: 'feature', text: '导出包含精美数据卡片 + 完整加密数据' },
        { type: 'feature', text: '完整导出所有测试数据、日记内容和图片' },
        { type: 'improve', text: '导入支持 ZIP 包和旧版 PNG 卡片两种格式' },
        { type: 'improve', text: '使用 JSZip 库实现高效压缩' }
      ],
      files: ['js/datacard/datacard.js', 'lib/jszip.min.js']
    },
    {
      version: '1.6.9',
      date: '2026-02-07 19:00',
      title: '数据卡片容量扩展',
      changes: [
        { type: 'fix', text: '解决数据量过大无法导出的问题' },
        { type: 'improve', text: '卡片尺寸从 800x450 扩展到 800x600' },
        { type: 'improve', text: '数据存储区从 120KB 扩展到 288KB' },
        { type: 'improve', text: '精简导出数据，移除原始答案只保留结果' },
        { type: 'improve', text: '日记限制最多50篇，每篇最多2000字' }
      ],
      files: ['js/datacard/card-render.js']
    },
    {
      version: '1.6.8',
      date: '2026-02-07 18:30',
      title: '导出功能优化',
      changes: [
        { type: 'fix', text: '名片导出选项补充心理健康和综合画像测试' },
        { type: 'fix', text: '修复取消生成时仍显示成功提示的问题' },
        { type: 'improve', text: '隐藏 JSON 导出功能，统一使用数据卡片' },
        { type: 'improve', text: '个人资料判断条件优化' }
      ],
      files: ['js/datacard/export-options.js']
    },
    {
      version: '1.6.7',
      date: '2026-02-07 18:00',
      title: '首页与报告优化',
      changes: [
        { type: 'improve', text: '首页画像新增价值观和心理健康测试结果' },
        { type: 'fix', text: '报告列表新增测试类型中文名称显示' },
        { type: 'fix', text: '修复新测试在报告列表显示英文的问题' }
      ],
      files: ['js/app/portrait-render.js', 'modules/reports/reports.js']
    },
    {
      version: '1.6.6',
      date: '2026-02-07 17:30',
      title: '测试保存确认',
      changes: [
        { type: 'feature', text: '测试完成后询问是否保存结果' },
        { type: 'improve', text: '防止他人使用时误保存测试数据' },
        { type: 'improve', text: '选择不保存时返回测试列表' }
      ],
      files: ['modules/tests/tests.js']
    },
    {
      version: '1.6.5',
      date: '2026-02-07 17:00',
      title: '个人资料完善',
      changes: [
        { type: 'feature', text: '设置页新增个人资料编辑功能' },
        { type: 'feature', text: '支持填写姓名、性别、出生日期、联系方式' },
        { type: 'feature', text: '根据出生日期自动计算并显示年龄' },
        { type: 'improve', text: '个人简介支持自定义' }
      ],
      files: ['modules/settings/settings.js']
    },
    {
      version: '1.6.4',
      date: '2026-02-07 16:30',
      title: '首页画像优化',
      changes: [
        { type: 'improve', text: '首页展示所有已完成测试的结果概览' },
        { type: 'improve', text: '支持显示 MBTI、大五人格、霍兰德、依恋类型、情商等测试结果' },
        { type: 'improve', text: '点击测试结果可直接跳转到详细报告' },
        { type: 'improve', text: '快捷入口新增 AI 问答入口' }
      ],
      files: ['js/app/portrait-render.js']
    },
    {
      version: '1.6.3',
      date: '2026-02-07 16:00',
      title: '导出内容可选',
      changes: [
        { type: 'feature', text: '导出数据卡片时可选择导出内容' },
        { type: 'improve', text: '支持按测试类型、日记、个人资料分别选择' },
        { type: 'improve', text: '控制分享给他人的信息量，保护隐私' }
      ],
      files: ['js/datacard/export-options.js']
    },
    {
      version: '1.6.2',
      date: '2026-02-07 15:30',
      title: '数据卡片布局优化',
      changes: [
        { type: 'improve', text: '修复数据卡片内容重叠问题' },
        { type: 'improve', text: '大五人格改用水平进度条展示，更直观清晰' },
        { type: 'improve', text: '添加左右内容区域分割线' },
        { type: 'improve', text: '优化卡片整体间距和视觉层级' }
      ],
      files: ['js/datacard/card-render.js']
    },
    {
      version: '1.6.1',
      date: '2026-02-07 14:00',
      title: '体验优化',
      changes: [
        { type: 'improve', text: '美化确认对话框，替换浏览器默认弹窗' },
        { type: 'improve', text: '新增美化提示对话框，支持多种类型图标' },
        { type: 'improve', text: '无效数据卡片导入时显示友好错误提示' },
        { type: 'fix', text: '优化导入/导出失败的错误提示方式' }
      ],
      files: ['js/utils/dialog.js']
    },
    {
      version: '1.6.0',
      date: '2026-02-07 12:00',
      title: '数据卡片安全升级',
      changes: [
        { type: 'feature', text: '数据卡片支持 AES-256-GCM 加密，防止数据泄露' },
        { type: 'feature', text: '添加 HMAC-SHA256 签名验证，防止数据篡改' },
        { type: 'feature', text: '导出时设置密码，导入时验证密码' },
        { type: 'improve', text: '卡片显示加密状态标识（🔒 ENCRYPTED）' },
        { type: 'improve', text: '兼容旧版未加密数据卡片导入' }
      ],
      files: ['js/datacard/datacard.js', 'js/datacard/crypto.js']
    },
    {
      version: '1.5.0',
      date: '2026-02-07 10:00',
      title: '数据卡片迁移',
      changes: [
        { type: 'feature', text: '新增数据卡片导出功能，生成精美个人画像卡' },
        { type: 'feature', text: '支持从数据卡片图片恢复所有数据' },
        { type: 'improve', text: '数据卡片可保存分享，方便跨设备迁移' },
        { type: 'improve', text: '采用LZString压缩，支持大量数据存储' }
      ],
      files: ['js/datacard/datacard.js', 'js/datacard/card-render.js', 'lib/lz-string.min.js']
    },
    {
      version: '1.4.0',
      date: '2026-02-07 08:00',
      title: '心理测试扩展',
      changes: [
        { type: 'feature', text: '新增依恋类型测试（30道题），了解亲密关系模式' },
        { type: 'feature', text: '新增情商测试（40道题），评估五大情商维度' },
        { type: 'feature', text: '新增价值观测试（30道题），发现核心价值观' },
        { type: 'feature', text: '新增心理健康自测（GAD-7 + PHQ-9 量表）' },
        { type: 'improve', text: '测试列表新增4个测试入口' },
        { type: 'improve', text: '所有新测试支持AI深度分析报告' }
      ],
      files: ['modules/tests/tests.js', 'modules/tests/attachment.js', 'modules/tests/eq.js', 'modules/tests/values.js', 'modules/tests/mental-health.js']
    },
    {
      version: '1.3.0',
      date: '2026-02-07 00:00',
      title: '移动端体验优化',
      changes: [
        { type: 'improve', text: '全面优化移动端界面适配' },
        { type: 'improve', text: '优化首页、测试、日记等页面布局' },
        { type: 'improve', text: '优化设置页面移动端显示' },
        { type: 'improve', text: '优化 AI 问答聊天界面' },
        { type: 'improve', text: '调整响应式断点和字体大小' }
      ],
      files: ['css/style.css', 'css/mobile.css']
    },
    {
      version: '1.2.0',
      date: '2026-02-06 18:00',
      title: 'AI 问答上线',
      changes: [
        { type: 'feature', text: '新增 AI 问答模块，有问必答，不保证靠谱' },
        { type: 'feature', text: '流式输出，实时显示 AI 胡说八道' },
        { type: 'feature', text: '支持 Markdown 格式渲染' },
        { type: 'improve', text: '优化版本更新提示，仅在新版本时显示' }
      ],
      files: ['modules/chat/chat.js', 'modules/changelog/changelog.js']
    },
    {
      version: '1.1.0',
      date: '2026-02-06 12:00',
      title: '功能优化更新',
      changes: [
        { type: 'feature', text: '新增意见反馈功能，支持直接提交建议' },
        { type: 'feature', text: '新增版本更新日志，查看历史版本变化' },
        { type: 'feature', text: '日记支持添加图片，最多9张' },
        { type: 'improve', text: '优化移动端数据概览布局' },
        { type: 'improve', text: '优化打赏页面，收款码居中显示' },
        { type: 'improve', text: '打赏入口更低调，移至设置页' }
      ],
      files: ['modules/settings/settings.js', 'modules/changelog/changelog.js', 'modules/diary/diary.js']
    },
    {
      version: '1.0.0',
      date: '2026-02-05 20:00',
      title: '首个正式版本',
      changes: [
        { type: 'feature', text: 'MBTI 性格测试（70道题）' },
        { type: 'feature', text: '大五人格测试（50道题）' },
        { type: 'feature', text: '霍兰德职业兴趣测试（60道题）' },
        { type: 'feature', text: '综合画像分析' },
        { type: 'feature', text: '个人日记功能，支持心情记录' },
        { type: 'feature', text: 'AI 智能分析（硅基流动 API）' },
        { type: 'feature', text: '本地加密存储，保护隐私' },
        { type: 'feature', text: '深色/浅色主题切换' },
        { type: 'feature', text: '数据导入导出功能' }
      ],
      files: ['index.html', 'js/*.js', 'modules/**/*.js', 'css/*.css']
    }
  ],

  /**
   * 获取已读版本
   */
  async getReadVersion() {
    try {
      const config = await Storage.get('config', 'changelog');
      return config?.readVersion || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * 标记版本已读
   */
  async markAsRead() {
    await Storage.save('config', {
      key: 'changelog',
      readVersion: this.currentVersion
    });
  },

  /**
   * 检查是否有新版本更新
   */
  async hasNewVersion() {
    const readVersion = await this.getReadVersion();
    return readVersion !== this.currentVersion;
  },

  /**
   * 显示更新弹窗（如果有新版本）
   */
  async showUpdateModal() {
    const hasNew = await this.hasNewVersion();
    if (!hasNew) return;

    const latestVersion = this.versions[0];
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'changelogModal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal changelog-modal">
        <div class="modal-header">
          <h3 class="modal-title">🎉 更新内容</h3>
          <button class="modal-close" onclick="Changelog.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="changelog-version-badge">v${latestVersion.version}</div>
          <h4 class="changelog-version-title">${latestVersion.title}</h4>
          <ul class="changelog-list">
            ${latestVersion.changes.map(change => `
              <li class="changelog-item changelog-item-${change.type}">
                <span class="changelog-item-icon">${this.getTypeIcon(change.type)}</span>
                <span class="changelog-item-text">${change.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-block" onclick="Changelog.closeModal()">
            知道了
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.addStyles();

    // 标记已读
    await this.markAsRead();
  },

  /**
   * 关闭弹窗
   */
  closeModal() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 获取类型图标
   */
  getTypeIcon(type) {
    const icons = {
      feature: '✨',
      improve: '💫',
      fix: '🐛',
      remove: '🗑️'
    };
    return icons[type] || '📝';
  },

  /**
   * 获取类型标签
   */
  getTypeLabel(type) {
    const labels = {
      feature: '新功能',
      improve: '优化',
      fix: '修复',
      remove: '移除'
    };
    return labels[type] || '更新';
  },

  /**
   * 从日期字符串中提取日期部分（YYYY-MM-DD）
   */
  getDatePart(dateStr) {
    return dateStr.split(' ')[0];
  },

  /**
   * 从日期字符串中提取时间部分（HH:MM）
   */
  getTimePart(dateStr) {
    const parts = dateStr.split(' ');
    return parts[1] || '';
  },

  /**
   * 获取合并后的版本列表（同日版本合并显示）
   * 返回用于UI展示的版本列表，不修改原始数据
   */
  getMergedVersions() {
    const merged = [];
    const dateGroups = {};

    // 按日期分组
    this.versions.forEach(ver => {
      const datePart = this.getDatePart(ver.date);
      if (!dateGroups[datePart]) {
        dateGroups[datePart] = [];
      }
      dateGroups[datePart].push(ver);
    });

    // 处理每个日期组
    Object.keys(dateGroups)
      .sort((a, b) => new Date(b) - new Date(a)) // 按日期倒序
      .forEach(date => {
        const group = dateGroups[date];
        
        if (group.length === 1) {
          // 单个版本，直接添加
          merged.push({
            ...group[0],
            isMerged: false
          });
        } else {
          // 多个版本，合并显示
          // 按版本号排序（倒序，最新的在前）
          group.sort((a, b) => this.compareVersions(b.version, a.version));
          
          const firstVer = group[0];  // 最新版本
          const lastVer = group[group.length - 1];  // 最早版本
          
          // 合并所有变更
          const allChanges = [];
          const allFiles = new Set();
          const subVersions = [];
          
          group.forEach(ver => {
            ver.changes.forEach(change => {
              allChanges.push({
                ...change,
                fromVersion: ver.version
              });
            });
            if (ver.files) {
              ver.files.forEach(f => allFiles.add(f));
            }
            subVersions.push({
              version: ver.version,
              time: this.getTimePart(ver.date),
              title: ver.title
            });
          });

          merged.push({
            version: `${lastVer.version}-${firstVer.version}`,
            versionRange: { from: lastVer.version, to: firstVer.version },
            date: date,
            title: `同日 ${group.length} 次更新`,
            changes: allChanges,
            files: Array.from(allFiles),
            isMerged: true,
            subVersions: subVersions,
            originalVersions: group
          });
        }
      });

    return merged;
  },

  /**
   * 版本号比较（语义化版本）
   * 返回正数表示 a > b，负数表示 a < b，0 表示相等
   */
  compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA !== numB) {
        return numA - numB;
      }
    }
    return 0;
  },

  /**
   * 渲染完整更新日志页面
   */
  render(container) {
    const mergedVersions = this.getMergedVersions();
    
    container.innerHTML = `
      <div class="page-container animate-fade-in">
        <div class="changelog-page">
          <!-- 头部 -->
          <div class="changelog-header">
            <div class="changelog-icon">📋</div>
            <h1 class="changelog-title">更新日志</h1>
            <p class="changelog-subtitle">查看「观己」的版本迭代历程</p>
            <div class="changelog-current">
              当前版本：<strong>v${this.currentVersion}</strong>
            </div>
          </div>

          <!-- 版本列表 -->
          <div class="changelog-timeline">
            ${mergedVersions.map((ver, index) => `
              <div class="changelog-version-card ${index === 0 ? 'latest' : ''} ${ver.isMerged ? 'merged' : ''}">
                <div class="changelog-version-header">
                  <div class="changelog-version-info">
                    <span class="changelog-version-number">v${ver.version}</span>
                    ${index === 0 ? '<span class="badge badge-success">最新</span>' : ''}
                    ${ver.isMerged ? '<span class="badge badge-info">合并</span>' : ''}
                  </div>
                  <span class="changelog-version-date">${ver.date}</span>
                </div>
                <h3 class="changelog-version-name">${ver.title}</h3>
                ${ver.isMerged ? this.renderMergedVersion(ver) : this.renderSingleVersion(ver)}
              </div>
            `).join('')}
          </div>

          <!-- 返回按钮 -->
          <div class="changelog-footer">
            <button class="btn btn-secondary" onclick="Router.navigate('/settings')">
              ← 返回设置
            </button>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  },

  /**
   * 渲染单个版本的变更列表
   */
  renderSingleVersion(ver) {
    return `
      <ul class="changelog-changes">
        ${ver.changes.map(change => `
          <li class="changelog-change changelog-change-${change.type}">
            <span class="changelog-change-icon">${this.getTypeIcon(change.type)}</span>
            <span class="changelog-change-label">${this.getTypeLabel(change.type)}</span>
            <span class="changelog-change-text">${change.text}</span>
          </li>
        `).join('')}
      </ul>
    `;
  },

  /**
   * 渲染合并版本的变更列表（按子版本分组显示）
   */
  renderMergedVersion(ver) {
    return `
      <div class="changelog-merged-content">
        ${ver.subVersions.map(subVer => `
          <div class="changelog-sub-version">
            <div class="changelog-sub-version-header">
              <span class="changelog-sub-version-tag">v${subVer.version}</span>
              <span class="changelog-sub-version-title">${subVer.title}</span>
              ${subVer.time ? `<span class="changelog-sub-version-time">${subVer.time}</span>` : ''}
            </div>
            <ul class="changelog-changes">
              ${ver.changes
                .filter(c => c.fromVersion === subVer.version)
                .map(change => `
                  <li class="changelog-change changelog-change-${change.type}">
                    <span class="changelog-change-icon">${this.getTypeIcon(change.type)}</span>
                    <span class="changelog-change-label">${this.getTypeLabel(change.type)}</span>
                    <span class="changelog-change-text">${change.text}</span>
                  </li>
                `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('changelog-styles')) return;

    const style = document.createElement('style');
    style.id = 'changelog-styles';
    style.textContent = `
      .changelog-page {
        max-width: 700px;
        margin: 0 auto;
        padding: var(--spacing-lg) 0;
      }

      .changelog-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
      }

      .changelog-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
      }

      .changelog-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .changelog-subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
      }

      .changelog-current {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-md);
        background-color: var(--color-primary-light);
        color: var(--color-primary);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
      }

      /* 时间线 */
      .changelog-timeline {
        position: relative;
        padding-left: var(--spacing-lg);
      }

      .changelog-timeline::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, var(--color-primary), var(--border-color));
      }

      .changelog-version-card {
        position: relative;
        background-color: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
        box-shadow: var(--shadow-sm);
      }

      .changelog-version-card::before {
        content: '';
        position: absolute;
        left: calc(var(--spacing-lg) * -1 - 4px);
        top: var(--spacing-lg);
        width: 12px;
        height: 12px;
        background-color: var(--border-color);
        border-radius: 50%;
        border: 2px solid var(--bg-primary);
      }

      .changelog-version-card.latest::before {
        background-color: var(--color-primary);
        box-shadow: 0 0 0 4px var(--color-primary-light);
      }

      .changelog-version-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
      }

      .changelog-version-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .changelog-version-number {
        font-size: var(--font-size-lg);
        font-weight: 700;
        color: var(--color-primary);
      }

      .changelog-version-date {
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
      }

      .changelog-version-name {
        font-size: var(--font-size-base);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
      }

      .changelog-changes {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .changelog-change {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        border-bottom: 1px solid var(--border-color-light);
      }

      .changelog-change:last-child {
        border-bottom: none;
      }

      .changelog-change-icon {
        flex-shrink: 0;
      }

      .changelog-change-label {
        flex-shrink: 0;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .changelog-change-feature .changelog-change-label {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--color-success);
      }

      .changelog-change-improve .changelog-change-label {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
      }

      .changelog-change-fix .changelog-change-label {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--color-warning);
      }

      .changelog-change-text {
        flex: 1;
        color: var(--text-secondary);
      }

      .changelog-footer {
        text-align: center;
        margin-top: var(--spacing-xl);
      }

      /* 合并版本样式 */
      .changelog-version-card.merged {
        border-left: 3px solid var(--color-info);
      }

      .badge-info {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .changelog-merged-content {
        margin-top: var(--spacing-sm);
      }

      .changelog-sub-version {
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
      }

      .changelog-sub-version:last-child {
        margin-bottom: 0;
      }

      .changelog-sub-version-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        flex-wrap: wrap;
      }

      .changelog-sub-version-tag {
        display: inline-block;
        padding: 2px 8px;
        background: linear-gradient(135deg, var(--color-primary) 0%, #818cf8 100%);
        color: white;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 600;
      }

      .changelog-sub-version-title {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
      }

      .changelog-sub-version-time {
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
      }

      .changelog-sub-version .changelog-changes {
        margin-top: var(--spacing-xs);
      }

      .changelog-sub-version .changelog-change {
        padding: var(--spacing-xs) 0;
      }

      /* 弹窗样式 */
      .changelog-modal {
        max-width: 420px;
      }

      .changelog-version-badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-md);
        background: linear-gradient(135deg, var(--color-primary) 0%, #818cf8 100%);
        color: white;
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 600;
        margin-bottom: var(--spacing-md);
      }

      .changelog-version-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-lg);
      }

      .changelog-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .changelog-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }

      .changelog-item-icon {
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .changelog-page {
          padding: var(--spacing-md) 0;
        }

        .changelog-timeline {
          padding-left: var(--spacing-md);
        }

        .changelog-version-card {
          padding: var(--spacing-md);
        }

        .changelog-version-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-xs);
        }

        .changelog-change {
          flex-wrap: wrap;
        }

        .changelog-change-text {
          width: 100%;
          margin-top: var(--spacing-xs);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出到全局
window.Changelog = Changelog;
