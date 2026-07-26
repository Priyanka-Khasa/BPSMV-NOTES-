const test = require('node:test');
const assert = require('node:assert/strict');
const { publicActivitySummary } = require('../src/routes/activity');

test('public activity summary excludes private recent activity', () => {
  const summary = publicActivitySummary({
    totals: {
      pdfOpened: 4,
      pdfCompleted: 2,
      internshipsApplied: 1
    },
    daily: [
      {
        date: '2026-07-26',
        count: 2,
        items: [{ type: 'pdf_opened', title: 'Signals notes' }]
      }
    ],
    recent: [
      {
        title: 'Private recent item',
        createdAt: new Date('2026-07-26T08:00:00.000Z')
      }
    ]
  });

  assert.deepEqual(Object.keys(summary), ['totals', 'daily']);
  assert.equal(summary.totals.pdfOpened, 4);
  assert.equal(summary.daily[0].date, '2026-07-26');
  assert.equal(summary.recent, undefined);
});

test('public activity summary has empty defaults', () => {
  assert.deepEqual(publicActivitySummary(), { totals: {}, daily: [] });
});
