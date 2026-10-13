export type TaskStatus = 'todo' | 'done' | 'skipped' | 'blocked';

export type Platform =
  | 'LinkedIn'
  | 'X'
  | 'Medium'
  | 'WhatsApp'
  | 'Reddit'
  | 'Pitch'
  | 'Quora';

export interface OpsTask {
  id: string;
  platform: Platform | string;
  title: string;
  dueDate?: string;
  cadence?: string;
  sourceSlug?: string;
  copyFile?: string;
  copyAnchor?: string;
  graphic?: string;
  status: TaskStatus;
  doneAt?: string;
  postUrl?: string;
  notes?: string;
  priority?: number;
}

export interface ScheduleFile {
  updated: string;
  cadenceNotes: Record<string, string>;
  blocked: Array<{
    id: string;
    platform: string;
    title: string;
    notes?: string;
  }>;
  tasks: OpsTask[];
}

export interface TaskOverride {
  status: TaskStatus;
  doneAt?: string;
  postUrl?: string;
  notes?: string;
}

export const STORAGE_KEY = 'vlyt-ops-overrides-v1';

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfWeekISO(d = new Date()): string {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return todayISO(copy);
}

export function loadOverrides(): Record<string, TaskOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TaskOverride>;
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: Record<string, TaskOverride>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function mergeSchedule(
  schedule: ScheduleFile,
  overrides: Record<string, TaskOverride>,
): ScheduleFile {
  return {
    ...schedule,
    tasks: schedule.tasks.map((t) => {
      const o = overrides[t.id];
      if (!o) return t;
      return {
        ...t,
        status: o.status,
        doneAt: o.doneAt ?? t.doneAt,
        postUrl: o.postUrl ?? t.postUrl,
        notes: o.notes ?? t.notes,
      };
    }),
  };
}

export function isOpen(task: OpsTask): boolean {
  return task.status === 'todo';
}

export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.floor(ms / 86_400_000);
}

/** Cadence tasks auto-reopen after their interval. */
export function effectiveTask(task: OpsTask, today: string): OpsTask {
  if (!task.cadence || task.status !== 'done' || !task.doneAt) return task;

  if (task.cadence === 'every-2-days' && daysBetween(task.doneAt, today) >= 2) {
    return { ...task, status: 'todo' };
  }
  if (task.cadence === 'weekly') {
    const weekStart = startOfWeekISO(new Date(`${today}T12:00:00`));
    if (task.doneAt < weekStart) {
      return { ...task, status: 'todo' };
    }
  }
  return task;
}

/** Due today, overdue, or cadence item that is due now. */
export function isDueToday(task: OpsTask, today: string): boolean {
  const t = effectiveTask(task, today);
  if (!isOpen(t)) return false;
  if (t.dueDate) return t.dueDate <= today;
  if (t.cadence) return true;
  return false;
}

export function isBacklog(task: OpsTask, today: string): boolean {
  const t = effectiveTask(task, today);
  if (!isOpen(t)) return false;
  if (isDueToday(task, today)) return false;
  if (t.dueDate && t.dueDate > today) return true;
  if (!t.dueDate) return true;
  return false;
}


export function sortStack(a: OpsTask, b: OpsTask): number {
  const pa = a.priority ?? 99;
  const pb = b.priority ?? 99;
  if (pa !== pb) return pa - pb;
  return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
}

export function weekActivity(
  tasks: OpsTask[],
  weekStart: string,
  today: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    if (t.status !== 'done' || !t.doneAt) continue;
    if (t.doneAt < weekStart || t.doneAt > today) continue;
    counts[t.platform] = (counts[t.platform] ?? 0) + 1;
  }
  return counts;
}

export function articleUrl(slug?: string): string | null {
  if (!slug) return null;
  if (slug === 'sa-quoting-checklist') {
    return `https://vlyt.app/resources/${slug}/`;
  }
  return `https://vlyt.app/blog/${slug}/`;
}

export function outreachRow(task: OpsTask, date: string): string {
  const channel = task.platform;
  const source = task.sourceSlug ?? '—';
  const url = task.postUrl ?? '';
  const status = task.status === 'done' ? 'done' : task.status;
  return `| ${date} | ${channel} | ${source} | ${url} | ${status} |`;
}

export function completeCommand(task: OpsTask): string {
  const urlPart = task.postUrl ? ` --url "${task.postUrl}"` : '';
  return `npm run ops:complete -- --id ${task.id}${urlPart}`;
}
