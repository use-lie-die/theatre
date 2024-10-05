const SESSIONS = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const MAX_DAYS_AHEAD = 7;
const MAX_DAYS_BEHIND = -7;

const datePicker = document.getElementById("date-picker");
const sessionsContainer = document.getElementById("sessions");
const seatsContainer = document.getElementById("seats");
const reserveButton = document.getElementById("reserve-btn");

const today = new Date();
const localStorageKey = 'movie-bookings';

let selectedSeats = [];

initializeDatePicker();
loadSeatsFromStorage();

function initializeDatePicker() {
  const minDate = getFormattedDate(addDays(today, MAX_DAYS_BEHIND));
  const maxDate = getFormattedDate(addDays(today, MAX_DAYS_AHEAD));
  datePicker.setAttribute('min', minDate);
  datePicker.setAttribute('max', maxDate);
  datePicker.value = getFormattedDate(today);

  datePicker.addEventListener('change', handleDateChange);
  handleDateChange();
};

function getFormattedDate(date) {
  return date.toISOString().split('T')[0];
};

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

function handleDateChange() {
  const selectedDate = new Date(datePicker.value);
  renderSessions(selectedDate);
};

function renderSessions(selectedDate) {
  sessionsContainer.innerHTML = '';

  const isArchive = selectedDate < today;

  SESSIONS.forEach((time, index) => {
    const sessionDiv = document.createElement('div');
    sessionDiv.classList.add('session');
    sessionDiv.textContent = `Сеанс ${time}`;
    
    if (isArchive || isPastSession(selectedDate, time)) {
      sessionDiv.classList.add('archived');
    } else {
      sessionDiv.addEventListener('click', () => handleSessionClick(selectedDate, time));
    }

    sessionsContainer.appendChild(sessionDiv);
  });
};

function isPastSession(date, time) {
  const [hours] = time.split(':');
  const sessionDate = new Date(date);
  sessionDate.setHours(hours, 0, 0, 0);
  return sessionDate < new Date();
};

function handleSessionClick(date, time) {
  renderSeats(date, time);
};

function renderSeats(date, time) {
  seatsContainer.innerHTML = '';
  const seatStatus = getSeatStatus(date, time);

  for (let i = 0; i < 30; i++) {
    const seatDiv = document.createElement('div');
    seatDiv.classList.add('seat');
    
    if (seatStatus[i]) {
      seatDiv.classList.add('booked');
    } else {
      seatDiv.addEventListener('click', () => handleSeatClick(seatDiv, date, time, i));
    }

    seatsContainer.appendChild(seatDiv);
  };
};

function handleSeatClick(seatDiv, date, time, seatIndex) {
  seatDiv.classList.toggle('selected');

  if (seatDiv.classList.contains('selected')) {
    selectedSeats.push(seatIndex);
  } else {
    selectedSeats = selectedSeats.filter(index => index !== seatIndex);
  }

  reserveButton.disabled = selectedSeats.length === 0;

  reserveButton.onclick = () => {
    selectedSeats.forEach(seatIndex => saveBooking(date, time, seatIndex));
    renderSeats(date, time);
    reserveButton.disabled = true;
    selectedSeats = [];
  };
};

function getSeatStatus(date, time) {
  const bookings = JSON.parse(localStorage.getItem(localStorageKey)) || {};
  const sessionKey = `${date}-${time}`;
  return bookings[sessionKey] || Array(30).fill(false);
};

function saveBooking(date, time, seatIndex) {
  const bookings = JSON.parse(localStorage.getItem(localStorageKey)) || {};
  const sessionKey = `${date}-${time}`;
  if (!bookings[sessionKey]) bookings[sessionKey] = Array(30).fill(false);
  bookings[sessionKey][seatIndex] = true;

  localStorage.setItem(localStorageKey, JSON.stringify(bookings));
};