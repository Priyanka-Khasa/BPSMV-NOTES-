import React, { useMemo, useState } from 'react';
import { Flame, CalendarCheck2 } from 'lucide-react';

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLabel = (dateKey) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const activityLabel = {
  pdf_opened: 'Opened PDF',
  pdf_completed: 'Completed PDF',
  internship_applied: 'Applied',
};

const CELL = 12; // px, matches h-3 w-3
const GAP = 4; // px, matches gap-1
const COLUMN_STEP = CELL + GAP;
const LABEL_COLUMN_WIDTH = 28; // px, matches w-7 on the weekday label column
const LABEL_GAP = 8; // px, matches gap-2 between label column and weeks

const getLevel = (count) => {
  if (!count) return 'bg-parchment ring-parchment-dark';
  if (count <= 1) return 'bg-brand-100 ring-brand-200';
  if (count <= 2) return 'bg-brand-300 ring-brand-300';
  if (count <= 4) return 'bg-brand-500 ring-brand-500';
  return 'bg-brand-800 ring-brand-800';
};

const ActivityCalendar = ({ daily = [] }) => {
  const [selected, setSelected] = useState(null);

  const { weeks, activityByDate, monthLabels, currentStreak, activeDays } = useMemo(() => {
    const map = new Map(daily.map((day) => [day.date, day]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let i = 0; i < 371; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }

    const grouped = [];
    for (let i = 0; i < days.length; i += 7) {
      grouped.push(days.slice(i, i + 7));
    }

    const labels = [];
    let lastMonth = '';
    grouped.forEach((week, index) => {
      const firstDay = week[0];
      const label = firstDay.toLocaleDateString('en-IN', { month: 'short' });
      if (label !== lastMonth && firstDay.getDate() <= 7) {
        labels.push({ label, index });
        lastMonth = label;
      }
    });

    let streak = 0;
    const cursor = new Date(today);
    // if nothing logged today yet, start counting from yesterday instead of breaking the streak
    if (!map.get(formatDateKey(cursor))?.count) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (map.get(formatDateKey(cursor))?.count) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const active = daily.filter((day) => day.count > 0).length;

    return { weeks: grouped, activityByDate: map, monthLabels: labels, currentStreak: streak, activeDays: active };
  }, [daily]);

  const selectedDay = selected ? activityByDate.get(selected) : null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">Study activity</h2>
          <p className="mt-0.5 text-sm text-slate-500">Darker squares mean more PDFs, completions, and applications that day.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 ring-1 ring-brand-100">
            <Flame size={16} className="text-brand-700" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-brand-800">{currentStreak}</p>
              <p className="text-[11px] text-brand-700">day streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-parchment-light px-3.5 py-2 ring-1 ring-white/70">
            <CalendarCheck2 size={16} className="text-slate-500" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-charcoal">{activeDays}</p>
              <p className="text-[11px] text-slate-500">active days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          <div
            className="relative h-5 text-xs text-slate-400"
            style={{ marginLeft: `${LABEL_COLUMN_WIDTH + LABEL_GAP}px` }}
          >
            {monthLabels.map((month) => (
              <span key={`${month.label}-${month.index}`} className="absolute" style={{ left: `${month.index * COLUMN_STEP}px` }}>
                {month.label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="grid w-7 grid-rows-7 gap-1 text-xs text-slate-400">
              <span />
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
            </div>
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.map((date) => {
                    const dateKey = formatDateKey(date);
                    const day = activityByDate.get(dateKey);
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelected(dateKey)}
                        title={`${formatLabel(dateKey)}: ${day?.count || 0} activities`}
                        className={`h-3 w-3 rounded-[3px] ring-1 transition-transform hover:z-10 hover:scale-125 focus-visible:z-10 focus-visible:scale-125 focus-visible:outline-none ${getLevel(day?.count || 0)} ${selected === dateKey ? 'outline outline-2 outline-slate-900 outline-offset-1' : ''}`}
                        aria-label={`${formatLabel(dateKey)} activity`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            {[0, 1, 2, 4, 6].map((count) => (
              <span key={count} className={`h-3 w-3 rounded-[3px] ring-1 ${getLevel(count)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-parchment-light p-4 ring-1 ring-white/70">
        {selected ? (
          <>
            <p className="text-sm font-semibold text-charcoal">{formatLabel(selected)}</p>
            {selectedDay?.items?.length ? (
              <div className="mt-2.5 space-y-2">
                {selectedDay.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-lg bg-white/85 px-3 py-2 text-sm text-slate-600 ring-1 ring-brand-100/70">
                    <span className="font-semibold text-charcoal">{activityLabel[item.type] || 'Activity'}:</span> {item.title}
                    {(item.subjectName || item.company) && (
                      <span className="text-slate-400"> &middot; {item.subjectName || item.company}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No activity recorded on this day.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">Click any square to see what was done that day.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityCalendar;