/**
 * 创作者中心逻辑
 * 管理示例的创建、编辑、发布、删除
 */

(function() {
    'use strict';
    
    // 页面元素
    let examplesListEl;
    let noExamplesEl;
    let createNewBtn;
    let editorContainer;
    
    /**
     * 初始化页面
     */
    function init() {
        // 获取DOM元素
        examplesListEl = document.getElementById('examplesList');
        noExamplesEl = document.getElementById('noExamples');
        createNewBtn = document.getElementById('createNewBtn');
        editorContainer = document.getElementById('editorContainer');
        
        // 绑定事件
        createNewBtn.addEventListener('click', handleCreateNew);
        
        // "创建第一个示例"按钮
        const createFirstBtn = document.querySelector('.create-first-btn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', handleCreateNew);
        }
        
        // 编辑器关闭按钮
        const closeEditorBtn = document.getElementById('closeEditorBtn');
        if (closeEditorBtn) {
            closeEditorBtn.addEventListener('click', closeEditor);
        }
        
        // 导出JSON按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExportJSON);
        }
        
        // 加载示例列表
        loadExamplesList();
        
        // 检查是否从URL传入要编辑的示例ID
        const exampleId = CommonUtils.getUrlParameter('exampleId');
        if (exampleId) {
            // 打开编辑器
            openEditor(exampleId);
        }
        
        console.log('✓ 创作者中心初始化完成');
    }
    
    /**
     * 加载示例列表
     */
    function loadExamplesList() {
        // 获取所有示例（包括未发布的）
        const examples = CommonUtils.getAllExamples();
        
        if (examples.length === 0) {
            showNoExamples();
        } else {
            displayExamplesList(examples);
        }
    }
    
    /**
     * 显示示例列表
     * @param {Array} examples - 示例数组
     */
    function displayExamplesList(examples) {
        examplesListEl.innerHTML = '';
        noExamplesEl.style.display = 'none';
        
        examples.forEach(example => {
            const itemEl = createExampleItem(example);
            examplesListEl.appendChild(itemEl);
        });
    }
    
    /**
     * 创建示例列表项
     * @param {Object} example - 示例元数据
     * @returns {HTMLElement} 列表项元素
     */
    function createExampleItem(example) {
        const item = document.createElement('div');
        item.className = 'example-item';
        item.setAttribute('data-example-id', example.exampleId);
        
        // 示例信息
        const infoDiv = document.createElement('div');
        infoDiv.className = 'example-info';
        
        const title = document.createElement('h3');
        title.className = 'example-title';
        title.textContent = example.title || '未命名示例';
        
        const desc = document.createElement('p');
        desc.className = 'example-desc';
        desc.textContent = example.description || '暂无描述';
        
        const meta = document.createElement('div');
        meta.className = 'example-meta';
        
        const createTime = document.createElement('span');
        createTime.className = 'meta-item';
        createTime.textContent = `创建时间: ${CommonUtils.formatDate(example.createdAt)}`;
        
        const status = document.createElement('span');
        status.className = `meta-item ${example.published ? 'status-published' : 'status-draft'}`;
        status.textContent = example.published ? '已发布' : '草稿';
        
        meta.appendChild(createTime);
        meta.appendChild(status);
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(desc);
        infoDiv.appendChild(meta);
        
        // 操作按钮
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'example-actions';
        
        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action edit-btn';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleEdit(example.exampleId);
        });
        
        // 预览按钮
        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn-action preview-btn';
        previewBtn.textContent = '预览';
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePreview(example.exampleId);
        });
        
        // 发布/取消发布按钮
        const publishBtn = document.createElement('button');
        publishBtn.className = 'btn-action publish-btn';
        publishBtn.textContent = example.published ? '取消发布' : '发布';
        publishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePublish(example.exampleId, !example.published);
        });
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDelete(example.exampleId);
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(previewBtn);
        actionsDiv.appendChild(publishBtn);
        actionsDiv.appendChild(deleteBtn);
        
        item.appendChild(infoDiv);
        item.appendChild(actionsDiv);
        
        return item;
    }
    
    /**
     * 显示"暂无示例"提示
     */
    function showNoExamples() {
        examplesListEl.innerHTML = '';
        noExamplesEl.style.display = 'block';
    }
    
    /**
     * 处理创建新示例
     */
    function handleCreateNew() {
        // 生成新示例ID
        const newExampleId = CommonUtils.generateExampleId();
        
        // 创建新示例元数据
        const newExample = {
            exampleId: newExampleId,
            title: '新示例',
            description: '示例描述',
            author: '创作者',
            createdAt: new Date().toISOString(),
            published: false,
            version: '1.0'
        };
        
        // 创建空的示例数据
        const newExampleData = {
            exampleId: newExampleId,
            metadata: {
                title: '新示例',
                description: '示例描述',
                difficulty: 'beginner',
                estimatedTime: 30
            },
            bigSteps: [
                {
                    bigStepId: CommonUtils.generateId('big'),
                    title: '第一步',
                    description: '开始学习',
                    smallSteps: [
                        {
                            smallStepId: CommonUtils.generateId('small'),
                            title: '第一个概念',
                            description: '学习第一个概念',
                            blocks: {
                                leftArea: [],
                                rightArea: []
                            }
                        }
                    ]
                }
            ]
        };
        
        // 保存到localStorage
        const examples = CommonUtils.getAllExamples();
        examples.push(newExample);
        CommonUtils.saveExamplesList(examples);
        CommonUtils.saveExampleData(newExampleId, newExampleData);
        
        // 提示成功
        CommonUtils.showMessage('创建成功！', 'success');
        
        // 重新加载列表
        loadExamplesList();
        
        // 打开编辑器
        openEditor(newExampleId);
    }
    
    /**
     * 处理编辑
     * @param {string} exampleId - 示例ID
     */
    function handleEdit(exampleId) {
        openEditor(exampleId);
    }
    
    /**
     * 处理预览
     * @param {string} exampleId - 示例ID
     */
    function handlePreview(exampleId) {
        // 导航到学习页面
        CommonUtils.navigateToLearning(exampleId);
    }
    
    /**
     * 处理发布/取消发布
     * @param {string} exampleId - 示例ID
     * @param {boolean} published - 是否发布
     */
    function handlePublish(exampleId, published) {
        // 获取示例列表
        const examples = CommonUtils.getAllExamples();
        const example = examples.find(ex => ex.exampleId === exampleId);
        
        if (!example) {
            CommonUtils.showMessage('示例不存在', 'error');
            return;
        }
        
        // 更新发布状态
        example.published = published;
        CommonUtils.saveExamplesList(examples);
        
        // 提示成功
        CommonUtils.showMessage(published ? '发布成功！' : '已取消发布', 'success');
        
        // 重新加载列表
        loadExamplesList();
    }
    
    /**
     * 处理删除
     * @param {string} exampleId - 示例ID
     */
    function handleDelete(exampleId) {
        if (!CommonUtils.confirmDialog('确定要删除这个示例吗？删除后无法恢复。')) {
            return;
        }
        
        // 删除示例
        CommonUtils.deleteExampleData(exampleId);
        
        // 提示成功
        CommonUtils.showMessage('删除成功', 'success');
        
        // 重新加载列表
        loadExamplesList();
    }
    
    /**
     * 打开编辑器
     * @param {string} exampleId - 示例ID
     */
    function openEditor(exampleId) {
        // TODO: 实现完整的编辑器功能（第五阶段）
        CommonUtils.showMessage('编辑器功能将在第五阶段实现', 'info');
        
        // 显示编辑器容器
        editorContainer.style.display = 'block';
        
        // 加载示例数据到编辑器
        const exampleData = CommonUtils.getExampleData(exampleId);
        if (exampleData) {
            const titleInput = document.getElementById('exampleTitleInput');
            if (titleInput) {
                titleInput.value = exampleData.metadata.title || '未命名示例';
            }
        }
    }
    
    /**
     * 关闭编辑器
     */
    function closeEditor() {
        editorContainer.style.display = 'none';
        
        // 移除URL参数
        CommonUtils.removeUrlParameter('exampleId');
    }
    
    /**
     * 处理导出JSON
     */
    function handleExportJSON() {
        // 获取当前编辑的示例ID
        const exampleId = CommonUtils.getUrlParameter('exampleId');
        
        if (!exampleId) {
            CommonUtils.showMessage('请先选择要导出的示例', 'warning');
            return;
        }
        
        // 获取示例数据
        const exampleData = CommonUtils.getExampleData(exampleId);
        
        if (!exampleData) {
            CommonUtils.showMessage('示例数据不存在', 'error');
            return;
        }
        
        // 导出JSON文件
        const filename = `${exampleData.exampleId}.json`;
        CommonUtils.exportJSONToFile(exampleData, filename);
        
        CommonUtils.showMessage('JSON导出成功！', 'success');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
