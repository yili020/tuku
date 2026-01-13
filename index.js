/**
 * 首页逻辑
 * 显示已发布的学习示例
 */

(function() {
    'use strict';
    
    // 页面元素
    let examplesListEl;
    let noExamplesEl;
    
    /**
     * 初始化页面
     */
    function init() {
        // 获取DOM元素
        examplesListEl = document.getElementById('examplesList');
        noExamplesEl = document.getElementById('noExamples');
        
        // 初始化示例数据（首次访问时加载）
        initializeSampleData().then(() => {
            // 加载并显示示例
            loadExamples();
        });
        
        console.log('✓ 首页初始化完成');
    }
    
    /**
     * 初始化示例数据
     */
    async function initializeSampleData() {
        try {
            // 加载HTML基础示例
            console.log('开始加载示例数据...');
            await CommonUtils.initializeExampleFromFile('data/examples/html-basic.json');
            console.log('示例数据加载完成');
        } catch (error) {
            console.error('初始化示例数据失败:', error);
            CommonUtils.showMessage('加载示例数据失败，请确保通过HTTP服务器运行项目', 'error', 5000);
        }
    }
    
    /**
     * 加载并显示示例
     */
    function loadExamples() {
        // 获取已发布的示例
        const examples = CommonUtils.getPublishedExamples();
        
        if (examples.length === 0) {
            // 没有示例，显示提示
            showNoExamples();
        } else {
            // 显示示例列表
            displayExamples(examples);
        }
    }
    
    /**
     * 显示示例列表
     * @param {Array} examples - 示例数组
     */
    function displayExamples(examples) {
        // 清空容器
        examplesListEl.innerHTML = '';
        
        // 隐藏"暂无示例"提示
        noExamplesEl.style.display = 'none';
        
        // 创建示例卡片
        examples.forEach(example => {
            const card = createExampleCard(example);
            examplesListEl.appendChild(card);
        });
    }
    
    /**
     * 创建示例卡片
     * @param {Object} example - 示例元数据
     * @returns {HTMLElement} 卡片元素
     */
    function createExampleCard(example) {
        // 创建卡片容器
        const card = document.createElement('div');
        card.className = 'example-card';
        card.setAttribute('data-example-id', example.exampleId);
        
        // 示例图片
        const imageDiv = document.createElement('div');
        imageDiv.className = 'example-image';
        
        if (example.thumbnailPath) {
            const img = document.createElement('img');
            img.src = example.thumbnailPath;
            img.alt = example.title;
            img.onerror = function() {
                this.src = 'images/ui/default-thumbnail.png';
            };
            imageDiv.appendChild(img);
        } else {
            imageDiv.innerHTML = '<p style="color: var(--text-light);">暂无预览图</p>';
        }
        
        // 示例内容
        const contentDiv = document.createElement('div');
        contentDiv.className = 'example-content';
        
        const title = document.createElement('h4');
        title.className = 'example-title';
        title.textContent = example.title || '未命名示例';
        
        const desc = document.createElement('p');
        desc.className = 'example-desc';
        desc.textContent = example.description || '暂无描述';
        
        const meta = document.createElement('div');
        meta.className = 'example-meta';
        
        const difficulty = document.createElement('span');
        difficulty.className = 'difficulty';
        difficulty.textContent = getDifficultyText(example.difficulty);
        
        const time = document.createElement('span');
        time.className = 'time';
        time.textContent = `${example.estimatedTime || 30}分钟`;
        
        meta.appendChild(difficulty);
        meta.appendChild(time);
        
        contentDiv.appendChild(title);
        contentDiv.appendChild(desc);
        contentDiv.appendChild(meta);
        
        // 学习按钮
        const button = document.createElement('button');
        button.className = 'learn-btn';
        button.textContent = '开始学习';
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            handleStartLearning(example.exampleId);
        });
        
        // 组装卡片
        card.appendChild(imageDiv);
        card.appendChild(contentDiv);
        card.appendChild(button);
        
        // 点击卡片也可以开始学习
        card.addEventListener('click', () => {
            handleStartLearning(example.exampleId);
        });
        
        return card;
    }
    
    /**
     * 获取难度文本
     * @param {string} difficulty - 难度等级
     * @returns {string} 难度文本
     */
    function getDifficultyText(difficulty) {
        const difficultyMap = {
            'beginner': '初级',
            'intermediate': '中级',
            'advanced': '高级'
        };
        return difficultyMap[difficulty] || '初级';
    }
    
    /**
     * 显示"暂无示例"提示
     */
    function showNoExamples() {
        examplesListEl.innerHTML = '';
        noExamplesEl.style.display = 'block';
    }
    
    /**
     * 处理开始学习
     * @param {string} exampleId - 示例ID
     */
    function handleStartLearning(exampleId) {
        // 检查示例数据是否存在
        const exampleData = CommonUtils.getExampleData(exampleId);
        
        if (!exampleData) {
            CommonUtils.showMessage('示例数据不存在', 'error');
            return;
        }
        
        // 导航到学习页面
        CommonUtils.navigateToLearning(exampleId);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
