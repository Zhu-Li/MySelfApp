# 观己 - 自我认知应用

> 静观己心，内外澄明

「观己」是一款帮助你了解自己的自我认知应用，通过科学的心理测试和 AI 分析，探索你的性格特征与内在世界。

## 功能特性

### 心理测试
- **MBTI 性格测试** - 70 道专业题目，深入了解你的性格类型
- **大五人格测试** - 50 道题目，评估开放性、尽责性、外向性、宜人性、神经质
- **霍兰德职业兴趣测试** - 60 道题目，发现适合你的职业方向
- **综合画像分析** - 整合测试结果、日记情绪、关系网数据，生成全方位个人画像

### AI 智能分析
- 基于硅基流动 API 的智能分析
- 个性化性格解读与建议
- 流式输出，实时显示分析结果
- API 密钥有效性自动验证，无效时引导重新配置

### AI 问答
- AI 对话助手
- 有问必答
- 支持 Markdown 格式渲染

### 个人日记
- 记录每日心情与想法
- 支持添加图片（最多 9 张）
- 心情标签分类
- AI 情感分析

### 关系网管理
- 导入他人数据包，建立人际关系网络
- 支持「导入本人数据」恢复备份，智能身份验证
- 支持「导入关系网数据」添加联系人，自动检测同名冲突
- 查看联系人完整测试结果和日记记录
- 综合画像分析时整合关系网数据

### 数据安全
- 所有数据本地存储（IndexedDB）
- AES-GCM 加密保护
- 密码验证访问
- 支持 ZIP 数据包导出（包含数据卡片 + 完整加密数据，无容量限制）
- 兼容旧版 PNG 数据卡片导入

### 其他功能
- 深色/浅色主题切换
- 移动端适配
- 意见反馈
- 版本更新日志

### 电玩城
- 内嵌精选小游戏，休闲时光的好去处
- 支持全屏游玩（PC 端）
- 可扩展架构，轻松添加新游戏

### 小说阅读
- 在线阅读连载小说，书架式管理
- 沉浸式阅读器，支持字体大小调节（小/中/大）
- 三种背景主题：明亮、暗黑、护眼
- 自动记录阅读进度，章节正序/倒序切换
- 上下章快速跳转，点击内容区隐藏/显示工具栏
- 动态加载书籍数据，进入模块时自动增量同步新章节
- 后台 Windows 服务提供 API，IIS 部署无需 Node.js 前端
- 语音朗读：逐段朗读并高亮，支持暂停/继续/语速调节（Web Speech API）

## 技术栈

- **前端框架**: 原生 HTML/CSS/JavaScript（零依赖）
- **数据存储**: IndexedDB + Web Crypto API 加密
- **AI 能力**: 硅基流动 API（DeepSeek-V3）
- **邮件服务**: Web3Forms
- **小说API**: Node.js Windows 服务 + NSSM（端口 3001）

## 快速开始

### 在线体验

直接访问 [试用](https://10226339ismm5.vicp.fun) 即可使用。

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/Zhu-Li/MySelfApp.git
cd MySelfApp
```

2. 启动本地服务器
```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve
```

3. 打开浏览器访问 `http://localhost:8080`

### 小说 API 服务（可选）

小说模块需要后台 API 进行增量同步。首次部署：

```powershell
# 发布应用到 D:\Publish\MySelf-App\Home
powershell -ExecutionPolicy Bypass -File scripts\publish.ps1

# 安装 Windows 服务（需要管理员权限）
powershell -ExecutionPolicy Bypass -File D:\Publish\MySelf-App\install-service.ps1 install
```

服务管理命令：
```powershell
# 查看服务状态
.\install-service.ps1 status

# 重启服务
.\install-service.ps1 restart

# 卸载服务
.\install-service.ps1 uninstall
```

服务安装后会自动随系统启动，监听端口 3001，提供 `/api/novel/refresh` 接口。

### 配置 API

1. 访问 [硅基流动控制台](https://cloud.siliconflow.cn/i/DG53MZpo) 注册账号
2. 创建 API Key
3. 在应用设置中配置 API Key

## 项目结构

```
MySelfApp/
├── index.html          # 主页面
├── css/
│   ├── base.css        # 基础样式变量
│   └── components.css  # 组件样式
├── js/
│   ├── app.js          # 应用协调器
│   ├── app/            # 应用子模块
│   │   ├── setup-wizard.js     # 初始设置向导
│   │   ├── auth-handler.js     # 认证处理
│   │   ├── routes.js           # 路由注册
│   │   ├── home-renderer.js    # 首页渲染
│   │   ├── test-renderers.js   # 测试页面渲染
│   │   ├── test-renderers-extra.js  # 额外测试页面
│   │   ├── report-renderer.js  # 报告页面渲染
│   │   ├── settings-renderer.js # 设置页面渲染
│   │   └── page-renderers.js   # 其他页面渲染
│   ├── router.js       # 路由管理
│   ├── storage.js      # 数据存储
│   ├── utils.js        # 工具函数协调器
│   ├── utils/          # 工具子模块
│   │   ├── ui.js           # UI工具函数
│   │   └── stream-ui.js    # 流式输出UI
│   ├── api.js          # API 调用
│   ├── datacard.js     # 数据卡片协调器
│   └── datacard/       # 数据卡片子模块
│       ├── card-renderer.js    # 卡片渲染
│       ├── data-encoder.js     # 数据编码
│       ├── zip-handler.js      # ZIP处理
│       ├── export-dialog.js    # 导出对话框
│       ├── password-dialog.js  # 密码对话框
│       └── datacard-styles.js  # 样式
├── modules/
│   ├── mbti/           # MBTI 测试模块
│   ├── bigfive/        # 大五人格模块
│   ├── holland/        # 霍兰德测试模块
│   ├── comprehensive/  # 综合画像模块（协调器+子文件）
│   │   ├── comprehensive.js    # 协调器
│   │   ├── prompt-builder.js   # 提示词构建
│   │   ├── stream-analyzer.js  # 流式分析
│   │   └── report-renderer.js  # 报告渲染
│   ├── diary/          # 日记模块（协调器+子文件）
│   │   ├── diary.js            # 协调器
│   │   ├── image-handler.js    # 图片处理
│   │   ├── list-renderer.js    # 列表渲染
│   │   ├── editor-renderer.js  # 编辑器渲染
│   │   ├── detail-renderer.js  # 详情渲染
│   │   └── diary-styles.js     # 样式
│   ├── contacts/       # 关系网模块（协调器+子文件）
│   │   ├── contacts.js         # 协调器
│   │   ├── list-renderer.js    # 列表渲染
│   │   ├── detail-renderer.js  # 详情渲染
│   │   ├── import-handler.js   # 导入处理
│   │   ├── data-merger.js      # 数据合并
│   │   ├── test-detail.js      # 测试详情弹窗
│   │   └── diary-detail.js     # 日记详情弹窗
│   ├── chat/           # AI 问答模块（协调器+子文件）
│   │   ├── chat.js             # 协调器
│   │   ├── message-handler.js  # 消息处理
│   │   └── chat-styles.js      # 样式
│   ├── arcade/         # 电玩城模块
│   │   ├── arcade.js           # 协调器+游戏配置
│   │   ├── arcade-renderer.js  # 列表/iframe渲染
│   │   └── arcade-styles.js    # 样式
│   ├── novel/          # 小说阅读模块
│   │   ├── novel.js            # 协调器
│   │   ├── novel-renderer.js   # 书架/章节/阅读器渲染
│   │   ├── novel-styles.js     # 样式
│   │   └── novels-data.js      # 小说数据（自动生成）
│   ├── feedback/       # 意见反馈模块
│   ├── donate/         # 打赏模块
│   └── changelog/      # 更新日志模块
└── assets/
    └── images/         # 图片资源
```

## 隐私说明

- 所有数据均存储在本地浏览器中
- 使用 AES-GCM 256 位加密
- 不收集任何用户信息
- AI 分析仅在用户主动请求时进行

## 更新日志

### v2.3.5
- 新增语音朗读功能，使用浏览器内置 Web Speech API，零第三方依赖
- 逐段朗读并高亮当前段落，自动滚动到阅读位置
- 支持暂停/继续/停止控制，设置面板可调语速和选择语音

### v2.3.4
- 小说增量同步 API 注册为 Windows 后台服务，系统启动后自动运行
- 新增 install-service.ps1 一键安装/卸载/重启/查看服务状态
- 前端通过 CORS 调用 localhost:3001 后台服务，兼容 IIS 静态部署
- 发布脚本自动重启后台服务，部署后立即生效

### v2.3.0
- 新增小说阅读模块，支持在线阅读连载小说
- 沉浸式阅读器：字体大小、背景主题切换，自动记录进度
- 移动端底部导航重构：首页/关系/游戏/小说/更多
- PC 端顶部导航新增「小说」入口
- 数据导出新增小说阅读进度选项

### v2.2.1
- 修复误提交的破坏性重构，恢复完整应用功能
- 清理多余文件（报告文件、vite 配置、dist 目录等）

### v2.2.0
- 新增电玩城模块，内嵌飞天太空、文明进化两款游戏
- 游戏列表支持卡片式展示，可扩展添加更多游戏
- 支持 iframe 全屏游玩，PC 端可切换全屏模式
- 移动端底部导航新增「更多」弹出菜单，容纳更多功能入口

### v2.0.1
- 新增 API 密钥有效性验证，使用前自动检测
- 密钥无效或余额不足时弹窗引导重新配置
- 验证结果缓存5分钟，减少重复检测
- 所有 AI 分析模块统一使用新的验证机制

### v2.0.0
- 重构代码架构，采用模块协调器模式
- app.js 拆分为9个子文件，提升可维护性
- contacts.js 拆分为6个子文件
- diary.js 拆分为5个子文件
- chat.js 拆分为3个子文件
- comprehensive.js 拆分为4个子文件
- datacard.js 拆分为6个子文件
- utils.js UI功能拆分到独立文件

### v1.9.x
- 联系人详情页新增联系方式展示
- 综合画像调整至首页画像列表首位
- 修复编辑联系人备注后页面不刷新的问题
- 统一联系人列表与首页的测试结果摘要显示

### v1.8.x
- 首页新增个性化问候语和每日心理学语录
- 首页新增打卡统计（连续天数、本周日记、完成测试）
- SEO优化：新增meta标签、Open Graph、结构化数据
- 新增sitemap.xml和robots.txt

### v1.8.1
- 综合画像分析整合日记情绪记录和关系网数据
- 「AI 问答」模块更名优化
- 优化导航栏顺序
- 修复关系网模块兼容性问题

### v1.8.0
- 新增关系网管理模块，可导入他人数据建立关系网络
- 支持「导入本人数据」恢复备份，智能身份验证和数据合并
- 支持「导入关系网数据」添加联系人，自动检测同名冲突
- 数据导出新增关系网数据选项

### v1.6.0
- 数据卡片支持 AES-256-GCM 加密，防止数据泄露
- 添加 HMAC-SHA256 签名验证，防止数据篡改
- 导出时设置密码，导入时验证密码
- 兼容旧版未加密数据卡片导入

### v1.5.0
- 新增数据卡片导出功能，生成精美个人画像卡
- 支持从数据卡片图片恢复所有数据
- 数据卡片可保存分享，方便跨设备迁移
- 采用LZString压缩，支持大量数据存储

### v1.4.0
- 新增依恋类型测试（30道题），了解亲密关系模式
- 新增情商测试（40道题），评估五大情商维度
- 新增价值观测试（30道题），发现核心价值观
- 新增心理健康自测（GAD-7 + PHQ-9 量表）
- 所有新测试支持AI深度分析报告

### v1.3.0
- 全面优化移动端界面适配
- 优化首页、测试、日记等页面布局
- 优化设置页面和 AI 问答聊天界面
- 调整响应式断点和字体大小

### v1.2.0
- 新增 AI 问答模块（有问必答，不保证靠谱）
- 流式输出支持
- Markdown 格式渲染
- 优化版本更新提示

### v1.1.0
- 新增意见反馈功能
- 新增版本更新日志
- 日记支持添加图片
- 优化移动端布局

### v1.0.0
- MBTI/大五/霍兰德测试
- 综合画像分析
- 个人日记功能
- AI 智能分析
- 本地加密存储

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 支持项目

如果「观己」对你有帮助，欢迎：
- 给项目点个 Star
- 分享给朋友
- [请开发者喝杯咖啡](https://github.com/Zhu-Li/MySelfApp)

---

Made with ❤️ by [Zhu-Li](https://github.com/Zhu-Li)
