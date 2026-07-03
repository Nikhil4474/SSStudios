import type { BusyBlock } from '../lib/api'

const DEFAULT_WINDOW_START = 6 * 60 // 6:00 AM
const DEFAULT_WINDOW_END = 23 * 60 // 11:00 PM

function parseLabelToMinutes(label: string): number {
  const match = label.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)
  if (!match) return 0
  let [, h, m, period] = match
  let hour = Number(h) % 12
  if (period === 'PM') hour += 12
  return hour * 60 + Number(m)
}

function timeInputToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60) % 24
  const m = min % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function DaySchedule({
  busy,
  bufferMinutes,
  loading,
  selectedStart,
  selectedEnd,
}: {
  busy: BusyBlock[]
  bufferMinutes: number
  loading: boolean
  selectedStart: string
  selectedEnd: string
}) {
  const busyRanges = busy.map((b) => ({
    start: parseLabelToMinutes(b.label),
    end: parseLabelToMinutes(b.endLabel),
  }))

  const selStart = selectedStart ? timeInputToMinutes(selectedStart) : null
  const selEnd = selectedEnd ? timeInputToMinutes(selectedEnd) : null

  const allBounds = [
    DEFAULT_WINDOW_START,
    DEFAULT_WINDOW_END,
    ...busyRanges.flatMap((b) => [b.start - bufferMinutes, b.end + bufferMinutes]),
    ...(selStart !== null ? [selStart] : []),
    ...(selEnd !== null ? [selEnd] : []),
  ]
  const windowStart = Math.max(0, Math.min(...allBounds));
  const windowEnd = Math.min(24 * 60, Math.max(...allBounds));
  const windowSpan = windowEnd - windowStart || 1

  const toPercent = (min: number) => ((min - windowStart) / windowSpan) * 100

  const hourTicks: number[] = []
  for (let m = Math.ceil(windowStart / 60) * 60; m <= windowEnd; m += 120) {
    hourTicks.push(m)
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>Day schedule</span>
        <span className="flex gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-400/70" /> Booked
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-400/20" /> Travel buffer
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm border border-gold" /> Your selection
          </span>
        </span>
      </div>

      <div className="relative flex h-64 rounded-md border border-line bg-paper-alt">
        {loading && (
          <div className="flex w-full items-center justify-center text-sm text-muted">Loading schedule...</div>
        )}

        {!loading && (
          <>
            <div className="relative w-14 shrink-0 border-r border-line">
              {hourTicks.map((m) => (
                <div
                  key={m}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-muted"
                  style={{ top: `${toPercent(m)}%` }}
                >
                  {formatMinutes(m)}
                </div>
              ))}
            </div>

            <div className="relative flex-1">
              {hourTicks.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 border-t border-line/60"
                  style={{ top: `${toPercent(m)}%` }}
                />
              ))}

              {busyRanges.map((b, i) => (
                <div key={i}>
                  <div
                    className="absolute left-1 right-1 rounded-sm bg-red-400/20"
                    style={{
                      top: `${toPercent(b.start - bufferMinutes)}%`,
                      height: `${toPercent(b.end + bufferMinutes) - toPercent(b.start - bufferMinutes)}%`,
                    }}
                  />
                  <div
                    className="absolute left-1 right-1 rounded-sm bg-red-400/70"
                    style={{
                      top: `${toPercent(b.start)}%`,
                      height: `${Math.max(toPercent(b.end) - toPercent(b.start), 1)}%`,
                    }}
                  />
                </div>
              ))}

              {selStart !== null && selEnd !== null && selEnd > selStart && (
                <div
                  className="absolute left-1 right-1 rounded-sm border-2 border-gold bg-gold/10"
                  style={{
                    top: `${toPercent(selStart)}%`,
                    height: `${Math.max(toPercent(selEnd) - toPercent(selStart), 1)}%`,
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
