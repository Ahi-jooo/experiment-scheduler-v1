function renderCalendar() {
  const calendar = document.getElementById('calendar');
  if (!calendar) return;

  calendar.innerHTML = '';

  state.schedules.forEach(schedule => {
    const div = document.createElement('div');
    div.textContent = schedule.name;
    calendar.appendChild(div);
  });
}
