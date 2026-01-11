# 单词翻译助手 - 依赖关系图

## 1. 依赖关系概述

本文件描述了单词翻译助手插件各模块之间的依赖关系，用于指导重构工作和理解代码结构。

## 2. 模块分类

### 核心模块
- **core/background.js** - 后台脚本，处理扩展的核心逻辑
- **core/content.js** - 内容脚本，处理页面交互和翻译功能
- **core/content.css** - 内容脚本样式

### 组件模块
- **components/** - 组件根目录
  - **components/utils/** - 组件工具
    - **components/utils/BaseComponent.js** - 组件基类
    - **components/utils/component-registry.js** - 组件注册器
    - **components/utils/style-manager.js** - 样式管理器
    - **components/utils/event-bus.js** - 事件总线
  - **components/styles/** - 组件样式
    - **components/styles/variables.css** - CSS变量定义
    - **components/styles/reset.css** - CSS重置样式
    - **components/styles/utils.css** - CSS工具类
    - **components/styles/animations.css** - CSS动画定义
  - **components/base/** - 基础组件
    - **components/base/button.js** - 按钮组件
    - **components/base/button.css** - 按钮组件样式
    - **components/base/card.js** - 卡片组件
    - **components/base/card.css** - 卡片组件样式
    - **components/base/input.js** - 输入框组件
    - **components/base/input.css** - 输入框组件样式
    - **components/base/dialog.js** - 弹窗组件
    - **components/base/dialog.css** - 弹窗组件样式
    - **components/base/toast.js** - 提示组件
    - **components/base/toast.css** - 提示组件样式
  - **components/complex/** - 复合组件
    - **components/complex/word-card.js** - 翻译记录卡片组件
    - **components/complex/word-card.css** - 翻译记录卡片样式
    - **components/complex/stat-card.js** - 统计卡片组件
    - **components/complex/stat-card.css** - 统计卡片样式
    - **components/complex/learning-panel.js** - 学习面板组件
    - **components/complex/learning-panel.css** - 学习面板样式
    - **components/complex/search-bar.js** - 搜索栏组件
    - **components/complex/search-bar.css** - 搜索栏样式
    - **components/complex/settings-panel.js** - 设置面板组件
    - **components/complex/settings-panel.css** - 设置面板样式
  - **components/business/** - 业务组件
    - **components/business/translation-popup.js** - 翻译弹窗组件
  - **components/content/** - Content脚本组件
    - **components/content/utils/** - Content组件工具
      - **components/content/utils/ContentComponent.js** - Content组件基类
    - **components/content/complex/** - Content复杂组件
      - **components/content/complex/TextSelection.js** - 文本选择组件
      - **components/content/complex/TranslationRequest.js** - 翻译请求组件
      - **components/content/complex/TranslationHighlight.js** - 翻译结果高亮组件
  - **components/layouts/** - 布局组件
    - **components/layouts/header.js** - 头部组件
    - **components/layouts/content.js** - 内容区域组件
  - **components/index.js** - 组件库入口

### Dashboard模块
- **popup/dashboard.html** - Dashboard主页面
- **popup/dashboard.js** - Dashboard主逻辑，包含学习概览统计卡片和数据可视化
- **popup/css/dashboard.css** - Dashboard样式
- **popup/modules/dashboard-manager.js** - Dashboard数据管理
- **popup/modules/learning-manager.js** - 学习模式管理
- **popup/modules/learning-stats.js** - 学习统计数据
- **popup/modules/page-manager.js** - 页面导航管理
- **popup/components/learning-mode-selector.js** - 学习模式选择器组件

### 学习概览模块
- **popup/dashboard.js** - 统计卡片组件实现（今日学习、掌握程度、待复习、连续学习、总学习词数）
- **popup/css/dashboard.css** - 学习概览样式和动画
- **popup/dashboard.html** - 学习概览页面结构
- **popup/modules/dashboard-manager.js** - 学习概览数据逻辑

### 学习记录详情模块
- **components/complex/word-card.js** - 学习记录卡片组件
- **popup/modules/learning-stats.js** - 学习记录数据管理
- **popup/dashboard.html** - 学习记录页面结构
- **popup/css/dashboard.css** - 学习记录样式

### 服务模块
- **services/ai-translate-service.js** - AI翻译服务
- **services/netease-translate-service.js** - 网易翻译服务
- **services/quality_service.js** - 质量监控服务

### 工具模块
- **utils/cache-manager.js** - 缓存管理工具
- **utils/event-manager.js** - 事件管理工具
- **utils/performance-monitor.js** - 性能监控工具
- **utils/service-degradation-manager.js** - 服务降级管理工具
- **utils/module-manager.js** - 模块管理工具

### 模块模块
- **modules/theme-manager.js** - 主题管理模块
- **modules/utils-monitor.js** - 工具监控模块

### 配置模块
- **config/api-config.js** - API配置

## 3. 详细依赖关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                          核心模块                                    │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│ core/background│ core/content.js  │ modules/theme-manager.js       │
└─────────┬───────┴─────────┬───────┴───────────────┬───────────────┘
          │                 │                       │
          ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 服务模块、工具模块、组件模块、配置模块                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────┤
│ services/ai-    │ utils/cache-    │ components/     │ config/     │
│ translate-      │ manager.js      │ utils/BaseComponent.js        │
│ service.js      │ utils/event-    │ components/     │ api-        │
│ services/netease│ manager.js      │ utils/component-│             │
│ -translate-     │ utils/          │ registry.js     │ config.js   │
│ service.js      │ performance-    │ components/     │             │
│                 │ monitor.js      │ utils/style-    │             │
│                 │ utils/          │ manager.js      │             │
│                 │ service-        │ components/     │             │
│                 │ degradation-    │ utils/event-    │             │
│                 │ manager.js      │ bus.js          │             │
│                 │ utils/module-   │ components/     │             │
│                 │ manager.js      │ styles/         │             │
│                 │ services/       │ variables.css   │             │
│                 │ quality_        │                 │             │
│                 │ service.js      │                 │             │
│                 │ modules/utils-  │                 │             │
│                 │ monitor.js      │                 │             │
└─────────────────┴─────────────────┴─────────────────┴─────────────┘
```

## 4. 依赖关系表

| 模块 | 依赖模块 | 依赖类型 |
|------|----------|----------|
| core/background.js | services/ai-translate-service.js | 直接依赖 |
| core/background.js | config/api-config.js | 直接依赖 |
| core/background.js | utils/module-manager.js | 直接依赖 |
| core/background.js | services/quality_service.js | 直接依赖 |
| core/content.js | services/netease-translate-service.js | 直接依赖 |
| core/content.js | utils/cache-manager.js | 直接依赖 |
| core/content.js | utils/event-manager.js | 直接依赖 |
| core/content.js | utils/performance-monitor.js | 直接依赖 |
| core/content.js | utils/service-degradation-manager.js | 直接依赖 |
| core/content.js | modules/theme-manager.js | 直接依赖 |
| core/content.js | utils/module-manager.js | 直接依赖 |
| modules/theme-manager.js | core/content.js | 反向依赖 |
| modules/utils-monitor.js | 无 | 独立模块 |
| services/quality_service.js | 无 | 独立模块 |
| utils/module-manager.js | 无 | 独立模块 |
| components/utils/BaseComponent.js | 无 | 独立模块 |
| components/utils/component-registry.js | 无 | 独立模块 |
| components/utils/style-manager.js | 无 | 独立模块 |
| components/utils/event-bus.js | 无 | 独立模块 |
| components/styles/variables.css | 无 | 独立模块 |
| components/base/button.js | components/utils/BaseComponent.js | 直接依赖 |
| components/base/button.js | components/utils/style-manager.js | 直接依赖 |
| components/base/card.js | components/utils/BaseComponent.js | 直接依赖 |
| components/base/card.js | components/utils/style-manager.js | 直接依赖 |
| components/base/input.js | components/utils/BaseComponent.js | 直接依赖 |
| components/base/input.js | components/utils/style-manager.js | 直接依赖 |
| components/base/dialog.js | components/utils/BaseComponent.js | 直接依赖 |
| components/base/dialog.js | components/utils/style-manager.js | 直接依赖 |
| components/base/toast.js | components/utils/BaseComponent.js | 直接依赖 |
| components/base/toast.js | components/utils/style-manager.js | 直接依赖 |
| components/complex/word-card.js | components/utils/BaseComponent.js | 直接依赖 |
| components/complex/word-card.js | components/base/card.js | 直接依赖 |
| components/complex/word-card.js | components/utils/style-manager.js | 直接依赖 |
| components/complex/stat-card.js | components/utils/BaseComponent.js | 直接依赖 |
| components/complex/stat-card.js | components/base/card.js | 直接依赖 |
| components/complex/stat-card.js | components/utils/style-manager.js | 直接依赖 |
| components/complex/learning-panel.js | components/utils/BaseComponent.js | 直接依赖 |
| components/complex/learning-panel.js | components/base/button.js | 直接依赖 |
| components/complex/learning-panel.js | components/utils/style-manager.js | 直接依赖 |
| components/complex/search-bar.js | components/utils/BaseComponent.js | 直接依赖 |
| components/complex/search-bar.js | components/base/input.js | 直接依赖 |
| components/complex/search-bar.js | components/base/button.js | 直接依赖 |
| components/complex/search-bar.js | components/utils/style-manager.js | 直接依赖 |
| components/layouts/header.js | components/utils/BaseComponent.js | 直接依赖 |
| components/layouts/header.js | components/base/button.js | 直接依赖 |
| components/layouts/header.js | components/utils/style-manager.js | 直接依赖 |
| components/layouts/content.js | components/utils/BaseComponent.js | 直接依赖 |
| components/layouts/content.js | components/utils/style-manager.js | 直接依赖 |
| components/business/translation-popup.js | components/utils/BaseComponent.js | 直接依赖 |
| components/business/translation-popup.js | components/base/card.js | 直接依赖 |
| components/business/translation-popup.js | components/base/button.js | 直接依赖 |
| components/business/translation-popup.js | components/utils/style-manager.js | 直接依赖 |
| components/complex/settings-panel.js | components/utils/BaseComponent.js | 直接依赖 |
| components/complex/settings-panel.js | components/utils/style-manager.js | 直接依赖 |
| components/content/utils/ContentComponent.js | components/utils/BaseComponent.js | 直接依赖 |
| components/content/utils/ContentComponent.js | components/utils/style-manager.js | 直接依赖 |
| components/content/utils/ContentComponent.js | components/utils/event-bus.js | 直接依赖 |
| components/content/complex/TextSelection.js | components/content/utils/ContentComponent.js | 直接依赖 |
| components/content/complex/TranslationRequest.js | components/content/utils/ContentComponent.js | 直接依赖 |
| components/content/complex/TranslationHighlight.js | components/content/utils/ContentComponent.js | 直接依赖 |
| components/content/complex/TranslationHighlight.js | components/utils/style-manager.js | 直接依赖 |
| components/content/complex/TranslationFloatingPopup.js | components/content/utils/ContentComponent.js | 直接依赖 |
| components/content/complex/TranslationFloatingPopup.js | components/utils/style-manager.js | 直接依赖 |
| components/content/complex/ContextMenu.js | components/content/utils/ContentComponent.js | 直接依赖 |
| components/content/complex/ContextMenu.js | components/utils/style-manager.js | 直接依赖 |
| components/index.js | components/utils/BaseComponent.js | 直接依赖 |
| components/index.js | components/utils/component-registry.js | 直接依赖 |
| components/index.js | components/utils/style-manager.js | 直接依赖 |
| components/index.js | components/utils/event-bus.js | 直接依赖 |
| core/content.js | components/content/complex/TextSelection.js | 直接依赖 |
| core/content.js | components/content/complex/TranslationRequest.js | 直接依赖 |
| core/content.js | components/content/complex/TranslationHighlight.js | 直接依赖 |
| core/content.js | components/content/complex/TranslationFloatingPopup.js | 直接依赖 |
| core/content.js | components/content/complex/ContextMenu.js | 直接依赖 |
| components/background/utils/BackgroundComponent.js | components/utils/BaseComponent.js | 直接依赖 |
| components/background/complex/BackgroundAPIRequest.js | components/background/utils/BackgroundComponent.js | 直接依赖 |
| components/background/complex/BackgroundMessage.js | components/background/utils/BackgroundComponent.js | 直接依赖 |
| components/background/complex/BackgroundDataSync.js | components/background/utils/BackgroundComponent.js | 直接依赖 |
| components/background/complex/BackgroundScheduler.js | components/background/utils/BackgroundComponent.js | 直接依赖 |
| components/background/complex/BackgroundStateManager.js | components/background/utils/BackgroundComponent.js | 直接依赖 |
| core/background.js | components/background/complex/BackgroundAPIRequest.js | 直接依赖 |
| core/background.js | components/background/complex/BackgroundMessage.js | 直接依赖 |
| core/background.js | components/background/complex/BackgroundDataSync.js | 直接依赖 |
| core/background.js | components/background/complex/BackgroundScheduler.js | 直接依赖 |
| core/background.js | components/background/complex/BackgroundStateManager.js | 直接依赖 |
| popup/popup-components.js | components/layouts/header.js | 直接依赖 |
| popup/popup-components.js | components/complex/search-bar.js | 直接依赖 |
| popup/popup-components.js | components/complex/word-card.js | 直接依赖 |
| popup/popup-components.js | components/complex/stat-card.js | 直接依赖 |
| popup/popup-components.js | components/complex/learning-panel.js | 直接依赖 |
| popup/popup-components.js | components/complex/settings-panel.js | 直接依赖 |
| popup/popup-components.js | components/utils/style-manager.js | 直接依赖 |
| popup/dashboard.js | components/utils/BaseComponent.js | 直接依赖 |
| popup/dashboard.js | components/utils/event-bus.js | 直接依赖 |
| popup/dashboard.js | components/utils/style-manager.js | 直接依赖 |
| popup/dashboard.js | popup/modules/dashboard-manager.js | 直接依赖 |
| popup/dashboard.js | popup/modules/page-manager.js | 直接依赖 |
| popup/dashboard.js | popup/modules/learning-manager.js | 直接依赖 |
| popup/modules/dashboard-manager.js | popup/modules/learning-manager.js | 直接依赖 |
| popup/modules/dashboard-manager.js | popup/modules/learning-stats.js | 直接依赖 |
| popup/modules/page-manager.js | popup/dashboard.html | 直接依赖 |
| popup/components/learning-mode-selector.js | popup/modules/learning-manager.js | 直接依赖 |
| popup/dashboard.html | components/styles/reset.css | 直接依赖 |
| popup/dashboard.html | components/styles/variables.css | 直接依赖 |
| popup/dashboard.html | components/styles/utils.css | 直接依赖 |
| popup/dashboard.html | popup/popup.css | 直接依赖 |
| popup/dashboard.html | popup/css/dashboard.css | 直接依赖 |

## 5. 模块功能描述

### 核心模块
- **core/background.js**：负责处理扩展的后台任务，包括API请求、消息传递等
- **core/content.js**：负责处理页面交互，包括文本选择、翻译请求、高亮显示等
- **popup/popup.js**：Popup页面主脚本，处理页面逻辑和数据管理
- **popup/popup-components.js**：Popup页面组件化初始化脚本，负责组件创建和管理

### 组件模块
- **components/utils/BaseComponent.js**：组件基类，提供组件的基础功能，包括props管理、样式注册、事件处理等
- **components/utils/component-registry.js**：组件注册器，用于管理所有组件的注册和创建
- **components/utils/style-manager.js**：样式管理器，用于管理组件的样式注入和主题切换
- **components/utils/event-bus.js**：事件总线，用于组件间的通信
- **components/styles/variables.css**：组件样式变量定义，包含主题颜色、圆角、阴影、间距等变量
- **components/base/button.js**：按钮组件，支持多种样式变体、尺寸和图标
- **components/base/card.js**：卡片组件，支持不同卡片类型和流体边框动画
- **components/base/input.js**：输入框组件，支持不同输入类型、聚焦状态和错误状态
- **components/base/dialog.js**：弹窗组件，支持不同弹窗类型、动画效果和主题切换
- **components/base/toast.js**：提示组件，支持不同提示类型、自动关闭和主题切换
- **components/complex/word-card.js**：翻译记录卡片组件，基于Card组件开发，支持流体边框动画和收藏功能
- **components/complex/stat-card.js**：统计卡片组件，基于Card组件开发，用于展示统计数据和趋势
- **components/complex/learning-panel.js**：学习面板组件，基于Button组件开发，用于切换不同的学习模式
- **components/complex/search-bar.js**：搜索栏组件，基于Input和Button组件开发，支持搜索功能、搜索历史和建议
- **components/complex/settings-panel.js**：设置面板组件，用于管理应用的各项设置，包括外观、AI翻译、常规翻译、学习设置和数据管理等
- **components/layouts/header.js**：头部组件，包含logo、标题、设置按钮等，支持主题切换
- **components/layouts/content.js**：内容区域组件，支持不同布局类型和内容类型，适配主题系统
- **components/business/translation-popup.js**：翻译弹窗组件，用于显示单词翻译结果，包括音标、翻译、例句等
- **components/content/utils/ContentComponent.js**：Content组件基类，提供Content脚本组件的基础功能，包括DOM监听、消息通信等
- **components/content/complex/TextSelection.js**：文本选择组件，用于处理网页中的文本选择和翻译触发
  - **components/content/complex/TranslationRequest.js**：翻译请求组件，用于处理翻译请求的发送和管理
  - **components/content/complex/TranslationHighlight.js**：翻译结果高亮组件，用于高亮显示已翻译的单词和词组
  - **components/content/complex/TranslationFloatingPopup.js**：悬浮翻译弹窗组件，用于在网页中显示翻译结果
  - **components/content/complex/ContextMenu.js**：上下文菜单和快捷键组件，用于处理右键菜单和键盘快捷键
  - **components/background/utils/BackgroundComponent.js**：Background组件基类，提供Background脚本组件的基础功能
  - **components/background/complex/BackgroundAPIRequest.js**：Background API请求处理组件，用于处理翻译API请求
  - **components/background/complex/BackgroundMessage.js**：Background消息传递组件，用于处理扩展内部消息通信
  - **components/background/complex/BackgroundDataSync.js**：Background数据同步组件，用于处理数据同步和存储变化监听
  - **components/background/complex/BackgroundScheduler.js**：Background定时任务组件，用于管理定时任务的注册、取消和执行
  - **components/background/complex/BackgroundStateManager.js**：Background扩展状态管理组件，用于管理扩展的状态和服务状态
- **components/index.js**：组件库入口文件，导出所有组件、工具和样式

### 服务模块
- **services/ai-translate-service.js**：提供AI翻译服务
- **services/netease-translate-service.js**：提供网易翻译服务
- **services/quality_service.js**：提供质量监控服务

### 工具模块
- **utils/cache-manager.js**：负责缓存管理，包括缓存的添加、删除、查询等
- **utils/event-manager.js**：负责事件管理，包括事件监听、事件委托、防抖节流等
- **utils/performance-monitor.js**：负责性能监控，包括函数执行时间测量、性能数据收集等
- **utils/service-degradation-manager.js**：负责服务降级管理，监控系统状态并自动调整功能
- **utils/module-manager.js**：负责统一管理所有模块的初始化流程

### 模块模块
- **modules/theme-manager.js**：负责主题管理，包括主题切换、主题持久化等
- **modules/utils-monitor.js**：负责工具监控，包括性能和错误监控

### 配置模块
- **config/api-config.js**：提供API配置，包括API密钥、API地址等

## 6. 重构记录

| 重构日期 | 重构内容 | 影响模块 |
|----------|----------|----------|
| 2024-01-08 | 提取background.js中的翻译API配置到config/api-config.js | core/background.js |
| 2024-01-08 | 分离background.js中的AI翻译模块到services/ai-translate-service.js | core/background.js |
| 2024-01-08 | 优化content.js中的缓存管理到utils/cache-manager.js | core/content.js |
| 2024-01-08 | 分离content.js中的事件管理到utils/event-manager.js | core/content.js |
| 2024-01-08 | 优化theme-manager.js的主题切换逻辑 | modules/theme-manager.js |
| 2026-01-10 | CSS组件化：拆分popup.css为模块化CSS文件结构 | popup/popup.css, components/styles/, components/base/, components/complex/ |
| 2026-01-10 | 创建CSS基础样式文件（variables.css, reset.css, utils.css） | components/styles/ |
| 2026-01-10 | 拆分基础组件CSS样式（button.css, card.css, dialog.css, input.css, toast.css） | components/base/ |
| 2026-01-10 | 拆分learning-panel.css学习面板样式，包含闪卡、测验、拼写模式 | components/complex/learning-panel.css |
| 2026-01-10 | 提取动画样式到animations.css，包含40个@keyframes定义 | components/styles/animations.css |
| 2026-01-10 | 优化popup.html CSS加载顺序，确保样式正确级联 | popup/popup.html |
| 2026-01-27 | 实现学习概览模块，包含统计卡片和数据可视化 | popup/dashboard.js, popup/css/dashboard.css, popup/dashboard.html |
| 2026-01-27 | 优化统计卡片布局，将SVG图标统一放置在右上角 | popup/dashboard.js |
| 2026-01-27 | 添加学习概览动画效果，包括渐入、上移、缩放、弹跳等动画 | popup/dashboard.js |
| 2026-01-27 | 实现多种数据可视化，包括环形进度图、线性进度条、学习热力图、单词学习趋势图 | popup/dashboard.js |
| 2026-02-03 | 实现学习记录详情模块，包含记录卡片和数据管理 | components/complex/word-card.js, popup/modules/learning-stats.js, popup/dashboard.html |
| 2026-02-03 | 添加学习记录筛选和排序功能 | popup/modules/learning-stats.js |
| 2026-02-03 | 实现学习记录分页功能 | popup/modules/learning-stats.js |
| 2026-02-03 | 添加学习记录搜索功能 | popup/dashboard.js |
| 2026-02-03 | 实现学习记录导出功能，支持CSV和JSON格式 | popup/modules/learning-stats.js |

## 7. CSS模块依赖关系

### CSS文件加载顺序
1. components/styles/variables.css（CSS变量定义）
2. components/styles/reset.css（重置样式）
3. components/styles/utils.css（工具类）
4. components/styles/animations.css（动画定义）
5. components/base/*.css（基础组件样式）
6. components/complex/*.css（复合组件样式）
7. popup/popup.css（页面特定样式）

### CSS依赖关系
- 所有CSS文件依赖 **variables.css**（使用CSS变量）
- 所有组件CSS依赖 **reset.css**（基础重置）
- 动画相关样式依赖 **animations.css**（使用@keyframes）
- 复合组件CSS依赖基础组件CSS（样式继承和扩展）
- learning-panel.css 包含闪卡、测验、拼写三种模式的完整样式（1351行）
- animations.css 包含40个动画定义，被多个组件引用

### CSS文件统计
| 文件类型 | 文件数 | 代码行数 | 说明 |
|---------|--------|---------|------|
| 基础样式 | 4 | ~600行 | variables.css, reset.css, utils.css, animations.css |
| 基础组件 | 5 | ~1500行 | button.css, card.css, dialog.css, input.css, toast.css |
| 复合组件 | 1 | ~1351行 | learning-panel.css（含学习模式） |
| 页面样式 | 1 | ~3695行 | popup.css（页面布局和特定样式） |
| **总计** | 11 | ~7146行 | 完整CSS代码 |