import React from 'react';

// Expects data: [{ _id: 'Partner A', revenue: 123, cost: 45 }, ...]
const PartnerShareChart = ({ data = [], size = 160 }) => {
  const total = data.reduce((s, p) => s + (p.revenue || 0), 0) || 0.0001;
  let angleStart = 0;
  const slices = data.map((p) => {
    const value = p.revenue || 0;
    const percent = value / total;
    const angle = percent * 360;
    const slice = { label: p._id || 'Unknown', value, percent, angleStart, angleEnd: angleStart + angle };
    angleStart += angle;
    return slice;
  });

  // Build conic-gradient string for quick pie chart using CSS
  const gradient = slices.map((s, i) => {
    const start = s.angleStart;
    const end = s.angleEnd;
    const color = `hsl(${(i * 60) % 360} 70% 50%)`;
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${gradient})` }} aria-hidden />
      <div className="text-sm">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span style={{ width: 12, height: 12, background: `hsl(${(i * 60) % 360} 70% 50%)`, display: 'inline-block', borderRadius: 3 }} />
            <span className="truncate">{s.label || 'Unknown'}</span>
            <span className="ml-2 text-xs text-gray-500">{Math.round(s.percent * 100)}%</span>
          </div>
        ))}
        {data.length === 0 && <div className="text-gray-500">No partner data</div>}
      </div>
    </div>
  );
};

export default PartnerShareChart;
