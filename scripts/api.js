// API配置
const API_CONFIG = {
    baseURL: 'https://your-api-domain.com/api', // 替换为实际的API地址
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

// 邮箱提交API
export async function submitEmail(email) {
    try {
        // 发送邮箱到后端
        const response = await api.post(API_CONFIG.endpoints.submitEmail, {
            email: email,
            source: 'landing_page',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            language: navigator.language
        });

        if (response.success) {
            // 记录成功事件
            trackEvent('email_submitted', {
                email: email,
                source: 'landing_page'
            });

            return {
                success: true,
                message: '预约成功！我们会在工具发布后第一时间通知您。'
            };
        } else {
            return response;
        }

    } catch (error) {
        console.error('邮箱提交错误:', error);

        // 如果API失败，使用本地存储作为备选方案
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

// 事件追踪API
export async function trackEvent(eventName, properties = {}) {
    try {
        const eventData = {
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                userAgent: navigator.userAgent,
                sessionId: getSessionId()
            }
        };

        // 异步发送，不阻塞用户操作
        api.post(API_CONFIG.endpoints.trackEvent, eventData).catch(error => {
            console.warn('事件追踪失败:', error);
            // 失败时存储到本地，待后续同步
            storeEventForLaterSync(eventData);
        });

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
                    const result = await api.post(API_CONFIG.endpoints.submitEmail, item.data);
                    syncResults.push({
                        item,
                        success: result.success,
                        error: result.error
                    });
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

        // 同步事件数据
        const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
        if (pendingEvents.length > 0) {
            try {
                await api.post(API_CONFIG.endpoints.trackEvent, {
                    batch: true,
                    events: pendingEvents
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
        // 使用sendBeacon进行快速同步
        const pendingSync = localStorage.getItem('pendingSync');
        if (pendingSync) {
            navigator.sendBeacon(
                `${API_CONFIG.baseURL}/sync/batch`,
                pendingSync
            );
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