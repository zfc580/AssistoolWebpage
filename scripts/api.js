// API配置 - 使用免费第三方服务
const API_CONFIG = {
    // Formspree 配置 - 免费邮箱收集服务
    formURL: 'https://formspree.io/f/YOUR_FORMSPREE_ID', // 替换为你的Formspree表单ID
    // Google Analytics 4 配置
    ga4MeasurementId: 'G-YOUR_GA4_MEASUREMENT_ID', // 替换为你的GA4测量ID
    // Google Sheets 备选方案
    sheetDBEndpoint: 'https://api.sheetdb.io/api/v1/YOUR_SHEETDB_ID', // 可选备选方案
    timeout: 10000,
    endpoints: {
        submitEmail: '/email/subscribe',
        trackEvent: '/analytics/track',
        getStats: '/stats/public'
    }
};

// API请求封装
class API {
    constructor(config = API_CONFIG) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout;
        this.endpoints = config.endpoints;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Version': '1.0.0',
                'X-Client-Platform': navigator.platform,
                ...options.headers
            },
            ...options
        };

        try {
            // 添加超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            config.signal = controller.signal;

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                status: response.status
            };

        } catch (error) {
            console.error('API请求错误:', error);

            // 处理不同类型的错误
            let errorMessage = '网络错误，请稍后重试';

            if (error.name === 'AbortError') {
                errorMessage = '请求超时，请检查网络连接';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '网络连接失败，请检查网络设置';
            } else if (error.message.includes('HTTP错误')) {
                errorMessage = error.message;
            }

            return {
                success: false,
                message: errorMessage,
                error: error.message
            };
        }
    }

    // GET请求
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.pathname + url.search, {
            method: 'GET'
        });
    }

    // POST请求
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT请求
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE请求
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 创建API实例
const api = new API();

// 邮箱提交API - 使用Formspree
export async function submitEmail(email) {
    try {
        // 首先尝试使用Formspree
        const formData = new FormData();
        formData.append('email', email);
        formData.append('source', 'landing_page');
        formData.append('timestamp', new Date().toISOString());
        formData.append('user_agent', navigator.userAgent);
        formData.append('referrer', document.referrer || 'direct');
        formData.append('language', navigator.language);

        const response = await fetch(API_CONFIG.formURL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // 记录成功事件到GA4
            gtagTrackEvent('email_submitted', {
                email: email,
                source: 'landing_page'
            });

            return {
                success: true,
                message: '预约成功！我们会在工具发布后第一时间通知您。'
            };
        } else {
            throw new Error('Formspree提交失败');
        }

    } catch (error) {
        console.error('邮箱提交错误:', error);

        // 尝试备选方案：Google Sheets (如果配置了的话)
        if (API_CONFIG.sheetDBEndpoint && !API_CONFIG.sheetDBEndpoint.includes('YOUR_SHEETDB_ID')) {
            try {
                const sheetResponse = await fetch(API_CONFIG.sheetDBEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        source: 'landing_page',
                        timestamp: new Date().toISOString(),
                        user_agent: navigator.userAgent,
                        referrer: document.referrer || 'direct',
                        language: navigator.language
                    })
                });

                if (sheetResponse.ok) {
                    gtagTrackEvent('email_submitted', {
                        email: email,
                        source: 'landing_page',
                        method: 'sheetdb'
                    });

                    return {
                        success: true,
                        message: '预约成功！我们会在工具发布后第一时间通知您。'
                    };
                }
            } catch (sheetError) {
                console.warn('Google Sheets提交失败:', sheetError);
            }
        }

        // 最后使用本地存储作为备选方案
        return fallbackEmailSubmission(email);
    }
}

// 备选方案：本地存储
function fallbackEmailSubmission(email) {
    try {
        const submissions = JSON.parse(localStorage.getItem('emailSubmissions') || '[]');

        // 检查是否已经提交过
        if (submissions.some(sub => sub.email === email)) {
            return {
                success: false,
                message: '该邮箱已经预约过了，请耐心等待发布通知。'
            };
        }

        // 添加到本地存储
        submissions.push({
            email: email,
            timestamp: new Date().toISOString(),
            status: 'pending_sync'
        });

        localStorage.setItem('emailSubmissions', JSON.stringify(submissions));

        // 标记需要同步
        const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        pendingSync.push({
            type: 'email_submission',
            data: { email, timestamp: new Date().toISOString() }
        });
        localStorage.setItem('pendingSync', JSON.stringify(pendingSync));

        return {
            success: true,
            message: '预约成功！我们会在工具发布后第一时间通知您。',
            isOffline: true
        };

    } catch (error) {
        console.error('本地存储错误:', error);
        return {
            success: false,
            message: '系统暂时繁忙，请稍后重试。'
        };
    }
}

// Google Analytics 4 追踪函数
function gtagTrackEvent(eventName, parameters = {}) {
    try {
        // 检查 gtag 函数是否存在
        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                ...parameters,
                custom_map: {
                    custom_parameter_1: 'custom_parameter_1',
                    custom_parameter_2: 'custom_parameter_2'
                }
            });
        } else {
            // 如果 gtag 不可用，尝试使用 dataLayer
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    event: eventName,
                    event_parameters: parameters
                });
            } else {
                console.warn('Google Analytics 未初始化');
            }
        }
    } catch (error) {
        console.warn('GA4 事件追踪失败:', error);
    }
}

// 事件追踪API - 使用Google Analytics 4
export async function trackEvent(eventName, properties = {}) {
    try {
        const eventData = {
            ...properties,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            sessionId: getSessionId()
        };

        // 发送到Google Analytics 4
        gtagTrackEvent(eventName, eventData);

        // 同时尝试发送到自定义API（如果配置了的话）
        if (API_CONFIG.baseURL && !API_CONFIG.baseURL.includes('your-api-domain.com')) {
            const customEventData = {
                event: eventName,
                properties: eventData
            };

            api.post(API_CONFIG.endpoints.trackEvent, customEventData).catch(error => {
                console.warn('自定义事件追踪失败:', error);
                // 失败时存储到本地，待后续同步
                storeEventForLaterSync(customEventData);
            });
        }

    } catch (error) {
        console.warn('事件追踪错误:', error);
    }
}

// 获取会话ID
function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

// 存储事件待后续同步
function storeEventForLaterSync(eventData) {
    try {
        const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
        pendingEvents.push(eventData);

        // 限制存储的事件数量
        if (pendingEvents.length > 50) {
            pendingEvents.shift();
        }

        localStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
    } catch (error) {
        console.warn('存储事件失败:', error);
    }
}

// 获取公开统计数据
export async function getPublicStats() {
    try {
        const response = await api.get(API_CONFIG.endpoints.getStats);
        return response.success ? response.data : null;
    } catch (error) {
        console.warn('获取统计数据失败:', error);
        return null;
    }
}

// 同步本地数据到服务器
export async function syncLocalData() {
    try {
        // 同步待处理的邮箱提交
        const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        const syncResults = [];

        for (const item of pendingSync) {
            if (item.type === 'email_submission') {
                try {
                    // 尝试通过 Formspree 同步
                    const formData = new FormData();
                    Object.keys(item.data).forEach(key => {
                        formData.append(key.replace('_', '_'), item.data[key]);
                    });

                    const response = await fetch(API_CONFIG.formURL, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        syncResults.push({
                            item,
                            success: true
                        });
                    } else {
                        throw new Error('Formspree同步失败');
                    }

                } catch (error) {
                    syncResults.push({
                        item,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        // 清除成功同步的数据
        const successfulSyncs = syncResults.filter(r => r.success);
        if (successfulSyncs.length > 0) {
            const remainingSync = pendingSync.filter(item =>
                !successfulSyncs.some(result => result.item === item)
            );
            localStorage.setItem('pendingSync', JSON.stringify(remainingSync));
        }

        // 同步事件数据到GA4
        const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
        if (pendingEvents.length > 0) {
            try {
                pendingEvents.forEach(event => {
                    gtagTrackEvent(event.event, event.properties);
                });
                localStorage.removeItem('pendingEvents');
            } catch (error) {
                console.warn('批量事件同步失败:', error);
            }
        }

        return {
            success: true,
            syncedCount: successfulSyncs.length,
            totalCount: pendingSync.length
        };

    } catch (error) {
        console.error('同步数据失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 网络状态检测
export function isOnline() {
    return navigator.onLine;
}

// 监听网络状态变化
window.addEventListener('online', function() {
    console.log('网络已连接');
    // 尝试同步本地数据
    syncLocalData().catch(error => {
        console.warn('自动同步失败:', error);
    });
});

window.addEventListener('offline', function() {
    console.log('网络已断开');
    trackEvent('network_offline');
});

// 页面加载时尝试同步
window.addEventListener('load', function() {
    if (isOnline()) {
        // 延迟同步，避免影响页面加载
        setTimeout(() => {
            syncLocalData().catch(error => {
                console.warn('页面加载同步失败:', error);
            });
        }, 2000);
    }
});

// 页面卸载前同步数据
window.addEventListener('beforeunload', function() {
    if (isOnline()) {
        // 使用sendBeacon进行快速同步到Formspree
        const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        const emailSubmissions = pendingSync.filter(item => item.type === 'email_submission');

        if (emailSubmissions.length > 0) {
            emailSubmissions.forEach(item => {
                try {
                    const formData = new FormData();
                    Object.keys(item.data).forEach(key => {
                        formData.append(key.replace('_', '_'), item.data[key]);
                    });

                    navigator.sendBeacon(API_CONFIG.formURL, formData);
                } catch (error) {
                    console.warn('页面卸载同步失败:', error);
                }
            });
        }
    }
});

// 导出API实例和函数
export default api;

// 全局API对象（供非模块化脚本使用）
window.API = {
    submitEmail,
    trackEvent,
    getPublicStats,
    syncLocalData,
    isOnline
};