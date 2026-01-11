/**
 * Dashboard 管理器
 * 负责管理Dashboard的数据和业务逻辑
 */

/**
 * Dashboard 管理器类
 */
class DashboardManager {
    constructor() {
        this.stats = {
            todayLearned: 0,
            masteryLevel: 0,
            toReview: 0,
            streakDays: 0,
            totalWords: 0,
            dailyGoal: 20
        };
        
        this.learningRecords = [];
        this.learningModes = [];
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化Dashboard管理器
     */
    init() {
        // 加载配置
        this.loadConfig();
        
        // 加载数据
        this.loadData();
        
        // 初始化学习模式
        this.initLearningModes();
        
        // 监听数据变化
        this.setupEventListeners();
    }
    
    /**
     * 加载配置
     */
    loadConfig() {
        // 从本地存储加载配置
        const config = localStorage.getItem('dashboardConfig');
        if (config) {
            const parsedConfig = JSON.parse(config);
            this.dailyGoal = parsedConfig.dailyGoal || 20;
        }
    }
    
    /**
     * 保存配置
     */
    saveConfig() {
        const config = {
            dailyGoal: this.dailyGoal
        };
        localStorage.setItem('dashboardConfig', JSON.stringify(config));
    }
    
    /**
     * 加载数据
     */
    loadData() {
        // 加载学习记录
        this.loadLearningRecords();
        
        // 计算统计数据
        this.calculateStats();
    }
    
    /**
     * 加载学习记录
     */
    loadLearningRecords() {
        // 从本地存储加载学习记录
        const records = localStorage.getItem('learningRecords');
        if (records) {
            this.learningRecords = JSON.parse(records);
        } else {
            this.learningRecords = [];
        }
    }
    
    /**
     * 保存学习记录
     */
    saveLearningRecords() {
        localStorage.setItem('learningRecords', JSON.stringify(this.learningRecords));
    }
    
    /**
     * 计算统计数据
     */
    calculateStats() {
        // 计算今日学习单词数
        const today = new Date().toDateString();
        this.stats.todayLearned = this.learningRecords.filter(record => {
            const recordDate = new Date(record.timestamp).toDateString();
            return recordDate === today;
        }).length;
        
        // 计算总学习单词数
        this.stats.totalWords = this.learningRecords.length;
        
        // 计算掌握程度
        const correctRecords = this.learningRecords.filter(record => record.correct).length;
        this.stats.masteryLevel = this.stats.totalWords > 0 
            ? Math.round((correctRecords / this.stats.totalWords) * 100)
            : 0;
        
        // 计算待复习单词数（简单模拟，实际应根据记忆算法）
        this.stats.toReview = Math.max(0, Math.round(this.stats.totalWords * 0.2));
        
        // 计算连续学习天数（简单模拟）
        this.stats.streakDays = this.calculateStreakDays();
    }
    
    /**
     * 计算连续学习天数
     * @returns {number} 连续学习天数
     */
    calculateStreakDays() {
        // 简单模拟，实际应根据真实学习记录计算
        return Math.floor(Math.random() * 30) + 1;
    }
    
    /**
     * 初始化学习模式
     */
    initLearningModes() {
        this.learningModes = [
            {
                id: 'flashcard',
                name: '闪卡模式',
                description: '传统闪卡学习，支持正反翻转',
                icon: '📇',
                enabled: true,
                usageCount: 0
            },
            {
                id: 'quiz',
                name: '测验模式',
                description: '选择题形式，测试单词掌握程度',
                icon: '📝',
                enabled: true,
                usageCount: 0
            },
            {
                id: 'spelling',
                name: '拼写模式',
                description: '听写单词，强化拼写能力',
                icon: '✍️',
                enabled: true,
                usageCount: 0
            },
            {
                id: 'listening',
                name: '听力模式',
                description: '听单词发音，选择正确释义',
                icon: '👂',
                enabled: true,
                usageCount: 0
            }
        ];
    }
    
    /**
     * 获取学习概览数据
     * @returns {Object} 学习概览数据
     */
    getLearningOverview() {
        return this.stats;
    }
    
    /**
     * 获取学习记录
     * @param {Object} filterOptions - 筛选选项
     * @returns {Array} 学习记录数组
     */
    getLearningRecords(filterOptions = {}) {
        let filteredRecords = [...this.learningRecords];
        
        // 应用筛选
        if (filterOptions.dateRange) {
            const { startDate, endDate } = filterOptions.dateRange;
            filteredRecords = filteredRecords.filter(record => {
                const recordDate = new Date(record.timestamp);
                return recordDate >= startDate && recordDate <= endDate;
            });
        }
        
        if (filterOptions.mode) {
            filteredRecords = filteredRecords.filter(record => record.mode === filterOptions.mode);
        }
        
        if (filterOptions.difficulty) {
            filteredRecords = filteredRecords.filter(record => record.difficulty === filterOptions.difficulty);
        }
        
        if (filterOptions.correct !== undefined) {
            filteredRecords = filteredRecords.filter(record => record.correct === filterOptions.correct);
        }
        
        // 排序
        filteredRecords.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        return filteredRecords;
    }
    
    /**
     * 获取学习统计数据
     * @param {string} timeRange - 时间范围 ('today', 'week', 'month', 'year')
     * @returns {Object} 学习统计数据
     */
    getLearningStats(timeRange = 'week') {
        const now = new Date();
        let startDate;
        
        // 计算时间范围
        switch (timeRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        
        // 筛选时间范围内的记录
        const filteredRecords = this.learningRecords.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= startDate;
        });
        
        // 统计数据
        const stats = {
            totalWords: filteredRecords.length,
            correctCount: filteredRecords.filter(r => r.correct).length,
            incorrectCount: filteredRecords.filter(r => !r.correct).length,
            modeUsage: this.calculateModeUsage(filteredRecords),
            dailyStats: this.calculateDailyStats(filteredRecords, timeRange),
            difficultyDistribution: this.calculateDifficultyDistribution(filteredRecords)
        };
        
        return stats;
    }
    
    /**
     * 计算学习模式使用情况
     * @param {Array} records - 学习记录数组
     * @returns {Object} 学习模式使用情况
     */
    calculateModeUsage(records) {
        const modeUsage = {};
        
        // 初始化模式使用计数
        this.learningModes.forEach(mode => {
            modeUsage[mode.id] = 0;
        });
        
        // 统计各模式使用次数
        records.forEach(record => {
            if (modeUsage[record.mode] !== undefined) {
                modeUsage[record.mode]++;
            }
        });
        
        return modeUsage;
    }
    
    /**
     * 计算每日统计数据
     * @param {Array} records - 学习记录数组
     * @param {string} timeRange - 时间范围
     * @returns {Array} 每日统计数据数组
     */
    calculateDailyStats(records, timeRange) {
        const dailyStats = [];
        const now = new Date();
        
        // 根据时间范围确定天数
        const days = timeRange === 'today' ? 1 : 
                    timeRange === 'week' ? 7 :
                    timeRange === 'month' ? 30 : 365;
        
        // 生成日期数组
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            // 统计当天的记录
            const dayRecords = records.filter(record => {
                const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
                return recordDate === dateStr;
            });
            
            dailyStats.push({
                date: dateStr,
                wordsLearned: dayRecords.length,
                correct: dayRecords.filter(r => r.correct).length,
                incorrect: dayRecords.filter(r => !r.correct).length
            });
        }
        
        return dailyStats;
    }
    
    /**
     * 计算难度分布
     * @param {Array} records - 学习记录数组
     * @returns {Object} 难度分布
     */
    calculateDifficultyDistribution(records) {
        const distribution = {
            easy: 0,
            medium: 0,
            hard: 0
        };
        
        records.forEach(record => {
            if (distribution[record.difficulty] !== undefined) {
                distribution[record.difficulty]++;
            }
        });
        
        return distribution;
    }
    
    /**
     * 设置学习目标
     * @param {number} goal - 每日学习目标
     */
    setLearningGoal(goal) {
        this.stats.dailyGoal = goal;
        this.saveConfig();
    }
    
    /**
     * 开始学习模式
     * @param {string} modeId - 学习模式ID
     * @param {Object} options - 学习选项
     */
    startLearningMode(modeId, options = {}) {
        console.log(`开始学习模式: ${modeId}`, options);
        
        // 跳转到学习页面
        window.location.href = `popup.html#learning?mode=${modeId}`;
    }
    
    /**
     * 获取所有学习模式
     * @returns {Array} 学习模式数组
     */
    getLearningModes() {
        return this.learningModes;
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听学习记录变化
        window.addEventListener('learningRecordAdded', (e) => {
            this.learningRecords.push(e.detail.record);
            this.saveLearningRecords();
            this.calculateStats();
        });
        
        // 监听学习记录更新
        window.addEventListener('learningRecordUpdated', (e) => {
            const index = this.learningRecords.findIndex(r => r.id === e.detail.record.id);
            if (index !== -1) {
                this.learningRecords[index] = e.detail.record;
                this.saveLearningRecords();
                this.calculateStats();
            }
        });
    }
    
    /**
     * 导出学习数据
     * @param {string} format - 导出格式 ('json', 'csv')
     * @param {Object} filterOptions - 筛选选项
     * @returns {string} 导出的数据
     */
    exportLearningData(format = 'json', filterOptions = {}) {
        const records = this.getLearningRecords(filterOptions);
        
        if (format === 'csv') {
            return this.exportToCSV(records);
        } else {
            return JSON.stringify(records, null, 2);
        }
    }
    
    /**
     * 导出为CSV格式
     * @param {Array} records - 学习记录数组
     * @returns {string} CSV格式的数据
     */
    exportToCSV(records) {
        if (records.length === 0) return '';
        
        // CSV表头
        const headers = ['ID', '单词', '翻译', '学习时间', '学习模式', '是否正确', '难度', '学习时长(ms)'];
        const csvContent = [
            headers.join(','), // 表头
            ...records.map(record => [
                record.id,
                `"${record.word}"`,
                `"${record.translation}"`,
                record.timestamp,
                record.mode,
                record.correct ? '正确' : '错误',
                record.difficulty,
                record.duration
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// 实例化Dashboard管理器
window.dashboardManager = new DashboardManager();

// 暴露方法到全局
window.getLearningOverview = () => window.dashboardManager.getLearningOverview();
window.getLearningRecords = (filterOptions) => window.dashboardManager.getLearningRecords(filterOptions);
window.getLearningStats = (timeRange) => window.dashboardManager.getLearningStats(timeRange);
window.setLearningGoal = (goal) => window.dashboardManager.setLearningGoal(goal);
window.startLearningMode = (modeId, options) => window.dashboardManager.startLearningMode(modeId, options);
window.getLearningModes = () => window.dashboardManager.getLearningModes();
window.exportLearningData = (format, filterOptions) => window.dashboardManager.exportLearningData(format, filterOptions);