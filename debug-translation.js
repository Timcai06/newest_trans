/**
 * 翻译功能调试脚本
 * 用于检查翻译功能是否正常工作
 */

// 检查关键变量是否存在
console.log('=== 翻译功能调试 ===');
console.log('window.highlightManager:', !!window.highlightManager);
console.log('window.handleHighlightClick:', !!window.handleHighlightClick);
console.log('window.translateText:', !!window.translateText);
console.log('window.handleTextSelection:', !!window.handleTextSelection);
console.log('chrome.runtime:', !!chrome.runtime);
console.log('chrome.storage:', !!chrome.storage);

// 检查事件监听器
if (window.eventDelegateManager) {
  console.log('eventDelegateManager 存在');
  console.log('已注册的监听器数量:', window.eventDelegateManager.listeners?.size || 0);
} else {
  console.log('eventDelegateManager 不存在');
}

// 检查模块管理器
if (window.moduleManager) {
  console.log('moduleManager 存在');
  console.log('已注册的模块:', Array.from(window.moduleManager.modules.keys()));
} else {
  console.log('moduleManager 不存在');
}

// 检查高亮管理器状态
if (window.highlightManager) {
  const stats = window.highlightManager.getPerformanceStats();
  console.log('高亮管理器状态:', stats);
}

// 测试翻译功能
async function testTranslation() {
  console.log('\n=== 测试翻译功能 ===');
  
  try {
    if (window.translateText) {
      const result = await window.translateText('hello');
      console.log('翻译测试结果:', result);
    } else {
      console.log('translateText 函数不存在');
    }
  } catch (error) {
    console.error('翻译测试失败:', error);
  }
}

// 测试文本选择
function testTextSelection() {
  console.log('\n=== 测试文本选择 ===');
  
  try {
    const selection = window.getSelection();
    console.log('当前选择:', selection.toString());
    
    if (window.handleTextSelection) {
      window.handleTextSelection();
      console.log('handleTextSelection 调用成功');
    } else {
      console.log('handleTextSelection 函数不存在');
    }
  } catch (error) {
    console.error('文本选择测试失败:', error);
  }
}

// 测试高亮功能
async function testHighlight() {
  console.log('\n=== 测试高亮功能 ===');
  
  try {
    if (window.highlightManager) {
      const testWords = {
        'hello': { translation: '你好', type: 'word', count: 1 },
        'world': { translation: '世界', type: 'word', count: 1 }
      };
      
      await window.highlightManager.highlightTranslatedWords(testWords);
      console.log('高亮测试成功');
    } else {
      console.log('highlightManager 不存在');
    }
  } catch (error) {
    console.error('高亮测试失败:', error);
  }
}

// 添加调试函数到全局
window.debugTranslation = {
  testTranslation,
  testTextSelection,
  testHighlight,
  checkStatus: () => {
    console.log('=== 状态检查 ===');
    console.log('highlightManager:', !!window.highlightManager);
    console.log('translateText:', !!window.translateText);
    console.log('handleTextSelection:', !!window.handleTextSelection);
  }
};

console.log('\n调试函数已加载到 window.debugTranslation');
console.log('使用方法:');
console.log('  window.debugTranslation.testTranslation() - 测试翻译');
console.log('  window.debugTranslation.testTextSelection() - 测试文本选择');
console.log('  window.debugTranslation.testHighlight() - 测试高亮');
console.log('  window.debugTranslation.checkStatus() - 检查状态');

// 自动运行状态检查
setTimeout(() => {
  window.debugTranslation.checkStatus();
}, 2000);
