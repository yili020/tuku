项目概述
一个面向编程小白的互动学习平台，支持可视化创作和学习联动功能。

核心功能模块
1. 页面架构
    首页 (index.html)
    ├── 学习示例展示
    ├── 点击示例跳转到学习页面
    └── 创作入口按钮
    
    创作者中心(creator.html)   
    ├──示例列表
    │  └──编辑、预览、发布、删除
    └──创作页面
       ├── 效果展示区 (可编辑)
       ├── 代码解释区 (可编辑)
       ├── 区块管理面板
       └── 数据导出功能
    
    学习页面 (learning.html)
    ├── 左侧：效果展示区（实时预览）
    ├── 右侧：代码解释区（互动代码）
    ├── 学习进度控制
    └── 区块联动系统

    ┌─────────────────────────────┐
    │  代码解释区                  │  
    │  ┌───────────────────────┐  │
    │  │ 代码块容器（深色背景） │  │  
    │  │  代码行1 (变蓝)       │  │  ← 只有代码内容变蓝
    │  │  代码行2 (变蓝)       │  │
    │  └───────────────────────┘  │
    │    文本说明                  │                             
    └─────────────────────────────┘
2. 示例与JSON数据关联
    每个示例必须关联对应的JSON数据

    实现方案：

    创作流程：
    创作者创建示例 → 生成唯一示例ID → 关联JSON数据 → 保存到localStorage → 发布标记 → 首页显示

    数据结构：
    示例元数据：
    {
    "exampleId": "ex_001",
    "title": "HTML基础示例",
    "description": "学习HTML基础标签",
    "author": "创作者姓名",
    "createdAt": "2024-01-15",
    "published": true,  // 发布状态
    "version": "1.0",
    "jsonDataPath": "examples/ex_001.json"  // 关联的JSON数据
    }
3. 区块联动系统
    核心概念
    区块：页面上的最小互动单元（图片、文字、代码行等）

    关联关系：双向链接，点击A时高亮B、C、D

    隐藏控制：点击E时隐藏A和B

    实现方式
    统一标识系统：每个区块有唯一ID

    关联映射表：存储区块间的关联关系

    事件委托机制：通过父元素监听点击事件

    高亮样式切换：通过CSS类控制显示/隐藏/高亮

   区块自定义功能扩展列表
    	
    显示控制:	
    1. 显示/隐藏切换
    2. 淡入淡出效果
    3. 滑动显示
    4. 延时显示
    描述:控制区块的可见性
    
    样式效果:具体功能
    1. 高亮样式
    2. 边框强调
    3. 背景色变化
    4. 闪烁动画
    5. 缩放效果
    6. 旋转效果	
    描述：视觉反馈效果
    
    关联功能	
    1. 单向关联
    2. 双向关联
    3. 多对多关联
    4. 条件关联
    5. 链式关联	
    描述：区块间的联动关系
    
    交互功能	
    1. 点击事件
    2. 悬停事件
    3. 双击事件
    4. 拖拽事件
    5. 右键菜单	
    描述：用户交互响应
    
    内容功能	
    1. 文本替换
    2. 图片替换
    3. 动态内容
    4. 代码执行
    5. 音效播放
    描述：区块内容变化
    
    状态管理	
    1. 激活状态
    2. 完成状态
    3. 错误状态
    4. 锁定状态	
    描述：区块状态标识
    
    布局功能	
    1. 位置移动
    2. 尺寸调整
    3. 层级控制
    4. 浮动效果	
    描述:布局控制
    
    新增重要功能：

    步骤依赖：某些区块只在特定学习步骤显示

    错误模拟：展示常见错误及其修正

    对比显示：正确 vs 错误对比

    代码折叠：可展开/折叠的代码块

    提示系统：鼠标悬停显示提示

    进度保存：记录用户学习状态

4. 图片处理方案
推荐方案：使用路径而非Base64

实现方式：

json
// JSON数据中的图片引用
{
  "type": "image",
  "content": {
    "src": "images/example/home.png",  // 相对路径
    "alt": "首页图片",
    "width": 300,
    "height": 200
  }
}

// 资源管理结构
project/
├── index.html
├── learning.html
├── creator.html
├── data/              # JSON数据存储
│   └── examples/
├── images/            # 图片资源
│   ├── examples/      # 示例图片
│   └── ui/           # UI图片
└── js/               # JavaScript
图片上传处理流程：

创作者上传图片到images/examples/目录

系统生成相对路径

将路径保存到JSON数据

学习页面加载时根据路径显示图片

优点：

JSON文件小，加载快

图片可缓存

支持CDN加速

便于版本管理

5. JSON数据结构与DOM生成
按结构设计JSON并解析生成DOM
JSON数据结构设计：
json
{
  "exampleId": "ex_001",
  "metadata": {
    "title": "HTML基础",
    "description": "学习HTML基本标签",
    "difficulty": "beginner",
    "estimatedTime": 30
  },
  "bigSteps": [
    {
      "bigStepId": "big_01",
      "title": "HTML文档结构",
      "description": "了解HTML基本结构",
      "smallSteps": [
        {
          "smallStepId": "small_0101",
          "title": "创建HTML文档",
          "description": "学习HTML文档基本结构",
          "blocks": {
            "leftArea": [
              {
                "id": "block_01",
                "type": "html-container",
                "content": "<div class=\"demo-container\"></div>",
                "position": { "top": "10px", "left": "10px" },
                "styles": {
                  "default": "demo-block",
                  "highlight": "demo-block-highlight"
                },
                "associations": ["code_01", "desc_01"],
                "actions": [
                  {
                    "event": "click",
                    "action": "toggleHighlight",
                    "targets": ["code_01", "desc_01"]
                  }
                ]
              }
            ],
            "rightArea": [
              {
                "id": "code_01",
                "type": "code-block",
                "language": "html",
                "content": "<!DOCTYPE html>\n<html>\n<head></head>\n<body></body>\n</html>",
                "lineHighlights": [1, 2, 3, 4, 5],
                "associations": ["block_01", "desc_01"]
              },
              {
                "id": "desc_01",
                "type": "description",
                "content": "这是HTML5文档声明，告诉浏览器使用HTML5解析文档",
                "associations": ["block_01", "code_01"]
              }
            ]
          }
        }
      ]
    }
  ]
}
DOM生成流程：
javascript
// 伪代码示例
function generateDOMFromJSON(jsonData) {
  const currentStep = getCurrentStep();
  const blocks = jsonData.bigSteps[currentStep.bigIndex]
                    .smallSteps[currentStep.smallIndex].blocks;
  
  // 清空容器
  leftContainer.innerHTML = '';
  rightContainer.innerHTML = '';
  
  // 生成左侧区块
  blocks.leftArea.forEach(block => {
    const element = createElementByType(block);
    element.dataset.id = block.id;
    element.dataset.associations = block.associations.join(',');
    leftContainer.appendChild(element);
  });
  
  // 生成右侧区块
  blocks.rightArea.forEach(block => {
    const element = createElementByType(block);
    element.dataset.id = block.id;
    element.dataset.associations = block.associations.join(',');
    rightContainer.appendChild(element);
  });
  
  // 绑定事件
  bindBlockEvents();
}
6. 学习进度系统设计
双进度条系统：
小进度条 (顶部导航最右侧)         大进度条 (内容区左侧)
[← 上一个概念] [下一个概念 →]       [■ □ □ □ □ □ □]
步骤 1/5: 创建HTML文档              1 2 3 4 5 6 7
数据结构支持：
json
{
  "progress": {
    "bigSteps": [
      {
        "id": "big_01",
        "title": "HTML结构",
        "completed": true,
        "smallSteps": [
          { "id": "small_0101", "title": "文档声明", "completed": true },
          { "id": "small_0102", "title": "html标签", "completed": true },
          { "id": "small_0103", "title": "head标签", "completed": false }
        ]
      }
    ],
    "current": {
      "bigIndex": 0,
      "smallIndex": 2  // 当前在big_01的第三个smallStep
    }
  }
}
进度控制逻辑：
大进度条行为：

点击任意大步骤：跳转到该大步的第一个小步

只能通过拖拽或点击切换

不显示"下一步"按钮

小进度条行为：

显示当前小步序号（如：步骤 3/8）

"上一个概念"按钮：跳转到前一个小步

"下一个概念"按钮：跳转到下一个小步

可点击小步标题直接跳转（如果有多个小步）

区块点击跳转：

点击某个区块可以跳转到关联的小步

例如：点击"图片区块"可能跳转到"添加图片"小步

实现方案：
javascript
// 进度管理类
class ProgressManager {
  constructor(jsonData) {
    this.jsonData = jsonData;
    this.currentBigIndex = 0;
    this.currentSmallIndex = 0;
  }
  
  // 切换到大步
  goToBigStep(bigIndex) {
    this.currentBigIndex = bigIndex;
    this.currentSmallIndex = 0; // 总是跳到第一个小步
    this.updateDisplay();
  }
  
  // 切换到小步
  goToSmallStep(smallIndex) {
    const maxSmallSteps = this.getCurrentBigStep().smallSteps.length;
    if (smallIndex >= 0 && smallIndex < maxSmallSteps) {
      this.currentSmallIndex = smallIndex;
      this.updateDisplay();
    }
  }
  
  // 上一个概念
  previousConcept() {
    if (this.currentSmallIndex > 0) {
      this.currentSmallIndex--;
    } else if (this.currentBigIndex > 0) {
      // 切换到前一个大步的最后一个概念
      this.currentBigIndex--;
      this.currentSmallIndex = this.getCurrentBigStep().smallSteps.length - 1;
    }
    this.updateDisplay();
  }
  
  // 下一个概念
  nextConcept() {
    const currentBigStep = this.getCurrentBigStep();
    if (this.currentSmallIndex < currentBigStep.smallSteps.length - 1) {
      this.currentSmallIndex++;
    } else if (this.currentBigIndex < this.jsonData.bigSteps.length - 1) {
      // 切换到下一个大步的第一个概念
      this.currentBigIndex++;
      this.currentSmallIndex = 0;
    }
    this.updateDisplay();
  }
  
  // 区块点击跳转
  jumpFromBlock(blockId) {
    // 查找包含此区块的小步
    const targetStep = this.findStepByBlockId(blockId);
    if (targetStep) {
      this.currentBigIndex = targetStep.bigIndex;
      this.currentSmallIndex = targetStep.smallIndex;
      this.updateDisplay();
    }
  }
}


7. 完整实现流程
第一阶段：基础架构 (1-2周)
创建项目结构

实现基础HTML/CSS布局

创建三个主页面框架

第二阶段：JSON系统 (2-3周)
设计并实现完整JSON数据结构

创建JSON解析器和DOM生成器

实现localStorage数据管理器

测试数据保存和读取

第三阶段：区块联动系统 ✅ (已完成)

实现基础区块类型（文本、图片、代码）

实现区块关联系统

添加区块交互效果

实现显示/隐藏控制

**已实现功能：**
- ✅ 区块联动管理器（BlockInteractionManager）
- ✅ 点击高亮联动
- ✅ 鼠标悬停联动
- ✅ 显示/隐藏控制（支持fade/slide/scale动画）
- ✅ 区块拖拽功能
- ✅ 多种动画效果（shake/pulse/blink/bounce等）
- ✅ 区块聚焦功能
- ✅ 批量区块操作
- ✅ 完整的CSS动画样式

**核心文件：**
- `js/block-interaction.js` - 区块联动管理器
- `css/learning.css` - 联动样式和动画
- `test-phase3.html` - 第三阶段测试页面
- `data/examples/interaction-demo.json` - 联动演示数据

第四阶段：进度系统 (2周)
实现双进度条UI

完成进度控制逻辑

实现区块跳转功能

添加进度保存功能

第五阶段：创作页面 (3-4周)
实现可视化区块编辑器

完成关联关系配置界面

实现JSON数据导出

添加示例发布功能

第六阶段：数据流集成（第5周）
创作页面保存数据到localStorage

学习页面从localStorage读取数据

实现动态渲染学习内容

第七阶段：集成测试 (1周)
端到端功能测试

性能优化

用户体验优化

完整的README文档

基础用户指南

开发路线图

8. 关键技术点

1. 事件委托优化
javascript
// 使用事件委托提高性能
document.addEventListener('click', (e) => {
  // 查找最近的.block元素
  const block = e.target.closest('[data-block-id]');
  if (block) {
    const blockId = block.dataset.blockId;
    const associations = block.dataset.associations.split(',');
    
    // 高亮关联区块
    this.highlightAssociatedBlocks(associations);
    
    // 检查是否需要跳转
    if (block.dataset.jumpToStep) {
      this.progressManager.jumpFromBlock(blockId);
    }
  }
});
2. 状态管理
javascript
class AppState {
  constructor() {
    this.currentExample = null;
    this.progress = {};
    this.userSettings = {};
    this.blockStates = new Map(); // 记录每个区块的状态
  }
  
  saveToLocalStorage() {
    const state = {
      progress: this.progress,
      userSettings: this.userSettings,
      blockStates: Array.from(this.blockStates.entries())
    };
    localStorage.setItem('learningState', JSON.stringify(state));
  }
}
3. 资源预加载
javascript
class ResourceManager {
  constructor() {
    this.imageCache = new Map();
  }
  
  preloadImages(imagePaths) {
    imagePaths.forEach(path => {
      if (!this.imageCache.has(path)) {
        const img = new Image();
        img.src = path;
        this.imageCache.set(path, img);
      }
    });
  }
}
9. 扩展性考虑
为未来功能预留：
插件系统：允许扩展新的区块类型

主题系统：支持自定义界面主题

导入/导出：支持多种格式数据交换

协作功能：多用户同时编辑

版本控制：示例版本管理

这个规划确保了系统的可扩展性和可维护性，同时满足了当前需求并为未来功能预留了接口。