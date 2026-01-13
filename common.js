/**
 * 通用工具函数和全局变量
 * 被所有页面共享使用
 */

// ==================== URL参数处理 ====================

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 设置URL参数（不刷新页面）
 * @param {string} name - 参数名
 * @param {string} value - 参数值
 */
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

/**
 * 删除URL参数
 * @param {string} name - 参数名
 */
function removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// ==================== 页面导航 ====================

/**
 * 导航到学习页面
 * @param {string} exampleId - 示例ID
 */
function navigateToLearning(exampleId) {
    window.location.href = `learning.html?exampleId=${exampleId}`;
}

/**
 * 导航到创作者中心
 * @param {string} exampleId - 可选，要编辑的示例ID
 */
function navigateToCreator(exampleId = null) {
    if (exampleId) {
        window.location.href = `creator.html?exampleId=${exampleId}`;
    } else {
        window.location.href = 'creator.html';
    }
}

/**
 * 导航到首页
 */
function navigateToHome() {
    window.location.href = 'index.html';
}

/**
 * 返回上一页
 */
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        navigateToHome();
    }
}

// ==================== localStorage管理 ====================

/**
 * 存储键名常量
 */
const STORAGE_KEYS = {
    EXAMPLES: 'xiaobaixue_examples',           // 所有示例列表
    EXAMPLE_DATA: 'xiaobaixue_example_',       // 示例数据前缀
    USER_PROGRESS: 'xiaobaixue_progress_',     // 用户进度前缀
    USER_SETTINGS: 'xiaobaixue_settings'       // 用户设置
};

/**
 * 获取所有示例列表
 * @returns {Array} 示例元数据数组
 */
function getAllExamples() {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMPLES);
    return data ? JSON.parse(data) : [];
}

/**
 * 获取已发布的示例列表
 * @returns {Array} 已发布的示例数组
 */
function getPublishedExamples() {
    const examples = getAllExamples();
    return examples.filter(ex => ex.published === true);
}

/**
 * 保存示例列表
 * @param {Array} examples - 示例数组
 */
function saveExamplesList(examples) {
    localStorage.setItem(STORAGE_KEYS.EXAMPLES, JSON.stringify(examples));
}

/**
 * 获取单个示例数据
 * @param {string} exampleId - 示例ID
 * @returns {Object|null} 示例完整数据
 */
function getExampleData(exampleId) {
    const key = STORAGE_KEYS.EXAMPLE_DATA + exampleId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

/**
 * 保存示例数据
 * @param {string} exampleId - 示例ID
 * @param {Object} data - 示例完整数据
 */
function saveExampleData(exampleId, data) {
    const key = STORAGE_KEYS.EXAMPLE_DATA + exampleId;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 删除示例数据
 * @param {string} exampleId - 示例ID
 */
function deleteExampleData(exampleId) {
    // 删除示例数据
    const key = STORAGE_KEYS.EXAMPLE_DATA + exampleId;
    localStorage.removeItem(key);
    
    // 从示例列表中删除
    const examples = getAllExamples();
    const filteredExamples = examples.filter(ex => ex.exampleId !== exampleId);
    saveExamplesList(filteredExamples);
}

/**
 * 获取用户学习进度
 * @param {string} exampleId - 示例ID
 * @returns {Object|null} 进度数据
 */
function getUserProgress(exampleId) {
    const key = STORAGE_KEYS.USER_PROGRESS + exampleId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

/**
 * 保存用户学习进度
 * @param {string} exampleId - 示例ID
 * @param {Object} progress - 进度数据
 */
function saveUserProgress(exampleId, progress) {
    const key = STORAGE_KEYS.USER_PROGRESS + exampleId;
    localStorage.setItem(key, JSON.stringify(progress));
}

// ==================== ID生成器 ====================

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'id') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * 生成示例ID
 * @returns {string} 示例ID
 */
function generateExampleId() {
    return generateId('ex');
}

/**
 * 生成区块ID
 * @returns {string} 区块ID
 */
function generateBlockId() {
    return generateId('block');
}

// ==================== 日期时间格式化 ====================

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string} 格式化后的日期时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
function formatDateTime(date) {
    const d = new Date(date);
    const dateStr = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
}

// ==================== 工具函数 ====================

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
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

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, wait) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success, error, warning, info)
 * @param {number} duration - 显示时长（毫秒）
 */
function showMessage(message, type = 'info', duration = 3000) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    // 根据类型设置颜色
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--primary-color)'
    };
    messageEl.style.borderLeft = `4px solid ${colors[type]}`;
    
    document.body.appendChild(messageEl);
    
    // 自动移除
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, duration);
}

/**
 * 确认对话框
 * @param {string} message - 确认消息
 * @returns {boolean} 用户是否确认
 */
function confirmDialog(message) {
    return confirm(message);
}

// ==================== DOM辅助函数 ====================

/**
 * 创建元素
 * @param {string} tag - 标签名
 * @param {Object} attributes - 属性对象
 * @param {string} content - 内容
 * @returns {HTMLElement} 创建的元素
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // 设置属性
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'style') {
            Object.assign(element.style, attributes[key]);
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, attributes[key]);
        } else {
            element[key] = attributes[key];
        }
    });
    
    // 设置内容
    if (content) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * 从文件加载JSON示例数据
 * @param {string} filePath - JSON文件路径
 * @returns {Promise<Object>} JSON数据
 */
async function loadExampleFromFile(filePath) {
    try {
        console.log('正在加载JSON文件:', filePath);
        const response = await fetch(filePath);
        if (!response.ok) {
            console.error(`HTTP错误! 状态码: ${response.status}, 请求URL: ${response.url}`);
            throw new Error(`无法加载文件 ${filePath}: HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('JSON文件加载成功:', filePath);
        return data;
    } catch (error) {
        console.error('加载JSON文件失败:', error);
        console.error('请确保：');
        console.error('1. 项目通过HTTP服务器运行（不是file://协议）');
        console.error('2. JSON文件路径正确:', filePath);
        console.error('3. 服务器可以访问data目录');
        throw error;
    }
}

/**
 * 初始化示例数据（从文件加载到localStorage）
 * @param {string} filePath - JSON文件路径
 * @param {boolean} forceReload - 是否强制重新加载
 * @returns {Promise<boolean>} 是否成功
 */
async function initializeExampleFromFile(filePath, forceReload = false) {
    try {
        const data = await loadExampleFromFile(filePath);
        const exampleId = data.exampleId;
        
        // 检查是否已存在
        const existingData = getExampleData(exampleId);
        if (existingData && !forceReload) {
            console.log(`示例 ${exampleId} 已存在，跳过加载`);
            return true;
        }
        
        // 保存示例数据
        saveExampleData(exampleId, data);
        
        // 更新示例列表
        const examples = getAllExamples();
        const existingIndex = examples.findIndex(ex => ex.exampleId === exampleId);
        
        const exampleMeta = {
            exampleId: exampleId,
            title: data.metadata.title,
            description: data.metadata.description,
            difficulty: data.metadata.difficulty,
            estimatedTime: data.metadata.estimatedTime,
            author: data.metadata.author || '小白学团队',
            createdAt: new Date().toISOString(),
            published: true,
            version: data.metadata.version || '1.0',
            thumbnailPath: data.metadata.thumbnailPath || ''
        };
        
        if (existingIndex >= 0) {
            examples[existingIndex] = exampleMeta;
        } else {
            examples.push(exampleMeta);
        }
        
        saveExamplesList(examples);
        
        console.log(`示例 ${exampleId} 初始化成功`);
        return true;
    } catch (error) {
        console.error('初始化示例失败:', error);
        return false;
    }
}

/**
 * 导出JSON到文件
 * @param {Object} data - JSON数据
 * @param {string} filename - 文件名
 */
function exportJSONToFile(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 从文件导入JSON
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} JSON数据
 */
function importJSONFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('JSON解析失败: ' + error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        
        reader.readAsText(file);
    });
}

// ==================== 页面加载完成事件 ====================

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导出到全局
window.CommonUtils = {
    getUrlParameter,
    setUrlParameter,
    removeUrlParameter,
    navigateToLearning,
    navigateToCreator,
    navigateToHome,
    goBack,
    getAllExamples,
    getPublishedExamples,
    saveExamplesList,
    getExampleData,
    saveExampleData,
    deleteExampleData,
    getUserProgress,
    saveUserProgress,
    generateId,
    generateExampleId,
    generateBlockId,
    formatDate,
    formatDateTime,
    debounce,
    throttle,
    showMessage,
    confirmDialog,
    createElement,
    loadExampleFromFile,
    initializeExampleFromFile,
    exportJSONToFile,
    importJSONFromFile,
    STORAGE_KEYS
};

console.log('✓ 通用工具加载完成');
