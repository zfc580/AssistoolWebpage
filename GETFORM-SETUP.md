# Getform集成配置指南

## 📋 概述

本文档详细说明如何配置Getform服务来替代Formspree和金数据，用于收集用户邮箱预约信息。Getform是一个简单易用的表单服务，无需复杂的API配置，直接通过HTTP POST请求即可工作。

## 🎯 Getform优势

- **简单易用**：无需复杂的API密钥配置
- **免费使用**：每月50次免费提交
- **国际化**：服务稳定，访问速度快
- **即插即用**：无需特殊字段映射
- **自动邮件通知**：提交后自动发送邮件通知

## 🚀 快速开始

### 第一步：注册Getform账号

1. 访问 [Getform官网](https://getform.io)
2. 点击"Sign up"或"Get Started for Free"
3. 使用邮箱注册账号
4. 验证邮箱并完成注册

### 第二步：创建表单

1. 登录Getform控制台
2. 点击"Create New Form"
3. 设置表单名称：**"wechat-keyboard-helper"**
4. 设置接收邮箱（用于接收通知邮件）
5. 点击"Create Form"

### 第三步：获取表单URL

1. 在表单管理页面，找到你的表单
2. 复制表单的提交URL，格式类似：
   ```
   https://getform.io/f/your-form-id
   ```
3. 这个URL就是你需要的表单ID

## 🔧 配置项目

### 更新API配置

编辑 [`scripts/api.js`](scripts/api.js) 文件：

```javascript
const API_CONFIG = {
    getform: {
        formURL: 'https://getform.io/f/YOUR_ACTUAL_FORM_ID', // 替换为你的实际表单URL
        fieldName: {
            email: 'email',
            source: 'source',
            timestamp: 'timestamp',
            user_agent: 'user_agent',
            referrer: 'referrer',
            language: 'language'
        }
    }
};
```

### 配置邮件通知（可选）

如果你希望在Getform服务失败时使用邮件直连：

```javascript
emailDirect: {
    recipient: 'your-actual-email@example.com', // 你的接收邮箱
    subject: '微信输入法助手 - 新用户预约'
}
```

## 📊 Getform工作原理

### 提交流程

1. **表单提交**：用户在网站上填写邮箱
2. **数据发送**：通过HTTP POST请求发送到Getform
3. **数据处理**：Getform接收并存储数据
4. **邮件通知**：自动发送邮件通知到你设置的邮箱
5. **数据管理**：你可以在Getform控制台查看所有提交

### 数据格式

Getform会自动处理所有以`name`属性提交的数据：

```javascript
// 自动映射的字段
{
    email: "user@example.com",
    source: "landing_page",
    timestamp: "2024-01-01T12:00:00.000Z",
    user_agent: "Mozilla/5.0...",
    referrer: "https://google.com",
    language: "zh-CN",
    page_url: "https://yoursite.com"
}
```

## 🧪 测试配置

### 方法1：使用浏览器控制台

1. 打开你的网站
2. 打开浏览器开发者工具 (F12)
3. 在控制台中运行：

```javascript
// 测试邮箱提交
API.submitEmail('test@example.com').then(result => {
    console.log('测试结果:', result);
});
```

### 方法2：使用测试页面

1. 打开 [`test.html`](test.html) 测试页面
2. 填写测试邮箱
3. 点击提交按钮
4. 查看控制台输出和邮件收件箱

### 方法3：使用curl命令

```bash
curl -X POST \
  https://getform.io/f/YOUR_FORM_ID \
  -H 'Accept: application/json' \
  -F 'email=test@example.com' \
  -F 'source=landing_page' \
  -F 'timestamp=2024-01-01T12:00:00.000Z'
```

## 🔍 故障排除

### 常见问题

#### 1. 表单URL错误

**错误信息**: `404 Not Found`

**解决方案**:
- 检查表单URL是否正确
- 确认表单在Getform中已创建并激活
- 复制完整的表单URL（包括https://getform.io/f/部分）

#### 2. 网络连接问题

**错误信息**: `Failed to fetch`

**解决方案**:
- 检查网络连接
- 尝试使用VPN
- 检查防火墙设置

#### 3. 超时错误

**错误信息**: `请求超时`

**解决方案**:
- 增加超时时间配置
- 检查网络速度
- 重试提交

#### 4. 邮件未收到

**可能原因**:
- 检查垃圾邮件文件夹
- 确认Getform中的邮箱设置正确
- 等待几分钟，邮件可能有延迟

### 调试技巧

1. **查看网络请求**：
   ```javascript
   // 在浏览器开发者工具中查看Network标签页
   // 查看请求URL、状态码和响应内容
   ```

2. **启用详细日志**：
   ```javascript
   localStorage.setItem('debug', 'true');
   ```

3. **检查Getform控制台**：
   - 登录Getform网站
   - 查看表单提交记录
   - 确认数据是否正确接收

## 📈 高级配置

### 自定义字段

Getform支持任意字段，你可以添加更多数据收集：

```javascript
const submissionData = {
    email: email,
    source: 'landing_page',
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    referrer: document.referrer || 'direct',
    language: navigator.language,
    page_url: window.location.href,
    // 添加自定义字段
    campaign: 'wechat_landing_page',
    device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
};
```

### 表单验证

Getform支持表单验证，你可以在Getform控制台设置：
- 必填字段
- 邮箱格式验证
- 自定义验证规则

### 自动回复

在Getform控制台可以设置自动回复邮件：
- 感谢邮件
- 确认信息
- 预约成功通知

## 🛡️ 安全考虑

1. **HTTPS**：确保你的网站使用HTTPS
2. **CSRF保护**：Getform自动处理CSRF保护
3. **数据隐私**：Getform符合GDPR标准
4. **备份**：定期从Getform导出数据

## 🔄 备选方案

如果Getform服务出现问题，系统会自动使用备选方案：

1. **邮件直连**：打开用户邮件客户端
2. **本地存储**：保存到浏览器，网络恢复后同步

## 📞 Getform支持

- **官方网站**: https://getform.io
- **文档**: https://getform.io/docs
- **定价**: 免费版每月50次提交
- **支持**: support@getform.io

## ✅ 配置清单

完成配置后，请确认以下项目：

- [ ] Getform账号已注册并验证
- [ ] 表单已创建
- [ ] 表单URL已正确配置
- [ ] 接收邮箱已设置
- [ ] 测试提交功能正常
- [ ] 能收到提交通知邮件
- [ ] 数据能在Getform控制台查看
- [ ] 备选方案已配置（可选）

## 🎉 完成！

配置完成后，你的网站就可以使用Getform服务收集用户邮箱了！

### 使用流程

1. 用户在网站上填写邮箱并提交
2. 数据自动发送到Getform
3. 你会收到邮件通知
4. 可以在Getform控制台查看所有提交
5. 支持数据导出为CSV格式

Getform相比Formspree和金数据的优势是无需复杂的API配置，直接使用HTTP POST即可，非常适合简单表单收集场景。