// UI Logic using FullCalendar

let calendarInstance = null;
let activeEventId = null;

function initUI() {
  bindSidebarEvents();
  bindSettingsEvents();
  renderAllSidebar();
  initCalendar();
}

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek'
    },
    slotMinTime: "08:00:00",
    slotMaxTime: "24:00:00",
    allDaySlot: false,
    editable: true,
    eventDurationEditable: true,
    selectable: true,
    height: '100%',
    locale: state.settings.language || 'ja',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    events: getEventsData(),
    
    // 日付・時間のクリックによる予定の一括登録
    dateClick: function(info) {
      handleDateClick(info);
    },
    
    // ドラッグによる時間枠の伸縮（所要時間の変更）
    eventResize: function(info) {
      if (!confirm(t("confirm_resize"))) {
        info.revert();
        return;
      }
      handleDurationChange(info.event);
    },

    // ドラッグによる全体の時間移動
    eventDrop: function(info) {
      if (!confirm(t("confirm_time_shift"))) {
        info.revert();
        return;
      }
      handleTimeShift(info.event);
    },

    // 予定のクリック（詳細・削除）
    eventClick: function(info) {
      showEventInfo(info.event);
    }
  });

  calendarInstance.render();
}

/** 輝度計算により背景色に合うテキスト色(白or黒)を返す */
function getContrastColor(hexcolor){
  hexcolor = hexcolor.replace("#", "");
  // #RGB形式の場合 #RRGGBBに変換
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(char => char + char).join('');
  }
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

/** Converts state.scheduledExperiments to FullCalendar events */
function getEventsData() {
  const state = getState();
  const events = [];
  
  if (!state.scheduledExperiments) return [];

  const palette = ['#0056b3', '#28a745', '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#d63384', '#17a2b8'];

  state.scheduledExperiments.forEach((exp, expIdx) => {
    // 互換性のため古いデータにはループインデックス色を当てる
    const baseColor = exp.color || palette[expIdx % palette.length];
    
    exp.blocks.forEach(block => {
      // LocalStorageから復元された場合は文字列になっているため、Dateオブジェクトに変換する
      const blockDate = new Date(block.date);
      
      const startObj = new Date(blockDate.getTime());
      startObj.setHours(Math.floor(block.startMin / 60), block.startMin % 60, 0, 0);
      
      const endObj = new Date(blockDate.getTime());
      endObj.setHours(Math.floor(block.endMin / 60), block.endMin % 60, 0, 0);

      const isWait = block.type === 'wait';
      
      // Hex to RGB for transparency
      let r = parseInt(baseColor.slice(1, 3), 16) || 0;
      let g = parseInt(baseColor.slice(3, 5), 16) || 0;
      let b = parseInt(baseColor.slice(5, 7), 16) || 0;
      
      const contrastText = getContrastColor(baseColor);

      events.push({
        id: `${exp.id}_${block.id || block.originalIndex}`,
        title: `[${exp.name}] ${block.name}`,
        start: startObj,
        end: endObj,
        backgroundColor: isWait ? `rgba(${r}, ${g}, ${b}, 0.2)` : baseColor,
        borderColor: baseColor,
        textColor: isWait ? '#333333' : contrastText,
        extendedProps: {
          experimentId: exp.id,
          originalIndex: block.originalIndex,
          type: block.type,
          durationMin: block.actualDuration || block.durationMin,
          blockName: block.name
        }
      });
    });
  });

  return events;
}

function refreshCalendar() {
  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(getEventsData());
  }
}

/** カレンダー側からの日付クリック・エリア選択で、サイドバーに日時を反映し即座に登録を促す */
function handleDateClick(info) {
  const dateObj = info.date;
  const pad = (n) => String(n).padStart(2, '0');
  
  const ymd = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`;
  // 終日の枠をクリックした場合はデフォルト9時に
  const hhmm = info.allDay ? '09:00' : `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

  // サイドバーの State に反映
  const draft = getState().draftExperiment;
  draft.startDate = ymd;
  draft.startTime = hhmm;
  setState({ draftExperiment: draft });
  
  // HTML側（入力枠）にも反映
  document.getElementById('startDate').value = ymd;
  document.getElementById('startTime').value = hhmm;

  // すぐに登録させる
  const expName = draft.name ? draft.name : t("new_experiment");
  if (confirm(t("confirm_click_add"))) {
    document.getElementById('addExperimentoToCalendarBtn').click();
  }
}

/** ドラッグ下端変更による所要時間変更 */
function handleDurationChange(eventObj) {
  const expId = eventObj.extendedProps.experimentId;
  const originalIndex = eventObj.extendedProps.originalIndex;
  
  // 計算された新しいDuration (ミリ秒 / 60000)
  const diffMs = eventObj.end.getTime() - eventObj.start.getTime();
  const newDuration = Math.round(diffMs / 60000);

  const state = getState();
  const exp = state.scheduledExperiments.find(e => e.id === expId);
  if (!exp) return;

  // 該当ステップのDurationを更新
  exp.templateSteps[originalIndex].durationMin = newDuration;

  // 再計算してブロックを更新
  exp.blocks = generateSchedule(exp.startTime, exp.templateSteps, state.unavailableTimes, exp.startDate);
  
  updateScheduledExperiment(expId, exp);
  refreshCalendar();
}

/** ドラッグ移動による開始時刻変更 */
function handleTimeShift(eventObj) {
  const expId = eventObj.extendedProps.experimentId;
  const originalIndex = eventObj.extendedProps.originalIndex;

  const state = getState();
  const exp = state.scheduledExperiments.find(e => e.id === expId);
  if (!exp) return;

  // もし一番最初のブロックを動かした場合は、全体のstartTime / startDateを修正する
  if (originalIndex === 0) {
    const pad = (n) => String(n).padStart(2, '0');
    exp.startDate = `${eventObj.start.getFullYear()}-${pad(eventObj.start.getMonth()+1)}-${pad(eventObj.start.getDate())}`;
    exp.startTime = `${pad(eventObj.start.getHours())}:${pad(eventObj.start.getMinutes())}`;
  } else {
    // 途中のブロックを動かした場合、差分を計算して前の待機時間を延ばす・縮める
    // 現時点では複雑になるため、再計算のトリガーまたは警告を出す。今回は一旦先頭のみの操作か、無視する。
    alert(t("alert_timeshift_invalid"));
    refreshCalendar();
    return;
  }

  // 再計算
  exp.blocks = generateSchedule(exp.startTime, exp.templateSteps, state.unavailableTimes, exp.startDate);
  updateScheduledExperiment(expId, exp);
  refreshCalendar();
}

/** 予定詳細モーダル */
function showEventInfo(eventObj) {
  activeEventId = eventObj.extendedProps.experimentId;
  
  document.getElementById('eventInfoTitle').textContent = eventObj.title;
  
  const pad = (n) => String(n).padStart(2, '0');
  const startStr = `${pad(eventObj.start.getHours())}:${pad(eventObj.start.getMinutes())}`;
  const endStr = `${pad(eventObj.end.getHours())}:${pad(eventObj.end.getMinutes())}`;
  
  document.getElementById('eventInfoTime').textContent = `${startStr} - ${endStr}`;
  document.getElementById('eventInfoType').textContent = eventObj.extendedProps.type === 'action' ? t('action_process') : t('wait_process');
  document.getElementById('eventInfoDuration').textContent = eventObj.extendedProps.durationMin;

  const state = getState();
  const exp = state.scheduledExperiments.find(e => e.id === activeEventId);
  if (exp && exp.color) {
    document.getElementById('eventInfoColor').value = exp.color.toUpperCase();
  }

  document.getElementById('eventInfoModal').classList.add('active');
}

// モーダル内のカラーピッカーで色を変更したときのイベント
document.getElementById('eventInfoColor').addEventListener('change', (e) => {
  if (activeEventId) {
    const state = getState();
    const exp = state.scheduledExperiments.find(e => e.id === activeEventId);
    if (exp) {
      exp.color = e.target.value;
      updateScheduledExperiment(activeEventId, exp);
      refreshCalendar();
    }
  }
});

document.getElementById('deleteExperimentBtn').addEventListener('click', () => {
  if (activeEventId && confirm("この一連の実験スケジュールをすべて削除しますか？")) {
    removeScheduledExperiment(activeEventId);
    activeEventId = null;
    document.getElementById('eventInfoModal').classList.remove('active');
    refreshCalendar();
  }
});
document.getElementById('closeEventInfoModal').addEventListener('click', () => {
  document.getElementById('eventInfoModal').classList.remove('active');
});

/** 
 * サイドバー関連のUIロジック 
 */
function bindSidebarEvents() {
  document.getElementById('addStepBtn').addEventListener('click', () => {
    const draft = getState().draftExperiment;
    const newStep = {
      id: Date.now().toString(),
      name: '新規ステップ',
      durationMin: 10,
      type: 'action'
    };
    draft.steps.push(newStep);
    setState({ draftExperiment: draft });
    renderSteps();
  });

  document.getElementById('experimentName').addEventListener('input', (e) => {
    const draft = getState().draftExperiment;
    draft.name = e.target.value;
    setState({ draftExperiment: draft });
  });
  document.getElementById('startDate').addEventListener('change', (e) => {
    const draft = getState().draftExperiment;
    draft.startDate = e.target.value;
    setState({ draftExperiment: draft });
  });
  document.getElementById('startTime').addEventListener('change', (e) => {
    const draft = getState().draftExperiment;
    draft.startTime = e.target.value;
    setState({ draftExperiment: draft });
  });

  document.getElementById('saveTemplateBtn').addEventListener('click', () => {
    saveTemplate(getState().draftExperiment.name);
    renderTemplates();
    alert('テンプレートを保存しました。');
  });

  document.getElementById('templateSelect').addEventListener('change', (e) => {
    const btn = document.getElementById('deleteTemplateBtn');
    if (e.target.value) {
      loadTemplate(e.target.value);
      renderAllSidebar();
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  });

  document.getElementById('deleteTemplateBtn').addEventListener('click', () => {
    const select = document.getElementById('templateSelect');
    const tId = select.value;
    if (tId && confirm(t("confirm_delete_tmp"))) {
      removeTemplate(tId);
      renderTemplates();
    }
  });

  // ★★ カレンダーに実験を追加するボタン ★★
  document.getElementById('addExperimentoToCalendarBtn').addEventListener('click', () => {
    const state = getState();
    const draft = state.draftExperiment;
    
    if (!draft.name) {
       alert(t("prompt_enter_name")); return;
    }

    // Generate blocks
    const blocks = generateSchedule(draft.startTime, draft.steps, state.unavailableTimes, draft.startDate);

    // Save as scheduled experiment
    const newExp = {
      id: Date.now().toString(),
      name: draft.name,
      color: document.getElementById('experimentColor').value || '#FFB6C1', // サイドバーで選択された色
      startDate: draft.startDate,
      startTime: draft.startTime,
      templateSteps: JSON.parse(JSON.stringify(draft.steps)),
      blocks: blocks
    };
    
    addScheduledExperiment(newExp);
    
    // Refresh Calendar visually
    refreshCalendar();

    // カレンダーを表示上の当該日付にする
    if (calendarInstance) {
      calendarInstance.gotoDate(draft.startDate);
    }
  });
}

function bindSettingsEvents() {
  // Config Modals
  document.getElementById('openSettingsBtn').addEventListener('click', () => {
    const state = getState();
    document.getElementById('settingClientId').value = state.settings.googleClientId || '';
    if (state.settings.language) {
      document.getElementById('settingLanguage').value = state.settings.language;
    }
    renderUnavailableTimes();
    document.getElementById('settingsModal').classList.add('active');
  });

  document.getElementById('closeSettingsModal').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('active');
  });

  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const clientId = document.getElementById('settingClientId').value;
    const lang = document.getElementById('settingLanguage').value;
    setState({ settings: { ...getState().settings, googleClientId: clientId, language: lang }});
    applyTranslationsToDOM();
    if (calendarInstance) {
      calendarInstance.setOption('locale', lang);
      refreshCalendar();
    }
    document.getElementById('settingsModal').classList.remove('active');
    alert(t("alert_settings_saved"));
  });

  // Unavailable rules (nested modal)
  document.getElementById('addUnavailableBtn').addEventListener('click', () => {
    document.getElementById('unavailableModal').classList.add('active');
  });
  document.getElementById('closeUnavailableModal').addEventListener('click', () => {
    document.getElementById('unavailableModal').classList.remove('active');
  });
  
  const radioGroup = document.querySelectorAll('input[name="unavailType"]');
  radioGroup.forEach(r => r.addEventListener('change', (e) => {
    if (e.target.value === 'weekly') {
      document.getElementById('unavailDaySelector').style.display = 'block';
      document.getElementById('unavailDateSelector').style.display = 'none';
    } else {
      document.getElementById('unavailDaySelector').style.display = 'none';
      document.getElementById('unavailDateSelector').style.display = 'block';
    }
  }));

  document.getElementById('saveUnavailableBtn').addEventListener('click', () => {
    const type = document.querySelector('input[name="unavailType"]:checked').value;
    const rule = { type };
    if (type === 'weekly') {
      rule.day = document.getElementById('unavailDay').value;
    } else {
      rule.date = document.getElementById('unavailDate').value;
      if (!rule.date) return alert('日付を選択してください');
    }
    rule.start = document.getElementById('unavailStart').value;
    rule.end = document.getElementById('unavailEnd').value;
    
    // validate
    if (timeToMin(rule.start) >= timeToMin(rule.end)) {
      return alert('開始時刻は終了時刻より前に設定してください');
    }

    addUnavailableTime(rule);
    document.getElementById('unavailableModal').classList.remove('active');
    renderUnavailableTimes();
  });
}

function renderAllSidebar() {
  const draft = getState().draftExperiment;
  document.getElementById('experimentName').value = draft.name;
  document.getElementById('startDate').value = draft.startDate;
  document.getElementById('startTime').value = draft.startTime;
  
  renderSteps();
  renderTemplates();
}

function renderSteps() {
  const draft = getState().draftExperiment;
  const list = document.getElementById('stepList');
  list.innerHTML = '';

  draft.steps.forEach((step, index) => {
    const li = document.createElement('li');
    li.className = 'step-item';
    li.innerHTML = `
      <span class="material-icons-round drag-handle" style="cursor:ns-resize; color:var(--border);">drag_indicator</span>
      <div class="step-inputs">
        <div class="step-row">
          <input type="text" value="${step.name}" class="step-name-input" data-index="${index}" placeholder="${t('step_name_ph')}">
          <select class="step-type-select" data-index="${index}">
            <option value="action" ${step.type === 'action' ? 'selected' : ''}>${t('step_type_action')}</option>
            <option value="wait" ${step.type === 'wait' ? 'selected' : ''}>${t('step_type_wait')}</option>
          </select>
        </div>
        <div class="step-row">
          <label style="margin:0;">${t('step_duration_lbl')}</label>
          <input type="number" value="${step.durationMin}" class="step-duration-input" data-index="${index}" min="10" step="10" style="width: 70px;"> min
        </div>
      </div>
      <button class="btn btn-icon delete-step-btn" data-index="${index}"><span class="material-icons-round">delete</span></button>
    `;
    list.appendChild(li);
  });

  // Bind inputs
  document.querySelectorAll('.step-name-input').forEach(i => i.addEventListener('change', e => {
    const draft = getState().draftExperiment;
    draft.steps[e.target.dataset.index].name = e.target.value;
    setState({ draftExperiment: draft });
  }));
  document.querySelectorAll('.step-type-select').forEach(i => i.addEventListener('change', e => {
    const draft = getState().draftExperiment;
    draft.steps[e.target.dataset.index].type = e.target.value;
    setState({ draftExperiment: draft });
  }));
  document.querySelectorAll('.step-duration-input').forEach(i => i.addEventListener('change', e => {
    const draft = getState().draftExperiment;
    draft.steps[e.target.dataset.index].durationMin = parseInt(e.target.value, 10);
    setState({ draftExperiment: draft });
  }));
  document.querySelectorAll('.delete-step-btn').forEach(btn => btn.addEventListener('click', e => {
    const draft = getState().draftExperiment;
    draft.steps.splice(e.currentTarget.dataset.index, 1);
    setState({ draftExperiment: draft });
    renderSteps();
  }));
}

function renderTemplates() {
  const state = getState();
  const select = document.getElementById('templateSelect');
  const btn = document.getElementById('deleteTemplateBtn');
  const currentVal = select.value;

  select.innerHTML = `<option value="">${t('scratch_template')}</option>`;
  state.templates.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    select.appendChild(opt);
  });

  if (state.templates.find(t => t.id === currentVal)) {
    select.value = currentVal;
    btn.disabled = false;
  } else {
    select.value = "";
    btn.disabled = true;
  }
}

function renderUnavailableTimes() {
  const list = document.getElementById('unavailableList');
  const items = getState().unavailableTimes;
  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">設定なし</p>';
    return;
  }

  const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  list.innerHTML = '';
  items.forEach(rule => {
    const div = document.createElement('div');
    div.className = 'rule-item';
    let text = rule.type === 'weekly' ? `毎週 ${DAYS[parseInt(rule.day, 10)]}曜日 ` : `${rule.date} `;
    text += `${rule.start}〜${rule.end}`;

    div.innerHTML = `
      <span>${text}</span>
      <button class="btn btn-icon delete-rule-btn" data-id="${rule.id}"><span class="material-icons-round">delete</span></button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll('.delete-rule-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeUnavailableTime(e.currentTarget.dataset.id);
      renderUnavailableTimes();
    });
  });
}
