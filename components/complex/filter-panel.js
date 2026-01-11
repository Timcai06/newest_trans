/**
 * Filter Panel Component
 * 筛选面板组件 - iOS风格底部弹出面板
 * 提供视图选择、排序、首字母筛选、词性筛选等功能
 */

/**
 * 筛选面板组件类
 * 管理筛选面板的显示、交互和状态
 */
class FilterPanel {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.containerId - 容器元素ID
   * @param {Function} options.onApply - 应用筛选时的回调函数
   * @param {Object} options.initialFilters - 初始筛选条件
   */
  constructor(options = {}) {
    // 默认配置
    this.options = {
      containerId: 'filterPanelContainer',
      onApply: null,
      initialFilters: {
        view: 'grid',
        sort: 'count',
        letter: 'all',
        pos: []
      },
      ...options
    };

    // 当前筛选状态
    this.filters = { ...this.options.initialFilters };

    // 临时筛选状态（用于取消时恢复）
    this.tempFilters = { ...this.filters };

    // 组件元素引用
    this.elements = {
      overlay: null,
      panel: null,
      viewBtns: [],
      sortItems: [],
      letterBtns: [],
      posItems: [],
      resetBtn: null,
      applyBtn: null,
      closeBtn: null
    };

    // 视图选项配置
    this.viewOptions = [
      { id: 'grid', label: '网格', icon: this.createGridIcon() },
      { id: 'list', label: '列表', icon: this.createListIcon() },
      { id: 'icon', label: '图标', icon: this.createIconIcon() },
      { id: 'coverflow', label: '封面流', icon: this.createCoverflowIcon() }
    ];

    // 排序选项配置
    this.sortOptions = [
      { id: 'count', label: '按使用次数' },
      { id: 'lastUsed', label: '按最近使用' },
      { id: 'word', label: '按字母顺序' }
    ];

    // 首字母选项（全部 + A-Z + #）
    this.letterOptions = [
      { id: 'all', label: '全部', class: 'all' },
      ...Array.from({ length: 26 }, (_, i) => ({
        id: String.fromCharCode(65 + i).toLowerCase(),
        label: String.fromCharCode(65 + i)
      })),
      { id: 'number', label: '#' }
    ];

    // 词性选项配置（与高亮颜色对应）
    this.posOptions = [
      { id: 'noun', label: '名词 (n.)' },
      { id: 'verb', label: '动词 (v.)' },
      { id: 'adjective', label: '形容词 (adj.)' },
      { id: 'adverb', label: '副词 (adv.)' },
      { id: 'pronoun', label: '代词 (pron.)' },
      { id: 'preposition', label: '介词 (prep.)' },
      { id: 'conjunction', label: '连词 (conj.)' }
    ];

    // 初始化组件
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.createDOM();
    this.bindEvents();
  }

  /**
   * 创建DOM结构
   */
  createDOM() {
    // 创建容器
    const container = document.getElementById(this.options.containerId) || document.body;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    this.elements.overlay = overlay;

    // 创建筛选面板
    const panel = document.createElement('div');
    panel.className = 'filter-panel';
    panel.innerHTML = `
      <!-- 面板头部 -->
      <div class="filter-header">
        <h3 class="filter-title">筛选选项</h3>
        <button class="filter-close-btn" aria-label="关闭">×</button>
      </div>

      <!-- 面板内容区域 -->
      <div class="filter-content">
        <!-- 视图选择 -->
        <div class="filter-section">
          <div class="filter-section-title">视图类型</div>
          <div class="filter-view-options" id="filterViewOptions"></div>
        </div>

        <!-- 排序方式 -->
        <div class="filter-section">
          <div class="filter-section-title">排序方式</div>
          <div class="filter-sort-options" id="filterSortOptions"></div>
        </div>

        <!-- 首字母筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">首字母筛选</div>
          <div class="filter-letters" id="filterLetters"></div>
        </div>

        <!-- 词性筛选 -->
        <div class="filter-section">
          <div class="filter-section-title">词性筛选</div>
          <div class="filter-pos-options" id="filterPosOptions"></div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="filter-actions">
        <button class="filter-reset-btn">
          ${this.createResetIcon()}
          <span>重置</span>
        </button>
        <button class="filter-apply-btn">
          ${this.createCheckIcon()}
          <span>应用</span>
        </button>
      </div>
    `;

    this.elements.panel = panel;

    // 获取元素引用
    this.elements.closeBtn = panel.querySelector('.filter-close-btn');
    this.elements.resetBtn = panel.querySelector('.filter-reset-btn');
    this.elements.applyBtn = panel.querySelector('.filter-apply-btn');

    // 渲染视图选项
    this.renderViewOptions();

    // 渲染排序选项
    this.renderSortOptions();

    // 渲染首字母选项
    this.renderLetterOptions();

    // 渲染词性选项
    this.renderPosOptions();

    // 添加到容器
    container.appendChild(overlay);
    container.appendChild(panel);
  }

  /**
   * 渲染视图选项
   */
  renderViewOptions() {
    const container = this.elements.panel.querySelector('#filterViewOptions');
    container.innerHTML = '';

    this.viewOptions.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'filter-view-btn';
      btn.dataset.view = option.id;
      if (this.tempFilters.view === option.id) {
        btn.classList.add('active');
      }
      btn.innerHTML = `
        ${option.icon}
        <span>${option.label}</span>
      `;
      container.appendChild(btn);
      this.elements.viewBtns.push(btn);
    });
  }

  /**
   * 渲染排序选项
   */
  renderSortOptions() {
    const container = this.elements.panel.querySelector('#filterSortOptions');
    container.innerHTML = '';

    this.sortOptions.forEach(option => {
      const item = document.createElement('div');
      item.className = 'filter-sort-item';
      item.dataset.sort = option.id;
      if (this.tempFilters.sort === option.id) {
        item.classList.add('active');
      }
      item.innerHTML = `
        <div class="filter-sort-radio"></div>
        <div class="filter-sort-label">${option.label}</div>
      `;
      container.appendChild(item);
      this.elements.sortItems.push(item);
    });
  }

  /**
   * 渲染首字母选项
   */
  renderLetterOptions() {
    const container = this.elements.panel.querySelector('#filterLetters');
    container.innerHTML = '';

    this.letterOptions.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'filter-letter-btn';
      if (option.class) {
        btn.classList.add(option.class);
      }
      btn.dataset.letter = option.id;
      if (this.tempFilters.letter === option.id) {
        btn.classList.add('active');
      }
      btn.textContent = option.label;
      container.appendChild(btn);
      this.elements.letterBtns.push(btn);
    });
  }

  /**
   * 渲染词性选项
   */
  renderPosOptions() {
    const container = this.elements.panel.querySelector('#filterPosOptions');
    container.innerHTML = '';

    this.posOptions.forEach(option => {
      const item = document.createElement('div');
      item.className = 'filter-pos-item';
      item.dataset.pos = option.id;
      if (this.tempFilters.pos.includes(option.id)) {
        item.classList.add('active');
      }
      item.innerHTML = `
        <div class="filter-pos-checkbox"></div>
        <div class="filter-pos-label">${option.label}</div>
      `;
      container.appendChild(item);
      this.elements.posItems.push(item);
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 遮罩层点击关闭
    this.elements.overlay.addEventListener('click', () => {
      this.hide();
    });

    // 关闭按钮
    this.elements.closeBtn.addEventListener('click', () => {
      this.hide();
    });

    // 视图选择按钮
    this.elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.selectView(view);
      });
    });

    // 排序选项
    this.elements.sortItems.forEach(item => {
      item.addEventListener('click', () => {
        const sort = item.dataset.sort;
        this.selectSort(sort);
      });
    });

    // 首字母按钮
    this.elements.letterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const letter = btn.dataset.letter;
        this.selectLetter(letter);
      });
    });

    // 词性选项
    this.elements.posItems.forEach(item => {
      item.addEventListener('click', () => {
        const pos = item.dataset.pos;
        this.togglePos(pos);
      });
    });

    // 重置按钮
    this.elements.resetBtn.addEventListener('click', () => {
      this.reset();
    });

    // 应用按钮
    this.elements.applyBtn.addEventListener('click', () => {
      this.apply();
    });

    // 阻止面板点击事件冒泡
    this.elements.panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.overlay.classList.contains('active')) {
        this.hide();
      }
    });
  }

  /**
   * 选择视图类型
   * @param {string} view - 视图类型ID
   */
  selectView(view) {
    this.tempFilters.view = view;
    this.elements.viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }

  /**
   * 选择排序方式
   * @param {string} sort - 排序方式ID
   */
  selectSort(sort) {
    this.tempFilters.sort = sort;
    this.elements.sortItems.forEach(item => {
      item.classList.toggle('active', item.dataset.sort === sort);
    });
  }

  /**
   * 选择首字母
   * @param {string} letter - 首字母ID
   */
  selectLetter(letter) {
    this.tempFilters.letter = letter;
    this.elements.letterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.letter === letter);
    });
  }

  /**
   * 切换词性选择
   * @param {string} pos - 词性ID
   */
  togglePos(pos) {
    const index = this.tempFilters.pos.indexOf(pos);
    if (index > -1) {
      // 已选中，取消选中
      this.tempFilters.pos.splice(index, 1);
    } else {
      // 未选中，添加选中
      this.tempFilters.pos.push(pos);
    }

    // 更新UI
    this.elements.posItems.forEach(item => {
      const itemPos = item.dataset.pos;
      item.classList.toggle('active', this.tempFilters.pos.includes(itemPos));
    });
  }

  /**
   * 重置筛选条件
   */
  reset() {
    // 重置为默认值
    this.tempFilters = {
      view: 'grid',
      sort: 'count',
      letter: 'all',
      pos: []
    };

    // 更新UI
    this.updateUI();
  }

  /**
   * 更新UI显示
   */
  updateUI() {
    // 更新视图按钮
    this.elements.viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.tempFilters.view);
    });

    // 更新排序选项
    this.elements.sortItems.forEach(item => {
      item.classList.toggle('active', item.dataset.sort === this.tempFilters.sort);
    });

    // 更新首字母按钮
    this.elements.letterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.letter === this.tempFilters.letter);
    });

    // 更新词性选项
    this.elements.posItems.forEach(item => {
      const pos = item.dataset.pos;
      item.classList.toggle('active', this.tempFilters.pos.includes(pos));
    });
  }

  /**
   * 应用筛选条件
   */
  apply() {
    // 保存临时筛选到正式筛选
    this.filters = { ...this.tempFilters };

    // 触发回调
    if (this.options.onApply && typeof this.options.onApply === 'function') {
      this.options.onApply(this.filters);
    }

    // 关闭面板
    this.hide();
  }

  /**
   * 显示筛选面板
   */
  show() {
    // 复制当前筛选到临时筛选
    this.tempFilters = { ...this.filters };

    // 更新UI
    this.updateUI();

    // 显示遮罩和面板（带动画）
    requestAnimationFrame(() => {
      this.elements.overlay.classList.add('active');
      this.elements.panel.classList.add('active');
    });

    // 禁用body滚动
    document.body.style.overflow = 'hidden';
  }

  /**
   * 隐藏筛选面板
   */
  hide() {
    // 隐藏遮罩和面板
    this.elements.overlay.classList.remove('active');
    this.elements.panel.classList.remove('active');

    // 恢复body滚动
    document.body.style.overflow = '';
  }

  /**
   * 获取当前筛选条件
   * @returns {Object} 筛选条件对象
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * 设置筛选条件
   * @param {Object} filters - 筛选条件对象
   */
  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.tempFilters = { ...this.filters };
    this.updateUI();
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除DOM元素
    if (this.elements.overlay) {
      this.elements.overlay.remove();
    }
    if (this.elements.panel) {
      this.elements.panel.remove();
    }

    // 清除引用
    this.elements = {};
  }

  // ==================== SVG 图标创建方法 ====================

  /**
   * 创建网格视图图标
   */
  createGridIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    `;
  }

  /**
   * 创建列表视图图标
   */
  createListIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    `;
  }

  /**
   * 创建图标视图图标
   */
  createIconIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="21.17" y1="8" x2="12" y2="8"></line>
        <line x1="3.95" y1="6.06" x2="8.54" y2="10.65"></line>
        <line x1="10.88" y1="21.94" x2="15.46" y2="17.35"></line>
        <line x1="21.17" y1="16" x2="12" y2="16"></line>
      </svg>
    `;
  }

  /**
   * 创建封面流视图图标
   */
  createCoverflowIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
      </svg>
    `;
  }

  /**
   * 创建重置图标
   */
  createResetIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"></polyline>
        <polyline points="23 20 23 14 17 14"></polyline>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
      </svg>
    `;
  }

  /**
   * 创建确认图标
   */
  createCheckIcon() {
    return `
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterPanel;
} else if (typeof window !== 'undefined') {
  window.FilterPanel = FilterPanel;
}
