
// 热搜组件
class WeiboHotWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'weiboHotContainer',  // 默认容器ID
      updateInterval: 300000,             // 默认更新间隔(5分钟)
      maxItems: 50,                       // 最大显示条目
      defaultSource: 'weibo'              // 默认数据源 weibo/baidu
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 当前数据源
    this.currentSource = this.options.defaultSource;

    // API 地址
    this.apiUrls = {
      weibo: 'https://v2.xxapi.cn/api/weibohot',
      baidu: 'https://v2.xxapi.cn/api/baiduhot'
    };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = 'weiboHotWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }

      #weiboHotWidget {
        height: 240px;
        border-radius: 12px;
        padding: 16px;
        background: var(--widget-bg);
        color:  ${this.options.textColor};
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }

      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: inherit;
      }

      .widget-title {
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
      }

      .switch-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: inherit;
        transition: all 0.3s ease;
        margin-left: 8px;
      }

      .switch-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .refresh-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: inherit;
        transition: all 0.3s ease;
      }

      .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .hot-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;
      }

      .hot-item {
        display: flex;
        align-items: center;
        justify-content: space-between; /* 内容分布两侧 */
        margin-bottom: 6px;           /* 缩小底部间距 */
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.3s ease;
        height: 32px;                 /* 固定高度 */
        overflow: hidden;
      }

      .hot-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
        transform: translateX(5px);
      }

      .hot-rank {
        width: 24px;
        height: 24px;
        min-width: 24px;
        min-height: 24px;
        border-radius: 50%;
        background-color: #e53935;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 8px;
        font-size: 12px;
        position: relative;
      }

      .hot-rank::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.3);
        pointer-events: none;
      }

      .baidu-hot .hot-rank {
        background-color: #ff4040;
      }

      .weibo-hot .hot-rank {
        background-color: #e53935;
      }

      .hot-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        color: inherit;
      }

      .hot-title {
        font-size: 13px;
        color: inherit;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hot-metric {
        font-size: 11px;
        color: #d32f2f;
        background-color: rgba(255, 0, 0, 0.1);
        border-radius: 4px;
        padding: 1px 4px;
        width: fit-content;
        display: flex-end;
      }

      /* 滚动条样式 */
      .hot-list::-webkit-scrollbar {
        width: 6px;
      }

      .hot-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }

      .hot-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
      }

      .hot-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 首次加载数据
    this.fetchHotData();

    // 设置定时更新
    this.startAutoUpdate();
  }

  render() {
    const container = document.getElementById(this.options.containerId);
    container.innerHTML = `
    <div id="weiboHotWidget" class="${this.currentSource}-hot">
      <div class="widget-header">
        <div class="widget-title">${this.currentSource === 'weibo' ? '微博热搜榜' : '百度热搜榜'}</div>
        <button class="switch-btn" id="switchSourceBtn">${this.currentSource === 'weibo' ? '切换百度' : '切换微博'}</button>
        <button class="refresh-btn" id="refreshBtn">刷新</button>
      </div>
      <div class="hot-list" id="hotList">
        <!-- 热搜条目将在这里动态插入 -->
        <div class="loading">加载中...</div>
      </div>
    </div>
  `;

    // 绑定切换数据源事件
    document.getElementById('switchSourceBtn').addEventListener('click', () => {
      this.currentSource = this.currentSource === 'weibo' ? 'baidu' : 'weibo';
      document.getElementById('weiboHotWidget').className = `${this.currentSource}-hot`;
      document.querySelector('.widget-title').textContent = this.currentSource === 'weibo' ? '微博热搜榜' : '百度热搜榜';
      document.getElementById('switchSourceBtn').textContent = this.currentSource === 'weibo' ? '切换百度' : '切换微博';
      this.fetchHotData();
    });

    // 绑定刷新事件
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.fetchHotData();
    });
  }

  async fetchHotData() {
    try {
      const response = await fetch(this.apiUrls[this.currentSource]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.code === 200 && Array.isArray(data.data)) {
        this.displayHotData(data.data.slice(0, this.options.maxItems));
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {

      this.showErrorState();
    }
  }

  displayHotData(data) {
    const hotList = document.getElementById('hotList');
    if (!hotList) return;

    // 创建文档碎片以提高性能
    const fragment = document.createDocumentFragment();

    // 为每个热搜条目创建元素
    data.forEach(item => {
      const hotItem = document.createElement('div');
      hotItem.className = 'hot-item';
      hotItem.innerHTML = `
        <div class="hot-rank">${item.index}</div>
        <div class="hot-info">
          <div class="hot-title">${item.title}</div>
        </div>
        <div class="hot-metric">${item.hot}</div>
      `;


      // 添加点击事件打开链接
      hotItem.addEventListener('click', () => {
        window.open(item.url, '_blank');
      });

      // 添加悬停效果
      hotItem.addEventListener('mouseenter', () => {
        hotItem.style.cursor = 'pointer';
      });

      fragment.appendChild(hotItem);
    });

    // 清空当前内容并添加新内容
    hotList.innerHTML = '';
    hotList.appendChild(fragment);
  }

  showErrorState() {
    const hotList = document.getElementById('hotList');
    if (!hotList) return;

    hotList.innerHTML = `
      < div class= "error-state" >
        <div class="error-icon">⚠️</div>
        <div class="error-message">无法加载热搜数据</div>
        <div class="error-details">请检查网络连接或稍后重试</div>
        <button class="retry-btn">重试</button>
      </div >
        `;

    // 添加重试按钮事件
    hotList.querySelector('.retry-btn').addEventListener('click', () => {
      this.fetchHotData();
    });
  }

  startAutoUpdate() {
    // 如果已存在定时器，先清除
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // 开始新的定时更新
    this.updateTimer = setInterval(() => {
      this.fetchHotData();
    }, this.options.updateInterval);
  }

  // 销毁方法，用于清理资源
  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    const container = document.getElementById(this.options.containerId);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
