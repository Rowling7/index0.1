// ShortcutWidget 无字不设置字体
class ShortcutWidget {
  constructor(options) {
    this.containerId = options.containerId || 'shortcutContainer';
    this.shortcuts = options.shortcuts || [
      {
        url: "http://www.bilibili.com",
        icon: "static/ico/bilibili.png",
        alt: "bilibili"
      },
      {
        url: "https://www.douyin.com/",
        icon: "static/ico/douyin.png",
        alt: "抖音"
      },
      {
        url: "https://github.com/",
        icon: "static/ico/github-black.png",
        alt: "GitHub"
      },
      {
        url: "#",
        icon: "static/ico/loading0_compressed.gif",
        alt: "加载中"
      }
    ];

    this.injectStyles();
    this.init();
  }

  injectStyles() {
    const styleId = 'shortcutWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #shortcutWidget {
        width: 240px ;
        height: 240px ;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg);
        color: var(#ecf0f1);
        font-family: 'Noto Sans SC', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 15px;
        box-sizing: border-box;
        overflow: hidden;

      }
      .shortcut-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        border-radius: 8px;
      }
      .shortcut-icon:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-3px);
      }
      .shortcut-icon img {
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        border-radius: 20px;
      }
      .shortcut-icon span {
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="shortcutWidget">
        ${this.shortcuts.map(item => `
          <a href="${item.url}" class="shortcut-icon">
            <img src="${item.icon}" alt="${item.alt}">
          </a>
        `).join('')}
      </div>
    `;
  }
}