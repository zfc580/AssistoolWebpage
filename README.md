# 微信输入法助手 - 营销落地页

## 📖 项目简介

这是一个专为微信输入法用户打造的通讯录导入工具营销落地页。该页面旨在解决微信输入法无法像其他输入法一样直接导入通讯录的痛点，为用户提供便捷的解决方案。

## ✨ 核心功能

### 🎯 主要特性
- **邮箱预约系统**：用户可提交邮箱获取工具发布通知
- **倒计时功能**：显示工具发布倒计时，制造期待感
- **响应式设计**：完美适配手机、平板、桌面设备
- **滚动动画**：流畅的用户体验和视觉效果
- **离线支持**：网络断开时仍可正常工作

### 🛠️ 技术架构
- **前端技术**：HTML5 + CSS3 + Vanilla JavaScript
- **响应式设计**：移动优先，6个断点适配
- **API集成**：Formspree + Google Analytics 4
- **离线存储**：LocalStorage 数据持久化
- **性能优化**：无框架依赖，极简架构

## 🚀 快速开始

### 环境要求
- 现代浏览器（支持ES6+）
- 稳定的网络连接（用于API调用）

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/你的用户名/importNames.git
   cd importNames
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000

   # 或使用Node.js
   npx serve .

   # 或使用PHP
   php -S localhost:8000
   ```

3. **访问页面**
   打开浏览器访问 `http://localhost:8000`

## 📁 项目结构

```
importNames/
├── index.html              # 主页面
├── styles/
│   ├── main.css           # 核心样式
│   └── responsive.css     # 响应式样式
├── scripts/
│   ├── main.js            # 主要功能
│   └── api.js             # API接口封装
├── DEPLOYMENT.md          # 详细部署指南
└── README.md             # 项目说明
```

## ⚙️ 配置说明

### API配置

编辑 `scripts/api.js` 文件中的配置：

```javascript
const API_CONFIG = {
    // Formspree 邮箱收集服务
    formURL: 'https://formspree.io/f/YOUR_FORMSPREE_ID',
    // Google Analytics 4 统计
    ga4MeasurementId: 'G-YOUR_GA4_MEASUREMENT_ID',
    // Google Sheets 备选方案（可选）
    sheetDBEndpoint: 'https://api.sheetdb.io/api/v1/YOUR_SHEETDB_ID'
};
```

### 倒计时设置

编辑 `scripts/main.js` 文件：

```javascript
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 15); // 修改倒计时天数
targetDate.setHours(0, 0, 0, 0);
```

## 📱 响应式设计

### 断点设置
- **手机**：< 576px
- **小平板**：576px - 767px
- **大平板**：768px - 991px
- **桌面**：992px - 1199px
- **大桌面**：≥ 1200px

### 优化特性
- 移动优先设计
- 触摸友好的交互
- 流畅的滚动动画
- 自适应字体大小

## 🔧 功能详解

### 邮箱提交系统

1. **实时验证**：使用正则表达式验证邮箱格式
2. **重复检测**：防止同一邮箱多次提交
3. **离线存储**：网络失败时自动存储到本地
4. **自动同步**：网络恢复时自动同步数据

### 事件追踪

- **页面浏览**：记录用户访问行为
- **按钮点击**：追踪用户交互
- **邮箱提交**：监控转化率
- **滚动深度**：分析用户参与度

### 性能优化

- **懒加载**：图片和动画按需加载
- **缓存策略**：合理利用浏览器缓存
- **资源压缩**：CSS和JS文件优化
- **CDN支持**：静态资源加速

## 📊 数据分析

### Google Analytics 4 配置

页面自动追踪以下事件：
- `page_view` - 页面浏览
- `email_submitted` - 邮箱提交
- `button_click` - 按钮点击
- `scroll_depth` - 滚动深度

### 自定义维度

- `landing_page_type` - 落地页类型
- `user_engagement` - 用户参与度
- `device_category` - 设备分类
- `traffic_source` - 流量来源

## 🌐 部署指南

### 推荐部署平台

1. **Netlify**（推荐）
   - 免费额度充足
   - 自动HTTPS
   - 全球CDN加速
   - 支持自定义域名

2. **Vercel**
   - 优秀的性能
   - 简单的部署流程
   - 实时预览功能

3. **GitHub Pages**
   - 与GitHub集成
   - 完全免费
   - 简单可靠

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔒 隐私和安全

### 数据保护
- **本地加密**：敏感数据本地存储
- **HTTPS传输**：所有数据传输加密
- **API安全**：使用可靠第三方服务
- **无追踪**：不收集用户个人信息

### 合规性
- 遵循GDPR要求
- 支持Cookie同意
- 数据可删除
- 透明的隐私政策

## 🐛 故障排除

### 常见问题

1. **邮箱提交失败**
   - 检查网络连接
   - 确认API配置正确
   - 查看浏览器控制台

2. **动画不流畅**
   - 检查设备性能
   - 更新浏览器版本
   - 关闭不必要的插件

3. **响应式布局异常**
   - 清除浏览器缓存
   - 检查视口设置
   - 测试不同浏览器

### 调试模式

启用调试模式：
```javascript
// 在浏览器控制台执行
localStorage.setItem('debug', 'true');
```

## 🤝 贡献指南

### 开发规范
1. 遵循ES6+语法规范
2. 使用语义化HTML标签
3. 保持CSS命名一致性
4. 添加必要的注释

### 提交流程
1. Fork项目仓库
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request

## 📈 性能监控

### 关键指标
- **页面加载时间**：< 3秒
- **首次内容绘制**：< 1.5秒
- **交互就绪时间**：< 2秒
- **CLS分数**：< 0.1

### 监控工具
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **邮箱**：your-email@example.com
- **GitHub**：https://github.com/你的用户名/importNames
- **问题反馈**：https://github.com/你的用户名/importNames/issues

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！