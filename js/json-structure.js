/**
 * JSON数据结构管理器
 * 定义和验证示例数据的JSON结构
 */

(function() {
    'use strict';
    
    /**
     * JSON数据结构模板
     */
    const JSON_STRUCTURE_TEMPLATE = {
        exampleId: '',
        metadata: {
            title: '',
            description: '',
            difficulty: 'beginner', // beginner, intermediate, advanced
            estimatedTime: 30,
            tags: [],
            author: '',
            version: '1.0'
        },
        bigSteps: [
            {
                bigStepId: '',
                title: '',
                description: '',
                smallSteps: [
                    {
                        smallStepId: '',
                        title: '',
                        description: '',
                        blocks: {
                            leftArea: [
                                {
                                    id: '',
                                    type: '', // html-container, image, video等
                                    content: {},
                                    position: { top: '0', left: '0' },
                                    styles: {
                                        default: '',
                                        highlight: '',
                                        hidden: ''
                                    },
                                    associations: [], // 关联的区块ID数组
                                    actions: [
                                        {
                                            event: 'click', // click, hover, doubleclick
                                            action: 'toggleHighlight', // toggleHighlight, show, hide
                                            targets: [] // 目标区块ID数组
                                        }
                                    ]
                                }
                            ],
                            rightArea: [
                                {
                                    id: '',
                                    type: '', // code-block, description, text
                                    language: '', // html, css, javascript (for code-block)
                                    content: '',
                                    lineHighlights: [], // 高亮的行号数组
                                    associations: [],
                                    actions: []
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    };
    
    /**
     * 支持的区块类型
     */
    const BLOCK_TYPES = {
        // 左侧区域类型
        LEFT_AREA: {
            'html-container': {
                name: 'HTML容器',
                description: '显示HTML效果',
                requiredFields: ['content']
            },
            'image': {
                name: '图片',
                description: '显示图片',
                requiredFields: ['src']
            },
            'video': {
                name: '视频',
                description: '显示视频',
                requiredFields: ['src']
            },
            'interactive-demo': {
                name: '互动演示',
                description: '可交互的演示区块',
                requiredFields: ['content']
            }
        },
        // 右侧区域类型
        RIGHT_AREA: {
            'code-block': {
                name: '代码块',
                description: '显示代码',
                requiredFields: ['content', 'language']
            },
            'description': {
                name: '描述文本',
                description: '显示说明文字',
                requiredFields: ['content']
            },
            'text': {
                name: '普通文本',
                description: '显示普通文本',
                requiredFields: ['content']
            },
            'list': {
                name: '列表',
                description: '显示列表内容',
                requiredFields: ['items']
            }
        }
    };
    
    /**
     * 支持的事件类型
     */
    const EVENT_TYPES = ['click', 'hover', 'doubleclick', 'mouseenter', 'mouseleave'];
    
    /**
     * 支持的动作类型
     */
    const ACTION_TYPES = [
        'toggleHighlight',  // 切换高亮
        'highlight',        // 高亮
        'unhighlight',      // 取消高亮
        'show',            // 显示
        'hide',            // 隐藏
        'toggle',          // 切换显隐
        'replace',         // 替换内容
        'addClass',        // 添加CSS类
        'removeClass',     // 移除CSS类
        'jumpToStep'       // 跳转到指定步骤
    ];
    
    /**
     * 创建空的JSON数据结构
     * @param {string} exampleId - 示例ID
     * @param {Object} metadata - 元数据
     * @returns {Object} JSON数据结构
     */
    function createEmptyStructure(exampleId, metadata = {}) {
        return {
            exampleId: exampleId || CommonUtils.generateExampleId(),
            metadata: {
                title: metadata.title || '新示例',
                description: metadata.description || '',
                difficulty: metadata.difficulty || 'beginner',
                estimatedTime: metadata.estimatedTime || 30,
                tags: metadata.tags || [],
                author: metadata.author || '',
                version: metadata.version || '1.0'
            },
            bigSteps: []
        };
    }
    
    /**
     * 创建大步骤
     * @param {string} title - 标题
     * @param {string} description - 描述
     * @returns {Object} 大步骤对象
     */
    function createBigStep(title = '新步骤', description = '') {
        return {
            bigStepId: CommonUtils.generateId('big'),
            title: title,
            description: description,
            smallSteps: []
        };
    }
    
    /**
     * 创建小步骤
     * @param {string} title - 标题
     * @param {string} description - 描述
     * @returns {Object} 小步骤对象
     */
    function createSmallStep(title = '新概念', description = '') {
        return {
            smallStepId: CommonUtils.generateId('small'),
            title: title,
            description: description,
            blocks: {
                leftArea: [],
                rightArea: []
            }
        };
    }
    
    /**
     * 创建区块
     * @param {string} type - 区块类型
     * @param {Object} config - 配置选项
     * @returns {Object} 区块对象
     */
    function createBlock(type, config = {}) {
        const baseBlock = {
            id: config.id || CommonUtils.generateBlockId(),
            type: type,
            associations: config.associations || [],
            actions: config.actions || []
        };
        
        // 根据类型添加特定字段
        if (type === 'code-block') {
            return {
                ...baseBlock,
                language: config.language || 'html',
                content: config.content || '',
                lineHighlights: config.lineHighlights || []
            };
        } else if (type === 'description' || type === 'text') {
            return {
                ...baseBlock,
                content: config.content || ''
            };
        } else if (type === 'html-container') {
            return {
                ...baseBlock,
                content: config.content || '',
                position: config.position || { top: '0', left: '0' },
                styles: config.styles || {
                    default: '',
                    highlight: '',
                    hidden: ''
                }
            };
        } else if (type === 'image') {
            return {
                ...baseBlock,
                src: config.src || '',
                alt: config.alt || '',
                width: config.width || 'auto',
                height: config.height || 'auto'
            };
        } else if (type === 'list') {
            return {
                ...baseBlock,
                items: config.items || []
            };
        }
        
        return baseBlock;
    }
    
    /**
     * 验证JSON数据结构
     * @param {Object} data - JSON数据
     * @returns {Object} { valid: boolean, errors: Array }
     */
    function validateStructure(data) {
        const errors = [];
        
        // 检查必需字段
        if (!data.exampleId) {
            errors.push('缺少 exampleId 字段');
        }
        
        if (!data.metadata) {
            errors.push('缺少 metadata 字段');
        } else {
            if (!data.metadata.title) {
                errors.push('metadata 缺少 title 字段');
            }
        }
        
        if (!data.bigSteps || !Array.isArray(data.bigSteps)) {
            errors.push('缺少 bigSteps 数组');
        } else if (data.bigSteps.length === 0) {
            errors.push('bigSteps 数组不能为空');
        } else {
            // 验证每个大步骤
            data.bigSteps.forEach((bigStep, bigIndex) => {
                if (!bigStep.bigStepId) {
                    errors.push(`bigSteps[${bigIndex}] 缺少 bigStepId`);
                }
                if (!bigStep.title) {
                    errors.push(`bigSteps[${bigIndex}] 缺少 title`);
                }
                if (!bigStep.smallSteps || !Array.isArray(bigStep.smallSteps)) {
                    errors.push(`bigSteps[${bigIndex}] 缺少 smallSteps 数组`);
                } else if (bigStep.smallSteps.length === 0) {
                    errors.push(`bigSteps[${bigIndex}] 的 smallSteps 数组不能为空`);
                } else {
                    // 验证每个小步骤
                    bigStep.smallSteps.forEach((smallStep, smallIndex) => {
                        if (!smallStep.smallStepId) {
                            errors.push(`bigSteps[${bigIndex}].smallSteps[${smallIndex}] 缺少 smallStepId`);
                        }
                        if (!smallStep.blocks) {
                            errors.push(`bigSteps[${bigIndex}].smallSteps[${smallIndex}] 缺少 blocks`);
                        }
                    });
                }
            });
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 克隆JSON数据结构（深拷贝）
     * @param {Object} data - JSON数据
     * @returns {Object} 克隆的数据
     */
    function cloneStructure(data) {
        return JSON.parse(JSON.stringify(data));
    }
    
    /**
     * 合并JSON数据结构
     * @param {Object} target - 目标数据
     * @param {Object} source - 源数据
     * @returns {Object} 合并后的数据
     */
    function mergeStructure(target, source) {
        return {
            ...target,
            ...source,
            metadata: {
                ...target.metadata,
                ...source.metadata
            },
            bigSteps: source.bigSteps || target.bigSteps
        };
    }
    
    /**
     * 导出JSON字符串
     * @param {Object} data - JSON数据
     * @param {boolean} prettify - 是否格式化
     * @returns {string} JSON字符串
     */
    function exportToString(data, prettify = true) {
        if (prettify) {
            return JSON.stringify(data, null, 2);
        }
        return JSON.stringify(data);
    }
    
    /**
     * 从JSON字符串导入
     * @param {string} jsonString - JSON字符串
     * @returns {Object} { success: boolean, data: Object, error: string }
     */
    function importFromString(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const validation = validateStructure(data);
            
            if (!validation.valid) {
                return {
                    success: false,
                    data: null,
                    error: '数据结构验证失败: ' + validation.errors.join(', ')
                };
            }
            
            return {
                success: true,
                data: data,
                error: null
            };
        } catch (e) {
            return {
                success: false,
                data: null,
                error: 'JSON解析失败: ' + e.message
            };
        }
    }
    
    // 导出到全局
    window.JSONStructure = {
        TEMPLATE: JSON_STRUCTURE_TEMPLATE,
        BLOCK_TYPES: BLOCK_TYPES,
        EVENT_TYPES: EVENT_TYPES,
        ACTION_TYPES: ACTION_TYPES,
        createEmptyStructure,
        createBigStep,
        createSmallStep,
        createBlock,
        validateStructure,
        cloneStructure,
        mergeStructure,
        exportToString,
        importFromString
    };
    
    console.log('✓ JSON数据结构模块加载完成');
    
})();
