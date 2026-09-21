// THE KEYBOARD, IN ONE TABLE.
//
// Every shortcut Phosphene answers to is a row here: the keys, where it
// works, and what it does. Three consumers read it and nothing else:
//
//   * the Docs page "Keyboard shortcuts" (webapp/js/docs.js renders it);
//   * the Editor's Keys popover (sbeKeysLegend in editor.js);
//   * the tooltips — any element with data-shortcut="<id>" gets its keys
//     appended to its title, and code that builds a title at runtime calls
//     shortcutHint(id).
//
// Rows with `run` are HANDLED here, by the one listener at the bottom, so the
// row and the behaviour cannot disagree. Rows without `run` describe a
// handler that lives next to the thing it acts on (the Editor, the Outputs
// lightbox, the Storyboard grade keys, the Images canvas); `owner` names the
// file, and test_docs_and_shortcuts.py drives the Editor's real handler with
// every Editor row's keys and asserts it calls the function the row names.
//
// Conventions, so a person who cuts in Premiere / Final Cut / Resolve or
// works in Photoshop / After Effects already knows them: Space plays,
// ⌘Z / ⇧⌘Z undo and redo, ⌘S saves, S / ⌘K / ⌘B split at the playhead,
// ⌫ lifts and ⇧⌫ ripple-deletes, ↑ ↓ jump between cuts, N toggles snapping,
// ⇧Z fits the timeline, ⌘⏎ submits the prompt you are typing in, ⌘⌫ moves
// to the Trash like Finder, Esc closes what is on top, ⇧1–⇧7 switch pages the
// way Resolve's ⇧ + number does. Nothing here claims a combination the
// browser or macOS reserves (SHORTCUT_RESERVED) — ⌘R is reload, never render.

// Where a shortcut works. The order is the order the Docs page shows them.
const SHORTCUT_SCOPES = [
  { id: 'global', title: '어디서나',
    note: '텍스트 박스에 치는 동안은 안 먹습니다. ⌘⏎와 Esc만 예외.' },
  { id: 'prompt', title: '프롬프트를 쓸 때',
    note: '텍스트 박스 안에서 됩니다.' },
  { id: 'outputs', title: 'Outputs와 플레이어',
    note: '영상, 원샷, 이미지, 오디오 탭에서 결과가 선택된 때.' },
  { id: 'editor', title: '편집 — 키',
    note: '편집 탭에 타임라인이 열려 있을 때. 트랙 위 Keys가 같은 목록입니다.' },
  { id: 'editor-mouse', title: '편집 — 마우스와 수정키',
    note: '클릭하거나 드래그하는 동안 수정키를 누르세요.' },
  { id: 'storyboard', title: '스토리보드', note: '먼저 샷 카드를 눌러 포커스하세요.' },
  { id: 'canvas', title: '이미지 — Layout 캔버스',
    note: 'Ideogram 4 Layout 모드에서 박스가 선택된 때.' },
];

const SHORTCUT_TABS = ['manual', 'oneshot', 'studio', 'storyboard', 'editor', 'audio', 'train'];

const SHORTCUTS = [
  // ---- anywhere -------------------------------------------------------------
  // `?` is what a US keyboard reports; ⇧/ is the same physical chord as some
  // layouts and synthesized events report it.
  { id: 'docs.open', scope: 'global', combos: ['?'], hidden: ['shift+slash'], owner: 'shortcuts.js',
    label: '이 페이지의 문서 열기',
    run: () => { if (typeof openDocs !== 'function') return false; openDocs('shortcuts'); } },
  { id: 'tabs.switch', scope: 'global', owner: 'shortcuts.js',
    combos: ['shift+digit1', 'shift+digit2', 'shift+digit3', 'shift+digit4',
             'shift+digit5', 'shift+digit6', 'shift+digit7'],
    display: [['⇧', '1'], ['⇧', '7']], displayJoin: '–',
    label: '탭 전환: 1 영상 · 2 원샷 · 3 이미지 · 4 스토리보드 · 5 편집 · 6 오디오 · 7 캐릭터 학습',
    run: (ev) => {
      const n = Number(String(ev.code || '').replace('Digit', ''));
      const tab = SHORTCUT_TABS[n - 1];
      if (!tab || typeof workflowSwitch !== 'function') return false;
      workflowSwitch(tab);
    } },
  { id: 'search.focus', scope: 'global', combos: ['mod+f'], owner: 'shortcuts.js',
    label: '화면의 검색 칸으로 — Outputs, 편집 미디어 풀, LoRA 브라우저, 문서. 없으면 브라우저 찾기가 열립니다.',
    run: () => shortcutFocusSearch() },
  { id: 'escape.close', scope: 'global', combos: ['escape'], owner: 'health.js, engines.js',
    label: '맨 위 닫기 — 대화상자, 메뉴, 문서, 확대 플레이어' },

  // ---- typing a prompt --------------------------------------------------------
  { id: 'prompt.generate', scope: 'prompt', combos: ['mod+enter'], typing: true,
    owner: 'shortcuts.js (Video, Images) · oneshot.js (One Shot)',
    label: '생성 — 영상·이미지·원샷 프롬프트에서. 생성 버튼을 누르는 것과 같아 렌더가 대기열에 들어갑니다.',
    run: (ev) => shortcutGenerateFrom(ev.target) },
  { id: 'oneshot.beats', scope: 'prompt', combos: ['enter', 'backspace'], owner: 'oneshot.js',
    label: '원샷 비트: ⏎ 다음 비트 · 빈 비트에서 ⌫는 하나 전으로' },

  // ---- outputs and the player -------------------------------------------------
  { id: 'player.toggle', scope: 'outputs', combos: ['space'], owner: 'shortcuts.js',
    label: '선택한 결과 재생 / 일시정지',
    run: (ev) => shortcutTogglePlayer(ev) },
  { id: 'outputs.step', scope: 'outputs', combos: ['arrowleft', 'arrowright'], owner: 'queue.js',
    label: '이전 / 다음 결과 — 끝에서 순환, 확대 플레이어에서도' },
  { id: 'outputs.expand', scope: 'outputs', combos: ['f'], owner: 'queue.js',
    label: '선택한 결과를 전체 화면 (Esc로 닫기)' },
  { id: 'outputs.trash', scope: 'outputs', combos: ['mod+backspace'], owner: 'shortcuts.js',
    label: '선택한 결과를 휴지통으로 — 카드 휴지통처럼 먼저 묻습니다',
    run: () => shortcutTrashOutput() },

  // ---- the Editor: keys ---------------------------------------------------------
  // `calls` is the function the Editor's own keydown handler runs for these
  // keys; the test drives the real handler and holds it to this.
  { id: 'editor.play', scope: 'editor', combos: ['space'], owner: 'editor.js',
    calls: 'sbeTogglePlay', label: '재생 / 일시정지' },
  { id: 'editor.frame', scope: 'editor', combos: ['arrowleft', 'arrowright'], owner: 'editor.js',
    calls: 'sbeSeek', label: '플레이헤드를 한 프레임' },
  { id: 'editor.frame10', scope: 'editor', combos: ['shift+arrowleft', 'shift+arrowright'],
    owner: 'editor.js', calls: 'sbeSeek', label: '플레이헤드를 열 프레임' },
  { id: 'editor.cut', scope: 'editor', combos: ['arrowup', 'arrowdown'], owner: 'editor.js',
    calls: 'sbeJumpCut', label: '이전 / 다음 컷으로' },
  { id: 'editor.ends', scope: 'editor', combos: ['home', 'end'], owner: 'editor.js',
    calls: 'sbeSeek', label: '시퀀스 처음 / 끝 (노트북은 fn ← / fn →)' },
  { id: 'editor.nudge', scope: 'editor', combos: ['alt+arrowleft', 'alt+arrowright'],
    hidden: ['alt+shift+arrowleft', 'alt+shift+arrowright'], owner: 'editor.js',
    calls: 'sbeNudge', label: '선택 클립을 한 프레임 앞 / 뒤 · ⇧면 열 프레임' },
  { id: 'editor.split', scope: 'editor', combos: ['s', 'mod+k', 'mod+b'], owner: 'editor.js',
    calls: 'sbeSplitHere', label: '플레이헤드 아래 샷을 스플릿 — 오디오 트랙 소리가 선택돼 있으면 그 소리 (S, Premiere의 ⌘K, Final Cut·Resolve의 ⌘B)' },
  { id: 'editor.lift', scope: 'editor', combos: ['backspace'], hidden: ['delete'], owner: 'editor.js',
    calls: 'sbeLiftSelected', label: '리프트 — 선택 클립·소리를 빼고 구멍을 남김' },
  { id: 'editor.ripple', scope: 'editor', combos: ['shift+backspace'], hidden: ['shift+delete'],
    owner: 'editor.js', calls: 'sbeRippleSelected',
    label: '리플 삭제 — 빼고 틈을 닫음 (소리는 자기 트랙에서)' },
  { id: 'editor.removeOverlay', scope: 'editor', combos: ['backspace'], hidden: ['delete'],
    owner: 'editor.js', calls: 'sbeOvDeleteSel', label: '타이틀이나 카드가 선택돼 있으면: 제거' },
  { id: 'editor.removeTransition', scope: 'editor', combos: ['backspace'], hidden: ['delete'],
    owner: 'editor.js', calls: 'sbeTxRemoveSel', label: '컷이 선택돼 있으면: 트랜지션 제거' },
  { id: 'editor.duplicate', scope: 'editor', combos: ['d'], owner: 'editor.js',
    calls: 'sbeDuplicateSel', label: '선택 클립·소리 복제 — 음악과 클립 소리는 오디오 트랙으로 복사' },
  { id: 'editor.link', scope: 'editor', combos: ['shift+l'], owner: 'editor.js',
    calls: 'sbeToggleAudioLink', label: '소리 언링크 / 링크' },
  { id: 'editor.resync', scope: 'editor', combos: ['shift+r'], owner: 'editor.js',
    calls: 'sbeResyncSel', label: '리스싱크 — 소리를 자기 그림 아래로' },
  { id: 'editor.selectAll', scope: 'editor', combos: ['mod+a'], owner: 'editor.js',
    calls: 'sbeSelectAll', label: '클립 전부 선택' },
  // Escape never closes the timeline: no editor closes a project on Escape,
  // and the Escape that closed the Docs used to shut the film behind them.
  // Closing is the ⋯ menu's Close.
  { id: 'editor.deselect', scope: 'editor', combos: ['escape'], owner: 'editor.js',
    calls: 'sbeSelectNone', label: '열린 메뉴를 닫고 선택 해제 (타임라인은 안 닫음)' },
  { id: 'editor.zoom', scope: 'editor', combos: ['plus', 'minus'], hidden: ['equals', 'underscore'],
    owner: 'editor.js', calls: 'sbeZoom', label: '타임라인 줌 인 / 아웃' },
  { id: 'editor.fit', scope: 'editor', combos: ['shift+z'], hidden: ['backslash'], owner: 'editor.js',
    calls: 'sbeZoomFit', label: '시퀀스 전체를 창에 맞추기' },
  { id: 'editor.snap', scope: 'editor', combos: ['n'], owner: 'editor.js',
    calls: 'sbeToggleSnap', label: '비트 스냅 켜기 / 끄기' },
  { id: 'editor.mute', scope: 'editor', combos: ['m'], owner: 'editor.js',
    calls: ['sbeSetMute', 'sbeUnmuteFromRefusal'],
    label: '프리뷰 음소거 / 해제 — 필름은 안 바뀜' },
  // THE SPLIT. Sound mode is the one thing that changes it: the sound lanes
  // at full height and the picture small, or back. The ⌁ button on the tool
  // row and the ▾ on the A1 head are the same control.
  { id: 'editor.soundMode', scope: 'editor', combos: ['shift+a'], owner: 'editor.js',
    calls: 'sbeSoundModeToggle',
    label: '사운드 모드 켜기 / 끄기 — 소리 레인이 크고 그림이 작음 (⌁ 사운드와 A1 헤드 ▾와 같음)' },
  { id: 'editor.inspector', scope: 'editor', combos: ['mod+i'], owner: 'editor.js',
    calls: 'sbeInspectToggle',
    label: 'Inspector 열기 / 닫기 — 속도, 페이드, 밝기, 줌, 트랜지션, 타이틀 (클립 더블클릭도)' },
  { id: 'editor.fullscreen', scope: 'editor', combos: ['f'], owner: 'editor.js',
    calls: 'sbeFullscreen',
    label: '프로그램 모니터 전체 화면 — F 또는 Esc로 돌아옴' },
  { id: 'editor.panels', scope: 'editor', combos: ['backquote'], display: [['`']], owner: 'editor.js',
    calls: 'sbePanelsToggle',
    label: '미디어 풀과 대기열 숨기기 / 보이기, 컷이 창을 쓰게 (Photoshop Tab)' },
  { id: 'editor.undo', scope: 'editor', combos: ['mod+z'], owner: 'editor.js',
    calls: 'sbeUndo', label: '실행 취소' },
  { id: 'editor.redo', scope: 'editor', combos: ['shift+mod+z'], owner: 'editor.js',
    calls: 'sbeRedo', label: '다시 실행' },
  { id: 'editor.save', scope: 'editor', combos: ['mod+s'], owner: 'editor.js',
    calls: 'sbeSaveNow', label: '초안 저장' },
  { id: 'editor.render', scope: 'editor', combos: ['mod+e'], owner: 'editor.js',
    calls: 'sbeRenderFilm', label: '타임라인을 한 파일로 렌더 (⌘E, Final Cut Export)' },

  // ---- the Editor: mouse -----------------------------------------------------------
  { id: 'editor.click', scope: 'editor-mouse', display: [['Click']], owner: 'editor.js',
    label: '클립 선택 · 트랙 빈 곳을 누르면 선택 해제' },
  { id: 'editor.shiftClick', scope: 'editor-mouse', display: [['⇧', 'Click']], owner: 'editor.js',
    label: '선택된 클립부터 여기까지 범위 선택' },
  { id: 'editor.cmdClick', scope: 'editor-mouse', display: [['⌘', 'Click']], owner: 'editor.js',
    label: '선택에 클립 하나 더하거나 빼기' },
  { id: 'editor.drag', scope: 'editor-mouse', display: [['Drag']], owner: 'editor.js',
    label: '클립 이동 — 또는 선택 전부, 소리 포함 · 가장자리 드래그가 트림 · 음악 스트립도 같음' },
  { id: 'editor.cmdDrag', scope: 'editor-mouse', display: [['⌘', 'Drag']], owner: 'editor.js',
    label: '리플 — 클립 뒤도 같이 밀림' },
  { id: 'editor.altDrag', scope: 'editor-mouse', display: [['⌥', 'Drag']], owner: 'editor.js',
    label: '드래그하는 동안 비트 그리드 무시' },
  { id: 'editor.altShiftDrag', scope: 'editor-mouse', display: [['⌥', '⇧', 'Drag']], owner: 'editor.js',
    label: '이동 대신 순서 바꾸기' },
  { id: 'editor.rightClick', scope: 'editor-mouse', display: [['Right-click']], owner: 'editor.js',
    label: '포인터에 클립 바 버튼, 앞으로 / 뒤로 · 구멍에서: 이 구멍 닫기 또는 여기에 샷 생성' },
  { id: 'editor.levels', scope: 'editor-mouse', display: [['Click'], ['⇧', 'Click']], displayJoin: ' / ',
    owner: 'editor.js',
    label: '언링크 소리의 레벨 점: 노란 선 클릭이 추가 · 드래그가 레벨 · ⇧-클릭 또는 우클릭이 제거' },
  { id: 'editor.wheel', scope: 'editor-mouse', display: [['⌥', 'Scroll'], ['⇧', 'Scroll']], displayJoin: ' / ',
    owner: 'editor.js',
    label: '트랙 위에서: ⌥ + 스크롤(또는 트랙패드 핀치)이 줌 · ⇧ + 스크롤이 팬' },
  { id: 'editor.tlEdge', scope: 'editor-mouse', display: [['Drag'], ['Double-click']], displayJoin: ' / ',
    owner: 'editor.js',
    label: '타임라인 윗가장자리: 위로 드래그하면 트랙이 높아짐 · 더블클릭 리셋 · 포커스 때 ↑ ↓' },

  // ---- storyboard ------------------------------------------------------------------
  { id: 'storyboard.grade', scope: 'storyboard', combos: ['k', 'r', 'c'], owner: 'storyboard.js',
    label: '포커스된 샷 그레이드: K Keep · R Re-roll · C Cut — 같은 키 다시면 해제' },
  { id: 'storyboard.collapse', scope: 'storyboard', combos: ['escape'], owner: 'storyboard.js',
    label: '도킹된 플레이어를 샷 목록으로 접기' },

  // ---- images: the layout canvas -------------------------------------------------
  { id: 'canvas.nudge', scope: 'canvas', combos: ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'],
    owner: 'stage.js', label: '선택 박스 살짝 밀기 · ⇧면 더 크게' },
  { id: 'canvas.delete', scope: 'canvas', combos: ['backspace'], hidden: ['delete'], owner: 'stage.js',
    label: '선택 박스 삭제' },
  { id: 'canvas.deselect', scope: 'canvas', combos: ['escape'], owner: 'stage.js',
    label: '박스 선택 해제 · 글 편집 중이면 편집 끝내기' },
  { id: 'canvas.undo', scope: 'canvas', combos: ['mod+z'], owner: 'stage.js', label: '실행 취소' },
];

// Combinations the browser or macOS keeps for itself. A page that claims one
// either cannot (the OS wins) or breaks something people rely on — ⌘R was the
// Editor's Render key and turned a reload into a queued render.
const SHORTCUT_RESERVED = [
  'mod+w', 'mod+q', 'mod+t', 'mod+n', 'mod+r', 'mod+l', 'mod+h', 'mod+m',
  'mod+tab', 'mod+backquote', 'mod+space', 'shift+mod+t', 'shift+mod+n',
  'shift+mod+r', 'mod+comma', 'mod+p',
];

// ---- combos ----------------------------------------------------------------
const _SC_KEYNAMES = {
  space: ' ', enter: 'enter', escape: 'escape', backspace: 'backspace', delete: 'delete',
  arrowleft: 'arrowleft', arrowright: 'arrowright', arrowup: 'arrowup', arrowdown: 'arrowdown',
  home: 'home', end: 'end', plus: '+', minus: '-', equals: '=', underscore: '_',
  backslash: '\\', backquote: '`', comma: ',', tab: 'tab', slash: '/',
};
// Keys whose character already needs Shift on a US layout: their combos do not
// say shift, and matching ignores it.
const _SC_SHIFTED = new Set(['?', '+', '_']);

function shortcutParse(combo) {
  const parts = String(combo).toLowerCase().split('+');
  const out = { mod: false, shift: false, alt: false, ctrl: false, key: '', code: '' };
  for (const p of parts) {
    if (p === 'mod') out.mod = true;
    else if (p === 'shift') out.shift = true;
    else if (p === 'alt') out.alt = true;
    else if (p === 'ctrl') out.ctrl = true;
    else if (/^digit\d$/.test(p)) out.code = 'Digit' + p.slice(5);
    else out.key = (p in _SC_KEYNAMES) ? _SC_KEYNAMES[p] : p;
  }
  return out;
}

// One normal form, so `shift+mod+z` and `mod+shift+z` are the same entry in
// the reserved check and in the tests.
function shortcutNormalise(combo) {
  const c = shortcutParse(combo);
  const bits = [];
  if (c.ctrl) bits.push('ctrl');
  if (c.alt) bits.push('alt');
  if (c.shift) bits.push('shift');
  if (c.mod) bits.push('mod');
  const inv = Object.fromEntries(Object.entries(_SC_KEYNAMES).map(([k, v]) => [v, k]));
  bits.push(c.code ? c.code.toLowerCase() : (inv[c.key] || c.key));
  return bits.join('+');
}

function shortcutMatches(ev, combo) {
  const c = shortcutParse(combo);
  if (!ev) return false;
  const mod = !!(ev.metaKey || ev.ctrlKey);
  if (c.mod !== mod) return false;
  if (c.alt !== !!ev.altKey) return false;
  if (c.code) {
    if (ev.code !== c.code) return false;
  } else {
    if (String(ev.key || '').toLowerCase() !== c.key) return false;
  }
  if (!_SC_SHIFTED.has(c.key) && c.shift !== !!ev.shiftKey) return false;
  return true;
}

// ---- glyphs ----------------------------------------------------------------
const _SC_GLYPH = {
  ' ': 'Space', enter: '⏎', escape: '⎋ Esc', backspace: '⌫', delete: '⌦',
  arrowleft: '←', arrowright: '→', arrowup: '↑', arrowdown: '↓',
  home: 'Home', end: 'End', '+': '+', '-': '−', '\\': '\\',
};

// Apple's order: ⌃ ⌥ ⇧ ⌘, then the key.
function shortcutTokens(combo) {
  const c = shortcutParse(combo);
  const t = [];
  if (c.ctrl) t.push('⌃');
  if (c.alt) t.push('⌥');
  if (c.shift) t.push('⇧');
  if (c.mod) t.push('⌘');
  if (c.code) t.push(c.code.slice(5));
  else t.push(_SC_GLYPH[c.key] || c.key.toUpperCase());
  return t;
}

function shortcutById(id) {
  return SHORTCUTS.find(s => s.id === id) || null;
}

// The token groups a row DISPLAYS: its `display` override, or one group per
// visible combo.
function shortcutGroups(s) {
  if (!s) return [];
  if (s.display) return s.display;
  return (s.combos || []).map(shortcutTokens);
}

// Plain text for a tooltip: "⇧⌘Z", "S or ⌘K or ⌘B".
function shortcutHint(id) {
  const s = shortcutById(id);
  if (!s) return '';
  const groups = shortcutGroups(s).map(g => g.join(g.some(x => x.length > 1) ? ' ' : ''));
  return groups.join(s.displayJoin ? s.displayJoin : ' 또는 ');
}

function _scEsc(t) {
  return String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

// Keycaps as markup. `cls` is the keycap class — the Docs page and the
// Editor's popover draw keys differently.
function shortcutKeysHtml(s, cls) {
  const k = cls || 'kbd';
  const joiner = s.displayJoin ? s.displayJoin : ' ';
  return shortcutGroups(s)
    .map(g => '<span class="sc-chord">' + g.map(x => '<kbd class="' + k + '">' + _scEsc(x) + '</kbd>').join('') + '</span>')
    .join('<span class="sc-or">' + _scEsc(joiner) + '</span>');
}

// Rows for a set of scopes, already in markup: [{id, scope, keys, label}].
function shortcutRows(scopes, cls) {
  const want = new Set(scopes || SHORTCUT_SCOPES.map(x => x.id));
  return SHORTCUTS.filter(s => want.has(s.scope))
    .map(s => ({ id: s.id, scope: s.scope, keys: shortcutKeysHtml(s, cls), label: _scEsc(s.label) }));
}

// The Docs page's table, grouped by scope. Every row carries data-shortcut so
// the test can find each registry entry on the page.
function shortcutsDocHtml(scopes, idPrefix) {
  const want = scopes ? new Set(scopes) : null;
  const pre = idPrefix || '';
  return SHORTCUT_SCOPES.map(sc => {
    if (want && !want.has(sc.id)) return '';
    const rows = SHORTCUTS.filter(s => s.scope === sc.id);
    if (!rows.length) return '';
    return '<h3 id="' + _scEsc(pre) + 'keys-' + sc.id + '">' + _scEsc(sc.title) + '</h3>' +
      (sc.note ? '<p class="docs-muted">' + _scEsc(sc.note) + '</p>' : '') +
      '<table class="docs-keys"><tbody>' +
      rows.map(s => '<tr data-shortcut="' + _scEsc(s.id) + '"><td class="docs-keys-k">' +
        shortcutKeysHtml(s, 'kbd') + '</td><td>' + _scEsc(s.label) + '</td></tr>').join('') +
      '</tbody></table>';
  }).join('');
}

// Any element with data-shortcut="<id>" names its keys in its tooltip. The
// title written in the markup is the base; the keys are appended once.
function shortcutDecorate(root) {
  const scope = root || document;
  if (!scope.querySelectorAll) return;
  scope.querySelectorAll('[data-shortcut]').forEach(el => {
    const hint = shortcutHint(el.getAttribute('data-shortcut'));
    if (!hint) return;
    if (el.dataset.tipBase === undefined) el.dataset.tipBase = el.getAttribute('title') || '';
    const base = el.dataset.tipBase;
    el.setAttribute('title', base ? (base + ' (' + hint + ')') : hint);
  });
}

// ---- the handlers this file owns ---------------------------------------------
function shortcutTyping(t) {
  if (!t) return false;
  if (t.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '');
}

function _scVisible(el) {
  return !!el && (el.offsetWidth > 0 || el.offsetHeight > 0);
}

// The same list health.js's Esc scaffold closes, plus the Docs.
function shortcutTopModal() {
  const sel = '.models-modal, .model-browser-modal, .expand-lightbox, .modal-bg.show';
  const open = Array.from(document.querySelectorAll(sel)).filter(el =>
    el.classList.contains('open') || el.classList.contains('show')
    || el.style.display === 'flex' || el.style.display === 'block');
  return open.length ? open[open.length - 1] : null;
}

function shortcutFocusSearch() {
  const top = shortcutTopModal();
  let box = null;
  if (top) {
    box = Array.from(top.querySelectorAll('input[type="search"], input.docs-search')).find(_scVisible) || null;
  } else if (document.body.dataset.workflow === 'editor') {
    box = document.getElementById('edPoolSearch');
  } else {
    box = document.getElementById('outputsSearch');
  }
  if (!_scVisible(box)) return false;
  box.focus();
  if (box.select) box.select();
}

function shortcutGenerateFrom(t) {
  const id = t && t.id;
  if (id === 'prompt') {
    const form = document.getElementById('genForm');
    const btn = document.getElementById('genBtn');
    if (!form || !btn) return false;
    if (btn.disabled) {
      if (typeof phosToast === 'function') phosToast(btn.title || '지금은 생성을 쓸 수 없습니다.', { duration: 5000 });
      return;
    }
    // The ONE submit path — the same listener the Generate button fires.
    if (form.requestSubmit) form.requestSubmit(btn); else btn.click();
    return;
  }
  if (id === 'imgStudioPrompt') {
    const btn = document.getElementById('imgStudioGenBtn');
    if (!btn || typeof imgStudioGenerate !== 'function') return false;
    if (btn.disabled) {
      if (typeof phosToast === 'function') phosToast(btn.title || '지금은 생성을 쓸 수 없습니다.', { duration: 5000 });
      return;
    }
    imgStudioGenerate();
    return;
  }
  return false;   // One Shot's prompt has its own listener (oneshot.js)
}

const _SC_OUTPUT_TABS = new Set(['manual', 'oneshot', 'studio', 'audio']);

function _scOnOutputsTab() {
  if (!_SC_OUTPUT_TABS.has(document.body.dataset.workflow || 'manual')) return false;
  // The Layout canvas owns the arrows and ⌫ while it holds the stage.
  if (typeof ideoInLayout === 'function' && ideoInLayout()) return false;
  return true;
}

function shortcutTogglePlayer(ev) {
  const t = ev.target;
  // A focused control keeps Space — that is how a keyboard presses a button.
  if (t && t.closest && t.closest('button, a, [role="button"], video, audio, summary, label')) return false;
  const lb = document.getElementById('expandLightbox');
  const lbOpen = lb && lb.style.display === 'flex';
  if (!lbOpen && (shortcutTopModal() || !_scOnOutputsTab())) return false;
  const v = lbOpen
    ? lb.querySelector('video')
    : document.querySelector('#playerWrap video');
  if (!v) return false;
  window._stagePlaybackIntentAt = Date.now();
  if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  else v.pause();
}

function shortcutTrashOutput() {
  if (shortcutTopModal() || !_scOnOutputsTab()) return false;
  if (typeof activePath === 'undefined' || !activePath || typeof deleteOutput !== 'function') return false;
  deleteOutput(activePath);   // confirms before it moves anything
}

document.addEventListener('keydown', (ev) => {
  if (ev.defaultPrevented || ev.isComposing) return;
  const typing = shortcutTyping(ev.target);
  for (const s of SHORTCUTS) {
    if (!s.run) continue;
    if (typing && !s.typing) continue;
    if (!s.typing && ev.target && ev.target.id === 'docsSearch' && s.id !== 'search.focus') continue;
    const combos = (s.combos || []).concat(s.hidden || []);
    if (!combos.some(c => shortcutMatches(ev, c))) continue;
    // The page-level keys stand down while a dialog is up — except ⌘F, which
    // finds the dialog's own search box, and ?, which is harmless on the Docs.
    if (s.scope === 'global' && s.id !== 'search.focus') {
      const top = shortcutTopModal();
      if (top && !(s.id === 'docs.open' && top.id === 'docsView')) continue;
    }
    if (s.run(ev) === false) continue;
    ev.preventDefault();
    return;
  }
});

shortcutDecorate(document);

// ---- published to the page ---------------------------------------------------
Object.assign(globalThis, {
  SHORTCUTS, SHORTCUT_SCOPES, SHORTCUT_RESERVED,
  shortcutParse, shortcutNormalise, shortcutMatches, shortcutTokens,
  shortcutById, shortcutHint, shortcutKeysHtml, shortcutRows, shortcutsDocHtml,
  shortcutDecorate, shortcutTyping,
});
