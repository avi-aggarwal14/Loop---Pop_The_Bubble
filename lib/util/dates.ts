/**
 * Week helpers. Weeks are Monday 00:00 UTC → next Monday 00:00 UTC (exclusive).
 * The brief always runs over the most recent *completed* week.
 */

export interface WeekRange {
  start: Date;
  end: Date; // exclusive
  /** Display label, e.g. "Week of 2 June". */
  label: string;
}

function mondayOfWeek(d: Date): Date {
  const day = d.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  monday.setUTCDate(monday.getUTCDate() - diff);
  return monday;
}

/** "YYYY-MM-DD" in UTC — matches the Postgres `date` column on snapshots/briefs. */
export function toISODateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatWeekLabel(start: Date): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `Week of ${fmt.format(start)}`;
}

function rangeFromStart(start: Date): WeekRange {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end, label: formatWeekLabel(start) };
}

/** The most recent fully-completed week, relative to `now`. */
export function previousFullWeek(now = new Date()): WeekRange {
  const thisMonday = mondayOfWeek(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
  return rangeFromStart(lastMonday);
}

/** The week immediately before the given one (for week-over-week comparisons). */
export function priorWeek(range: WeekRange): WeekRange {
  const start = new Date(range.start);
  start.setUTCDate(start.getUTCDate() - 7);
  return rangeFromStart(start);
}

/** The `n` most recent completed weeks, oldest → newest. Used to backfill history. */
export function recentCompletedWeeks(n: number, now = new Date()): WeekRange[] {
  const weeks: WeekRange[] = [];
  let w = previousFullWeek(now);
  for (let i = 0; i < n; i++) {
    weeks.unshift(w);
    w = priorWeek(w);
  }
  return weeks;
}
