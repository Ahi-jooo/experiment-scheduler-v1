// Real Google OAuth & Calendar Integration 

let tokenClient;
let accessToken = null;

function initGoogleApi() {
  const btnLogin = document.getElementById('googleOAuthLoginBtn');
  const btnLogout = document.getElementById('googleLogoutBtn');
  const userInfo = document.getElementById('userInfo');
  const btnSyncAll = document.getElementById('syncAllToCalendarBtn');

  // GIS SDK Loading check
  window.addEventListener('load', () => {
    if (typeof google === 'undefined' || !google.accounts) {
      console.error("Google Identity Services script failed to load.");
      return;
    }
    
    // ICSダウンロード用ボタンを追加で作成する（常に使えるように）
    const icsBtn = document.createElement('button');
    icsBtn.className = 'btn btn-outline';
    icsBtn.innerHTML = `<span class="material-icons-round">download</span> ${t('ical_download')}`;
    icsBtn.onclick = exportICS;
    btnLogin.parentNode.insertBefore(icsBtn, btnLogin);

    // Check Client ID
    const clientId = getState().settings.googleClientId;
    
    if (clientId) {
      btnLogin.style.display = 'inline-flex';
      btnLogin.innerHTML = `<span class="material-icons-round">login</span> ${t('oauth_direct')}`;
      
      // Init OAuth client
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            accessToken = tokenResponse.access_token;
            // UI Update
            btnLogin.style.display = 'none';
            userInfo.style.display = 'flex';
            btnSyncAll.style.display = 'inline-flex';
            document.getElementById('userName').textContent = t('calendar_syncing');
            alert(t('alert_oauth_success'));
          }
        },
      });
    } else {
      // IDが無い場合はOAuthボタンは隠す
      btnLogin.style.display = 'none';
    }
  });

  if(btnLogin) {
    btnLogin.addEventListener('click', (e) => {
      // ユーザーがfile://で開いているかチェックして警告
      if (window.location.protocol === 'file:') {
        if (!confirm(t('alert_oauth_file_warning'))) {
          return;
        }
      }

      const clientId = getState().settings.googleClientId;
      if (clientId && tokenClient) {
        tokenClient.requestAccessToken({prompt: 'consent'});
      }
    });
  }

  if(btnLogout) {
    btnLogout.addEventListener('click', () => {
      accessToken = null;
      userInfo.style.display = 'none';
      btnSyncAll.style.display = 'none';
      btnLogin.style.display = 'inline-flex';
    });
  }

  if(btnSyncAll) {
    btnSyncAll.addEventListener('click', async () => {
      if (!accessToken) {
        alert(t('alert_login_needed')); return;
      }
      const data = getState().scheduledExperiments;
      if (!data || data.length === 0) {
        alert(t('alert_no_schedule')); return;
      }

      btnSyncAll.innerHTML = `<span class="material-icons-round">sync</span> ${t('sync_in_progress')}`;
      btnSyncAll.disabled = true;

      let successCount = 0;
      let errorCount = 0;

      for (const exp of data) {
        for (const block of exp.blocks) {
          const isAction = block.type === 'action';
          const colorId = isAction ? "11" : "8"; // 11:Red, 8:Gray
          
          const blockDate = new Date(block.date);
          const start = new Date(blockDate.getTime());
          start.setHours(Math.floor(block.startMin / 60), block.startMin % 60, 0, 0);
          
          const end = new Date(blockDate.getTime());
          end.setHours(Math.floor(block.endMin / 60), block.endMin % 60, 0, 0);

          const eventBody = {
            summary: `[${exp.name}] ${block.name}`,
            description: isAction ? "操作工程" : "待機工程",
            start: {
              dateTime: start.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: end.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            colorId: colorId,
            reminders: {
              useDefault: false,
              overrides: isAction ? [ { method: "popup", minutes: 5 } ] : []
            }
          };

          try {
            const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(eventBody)
            });
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              const errBody = await response.json();
              console.error(errBody);
            }
          } catch(e) {
            console.error("Event creation failed", e);
            errorCount++;
          }
        }
      }

      btnSyncAll.innerHTML = `<span class="material-icons-round">sync</span> ${t('sync_execution')}`;
      btnSyncAll.disabled = false;

      if (errorCount > 0) {
        alert(`${successCount}${t('sync_failed_partially')}`);
      } else {
        alert(`${successCount}${t('sync_success_all')}`);
      }
    });
  }
}

function exportICS() {
  const data = getState().scheduledExperiments;
  if (!data || data.length === 0) {
    alert(t('dl_no_schedule')); return;
  }

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lab Scheduler//EN",
    "CALSCALE:GREGORIAN"
  ];
  const pad = (n) => String(n).padStart(2, '0');
  
  // ファイル生成時のタイムスタンプ（更新判定・重複防止用）
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  data.forEach(exp => {
    let indexMap = {};

    exp.blocks.forEach(block => {
      // Overnight等の分割ブロック対応用カウンタ
      if (indexMap[block.originalIndex] === undefined) {
        indexMap[block.originalIndex] = 0;
      } else {
        indexMap[block.originalIndex]++;
      }
      const chunk = indexMap[block.originalIndex];

      const blockDate = new Date(block.date);
      const start = new Date(blockDate.getTime());
      start.setHours(Math.floor(block.startMin / 60), block.startMin % 60, 0, 0);
      const end = new Date(blockDate.getTime());
      end.setHours(Math.floor(block.endMin / 60), block.endMin % 60, 0, 0);

      const dtstart = `${start.getFullYear()}${pad(start.getMonth()+1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
      const dtend = `${end.getFullYear()}${pad(end.getMonth()+1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
      
      // 実験IDとステップ番号を用いた一意の固定UID（これにより2回目以降のインポートは上書き更新になる）
      const uid = `${exp.id}-step${block.originalIndex}-chunk${chunk}@labscheduler`;
      
      icsLines.push("BEGIN:VEVENT");
      icsLines.push(`UID:${uid}`);
      icsLines.push(`DTSTAMP:${dtstamp}`);
      icsLines.push(`DTSTART;TZID=Asia/Tokyo:${dtstart}`);
      icsLines.push(`DTEND;TZID=Asia/Tokyo:${dtend}`);
      icsLines.push(`SUMMARY:[${exp.name}] ${block.name}`);
      icsLines.push(`DESCRIPTION:${block.type === 'action' ? t('action_process') : t('wait_process')}`);
      if (block.type === 'action') {
        icsLines.push("BEGIN:VALARM");
        icsLines.push("ACTION:DISPLAY");
        icsLines.push("DESCRIPTION:Reminder");
        icsLines.push("TRIGGER:-PT5M");
        icsLines.push("END:VALARM");
      }
      icsLines.push("END:VEVENT");
    });
  });

  icsLines.push("END:VCALENDAR");
  const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `All_Experiments.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
