/**
 * 区块渲染器
 * 根据区块类型渲染不同的DOM元素
 * 支持代码行级别的联动交互
 */

(function() {
    'use strict';
    
    /**
     * 区块渲染器类
     */
    class BlockRenderer {
        constructor() {
            this.renderers = {
                'code-block': this.renderCodeBlock.bind(this),
                'description': this.renderDescription.bind(this),
                'text': this.renderText.bind(this),
                'html-container': this.renderHtmlContainer.bind(this),
                'image': this.renderImage.bind(this),
                'video': this.renderVideo.bind(this),
                'list': this.renderList.bind(this),
                'interactive-demo': this.renderInteractiveDemo.bind(this)
            };
            
            // 代码行映射: lineId -> { displayBlockId, descriptionId, lineContent }
            this.codeLineMap = new Map();
            // 描述块映射: descId -> descriptionContent
            this.descriptionMap = new Map();
        }
        
        /**
         * 重置渲染器状态
         */
        reset() {
            this.codeLineMap.clear();
            this.descriptionMap.clear();
        }
        
        /**
         * 渲染区块
         * @param {Object} block - 区块数据
         * @param {string} area - 区域类型 (left/right)
         * @returns {HTMLElement} 渲染的DOM元素
         */
        render(block, area = 'left') {
            const renderer = this.renderers[block.type];
            
            if (!renderer) {
                console.warn(`未知的区块类型: ${block.type}`);
                return this.renderUnknown(block);
            }
            
            const element = renderer(block, area);
            
            // 代码块容器不添加联动ID（联动在代码行级别）
            if (block.type === 'code-block') {
                element.setAttribute('data-block-type', block.type);
                element.classList.add('block');
                element.classList.add(`block-${block.type}`);
                // 存储代码块的基础ID供代码行使用
                element.setAttribute('data-code-block-base', block.id);
            } else {
                // 其他类型区块正常添加属性
                element.setAttribute('data-block-id', block.id);
                element.setAttribute('data-block-type', block.type);
                element.classList.add('block');
                element.classList.add(`block-${block.type}`);
                
                // 添加关联信息
                if (block.associations && block.associations.length > 0) {
                    element.setAttribute('data-associations', block.associations.join(','));
                }
            }
            
            // 绑定事件（非代码块）
            if (block.type !== 'code-block') {
                this.bindEvents(element, block);
            }
            
            return element;
        }
        
        /**
         * 渲染代码块 - 按行渲染，每行有唯一ID
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderCodeBlock(block) {
            const container = document.createElement('div');
            container.className = 'code-block';
            
            // 代码语言标签
            if (block.language) {
                const langLabel = document.createElement('div');
                langLabel.className = 'code-language';
                langLabel.textContent = block.language.toUpperCase();
                container.appendChild(langLabel);
            }
            
            // 代码内容容器
            const codeContainer = document.createElement('div');
            codeContainer.className = 'code-lines-container';
            
            // 按行渲染代码
            const lines = (block.content || '').split('\n');
            const codeLines = block.codeLines || []; // 每行的配置信息
            
            lines.forEach((lineContent, index) => {
                const lineNum = index + 1;
                const lineConfig = codeLines[index] || {};
                
                // 创建代码行元素
                const lineEl = document.createElement('div');
                lineEl.className = 'code-line';
                
                // 生成代码行ID
                const lineId = lineConfig.id || `${block.id}_line_${lineNum}`;
                lineEl.setAttribute('data-line-id', lineId);
                lineEl.setAttribute('data-line-num', lineNum);
                
                // 如果有关联的效果展示区块
                if (lineConfig.displayBlockId) {
                    lineEl.setAttribute('data-display-block', lineConfig.displayBlockId);
                }
                
                // 如果有关联的描述
                if (lineConfig.descriptionId) {
                    lineEl.setAttribute('data-description-id', lineConfig.descriptionId);
                }
                
                // 存储代码行映射关系
                this.codeLineMap.set(lineId, {
                    displayBlockId: lineConfig.displayBlockId || null,
                    descriptionId: lineConfig.descriptionId || null,
                    lineContent: lineContent,
                    lineNum: lineNum
                });
                
                // 行号
                const lineNumEl = document.createElement('span');
                lineNumEl.className = 'line-number';
                lineNumEl.textContent = lineNum;
                
                // 代码内容
                const codeEl = document.createElement('code');
                codeEl.className = `language-${block.language || 'text'}`;
                codeEl.textContent = lineContent;
                
                lineEl.appendChild(lineNumEl);
                lineEl.appendChild(codeEl);
                codeContainer.appendChild(lineEl);
            });
            
            container.appendChild(codeContainer);
            
            return container;
        }
        
        /**
         * 渲染描述块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderDescription(block) {
            const container = document.createElement('div');
            container.className = 'description-block';
            container.innerHTML = block.content || '';
            return container;
        }
        
        /**
         * 渲染文本块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderText(block) {
            const container = document.createElement('div');
            container.className = 'text-block';
            container.textContent = block.content || '';
            return container;
        }
        
        /**
         * 渲染HTML容器
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderHtmlContainer(block) {
            const container = document.createElement('div');
            container.className = 'html-container';
            
            // 创建iframe或直接渲染
            if (block.useIframe) {
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                container.appendChild(iframe);
                
                // 写入内容
                setTimeout(() => {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    doc.open();
                    doc.write(block.content || '');
                    doc.close();
                }, 0);
            } else {
                // 直接渲染HTML
                container.innerHTML = block.content || '';
            }
            
            // 应用位置样式
            if (block.position) {
                if (block.position.top) container.style.top = block.position.top;
                if (block.position.left) container.style.left = block.position.left;
                if (block.position.width) container.style.width = block.position.width;
                if (block.position.height) container.style.height = block.position.height;
            }
            
            // 应用默认样式
            if (block.styles && block.styles.default) {
                container.classList.add(block.styles.default);
            }
            
            return container;
        }
        
        /**
         * 渲染图片块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderImage(block) {
            const container = document.createElement('div');
            container.className = 'image-block';
            
            const img = document.createElement('img');
            img.src = block.src || '';
            img.alt = block.alt || '';
            
            if (block.width) img.style.width = block.width;
            if (block.height) img.style.height = block.height;
            
            // 图片加载错误处理
            img.onerror = function() {
                this.src = 'images/ui/image-placeholder.png';
                this.alt = '图片加载失败';
            };
            
            container.appendChild(img);
            
            // 添加图片说明
            if (block.caption) {
                const caption = document.createElement('div');
                caption.className = 'image-caption';
                caption.textContent = block.caption;
                container.appendChild(caption);
            }
            
            return container;
        }
        
        /**
         * 渲染视频块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderVideo(block) {
            const container = document.createElement('div');
            container.className = 'video-block';
            
            const video = document.createElement('video');
            video.src = block.src || '';
            video.controls = true;
            
            if (block.width) video.style.width = block.width;
            if (block.height) video.style.height = block.height;
            if (block.autoplay) video.autoplay = true;
            if (block.loop) video.loop = true;
            
            container.appendChild(video);
            
            return container;
        }
        
        /**
         * 渲染列表块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderList(block) {
            const container = document.createElement('div');
            container.className = 'list-block';
            
            const list = document.createElement(block.ordered ? 'ol' : 'ul');
            
            (block.items || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            
            container.appendChild(list);
            
            return container;
        }
        
        /**
         * 渲染互动演示块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderInteractiveDemo(block) {
            const container = document.createElement('div');
            container.className = 'interactive-demo-block';
            container.innerHTML = block.content || '';
            
            // TODO: 添加互动功能
            
            return container;
        }
        
        /**
         * 渲染未知类型块
         * @param {Object} block - 区块数据
         * @returns {HTMLElement} DOM元素
         */
        renderUnknown(block) {
            const container = document.createElement('div');
            container.className = 'unknown-block';
            container.innerHTML = `<p style="color: var(--danger-color);">未知的区块类型: ${block.type}</p>`;
            return container;
        }
        
        /**
         * 绑定区块事件
         * @param {HTMLElement} element - DOM元素
         * @param {Object} block - 区块数据
         */
        bindEvents(element, block) {
            if (!block.actions || block.actions.length === 0) {
                return;
            }
            
            block.actions.forEach(action => {
                element.addEventListener(action.event, (e) => {
                    e.stopPropagation();
                    this.executeAction(action, element, block);
                });
            });
        }
        
        /**
         * 执行区块动作
         * @param {Object} action - 动作配置
         * @param {HTMLElement} element - 触发元素
         * @param {Object} block - 区块数据
         */
        executeAction(action, element, block) {
            const targets = action.targets || [];
            
            switch (action.action) {
                case 'toggleHighlight':
                    this.toggleHighlight(targets);
                    break;
                case 'highlight':
                    this.highlight(targets);
                    break;
                case 'unhighlight':
                    this.unhighlight(targets);
                    break;
                case 'show':
                    this.showBlocks(targets);
                    break;
                case 'hide':
                    this.hideBlocks(targets);
                    break;
                case 'toggle':
                    this.toggleBlocks(targets);
                    break;
                default:
                    console.warn(`未实现的动作类型: ${action.action}`);
            }
        }
        
        /**
         * 切换高亮
         * @param {Array} targetIds - 目标区块ID数组
         */
        toggleHighlight(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    element.classList.toggle('highlight');
                }
            });
        }
        
        /**
         * 高亮区块
         * @param {Array} targetIds - 目标区块ID数组
         */
        highlight(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    element.classList.add('highlight');
                }
            });
        }
        
        /**
         * 取消高亮
         * @param {Array} targetIds - 目标区块ID数组
         */
        unhighlight(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    element.classList.remove('highlight');
                }
            });
        }
        
        /**
         * 显示区块
         * @param {Array} targetIds - 目标区块ID数组
         */
        showBlocks(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    element.style.display = 'block';
                }
            });
        }
        
        /**
         * 隐藏区块
         * @param {Array} targetIds - 目标区块ID数组
         */
        hideBlocks(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    element.style.display = 'none';
                }
            });
        }
        
        /**
         * 切换区块显隐
         * @param {Array} targetIds - 目标区块ID数组
         */
        toggleBlocks(targetIds) {
            targetIds.forEach(id => {
                const element = document.querySelector(`[data-block-id="${id}"]`);
                if (element) {
                    const isHidden = element.style.display === 'none';
                    element.style.display = isHidden ? 'block' : 'none';
                }
            });
        }
        
        /**
         * HTML转义
         * @param {string} text - 文本
         * @returns {string} 转义后的文本
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
    
    // 导出到全局
    window.BlockRenderer = BlockRenderer;
    
    console.log('✓ 区块渲染器加载完成');
    
})();
