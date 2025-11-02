// DOM元素引用
const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');
const successModal = document.getElementById('successModal');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.querySelector('.nav-menu');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeScrollAnimations();
    initializeSmoothScroll();
    initializeMobileMenu();
});

// 表单验证和提交
function initializeFormValidation() {
    emailForm.addEventListener('submit', handleFormSubmit);

    // 实时验证
    emailInput.addEventListener('input', function() {
        validateEmail(this.value);
    });

    emailInput.addEventListener('blur', function() {
        if (this.value) {
            validateEmail(this.value);
        }
    });
}

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
        showMessage('请输入邮箱地址', 'error');
        return false;
    }

    if (!emailRegex.test(email)) {
        showMessage('请输入有效的邮箱地址', 'error');
        return false;
    }

    hideMessage();
    return true;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
        return;
    }

    // 显示加载状态
    const submitBtn = emailForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '提交中...';
    submitBtn.disabled = true;

    try {
        // 使用window.API.submitEmail
        if (!window.API || !window.API.submitEmail) {
            throw new Error('API未加载，请刷新页面重试');
        }

        // 调用API提交邮箱
        const result = await window.API.submitEmail(email);

        if (result.success) {
            // 显示成功消息
            showSuccessModal();
            emailForm.reset();
            hideMessage();

            // 本地存储记录
            saveSubmission(email);
        } else {
            showMessage(result.message || '提交失败，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('提交错误:', error);
        showMessage('网络错误，请检查网络连接后重试', 'error');
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
}

function hideMessage() {
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';
}

function showSuccessModal() {
    successModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// 点击模态框外部关闭
successModal.addEventListener('click', function(event) {
    if (event.target === successModal) {
        closeModal();
    }
});

// 本地存储功能
function saveSubmission(email) {
    const submissions = JSON.parse(localStorage.getItem('emailSubmissions') || '[]');
    submissions.push({
        email: email,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('emailSubmissions', JSON.stringify(submissions));
}

function getSubmissions() {
    return JSON.parse(localStorage.getItem('emailSubmissions') || '[]');
}

// 滚动动画
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll(
        '.pain-item, .feature-card, .comparison-item, .waiting-badge'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// 添加动画类
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// 平滑滚动
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// 导航栏滚动效果
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.header');

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // 向下滚动 - 隐藏导航栏
        header.style.transform = 'translateY(-100%)';
    } else {
        // 向上滚动 - 显示导航栏
        header.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;

    // 添加背景效果
    if (scrollTop > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    }
});

// 添加导航栏过渡效果
const header = document.querySelector('.header');
header.style.transition = 'all 0.3s ease-out';

// 移动端菜单功能
function initializeMobileMenu() {
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // 点击菜单外部关闭菜单
        document.addEventListener('click', function(event) {
            if (!mobileMenuBtn.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });

        // 点击菜单项后关闭菜单
        navMenu.addEventListener('click', function(event) {
            if (event.target.tagName === 'A') {
                navMenu.classList.remove('active');
            }
        });
    }
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// 添加页面加载动画
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 性能优化：节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 优化滚动事件
const optimizedScroll = throttle(function() {
    // 滚动相关的优化处理
}, 100);

window.addEventListener('scroll', optimizedScroll);

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
    // 可以在这里添加错误上报逻辑
});

// 页面可见性处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停某些动画
        console.log('页面已隐藏');
    } else {
        // 页面显示时恢复动画
        console.log('页面已显示');
    }
});

// 导出功能供其他脚本使用
window.AppUtils = {
    scrollToSection,
    showMessage,
    hideMessage,
    getSubmissions,
    debounce,
    throttle
};