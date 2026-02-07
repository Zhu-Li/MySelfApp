# 观己 - 自我认知应用

> 静观己心，内外澄明

「观己」是一款帮助你了解自己的自我认知应用，通过科学的心理测试和 AI 分析，探索你的性格特征与内在世界。

## 功能特性

### 心理测试
- **MBTI 性格测试** - 70 道专业题目，深入了解你的性格类型
- **大五人格测试** - 50 道题目，评估开放性、尽责性、外向性、宜人性、神经质
- **霍兰德职业兴趣测试** - 60 道题目，发现适合你的职业方向
- **综合画像分析** - 整合多维度测试结果，生成个人画像

### AI 智能分析
- 基于硅基流动 API 的智能分析
- 个性化性格解读与建议
- 流式输出，实时显示分析结果

### AI 智障
- 人工智障对话助手
- 有问必答，答非所问
- 支持 Markdown 格式渲染

### 个人日记
- 记录每日心情与想法
- 支持添加图片（最多 9 张）
- 心情标签分类
- AI 情感分析

### 数据安全
- 所有数据本地存储（IndexedDB）
- AES-GCM 加密保护
- 密码验证访问
- 支持数据导入导出
- 支持数据卡片导出（图片形式迁移数据，可选择导出内容）

### 其他功能
- 深色/浅色主题切换
- 移动端适配
- 意见反馈
- 版本更新日志

## 技术栈

- **前端框架**: 原生 HTML/CSS/JavaScript（零依赖）
- **数据存储**: IndexedDB + Web Crypto API 加密
- **AI 能力**: 硅基流动 API（DeepSeek-V3）
- **邮件服务**: Web3Forms

## 快速开始

### 在线体验

直接访问 [GitHub Pages](https://zhu-li.github.io/MySelfApp) 即可使用。

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
│   ├── app.js          # 应用主逻辑
│   ├── router.js       # 路由管理
│   ├── storage.js      # 数据存储
│   ├── utils.js        # 工具函数
│   ├── api.js          # API 调用
│   └── datacard.js     # 数据卡片生成
├── modules/
│   ├── mbti/           # MBTI 测试模块
│   ├── bigfive/        # 大五人格模块
│   ├── holland/        # 霍兰德测试模块
│   ├── comprehensive/  # 综合画像模块
│   ├── diary/          # 日记模块
│   ├── chat/           # AI 智障模块
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
- 优化设置页面和 AI 智障聊天界面
- 调整响应式断点和字体大小

### v1.2.0
- 新增 AI 智障模块（有问必答，不保证靠谱）
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
