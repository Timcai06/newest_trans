/**
 * 翻译记录卡片组件
 * 基于Card组件开发，支持流体边框动画和主题切换
 */
const BaseComponent = require('../utils/BaseComponent.js');
const Card = require('../base/card.js');
const styleManager = require('../utils/style-manager.js');

class WordCard extends BaseComponent {
  /**
   * 构造函数
   * @param {Object} props - 组件属性
   * @param {string} props.word - 单词
   * @param {string} props.phonetic - 音标
   * @param {string} props.translation - 翻译
   * @param {string} props.example - 例句
   * @param {string} props.category - 分类
   * @param {Date} props.date - 日期
   * @param {boolean} props.starred - 是否收藏
   * @param {Function} props.onStar - 收藏事件回调
   * @param {Function} props.onDelete - 删除事件回调
   */
  constructor(props = {}) {
    super(props);
    
    // 默认属性
    this.defaultProps = {
      word: '',
      phonetic: '',
      translation: '',
      example: '',
      category: '',
      date: new Date(),
      starred: false,
      onStar: () => {},
      onDelete: () => {}
    };
    
    this.props = { ...this.defaultProps, ...props };
    this.state = {
      starred: this.props.starred
    };
    
    // 初始化组件
    this.init();
  }
  
  /**
   * 初始化组件
   */
  init() {
    // 注册样式
    this.registerStyle();
    
    // 创建DOM结构
    this.createDOM();
    
    // 绑定事件
    this.bindEvents();
  }
  
  /**
   * 注册组件样式
   */
  registerStyle() {
    const styles = {
      '.word-card': {
        'background': 'var(--bg-primary)',
        'border': '1px solid var(--border-color)',
        'border-radius': 'var(--border-radius-lg)',
        'padding': '16px',
        'margin-bottom': '12px',
        'transition': 'all 0.3s ease',
        'position': 'relative',
        'overflow': 'hidden'
      },
      
      '.word-card:hover': {
        'transform': 'translateY(-2px)',
        'box-shadow': 'var(--shadow-md)',
        'border-color': 'var(--accent-primary)'
      },
      
      '.word-card-header': {
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'flex-start',
        'margin-bottom': '12px'
      },
      
      '.word-card-word': {
        'font-size': 'var(--font-size-xl)',
        'font-weight': 'var(--font-weight-bold)',
        'color': 'var(--text-primary)',
        'margin': '0',
        'display': 'flex',
        'align-items': 'center',
        'gap': '8px'
      },
      
      '.word-card-phonetic': {
        'font-size': 'var(--font-size-md)',
        'color': 'var(--text-secondary)',
        'font-style': 'italic'
      },
      
      '.word-card-actions': {
        'display': 'flex',
        'gap': '8px',
        'flex-shrink': '0'
      },
      
      '.word-card-action-btn': {
        'background': 'none',
        'border': 'none',
        'color': 'var(--text-secondary)',
        'cursor': 'pointer',
        'padding': '4px',
        'border-radius': 'var(--border-radius-sm)',
        'transition': 'all 0.2s ease',
        'font-size': 'var(--font-size-lg)'
      },
      
      '.word-card-action-btn:hover': {
        'background': 'var(--bg-hover)',
        'color': 'var(--text-primary)'
      },
      
      '.word-card-action-btn.starred': {
        'color': 'var(--accent-warning)'
      },
      
      '.word-card-content': {
        'margin-bottom': '12px'
      },
      
      '.word-card-translation': {
        'font-size': 'var(--font-size-md)',
        'color': 'var(--text-primary)',
        'margin-bottom': '8px',
        'line-height': '1.5'
      },
      
      '.word-card-example': {
        'font-size': 'var(--font-size-sm)',
        'color': 'var(--text-secondary)',
        'background': 'var(--bg-secondary)',
        'padding': '8px 12px',
        'border-radius': 'var(--border-radius-md)',
        'margin-bottom': '12px',
        'line-height': '1.5'
      },
      
      '.word-card-footer': {
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'center',
        'font-size': 'var(--font-size-xs)',
        'color': 'var(--text-tertiary)'
      },
      
      '.word-card-category': {
        'background': 'var(--bg-secondary)',
        'padding': '4px 8px',
        'border-radius': 'var(--border-radius-full)',
        'font-weight': 'var(--font-weight-medium)'
      },
      
      '.word-card-date': {
        'font-style': 'italic'
      }
    };
    
    styleManager.registerStyle('word-card', styles);
  }
  
  /**
   * 创建DOM结构
   */
  createDOM() {
    // 使用卡片组件作为基础
    this.card = new Card({
      variant: 'word',
      content: ''
    });
    
    // 创建卡片内容
    const cardContent = document.createElement('div');
    cardContent.className = 'word-card';
    
    // 头部
    const header = document.createElement('div');
    header.className = 'word-card-header';
    
    // 单词和音标
    const wordContainer = document.createElement('div');
    
    const word = document.createElement('h3');
    word.className = 'word-card-word';
    word.textContent = this.props.word;
    
    if (this.props.phonetic) {
      const phonetic = document.createElement('span');
      phonetic.className = 'word-card-phonetic';
      phonetic.textContent = `/${this.props.phonetic}/`;
      word.appendChild(phonetic);
    }
    
    wordContainer.appendChild(word);
    header.appendChild(wordContainer);
    
    // 操作按钮
    const actions = document.createElement('div');
    actions.className = 'word-card-actions';
    
    // 收藏按钮
    const starBtn = document.createElement('button');
    starBtn.className = `word-card-action-btn ${this.state.starred ? 'starred' : ''}`;
    starBtn.innerHTML = this.state.starred ? '⭐' : '☆';
    starBtn.title = this.state.starred ? '取消收藏' : '收藏';
    starBtn.addEventListener('click', () => this.handleStar());
    actions.appendChild(starBtn);
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'word-card-action-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = '删除';
    deleteBtn.addEventListener('click', () => this.handleDelete());
    actions.appendChild(deleteBtn);
    
    header.appendChild(actions);
    cardContent.appendChild(header);
    
    // 内容
    const content = document.createElement('div');
    content.className = 'word-card-content';
    
    // 翻译
    if (this.props.translation) {
      const translation = document.createElement('p');
      translation.className = 'word-card-translation';
      translation.textContent = this.props.translation;
      content.appendChild(translation);
    }
    
    // 例句
    if (this.props.example) {
      const example = document.createElement('blockquote');
      example.className = 'word-card-example';
      example.textContent = this.props.example;
      content.appendChild(example);
    }
    
    cardContent.appendChild(content);
    
    // 底部
    const footer = document.createElement('div');
    footer.className = 'word-card-footer';
    
    // 分类
    if (this.props.category) {
      const category = document.createElement('span');
      category.className = 'word-card-category';
      category.textContent = this.props.category;
      footer.appendChild(category);
    }
    
    // 日期
    const date = document.createElement('span');
    date.className = 'word-card-date';
    date.textContent = this.formatDate(this.props.date);
    footer.appendChild(date);
    
    cardContent.appendChild(footer);
    
    // 将内容添加到卡片中
    const cardElement = this.card.getElement();
    if (cardElement) {
      cardElement.appendChild(cardContent);
    }
    
    this.el = cardElement;
    this.starBtn = starBtn;
  }
  
  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} - 格式化后的日期字符串
   */
  formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  /**
   * 处理收藏事件
   */
  handleStar() {
    const starred = !this.state.starred;
    this.setState({ starred });
    
    if (this.starBtn) {
      this.starBtn.className = `word-card-action-btn ${starred ? 'starred' : ''}`;
      this.starBtn.innerHTML = starred ? '⭐' : '☆';
      this.starBtn.title = starred ? '取消收藏' : '收藏';
    }
    
    if (this.props.onStar) {
      this.props.onStar(starred);
    }
  }
  
  /**
   * 处理删除事件
   */
  handleDelete() {
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 为卡片元素添加点击事件
    if (this.el) {
      this.el.addEventListener('click', (e) => {
        // 如果点击的是操作按钮（星标或删除），不触发抽屉
        if (e.target.closest('.word-card-action-btn')) {
          return;
        }

        // 准备单词数据
        const wordData = {
          text: this.props.word,
          word: this.props.word,
          translation: this.props.translation,
          phonetic: this.props.phonetic,
          type: 'word',
          starred: this.state.starred,
          detailedInfo: null
        };

        // 调用全局抽屉组件显示
        if (window.wordDrawer) {
          window.wordDrawer.show(wordData);
        } else {
          console.warn('WordDrawer not initialized');
        }
      });
    }
  }

  /**
   * 渲染组件
   * @returns {HTMLElement} - 渲染后的组件元素
   */
  render() {
    return this.el;
  }
  
  /**
   * 更新组件
   * @param {Object} newProps - 新的组件属性
   */
  update(newProps) {
    if (newProps) {
      this.props = { ...this.props, ...newProps };
      this.createDOM();
    }
  }
  
  /**
   * 销毁组件
   */
  destroy() {
    this.unbindEvents();
    if (this.card) {
      this.card.destroy();
    }
    super.destroy();
  }
}

// 导出组件
module.exports = WordCard;