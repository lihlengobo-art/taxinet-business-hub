// Weekly content rotation engine.
//
// Every message and offer can be tagged with a `rotation_group` (0..N-1).
// Items with a NULL group are "evergreen" and always show. Items with a group
// number only show during the week whose bucket matches. The bucket advances
// automatically every 7 days, so the ecosystem refreshes itself weekly with no
// cron job or manual work — it is a pure function of today's date.

export const ROTATION_BUCKETS = 4

// Fixed Monday reference point (2024-01-01 was a Monday, UTC).
const EPOCH_UTC = Date.UTC(2024, 0, 1)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Whole weeks elapsed since the reference Monday. */
export function weeksSinceEpoch(date: Date = new Date()): number {
  return Math.floor((date.getTime() - EPOCH_UTC) / WEEK_MS)
}

/** The rotation bucket that is "live" for the given date (0..ROTATION_BUCKETS-1). */
export function currentRotationBucket(date: Date = new Date()): number {
  const w = weeksSinceEpoch(date)
  return ((w % ROTATION_BUCKETS) + ROTATION_BUCKETS) % ROTATION_BUCKETS
}

/** A stable, human-friendly label for the current campaign week, e.g. "Week 87". */
export function currentWeekLabel(date: Date = new Date()): string {
  return `Week ${weeksSinceEpoch(date) + 1}`
}
