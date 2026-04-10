let state = {
  schedules: [],
  templates: [],
};

function loadState() {
  const saved = localStorage.getItem('labSchedulerState');
  if (saved) {
    state = JSON.parse(saved);
  }
}

function saveState() {
  localStorage.setItem('labSchedulerState', JSON.stringify(state));
}
