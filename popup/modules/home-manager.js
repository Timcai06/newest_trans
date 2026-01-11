/**
 * 首页功能管理器
 * 负责加载和更新首页内容，包括学习面板、统计数据等
 */

// 加载首页
async function loadHomePage() {
  await loadDataAndBuildIndex();

  // 使用索引快速统计
  const counts = {
    word: wordsIndex.word.length,
    phrase: wordsIndex.phrase.length,
    sentence: wordsIndex.sentence.length,
    starred: wordsIndex.starred.length
  };

  // 更新统计面板
  document.getElementById('totalWords').textContent = wordsIndex.all.length;
  document.getElementById('wordCount').textContent = counts.word;
  document.getElementById('phraseCount').textContent = counts.phrase;
  document.getElementById('sentenceCount').textContent = counts.sentence;
  document.getElementById('starredCount').textContent = counts.starred;

  // 初始化学习面板
  updateLearningPanel();
  
  // 更新学习统计数据
  updateLearningStats();
}

/**
 * 更新学习面板内容
 * 根据当前数据状态显示学习建议或最近学习的单词
 */
async function updateLearningPanel() {
  const learningContent = document.getElementById('learningContent');

  // 如果没有单词数据，显示占位符
  if (wordsIndex.all.length === 0) {
    learningContent.innerHTML = `
      <div class="learning-placeholder">
        <div class="placeholder-icon">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        <div class="placeholder-text">开始翻译一些单词来开始学习吧！</div>
        <div class="placeholder-actions">
          <button class="dashboard-icon-btn" id="dashboardBtn" title="学习Dashboard">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // 为Dashboard按钮添加点击事件
    document.getElementById('dashboardBtn').addEventListener('click', () => {
      showPage('dashboard');
    });
    
    return;
  }

  // 显示学习建议或最近学习的单词
  const recentWords = getRecentWords(5); // 获取最近5个单词

  // 保留学习按钮和统计信息，只更新最近学习的单词部分
  let recentWordsHTML = '';
  if (recentWords.length > 0) {
    recentWordsHTML = `
      <div class="recent-learning">
        <h4>最近学习</h4>
        <div class="recent-words">
          ${recentWords.map(word => `
            <div class="recent-word-item" data-word="${word.key}">
              <span class="recent-word-text">${word.key}</span>
              <span class="recent-word-count">${word.count}次</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 获取每日挑战数据
  let dailyChallengeHTML = '';
  try {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['dailyChallenges']);
    const dailyChallenges = result.dailyChallenges || {};
    const todayChallenge = dailyChallenges[today];
    
    // 计算连续挑战天数
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toDateString();
      if (dailyChallenges[dateStr] && dailyChallenges[dateStr].completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // 构建每日挑战HTML
    dailyChallengeHTML = `
      <div class="daily-challenge-status">
        <h4>📅 每日挑战</h4>
        <div class="challenge-info">
          <div class="challenge-item">
            <span class="challenge-label">今日状态：</span>
            <span class="challenge-value ${todayChallenge ? 'completed' : 'pending'}">
              ${todayChallenge ? '✅ 已完成' : '⏳ 待完成'}
            </span>
          </div>
          <div class="challenge-item">
            <span class="challenge-label">连续挑战：</span>
            <span class="challenge-value streak">🔥 ${streak} 天</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('获取每日挑战数据失败:', error);
  }
  
  // 完整的学习面板HTML，包含学习按钮、统计信息、每日挑战状态和最近学习的单词
  learningContent.innerHTML = `
    <div class="learning-actions">
      <button class="learning-btn" id="startLearningBtn">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
          <path d="M12 15l-3-3a22 22 0 0 1 2-2 11.5 11.5 0 0 0-5.5 5.5l-3-3a22 22 0 0 1 2-2 11.5 11.5 0 0 0-5.5 5.5"></path>
          <path d="M12 15l6-6.5a22 22 0 0 1 2 2 11.5 11.5 0 0 0-5.5 5.5"></path>
          <path d="M12 15l3 3a22 22 0 0 1-2 2 11.5 11.5 0 0 0 5.5-5.5"></path>
        </svg>
        开始学习
      </button>
      <button class="learning-btn" id="reviewDifficultBtn">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
        复习难点
      </button>
      <button class="learning-btn" id="dailyChallengeBtn">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        每日挑战
      </button>
    </div>
    <div class="learning-stats-container">
      <!-- 今日学习 - 进度条设计 -->
      <div class="learning-stat-card">
        <div class="learning-stat-header">
          <div class="learning-stat-icon">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="learning-stat-title">今日学习</div>
        </div>
        <div class="learning-stat-content">
          <div class="stat-value" id="todayLearned">0</div>
          <div class="stat-unit">个单词</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="todayProgressBar"></div>
          </div>
          <div class="progress-text" id="todayProgressText">0/20</div>
        </div>
      </div>
      
      <!-- 掌握程度 - 环形进度条设计 -->
      <div class="learning-stat-card">
        <div class="learning-stat-header">
          <div class="learning-stat-icon">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="learning-stat-title">掌握程度</div>
        </div>
        <div class="learning-stat-content">
          <div class="circular-progress-container">
            <div class="circular-progress" id="masteryProgressCircle">
              <div class="circular-progress-text" id="masteryLevel">0%</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 待复习 - 垂直进度条设计 -->
      <div class="learning-stat-card">
        <div class="learning-stat-header">
          <div class="learning-stat-icon">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="learning-stat-title">待复习</div>
        </div>
        <div class="learning-stat-content">
          <div class="vertical-progress-container">
            <div class="vertical-progress-bar" id="reviewProgressBar"></div>
            <div class="vertical-progress-text" id="toReview">0</div>
          </div>
        </div>
      </div>
    </div>
    ${dailyChallengeHTML}
    ${recentWordsHTML}
  `;

  // 为学习按钮重新添加事件监听器
  document.getElementById('startLearningBtn').addEventListener('click', () => {
    pendingLearningFilter = 'all';
    showPage('modeSelection');
  });

  document.getElementById('reviewDifficultBtn').addEventListener('click', () => {
    pendingLearningFilter = 'difficult';
    showPage('modeSelection');
  });

  document.getElementById('dailyChallengeBtn').addEventListener('click', () => {
    // 每日挑战直接进入拼写模式
    learningManager.startLearningSession('spelling', 'daily');
  });

  // 为header中的Dashboard按钮添加事件监听器
  document.getElementById('dashboardBtn').addEventListener('click', () => {
    showPage('dashboard');
  });

  // 为最近学习的单词添加点击事件
  document.querySelectorAll('.recent-word-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const wordKey = e.currentTarget.dataset.word;
      showWordDetail(wordKey);
    });
  });
}



/**
 * 获取最近学习的单词
 * @param {number} limit - 返回的单词数量限制
 * @returns {Array} 最近学习的单词数组
 */
function getRecentWords(limit) {
  // 从所有单词中按最后使用时间排序，取最新的limit个
  const allWords = Object.values(wordsData);
  return allWords
    .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    .slice(0, limit)
    .map(word => ({
      key: word.word, // 使用word.word而不是word.key
      count: word.count,
      lastUsed: word.lastUsed
    }));
}

/**
 * 显示单词详情
 * @param {string} wordKey - 单词键
 */
function showWordDetail(wordKey) {
  // 这里可以实现显示单词详情的逻辑
  // 暂时跳转到对应的单词列表页面
  const wordData = wordsData[wordKey];
  if (wordData) {
    // 根据单词类型跳转到对应页面
    let filterType = 'word'; // 默认单词
    if (wordData.key.includes(' ')) {
      if (wordData.key.split(' ').length > 3) {
        filterType = 'sentence';
      } else {
        filterType = 'phrase';
      }
    }
    showPage(filterType);
  }
}

// 将函数挂载到window对象，以便在其他文件中使用
window.loadHomePage = loadHomePage;
window.updateLearningPanel = updateLearningPanel;
window.getRecentWords = getRecentWords;
window.showWordDetail = showWordDetail;
