//  ClockWidget
class ClockWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: "clockContainer",
      use24HourFormat: true, // 默认24小时制
      highlightColor: "#9c27b0", // 数字7的高亮颜色
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = "clockWidgetStyles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
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
      #clockWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg) ;
        color: var(--text-color);
        font-family: 'CustomSans', sans-serif;
        font-weight: bold;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;

      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      .hm-row {
        display: flex;
        align-items: baseline;
        font-size: 66px;
        line-height: 1;
      }

      .time-colon {
        animation: blink 1s infinite;
        color: purple;
        padding: 0 5px;
      }

      .seconds {
        font-size: 36px;
      }

      .highlight-seven {
        color: ${this.options.highlightColor} !important;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .format-toggle {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        color: inherit;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 15px;
      }

      .format-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    container.innerHTML = `
      <div id="clockWidget">
        <div class="time-display">
          <div class="hm-row">
            <span id="hours">00</span>
            <span class="time-colon">:</span>
            <span id="minutes">00</span>
          </div>
          <div class="seconds" id="seconds">00</div>
        </div>
        <button class="format-toggle" id="toggleFormat">切换12/24小时制</button>
      </div>
    `;

    // 绑定事件
    document.getElementById("toggleFormat").addEventListener("click", () => {
      this.options.use24HourFormat = !this.options.use24HourFormat;
      this.updateTime();
    });

    // 开始计时
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // 处理小时显示
    if (this.options.use24HourFormat) {
      document.getElementById("hours").textContent = hours
        .toString()
        .padStart(2, "0");
    } else {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 转换为12小时制
      document.getElementById("hours").textContent = hours
        .toString()
        .padStart(2, "0");
    }

    // 更新分钟和秒
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

    // 高亮数字7
    this.highlightNumber(document.getElementById("hours"));
    this.highlightNumber(document.getElementById("minutes"));
    this.highlightNumber(document.getElementById("seconds"));
  }

  highlightNumber(element) {
    // 清除之前的高亮
    Array.from(element.children).forEach((child) => {
      if (child.classList.contains("highlight-seven")) {
        child.classList.remove("highlight-seven");
      }
    });

    // 将数字拆分为单个字符并高亮7
    const digits = element.textContent.split("");
    element.innerHTML = digits
      .map((digit) => {
        return digit === "7"
          ? `<span class="highlight-seven">${digit}</span>`
          : digit;
      })
      .join("");
  }
}

//  社畜倒计时
class WorkTimeWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: "workTimeContainer",
      workHours: {
        start: "07:50", // 上班时间
        lunch: "11:20", // 午饭时间
        end: "17:30", // 下班时间
        dailySalary: 250, // 日薪
      },
    };

    // 合并用户配置
    this.options = {
      ...this.defaultOptions,
      ...options,
      workHours: {
        ...this.defaultOptions.workHours,
        ...(options.workHours || {}),
      },
    };

    // 当前页面状态
    this.currentPage = "display"; // 'display' 或 'settings'

    // 从 localStorage 加载配置
    this.loadConfig();

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  loadConfig() {
    const savedConfig = localStorage.getItem("workTimeWidgetConfig");
    if (savedConfig) {
      try {
        this.options.workHours = JSON.parse(savedConfig);
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }

  saveConfig() {
    localStorage.setItem(
      "workTimeWidgetConfig",
      JSON.stringify(this.options.workHours)
    );
  }

  injectStyles() {
    const styleId = "workTimeWidgetStyles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
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
      #workTimeWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg);
        color: var(--text-color);
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;

        position: relative;
      }

      .breathing-effect {
      animation: breathing 1.5s ease-in-out infinite;
      }

      @keyframes breathing {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.1);
        }
        50% {
          box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0.2);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.3);
        }
      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .countdown-item {
        margin: 8px 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .countdown-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 4px;
      }

      .countdown-value {
        font-size: 24px;
        font-weight: bold;
      }

      .salary-display {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .salary-label {
        font-size: 12px;
        opacity: 0.8;
      }

      .salary-value {
        font-size: 24px;
        font-weight: bold;
        background: red;
        /*background: linear-gradient(to right,purple,gold,red);*/
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
        padding: 0 5px; /* 添加一些内边距让渐变更明显 */
      }

      .settings-form {
        padding: 10px;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .settings-row {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }

      .settings-label {
        width: 70px;
        font-size: 12px;
      }

      .settings-input {
        flex: 1;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
      }

      .flip-button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
        color: inherit;
      }

      .flip-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .save-button {

        padding: 6px;
        border-radius: 4px;
        border: none;
        background: #4CAF50;
        color: white;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 开始计时
    this.updateDisplay();
    this.interval = setInterval(() => this.updateDisplay(), 1000);
  }

  render() {
    const container = document.getElementById(this.options.containerId);
    container.innerHTML = `
      <div id="workTimeWidget">
        ${
          this.currentPage === "display"
            ? this.renderDisplayPage()
            : this.renderSettingsPage()
        }
        <button class="flip-button" id="flipPage">
          ${this.currentPage === "display" ? "设置" : "返回"}
        </button>
      </div>
    `;

    // 绑定翻页事件
    document.getElementById("flipPage").addEventListener("click", () => {
      this.currentPage =
        this.currentPage === "display" ? "settings" : "display";
      this.render();
    });

    // 如果是设置页面，绑定保存事件
    if (this.currentPage === "settings") {
      document.getElementById("saveSettings").addEventListener("click", () => {
        this.saveSettings();
      });
    }
  }

  renderDisplayPage() {
    return `
      <div class="time-display">
        <div class="countdown-item">
          <div class="countdown-label">吃！吃！吃！</div>
          <div class="countdown-value" id="lunchCountdown">--:--:--</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-label">撤！撤！撤！</div>
          <div class="countdown-value" id="endCountdown">--:--:--</div>
        </div>
        <div class="salary-display">
          <div class="salary-label">窝囊费</div>
          <div class="salary-value" id="salaryEarned">¥0</div>
        </div>
      </div>
    `;
  }

  renderSettingsPage() {
    return `
      <div class="settings-form">
        <div class="settings-row">
          <div class="settings-label">上班时间</div>
          <input type="time" class="settings-input" id="startTime" value="${this.options.workHours.start}">
        </div>
        <div class="settings-row">
          <div class="settings-label">午饭时间</div>
          <input type="time" class="settings-input" id="lunchTime" value="${this.options.workHours.lunch}">
        </div>
        <div class="settings-row">
          <div class="settings-label">下班时间</div>
          <input type="time" class="settings-input" id="endTime" value="${this.options.workHours.end}">
        </div>
        <div class="settings-row">
          <div class="settings-label">日薪(元)</div>
          <input type="number" class="settings-input" id="dailySalary" value="${this.options.workHours.dailySalary}">
        </div>
        <button class="save-button" id="saveSettings">保存设置</button>
      </div>
    `;
  }

  saveSettings() {
    this.options.workHours = {
      start: document.getElementById("startTime").value,
      lunch: document.getElementById("lunchTime").value,
      end: document.getElementById("endTime").value,
      dailySalary: parseFloat(document.getElementById("dailySalary").value),
    };

    this.saveConfig();
    this.currentPage = "display";
    this.render();
  }

  updateDisplay() {
    if (this.currentPage !== "display") return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 解析时间
    const startTime = new Date(`${today}T${this.options.workHours.start}:00`);
    const lunchTime = new Date(`${today}T${this.options.workHours.lunch}:00`);
    const endTime = new Date(`${today}T${this.options.workHours.end}:00`);

    // 计算时间差
    let lunchDiff = lunchTime - now;
    let endDiff = endTime - now;

    // 确保时间差为正数
    lunchDiff = lunchDiff > 0 ? lunchDiff : 0;
    endDiff = endDiff > 0 ? endDiff : 0;

    // 格式化倒计时
    const formatTime = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");
    };

    // 更新倒计时显示
    if (document.getElementById("lunchCountdown")) {
      document.getElementById("lunchCountdown").textContent =
        formatTime(lunchDiff);
    }
    if (document.getElementById("endCountdown")) {
      document.getElementById("endCountdown").textContent = formatTime(endDiff);
    }

    // 获取widget容器
    const widget = document.getElementById("workTimeWidget");

    // 下班倒计时为0时添加红色边框
    if (endDiff <= 0) {
      widget.style.border = "1px solid red";
      widget.style.boxShadow = "0 8px 10px rgba(255, 0, 0, 0.3)";
      widget.classList.add("breathing-effect");
    } else {
      widget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      widget.style.boxShadow = "0 8px 10px rgba(0, 0, 0, 0.3)";
      widget.classList.remove("breathing-effect");
    }

    // 计算日薪增长（精确到小数点后三位）
    if (now >= startTime && now <= endTime) {
      const workDayDuration = endTime - startTime;
      const workedTime = now - startTime;
      const salaryEarned =
        (workedTime / workDayDuration) * this.options.workHours.dailySalary;

      if (document.getElementById("salaryEarned")) {
        document.getElementById(
          "salaryEarned"
        ).textContent = `¥${salaryEarned.toFixed(3)}`;
      }
    } else if (now < startTime) {
      if (document.getElementById("salaryEarned")) {
        document.getElementById("salaryEarned").textContent = "¥0.0000";
      }
    } else {
      if (document.getElementById("salaryEarned")) {
        document.getElementById(
          "salaryEarned"
        ).textContent = `¥ ${this.options.workHours.dailySalary.toFixed(3)}`;
      }
    }
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 开始计时，每秒更新5次
    this.updateDisplay();
    this.interval = setInterval(() => this.updateDisplay(), 200); // 200ms = 每秒5次
  }
}
