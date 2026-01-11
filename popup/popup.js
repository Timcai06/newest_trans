/**
 * 单词翻译助手 - 弹出页面主脚本
 * 仅包含必要的全局状态和初始化代码
 */

// ====================
// 全局状态管理
// ====================

// 当前激活的过滤器类型
window.currentFilter = 'all';
// 待处理的学习过滤器（用于模式选择）
window.pendingLearningFilter = 'all';

// ====================
// 学习模式功能
// ====================

// 创建学习管理器实例
const learningManager = new LearningManager();

// ====================
// 新组件初始化
// ====================

/**
 * 初始化UI组件
 * 在DOM加载完成后执行，确保所有依赖都已加载
 */
function initializeComponents() {
  // 确保 currentFilterState 存在，如果不存在则使用默认值
  if (!window.currentFilterState) {
    window.currentFilterState = {
      view: 'grid',
      sort: 'count',
      letter: 'all',
      pos: []
    };
  }

  // 初始化筛选面板组件
  window.filterPanel = new FilterPanel({
    containerId: 'wordListPage', // 将面板添加到单词列表页面
    initialFilters: {
      view: window.currentFilterState.view,
      sort: window.currentFilterState.sort,
      letter: window.currentFilterState.letter,
      pos: window.currentFilterState.pos
    },
    onApply: (filters) => {
      console.log('应用筛选条件:', filters);

      // 更新全局筛选状态
      window.currentFilterState = { ...filters };

      // 更新视图模式
      window.currentViewMode = filters.view;

      // 重新加载当前页面数据（应用排序、字母、词性筛选）
      if (window.currentPage === 'wordList') {
        const searchTerm = document.getElementById('searchInput').value;
        window.currentPageIndex = 0;
        window.currentPageData = getFilteredData(window.currentFilter, searchTerm);

        // 应用字母筛选
        if (filters.letter !== 'all') {
          window.currentPageData = window.currentPageData.filter(item => {
            const firstChar = item.key.charAt(0).toLowerCase();
            if (filters.letter === 'number') {
              return /[0-9]/.test(firstChar);
            }
            return firstChar === filters.letter;
          });
        }

        // 应用词性筛选
        if (filters.pos.length > 0) {
          window.currentPageData = window.currentPageData.filter(item => {
            // 检查单词的词性是否在筛选列表中
            return filters.pos.some(pos => {
              if (item.detailedInfo && item.detailedInfo.definitions) {
                return item.detailedInfo.definitions.some(def =>
                  def.pos && def.pos.toLowerCase().includes(pos)
                );
              }
              return false;
            });
          });
        }

        // 应用排序
        sortData(window.currentPageData, filters.sort);

        // 显示结果
        displayWords(window.currentPageData, 0, window.PAGE_SIZE);
        updatePageStats(window.currentPageData.length);
      }
    }
  });

  // 初始化单词抽屉组件
  window.wordDrawer = new WordDrawer({
    containerId: 'wordListPage', // 将抽屉添加到单词列表页面
    onClose: () => {
      console.log('抽屉已关闭');
    }
  });

  console.log('UI组件初始化完成');
}

// 在DOM加载完成后初始化组件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  // 如果DOM已经加载完成，立即初始化
  initializeComponents();
}

// 监听抽屉的自定义事件
document.addEventListener('wordDrawerStar', async (e) => {
  const { word } = e.detail;
  console.log('抽屉中点击星标:', word);

  // 切换星标状态（这个函数在word-list-manager.js中定义）
  if (typeof toggleStar === 'function') {
    await toggleStar(word.text || word.word);
    // 重新加载数据
    await loadDataAndBuildIndex();
    if (window.currentPage === 'home') {
      loadHomePage();
    } else {
      loadWordListPage(window.currentFilter);
    }
  }
});

document.addEventListener('wordDrawerAddToReview', (e) => {
  const { word } = e.detail;
  console.log('添加到复习列表:', word);
  // TODO: 实现添加到复习列表的逻辑
});

document.addEventListener('wordDrawerWordClick', (e) => {
  const { word } = e.detail;
  console.log('点击同义词/反义词/同根词:', word);
  // TODO: 实现查询并显示该单词的详细信息
});

// ====================
// 筛选按钮事件监听
// ====================

// 绑定筛选按钮事件
function bindFilterButton() {
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      if (window.filterPanel) {
        window.filterPanel.show();
      } else {
        console.error('FilterPanel未初始化');
      }
    });
    console.log('筛选按钮事件已绑定');
  } else {
    console.warn('找不到筛选按钮元素');
  }
}

// 确保在DOM加载完成后绑定事件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindFilterButton);
} else {
  // DOM已经加载完成，直接绑定
  bindFilterButton();
}

