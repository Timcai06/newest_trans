/**
 * 单词列表管理器
 * 负责单词列表的加载、显示、排序和管理
 */

// 当前页面的数据
window.currentPageData = [];
// 当前页码索引
window.currentPageIndex = 0;
// 每页显示的项目数量
window.PAGE_SIZE = 50; // 每页显示50个项目
// 当前筛选器状态（由 FilterPanel 管理）
window.currentFilterState = {
  view: 'grid',
  sort: 'count',
  letter: 'all',
  pos: []
};

/**
 * 加载单词列表页面
 * @param {string} filter - 过滤器类型
 */
window.loadWordListPage = async function(filter) {
  await loadDataAndBuildIndex();

  // 设置页面标题和相关信息
  const pageInfo = getPageInfo(filter);
  document.getElementById('pageTitle').textContent = pageInfo.title;

  // 更新搜索框placeholder
  document.getElementById('searchInput').placeholder = pageInfo.searchPlaceholder;

  const searchTerm = document.getElementById('searchInput').value;
  const sortBy = window.currentFilterState.sort; // 从全局筛选状态获取

  // 重置分页
  currentPageIndex = 0;
  currentPageData = getFilteredData(filter, searchTerm);

  // 应用排序
  sortData(currentPageData, sortBy);

  displayWords(currentPageData, 0, PAGE_SIZE);
  updatePageStats(currentPageData.length, pageInfo.unit);
};

/**
 * 获取页面信息
 * @param {string} filter - 过滤器类型
 * @returns {Object} 页面信息对象
 */
function getPageInfo(filter) {
  const pageInfos = {
    word: {
      title: '单词',
      searchPlaceholder: '搜索单词...',
      unit: '个单词'
    },
    phrase: {
      title: '词组',
      searchPlaceholder: '搜索词组...',
      unit: '个词组'
    },
    sentence: {
      title: '句子',
      searchPlaceholder: '搜索句子...',
      unit: '个句子'
    },
    starred: {
      title: '星标单词',
      searchPlaceholder: '搜索星标单词...',
      unit: '个星标单词'
    }
  };

  return pageInfos[filter] || {
    title: '翻译记录',
    searchPlaceholder: '搜索...',
  };
}

/**
 * 排序数据
 * @param {Array} data - 要排序的数据数组
 * @param {string} sortBy - 排序方式
 */
function sortData(data, sortBy) {
  const sortFunction = (a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'lastUsed':
        return new Date(b.lastUsed) - new Date(a.lastUsed);
      case 'word':
        return a.key.localeCompare(b.key);
      default:
        return 0;
    }
  };

  data.sort(sortFunction);
}

/**
 * 更新页面统计
 * @param {number} totalCount - 总数量
 * @param {string} unit - 单位
 */
function updatePageStats(totalCount, unit = '个') {
  document.getElementById('pageStats').textContent = `${totalCount} ${unit}`;
}

/**
 * 显示单词列表
 * @param {Array} data - 要显示的数据
 * @param {number} startIndex - 开始索引
 * @param {number} pageSize - 每页大小
 */
function displayWords(data, startIndex = 0, pageSize = PAGE_SIZE) {
  const wordList = document.getElementById('wordList');

  // 设置当前视图模式
  wordList.className = `word-list ${currentViewMode}`;

  // 清空列表
  wordList.innerHTML = '';

  if (data.length === 0) {
    wordList.innerHTML = '<div class="empty-state">暂无翻译记录</div>';
    return;
  }

  // 直接渲染所有数据，确保所有内容可访问
  // 使用文档片段优化DOM操作
  const fragment = document.createDocumentFragment();
  
  // 渲染所有数据项
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const wordItem = createWordItem(item, i === data.length - 1);
    wordItem.setAttribute('data-index', i);
    wordItem.setAttribute('draggable', 'true'); // 添加拖拽支持
    fragment.appendChild(wordItem);
  }

  // 一次性添加所有元素，减少回流
  wordList.appendChild(fragment);

  // 添加单词项事件委托支持（包含所有事件处理）
  addWordItemEventListeners(wordList);
  
  // 添加拖拽排序支持
  addDragAndDropSupport(wordList, data);
  
  console.log('显示单词列表:', {
    totalItems: data.length,
    containerHeight: wordList.clientHeight,
    scrollHeight: wordList.scrollHeight
  });
}

/**
 * 创建单词项
 * @param {Object} item - 单词数据
 * @param {boolean} isLast - 是否为最后一项
 * @returns {HTMLElement} 单词项元素
 */
function createWordItem(item, isLast = false) {
  const wordItem = document.createElement('div');
  wordItem.className = 'word-item';
  wordItem.setAttribute('role', 'article');
  wordItem.setAttribute('tabindex', '0');

  if (isLast) {
    wordItem.classList.add('last-item');
  }

  const firstUsed = new Date(item.firstUsed).toLocaleString('zh-CN');
  const lastUsed = new Date(item.lastUsed).toLocaleString('zh-CN');

  // 获取类型标签
  const itemType = item.type || 'word';
  const typeLabel = itemType === 'word' ? '单词' : itemType === 'phrase' ? '词组' : '句子';
  const typeClass = itemType === 'word' ? 'type-word' : itemType === 'phrase' ? 'type-phrase' : 'type-sentence';

  // 星标状态
  const isStarred = item.starred || false;
  const starClass = isStarred ? 'starred' : '';

  // 存储单词数据到元素上，方便事件委托使用
  wordItem.dataset.word = escapeHtml(item.key);
  wordItem.dataset.item = JSON.stringify(item);

  // 处理可能存储为对象的翻译数据
  let translationText = item.translation;
  if (typeof translationText === 'object' && translationText !== null) {
    translationText = translationText.translation || '';
  }

  wordItem.innerHTML = `
    <div class="word-border"></div>
    <div class="word-header">
      <div class="word-title-row">
        <button class="star-btn ${starClass}" data-word="${escapeHtml(item.key)}">
          <span class="star-icon">⭐</span>
        </button>
        <span class="word-text">${escapeHtml(item.key)}</span>
        <span class="word-type ${typeClass}">${typeLabel}</span>
      </div>
      <span class="word-count">使用 ${item.count} 次</span>
    </div>
    <div class="translation-text">${escapeHtml(translationText)}</div>
    <div class="word-meta">
      <span class="first-used">首次: ${firstUsed}</span>
      <span class="last-used">最近: ${lastUsed}</span>
      <button class="delete-btn" data-word="${escapeHtml(item.key)}">删除</button>
    </div>
  `;

  return wordItem;
}

/**
 * 添加单词项事件委托支持
 * @param {HTMLElement} container - 容器元素
 */
function addWordItemEventListeners(container) {
  // 统一事件处理函数
  container.addEventListener('click', async (e) => {
    const target = e.target;
    const wordItem = target.closest('.word-item');

    if (!wordItem) return;

    // 解析单词数据
    const item = JSON.parse(wordItem.dataset.item);

    // 星标按钮点击处理
    if (target.closest('.star-btn')) {
      e.stopPropagation();

      // 添加点击动画
      const starBtn = target.closest('.star-btn');
      starBtn.style.transform = 'scale(0.8)';
      setTimeout(() => {
        starBtn.style.transform = '';
      }, 150);

      await toggleStar(item.key);
      // 重新加载当前页面数据
      await loadDataAndBuildIndex();
      if (currentPage === 'home') {
        loadHomePage();
      } else {
        loadWordListPage(currentFilter);
      }
      return;
    }

    // 删除按钮点击处理
    if (target.closest('.delete-btn')) {
      e.stopPropagation();

      // 替换为更现代的确认方式
      if (confirm(`确定要删除 "${item.key}" 吗？`)) {
        // 添加删除动画
        wordItem.style.transform = 'translateX(-100%)';
        wordItem.style.opacity = '0';

        await deleteWord(item.key);
        // 重新加载当前页面数据
        await loadDataAndBuildIndex();
        if (currentPage === 'home') {
          loadHomePage();
        } else {
          loadWordListPage(currentFilter);
        }
      }
      return;
    }

    // 点击单词项本身，打开抽屉显示详细信息
    // 检查是否有全局的 wordDrawer 实例
    if (window.wordDrawer) {
      // 准备单词数据，确保格式正确
      const wordData = {
        text: item.key,
        word: item.key,
        translation: typeof item.translation === 'object' ? item.translation.translation : item.translation,
        phonetic: item.phonetic || '',
        type: item.type || 'word',
        count: item.count,
        firstUsed: item.firstUsed,
        lastUsed: item.lastUsed,
        starred: item.starred || false,
        detailedInfo: item.detailedInfo || null
      };

      // 显示抽屉
      window.wordDrawer.show(wordData);
    } else {
      console.warn('WordDrawer not initialized');
    }
  });
}

/**
 * 切换星标
 * @param {string} word - 单词
 */
async function toggleStar(word) {
  const wordLower = word.toLowerCase();

  // 直接从本地存储加载最新数据，确保操作的是最新版本
  const result = await chrome.storage.local.get(['translatedWords']);
  const words = result.translatedWords || {};

  if (words[wordLower]) {
    // 更新星标状态
    words[wordLower].starred = !words[wordLower].starred;
    await chrome.storage.local.set({ translatedWords: words });

    // 更新全局wordsData对象，确保一致性
    wordsData = words;

    // 重新构建索引并清空搜索缓存
    buildIndex();
    searchCache.clear();
  }
}

/**
 * 删除单词
 * @param {string} word - 单词
 */
async function deleteWord(word) {
  const wordLower = word.toLowerCase();

  // 直接从本地存储加载最新数据
  const result = await chrome.storage.local.get(['translatedWords', 'learningProgress']);
  const words = result.translatedWords || {};
  const progress = result.learningProgress || {};

  if (words[wordLower]) {
    // 从words中删除
    delete words[wordLower];
    
    // 从learningProgress中删除对应记录
    if (progress[wordLower]) {
      delete progress[wordLower];
      await chrome.storage.local.set({ learningProgress: progress });
    }
    
    // 更新存储
    await chrome.storage.local.set({ translatedWords: words });
    
    // 更新全局wordsData对象，确保一致性
    wordsData = words;
    
    // 重新构建索引并清空搜索缓存
    buildIndex();
    searchCache.clear();
  }
}

/**
 * 清空所有记录
 */
async function clearAllWords() {
  if (confirm('确定要清空所有翻译记录吗？此操作不可恢复！')) {
    await chrome.storage.local.remove(['translatedWords']);
    
    // 更新全局wordsData对象
    wordsData = {};
    
    // 重新构建索引
    buildIndex();
    searchCache.clear();
    
    // 刷新当前页面
    if (currentPage === 'home') {
      loadHomePage();
    } else {
      loadWordListPage(currentFilter);
    }
  }
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 添加拖拽排序支持
 * @param {HTMLElement} container - 容器元素
 * @param {Array} data - 数据数组
 */
function addDragAndDropSupport(container, data) {
  let draggedItem = null;
  let dragStartIndex = -1;

  // 使用事件委托，减少事件监听器数量
  container.addEventListener('dragstart', (e) => {
    if (e.target.closest('.word-item')) {
      draggedItem = e.target.closest('.word-item');
      dragStartIndex = parseInt(draggedItem.getAttribute('data-index'));
      draggedItem.style.opacity = '0.5';
      draggedItem.style.zIndex = '1000';
      draggedItem.classList.add('dragging');
    }
  });

  container.addEventListener('dragend', (e) => {
    if (draggedItem) {
      draggedItem.style.opacity = '';
      draggedItem.style.zIndex = '';
      draggedItem.classList.remove('dragging');
      draggedItem = null;
      dragStartIndex = -1;
    }
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedItem) return;
    
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null || afterElement === draggedItem) {
      container.appendChild(draggedItem);
    } else {
      container.insertBefore(draggedItem, afterElement);
    }
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedItem || dragStartIndex === -1) return;
    
    // 更新数据顺序
    const items = Array.from(container.querySelectorAll('.word-item'));
    const dragEndIndex = items.indexOf(draggedItem);
    
    // 只在顺序实际改变时更新数据
    if (dragStartIndex !== dragEndIndex) {
      // 创建新的数据数组，保持原有引用
      const newData = [...data];
      const [removed] = newData.splice(dragStartIndex, 1);
      newData.splice(dragEndIndex, 0, removed);
      
      // 重新渲染列表
      const startIndex = parseInt(container.getAttribute('data-start-index'));
      displayWords(newData, startIndex, PAGE_SIZE);
    }
  });

  // 辅助函数：找到拖拽元素应该插入到哪个元素后面
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.word-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}
