let draggedItemIndex = null;

function initUI() {
  bindEvents();
  renderAll();
}

function bindEvents() {
  document.getElementById('addStepBtn').addEventListener('click', () => {
    const state = getState();
    const newStep = {
      id: Date.now().toString(),
      name: '新規ステップ',
      durationMin: 10,
      type: 'action'
    };
    setState({ steps: [...state.steps, newStep] });
    renderSteps();
  });

  document.getElementById('experimentName').addEventListener('input', (e) => {
    setState({ experimentName: e.target.value });
  });

  document.getElementById('startTime').addEventListener('change', (e) => {
    setState({ startTime: e.target.value });
  });

  document.getElementById('saveTemplateBtn').addEventListener('click', () => {
    const name = getState().experimentName || 'No Name';
    saveTemplate(name);
    renderTemplates();
    alert('テンプレートを保存しました。');
  });

  document.getElementById('templateSelect').addEventListener('change', (e) => {
    if (e.target.value) {
      loadTemplate(e.target.value);
      renderAll();
    }
  });

  document.getElementById('generateScheduleBtn').addEventListener('click', () => {
    const state = getState();
    const blocks = generateSchedule(state.startTime, state.steps, state.unavailableTimes);
    renderTimeline(blocks);
  });

  // Modal logic
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
  
  document.getElementById('syncCalendarToggle').addEventListener('change', (e) => {
     setState({ syncCalendar: e.target.checked });
  });
}

function renderAll() {
  const state = getState();
  document.getElementById('experimentName').value = state.experimentName;
  document.getElementById('startTime').value = state.startTime;
  document.getElementById('syncCalendarToggle').checked = state.syncCalendar;
  
  renderSteps();
  renderTemplates();
  renderUnavailableTimes();
}

function renderSteps() {
  const state = getState();
  const list = document.getElementById('stepList');
  list.innerHTML = '';

  state.steps.forEach((step, index) => {
    const li = document.createElement('li');
    li.className = 'step-item';
    li.draggable = true;
    li.dataset.index = index;

    li.innerHTML = `
      <span class="material-icons-round drag-handle">drag_indicator</span>
      <div class="step-inputs">
        <div class="step-row">
          <input type="text" value="${step.name}" class="step-name-input" data-index="${index}" placeholder="ステップ名">
          <select class="step-type-select" data-index="${index}">
            <option value="action" ${step.type === 'action' ? 'selected' : ''}>操作</option>
            <option value="wait" ${step.type === 'wait' ? 'selected' : ''}>待機</option>
          </select>
        </div>
        <div class="step-row">
          <label style="margin:0;">所要時間</label>
          <input type="number" value="${step.durationMin}" class="step-duration-input" data-index="${index}" min="10" step="10" style="width: 80px;"> min
        </div>
      </div>
      <button class="btn btn-icon delete-step-btn" data-index="${index}"><span class="material-icons-round">delete</span></button>
    `;

    // Drag Events
    li.addEventListener('dragstart', (e) => {
      draggedItemIndex = index;
      setTimeout(() => li.classList.add('dragging'), 0);
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      draggedItemIndex = null;
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingEl = document.querySelector('.dragging');
      if (draggingEl && draggingEl !== li) {
        // Find position and reorder in DOM visually
        const bounding = li.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if (e.clientY - offset > 0) {
          li.style.borderBottom = '2px solid var(--primary)';
          li.style.borderTop = '';
        } else {
          li.style.borderTop = '2px solid var(--primary)';
          li.style.borderBottom = '';
        }
      }
    });
    li.addEventListener('dragleave', () => {
      li.style.borderTop = '';
      li.style.borderBottom = '';
    });
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.style.borderTop = '';
      li.style.borderBottom = '';
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      
      const newSteps = [...state.steps];
      const item = newSteps.splice(draggedItemIndex, 1)[0];
      
      const bounding = li.getBoundingClientRect();
      const offset = bounding.y + (bounding.height / 2);
      const insertIdx = (e.clientY - offset > 0) ? index + 1 : index;
      
      // Compute actual insert index considering the splice
      const actualInsertIdx = insertIdx > draggedItemIndex ? insertIdx - 1 : insertIdx;
      newSteps.splice(actualInsertIdx, 0, item);
      setState({ steps: newSteps });
      renderSteps();
    });

    list.appendChild(li);
  });

  // Inputs binding
  document.querySelectorAll('.step-name-input').forEach(input => {
    input.addEventListener('change', (e) => updateStep(e.target.dataset.index, { name: e.target.value }));
  });
  document.querySelectorAll('.step-type-select').forEach(select => {
    select.addEventListener('change', (e) => updateStep(e.target.dataset.index, { type: e.target.value }));
  });
  document.querySelectorAll('.step-duration-input').forEach(input => {
    input.addEventListener('change', (e) => updateStep(e.target.dataset.index, { durationMin: parseInt(e.target.value, 10) }));
  });
  document.querySelectorAll('.delete-step-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      const newSteps = [...getState().steps];
      newSteps.splice(idx, 1);
      setState({ steps: newSteps });
      renderSteps();
    });
  });
}

function updateStep(index, changes) {
  const newSteps = [...getState().steps];
  newSteps[index] = { ...newSteps[index], ...changes };
  setState({ steps: newSteps });
}

function renderTemplates() {
  const state = getState();
  const select = document.getElementById('templateSelect');
  select.innerHTML = '<option value="">-- 選択または新規作成 --</option>';
  state.templates.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    select.appendChild(opt);
  });
}

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
function renderUnavailableTimes() {
  const list = document.getElementById('unavailableList');
  const items = getState().unavailableTimes;
  if (items.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">設定なし</p>';
    return;
  }

  list.innerHTML = '';
  items.forEach(rule => {
    const div = document.createElement('div');
    div.className = 'rule-item';
    
    let text = '';
    if (rule.type === 'weekly') {
      text = `毎週 ${DAYS[parseInt(rule.day, 10)]}曜日 `;
    } else {
      text = `${rule.date} `;
    }
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

function renderTimeline(blocks) {
  const canvas = document.getElementById('timelineCanvas');
  canvas.innerHTML = '';
  
  if (blocks.length === 0) {
    canvas.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round">event_note</span>
        <p>ブロックがありません</p>
      </div>
    `;
    return;
  }

  // Group by date
  const blocksByDate = {};
  blocks.forEach(b => {
    const dateStr = b.date.toISOString().split('T')[0];
    if (!blocksByDate[dateStr]) blocksByDate[dateStr] = [];
    blocksByDate[dateStr].push(b);
  });

  const dates = Object.keys(blocksByDate).sort();
  const PIXELS_PER_MIN = 1.5; // Custom scale

  dates.forEach(dateStr => {
    const dayData = blocksByDate[dateStr];
    
    const dayDiv = document.createElement('div');
    dayDiv.className = 'timeline-day';
    
    const h3 = document.createElement('h3');
    h3.className = 'timeline-day-header';
    h3.textContent = dateStr;
    dayDiv.appendChild(h3);

    const track = document.createElement('div');
    track.className = 'timeline-track';
    
    dayData.forEach(block => {
      const blockEl = document.createElement('div');
      blockEl.className = 'time-block';
      
      const durationStr = block.actualDuration ? block.actualDuration : block.durationMin;
      const heightPx = Math.max(durationStr * PIXELS_PER_MIN, 40); // min height 40px
      blockEl.style.height = `${heightPx}px`;

      const typeClass = block.type === 'action' ? 'block-action' : 'block-wait';

      blockEl.draggable = true;
      blockEl.addEventListener('dragstart', (e) => handleTimelineDragStart(e, block.originalIndex));
      blockEl.addEventListener('dragend', (e) => handleTimelineDragEnd(e, block.originalIndex));

      blockEl.innerHTML = `
        <div class="time-label">${block.startTimeStr}</div>
        <div class="block-content ${typeClass}" title="上下にドラッグして時間を10分単位で前倒し/後倒し">
          <div class="block-title">${block.name}</div>
          <div class="block-duration">${block.startTimeStr} - ${block.endTimeStr} (${durationStr} min)</div>
        </div>
      `;
      track.appendChild(blockEl);
    });

    dayDiv.appendChild(track);
    canvas.appendChild(dayDiv);
  });
  
  if (getState().syncCalendar) {
    syncWithGoogleCalendar(blocks);
  }
}

let timelineDragStartY = 0;

function handleTimelineDragStart(e, originalIndex) {
  timelineDragStartY = e.clientY;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', originalIndex); // required for Firefox
  e.target.style.opacity = '0.7';
}

function handleTimelineDragEnd(e, originalIndex) {
  e.target.style.opacity = '1';
  const deltaY = e.clientY - timelineDragStartY;
  const PIXELS_PER_MIN = 1.5;
  // 10分単位にするため、15px単位で丸める
  const deltaMin = Math.round(deltaY / (PIXELS_PER_MIN * 10)) * 10;
  
  if (deltaMin !== 0) {
    adjustSchedule(originalIndex, deltaMin);
  }
}

function adjustSchedule(originalIndex, deltaMin) {
  const state = getState();
  const steps = [...state.steps];

  if (originalIndex === 0) {
    // 先頭ステップの場合は全体の開始時刻をずらす
    let min = timeToMin(state.startTime) + deltaMin;
    if (min < 0) min += 24 * 60;
    setState({ startTime: minToTime(min) });
  } else {
    if (deltaMin > 0) {
      // 後ろ倒し（遅延）：前のステップが待機なら延長、そうでないなら待機ステップを新規挿入
      let prevStep = steps[originalIndex - 1];
      if (prevStep.type === 'wait') {
        prevStep.durationMin += deltaMin;
      } else {
        steps.splice(originalIndex, 0, {
          id: Date.now().toString(),
          name: '時間調整',
          durationMin: deltaMin,
          type: 'wait'
        });
      }
    } else {
      // 前倒し：前の待機ステップを短縮する
      let remainingToReduce = -deltaMin;
      let prevIdx = originalIndex - 1;
      
      while (remainingToReduce > 0 && prevIdx >= 0) {
        let prev = steps[prevIdx];
        if (prev.type === 'wait') {
          if (prev.durationMin >= remainingToReduce) {
            prev.durationMin -= remainingToReduce;
            remainingToReduce = 0;
            if (prev.durationMin === 0) {
              steps.splice(prevIdx, 1);
            }
          } else {
            remainingToReduce -= prev.durationMin;
            steps.splice(prevIdx, 1);
          }
        } else {
          break; // 操作工程は短縮不可
        }
        prevIdx--;
      }
      
      // それ以上前倒しできない分は全体の開始時間を前倒し
      if (remainingToReduce > 0 && prevIdx < 0) {
        let min = timeToMin(state.startTime) - remainingToReduce;
        if (min < 0) min += 24 * 60;
        setState({ startTime: minToTime(min) });
      }
    }
    setState({ steps });
  }
  
  // 再描画
  renderAll();
  document.getElementById('generateScheduleBtn').click();
}
