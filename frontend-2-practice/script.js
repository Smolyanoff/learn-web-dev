// Практика 2: нативный JavaScript — календарь, слоты и выбор времени.

// 1. ДАННЫЕ. Демо-дата зафиксирована под исходный макет (июнь 2025).
// Так легко сверять внешний вид с Figma; перед реальным запуском её можно заменить.
const today = new Date(2025, 5, 2);
const slotsByParity = {
  even: [
    { time: '10:00', available: true }, { time: '11:00', available: false },
    { time: '12:00', available: true }, { time: '13:00', available: false },
    { time: '14:00', available: true }, { time: '15:00', available: true },
    { time: '16:00', available: true }, { time: '17:00', available: true },
  ],
  odd: [
    { time: '10:00', available: true }, { time: '11:00', available: true },
    { time: '12:00', available: false }, { time: '13:00', available: true },
    { time: '14:00', available: true }, { time: '15:00', available: true },
    { time: '16:00', available: false }, { time: '17:00', available: true },
  ],
};

// 2. СОСТОЯНИЕ.
let currentMonth = new Date(2025, 5, 1);
let selectedDate = new Date(2025, 5, 20);
let selectedTime = '12:00';
let selectedSlots = slotsByParity.even;

const monthTitle = document.querySelector('.month-title');
const dayGrid = document.querySelector('#day-grid');
const timeGrid = document.querySelector('#time-grid');
const summary = document.querySelector('#selection-summary');
const prevMonthButton = document.querySelector('#prev-month');
const nextMonthButton = document.querySelector('#next-month');
const nextButton = document.querySelector('#next-button');
const backButton = document.querySelector('.back-button');
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

// 3. ЧИСТЫЕ ФУНКЦИИ.
function sameDay(a, b) {
  return Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
}

function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  // В демо показываем четыре недели бронирования — как в макете.
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return { date, otherMonth: date.getMonth() !== month };
  });
}

function formatSummary() {
  if (!selectedDate) return 'Выберите дату';
  const dateText = dateFormatter.format(selectedDate);
  return selectedTime ? `${dateText} ${selectedTime}` : `${dateText} · выберите время`;
}

function isBeforeToday(date) {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return normalizedDate < normalizedToday;
}

// 4. ОТРИСОВКА И ОБРАБОТЧИКИ.
function renderCalendar() {
  const title = monthFormatter.format(currentMonth);
  monthTitle.textContent = title.charAt(0).toLocaleUpperCase('ru-RU') + title.slice(1);
  dayGrid.innerHTML = '';

  buildCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth()).forEach(({ date, otherMonth }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'day-cell';
    button.textContent = String(date.getDate());

    if (otherMonth) {
      button.classList.add('day-cell--outside');
      button.disabled = true;
      button.setAttribute('aria-label', dateFormatter.format(date));
    } else if (isBeforeToday(date)) {
      button.classList.add('day-cell--disabled');
      button.disabled = true;
    } else {
      button.dataset.date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      button.setAttribute('aria-label', dateFormatter.format(date));
      if (sameDay(date, selectedDate)) {
        button.classList.add('day-cell--selected');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.setAttribute('aria-pressed', 'false');
      }
      button.addEventListener('click', () => selectDate(date));
    }
    dayGrid.append(button);
  });
  prevMonthButton.disabled = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() <= today.getMonth();
}

function renderSlots() {
  timeGrid.innerHTML = '';
  if (!selectedDate) {
    timeGrid.innerHTML = '<p class="slots-message">Сначала выберите дату.</p>';
    return;
  }

  selectedSlots = selectedDate.getDate() % 2 === 0 ? slotsByParity.even : slotsByParity.odd;
  selectedSlots.forEach((slot) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-slot';
    button.dataset.time = slot.time;
    if (!slot.available) {
      button.classList.add('time-slot--unavailable');
      button.disabled = true;
      button.innerHTML = `<span>${slot.time}</span><small>Занято</small>`;
    } else {
      button.textContent = slot.time;
      if (slot.time === selectedTime) {
        button.classList.add('time-slot--selected');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.setAttribute('aria-pressed', 'false');
      }
      button.addEventListener('click', () => {
        selectedTime = slot.time;
        renderSlots();
        renderSummary();
      });
    }
    timeGrid.append(button);
  });
}

function renderSummary() {
  summary.textContent = formatSummary();
}

function selectDate(date) {
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  selectedTime = null;
  renderCalendar();
  renderSlots();
  renderSummary();
}

function changeMonth(offset) {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  selectedDate = null;
  selectedTime = null;
  renderCalendar();
  renderSlots();
  renderSummary();
}

prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
nextButton.addEventListener('click', () => {
  if (!selectedDate || !selectedTime) {
    window.alert('Сначала выберите дату и свободное время.');
    return;
  }
  window.alert(`Вы выбрали: ${formatSummary()}`);
});
backButton.addEventListener('click', () => window.alert('Это демонстрационный экран шага 3 из 5.'));

// 5. ИНИЦИАЛИЗАЦИЯ.
renderCalendar();
renderSlots();
renderSummary();
