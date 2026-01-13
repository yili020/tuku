# 区块联动系统 - 快速入门指南

## 🚀 快速开始

### 1. 打开测试页面

在浏览器中打开 `test-phase3.html`，你会看到5个测试模块。

### 2. 基础联动测试

**操作步骤：**
1. 鼠标悬停在左侧任意区块上
2. 观察右侧关联区块的高亮效果
3. 点击任意区块，查看固定高亮
4. 再次点击可取消高亮

**预期效果：**
- 悬停时：关联区块显示淡蓝色边框
- 点击后：关联区块显示深蓝色边框
- 高亮区块会有轻微上移效果

### 3. 显示/隐藏控制测试

**操作步骤：**
1. 点击"淡入显示 1"按钮
2. 观察区块1的淡入动画
3. 点击"淡出隐藏 1"按钮
4. 观察区块1的淡出动画
5. 尝试其他动画效果（滑动、缩放）

**动画类型：**
- **fade** - 透明度渐变
- **slide** - 上下滑动
- **scale** - 大小缩放

### 4. 动画效果测试

**可用动画：**
- **抖动** - 快速左右摇摆
- **脉冲** - 放大缩小循环
- **闪烁** - 透明度快速变化
- **弹跳** - 上下弹跳

**操作步骤：**
1. 点击任意动画按钮
2. 观察区块的动画效果
3. 尝试"聚焦区块"功能，体验组合效果

### 5. 拖拽功能测试

**操作步骤：**
1. 点击"启用拖拽"按钮
2. 鼠标拖动区块
3. 观察拖动过程中的视觉反馈
4. 点击"禁用拖拽"恢复正常

## 📚 在学习页面中使用

### 1. 打开学习页面

```
learning.html?exampleId=ex_html_basic_001
```

或使用交互演示示例：
```
learning.html?exampleId=ex_interaction_demo_001
```

### 2. 体验联动效果

1. **悬停联动**
   - 鼠标移到左侧展示区的任意元素上
   - 右侧对应的代码会自动高亮

2. **点击联动**
   - 点击代码块
   - 左侧对应的效果会高亮显示

3. **进度切换**
   - 使用"上一个概念"/"下一个概念"按钮
   - 区块会自动切换并应用动画

## 🎨 自定义联动配置

### JSON数据结构

```json
{
  "id": "block_01",
  "type": "html-container",
  "content": "...",
  "associations": ["block_02", "block_03"],
  "actions": [
    {
      "event": "click",
      "action": "toggleHighlight",
      "targets": ["block_02"]
    }
  ]
}
```

### 配置说明

- **associations** - 关联的区块ID数组
- **actions** - 交互动作配置
  - **event** - 触发事件（click, mouseenter等）
  - **action** - 动作类型（toggleHighlight, show, hide等）
  - **targets** - 目标区块ID数组

## 💻 编程使用

### 基础示例

```javascript
// 1. 初始化
const manager = new BlockInteractionManager();

// 2. 注册区块
const blocks = document.querySelectorAll('[data-block-id]');
manager.registerBlocks(blocks);

// 3. 使用功能
manager.togglePermanentHighlight('block_1');
manager.showBlocks(['block_2', 'block_3'], 'fade');
manager.pulse('block_4');
```

### 高级用法

```javascript
// 批量操作
const blockIds = ['block_1', 'block_2', 'block_3'];
manager.showBlocks(blockIds, 'slide');
manager.highlight(blockIds);

// 组合效果
manager.focusBlock('block_5'); // 高亮+滚动+动画

// 获取信息
const info = manager.getBlockInfo('block_1');
console.log(info.associations); // 关联的区块
console.log(info.isHighlighted); // 是否高亮
```

## 🎯 常见使用场景

### 场景1：教学内容高亮

当用户学习某个概念时，自动高亮相关的代码和说明。

```javascript
// 进入新步骤时
function onStepChange(stepId) {
  // 清除旧高亮
  manager.clearAllHighlights();
  
  // 高亮当前步骤的关键区块
  manager.focusBlock(stepId);
}
```

### 场景2：错误提示

当用户操作错误时，使用抖动动画提示。

```javascript
function showError(blockId) {
  manager.shake(blockId);
  manager.blink(blockId, 3);
}
```

### 场景3：渐进式显示

逐步显示学习内容，增加趣味性。

```javascript
async function revealContent() {
  const blocks = ['block_1', 'block_2', 'block_3'];
  
  for (const blockId of blocks) {
    manager.showBlocks(blockId, 'scale');
    await sleep(500); // 等待500ms
  }
}
```

### 场景4：交互提示

引导用户进行下一步操作。

```javascript
function highlightNextAction(blockId) {
  manager.focusBlock(blockId);
  manager.pulse(blockId);
}
```

## 🔧 配置选项

### 动画配置

```javascript
manager.animationConfig = {
  duration: 300,      // 动画时长（毫秒）
  easing: 'ease-in-out'  // 缓动函数
};
```

### 支持的动画类型

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| fade | 淡入淡出 | 平滑过渡 |
| slide | 滑动 | 内容切换 |
| scale | 缩放 | 突出显示 |
| shake | 抖动 | 错误提示 |
| pulse | 脉冲 | 吸引注意 |
| blink | 闪烁 | 重要提示 |
| bounce | 弹跳 | 活泼效果 |

## 📋 最佳实践

### 1. 合理使用高亮

✅ **推荐：**
- 用于显示关联关系
- 突出当前学习重点
- 引导用户注意力

❌ **避免：**
- 同时高亮太多区块
- 频繁切换高亮状态
- 使用过于刺眼的颜色

### 2. 选择合适的动画

✅ **推荐：**
- 重要内容用pulse
- 错误提示用shake
- 内容显示用fade
- 步骤切换用slide

❌ **避免：**
- 过度使用动画
- 动画时间过长
- 同时播放多个动画

### 3. 性能优化

✅ **推荐：**
- 批量操作使用数组
- 及时清理不需要的高亮
- 使用CSS动画代替JS动画

❌ **避免：**
- 循环中逐个操作区块
- 保持大量区块的高亮状态
- 使用复杂的DOM操作

## 🐛 常见问题

### Q1: 高亮没有效果？

**检查：**
1. 是否正确引入CSS文件？
2. 区块是否有`data-block-id`属性？
3. 是否调用了`registerBlocks()`？

### Q2: 动画不流畅？

**解决：**
1. 检查CSS transition设置
2. 减少同时动画的区块数量
3. 使用CSS动画代替JS动画

### Q3: 关联关系不生效？

**检查：**
1. `data-associations`属性格式是否正确？
2. 关联的区块ID是否存在？
3. 是否正确注册了所有区块？

### Q4: 拖拽功能无法使用？

**检查：**
1. 是否调用了`enableDrag()`？
2. 区块是否有`draggable`属性？
3. 浏览器是否支持拖拽API？

## 📞 获取帮助

1. 查看 `PHASE3-SUMMARY.md` 了解完整功能
2. 参考 `test-phase3.html` 中的示例代码
3. 阅读 `js/block-interaction.js` 中的注释
4. 查看 `README.md` 了解整体架构

## 🎉 开始探索

现在你已经掌握了区块联动系统的基础知识，可以：

1. 打开 `test-phase3.html` 体验所有功能
2. 查看 `interaction-demo.json` 了解数据结构
3. 在自己的示例中使用联动功能
4. 探索更多创意交互方式

祝你使用愉快！🚀
