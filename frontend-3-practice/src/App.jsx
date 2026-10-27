import { useMemo, useState } from 'react';

const MONTH_NAMES = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const DEMO_TODAY = new Date(2025, 5, 2);
const INITIAL_DATE = new Date(2025, 5, 20);
const TIMES = [
  { time: '10:00', available: true }, { time: '11:00', available: false },
  { time: '12:00', available: true }, { time: '13:00', available: false },
  { time: '14:00', available: true }, { time: '15:00', available: true },
  { time: '16:00', available: true }, { time: '17:00', available: true },
];
const ALTERNATE_TIMES = [
  { time: '10:00', available: true }, { time: '11:00', available: true },
  { time: '12:00', available: false }, { time: '13:00', available: true },
  { time: '14:00', available: true }, { time: '15:00', available: true },
  { time: '16:00', available: false }, { time: '17:00', available: true },
];

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function sameDay(a, b) { return Boolean(a && b && dateKey(a) === dateKey(b)); }
function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return { date, otherMonth: date.getMonth() !== month };
  });
}
function isBeforeToday(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()) < DEMO_TODAY;
}

function BrandMark({ footer = false }) {
  return <a className={footer ? 'footer-brand' : 'brand'} href="#" aria-label="Барбершоп — главная">
    <svg viewBox="0 0 64 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="15" cy="33" r="5.4"/><circle cx="25" cy="39" r="5.4"/><path d="M19 29 48 5 53 7 26 33M29 35 56 17M13 28 44 9M34 27 53 12"/><path d="m39 18 15-6"/></g></svg>
  </a>;
}
function Header() {
  return <><header className="site-header"><BrandMark /><a className="home-link" href="#">На главную</a></header>
    <nav className="steps" aria-label="Этапы записи">{[1, 2, 3, 4, 5].map((step) => <div key={step} className={`step-item ${step < 3 ? 'step-item--complete' : ''} ${step === 3 ? 'step-item--current' : ''}`} aria-current={step === 3 ? 'step' : undefined}><span className="step-number">{step}</span><span className="step-line" /></div>)}</nav></>;
}
function Footer() {
  return <footer className="site-footer"><div className="footer-content"><div className="footer-brand-block"><BrandMark footer /><p>Стрижем быстро и красиво</p></div><section className="footer-column"><h2>Контакты</h2><p className="footer-contact"><span className="footer-icon" aria-hidden="true">⌖</span> ул. Садовая, 15, Москва</p><p className="footer-contact"><span className="footer-icon footer-phone" aria-hidden="true">☎</span> <a href="tel:+74951234567">+7 (495) 123-45-67</a></p></section><section className="footer-column"><h2>Режим работы</h2><p>Пн–Пт: 9:00 – 21:00</p><p>Сб–Вс: 10:00 – 19:00</p></section></div><div className="footer-bottom"><p>© 2026. Все права защищены.</p><a href="#privacy">Политика конфиденциальности</a></div></footer>;
}
function Calendar({ currentMonth, selectedDate, onSelectDate, onChangeMonth }) {
  const cells = useMemo(() => buildCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth()), [currentMonth]);
  const monthName = MONTH_NAMES.format(currentMonth);
  const title = monthName.charAt(0).toLocaleUpperCase('ru-RU') + monthName.slice(1);
  const canGoBack = currentMonth.getFullYear() > DEMO_TODAY.getFullYear() || currentMonth.getMonth() > DEMO_TODAY.getMonth();
  return <section className="panel calendar-panel" aria-labelledby="calendar-title"><div className="panel-heading calendar-heading"><h2 id="calendar-title" className="month-title">{title}</h2><div className="month-controls"><button className="month-arrow" type="button" aria-label="Предыдущий месяц" disabled={!canGoBack} onClick={() => onChangeMonth(-1)}>‹</button><button className="month-arrow" type="button" aria-label="Следующий месяц" onClick={() => onChangeMonth(1)}>›</button></div></div><div className="calendar-weekdays" aria-hidden="true">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((day) => <span key={day}>{day}</span>)}</div><div className="day-grid" aria-label="Дни месяца">{cells.map(({ date, otherMonth }) => { const disabled = otherMonth || isBeforeToday(date); const classNames = ['day-cell', otherMonth ? 'day-cell--outside' : '', !otherMonth && isBeforeToday(date) ? 'day-cell--disabled' : '', sameDay(date, selectedDate) ? 'day-cell--selected' : ''].filter(Boolean).join(' '); return <button key={dateKey(date)} type="button" className={classNames} disabled={disabled} aria-pressed={sameDay(date, selectedDate)} aria-label={DATE_FORMATTER.format(date)} onClick={() => onSelectDate(date)}>{date.getDate()}</button>; })}</div></section>;
}
function TimeSlots({ selectedDate, selectedTime, onSelectTime }) {
  const slots = !selectedDate ? [] : (selectedDate.getDate() % 2 === 0 ? TIMES : ALTERNATE_TIMES);
  return <section className="panel time-panel" aria-labelledby="time-title"><h2 id="time-title" className="panel-title">Доступное время</h2><div className="time-grid">{!selectedDate ? <p className="slots-message">Сначала выберите дату.</p> : slots.map((slot) => <button key={slot.time} type="button" className={`time-slot ${!slot.available ? 'time-slot--unavailable' : ''} ${slot.time === selectedTime ? 'time-slot--selected' : ''}`} disabled={!slot.available} aria-pressed={slot.time === selectedTime} onClick={() => onSelectTime(slot.time)}>{!slot.available ? <><span>{slot.time}</span><small>Занято</small></> : slot.time}</button>)}</div></section>;
}
function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5, 1));
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATE);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const summary = selectedDate ? `${DATE_FORMATTER.format(selectedDate)}${selectedTime ? ` ${selectedTime}` : ' · выберите время'}` : 'Выберите дату';
  function changeMonth(offset) { setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1)); setSelectedDate(null); setSelectedTime(null); }
  function selectDate(date) { setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate())); setSelectedTime(null); }
  function continueBooking() { if (!selectedDate || !selectedTime) { window.alert('Сначала выберите дату и свободное время.'); return; } window.alert(`Вы выбрали: ${summary}`); }
  return <div className="page"><Header /><main className="main-content"><div className="content-wrap"><div className="page-heading"><button className="back-button" type="button" aria-label="Назад" onClick={() => window.alert('Это демонстрационный экран шага 3 из 5.')}><span aria-hidden="true">←</span></button><h1 className="heading-label">Выберите дату и время</h1></div><div className="booking-layout"><Calendar currentMonth={currentMonth} selectedDate={selectedDate} onSelectDate={selectDate} onChangeMonth={changeMonth} /><TimeSlots selectedDate={selectedDate} selectedTime={selectedTime} onSelectTime={setSelectedTime} /></div><div className="booking-bottom-bar"><div className="selection-summary" aria-live="polite">{summary}</div><button className="next-button" type="button" onClick={continueBooking}>Далее</button></div></div></main><Footer /></div>;
}
export default App;
