// State management with LocalStorage persistence

const STATE_KEY = 'labSchedulerState_v2';

const defaultState = {
  // New experiment builder defaults
  draftExperiment: {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    steps: [
      { id: '1', name: 'サンプル調製', durationMin: 30, type: 'action' },
      { id: '2', name: 'インキュベーション', durationMin: 60, type: 'wait' }
    ]
  },
  // Saved templates
  templates: [], 
  // Global unavailability rules
  unavailableTimes: [],
  // Multi-experiment timeline data
  scheduledExperiments: [],
  // System settings
  settings: {
    googleClientId: '',
    syncCalendar: false,
    language: 'ja' // 'ja' | 'en'
  }
};

let state = { ...defaultState };

function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...defaultState, ...parsed };
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getState() {
  return state;
}

function setState(newStatePartial) {
  state = { ...state, ...newStatePartial };
  saveState();
}

/**
 * テンプレート操作
 */
function saveTemplate(name) {
  const newTemplate = {
    id: Date.now().toString(),
    name: name || state.draftExperiment.name || 'No Name',
    steps: JSON.parse(JSON.stringify(state.draftExperiment.steps))
  };
  setState({ templates: [...state.templates, newTemplate] });
}

function loadTemplate(id) {
  const template = state.templates.find(t => t.id === id);
  if (template) {
    const draft = { ...state.draftExperiment };
    draft.name = template.name;
    draft.steps = JSON.parse(JSON.stringify(template.steps));
    setState({ draftExperiment: draft });
  }
}

function removeTemplate(id) {
  setState({ templates: state.templates.filter(t => t.id !== id) });
}

/**
 * 不可時間操作
 */
function addUnavailableTime(rule) {
  rule.id = Date.now().toString();
  setState({ unavailableTimes: [...state.unavailableTimes, rule] });
}

function removeUnavailableTime(id) {
  setState({ unavailableTimes: state.unavailableTimes.filter(t => t.id !== id) });
}

/**
 * スケジュール（実験予定）の管理
 */
function addScheduledExperiment(experiment) {
  setState({ scheduledExperiments: [...state.scheduledExperiments, experiment] });
}

function updateScheduledExperiment(id, updatedExperiment) {
  const newData = state.scheduledExperiments.map(e => e.id === id ? updatedExperiment : e);
  setState({ scheduledExperiments: newData });
}

function removeScheduledExperiment(id) {
  setState({ scheduledExperiments: state.scheduledExperiments.filter(e => e.id !== id) });
}
