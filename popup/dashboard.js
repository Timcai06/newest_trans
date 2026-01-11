/**
 * Dashboard 主逻辑文件
 * 处理Dashboard页面的初始化和交互逻辑
 */

/**
 * 初始化Dashboard页面
 */
function initDashboard() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 强制应用深色主题，无论全局主题是什么
    document.body.classList.add('theme-dark');
    
    // 加载学习概览数据
    loadLearningOverview();
    
    // 初始化学习模式选择器
    initLearningModeSelector();
    
    // 初始化学习目标设置组件
    initGoalSetting();
    
    // 初始化路由
    initRouter();
    
    // 初始化全局主题管理器，但确保不会覆盖深色主题
    if (window.themeManager) {
        window.themeManager.init();
        // 确保主题管理器初始化后仍然保持深色主题
        document.body.classList.add('theme-dark');
    }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
    // 侧边栏切换按钮
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', window.toggleSidebar);
    }
    
    // 返回首页按钮
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', window.goHome);
    }
    
    // 导航链接点击事件
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            window.switchDashboardSection(sectionId);
        });
    });
    
    // 内容区域点击事件（移动端关闭侧边栏）
    const mainContent = document.getElementById('dashboard-main');
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            const sidebar = document.getElementById('dashboard-sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    // 监听主题变化事件，确保始终保持深色主题
    document.addEventListener('themeChanged', function() {
        document.body.classList.add('theme-dark');
    });
}



/**
 * 创建单词学习趋势图
 * @returns {HTMLElement} - 图表容器元素
 */
function createWordTrendChart() {
    // 模拟最近7天的学习数据
    const chartData = [
        { label: '周一', value: 12 },
        { label: '周二', value: 18 },
        { label: '周三', value: 15 },
        { label: '周四', value: 22 },
        { label: '周五', value: 19 },
        { label: '周六', value: 25 },
        { label: '周日', value: 15 }
    ];
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = '200px';
    chartContainer.style.opacity = '0';
    chartContainer.style.transition = 'opacity 0.8s ease-out';
    
    // 检查是否支持动态导入
    if (typeof window.LineChart !== 'undefined') {
        // 使用已加载的LineChart组件
        const lineChart = new window.LineChart({
            width: 400,
            height: 200,
            title: '',
            data: chartData,
            options: {
                lineColor: '#667eea',
                pointColor: '#667eea',
                areaColor: 'rgba(102, 126, 234, 0.1)',
                gridColor: 'rgba(255, 255, 255, 0.1)',
                labelColor: 'rgba(255, 255, 255, 0.6)',
                showArea: true,
                showGrid: true,
                showPoints: true,
                smooth: true
            }
        });
        
        const chartElement = lineChart.getElement();
        chartContainer.appendChild(chartElement);
    } else {
        // 回退到原始的Canvas绘制
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        chartContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置样式
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        // 计算最大值
        const maxCount = Math.max(...chartData.map(item => item.value));
        const yStep = chartHeight / maxCount;
        const xStep = chartWidth / (chartData.length - 1);
        
        // 绘制背景网格（深色主题样式）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 水平线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // 绘制Y轴标签（深色主题样式）
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(maxCount - (maxCount / 5) * i), padding - 10, y);
        }
        
        // 绘制数据点和连线 - 使用动画效果
        const animateChart = () => {
            // 绘制渐变连线
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            chartData.forEach((item, index) => {
                const x = padding + xStep * index;
                const y = padding + chartHeight - (item.value * yStep);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // 绘制数据点，带有弹跳效果
            chartData.forEach((item, index) => {
                const x = padding + xStep * index;
                const y = padding + chartHeight - (item.value * yStep);
                
                // 添加延迟动画效果
                setTimeout(() => {
                    // 绘制点的光晕效果
                    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // 绘制数据点
                    ctx.fillStyle = '#667eea';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                }, 500 + index * 100);
            });
        };
        
        // 执行动画
        animateChart();
        
        // 绘制X轴标签（深色主题样式）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        chartData.forEach((item, index) => {
            const x = padding + xStep * index;
            ctx.fillText(item.label, x, canvas.height - padding + 10);
        });
    }
    
    // 延迟显示图表，让其他内容先加载
    setTimeout(() => {
        chartContainer.style.opacity = '1';
    }, 300);
    
    return chartContainer;
}

/**
 * 创建单词分布饼图
 * @returns {HTMLElement} - 图表容器元素
 */
function createWordDistributionChart() {
    // 模拟单词难度分布数据
    const chartData = [
        { label: '简单', value: 35 },
        { label: '中等', value: 45 },
        { label: '困难', value: 20 }
    ];
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = '200px';
    chartContainer.style.opacity = '0';
    chartContainer.style.transition = 'opacity 0.8s ease-out';
    
    // 检查是否支持PieChart组件
    if (typeof window.PieChart !== 'undefined') {
        // 使用已加载的PieChart组件
        const pieChart = new window.PieChart({
            width: 400,
            height: 200,
            title: '',
            data: chartData,
            options: {
                colors: ['#10b981', '#3b82f6', '#ef4444'],
                showLabels: true,
                showLegend: true,
                radius: '70%',
                innerRadius: 0,
                labelColor: 'rgba(255, 255, 255, 0.6)',
                hoverOffset: 10
            }
        });
        
        const chartElement = pieChart.getElement();
        chartContainer.appendChild(chartElement);
    } else {
        // 回退到原始的Canvas绘制
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        chartContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置样式
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;
        const colors = ['#10b981', '#3b82f6', '#ef4444'];
        
        // 计算总数值
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2;
        
        // 绘制饼图
        chartData.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const color = colors[index];
            
            // 绘制扇形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // 绘制边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 更新当前角度
            currentAngle += sliceAngle;
        });
        
        // 绘制标签
        currentAngle = -Math.PI / 2;
        chartData.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const middleAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius + 20;
            const labelX = centerX + Math.cos(middleAngle) * labelRadius;
            const labelY = centerY + Math.sin(middleAngle) * labelRadius;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, labelX, labelY);
            
            // 绘制数值
            ctx.font = '10px sans-serif';
            ctx.fillText(item.value, labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
    }
    
    // 延迟显示图表，让其他内容先加载
    setTimeout(() => {
        chartContainer.style.opacity = '1';
    }, 300);
    
    return chartContainer;
}

/**
 * 加载学习概览数据
 */
function loadLearningOverview() {
    // 模拟数据加载
    const mockStats = {
        todayLearned: 15,
        masteryLevel: 85,
        toReview: 20,
        streakDays: 7,
        totalWords: 500,
        dailyGoal: 20
    };
    
    // 渲染统计卡片
    renderStatsCards(mockStats);
    
    // 渲染图表
    renderCharts();
}

/**
 * 创建学习模式柱状图
 * @returns {HTMLElement} - 图表容器元素
 */
function createLearningModeChart() {
    // 模拟学习模式数据
    const chartData = [
        { label: '闪卡', value: 45 },
        { label: '测验', value: 30 },
        { label: '拼写', value: 20 },
        { label: '听力', value: 5 }
    ];
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = '200px';
    chartContainer.style.opacity = '0';
    chartContainer.style.transition = 'opacity 0.8s ease-out';
    
    // 检查是否支持动态导入
    if (typeof window.BarChart !== 'undefined') {
        // 使用已加载的BarChart组件
        const barChart = new window.BarChart({
            width: 400,
            height: 200,
            title: '',
            data: chartData,
            options: {
                barColor: '#4facfe',
                barWidth: 0.6,
                gridColor: 'rgba(255, 255, 255, 0.1)',
                labelColor: 'rgba(255, 255, 255, 0.6)',
                showGrid: true,
                showValues: true
            }
        });
        
        const chartElement = barChart.getElement();
        chartContainer.appendChild(chartElement);
    } else {
        // 回退到原始的Canvas绘制
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        chartContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置样式
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        // 计算最大值
        const maxCount = Math.max(...chartData.map(item => item.value));
        const yStep = chartHeight / maxCount;
        const barWidth = chartWidth / chartData.length * 0.6;
        const gap = chartWidth / chartData.length * 0.2;
        
        // 绘制背景网格
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 绘制水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // 绘制柱状图
        ctx.fillStyle = '#4facfe';
        chartData.forEach((item, index) => {
            const x = padding + gap + index * (barWidth + gap * 2);
            const barHeight = item.value * yStep;
            const y = padding + chartHeight - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // 绘制数值
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(item.value, x + barWidth / 2, y - 5);
            
            // 重置填充颜色
            ctx.fillStyle = '#4facfe';
        });
        
        // 绘制X轴标签
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        chartData.forEach((item, index) => {
            const x = padding + gap + index * (barWidth + gap * 2) + barWidth / 2;
            ctx.fillText(item.label, x, padding + chartHeight + 10);
        });
    }
    
    // 延迟显示图表，让其他内容先加载
    setTimeout(() => {
        chartContainer.style.opacity = '1';
    }, 300);
    
    return chartContainer;
}

/**
 * 创建学习技能雷达图
 * @returns {HTMLElement} - 图表容器元素
 */
function createLearningSkillsChart() {
    // 模拟学习技能数据
    const chartData = [
        { label: '记忆', value: 85 },
        { label: '拼写', value: 70 },
        { label: '听力', value: 65 },
        { label: '阅读', value: 80 },
        { label: '口语', value: 55 }
    ];
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = '200px';
    chartContainer.style.opacity = '0';
    chartContainer.style.transition = 'opacity 0.8s ease-out';
    
    // 检查是否支持动态导入
    if (typeof window.RadarChart !== 'undefined') {
        // 使用已加载的RadarChart组件
        const radarChart = new window.RadarChart({
            width: 400,
            height: 200,
            title: '',
            data: chartData,
            options: {
                colors: ['#f093fb'],
                showGrid: true,
                showAxes: true,
                showLabels: true,
                fillOpacity: 0.2,
                lineWidth: 2,
                pointSize: 4
            }
        });
        
        const chartElement = radarChart.getElement();
        chartContainer.appendChild(chartElement);
    } else {
        // 回退到原始的Canvas绘制
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        chartContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置样式
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        const data = chartData;
        const categories = data.map(item => item.label);
        const values = data.map(item => item.value);
        const angleStep = 2 * Math.PI / categories.length;
        
        // 计算最大值
        const maxValue = Math.max(...values) || 100;
        
        // 绘制网格
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 绘制同心圆环
        for (let i = 1; i <= 5; i++) {
            const ringRadius = (i / 5) * radius;
            
            ctx.beginPath();
            ctx.moveTo(
                centerX + ringRadius * Math.cos(-Math.PI / 2),
                centerY + ringRadius * Math.sin(-Math.PI / 2)
            );
            
            for (let j = 1; j < categories.length; j++) {
                const angle = -Math.PI / 2 + j * angleStep;
                ctx.lineTo(
                    centerX + ringRadius * Math.cos(angle),
                    centerY + ringRadius * Math.sin(angle)
                );
            }
            
            ctx.closePath();
            ctx.stroke();
        }
        
        // 绘制坐标轴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < categories.length; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle)
            );
            ctx.stroke();
        }
        
        // 绘制数据
        ctx.beginPath();
        
        // 移动到第一个点
        const firstAngle = -Math.PI / 2;
        const firstRadius = (values[0] / maxValue) * radius;
        ctx.moveTo(
            centerX + firstRadius * Math.cos(firstAngle),
            centerY + firstRadius * Math.sin(firstAngle)
        );
        
        // 绘制线条
        for (let i = 1; i < values.length; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            const dataRadius = (values[i] / maxValue) * radius;
            ctx.lineTo(
                centerX + dataRadius * Math.cos(angle),
                centerY + dataRadius * Math.sin(angle)
            );
        }
        
        // 关闭路径
        ctx.closePath();
        
        // 填充区域
        ctx.fillStyle = 'rgba(240, 147, 251, 0.2)';
        ctx.fill();
        
        // 绘制线条
        ctx.strokeStyle = '#f093fb';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制数据点
        for (let i = 0; i < values.length; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            const dataRadius = (values[i] / maxValue) * radius;
            const x = centerX + dataRadius * Math.cos(angle);
            const y = centerY + dataRadius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#f093fb';
            ctx.fill();
        }
        
        // 绘制标签
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < categories.length; i++) {
            const angle = -Math.PI / 2 + i * angleStep;
            const labelRadius = radius * 1.1;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            ctx.fillText(categories[i], x, y);
        }
    }
    
    // 延迟显示图表，让其他内容先加载
    setTimeout(() => {
        chartContainer.style.opacity = '1';
    }, 300);
    
    return chartContainer;
}

/**
 * 渲染图表
 */
function renderCharts() {
    const chartsGrid = document.querySelector('.charts-grid');
    if (!chartsGrid) return;
    
    // 清空现有内容
    chartsGrid.innerHTML = '';
    
    // 创建趋势图卡片
    const trendCard = document.createElement('div');
    trendCard.className = 'stat-card';
    trendCard.style.gridColumn = 'span 1';
    trendCard.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">单词学习趋势</h3>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            ${createWordTrendChart().outerHTML}
        </div>
        <div style="font-size: 12px; color: var(--text-tertiary); text-align: center; margin-top: 12px;">
            最近7天的学习单词数变化
        </div>
    `;
    
    chartsGrid.appendChild(trendCard);
    
    // 创建分布饼图卡片
    const distributionCard = document.createElement('div');
    distributionCard.className = 'stat-card';
    distributionCard.style.gridColumn = 'span 1';
    distributionCard.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">单词难度分布</h3>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            ${createWordDistributionChart().outerHTML}
        </div>
        <div style="font-size: 12px; color: var(--text-tertiary); text-align: center; margin-top: 12px;">
            不同难度级别的单词数量分布
        </div>
    `;
    
    chartsGrid.appendChild(distributionCard);
    
    // 创建学习模式柱状图卡片
    const modeCard = document.createElement('div');
    modeCard.className = 'stat-card';
    modeCard.style.gridColumn = 'span 1';
    modeCard.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">学习模式使用</h3>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            ${createLearningModeChart().outerHTML}
        </div>
        <div style="font-size: 12px; color: var(--text-tertiary); text-align: center; margin-top: 12px;">
            不同学习模式的使用情况
        </div>
    `;
    
    chartsGrid.appendChild(modeCard);
    
    // 创建学习技能雷达图卡片
    const skillsCard = document.createElement('div');
    skillsCard.className = 'stat-card';
    skillsCard.style.gridColumn = 'span 1';
    skillsCard.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">学习技能分析</h3>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            ${createLearningSkillsChart().outerHTML}
        </div>
        <div style="font-size: 12px; color: var(--text-tertiary); text-align: center; margin-top: 12px;">
            不同学习技能的掌握程度
        </div>
    `;
    
    chartsGrid.appendChild(skillsCard);
}

/**
 * 渲染统计卡片
 * @param {Object} stats - 统计数据对象
 */
function renderStatsCards(stats) {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    // 清空现有内容
    statsGrid.innerHTML = '';
    
    // 统计卡片配置 - 替换emoji为SVG图标
    const cards = [
        {
            title: '今日学习',
            value: stats.todayLearned,
            icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            subtitle: `目标 ${stats.dailyGoal} 词`,
            progress: (stats.todayLearned / stats.dailyGoal) * 100,
            color: '#3b82f6' // 蓝色
        },
        {
            title: '掌握程度',
            value: `${stats.masteryLevel}%`,
            icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            subtitle: '总掌握率',
            color: '#10b981' // 绿色
        },
        {
            title: '待复习',
            value: stats.toReview,
            icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>`,
            subtitle: '需要复习的单词',
            color: '#f59e0b' // 橙色
        },
        {
            title: '连续学习',
            value: stats.streakDays,
            icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>`,
            subtitle: '天',
            color: '#ef4444' // 红色
        },
        {
            title: '总学习词数',
            value: stats.totalWords,
            icon: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>`,
            subtitle: '累计学习',
            color: '#8b5cf6' // 紫色
        }
    ];
    
    // 创建卡片元素
    cards.forEach(card => {
        const cardElement = createStatsCard(card);
        statsGrid.appendChild(cardElement);
    });
}

/**
 * 绘制环形进度图
 * @param {number} percentage - 百分比（0-100）
 * @param {string} color - 进度条颜色
 * @returns {string} - Canvas元素的HTML字符串
 */
function drawCircleProgress(percentage, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // 绘制背景圆环
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 32;
    const lineWidth = 8;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景（深色主题样式）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // 绘制进度
    const startAngle = -Math.PI / 2;
    const endAngle = percentage === 0 ? startAngle : startAngle + (percentage / 100) * 2 * Math.PI;
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '80');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 确保0%时也有明显的进度指示
    if (percentage === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + 0.1);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    // 绘制百分比文本
    ctx.fillStyle = color;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percentage}%`, centerX, centerY);
    
    return canvas.outerHTML;
}

/**
 * 创建连续学习日历
 * @param {number} days - 连续学习天数
 * @returns {string} - 日历HTML字符串
 */
function createStreakCalendar(days) {
    const calendarHTML = [];
    const weeks = Math.ceil(days / 7);
    
    calendarHTML.push('<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 8px;">');
    
    for (let i = 0; i < days; i++) {
        const intensity = Math.min(1, i / days * 1.5);
        const opacity = 0.3 + intensity * 0.7;
        calendarHTML.push(`
            <div style="
                width: 12px;
                height: 12px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-radius: 2px;
                opacity: ${opacity};
                transition: all 0.2s ease;
            "></div>
        `);
    }
    
    calendarHTML.push('</div>');
    return calendarHTML.join('');
}

/**
 * 创建统计卡片
 * @param {Object} cardData - 卡片数据
 * @returns {HTMLElement} - 卡片元素
 */
function createStatsCard(cardData) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.position = 'relative';
    
    // 卡片内容
    let cardContent = '';
    
    // 统一卡片布局，确保每个卡片都有图标，放在右上角
    const iconHTML = `
        <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background-color: ${cardData.color}20; border-radius: 10px; color: ${cardData.color}; flex-shrink: 0; animation: fadeIn 0.4s ease 0.2s both;">
            <div style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
                ${cardData.icon}
            </div>
        </div>
    `;
    
    // 根据卡片类型创建不同的内容，但保持统一的图标显示在右上角
    if (cardData.title === '掌握程度') {
        // 环形进度图卡片
        cardContent = `
            ${iconHTML}
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 24px; animation: fadeInUp 0.5s ease-out;">${cardData.title}</div>
                <div style="position: relative; margin-bottom: 20px; animation: scaleIn 0.6s ease-out;">
                    ${drawCircleProgress(cardData.value.replace('%', ''), cardData.color)}
                </div>
                <div style="font-size: 12px; color: var(--text-tertiary); animation: fadeInUp 0.5s ease 0.3s both;">${cardData.subtitle}</div>
            </div>
        `;
    } else if (cardData.title === '连续学习') {
        // 连续学习日历卡片
        const reviewIcons = Array(Math.min(cardData.value, 10)).fill().map((_, i) => `
            <div style="
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, ${cardData.color}, ${cardData.color}80);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
                animation: bounceIn 0.3s ease ${0.4 + i * 0.1}s both;
            ">!</div>
        `).join('');
        
        cardContent = `
            ${iconHTML}
            <div style="display: flex; flex-direction: column; padding: 24px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; animation: fadeInUp 0.5s ease-out;">${cardData.title}</div>
                <div style="font-size: 40px; font-weight: 700; color: ${cardData.color}; margin-bottom: 8px; animation: fadeInUp 0.5s ease 0.2s both;">${cardData.value}</div>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px; animation: fadeInUp 0.5s ease 0.3s both;">${cardData.subtitle}</div>
                <div style="margin-top: 8px;">
                    <div style="font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 12px; animation: fadeInUp 0.5s ease 0.4s both;">学习热力图</div>
                    <div style="animation: fadeIn 0.6s ease 0.5s both;">
                        ${createStreakCalendar(cardData.value)}
                    </div>
                </div>
            </div>
        `;
    } else if (cardData.title === '待复习') {
        // 待复习单词可视化卡片
        const reviewIcons = Array(Math.min(cardData.value, 10)).fill().map((_, i) => `
            <div style="
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, ${cardData.color}, ${cardData.color}80);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
                animation: bounceIn 0.3s ease ${0.4 + i * 0.1}s both;
            ">!</div>
        `).join('');
        
        cardContent = `
            ${iconHTML}
            <div style="display: flex; flex-direction: column; padding: 24px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; animation: fadeInUp 0.5s ease-out;">${cardData.title}</div>
                <div style="font-size: 40px; font-weight: 700; color: ${cardData.color}; margin-bottom: 8px; animation: fadeInUp 0.5s ease 0.2s both;">${cardData.value}</div>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px; animation: fadeInUp 0.5s ease 0.3s both;">${cardData.subtitle}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; animation: fadeIn 0.6s ease 0.4s both;">
                    ${reviewIcons}
                    ${cardData.value > 10 ? `<div style="
                        width: 20px;
                        height: 20px;
                        background: linear-gradient(135deg, ${cardData.color}, ${cardData.color}80);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                        animation: bounceIn 0.3s ease 1.4s both;
                    ">+${cardData.value - 10}</div>` : ''}
                </div>
            </div>
        `;
    } else {
        // 普通统计卡片
        let progressBar = '';
        if (cardData.progress !== undefined) {
            progressBar = `
                <div style="margin-top: 12px; animation: fadeInUp 0.5s ease 0.4s both;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 12px; font-weight: 500; color: var(--text-secondary);">完成度</span>
                        <span style="font-size: 12px; font-weight: 600; color: ${cardData.color};">${Math.round(cardData.progress)}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; position: relative;">
                        <div style="width: 0%; height: 100%; background: linear-gradient(90deg, ${cardData.color}, ${cardData.color}80); border-radius: 4px; animation: fillProgress-${cardData.title.replace(/\s+/g, '')} 1.2s ease-out 0.5s forwards;"></div>
                        <style>@keyframes fillProgress-${cardData.title.replace(/\s+/g, '')} { from { width: 0%; } to { width: ${cardData.progress}%; } }</style>
                    </div>
                </div>
            `;
        }
        
        cardContent = `
            ${iconHTML}
            <div style="display: flex; flex-direction: column; padding: 24px;">
                <div style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; animation: fadeInUp 0.5s ease-out;">${cardData.title}</div>
                <div style="font-size: 40px; font-weight: 700; color: ${cardData.color}; margin-bottom: 8px; animation: fadeInUp 0.5s ease 0.2s both;">${cardData.value}</div>
                ${cardData.subtitle ? `<div style="font-size: 12px; color: var(--text-tertiary); animation: fadeInUp 0.5s ease 0.3s both;">${cardData.subtitle}</div>` : ''}
                ${progressBar}
            </div>
        `;
    }
    
    card.innerHTML = cardContent;
    
    return card;
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    /* 动画效果 */
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes fillProgress {
        from { width: 0%; }
        to { width: var(--progress-width); }
    }
    
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
        }
    }
    
    /* 确保fillProgress动画能正确获取宽度 */
    @keyframes fillProgress {
        from {
            width: 0%;
        }
        to {
            width: var(--progress-width, 100%);
        }
    }
`;
document.head.appendChild(style);

/**
 * 初始化路由
 */
function initRouter() {
    // 检查URL hash
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.substring(1);
        window.switchDashboardSection(sectionId);
    } else {
        // 默认显示概览页面
        window.switchDashboardSection('overview');
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1);
        window.switchDashboardSection(sectionId);
    });
}

/**
 * 初始化Dashboard管理器
 */
function initDashboardManager() {
    // 模拟初始化Dashboard管理器
    console.log('Dashboard管理器已初始化');
}

// DOM加载完成后初始化Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initDashboardManager();
});

// 初始化学习模式选择器
function initLearningModeSelector() {
    // 确保学习管理器已初始化
    if (!window.learningManager) {
        window.learningManager = new LearningManager();
    }
    
    // 渲染学习模式卡片
    renderLearningModeCards();
}

/**
 * 渲染学习模式卡片
 */
function renderLearningModeCards() {
    const modesGrid = document.querySelector('.modes-grid');
    if (!modesGrid) return;
    
    // 清空现有内容
    modesGrid.innerHTML = '';
    
    // 学习模式数据 - 替换emoji为SVG图标
    const modes = [
        {
            id: 'flashcard',
            name: '闪卡模式',
            description: '传统闪卡学习，支持正反翻转',
            icon: `<svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            enabled: true
        },
        {
            id: 'quiz',
            name: '测验模式',
            description: '选择题形式，测试单词掌握程度',
            icon: `<svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>`,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            enabled: true
        },
        {
            id: 'spelling',
            name: '拼写模式',
            description: '听写单词，强化拼写能力',
            icon: `<svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <polyline points="16 13 8 13 8 17 16 17 16 13"></polyline>
                <line x1="10" y1="9" x2="9" y2="9"></line>
                <line x1="13" y1="9" x2="11" y2="9"></line>
            </svg>`,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            enabled: true
        },
        {
            id: 'listening',
            name: '听力模式',
            description: '听单词发音，选择正确释义',
            icon: `<svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>`,
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            enabled: false
        }
    ];
    
    // 创建模式卡片
    modes.forEach(mode => {
        const modeCard = createModeCard(mode);
        modesGrid.appendChild(modeCard);
    });
}

/**
 * 创建学习模式卡片
 * @param {Object} modeData - 模式数据
 * @returns {HTMLElement} - 模式卡片元素
 */
function createModeCard(modeData) {
    const card = document.createElement('div');
    card.className = `mode-card ${modeData.enabled ? '' : 'disabled'}`;
    card.dataset.modeId = modeData.id;
    
    // 设置渐变背景
    card.style.cssText = `
        background: ${modeData.gradient};
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 16px;
        cursor: ${modeData.enabled ? 'pointer' : 'not-allowed'};
        position: relative;
        overflow: hidden;
        color: white;
    `;
    
    // 悬停效果增强
    if (modeData.enabled) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-6px)';
            this.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
        });
        
        // 点击事件
        card.addEventListener('click', function() {
            window.learningManager.startLearningSession(modeData.id);
        });
    }
    
    // 模式卡片内容
    card.innerHTML = `
        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; color: white;">
            ${modeData.icon}
        </div>
        <div style="flex: 1;">
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: white;">${modeData.name}</h3>
            <p style="font-size: 14px; opacity: 0.9; color: white;">${modeData.description}</p>
        </div>
    `;
    
    // 开发中覆盖层
    if (!modeData.enabled) {
        const overlay = document.createElement('div');
        overlay.className = 'mode-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 600;
            color: white;
        `;
        overlay.textContent = '开发中';
        card.appendChild(overlay);
    }
    
    return card;
}

// 暴露全局方法
window.initDashboard = initDashboard;
window.loadLearningOverview = loadLearningOverview;
window.initLearningModeSelector = initLearningModeSelector;

/**
 * 初始化学习记录功能
 */
function initLearningRecords() {
    // 绑定事件监听器
    bindRecordsEventListeners();
    
    // 加载学习记录数据
    loadLearningRecords();
}

/**
 * 绑定学习记录相关的事件监听器
 */
function bindRecordsEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('recordsSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => {
            loadLearningRecords();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadLearningRecords();
            }
        });
    }
    
    // 筛选功能
    const filterMode = document.getElementById('filterMode');
    const filterDifficulty = document.getElementById('filterDifficulty');
    const filterCorrectness = document.getElementById('filterCorrectness');
    const filterType = document.getElementById('filterType');
    
    const filters = [filterMode, filterDifficulty, filterCorrectness, filterType];
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                loadLearningRecords();
            });
        }
    });
    
    // 导出功能
    const exportCsvBtn = document.getElementById('exportCsv');
    const exportJsonBtn = document.getElementById('exportJson');
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            exportRecords('csv');
        });
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            exportRecords('json');
        });
    }
    
    // 分页功能
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            changePage(currentPage - 1);
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            changePage(currentPage + 1);
        });
    }
}

// 学习记录全局变量
let learningRecords = [];
let filteredRecords = [];
let currentPage = 1;
const recordsPerPage = 20;

/**
 * 加载学习记录数据
 */
function loadLearningRecords() {
    // 获取搜索和筛选条件
    const searchQuery = document.getElementById('recordsSearch')?.value || '';
    const modeFilter = document.getElementById('filterMode')?.value || 'all';
    const difficultyFilter = document.getElementById('filterDifficulty')?.value || 'all';
    const correctnessFilter = document.getElementById('filterCorrectness')?.value || 'all';
    const typeFilter = document.getElementById('filterType')?.value || 'all';
    
    // 获取学习记录数据
    chrome.storage.local.get(['translatedWords', 'learningProgress'], (result) => {
        const words = result.translatedWords || {};
        const progress = result.learningProgress || {};
        
        // 转换为数组格式
        learningRecords = Object.entries(words).map(([key, word]) => {
            const wordProgress = progress[key] || {};
            return {
                id: key,
                word: word.word || key,
                translation: word.translation,
                type: word.type || 'word',
                lastUsed: word.lastUsed,
                starred: word.starred,
                difficulty: wordProgress.masteryLevel < 3 ? 'difficult' : wordProgress.masteryLevel < 5 ? 'medium' : 'easy',
                correctCount: wordProgress.correctCount || 0,
                reviewCount: wordProgress.reviewCount || 0,
                masteryLevel: wordProgress.masteryLevel || 0,
                mode: 'flashcard' // 默认模式，实际应该从学习记录中获取
            };
        });
        
        // 应用筛选
        filteredRecords = learningRecords.filter(record => {
            // 搜索筛选
            const matchesSearch = !searchQuery || 
                record.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.translation.toLowerCase().includes(searchQuery.toLowerCase());
            
            // 模式筛选
            const matchesMode = modeFilter === 'all' || record.mode === modeFilter;
            
            // 难度筛选
            const matchesDifficulty = difficultyFilter === 'all' || record.difficulty === difficultyFilter;
            
            // 正确性筛选（基于掌握程度）
            const matchesCorrectness = correctnessFilter === 'all' || 
                (correctnessFilter === 'correct' && record.masteryLevel >= 3) ||
                (correctnessFilter === 'incorrect' && record.masteryLevel < 3);
            
            // 类型筛选
            const matchesType = typeFilter === 'all' || record.type === typeFilter;
            
            return matchesSearch && matchesMode && matchesDifficulty && matchesCorrectness && matchesType;
        });
        
        // 重置到第一页
        currentPage = 1;
        
        // 渲染记录列表
        renderRecordsList();
        
        // 更新分页
        updatePagination();
    });
}

/**
 * 渲染学习记录列表
 */
function renderRecordsList() {
    const recordsList = document.getElementById('recordsList');
    if (!recordsList) return;
    
    // 计算当前页的记录
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);
    
    if (currentRecords.length === 0) {
        recordsList.innerHTML = `
            <div class="no-records">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>没有找到符合条件的学习记录</p>
            </div>
        `;
        return;
    }
    
    // 渲染记录项
    const recordsHTML = currentRecords.map(record => `
        <div class="record-item">
            <div class="record-header">
                <div class="record-word">
                    <h3>${record.word}</h3>
                    <div class="record-word-meta">
                        <span class="record-type">${record.type === 'word' ? '单词' : record.type === 'phrase' ? '短语' : '句子'}</span>
                        <span class="record-difficulty ${record.difficulty}">${record.difficulty === 'easy' ? '简单' : record.difficulty === 'medium' ? '中等' : '困难'}</span>
                    </div>
                </div>
                <div class="record-meta">
                    <span class="record-mastery">掌握程度: ${record.masteryLevel}/5</span>
                </div>
            </div>
            <div class="record-body">
                <p class="record-translation">${record.translation}</p>
                <div class="record-stats">
                    <span>复习次数: ${record.reviewCount}</span>
                    <span>正确次数: ${record.correctCount}</span>
                    <span>模式: ${record.mode === 'flashcard' ? '闪卡' : record.mode === 'quiz' ? '测验' : '拼写'}</span>
                    ${record.lastUsed ? `<span>最后学习: ${new Date(record.lastUsed).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    recordsList.innerHTML = recordsHTML;
}

/**
 * 更新分页控件
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (pageInfo) {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
}

/**
 * 切换页码
 * @param {number} newPage - 新页码
 */
function changePage(newPage) {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderRecordsList();
        updatePagination();
    }
}

/**
 * 导出学习记录
 * @param {string} format - 导出格式（csv或json）
 */
function exportRecords(format) {
    if (filteredRecords.length === 0) {
        alert('没有可导出的学习记录');
        return;
    }
    
    let data;
    let filename;
    let mimeType;
    
    if (format === 'csv') {
        // 生成CSV数据
        const headers = ['单词', '翻译', '类型', '难度', '掌握程度', '复习次数', '正确次数', '模式', '最后学习'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(record => [
                `"${record.word}"`,
                `"${record.translation}"`,
                record.type === 'word' ? '单词' : record.type === 'phrase' ? '短语' : '句子',
                record.difficulty === 'easy' ? '简单' : record.difficulty === 'medium' ? '中等' : '困难',
                record.masteryLevel,
                record.reviewCount,
                record.correctCount,
                record.mode === 'flashcard' ? '闪卡' : record.mode === 'quiz' ? '测验' : '拼写',
                record.lastUsed ? new Date(record.lastUsed).toLocaleString() : ''
            ].join(','))
        ].join('\n');
        
        data = csvContent;
        filename = `学习记录_${new Date().toISOString().slice(0, 10)}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
    } else {
        // 生成JSON数据
        data = JSON.stringify(filteredRecords, null, 2);
        filename = `学习记录_${new Date().toISOString().slice(0, 10)}.json`;
        mimeType = 'application/json;charset=utf-8;';
    }
    
    // 创建下载链接
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 添加到DOM加载完成事件
window.addEventListener('DOMContentLoaded', function() {
    // 初始化学习记录功能
    initLearningRecords();
});

// 监听页面切换事件
window.addEventListener('sectionChanged', function(e) {
    const sectionId = e.detail.sectionId;
    if (sectionId === 'records') {
        // 当切换到学习记录页面时，重新加载数据
        loadLearningRecords();
    } else if (sectionId === 'goals') {
        // 当切换到目标页面时，渲染目标进度
        renderGoalProgress();
    }
});

/**
 * 初始化学习目标设置组件
 */
function initGoalSetting() {
    // 创建目标设置实例
    window.goalSetting = new GoalSetting({
        containerId: 'dashboard-content',
        onSave: (goals) => {
            console.log('学习目标已保存:', goals);
            // 重新加载学习概览数据，更新目标进度
            loadLearningOverview();
        }
    });
    
    // 绑定目标设置相关事件
    bindGoalSettingEvents();
    
    // 初始化目标提醒
    initGoalReminders();
}

/**
 * 绑定目标设置相关事件监听器
 */
function bindGoalSettingEvents() {
    // 在目标页面添加设置按钮点击事件
    document.addEventListener('DOMContentLoaded', () => {
        // 检查是否在目标页面
        const goalsContainer = document.querySelector('.goals-container');
        if (goalsContainer) {
            // 添加目标设置按钮
            const settingBtn = document.createElement('button');
            settingBtn.className = 'goal-setting-btn';
            settingBtn.textContent = '设置目标';
            settingBtn.style.cssText = `
                padding: 10px 20px;
                background: var(--accent-primary);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-bottom: 20px;
            `;
            
            settingBtn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--accent-primary-hover)';
            });
            
            settingBtn.addEventListener('mouseleave', function() {
                this.style.background = 'var(--accent-primary)';
            });
            
            settingBtn.addEventListener('click', () => {
                window.goalSetting.open();
            });
            
            goalsContainer.appendChild(settingBtn);
        }
    });
    
    // 监听页面切换事件，在目标页面添加设置按钮
    window.addEventListener('sectionChanged', function(e) {
        const sectionId = e.detail.sectionId;
        if (sectionId === 'goals') {
            // 延迟添加，确保页面已经渲染
            setTimeout(() => {
                const goalsContainer = document.querySelector('.goals-container');
                if (goalsContainer) {
                    // 检查是否已经有设置按钮
                    if (!goalsContainer.querySelector('.goal-setting-btn')) {
                        // 添加目标设置按钮
                        const settingBtn = document.createElement('button');
                        settingBtn.className = 'goal-setting-btn';
                        settingBtn.textContent = '设置目标';
                        settingBtn.style.cssText = `
                            padding: 10px 20px;
                            background: var(--accent-primary);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            margin-bottom: 20px;
                        `;
                        
                        settingBtn.addEventListener('mouseenter', function() {
                            this.style.background = 'var(--accent-primary-hover)';
                        });
                        
                        settingBtn.addEventListener('mouseleave', function() {
                            this.style.background = 'var(--accent-primary)';
                        });
                        
                        settingBtn.addEventListener('click', () => {
                            window.goalSetting.open();
                        });
                        
                        goalsContainer.appendChild(settingBtn);
                    }
                }
            }, 100);
        }
    });
}

/**
 * 初始化目标提醒
 */
function initGoalReminders() {
    // 目标管理器实例
    const goalManager = new GoalManager();
    
    // 检查目标完成情况并显示提醒
    async function checkGoalReminders() {
        // 获取当前学习数据
        const stats = await getCurrentLearningStats();
        
        // 获取目标提醒
        const reminders = goalManager.getGoalReminders(stats);
        
        // 显示提醒
        reminders.forEach(reminder => {
            if (window.goalSetting) {
                window.goalSetting.showNotification(reminder.message, reminder.type);
            }
        });
    }
    
    // 获取当前学习统计数据
    async function getCurrentLearningStats() {
        // 模拟数据，实际应该从存储中获取
        return {
            daily: 15,
            weekly: 85,
            monthly: 320
        };
    }
    
    // 每5分钟检查一次目标完成情况
    setInterval(checkGoalReminders, 5 * 60 * 1000);
    
    // 初始检查
    setTimeout(checkGoalReminders, 1000);
}

/**
 * 渲染学习目标进度
 */
function renderGoalProgress() {
    // 目标管理器实例
    const goalManager = new GoalManager();
    
    // 获取目标和当前进度
    const goals = goalManager.getAllGoals();
    const currentStats = {
        daily: 15,
        weekly: 85,
        monthly: 320
    };
    
    // 计算进度
    const progress = goalManager.calculateAllProgress(currentStats);
    
    // 渲染目标进度
    const goalsContainer = document.querySelector('.goals-container');
    if (goalsContainer) {
        // 清空现有内容
        goalsContainer.innerHTML = '';
        
        // 渲染目标进度卡片
        Object.values(progress).forEach(progress => {
            const goalCard = createGoalProgressCard(progress);
            goalsContainer.appendChild(goalCard);
        });
    }
}

/**
 * 创建目标进度卡片
 * @param {Object} progress - 目标进度数据
 * @returns {HTMLElement} - 卡片元素
 */
function createGoalProgressCard(progress) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    // 目标类型标签映射
    const typeLabels = {
        daily: '每日目标',
        weekly: '每周目标',
        monthly: '每月目标'
    };
    
    // 目标状态样式
    const statusStyle = progress.completed ? {
        color: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)'
    } : {
        color: '#3b82f6',
        background: 'rgba(59, 130, 246, 0.1)'
    };
    
    card.innerHTML = `
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px;">${typeLabels[progress.type] || progress.type}</h3>
        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 32px; font-weight: 700; color: ${statusStyle.color};">${progress.current}/${progress.target}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${progress.percentage}% 完成</div>
                </div>
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${statusStyle.background};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${statusStyle.color};
                    font-size: 18px;
                    font-weight: 600;
                ">
                    ${progress.completed ? '✓' : '⏱️'}
                </div>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                <div style="
                    width: ${progress.percentage}%;
                    height: 100%;
                    background: linear-gradient(90deg, ${statusStyle.color}, ${statusStyle.color}80);
                    border-radius: 4px;
                    transition: width 1.2s ease-out;
                "></div>
            </div>
            <div style="margin-top: 12px; display: flex; justify-content: space-between;">
                <button class="goal-setting-btn" style="
                    padding: 6px 12px;
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">修改目标</button>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${progress.completed ? '目标已达成！' : '继续加油！'}
                </div>
            </div>
        </div>
    `;
    
    // 添加修改目标按钮事件
    const settingBtn = card.querySelector('.goal-setting-btn');
    if (settingBtn) {
        settingBtn.addEventListener('click', () => {
            window.goalSetting.open();
        });
    }
    
    return card;
}

// 暴露全局方法
window.initGoalSetting = initGoalSetting;
window.renderGoalProgress = renderGoalProgress;