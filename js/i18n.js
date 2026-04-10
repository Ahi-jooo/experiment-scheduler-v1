const i18nDict = {
  // Common
  "app_title": {
    "ja": "Lab Scheduler",
    "en": "Lab Scheduler"
  },
  
  // Header
  "sync_execution": { "ja": "同期実行", "en": "Sync" },
  "oauth_direct": { "ja": "直接連携(OAuth)", "en": "OAuth Connect" },
  "ical_download": { "ja": "iCal出力", "en": "Export iCal" },
  "calendar_syncing": { "ja": "カレンダー連携中", "en": "Calendar Synced" },
  
  // Sidebar Main
  "new_schedule": { "ja": "新規スケジュールの作成", "en": "Create New Schedule" },
  "experiment_name": { "ja": "実験名", "en": "Experiment Name" },
  "experiment_name_ph": { "ja": "例: Western blot", "en": "e.g. Western blot" },
  "start_date": { "ja": "開始日", "en": "Start Date" },
  "start_time": { "ja": "開始時刻", "en": "Start Time" },
  "schedule_color": { "ja": "予定カラー", "en": "Schedule Color" },
  
  // Colors
  "color_black": { "ja": "黒", "en": "Black" },
  "color_charcoal": { "ja": "濃炭", "en": "Charcoal" },
  "color_gray": { "ja": "グレー", "en": "Gray" },
  "color_silver": { "ja": "シルバー", "en": "Silver" },
  "color_white": { "ja": "白", "en": "White" },
  "color_pink": { "ja": "ライトピンク", "en": "Light Pink" },
  "color_peach": { "ja": "ピーチ", "en": "Peach" },
  "color_lemon": { "ja": "レモン", "en": "Lemon" },
  "color_blue": { "ja": "ライトブルー", "en": "Light Blue" },
  "color_green": { "ja": "ペールグリーン", "en": "Pale Green" },
  
  // Template Buttons
  "save_template": { "ja": "現在のステップをテンプレート保存", "en": "Save as Template" },
  "load_template": { "ja": "テンプレート読込", "en": "Load Template" },
  "scratch_template": { "ja": "-- スクラッチから作成 --", "en": "-- Create from scratch --" },
  "delete_template_btn": { "ja": "テンプレートを削除", "en": "Delete template" },
  
  // Steps Panel
  "process_steps": { "ja": "工程ステップ", "en": "Process Steps" },
  "add_btn": { "ja": "追加", "en": "Add" },
  "add_to_calendar": { "ja": "カレンダーに登録", "en": "Add to Calendar" },
  
  // Step items
  "step_name_ph": { "ja": "ステップ名", "en": "Step Name" },
  "step_type_action": { "ja": "操作", "en": "Action" },
  "step_type_wait": { "ja": "待機", "en": "Wait" },
  "step_duration_lbl": { "ja": "時間", "en": "Duration" },
  
  // Settings Modal
  "settings_title": { "ja": "システム設定", "en": "System Settings" },
  "guide_title": { "ja": "💡 使い方ガイド", "en": "💡 How to Use" },
  "guide_t1": { "ja": "<b>スケジュールの作成</b>：左パネルで実験の各工程の所要時間（時間）を設定し、「カレンダーに登録」を押します。", "en": "<b>Create Schedule</b>: Set step durations in the left panel, and click 'Add to Calendar'." },
  "guide_t2": { "ja": "<b>カレンダーへの直接登録</b>：カレンダーの空き枠（日時）を直接クリックすると、現在の実験予定を一発で登録できます。", "en": "<b>Direct Registration</b>: Click any empty slot on the calendar to instantly add your current draft experiment." },
  "guide_t3": { "ja": "<b>時間の再調整 (ドラッグ)</b>：枠の下端をドラッグで伸縮させると所要時間が変わり、後続ステップも自動で玉突き式に再計算されます。", "en": "<b>Resize Duration</b>: Drag the bottom edge of a block to resize its duration. Subsequent steps will be recalculated automatically." },
  "guide_t4": { "ja": "<b>カレンダーへの共有</b>：右上の「iCal出力」から全ての予定を.ics形式でダウンロードし、ファイルをお使いのGoogleカレンダーやOutlook等にインポート（取り込み）することで予定の共有が可能です。", "en": "<b>Share App Calendar</b>: Click 'Export iCal' at the top right to download all schedules as a .ics file. Import this file into Google Calendar or Outlook to easily share your schedule." },
  "guide_t5": { "ja": "<b>実験不可時間のスキップ</b>：本設定画面下部の「実験不可時間の管理」で会議・土日などをブロックしておくと、玉突き計算時にその時間を自動で避けて配置されます。", "en": "<b>Skip Unavailable Times</b>: Set unavailable blocks (like meetings or weekends) in 'Unavailable Times Management' below. The scheduler will automatically skip these times." },
  "language_lbl": { "ja": "言語 (Language)", "en": "Language (言語)" },
  "oauth_section": { "ja": "Google カレンダー連携 (OAuth)", "en": "Google Calendar Integration (OAuth)" },
  "oauth_client_id": { "ja": "OAuth クライアント ID", "en": "OAuth Client ID" },
  "oauth_client_id_ph": { "ja": "IDを入力してください", "en": "Enter Client ID here" },
  "oauth_desc": { 
    "ja": "実際のカレンダーに連携する場合はGoogle Cloudで取得したIDをここに入力して保存します。", 
    "en": "To connect with a real calendar, enter your Google Cloud Client ID here." 
  },
  "unavailable_title": { "ja": "実験不可時間の管理", "en": "Unavailable Times Management" },
  "none_set": { "ja": "設定なし", "en": "None set" },
  "save_settings": { "ja": "設定を保存", "en": "Save Settings" },
  
  // Unavailable Modal
  "unavail_add_title": { "ja": "不可時間の追加", "en": "Add Unavailable Time" },
  "type_lbl": { "ja": "種類", "en": "Type" },
  "weekly_lbl": { "ja": "毎週（曜日固定）", "en": "Weekly (Fixed day)" },
  "single_lbl": { "ja": "単発日時", "en": "Single DateTime" },
  "day_lbl": { "ja": "曜日", "en": "Day of the week" },
  "date_lbl": { "ja": "日付", "en": "Date" },
  "end_time": { "ja": "終了時刻", "en": "End Time" },
  "add_action": { "ja": "追加", "en": "Add" },
  
  // Arrays
  "day_0": { "ja": "日曜日", "en": "Sunday" },
  "day_1": { "ja": "月曜日", "en": "Monday" },
  "day_2": { "ja": "火曜日", "en": "Tuesday" },
  "day_3": { "ja": "水曜日", "en": "Wednesday" },
  "day_4": { "ja": "木曜日", "en": "Thursday" },
  "day_5": { "ja": "金曜日", "en": "Friday" },
  "day_6": { "ja": "土曜日", "en": "Saturday" },
  
  // Event Info Modal
  "event_details": { "ja": "予定詳細", "en": "Event Details" },
  "event_time_lbl": { "ja": "時刻", "en": "Time" },
  "event_type_lbl": { "ja": "種類", "en": "Type" },
  "display_color_lbl": { "ja": "表示カラー", "en": "Display Color" },
  "delete_exp_btn": { "ja": "この実験スケジュール全体を削除", "en": "Delete Entire Schedule" },
  
  // JavaScript Alerts/Confirms
  "alert_oauth_success": { 
    "ja": "Google認証に成功しました。「同期実行」ボタンから現在のすべての予定をカレンダーに登録できます。", 
    "en": "Google Auth successful. You can register all schedules to the calendar via the Sync button." 
  },
  "alert_oauth_file_warning": {
    "ja": "【警告】現在のURL(file://)からはGoogleのセキュリティ仕様により「400エラー」で連携が弾かれます。\n\nOAuth連携を使うにはローカルサーバー(http://localhost)上で起動し、Google Cloud Consoleで許可オリジンとして設定する必要があります。\n\n※特別な設定環境がない場合は、隣の「iCal出力」ボタンをご利用ください。\n\nそれでもログイン画面を開きますか？",
    "en": "[WARNING] OAuth login will fail with a 400 error when opened from file:// due to Google security policies.\n\nTo use OAuth, serve this app locally (http://localhost) and set the origin in the Google Cloud Console.\n\nIf not, please use the 'Export iCal' button instead.\n\nOpen login screen anyway?"
  },
  "alert_login_needed": { "ja": "Googleログインが必要です。", "en": "Google login is required." },
  "alert_no_schedule": { "ja": "カレンダーに登録する予定がありません。", "en": "No schedules to register." },
  "sync_in_progress": { "ja": "登録中...", "en": "Syncing..." },
  "sync_failed_partially": { "ja": "件成功、失敗があります。コンソールを確認してください。", "en": "succeeded, some failed. Check console." },
  "sync_success_all": { "ja": "のすべての予定をGoogleカレンダーに登録完了しました！", "en": "schedules successfully synced to Google Calendar!" },
  "dl_no_schedule": { "ja": "ダウンロードする予定がありません。", "en": "No schedules to download." },
  
  // i18n
  "action_process": { "ja": "操作工程", "en": "Action Process" },
  "wait_process": { "ja": "待機工程", "en": "Wait Process" },
  
  "confirm_resize": { "ja": "所要時間を変更し、後続のスケジュールを再計算しますか？", "en": "Change duration and recalculate subsequent steps?" },
  "confirm_time_shift": { "ja": "スケジュールの時刻を変更し、再計算しますか？", "en": "Change schedule time and recalculate?" },
  "alert_timeshift_invalid": { "ja": "注: 途中ステップの移動は無効化されます。", "en": "Note: Moving intermediate steps is disabled." },
  "confirm_delete_all": { "ja": "この一連の実験スケジュールをすべて削除しますか？", "en": "Delete this entire experiment schedule?" },
  "prompt_enter_name": { "ja": "実験名を入力してください。", "en": "Please enter an experiment name." },
  
  "confirm_click_add": { 
    "ja": "作成中（選択中）の予定を 一括登録しますか？", 
    "en": "Do you want to add the current drafted schedule starting at this time?" 
  },
  "alert_template_saved": { "ja": "テンプレートを保存しました。", "en": "Template saved." },
  "confirm_delete_tmp": { "ja": "選択中のテンプレートを削除しますか？", "en": "Delete selected template?" },
  "new_experiment": { "ja": "新しい実験", "en": "New Experiment" },
  "new_step": { "ja": "新規ステップ", "en": "New Step" },
  "alert_settings_saved": { "ja": "設定を保存しました。一部の変更は再読み込み後に反映されます。", "en": "Settings saved. Some changes will apply after a reload." },
  "alert_need_date": { "ja": "日付を選択してください", "en": "Please select a date." },
  "alert_invalid_time": { "ja": "開始時刻は終了時刻より前に設定してください", "en": "Start time must be before end time." }
};

function t(key, params = {}) {
  const state = typeof getState === 'function' ? getState() : {settings:{language:'ja'}};
  const lang = state.settings.language || 'ja';
  
  let text = i18nDict[key] ? i18nDict[key][lang] : key;
  
  // Replace params like {number}
  for (const p in params) {
    text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
  }
  return text;
}

function applyTranslationsToDOM() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    
    // Check if it's an input/textarea placeholder
    if (el.tagName === 'INPUT' && el.type === 'text') {
      // Special case for placeholder
      if (el.hasAttribute('placeholder')) {
        el.placeholder = text;
      } else {
        el.value = text;
      }
    } else {
       // Insert HTML safely or textContent
       // We allow textContent to avoid removing icon spans if we must, but we assume data-i18n target has ONLY text inside its node, OR we separate the icon.
       // It's safer to just set text content. 
       
       // E.g. <span data-i18n="foo"></span> inside button
       el.innerHTML = text;
    }
  });
}
