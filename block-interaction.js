/**
 * 区块联动系统
 * 负责管理区块间的交互、联动、动画效果
 * 支持代码行级别的双向联动
 */

(function() {
    'use strict';
    
    /**
     * 区块联动管理器
     */
    class BlockInteractionManager {
        constructor() {
            // 所有区块的映射 {blockId: element}
            this.blocks = new Map();
            
            // 联动关系映射 {blockId: [associatedLineIds]}
            this.associations = new Map();
            
            // 代码行映射 {lineId: element}
            this.codeLines = new Map();
            
            // 代码行关联映射 {lineId: {displayBlockId, descriptionId}}
            this.lineAssociations = new Map();
            
            // 当前高亮的区块
            this.highlightedBlocks = new Set();
            
            // 当前高亮的代码行
            this.highlightedLines = new Set();
            
            // 当前选中的代码行（点击选中）
            this.selectedLineId = null;
            
            // 描述块映射 {descId: element}
            this.descriptions = new Map();
            
            // 拖拽状态
            this.dragState = {
                isDragging: false,
                draggedBlock: null,
                startX: 0,
                startY: 0,
                offsetX: 0,
                offsetY: 0
            };
            
            // 动画配置
            this.animationConfig = {
                duration: 300,
                easing: 'ease-in-out'
            };
            
            // 描述内容映射 {descId: content}
            this.descriptionContents = new Map();
            
            // 描述块显示区域元素
            this.descriptionAreaEl = null;
            
            // 初始化
            this.init();
        }
        
        /**
         * 初始化
         */
        init() {
            console.log('✓ 区块联动管理器初始化');
        }
        
        /**
         * 设置描述块显示区域
         * @param {HTMLElement} element - 描述区域元素
         */
        setDescriptionArea(element) {
            this.descriptionAreaEl = element;
        }
        
        /**
         * 注册描述内容
         * @param {string} descId - 描述ID
         * @param {string} content - 描述内容
         */
        registerDescriptionContent(descId, content) {
            this.descriptionContents.set(descId, content);
        }
        
        /**
         * 注册区块
         * @param {HTMLElement} element - 区块元素
         */
        registerBlock(element) {
            const blockId = element.getAttribute('data-block-id');
            if (!blockId) {
                // 可能是代码块容器，跳过
                return;
            }
            
            this.blocks.set(blockId, element);
            
            // 解析关联关系（现在关联的是代码行ID）
            const associationsAttr = element.getAttribute('data-associations');
            if (associationsAttr) {
                const associatedIds = associationsAttr.split(',').map(id => id.trim());
                this.associations.set(blockId, associatedIds);
            }
            
            // 绑定基础交互事件
            this.bindBlockEvents(element, blockId);
        }
        
        /**
         * 注册代码行
         * @param {HTMLElement} lineElement - 代码行元素
         */
        registerCodeLine(lineElement) {
            const lineId = lineElement.getAttribute('data-line-id');
            if (!lineId) return;
            
            this.codeLines.set(lineId, lineElement);
            
            // 解析关联关系
            const displayBlockId = lineElement.getAttribute('data-display-block');
            const descriptionId = lineElement.getAttribute('data-description-id');
            
            if (displayBlockId || descriptionId) {
                this.lineAssociations.set(lineId, {
                    displayBlockId: displayBlockId || null,
                    descriptionId: descriptionId || null
                });
            }
            
            // 绑定代码行事件
            this.bindCodeLineEvents(lineElement, lineId);
        }
        
        /**
         * 批量注册区块
         * @param {NodeList|Array} elements - 区块元素数组
         */
        registerBlocks(elements) {
            elements.forEach(element => this.registerBlock(element));
        }
        
        /**
         * 批量注册代码行
         * @param {NodeList|Array} elements - 代码行元素数组
         */
        registerCodeLines(elements) {
            elements.forEach(element => this.registerCodeLine(element));
        }
        
        /**
         * 绑定区块事件（效果展示区区块）
         * @param {HTMLElement} element - 区块元素
         * @param {string} blockId - 区块ID
         */
        bindBlockEvents(element, blockId) {
            // 鼠标进入 - 高亮关联的代码行
            element.addEventListener('mouseenter', () => {
                this.handleBlockHover(blockId, true);
            });
            
            // 鼠标离开 - 取消悬停高亮
            element.addEventListener('mouseleave', () => {
                this.handleBlockHover(blockId, false);
            });
            
            // 点击 - 切换固定高亮
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleBlockClick(blockId);
            });
        }
        
        /**
         * 绑定代码行事件
         * @param {HTMLElement} lineElement - 代码行元素
         * @param {string} lineId - 代码行ID
         */
        bindCodeLineEvents(lineElement, lineId) {
            // 鼠标进入 - 悬停高亮
            lineElement.addEventListener('mouseenter', () => {
                this.handleCodeLineHover(lineId, true);
            });
            
            // 鼠标离开 - 取消悬停高亮
            lineElement.addEventListener('mouseleave', () => {
                this.handleCodeLineHover(lineId, false);
            });
            
            // 点击 - 选中代码行
            lineElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCodeLineClick(lineId);
            });
        }
        
        /**
         * 处理区块悬停（效果展示区区块悬停时高亮对应代码行）
         * @param {string} blockId - 区块ID
         * @param {boolean} isHover - 是否悬停
         */
        handleBlockHover(blockId, isHover) {
            // 如果已经有选中的代码行，不处理悬停
            if (this.selectedLineId) return;
            
            const associatedLineIds = this.associations.get(blockId) || [];
            
            associatedLineIds.forEach(lineId => {
                const lineElement = this.codeLines.get(lineId);
                if (lineElement) {
                    if (isHover) {
                        lineElement.classList.add('line-hover');
                    } else {
                        lineElement.classList.remove('line-hover');
                    }
                }
            });
            
            // 同时高亮区块本身
            const blockElement = this.blocks.get(blockId);
            if (blockElement) {
                if (isHover) {
                    blockElement.classList.add('highlight-hover');
                } else {
                    blockElement.classList.remove('highlight-hover');
                }
            }
        }
        
        /**
         * 处理区块点击（效果展示区区块点击时选中对应代码行）
         * @param {string} blockId - 区块ID
         */
        handleBlockClick(blockId) {
            // 清除之前的选中状态
            this.clearAllSelections();
            
            const associatedLineIds = this.associations.get(blockId) || [];
            
            // 高亮关联的代码行
            associatedLineIds.forEach(lineId => {
                const lineElement = this.codeLines.get(lineId);
                if (lineElement) {
                    lineElement.classList.add('line-selected');
                    this.highlightedLines.add(lineId);
                }
            });
            
            // 高亮区块本身
            const blockElement = this.blocks.get(blockId);
            if (blockElement) {
                blockElement.classList.add('highlight-permanent');
                this.highlightedBlocks.add(blockId);
            }
            
            // 显示第一个关联代码行的描述
            if (associatedLineIds.length > 0) {
                const firstLineId = associatedLineIds[0];
                this.selectedLineId = firstLineId;
                this.showDescriptionForLine(firstLineId);
            }
        }
        
        /**
         * 处理代码行悬停
         * @param {string} lineId - 代码行ID
         * @param {boolean} isHover - 是否悬停
         */
        handleCodeLineHover(lineId, isHover) {
            const lineElement = this.codeLines.get(lineId);
            if (!lineElement) return;
            
            // 如果已经选中，用不同样式
            if (this.selectedLineId) {
                if (lineId !== this.selectedLineId) {
                    if (isHover) {
                        lineElement.classList.add('line-hover-on-selected');
                    } else {
                        lineElement.classList.remove('line-hover-on-selected');
                    }
                }
            } else {
                if (isHover) {
                    lineElement.classList.add('line-hover');
                    // 高亮关联的效果展示区块
                    this.highlightAssociatedBlock(lineId, true);
                } else {
                    lineElement.classList.remove('line-hover');
                    this.highlightAssociatedBlock(lineId, false);
                }
            }
        }
        
        /**
         * 处理代码行点击
         * @param {string} lineId - 代码行ID
         */
        handleCodeLineClick(lineId) {
            const lineElement = this.codeLines.get(lineId);
            if (!lineElement) return;
            
            // 如果点击的是已选中的行，取消选中
            if (this.selectedLineId === lineId) {
                this.clearAllSelections();
                return;
            }
            
            // 清除之前的选中状态
            this.clearAllSelections();
            
            // 选中当前行
            this.selectedLineId = lineId;
            lineElement.classList.add('line-selected');
            this.highlightedLines.add(lineId);
            
            // 高亮关联的效果展示区块
            const association = this.lineAssociations.get(lineId);
            if (association && association.displayBlockId) {
                const blockElement = this.blocks.get(association.displayBlockId);
                if (blockElement) {
                    blockElement.classList.add('highlight-permanent');
                    this.highlightedBlocks.add(association.displayBlockId);
                }
            }
            
            // 显示对应的描述
            this.showDescriptionForLine(lineId);
        }
        
        /**
         * 高亮关联的效果展示区块
         * @param {string} lineId - 代码行ID
         * @param {boolean} highlight - 是否高亮
         */
        highlightAssociatedBlock(lineId, highlight) {
            const association = this.lineAssociations.get(lineId);
            if (!association || !association.displayBlockId) return;
            
            const blockElement = this.blocks.get(association.displayBlockId);
            if (blockElement) {
                if (highlight) {
                    blockElement.classList.add('highlight-hover');
                } else {
                    if (!this.highlightedBlocks.has(association.displayBlockId)) {
                        blockElement.classList.remove('highlight-hover');
                    }
                }
            }
        }
        
        /**
         * 显示代码行对应的描述
         * @param {string} lineId - 代码行ID
         */
        showDescriptionForLine(lineId) {
            const association = this.lineAssociations.get(lineId);
            if (!association || !association.descriptionId) {
                // 没有关联的描述，显示默认描述
                this.showDefaultDescription();
                return;
            }
            
            const content = this.descriptionContents.get(association.descriptionId);
            if (content && this.descriptionAreaEl) {
                this.descriptionAreaEl.innerHTML = content;
                this.descriptionAreaEl.classList.add('description-active');
            }
        }
        
        /**
         * 显示默认描述
         */
        showDefaultDescription() {
            if (this.descriptionAreaEl) {
                this.descriptionAreaEl.innerHTML = '<p class="desc-placeholder">点击代码行或效果展示区块查看详细说明</p>';
                this.descriptionAreaEl.classList.remove('description-active');
            }
        }
        
        /**
         * 清除所有选中状态
         */
        clearAllSelections() {
            // 清除代码行选中
            this.highlightedLines.forEach(lineId => {
                const lineElement = this.codeLines.get(lineId);
                if (lineElement) {
                    lineElement.classList.remove('line-selected');
                    lineElement.classList.remove('line-hover');
                    lineElement.classList.remove('line-hover-on-selected');
                }
            });
            this.highlightedLines.clear();
            this.selectedLineId = null;
            
            // 清除区块高亮
            this.highlightedBlocks.forEach(blockId => {
                const blockElement = this.blocks.get(blockId);
                if (blockElement) {
                    blockElement.classList.remove('highlight-permanent');
                    blockElement.classList.remove('highlight-hover');
                }
            });
            this.highlightedBlocks.clear();
        }
        
        /**
         * 高亮关联区块（旧方法，保留兼容）
         * @param {string} blockId - 区块ID
         * @param {boolean} highlight - 是否高亮
         */
        highlightAssociatedBlocks(blockId, highlight) {
            // 现在关联的是代码行，调用新方法
            this.handleBlockHover(blockId, highlight);
        }
        
        /**
         * 切换固定高亮（旧方法，保留兼容）
         * @param {string} blockId - 区块ID
         */
        togglePermanentHighlight(blockId) {
            // 调用新方法
            this.handleBlockClick(blockId);
        }
        
        /**
         * 添加高亮效果
         * @param {HTMLElement} element - 区块元素
         * @param {string} type - 高亮类型 (hover/permanent)
         */
        addHighlight(element, type = 'hover') {
            if (type === 'permanent') {
                element.classList.add('highlight-permanent');
            } else {
                element.classList.add('highlight-hover');
            }
            
            // 添加动画
            element.style.transition = `all ${this.animationConfig.duration}ms ${this.animationConfig.easing}`;
        }
        
        /**
         * 移除高亮效果
         * @param {HTMLElement} element - 区块元素
         * @param {string} type - 高亮类型 (hover/permanent)
         */
        removeHighlight(element, type = 'hover') {
            if (type === 'permanent') {
                element.classList.remove('highlight-permanent');
            } else {
                element.classList.remove('highlight-hover');
            }
        }
        
        /**
         * 清除所有高亮（旧方法，保留兼容）
         */
        clearAllHighlights() {
            this.clearAllSelections();
        }
        
        /**
         * 显示区块（带动画）
         * @param {string|Array} blockIds - 区块ID或ID数组
         * @param {string} animation - 动画类型 (fade/slide/scale)
         */
        showBlocks(blockIds, animation = 'fade') {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                // 设置初始状态
                element.style.display = 'block';
                element.style.transition = `all ${this.animationConfig.duration}ms ${this.animationConfig.easing}`;
                
                switch (animation) {
                    case 'fade':
                        element.style.opacity = '0';
                        setTimeout(() => {
                            element.style.opacity = '1';
                        }, 10);
                        break;
                    case 'slide':
                        element.style.transform = 'translateY(-20px)';
                        element.style.opacity = '0';
                        setTimeout(() => {
                            element.style.transform = 'translateY(0)';
                            element.style.opacity = '1';
                        }, 10);
                        break;
                    case 'scale':
                        element.style.transform = 'scale(0.8)';
                        element.style.opacity = '0';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                            element.style.opacity = '1';
                        }, 10);
                        break;
                }
            });
        }
        
        /**
         * 隐藏区块（带动画）
         * @param {string|Array} blockIds - 区块ID或ID数组
         * @param {string} animation - 动画类型 (fade/slide/scale)
         */
        hideBlocks(blockIds, animation = 'fade') {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                element.style.transition = `all ${this.animationConfig.duration}ms ${this.animationConfig.easing}`;
                
                switch (animation) {
                    case 'fade':
                        element.style.opacity = '0';
                        break;
                    case 'slide':
                        element.style.transform = 'translateY(-20px)';
                        element.style.opacity = '0';
                        break;
                    case 'scale':
                        element.style.transform = 'scale(0.8)';
                        element.style.opacity = '0';
                        break;
                }
                
                // 动画结束后隐藏
                setTimeout(() => {
                    element.style.display = 'none';
                }, this.animationConfig.duration);
            });
        }
        
        /**
         * 切换区块显示状态
         * @param {string|Array} blockIds - 区块ID或ID数组
         * @param {string} animation - 动画类型
         */
        toggleBlocks(blockIds, animation = 'fade') {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                const isVisible = element.style.display !== 'none' && 
                                 window.getComputedStyle(element).display !== 'none';
                
                if (isVisible) {
                    this.hideBlocks(id, animation);
                } else {
                    this.showBlocks(id, animation);
                }
            });
        }
        
        /**
         * 启用区块拖拽
         * @param {string|Array} blockIds - 区块ID或ID数组
         */
        enableDrag(blockIds) {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                element.setAttribute('draggable', 'true');
                element.style.cursor = 'move';
                
                // 绑定拖拽事件
                element.addEventListener('dragstart', this.handleDragStart.bind(this));
                element.addEventListener('dragend', this.handleDragEnd.bind(this));
            });
        }
        
        /**
         * 禁用区块拖拽
         * @param {string|Array} blockIds - 区块ID或ID数组
         */
        disableDrag(blockIds) {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                element.setAttribute('draggable', 'false');
                element.style.cursor = 'default';
            });
        }
        
        /**
         * 处理拖拽开始
         * @param {DragEvent} e - 拖拽事件
         */
        handleDragStart(e) {
            const element = e.target;
            const blockId = element.getAttribute('data-block-id');
            
            this.dragState.isDragging = true;
            this.dragState.draggedBlock = blockId;
            
            // 设置拖拽样式
            element.style.opacity = '0.5';
            
            // 设置拖拽数据
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', element.innerHTML);
            e.dataTransfer.setData('blockId', blockId);
        }
        
        /**
         * 处理拖拽结束
         * @param {DragEvent} e - 拖拽事件
         */
        handleDragEnd(e) {
            const element = e.target;
            
            // 恢复样式
            element.style.opacity = '1';
            
            this.dragState.isDragging = false;
            this.dragState.draggedBlock = null;
        }
        
        /**
         * 动画：闪烁效果
         * @param {string|Array} blockIds - 区块ID或ID数组
         * @param {number} times - 闪烁次数
         */
        blink(blockIds, times = 3) {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                let count = 0;
                const interval = setInterval(() => {
                    element.style.opacity = element.style.opacity === '0.3' ? '1' : '0.3';
                    count++;
                    
                    if (count >= times * 2) {
                        clearInterval(interval);
                        element.style.opacity = '1';
                    }
                }, 200);
            });
        }
        
        /**
         * 动画：抖动效果
         * @param {string|Array} blockIds - 区块ID或ID数组
         */
        shake(blockIds) {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                element.style.animation = 'shake 0.5s';
                
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            });
        }
        
        /**
         * 动画：脉冲效果
         * @param {string|Array} blockIds - 区块ID或ID数组
         */
        pulse(blockIds) {
            const ids = Array.isArray(blockIds) ? blockIds : [blockIds];
            
            ids.forEach(id => {
                const element = this.blocks.get(id);
                if (!element) return;
                
                element.style.animation = 'pulse 1s';
                
                setTimeout(() => {
                    element.style.animation = '';
                }, 1000);
            });
        }
        
        /**
         * 滚动到指定区块
         * @param {string} blockId - 区块ID
         * @param {boolean} smooth - 是否平滑滚动
         */
        scrollToBlock(blockId, smooth = true) {
            const element = this.blocks.get(blockId);
            if (!element) return;
            
            element.scrollIntoView({
                behavior: smooth ? 'smooth' : 'auto',
                block: 'center'
            });
        }
        
        /**
         * 聚焦到指定区块（高亮+滚动）
         * @param {string} blockId - 区块ID
         */
        focusBlock(blockId) {
            // 清除其他高亮
            this.clearAllHighlights();
            
            // 高亮目标区块
            this.togglePermanentHighlight(blockId);
            
            // 滚动到区块
            this.scrollToBlock(blockId);
            
            // 添加脉冲动画
            this.pulse(blockId);
        }
        
        /**
         * 重置所有状态
         */
        reset() {
            this.clearAllSelections();
            this.blocks.clear();
            this.associations.clear();
            this.codeLines.clear();
            this.lineAssociations.clear();
            this.descriptions.clear();
            this.descriptionContents.clear();
            this.dragState = {
                isDragging: false,
                draggedBlock: null,
                startX: 0,
                startY: 0,
                offsetX: 0,
                offsetY: 0
            };
        }
        
        /**
         * 获取区块信息
         * @param {string} blockId - 区块ID
         * @returns {Object} 区块信息
         */
        getBlockInfo(blockId) {
            const element = this.blocks.get(blockId);
            if (!element) return null;
            
            return {
                id: blockId,
                type: element.getAttribute('data-block-type'),
                associations: this.associations.get(blockId) || [],
                isHighlighted: this.highlightedBlocks.has(blockId),
                isVisible: element.style.display !== 'none'
            };
        }
    }
    
    // 导出到全局
    window.BlockInteractionManager = BlockInteractionManager;
    
    console.log('✓ 区块联动系统加载完成');
    
})();
