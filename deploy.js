#!/usr/bin/env node

/**
 * 微信输入法助手 - 快速部署脚本
 * 使用方法: node deploy.js
 *
 * 此脚本将帮助您：
 * 1. 检查必要的配置
 * 2. 验证文件完整性
 * 3. 生成部署包
 * 4. 提供部署指导
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n📍 步骤 ${step}: ${message}`, 'bright');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// 必需的文件列表
const requiredFiles = [
    'index.html',
    'styles/main.css',
    'styles/responsive.css',
    'scripts/main.js',
    'scripts/api.js'
];

// 需要检查的配置项
const configChecks = [
    {
        file: 'scripts/api.js',
        pattern: /YOUR_FORMSPREE_ID/,
        description: 'Formspree 表单ID',
        replaceWith: 'https://formspree.io/f/你的实际ID'
    },
    {
        file: 'scripts/api.js',
        pattern: /G-YOUR_GA4_MEASUREMENT_ID/,
        description: 'Google Analytics 4 测量ID (api.js)',
        replaceWith: 'G-你的实际ID'
    },
    {
        file: 'index.html',
        pattern: /G-YOUR_GA4_MEASUREMENT_ID/g,
        description: 'Google Analytics 4 测量ID (index.html)',
        replaceWith: 'G-你的实际ID'
    }
];

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

function readFileContent(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function checkConfiguration() {
    logStep(1, '检查配置文件');

    let allConfigured = true;

    configChecks.forEach((check, index) => {
        if (!checkFileExists(check.file)) {
            logError(`文件不存在: ${check.file}`);
            allConfigured = false;
            return;
        }

        const content = readFileContent(check.file);
        if (check.pattern.test(content)) {
            logWarning(`${check.description} 未配置 (${check.file})`);
            logInfo(`  请将占位符替换为: ${check.replaceWith}`);
            allConfigured = false;
        } else {
            logSuccess(`${check.description} 已配置`);
        }
    });

    return allConfigured;
}

function checkFiles() {
    logStep(2, '检查文件完整性');

    let allFilesExist = true;

    requiredFiles.forEach(file => {
        if (checkFileExists(file)) {
            const stats = fs.statSync(file);
            const sizeKB = (stats.size / 1024).toFixed(2);
            logSuccess(`${file} (${sizeKB} KB)`);
        } else {
            logError(`缺少必需文件: ${file}`);
            allFilesExist = false;
        }
    });

    return allFilesExist;
}

function validateHTML() {
    logStep(3, '验证HTML文件');

    try {
        const htmlContent = readFileContent('index.html');

        // 基本HTML结构检查
        const checks = [
            { pattern: /<!DOCTYPE html>/, description: 'DOCTYPE声明' },
            { pattern: /<html lang="zh-CN">/, description: 'HTML语言属性' },
            { pattern: /<meta charset="UTF-8">/, description: '字符编码设置' },
            { pattern: /<meta name="viewport"/, description: '视口设置' },
            { pattern: /<title>/, description: '页面标题' },
            { pattern: /<meta name="description"/, description: '页面描述' }
        ];

        let htmlValid = true;
        checks.forEach(check => {
            if (check.pattern.test(htmlContent)) {
                logSuccess(check.description);
            } else {
                logWarning(`缺少${check.description}`);
                htmlValid = false;
            }
        });

        return htmlValid;
    } catch (error) {
        logError(`HTML验证失败: ${error.message}`);
        return false;
    }
}

function validateJavaScript() {
    logStep(4, '验证JavaScript语法');

    try {
        const jsFiles = ['scripts/main.js', 'scripts/api.js'];
        let allValid = true;

        jsFiles.forEach(file => {
            if (checkFileExists(file)) {
                try {
                    // 简单的语法检查 - 尝试解析文件
                    const content = readFileContent(file);
                    new Function(content);
                    logSuccess(`${file} 语法正确`);
                } catch (error) {
                    logError(`${file} 语法错误: ${error.message}`);
                    allValid = false;
                }
            }
        });

        return allValid;
    } catch (error) {
        logError(`JavaScript验证失败: ${error.message}`);
        return false;
    }
}

function checkGitStatus() {
    logStep(5, '检查Git状态');

    try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });

        if (gitStatus.trim()) {
            logWarning('有未提交的更改:');
            console.log(gitStatus);
            logInfo('建议在部署前提交所有更改');
        } else {
            logSuccess('所有更改已提交');
        }

        return true;
    } catch (error) {
        logWarning('Git仓库未初始化或不在Git目录中');
        return false;
    }
}

function generateDeployInfo() {
    logStep(6, '生成部署信息');

    const deployInfo = {
        timestamp: new Date().toISOString(),
        files: requiredFiles,
        size: {},
        configuration: {}
    };

    // 计算文件大小
    requiredFiles.forEach(file => {
        if (checkFileExists(file)) {
            const stats = fs.statSync(file);
            deployInfo.size[file] = `${(stats.size / 1024).toFixed(2)} KB`;
        }
    });

    // 保存部署信息
    fs.writeFileSync('deploy-info.json', JSON.stringify(deployInfo, null, 2));
    logSuccess('部署信息已保存到 deploy-info.json');
}

function provideDeploymentInstructions() {
    logStep(7, '部署指导');

    log('\n🚀 推荐的部署方式:', 'bright');
    log('\n1. Netlify部署 (推荐):', 'cyan');
    log('   - 访问 https://netlify.com');
    log('   - 拖拽项目文件夹到部署区域');
    log('   - 或连接Git仓库自动部署');

    log('\n2. Vercel部署:', 'cyan');
    log('   - 访问 https://vercel.com');
    log('   - 导入GitHub仓库');
    log('   - 自动部署');

    log('\n3. GitHub Pages:', 'cyan');
    log('   - 推送代码到GitHub仓库');
    log('   - 在仓库设置中启用Pages');
    log('   - 选择main分支作为源');

    log('\n📋 部署后检查清单:', 'bright');
    log('   - [ ] 网站通过外网正常访问');
    log('   - [ ] 邮箱提交功能正常');
    log('   - [ ] Google Analytics数据收集正常');
    log('   - [ ] 响应式设计在各设备上正常');
    log('   - [ ] 所有链接和按钮工作正常');

    log('\n🔧 如果需要帮助:', 'bright');
    log('   - 查看 DEPLOYMENT.md 获取详细指导');
    log('   - 查看 PRE-FLIGHT.md 获取检查清单');
    log('   - 使用 test.html 进行功能测试');
}

function main() {
    log('🚀 微信输入法助手 - 快速部署检查', 'bright');
    log('=' * 50, 'cyan');

    let readyToDeploy = true;

    // 执行所有检查
    readyToDeploy &= checkFiles();
    readyToDeploy &= validateHTML();
    readyToDeploy &= validateJavaScript();
    readyToDeploy &= checkGitStatus();

    const configReady = checkConfiguration();

    if (!configReady) {
        log('\n⚠️  配置未完成，请先完成以下配置:', 'yellow');
        configChecks.forEach(check => {
            const content = readFileContent(check.file);
            if (check.pattern.test(content)) {
                log(`   - ${check.description}`, 'yellow');
            }
        });
        log('\n配置完成后请重新运行此脚本。\n');
        process.exit(1);
    }

    if (readyToDeploy) {
        generateDeployInfo();
        provideDeploymentInstructions();

        log('\n🎉 项目已准备就绪，可以开始部署!', 'green');
        log('   推荐使用 Netlify 进行快速部署。\n');
    } else {
        log('\n❌ 项目未准备好部署，请解决上述问题后重试。\n', 'red');
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    checkFiles,
    checkConfiguration,
    validateHTML,
    validateJavaScript,
    generateDeployInfo
};