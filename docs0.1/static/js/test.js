//  一言组件
class HitokotoWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'hitokotoContainer',
      textColor: "var(--text-color)",
      apiUrlType: 'dujitang', // 默认类型
      apiUrls: {
        dujitang: 'https://v2.xxapi.cn/api/dujitang',
        weibo: 'https://v2.xxapi.cn/api/yiyan?type=hitokoto'
      }
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStylesHitokoto();

    // 初始化
    this.initHitokoto();

    // 首次加载数据
    this.fetchHitokoto();
  }

  injectStylesHitokoto() {
    const styleId = 'hitokotoWidgetStyles';
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
      #hitokotoWidget {
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        color: ${this.options.textColor};
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        background: var(--widget-bg);
        background-position: center;
        background-size: cover;
      }

      #hitokoto {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        font-size: 18px;
        line-height: 1.5;
      }

      #hitokoto_text {
        color: inherit;
        color: var(--text-color);
        text-decoration: none;
        transition: all 0.3s ease;
      }

      #hitokoto_text:hover {
        opacity: 0.8;
      }
      .type-switcher {
        background: linear-gradient(135deg, #64b5f6, #42a5f5);
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 14px;
        border-radius: 30px;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }

      .type-switcher:hover {
        background: linear-gradient(135deg, #42a5f5, #1e88e5);
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
      }

      .type-switcher:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }

  async fetchHitokoto() {
    try {
      const apiUrl = this.options.apiUrls[this.options.apiUrlType];
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('网络错误');

      const data = await response.json();

      if (data.code === 200 && data.data) {
        this.updateHitokoto(data.data);  // 使用 data 字段内容
      } else {
        throw new Error('数据格式错误');
      }
    } catch (error) {
      console.error('获取毒鸡汤失败:', error);
      this.showErrorState();
    }
  }

  updateHitokoto(text) {
    const hitokotoTextEl = document.querySelector('#hitokoto');
    if (hitokotoTextEl) {
      hitokotoTextEl.textContent = text;
      console.log('已更新文本:', text);
    } else {
      console.warn('.hitokoto-text 元素不存在');
    }
  }

  showErrorState() {
    const hitokotoTextEl = document.getElementById('hitokoto_text');
    if (hitokotoTextEl) {
      hitokotoTextEl.textContent = '小时候打喷嚏以为是有人在想我，原来是现在的自己';
    }
  }

  initHitokoto() {
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div id="hitokotoWidget">
        <p id="hitokoto">
          <a href="#" class="hitokoto_text" style="z-index:1;">生气的本质就是在和自己的预期较劲</a>
        </p>
        <button class="type-switcher" id="typeSwitcher" style="z-index:1;">切换内容源</button>
      </div>
    `;

    // 绑定点击刷新事件
    document.getElementById('hitokoto').addEventListener('click', (e) => {
      e.preventDefault(); // 阻止默认跳转行为
      this.fetchHitokoto();
    });

    // 切换类型按钮
    document.getElementById('typeSwitcher').addEventListener('click', () => {
      const types = Object.keys(this.options.apiUrls);
      const currentIndex = types.indexOf(this.options.apiUrlType);
      const nextIndex = (currentIndex + 1) % types.length;
      this.options.apiUrlType = types[nextIndex];
      this.fetchHitokoto();
    });
  }

}