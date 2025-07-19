// CalendarWidget
class CalendarWidget {
  constructor(options = {}) {
    this.containerId = options.containerId || 'calendarContainer';
    this.date = new Date();
    this.calendarGrid = 35; // 7 * 5 grid
    this.init();
  }

  // 判断闰年
  isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // 获取月份天数
  getDays(year, month) {
    const feb = this.isLeap(year) ? 29 : 28;
    const daysPerMonth = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysPerMonth[month - 1];
  }

  // 获取相邻月份信息
  getNextOrLastDays(date, type) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (type === 'last') {
      const lastMonth = (month === 1 ? 12 : month - 1);
      const lastYear = (month === 1 ? year - 1 : year);
      return {
        year: lastYear,
        month: lastMonth,
        days: this.getDays(lastYear, lastMonth)
      };
    }
    if (type === 'next') {
      const nextMonth = (month === 12 ? 1 : month + 1);
      const nextYear = (month === 12 ? year + 1 : year);
      return {
        year: nextYear,
        month: nextMonth,
        days: this.getDays(nextYear, nextMonth)
      };
    }
  }

  // 生成日历数据
  generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const days = this.getDays(year, month);
    const weekIndex = new Date(`${year}/${month}/1`).getDay(); // 0-6

    const { year: lastYear, month: lastMonth, days: lastDays } =
      this.getNextOrLastDays(date, 'last');
    const { year: nextYear, month: nextMonth } =
      this.getNextOrLastDays(date, 'next');

    const calendarTable = [];
    for (let i = 0; i < this.calendarGrid; i++) {
      if (i < weekIndex) {
        calendarTable[i] = {
          year: lastYear,
          month: lastMonth,
          day: lastDays - weekIndex + i + 1,
          isCurrentMonth: false
        };
      } else if (i >= days + weekIndex) {
        calendarTable[i] = {
          year: nextYear,
          month: nextMonth,
          day: i + 1 - days - weekIndex,
          isCurrentMonth: false
        };
      } else {
        calendarTable[i] = {
          year: year,
          month: month,
          day: i + 1 - weekIndex,
          isCurrentMonth: true
        };
      }
    }
    return calendarTable;
  }

  /**
   * 渲染日历
   */
  renderCalendar(create = false) {
    // 生成当前月份的日历数据
    const calendarData = this.generateCalendar(this.date);
    const title = document.getElementById('title');
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const day = this.date.getDate();

    // 更新标题显示年月
    if (title) title.innerText = `${year}-${month.toString().padStart(2, '0')}`;

    const content = document.getElementById('content');
    if (!content) return;

    if (create) {
      // 创建新的日历按钮元素
      const fragment = document.createDocumentFragment();
      calendarData.forEach(item => {
        const button = document.createElement('button');
        const dateStr = `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        const dateObj = new Date(`${item.year}/${item.month}/${item.day}`);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const dateType = this.getDateType(dateStr);

        button.setAttribute('date', `${item.year}/${item.month}/${item.day}`);
        button.innerText = item.day;

        // 设置基本样式类
        if (!item.isCurrentMonth) {
          if (dateType === 'public_holiday') {
            button.classList.add('other-month-holiday');
          } else {
            button.classList.add('grey');
          }
        }

        // 按照优先级设置特殊日期样式
        if (dateType === 'transfer_workday') {
          button.classList.add('transfer-workday');
        } else if (dateType === 'public_holiday') {
          button.classList.add('public-holiday');
        } else if (isWeekend) {
          button.classList.add('weekend');
        }

        // 设置当前选中日期和今天样式
        if (item.day === day && item.month === month) {
          button.classList.add('selected');

          // 如果是今天则额外添加today类
          const today = new Date();
          if (today.getDate() === item.day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year) {
            button.classList.add('today');
          }
        }

        // 添加日期选择事件
        button.addEventListener('click', () => {
          this.selectDate(button);
        });

        fragment.appendChild(button);
      });
      content.appendChild(fragment);
    } else {
      // 更新现有日历按钮元素
      calendarData.forEach((item, idx) => {
        const button = content.children[idx];
        if (!button) return;

        const dateStr = `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        const dateObj = new Date(`${item.year}/${item.month}/${item.day}`);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const dateType = this.getDateType(dateStr);

        // 重置样式并更新显示文本
        button.className = '';
        button.innerText = item.day;

        // 设置基本样式类
        if (!item.isCurrentMonth) {
          if (dateType === 'public_holiday') {
            button.classList.add('other-month-holiday');
          } else {
            button.classList.add('grey');
          }
        }

        // 按照优先级设置特殊日期样式
        if (dateType === 'transfer_workday') {
          button.classList.add('transfer-workday');
        } else if (dateType === 'public_holiday') {
          button.classList.add('public-holiday');
        } else if (isWeekend) {
          button.classList.add('weekend');
        }

        // 设置当前选中日期和今天样式
        if (item.day === day && item.month === month) {
          button.classList.add('selected');

          // 如果是今天则额外添加today类
          const today = new Date();
          if (today.getDate() === item.day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year) {
            button.classList.add('today');
          }
        }
      });
    }
  }

  // 改变月份
  changeMonth(type) {
    const newDays = this.getNextOrLastDays(this.date, type);
    this.date.setFullYear(newDays.year);
    this.date.setMonth(newDays.month - 1);
    this.date.setDate(1);
    this.renderCalendar();
  }

  // 选中日期
  selectDate(button) {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const newDay = Number(button.innerText);

    this.date.setDate(newDay);

    if (button.classList.contains('grey')) {
      let newMonth, newYear;
      if (newDay < 15) { // next
        newMonth = (month === 12 ? 1 : month + 1);
        newYear = (month === 12 ? year + 1 : year);
      } else { // last
        newMonth = (month === 1 ? 12 : month - 1);
        newYear = (month === 1 ? year - 1 : year);
      }
      this.date.setMonth(newMonth - 1);
      this.date.setFullYear(newYear);
    }
    this.renderCalendar();

    /*console.log("containerid：", this.containerId);
    // 显示弹窗
    const popup = new PopupWidget({
      containerId: this.containerId,
      title: `${year}年${month}月${newDay}日`,
      content: `
            <div id="calendar">
                <div class="header">
                <div class="btn-group">
                    <button class="left"><</button>
                    <button class="right">></button>
                </div>
                <h4 id="title"></h4>
                <button class="skipToToday">今天</button>
                </div>
                <div class="week" style="    margin-top: 2px;">
                <li class="weekend">日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li class="weekend">六</li>
                </div>
                <div id="content"></div>
            </div>
    `,
      darkMode: true
    });*/

  }

  async init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    // 加载节假日数据
    await this.loadHolidayData();

    // 注入HTML结构
    container.innerHTML = `
            <div id="calendarWidget">
                <div class="header">
                <div class="btn-group">
                    <button class="left"><</button>
                    <button class="right">></button>
                </div>
                <h4 id="title"></h4>
                <button class="skipToToday">今天</button>
                </div>
                <div class="week" style="    margin-top: 2px;">
                <li class="weekend">日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li class="weekend">六</li>
                </div>
                <div id="content"></div>
            </div>
    `;

    // 注入CSS
    const style = document.createElement('style');
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

          #calendarWidget {
            font-family: 'CustomSans', sans-serif;
            box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: grid;
            border-radius: 16px;
            padding: 19px;
            background: var(--widget-bg);
            font-weight: normal;
            color: var(--text-color);
          }

          /* 跨月节假日的浅红色样式 */
          .other-month-holiday {
            color: rgba(255, 0, 0, 0.5) !important;
          }

          /* 跨月普通日期的浅黑色样式 */
          .grey {
            color: rgba(0, 0, 0, 0.3) !important;
          }

          /* 周末样式 */
          .weekend {
            color: red !important;
          }

          /* 节假日样式 */
          .public-holiday {
            color: red !important;
            /* 强制覆盖其他颜色 */
            font-weight: bold !important
          }

          /* 调休工作日样式 */
          .transfer-workday {
            color: black !important;
            font-weight: bold !important;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header h4 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 500;
          }

          .header button {
            background: var(--option-color);
            border: none;
            padding: 6px 8px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

          }

          .header button:hover {
            background: var(--hover-bg);
          }

          .week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 0.9rem;
          }

          .week li::marker {
            content: none;
          }

          #content {
            margin-left: -4px;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
          }

          #content button {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'CustomSans', sans-serif;
            font-size: 0.95rem;
            padding: 1px 6px;
            color: inherit;
          }

          #content button:hover {
            background: var(--hover-bg);
          }

          #content button.today {
            font-weight: bold;
            color: var(--underline-color);
          }

          #content button.selected {
            background: var(--underline-color);
            color: var(--button-text) !important;
          }

          #content button.grey {
            color: var(--border-color);
            opacity: 0.7;
          }
          .left,.right,.skipToToday{
            color: inherit;
          }

        `;
    document.head.appendChild(style);

    // 初始化日历
    this.renderCalendar(true);

    // 绑定事件
    document.querySelector('.left').addEventListener('click', () => this.changeMonth('last'));
    document.querySelector('.right').addEventListener('click', () => this.changeMonth('next'));
    document.querySelector('.skipToToday').addEventListener('click', () => {
      this.date = new Date();
      this.renderCalendar();
    });

  }
  async loadHolidayData() {
    try {
      const response = await fetch('static/data/2025.json');
      this.holidays = await response.json();
    } catch (error) {
      console.error('加载节假日数据失败:', error);
      this.holidays = { dates: [] };
    }
  }

  getDateType(dateStr) {
    const holiday = this.holidays.dates.find(d => d.date === dateStr);
    return holiday ? holiday.type : null;
  }

}
