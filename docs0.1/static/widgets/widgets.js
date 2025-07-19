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
      widgetClass: "widget clock-widget widget-row2Col2",
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
    <div id="clockWidget" class="widget-row2Col2">
      <div class="time-display ">
        <div class="hm-row">
          <span id="hours">00</span>
          <span class="time-colon">:</span>
          <span id="minutes">00</span>
        </div>
        <div class="seconds" id="seconds">00</div>
      </div>
      <button class="format-toggle" id="toggleFormat">切换12小时制</button>
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
    // 更新按钮状态
    const toggleBtn = document.getElementById("toggleFormat");
    toggleBtn.classList.toggle("active", !this.options.use24HourFormat);
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
      widgetClass: "widget worktime-widget widget-row2Col2",
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
    this.currentPage = "display"; // 强制设置为显示页面
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
        ${this.currentPage === "display"
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
    <div class="time-display compact-display">
      <div class="countdown-row">
        <div class="countdown-item">
          <div class="countdown-label small-label">吃！吃！吃！</div>
          <div class="countdown-value small-value" id="lunchCountdown">--:--:--</div>
        </div>
      </div>
        <div class="countdown-item">
          <div class="countdown-label small-label">撤！撤！撤！</div>
          <div class="countdown-value small-value" id="endCountdown">--:--:--</div>
        </div>
      </div>
      <div class="salary-row">
        <div class="salary-label small-label">窝囊废</div>
        <div class="salary-value small-value" id="salaryEarned">¥0</div>
      </div>
    </div>
  `;
  }

  renderSettingsPage() {
    return `
    <div class="settings-form compact-form">
      <div class="settings-grid">
        <div class="settings-group">
          <label class="settings-label">上班时间</label>
          <input type="time" class="settings-input compact-input" id="startTime" value="${this.options.workHours.start}">
        </div>
        <div class="settings-group">
          <label class="settings-label">午饭时间</label>
          <input type="time" class="settings-input compact-input" id="lunchTime" value="${this.options.workHours.lunch}">
        </div>
        <div class="settings-group">
          <label class="settings-label">下班时间</label>
          <input type="time" class="settings-input compact-input" id="endTime" value="${this.options.workHours.end}">
        </div>
        <div class="settings-group">
          <label class="settings-label">日薪(元)</label>
          <input type="number" class="settings-input compact-input" id="dailySalary" value="${this.options.workHours.dailySalary}">
        </div>
      </div>
      <button class="save-button compact-button" id="saveSettings">保存</button>
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

// 天气组件
class WeatherWidget extends BaseWidget {
  constructor(options = {}) {
    super({
      ...options,
      widgetClass: "widget weather-widget widget-row2Col2",
    });

    // 合并默认配置
    this.options = {
      apiKey: "269d058c99d1f3cdcd9232f62910df1d", // OpenWeatherMap API Key
      defaultCity: "Weihai", // 默认城市
      cityDataPath: "static/data/city.json", // 城市数据路径
      ...this.options,
      ...options,
    };

    // 初始化
    this.init();
  }

  async init() {
    // 加载城市数据
    await this.loadCityData();

    // 渲染组件
    this.render();

    // 默认查询天气
    this.getWeather();
  }

  async loadCityData() {
    if (!this.options.cityDataPath) {
      console.error("缺少cityDataPath配置");
      return;
    }

    try {
      const response = await fetch(this.options.cityDataPath);
      if (!response.ok) throw new Error("网络响应不正常");

      const data = await response.json();
      if (!data.city) throw new Error("城市数据格式错误");

      this.cityData = data.city.flatMap((group) => group.list);
    } catch (error) {
      console.error("加载城市数据失败:", error);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="weather-content">
        <!-- 温度区域 -->
        <div class="weather-head">
          <div class="weather-temp"></div>

          <img class="weather-img" />
        </div>

        <!-- 输入区域 -->
        <div class="weather-input">
          <select class="city-select">
            <option value="Weihai">威海</option>
            <option value="Wuhan">武汉</option>
            <option value="Guiyang">贵阳</option>
          </select>
          <input type="text" class="city-input" list="citySuggestions" placeholder="城市">
          <datalist id="citySuggestions"></datalist>
          <button class="weather-btn">查询</button>
        </div>

        <!-- 主要天气信息 -->
        <div class="weather-main">
          <div class="weather-info-row">
            <div class="weather-site"></div>
            <div class="weather-result"></div>
          </div>
        </div>

        <!-- 详细天气信息 -->
        <div class="weather-detail">
          <div class="weather-card">
            <div class="card-face front">
              <div class="detail-row">
                <div class="detail-label">体感温度</div>
                <div class="detail-value feels-like"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风速</div>
                <div class="detail-value wind-speed"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风向</div>
                <div class="detail-value wind-deg"></div>
              </div>
            </div>
            <div class="card-face back">
              <div class="detail-row">
                <div class="detail-label">湿度</div>
                <div class="detail-value weather-humi"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">大气压</div>
                <div class="detail-value weather-press"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">云量</div>
                <div class="detail-value clouds"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 填充城市建议
    if (this.cityData) {
      const datalist = document.getElementById("citySuggestions");
      this.cityData.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.name;
        datalist.appendChild(option);
      });
    }

    // 设置默认城市
    document.querySelector(".city-select").value = this.options.defaultCity;

    // 绑定事件
    document
      .querySelector(".weather-btn")
      .addEventListener("click", () => this.getWeather());
    document
      .querySelector(".city-select")
      .addEventListener("change", () => this.getWeather());
    document
      .querySelector(".city-input")
      .addEventListener("change", () => this.getWeather());
  }

  getWeather() {
    let city;
    const inputValue = document.querySelector(".city-input").value.trim();
    const selectValue = document.querySelector(".city-select").value;

    // 优先使用输入框的值
    if (inputValue !== "") {
      // 检查是否是中文
      const isChinese = /[\u4e00-\u9fa5]/.test(inputValue);
      if (isChinese) {
        // 查找匹配的中文城市
        const matchedCity = this.cityData.find(
          (item) => item.name === inputValue || item.label.includes(inputValue)
        );
        city = matchedCity?.pinyin || null;
      } else {
        // 直接使用输入的拼音/英文
        city = inputValue;
      }
    } else {
      // 使用下拉框选择的值
      city = selectValue;
    }

    if (!city) {
      console.error("无效的城市名称");
      // 显示错误提示
      this.showError("请输入有效的城市名称");
      return;
    }

    // 显示加载状态
    this.showLoading();

    // 添加units=metric参数获取摄氏温度
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.options.apiKey}&units=metric`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        return response.json();
      })
      .then((weatherData) => {
        if (!weatherData || weatherData.cod !== 200) {
          throw new Error(weatherData?.message || "无效的天气数据");
        }
        this.updateWeatherUI(weatherData);
      })
      .catch((error) => {
        console.error("获取天气数据失败:", error);
        this.showError(error.message);
      });
  }

  // 新增方法：显示加载状态
  showLoading() {
    const resultElement = document.querySelector(".weather-result");
    if (resultElement) {
      resultElement.textContent = "加载中...";
      resultElement.style.color = "inherit";
    }
  }

  // 新增方法：显示错误信息
  showError(message) {
    const resultElement = document.querySelector(".weather-result");
    if (resultElement) {
      resultElement.textContent = `错误: ${message}`;
      resultElement.style.color = "red";
    }
  }
  getWindLevel(speed) {
    if (speed < 0.3) return "0级";
    if (speed < 1.6) return "1级";
    if (speed < 3.4) return "2级";
    if (speed < 5.5) return "3级";
    if (speed < 8.0) return "4级";
    if (speed < 10.8) return "5级";
    if (speed < 13.9) return "6级";
    if (speed < 17.2) return "7级";
    if (speed < 20.8) return "8级";
    if (speed < 24.5) return "9级";
    if (speed < 28.5) return "10级";
    if (speed < 32.7) return "11级";
    return "12级";
  }

  updateWeatherUI(weatherData) {
    const weatherDescriptions = {
      "clear sky": "晴空",
      "few clouds": "少云",
      "scattered clouds": "散云",
      "broken clouds": "多云",
      "overcast clouds": "阴天",
      "shower rain": "阵雨",
      rain: "雨",
      "light rain": "小雨",
      "moderate rain": "中雨",
      "heavy rain": "大雨",
      thunderstorm: "雷暴",
      snow: "雪",
      "light snow": "小雪",
      "heavy snow": "大雪",
      mist: "薄雾",
      fog: "雾",
      haze: "霾",
      dust: "尘",
      sand: "沙尘",
      smoke: "烟雾",
      tornado: "龙卷风",
    };

    const englishDescription = weatherData.weather[0].description.toLowerCase();
    const chineseDescription =
      weatherDescriptions[englishDescription] || englishDescription;

    // 天气图标URL
    const iconUrl = `https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${weatherData.weather[0].icon}.png`;

    // 更新UI元素
    document.querySelector(".weather-img").src = iconUrl;
    document.querySelector(".weather-result").textContent = chineseDescription;
    document.querySelector(".weather-humi").textContent =
      weatherData.main.humidity;

    const temp = weatherData.main.temp.toFixed(1);
    document.querySelector(".weather-temp").textContent = temp;

    /*const tempMax = (weatherData.main.temp_max - 273.15).toFixed(0);
    document.querySelector(".weather-temp-max").textContent = `${tempMax}°`;

    const tempMin = (weatherData.main.temp_min - 273.15).toFixed(0);
    document.querySelector(".weather-temp-min").textContent = `${tempMin}°`;
    */
    document.querySelector(
      ".weather-site"
    ).textContent = `${weatherData.name} / ${weatherData.sys.country}`;

    document.querySelector(".weather-press").textContent =
      weatherData.main.pressure;

    const feelsLike = weatherData.main.feels_like.toFixed(0);
    document.querySelector(".feels-like").textContent = `${feelsLike}°C`;

    const windSpeed = weatherData.wind.speed;
    const windLevel = this.getWindLevel(windSpeed);
    document.querySelector(
      ".wind-speed"
    ).textContent = `${windLevel} | ${windSpeed} m/s`;

    document.querySelector(
      ".clouds"
    ).textContent = `${weatherData.clouds.all}%`;

    const windDeg = weatherData.wind.deg;
    const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const index = Math.round((windDeg % 360) / 45) % 8;
    document.querySelector(".wind-deg").textContent = directions[index];

    // 设置背景
    this.container.style.backgroundImage = `url(${iconUrl})`;
  }
}

//快捷方式组件
class ShortcutWidget extends BaseWidget {
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      widgetClass: "widget shortcut-widget widget-row2Col2",
      shortcuts: [
        {
          url: "http://www.bilibili.com",
          icon: "static/ico/bilibili.png",
          alt: "bilibili",
        },
        {
          url: "https://www.douyin.com/",
          icon: "static/ico/douyin.png",
          alt: "抖音",
        },
        {
          url: "https://github.com/",
          icon: "static/ico/github-black.png",
          alt: "GitHub",
        },
        {
          url: "#",
          icon: "static/ico/loading0_compressed.gif",
          alt: "加载中",
        },
      ],
    };
  }

  init() {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`容器 ${this.options.containerId} 未找到`);
      return;
    }

    container.innerHTML = `
        <div class="shortcut-grid widget-row2col2">
            ${this.options.shortcuts.map(item => `
                <a href="${item.url}" class="widget-icon shortcut-icon" target="_blank" rel="noopener noreferrer">
                    <img src="${item.icon}" alt="${item.alt}">
                </a>
            `).join('')}
        </div>
    `;
  }
}

// 热搜组件
class HotPointWidget extends BaseWidget {
  constructor(options = {}) {
    super({
      ...options,
      widgetClass: "widget hotpoint-widget widget-row4Col2"
    });

    // 默认配置
    this.defaultOptions = {
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

    // 初始化
    this.init();
  }

  async init() {
    // 渲染组件
    this.render();

    // 首次加载数据
    await this.fetchHotData();

    // 设置定时更新
    this.startAutoUpdate();
  }

  render() {
    this.container.innerHTML = `
      <div id="hotPointWidget" class="${this.currentSource}-hot">
        <div class="widget-header">
          <div class="widget-title">${this.currentSource === 'weibo' ? '微博热搜榜' : '百度热搜榜'}</div>
          <button class="switch-btn" id="switchSourceBtn">${this.currentSource === 'weibo' ? '切换百度' : '切换微博'}</button>
          <button class="refresh-btn" id="refreshBtn">刷新</button>
        </div>
        <div class="hot-list" id="hotList">
          <div class="loading">加载中...</div>
        </div>
      </div>
    `;

    // 绑定切换数据源事件
    document.getElementById('switchSourceBtn').addEventListener('click', () => {
      this.currentSource = this.currentSource === 'weibo' ? 'baidu' : 'weibo';
      document.getElementById('hotPointWidget').className = `${this.currentSource}-hot`;
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
      console.error('Fetch hot data failed:', error);
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
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">无法加载热搜数据</div>
        <div class="error-details">请检查网络连接或稍后重试</div>
        <button class="retry-btn">重试</button>
      </div>
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
}




function initWidgets() {
  // 初始化时检查保存的主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
  // 获取 widget 容器
  const widgetContainer = document.querySelector(".weidgetContainer");

  if (!widgetContainer) {
    console.error("无法找到 widget 容器");
    return;
  }

  // 创建组件容器
  widgetContainer.innerHTML = `
    <div id="clockContainer"></div>
    <div id="workTimeContainer"></div>
    <div id="weatherContainer"></div>
    <div id="shortcutContainer"></div>
    <div id="hotPointContainer"></div>
  `;

  // 初始化时钟组件
  const clock = new ClockWidget({
    containerId: "clockContainer",
    highlightColor: "#ff5722",
  });

  // 初始化工作倒计时组件
  const workTime = new WorkTimeWidget({
    containerId: "workTimeContainer",
    workHours: {
      start: "07:50",
      lunch: "11:20",
      end: "17:30",
      dailySalary: 250,
    },
  });

  // 初始化天气组件
  new WeatherWidget({
    containerId: "weatherContainer",
  });

  //初始化快捷方式组件
  new ShortcutWidget({
    containerId: "shortcutContainer",
  });

  // 初始化热点组件
  new HotPointWidget({
    containerId: "hotPointContainer"
  });
}
// 暴露初始化函数给全局作用域
window.initWidgets = initWidgets;
