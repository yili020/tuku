/**
 * 学习页面逻辑
 * 处理学习内容显示和进度管理
 */

(function() {
    'use strict';
    
    // 页面元素
    let exampleTitleEl;
    let exampleDescEl;
    let bigProgressBarEl;
    let currentStepInfoEl;
    let prevConceptBtn;
    let nextConceptBtn;
    let displayAreaEl;
    let codeAreaEl;
    
    // 当前数据
    let currentExampleId = null;
    let currentExampleData = null;
    let currentBigIndex = 0;
    let currentSmallIndex = 0;
    let blockRenderer = null; // 区块渲染器
    let interactionManager = null; // 区块联动管理器
    
    /**
     * 初始化页面
     */
    function init() {
        // 获取DOM元素
        exampleTitleEl = document.getElementById('exampleTitle');
        exampleDescEl = document.getElementById('exampleDesc');
        bigProgressBarEl = document.getElementById('bigProgressBar');
        currentStepInfoEl = document.getElementById('currentStepInfo');
        prevConceptBtn = document.getElementById('prevConcept');
        nextConceptBtn = document.getElementById('nextConcept');
        displayAreaEl = document.getElementById('displayArea');
        codeAreaEl = document.getElementById('codeArea');
        
        // 绑定事件
        prevConceptBtn.addEventListener('click', handlePreviousConcept);
        nextConceptBtn.addEventListener('click', handleNextConcept);
        
        // 初始化区块渲染器
        blockRenderer = new BlockRenderer();
        
        // 初始化区块联动管理器
        if (typeof BlockInteractionManager !== 'undefined') {
            interactionManager = new BlockInteractionManager();
        } else {
            console.warn('BlockInteractionManager 未加载');
        }
        
        // 从URL获取示例ID
        currentExampleId = CommonUtils.getUrlParameter('exampleId');
        
        if (!currentExampleId) {
            showError('未指定示例ID，将返回首页...');
            setTimeout(() => CommonUtils.navigateToHome(), 2000);
            return;
        }
        
        // 加载示例数据
        loadExample();
        
        console.log('✓ 学习页面初始化完成');
    }
    
    /**
     * 加载示例数据
     */
    function loadExample() {
        // 从localStorage获取示例数据
        currentExampleData = CommonUtils.getExampleData(currentExampleId);
        
        if (!currentExampleData) {
            showError('示例数据不存在，将返回首页...');
            setTimeout(() => CommonUtils.navigateToHome(), 2000);
            return;
        }
        
        // 加载用户进度
        loadUserProgress();
        
        // 显示示例信息
        displayExampleInfo();
        
        // 显示大进度条
        displayBigProgressBar();
        
        // 显示当前步骤内容
        displayCurrentStep();
    }
    
    /**
     * 加载用户进度
     */
    function loadUserProgress() {
        const progress = CommonUtils.getUserProgress(currentExampleId);
        
        if (progress) {
            currentBigIndex = progress.currentBigIndex || 0;
            currentSmallIndex = progress.currentSmallIndex || 0;
        } else {
            currentBigIndex = 0;
            currentSmallIndex = 0;
        }
    }
    
    /**
     * 保存用户进度
     */
    function saveProgress() {
        const progress = {
            currentBigIndex,
            currentSmallIndex,
            lastAccessTime: new Date().toISOString()
        };
        CommonUtils.saveUserProgress(currentExampleId, progress);
    }
    
    /**
     * 显示示例信息
     */
    function displayExampleInfo() {
        const metadata = currentExampleData.metadata || {};
        exampleTitleEl.textContent = metadata.title || '未命名示例';
        exampleDescEl.textContent = metadata.description || '';
    }
    
    /**
     * 显示大进度条
     */
    function displayBigProgressBar() {
        bigProgressBarEl.innerHTML = '';
        
        const bigSteps = currentExampleData.bigSteps || [];
        
        bigSteps.forEach((bigStep, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'big-step';
            stepEl.setAttribute('data-big-index', index);
            
            if (index === currentBigIndex) {
                stepEl.classList.add('active');
            }
            
            const numberEl = document.createElement('span');
            numberEl.className = 'step-number';
            numberEl.textContent = index + 1;
            
            const titleEl = document.createElement('span');
            titleEl.className = 'step-title';
            titleEl.textContent = bigStep.title || `步骤 ${index + 1}`;
            
            stepEl.appendChild(numberEl);
            stepEl.appendChild(titleEl);
            
            // 点击切换大步骤
            stepEl.addEventListener('click', () => {
                handleBigStepClick(index);
            });
            
            bigProgressBarEl.appendChild(stepEl);
        });
    }
    
    /**
     * 显示当前步骤内容
     */
    function displayCurrentStep() {
        const bigSteps = currentExampleData.bigSteps || [];
        
        if (bigSteps.length === 0) {
            showError('示例数据无效：没有学习步骤');
            return;
        }
        
        const currentBigStep = bigSteps[currentBigIndex];
        if (!currentBigStep) {
            showError('当前大步骤不存在');
            return;
        }
        
        const smallSteps = currentBigStep.smallSteps || [];
        if (smallSteps.length === 0) {
            showError('当前大步骤没有小步骤');
            return;
        }
        
        const currentSmallStep = smallSteps[currentSmallIndex];
        if (!currentSmallStep) {
            showError('当前小步骤不存在');
            return;
        }
        
        // 更新小进度信息
        updateSmallProgressInfo(smallSteps.length, currentSmallStep.title);
        
        // 显示区块内容
        displayBlocks(currentSmallStep.blocks);
        
        // 更新按钮状态
        updateNavigationButtons();
        
        // 保存进度
        saveProgress();
    }
    
    /**
     * 更新小进度信息
     * @param {number} totalSteps - 总步骤数
     * @param {string} stepTitle - 步骤标题
     */
    function updateSmallProgressInfo(totalSteps, stepTitle) {
        if (currentStepInfoEl) {
            currentStepInfoEl.textContent = `步骤 ${currentSmallIndex + 1}/${totalSteps}`;
        }
    }
    
    /**
     * 显示区块内容
     * @param {Object} blocks - 区块数据
     */
    function displayBlocks(blocks) {
        if (!blocks) {
            displayAreaEl.innerHTML = '<div class="loading-placeholder"><p>暂无内容</p></div>';
            codeAreaEl.innerHTML = '<div class="loading-placeholder"><p>暂无内容</p></div>';
            return;
        }
        
        // 重置联动管理器
        if (interactionManager) {
            interactionManager.reset();
        }
        
        // 重置渲染器
        if (blockRenderer) {
            blockRenderer.reset();
        }
        
        // 显示左侧区块
        displayLeftBlocks(blocks.leftArea || []);
        
        // 显示右侧区块（代码块和描述区）
        displayRightBlocks(blocks.rightArea || []);
        
        // 注册所有区块到联动管理器
        if (interactionManager) {
            // 注册效果展示区区块
            const displayBlocks = document.querySelectorAll('#displayArea [data-block-id]');
            interactionManager.registerBlocks(displayBlocks);
            
            // 注册代码行
            const codeLines = document.querySelectorAll('.code-line[data-line-id]');
            interactionManager.registerCodeLines(codeLines);
        }
    }
    
    /**
     * 显示左侧区块
     * @param {Array} blocks - 区块数组
     */
    function displayLeftBlocks(blocks) {
        displayAreaEl.innerHTML = '';
        
        if (blocks.length === 0) {
            displayAreaEl.innerHTML = '<div class="loading-placeholder"><p>暂无效果展示</p></div>';
            return;
        }
        
        blocks.forEach(block => {
            const blockEl = blockRenderer.render(block, 'left');
            displayAreaEl.appendChild(blockEl);
        });
    }
    
    /**
     * 显示右侧区块
     * @param {Array} blocks - 区块数组
     */
    function displayRightBlocks(blocks) {
        codeAreaEl.innerHTML = '';
        
        if (blocks.length === 0) {
            codeAreaEl.innerHTML = '<div class="loading-placeholder"><p>暂无代码解释</p></div>';
            return;
        }
        
        // 分类处理区块：代码块、描述块和其他区块
        const codeBlocks = [];
        const descriptions = [];
        const otherBlocks = [];
        
        blocks.forEach(block => {
            if (block.type === 'code-block') {
                codeBlocks.push(block);
            } else if (block.type === 'description') {
                descriptions.push(block);
            } else {
                otherBlocks.push(block);
            }
        });
        
        // 渲染代码块
        codeBlocks.forEach(block => {
            const blockEl = blockRenderer.render(block, 'right');
            codeAreaEl.appendChild(blockEl);
        });
        
        // 创建描述区域
        const descriptionArea = document.createElement('div');
        descriptionArea.className = 'description-area';
        descriptionArea.id = 'descriptionArea';
        descriptionArea.innerHTML = '<p class="desc-placeholder">点击代码行或效果展示区块查看详细说明</p>';
        codeAreaEl.appendChild(descriptionArea);
        
        // 设置描述区域到联动管理器
        if (interactionManager) {
            interactionManager.setDescriptionArea(descriptionArea);
            
            // 注册所有描述内容
            descriptions.forEach(desc => {
                interactionManager.registerDescriptionContent(desc.id, desc.content);
            });
        }
        
        // 渲染其他类型区块（如果有）
        otherBlocks.forEach(block => {
            const blockEl = blockRenderer.render(block, 'right');
            codeAreaEl.appendChild(blockEl);
        });
    }
    
    /**
     * 更新导航按钮状态
     */
    function updateNavigationButtons() {
        const bigSteps = currentExampleData.bigSteps || [];
        const currentBigStep = bigSteps[currentBigIndex];
        const smallSteps = currentBigStep ? currentBigStep.smallSteps || [] : [];
        
        // 上一个概念按钮
        prevConceptBtn.disabled = (currentBigIndex === 0 && currentSmallIndex === 0);
        
        // 下一个概念按钮
        const isLastBigStep = currentBigIndex === bigSteps.length - 1;
        const isLastSmallStep = currentSmallIndex === smallSteps.length - 1;
        nextConceptBtn.disabled = (isLastBigStep && isLastSmallStep);
    }
    
    /**
     * 处理大步骤点击
     * @param {number} bigIndex - 大步骤索引
     */
    function handleBigStepClick(bigIndex) {
        currentBigIndex = bigIndex;
        currentSmallIndex = 0;
        
        displayBigProgressBar();
        displayCurrentStep();
    }
    
    /**
     * 处理上一个概念
     */
    function handlePreviousConcept() {
        if (currentSmallIndex > 0) {
            currentSmallIndex--;
        } else if (currentBigIndex > 0) {
            currentBigIndex--;
            const bigSteps = currentExampleData.bigSteps || [];
            const previousBigStep = bigSteps[currentBigIndex];
            const smallSteps = previousBigStep ? previousBigStep.smallSteps || [] : [];
            currentSmallIndex = smallSteps.length - 1;
            displayBigProgressBar();
        }
        
        displayCurrentStep();
    }
    
    /**
     * 处理下一个概念
     */
    function handleNextConcept() {
        const bigSteps = currentExampleData.bigSteps || [];
        const currentBigStep = bigSteps[currentBigIndex];
        const smallSteps = currentBigStep ? currentBigStep.smallSteps || [] : [];
        
        if (currentSmallIndex < smallSteps.length - 1) {
            currentSmallIndex++;
        } else if (currentBigIndex < bigSteps.length - 1) {
            currentBigIndex++;
            currentSmallIndex = 0;
            displayBigProgressBar();
        }
        
        displayCurrentStep();
    }
    
    /**
     * 处理区块点击（后续实现区块联动）
     * @param {string} blockId - 区块ID
     */
    function handleBlockClick(blockId) {
        console.log('区块点击:', blockId);
        
        if (interactionManager) {
            // 使用联动管理器处理点击
            interactionManager.focusBlock(blockId);
        }
    }
    
    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    function showError(message) {
        displayAreaEl.innerHTML = `<div class="loading-placeholder"><p style="color: var(--danger-color);">${message}</p></div>`;
        codeAreaEl.innerHTML = '';
        CommonUtils.showMessage(message, 'error');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
