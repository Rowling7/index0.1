// 基础组件类
class BaseWidget {
  constructor(options = {}) {
    this.options = {
      ...this.getDefaultOptions(),
      ...options,
    };

    this.container = this.createContainer();
    this.container.className = this.options.widgetClass;
    this.init();
  }

  getDefaultOptions() {
    return {
      containerId: "widgetContainer",
      widgetClass: "widget",
    };
  }

  createContainer() {
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }
    return container;
  }

  init() {
    throw new Error("init() must be implemented by subclass");
  }
}

// 时钟组件
class ClockWidget extends BaseWidget {
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      widgetClass: "widget clock-widget",
      use24HourFormat: true,
      highlightColor: "#9c27b0",
    };
  }

  init() {
    // 使用已存在的容器，不再创建新容器
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`容器 ${this.options.containerId} 未找到`);
      return;
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

    document.getElementById("toggleFormat").addEventListener("click", () => {
      this.options.use24HourFormat = !this.options.use24HourFormat;
      this.updateTime();
    });

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

// 工作倒计时组件
class WorkTimeWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.currentPage = "display"; // 'display' 或 'settings'
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      widgetClass: "widget worktime-widget",
      workHours: {
        start: "07:50",
        lunch: "11:20",
        end: "17:30",
        dailySalary: 250,
      },
    };
  }

  init() {
    // 使用已存在的容器，不再创建新容器
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`容器 ${this.options.containerId} 未找到`);
      return;
    }

    // 渲染组件
    this.render();

    // 开始计时
    this.updateDisplay();
    this.interval = setInterval(() => this.updateDisplay(), 200);
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

  render() {
    this.container.innerHTML = `
      <div class="widget-content">
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

    document.getElementById("flipPage").addEventListener("click", () => {
      this.currentPage =
        this.currentPage === "display" ? "settings" : "display";
      this.render();
    });

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
    // 只在显示页面更新
    if (this.currentPage !== "display") return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const startTime = new Date(`${today}T${this.options.workHours.start}:00`);
    const lunchTime = new Date(`${today}T${this.options.workHours.lunch}:00`);
    const endTime = new Date(`${today}T${this.options.workHours.end}:00`);

    // 计算时间差
    let lunchDiff = Math.max(lunchTime - now, 0);
    let endDiff = Math.max(endTime - now, 0);

    // 格式化时间
    const formatTime = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    // 安全更新DOM元素
    const safeUpdate = (id, content) => {
      const element = document.getElementById(id);
      if (element) element.textContent = content;
    };

    safeUpdate("lunchCountdown", formatTime(lunchDiff));
    safeUpdate("endCountdown", formatTime(endDiff));

    // 下班倒计时效果
    const widget = document.getElementById("workTimeWidget");
    if (widget) {
      if (endDiff <= 0) {
        widget.style.border = "1px solid red";
        widget.style.boxShadow = "0 8px 10px rgba(255, 0, 0, 0.3)";
        widget.classList.add("breathing-effect");
      } else {
        widget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        widget.style.boxShadow = "0 8px 10px rgba(0, 0, 0, 0.3)";
        widget.classList.remove("breathing-effect");
      }
    }

    // 计算日薪
    let salaryEarned = 0;
    if (now >= startTime && now <= endTime) {
      const workDayDuration = endTime - startTime;
      const workedTime = now - startTime;
      salaryEarned =
        (workedTime / workDayDuration) * this.options.workHours.dailySalary;
    } else if (now > endTime) {
      salaryEarned = this.options.workHours.dailySalary;
    }

    safeUpdate("salaryEarned", `¥${salaryEarned.toFixed(3)}`);
  }
}
