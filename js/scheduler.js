function addSchedule(schedule) {
  state.schedules.push(schedule);
  saveState();
  renderCalendar();
}

function createSchedule(name, startDate, steps) {
  return {
    id: Date.now(),
    name,
    startDate,
    steps,
  };
}
