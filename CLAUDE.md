# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

单词翻译助手 (Word Translation Assistant) - 一个 Chrome 扩展程序 (Manifest V3)，为英语学习者提供智能单词翻译、学习模式和词汇管理功能。功能包括上下文感知翻译、基于 SRS 的学习系统和模块化组件架构。

## 开发环境

### 安装与测试
```bash
# 在 Chrome 中加载扩展
# 1. 导航到 chrome://extensions/
# 2. 启用"开发者模式"
# 3. 点击"加载已解压的扩展程序"并选择项目根目录

# 无需构建步骤 - 纯原生 JavaScript
# 使用开发者模式时，文件更改后扩展会自动重新加载
```

### 运行测试
```bash
# 测试在浏览器控制台中运行 (tests/ 目录)
# 无自动化测试运行器 - 通过 Chrome DevTools 手动测试

# 在 background.js 上下文中加载 test_suite.js：
# 打开 chrome://extensions/ → 扩展详情 → 检查后台页面
# 然后粘贴并执行测试函数

# 性能测试位于 tests/performance/
# 集成测试位于 tests/integration/
```

## 架构概述

### 三上下文扩展模型

此扩展程序在三个隔离的 JavaScript 上下文中运行，通过 Chrome 扩展 API 进行通信：

1. **后台脚本 (Service Worker)**
   - 文件: `core/background.js`
   - 角色: 翻译 API 协调、消息路由、持久化状态
   - 通信: `chrome.runtime.onMessage` 监听器
   - 模块: AI/网易翻译服务、质量监控

2. **内容脚本** (注入到网页中)
   - 文件: `core/content.js`
   - 角色: 文本选择检测、高亮渲染、网页上的用户交互
   - 隔离: 与页面分离的 JS 上下文；通过前缀类名实现 CSS 隔离
   - 组件: TextSelection、TranslationHighlight、HighlightManager (为性能而虚拟化)
   - 性能: 每页最多高亮 50 个单词，防抖 DOM 操作

3. **弹出界面** (扩展 UI)
   - 文件: `popup/popup.html`、`popup/popup.js`、`popup/modules/*.js`
   - 角色: 词汇管理、学习模式 (抽认卡/测验/拼写)、统计
   - 状态: Chrome Storage API (`chrome.storage.local`)
   - 模块: 11 个管理器模块用于不同功能 (首页、单词列表、学习、设置等)

### 组件系统架构

**BaseComponent 模式**: 所有 UI 组件继承自 `components/utils/BaseComponent.js`
- 生命周期: `constructor()` → `init()` → `render()` → `update()` → `destroy()`
- 通过 `setState()` 进行状态管理，具有变更检测
- 事件绑定/清理跟踪以防止内存泄漏
- 通过 `StyleManager` 注入样式 (CSS-in-JS 用于组件隔离)

**组件层次结构**:
```
components/
├── utils/
│   ├── BaseComponent.js          # 基类，包含生命周期和状态
│   ├── component-registry.js     # 组件工厂/注册表
│   ├── style-manager.js          # CSS 注入和主题系统
│   └── event-bus.js              # 跨组件通信
├── base/                          # 原子组件 (按钮、卡片、输入框、对话框、提示)
├── complex/                       # 复合组件 (单词卡片、学习面板、搜索栏)
├── content/complex/               # 网页交互组件 (TextSelection、TranslationHighlight)
└── background/complex/            # 后台服务组件 (APIRequest、Message、DataSync)
```

**专用组件基类**:
- `ContentComponent` (继承 BaseComponent): 用于具有 DOM 观察的内容脚本组件
- `BackgroundComponent` (继承 BaseComponent): 用于后台脚本服务组件

### CSS 模块化 (最近完成)

**分层 CSS 架构** (11 个文件，约 7146 行):
```
1. 变量层:     components/styles/variables.css  (主题颜色、间距、阴影)
2. 重置层:     components/styles/reset.css      (标准化浏览器默认值)
3. 工具层:     components/styles/utils.css      (Flex/grid 辅助、间距)
4. 动画库:     components/styles/animations.css (40 个 @keyframes 定义)
5. 基础组件:   components/base/*.css            (5 个原子组件样式)
6. 复杂组件:   components/complex/*.css         (learning-panel.css = 1351 行)
7. 页面样式:   popup/popup.css                  (3695 行，页面特定)
```

**CSS 加载顺序** (popup.html):
变量 → 重置 → 工具 → 动画 → 基础组件 → 复杂组件 → 页面样式

**主要优势**:
- 每个组件都有匹配的 `.js` + `.css` 文件
- BEM 命名防止样式冲突
- CSS 变量支持动态主题
- 模块化缓存提高加载性能

### 服务架构

**翻译服务级联** (具有自动降级的后备链):
```
1. AI 翻译 (OpenAI API)           → 高质量，需要 API 密钥
2. 网易有道翻译                     → 质量良好，需要 API 密钥
3. MyMemory (免费 API)             → 后备，无需密钥
4. 百度翻译                         → 最后手段
```

**服务模块**:
- `services/ai-translate-service.js`: OpenAI 集成
- `services/netease-translate-service.js`: 有道 API，带 MD5 签名
- `services/quality_service.js`: 翻译质量监控和后备触发
- `utils/service-degradation-manager.js`: 服务故障时自动降级

### 数据流与存储

**Chrome Storage 模式**:
```javascript
{
  translationHistory: {
    [word]: {
      text: string,
      translation: string,
      phonetic: string,
      type: 'word' | 'phrase' | 'sentence',
      context: string,
      count: number,
      lastUsed: timestamp,
      starred: boolean,
      examples: string[],
      difficulty: 'easy' | 'medium' | 'hard',
      nextReview: timestamp  // SRS 算法
    }
  },
  learningRecords: {
    [word]: [timestamp, timestamp, ...]  // 仅保留最近 3 天
  },
  settings: {
    theme: object,
    apiKeys: object
  }
}
```

**缓存管理**:
- `utils/cache-manager.js`: 内存 + 持久化存储，LRU 淘汰 (最多 500 条目)
- 性能: 缓存命中 ≈ 1ms，缓存未命中 ≈ 200-500ms (API 调用)

### 性能优化

**关键性能约束**:
1. **高亮限制**: 每页最多高亮 50 个单词 (DOM 性能)
2. **虚拟化高亮**: `VirtualizedTranslationHighlight.js` 用于大型文档
3. **防抖文本选择**: 翻译弹出前延迟 200ms
4. **事件委托**: 在 `document` 上使用单个监听器处理所有单词卡片点击
5. **模块懒加载**: `utils/module-manager.js` 动态加载功能

**监控**:
- `utils/performance-monitor.js`: 执行时间跟踪、内存分析
- `components/content/complex/PerformanceMonitor.js`: 内容脚本指标

## 关键开发模式

### 添加新的 UI 组件

1. 在适当的目录中创建组件文件:
   - 原子组件? → `components/base/`
   - 复合组件? → `components/complex/`
   - 页面特定? → `popup/modules/`

2. 继承 BaseComponent:
```javascript
class NewComponent extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = { /* 初始状态 */ };
  }

  registerStyle() {
    // 可选: 通过 StyleManager 注入 CSS
  }

  render() {
    const el = document.createElement('div');
    // 构建 DOM
    return el;
  }

  destroy() {
    this.unbindEvents();
    super.destroy();
  }
}
```

3. 创建匹配的 CSS 文件 (如果适用):
   - 使用 BEM 命名: `.new-component__element--modifier`
   - 引用 CSS 变量: `var(--text-primary)`、`var(--bg-card)`
   - 按正确顺序添加到 popup.html 的 `<link>` 标签

4. 注册组件 (如果可重用):
   - 添加到 `components/index.js`
   - 更新 `components/utils/component-registry.js`

### 添加翻译服务

1. 在 `services/` 中创建服务文件:
```javascript
async function newServiceTranslate(text, context) {
  // API 调用逻辑
  return {
    translation: string,
    phonetic: string,
    examples: string[]
  };
}
```

2. 集成到级联中:
   - 添加到 `core/background.js` 的 `smartTranslate()` 函数
   - 更新 quality_service.js 监控
   - 添加 API 密钥配置到 `config/api-config.js`

### 修改学习模式

**学习系统文件**:
- UI: `popup/modules/learning-manager.js` (模式选择、状态)
- 样式: `components/complex/learning-panel.css` (1351 行: 抽认卡、测验、拼写)
- 算法: `popup/modules/learning-stats.js` (SRS 调度)

**SRS 算法参数** (在 learning-manager.js 中):
```javascript
{
  easy: { interval: 4 days, easeFactor: 2.5 },
  medium: { interval: 1 day, easeFactor: 1.3 },
  hard: { interval: 10 minutes, easeFactor: 1.2 }
}
```

## 关键约束与注意事项

### Chrome 扩展 Manifest V3 限制
- **无远程代码执行**: 所有 JS 必须打包 (无 CDN 导入)
- **Service Worker 生命周期**: 后台脚本可能在空闲 30 秒后终止
- **内容脚本隔离**: 无法直接访问页面 JavaScript (使用 `window.postMessage`)
- **CSP 限制**: 禁止 `eval()`，谨慎使用 `new Function()`

### 样式隔离策略
- **内容脚本**: 所有 CSS 类前缀为 `wta-` (Word Translation Assistant)
- **Shadow DOM**: 已考虑但被拒绝 (破坏文本选择检测)
- **CSS 优先级**: 谨慎使用 `!important`；依赖前缀

### 性能警示
- **避免**: 循环中同步调用 `chrome.storage.local.get()`
- **避免**: 高亮超过 50 个单词 (导致明显延迟)
- **避免**: 在每次 `mousemove` 时查询大型 DOM 树
- **使用**: 防抖/节流 (通过 `utils/event-manager.js`) 处理频繁事件

### 模块依赖
**关键规则**: 重构前检查 `规范文件/DEPENDENCY_GRAPH.md`。关键依赖:
- `core/content.js` 依赖于 6 个在 manifest.json 中先加载的工具模块
- `popup/popup.js` 依赖于 11 个按特定顺序加载的管理器模块
- BaseComponent 必须在任何继承它的组件之前加载

### 主题系统约束
- **仅 CSS 变量**: 所有主题颜色通过 `components/styles/variables.css`
- **无内联样式**: 使用 CSS 类 + 主题变量 (支持动态切换)
- **SVG 图标**: 必须使用 `currentColor` 进行主题适配

## 测试策略

**手动测试工作流**:
1. 在 `chrome://extensions/` 中加载扩展 (开发者模式)
2. 在各种网站上测试翻译 (GitHub、Wikipedia、新闻网站)
3. 检查弹出 UI 流程: 首页 → 单词列表 → 学习模式 → 设置
4. 验证所有页面的主题切换
5. 测试边缘情况: 空数据、API 故障、长单词

**性能基准** (tests/performance/):
- 高亮渲染: 50 个单词 <50ms
- 翻译 API: <500ms (有缓存: <5ms)
- 弹出加载: <200ms

**已知测试缺口**:
- 无自动化 UI 测试
- 无跨浏览器测试 (仅 Chrome)
- 手动 API 密钥轮换测试

## API 配置

**完整功能所需**:
```javascript
// config/api-config.js
export const API_CONFIG = {
  youdao: {
    appKey: 'YOUR_YOUDAO_APP_KEY',
    appSecret: 'YOUR_YOUDAO_SECRET'
  },
  openai: {
    apiKey: 'YOUR_OPENAI_KEY',
    model: 'gpt-3.5-turbo'
  }
};
```

**后备行为**: 扩展程序无需密钥即可工作，但使用较低质量的 MyMemory API。

## 代码风格约定

**来自 UI组件化规范表.md**:
- 组件类: PascalCase (`WordCard`)
- 文件名: kebab-case (`word-card.js`)
- CSS 类: BEM (`word-card__content--starred`)
- CSS 变量: 带前缀的 kebab-case (`--word-card-bg-color`)

**来自 project_rules.md**:
- 每次重构步骤必须更新 `规范文件/DEPENDENCY_GRAPH.md`
- 移动/重命名文件前检查模块依赖
- 保留现有功能 (无迁移路径不进行破坏性更改)

## 文档文件

**架构与规划**:
- `规范文件/DEPENDENCY_GRAPH.md`: 完整的模块依赖图
- `规范文件/UI组件化规范表.md`: 组件开发标准
- `规范文件/组件文档.md`: 组件 API 文档
- `组件同步化计划表.md`: CSS 模块化完成记录

**已完成的优化** (供参考):
- `完成的优化任务/popup.js拆分计划（完成）.md`: Popup 模块化
- `完成的优化任务/CSS组件化完成报告.md`: CSS 重构总结

## 未来考虑

**来自 脑洞大开的计划.md** (愿景功能 - 尚未实现):
- 跨设备词汇云同步
- 语音发音练习模式
- 上下文感知例句生成
- 与 Anki/Quizlet 集成

**技术债务**:
- 考虑 TypeScript 迁移 (当前为原生 JS)
- 自动化测试套件 (当前为手动)
- CI/CD 流水线 (当前为手动打包)
