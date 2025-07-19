// WeatherWidget
class WeatherWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: "weatherWidgetContainer", // 默认容器ID
      apiKey: "269d058c99d1f3cdcd9232f62910df1d", // OpenWeatherMap API Key
      defaultCity: "Weihai", // 默认城市
      cityDataPath: "static/data/city.json", //城市数据路径
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = "weatherWidgetStyles";
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
      #weatherWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(#2c3e50);
        color: var(#ecf0f1);
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        transform: none !important; /* 确保没有变换效果 */
        transition: none !important; /* 取消所有过渡效果 */
      }

      #weatherWidget::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          background-size: cover;
          filter: blur(8px);
          z-index: -1;
      }

      /* 温度区域 */
      #weatherHead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 30%;
        margin-bottom: 10px;
        position: relative;
      }

      #weatherTemp {
        font-size: 36px;
        font-weight: 300;
        position: relative;
      }

      #weatherTemp::after {
        content: "°C";
        font-size: 18px;
        position: absolute;
        top: 3px;
        right: -20px;
        opacity: 0.7;
      }

      /* 温度高低显示 */
      .temperature-extremes {
        display: none;
        /*flex*/
        flex-direction: column;
        align-items: flex-end;
        position: absolute;
        right: 50px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        line-height: 1.2;
      }

      #weatherTempMax,
      #weatherTempMin {
        opacity: 0.7;
        position: relative;
        padding-left: 14px;
        margin: 1px 0;
      }

      #weatherTempMax::before {
        content: "↑";
        position: absolute;
        left: 0;
      }

      #weatherTempMin::before {
        content: "↓";
        position: absolute;
        left: 0;
      }

      /* 天气图标 */
      #weatherimg {
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      /* 输入区域 */
      #weatherInput {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
        height: 15%;
      }

      #weatherInput input,
      #weatherInput select,
      #weatherInput button {
        border: none;
        border-radius: 6px;
        padding: 5px 8px;
        background-color: var(rgba(255, 255, 255, 0.1));
        color: var(#ecf0f1);
        transition: all 0.2s ease;
        font-size: 12px;
        border: 1px solid rgba(3, 3, 3, 0.1);
      }

      #weatherInput input {
        flex: 1;
        min-width: 0;
      }

      #weatherInput select {
        width: 70px;
      }

      #weatherInput button {
        background-color: var(#3498db);
        font-weight: 500;
        cursor: pointer;
        width: 60px;
      }

      #weatherInput input:focus,
      #weatherInput select:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(#3498db);
      }

      /* 优化城市选择框样式 */
      #citySelect {
        background-color: var(rgba(255, 255, 255, 0.1));
        color: var(#ecf0f1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        appearance: none;
        /* 移除默认样式 */
        -webkit-appearance: none;
        padding-right: 20px;
        /* 为下拉箭头留出空间 */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ecf0f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 12px;
        cursor: pointer;
      }

      /* 下拉选项样式 */
      #citySelect option {
        background-color: var(#34495e);
        color: var(#ecf0f1);
        padding: 8px;
      }

      /* 悬停状态 */
      #citySelect:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }

      /* 聚焦状态 */
      #citySelect:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(#3498db);
      }

      /* 禁用默认下拉箭头 (IE) */
      select::-ms-expand {
        display: none;
      }

      /* 主要天气信息 */
      #mainbody {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 8px;
        height: 15%;
      }

      #weatherInfoRow1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      #site {
        font-size: 13px;
        font-weight: 500;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
      }

      #weatherResult {
        font-size: 13px;
        font-weight: 600;
        text-transform: capitalize;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
      }

      /* 详细天气容器 */
      #detailedbody {
        background-color: var(rgba(255, 255, 255, 0.1));
        border-radius: 10px;
        padding: 10px;
        margin-top: auto;
        height: 30%;
        perspective: 1000px;
        position: relative;
      }

      /* 添加提示 */
      #detailedbody::after {
        content: "悬停查看更多";
        position: absolute;
        bottom: 1px;
        right: 8px;
        font-size: 8px;
        opacity: 0.5;
        transition: opacity 0.3s;
      }

      #detailedbody:hover::after {
        opacity: 0;
      }

      /* 天气详情卡片 */
      .weather-card {
        position: absolute;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        transition: transform 0.6s;
        transform-style: preserve-3d;
      }

      /* 卡片面 */
      .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }

      /* 背面 */
      .back {
        transform: rotateY(180deg);
      }

      /* 鼠标悬停时翻转 */
      #detailedbody:hover .weather-card {
        transform: rotateY(180deg);
      }

      /* 调整详情行样式 */
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 11px;
        align-items: center;
      }

      .detail-label {
        opacity: 0.7;
      }

      .detail-value {
        font-weight: 500;
      }

      .weather-widget {
        background: var(--widget-bg);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 8px var(--shadow-color);
        transition: transform 0.3s;

      }

      .weather-widget:hover {
        transform: translateY(-5px);
      }

      .view-icon {
        width: 28px;
        height: 28px;
        margin-right: 5px;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  async init() {
    // 创建容器
    this.createContainer();

    // 加载城市数据
    await this.loadCityData();

    // 渲染组件
    this.render();

    // 默认查询天气
    this.getWeather();

    // 绑定事件
    this.bindEvents();
  }

  createContainer() {
    // 如果容器不存在则创建
    if (!document.getElementById(this.options.containerId)) {
      const container = document.createElement("div");
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }
    this.container = document.getElementById(this.options.containerId);
  }

  async loadCityData() {
    console.log("Requesting city data from:", this.options.cityDataPath);
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
      alert("城市数据加载失败，请检查网络或文件路径！");
    }
  }

  render() {
    // 组件HTML结构
    this.container.innerHTML = `
      <div id="weatherWidget" class="weather-widget">
        <!-- 温度区域 -->
        <div id="weatherHead">
          <div id="weatherTemp"></div>
          <div class="temperature-extremes">
            <div id="weatherTempMax" title="最高温度"></div>
            <div id="weatherTempMin" title="最低温度"></div>
          </div>
          <img id="weatherimg" />
        </div>

        <!-- 输入区域 -->
        <div id="weatherInput">
          <select id="citySelect">
            <option value="Weihai">威海</option>
            <option value="Wuhan">武汉</option>
            <option value="Guiyang">贵阳</option>
          </select>
          <input type="text" id="cityInput" list="citySuggestions" placeholder="城市">
          <datalist id="citySuggestions"></datalist>
          <button id="weatherBtn">查询</button>
        </div>

        <!-- 主要天气信息 -->
        <div id="mainbody">
          <div id="weatherInfoRow1">
            <div id="site"></div>
            <div id="weatherResult"></div>
          </div>
        </div>

        <!-- 详细天气信息 -->
        <div id="detailedbody">
          <div class="weather-card">
            <div class="card-face front">
              <div class="detail-row">
                <div class="detail-label">体感温度</div>
                <div class="detail-value" id="feelsLike"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风速</div>
                <div class="detail-value" id="windSpeed"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风向</div>
                <div class="detail-value" id="windDeg"></div>
              </div>
            </div>
            <div class="card-face back">
              <div class="detail-row">
                <div class="detail-label">湿度</div>
                <div class="detail-value" id="weatherHumi"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">大气压</div>
                <div class="detail-value" id="weatherPress"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">云量</div>
                <div class="detail-value" id="clouds"></div>
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
    document.getElementById("citySelect").value = this.options.defaultCity;
  }

  bindEvents() {
    // 查询按钮事件
    document
      .getElementById("weatherBtn")
      .addEventListener("click", () => this.getWeather());

    // 城市选择变化事件
    document
      .getElementById("citySelect")
      .addEventListener("change", () => this.getWeather());

    // 城市输入变化事件
    document
      .getElementById("cityInput")
      .addEventListener("change", () => this.getWeather());
  }

  getWeather() {
    let city;
    const inputValue = document.getElementById("cityInput").value.trim();

    if (inputValue === "") {
      city = document.getElementById("citySelect").value;
    } else {
      const isChinese = /[\u4e00-\u9fa5]/.test(inputValue);
      if (isChinese) {
        const matchedCity = this.cityData.find(
          (item) => item.name === inputValue
        );
        city = matchedCity ? matchedCity.pinyin : null;
      } else {
        city = inputValue;
      }
    }

    if (!city) return;

    // 发送天气请求
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.options.apiKey}`
    )
      .then((response) => response.json())
      .then((weatherData) => this.updateWeatherUI(weatherData))
      .catch((error) => console.error("获取天气数据失败:", error));
  }

  // 获取风力等级
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
    // 天气描述翻译
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

    // 获取天气图标URL
    const iconUrl =
      "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" +
      weatherData.weather[0].icon +
      ".png";
    document.getElementById("weatherimg").src = iconUrl;

    // 设置模糊背景
    const widget = document.getElementById("weatherWidget");
    widget.style.backgroundImage = `url(${iconUrl})`;
    widget.style.backgroundSize = "cover";
    widget.style.backgroundPosition = "center";
    widget.style.backgroundRepeat = "no-repeat";

    // 更新UI
    document.getElementById("weatherResult").innerHTML = chineseDescription;
    document.getElementById("weatherHumi").innerHTML =
      weatherData.main.humidity;

    const kdeg = weatherData.main.temp - 273.15;
    document.getElementById("weatherTemp").innerHTML = kdeg.toFixed(1);

    const kdegmax = weatherData.main.temp_max - 273.15;
    document.getElementById("weatherTempMax").innerHTML =
      kdegmax.toFixed(0) + "°";

    const kdegmin = weatherData.main.temp_min - 273.15;
    document.getElementById("weatherTempMin").innerHTML =
      kdegmin.toFixed(0) + "°";

    document.getElementById("site").innerHTML =
      weatherData.name + " / " + weatherData.sys.country;
    document.getElementById("weatherimg").src =
      "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" +
      weatherData.weather[0].icon +
      ".png";
    document.getElementById("weatherPress").innerHTML =
      weatherData.main.pressure;

    const feelsLike = (weatherData.main.feels_like - 273.15).toFixed(0);
    document.getElementById("feelsLike").innerHTML = feelsLike + "°";
    // 添加风力等级描述
    const windSpeed = weatherData.wind.speed;
    const windLevel = this.getWindLevel(windSpeed);
    document.getElementById(
      "windSpeed"
    ).innerHTML = `${windLevel} | ${windSpeed} m/s`;
    document.getElementById("clouds").innerHTML = weatherData.clouds.all + "%";

    const windDeg = weatherData.wind.deg;
    const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const index = Math.round((windDeg % 360) / 45) % 8;
    document.getElementById("windDeg").innerHTML = directions[index];
  }
}
