/**
 * 视图模式管理模块
 * 处理不同视图模式（网格、列表等）的切换和更新
 */

// 当前视图模式状态
window.currentViewMode = 'grid'; // 默认网格视图

/**
 * 初始化视图控制
 */
window.initViewControls = function initViewControls() {
  // 从存储加载视图模式
  chrome.storage.local.get(['viewMode'], (result) => {
    window.currentViewMode = result.viewMode || 'grid';
    window.updateViewMode(window.currentViewMode);
  });

  // 添加视图切换事件监听器
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const viewMode = e.target.closest('.view-btn').dataset.view;
      window.currentViewMode = viewMode;
      // 保存视图模式
      chrome.storage.local.set({ viewMode });
      window.updateViewMode(viewMode);
      // 重新加载单词列表
      loadWordListPage(currentFilter);
    });
  });
}

/**
 * 更新视图模式
 * @param {string} viewMode - 要设置的视图模式
 */
window.updateViewMode = function updateViewMode(viewMode) {
  // 更新视图控制按钮的激活状态
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewMode}"]`).classList.add('active');

  // 更新单词列表的视图类
  const wordList = document.getElementById('wordList');
  if (wordList) {
    wordList.className = `word-list ${viewMode}`;
  }
}
