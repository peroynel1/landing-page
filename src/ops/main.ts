import '../style.css';
import scheduleData from '../../content/ops/schedule.json';
import {
  type OpsTask,
  type ScheduleFile,
  type TaskOverride,
  type TaskStatus,
  articleUrl,
  completeCommand,
  effectiveTask,
  isBacklog,
  isDueToday,
  loadOverrides,
  mergeSchedule,
  outreachRow,
  saveOverrides,
  sortStack,
  startOfWeekISO,
  todayISO,
  weekActivity,
} from './types.ts';

const scheduleBase = scheduleData as ScheduleFile;
let overrides = loadOverrides();
let selectedId: string | null = null;

const el = {
  dateLabel: document.querySelector<HTMLElement>('#ops-date')!,
  stack: document.querySelector<HTMLElement>('#ops-stack')!,
  backlog: document.querySelector<HTMLElement>('#ops-backlog')!,
  week: document.querySelector<HTMLElement>('#ops-week')!,
  blocked: document.querySelector<HTMLElement>('#ops-blocked')!,
  detail: document.querySelector<HTMLElement>('#ops-detail')!,
  syncBtn: document.querySelector<HTMLButtonElement>('#ops-sync')!,
  clearBtn: document.querySelector<HTMLButtonElement>('#ops-clear-local')!,
  toast: document.querySelector<HTMLElement>('#ops-toast')!,
};

function schedule(): ScheduleFile {
  return mergeSchedule(scheduleBase, overrides);
}

function toast(msg: string): void {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  window.setTimeout(() => {
    el.toast.hidden = true;
  }, 2800);
}

function setOverride(id: string, patch: TaskOverride): void {
  overrides = { ...overrides, [id]: { ...overrides[id], ...patch } };
  saveOverrides(overrides);
  render();
}

function platformClass(platform: string): string {
  return `ops-plat ops-plat-${platform.toLowerCase().replace(/\s+/g, '-')}`;
}

function renderWeek(tasks: OpsTask[], today: string): void {
  const counts = weekActivity(tasks, startOfWeekISO(), today);
  const platforms = ['LinkedIn', 'X', 'Medium', 'WhatsApp', 'Reddit', 'Pitch'];
  el.week.innerHTML = platforms
    .map((p) => {
      const n = counts[p] ?? 0;
      return `<div class="ops-week-cell"><span class="ops-week-label">${p}</span><span class="ops-week-n">${n}</span></div>`;
    })
    .join('');
}

function renderBlocked(s: ScheduleFile): void {
  if (!s.blocked.length) {
    el.blocked.hidden = true;
    return;
  }
  el.blocked.hidden = false;
  el.blocked.innerHTML = s.blocked
    .map(
      (b) =>
        `<div class="ops-blocked-item"><strong>${b.platform}</strong> — ${b.title}${b.notes ? `<span class="ops-muted"> · ${b.notes}</span>` : ''}</div>`,
    )
    .join('');
}

function taskButton(task: OpsTask, opts: { overdue?: boolean }): string {
  const checked = task.status === 'done';
  const skipped = task.status === 'skipped';
  const active = selectedId === task.id ? ' is-active' : '';
  const overdue = opts.overdue ? ' is-overdue' : '';
  return `
    <li class="ops-task${active}${overdue}${checked ? ' is-done' : ''}${skipped ? ' is-skipped' : ''}" data-id="${task.id}">
      <button type="button" class="ops-task-main" data-select="${task.id}">
        <span class="${platformClass(task.platform)}">${task.platform}</span>
        <span class="ops-task-title">${task.title}</span>
        ${task.dueDate ? `<span class="ops-task-due">${task.dueDate}</span>` : task.cadence ? `<span class="ops-task-due">${task.cadence}</span>` : ''}
      </button>
      <label class="ops-check" title="Mark done locally">
        <input type="checkbox" data-toggle="${task.id}" ${checked ? 'checked' : ''} ${skipped ? 'disabled' : ''} />
      </label>
    </li>`;
}

function renderLists(s: ScheduleFile, today: string): void {
  const tasks = s.tasks.map((t) => effectiveTask(t, today));
  const open = tasks.filter((t) => t.status === 'todo' || t.status === 'done' || t.status === 'skipped');
  const due = open
    .filter(
      (t) => isDueToday(t, today) || (t.status === 'done' && t.doneAt === today && !t.cadence),
    )
    .sort(sortStack);
  const dueOpen = due.filter((t) => t.status === 'todo');
  const dueDoneToday = due.filter((t) => t.status === 'done' && t.doneAt === today);
  const stackTasks = [...dueOpen, ...dueDoneToday];

  const backlog = tasks.filter((t) => isBacklog(t, today)).sort(sortStack);

  el.stack.innerHTML =
    stackTasks.length === 0
      ? `<li class="ops-empty">Nothing due today. Check backlog or pull next Medium / Channel tip forward.</li>`
      : stackTasks
          .map((t) =>
            taskButton(t, {
              overdue: Boolean(t.dueDate && t.dueDate < today && t.status === 'todo'),
            }),
          )
          .join('');

  el.backlog.innerHTML =
    backlog.length === 0
      ? `<li class="ops-empty">Backlog clear.</li>`
      : backlog.map((t) => taskButton(t, {})).join('');
}

function renderDetail(task: OpsTask | null, s: ScheduleFile): void {
  if (!task) {
    el.detail.innerHTML = `<p class="ops-muted">Select a task for copy path, article link, and sync actions.</p>`;
    return;
  }

  const art = articleUrl(task.sourceSlug);
  const cadenceKey = task.platform.toLowerCase();
  const cadenceHint =
    s.cadenceNotes[cadenceKey] ??
    (task.platform === 'WhatsApp' ? s.cadenceNotes.whatsapp : undefined);

  el.detail.innerHTML = `
    <div class="ops-detail-head">
      <span class="${platformClass(task.platform)}">${task.platform}</span>
      <h2 class="ops-detail-title">${task.title}</h2>
    </div>
    <dl class="ops-meta">
      <div><dt>Status</dt><dd>${task.status}${task.doneAt ? ` · ${task.doneAt}` : ''}</dd></div>
      ${task.dueDate ? `<div><dt>Due</dt><dd>${task.dueDate}</dd></div>` : ''}
      ${task.cadence ? `<div><dt>Cadence</dt><dd>${task.cadence}</dd></div>` : ''}
      ${task.sourceSlug ? `<div><dt>Article</dt><dd>${art ? `<a href="${art}" target="_blank" rel="noopener">${task.sourceSlug}</a>` : task.sourceSlug}</dd></div>` : ''}
      ${task.copyFile ? `<div><dt>Copy</dt><dd><code>${task.copyFile}</code>${task.copyAnchor ? ` → <em>${task.copyAnchor}</em>` : ''}</dd></div>` : ''}
      ${task.graphic ? `<div><dt>Graphic</dt><dd><code>${task.graphic}</code></dd></div>` : ''}
      ${task.postUrl ? `<div><dt>Post URL</dt><dd><a href="${task.postUrl}" target="_blank" rel="noopener">${task.postUrl}</a></dd></div>` : ''}
      ${task.notes ? `<div><dt>Notes</dt><dd>${task.notes}</dd></div>` : ''}
      ${cadenceHint ? `<div><dt>Channel rule</dt><dd>${cadenceHint}</dd></div>` : ''}
    </dl>
    <div class="ops-actions">
      <label class="ops-field">
        <span>Post URL (optional)</span>
        <input type="url" id="ops-url" placeholder="https://…" value="${task.postUrl ?? ''}" />
      </label>
      <div class="ops-action-row">
        <button type="button" class="ops-btn ops-btn-accent" data-action="done">Mark done</button>
        <button type="button" class="ops-btn" data-action="skip">Skip</button>
        <button type="button" class="ops-btn" data-action="reopen">Reopen</button>
      </div>
      <div class="ops-action-row">
        <button type="button" class="ops-btn" data-action="copy-row">Copy OUTREACH row</button>
        <button type="button" class="ops-btn" data-action="copy-cmd">Copy CLI complete</button>
      </div>
      <p class="ops-hint">Local only until you <strong>Sync to repo</strong> (downloads <code>schedule.json</code>). Paste the OUTREACH row into <code>content/OUTREACH.md</code>.</p>
      <pre class="ops-cmd" id="ops-cmd-preview">${completeCommand(task)}</pre>
    </div>
  `;

  const urlInput = el.detail.querySelector<HTMLInputElement>('#ops-url');

  el.detail.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action!;
      const url = urlInput?.value.trim() || undefined;
      const today = todayISO();

      if (action === 'done') {
        setOverride(task.id, { status: 'done', doneAt: today, postUrl: url });
        selectedId = task.id;
        const row = outreachRow({ ...task, status: 'done', postUrl: url, doneAt: today }, today);
        try {
          await navigator.clipboard.writeText(row);
          toast('Marked done · OUTREACH row copied');
        } catch {
          toast('Marked done · copy row failed — use Copy OUTREACH row');
        }
        return;
      }
      if (action === 'skip') {
        setOverride(task.id, { status: 'skipped', doneAt: today, postUrl: url });
        toast('Skipped (local)');
        return;
      }
      if (action === 'reopen') {
        const next = { ...overrides };
        delete next[task.id];
        overrides = next;
        saveOverrides(overrides);
        render();
        toast('Reopened (cleared local override)');
        return;
      }
      if (action === 'copy-row') {
        const merged = { ...task, postUrl: url ?? task.postUrl };
        const row = outreachRow(merged, task.doneAt ?? today);
        await navigator.clipboard.writeText(row);
        toast('OUTREACH row copied');
        return;
      }
      if (action === 'copy-cmd') {
        const merged = { ...task, postUrl: url ?? task.postUrl };
        await navigator.clipboard.writeText(completeCommand(merged));
        toast('CLI command copied');
      }
    });
  });
}

function downloadSchedule(s: ScheduleFile): void {
  const blob = new Blob([JSON.stringify(s, null, 2) + '\n'], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'schedule.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Downloaded schedule.json — replace content/ops/schedule.json');
}

function render(): void {
  const today = todayISO();
  const s = schedule();
  el.dateLabel.textContent = today;
  renderBlocked(s);
  renderWeek(s.tasks, today);
  renderLists(s, today);

  const tasks = s.tasks.map((t) => effectiveTask(t, today));
  const selected =
    (selectedId && tasks.find((t) => t.id === selectedId)) ||
    tasks.find((t) => isDueToday(t, today)) ||
    tasks.find((t) => isBacklog(t, today)) ||
    null;
  selectedId = selected?.id ?? null;
  renderDetail(selected, s);
}

el.stack.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const select = t.closest<HTMLElement>('[data-select]');
  if (select?.dataset.select) {
    selectedId = select.dataset.select;
    render();
    return;
  }
});

el.backlog.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const select = t.closest<HTMLElement>('[data-select]');
  if (select?.dataset.select) {
    selectedId = select.dataset.select;
    render();
  }
});

document.body.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  if (!input.matches('input[data-toggle]')) return;
  const id = input.dataset.toggle!;
  if (input.checked) {
    selectedId = id;
    setOverride(id, { status: 'done' as TaskStatus, doneAt: todayISO() });
    toast('Checked · open detail to add URL + copy OUTREACH row');
  } else {
    const next = { ...overrides };
    delete next[id];
    overrides = next;
    saveOverrides(overrides);
    render();
  }
});

el.syncBtn.addEventListener('click', () => {
  const s = schedule();
  s.updated = todayISO();
  downloadSchedule(s);
});

el.clearBtn.addEventListener('click', () => {
  if (!confirm('Clear local check-offs? Repo schedule.json is unchanged.')) return;
  overrides = {};
  saveOverrides(overrides);
  render();
  toast('Local overrides cleared');
});

render();
