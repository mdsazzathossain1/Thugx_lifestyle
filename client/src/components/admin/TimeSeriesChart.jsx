import React from 'react';

// Expects series: [{ _id: '2026-04-01', revenue: 100, cost: 20 }, ...]
const TimeSeriesChart = ({ series = [], width = 600, height = 160 }) => {
  if (!series || series.length === 0) return <div className="text-gray-500">No time-series data</div>;

  // normalize series by date order
  const points = series.map(s => ({ date: s._id, revenue: s.revenue || 0, cost: s.cost || 0 }));
  points.sort((a, b) => a.date.localeCompare(b.date));

  const maxVal = Math.max(...points.map(p => Math.max(p.revenue, p.cost)), 1);
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = innerW / Math.max(1, points.length - 1);

  const mapPoint = (i, val) => {
    const x = padding + i * stepX;
    const y = padding + innerH - (val / maxVal) * innerH;
    return `${x},${y}`;
  };

  const revenuePath = points.map((p, i) => mapPoint(i, p.revenue)).join(' ');
  const costPath = points.map((p, i) => mapPoint(i, p.cost)).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="bg-white rounded">
        <polyline points={revenuePath} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={costPath} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex gap-3 mt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1"><span style={{width:10,height:10,background:'#16a34a',display:'inline-block'}}/>Revenue</div>
        <div className="flex items-center gap-1"><span style={{width:10,height:10,background:'#ef4444',display:'inline-block'}}/>Cost</div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;
