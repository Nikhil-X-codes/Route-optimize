import React from 'react';

const RouteResult = ({ result, stops }) => {
  if (!result) return null;

  const {
    optimized_route,
    total_time_minutes,
    total_distance_km,
    legs,
    message,
  } = result;

  // Clean the message to remove any ML-related descriptors from backend response
  const cleanMessage = message
    ? message.replace(' (ML-enhanced)', '').replace(' (current traffic)', '')
    : 'Route optimized successfully';

  // Static clean theme (emerald green for routing success)
  const theme = {
    border: 'border-emerald-800/40',
    bg: 'bg-emerald-950/20',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800/40',
    text: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  };

  return (
    <div className={`p-6 rounded-2xl border bg-slate-950 shadow-xl space-y-6 transition-all duration-300 ${theme.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Route Solution</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{cleanMessage}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Time
          </span>
          <span className={`text-xl font-black ${theme.text}`}>
            {total_time_minutes.toFixed(1)} mins
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Distance
          </span>
          <span className="text-xl font-black text-slate-200">
            {total_distance_km !== undefined ? `${total_distance_km.toFixed(1)} km` : '--'}
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Stops
          </span>
          <span className="text-xl font-black text-slate-200">
            {stops.length} locations
          </span>
        </div>
      </div>

      {/* Numbered Sequence Path */}
      <div className="space-y-2.5">
        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Optimized Sequence
        </span>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50">
          {optimized_route.map((stopIndex, i) => {
            const stop = stops.find((s, idx) => idx === stopIndex);
            const isLast = i === optimized_route.length - 1;
            const label = stop ? stop.label : `Stop ${stopIndex}`;
            const isDepot = stopIndex === 0;

            return (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white ${
                    isDepot ? 'bg-rose-500' : 'bg-blue-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 max-w-[100px] truncate" title={label}>
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <span className="text-slate-700 text-xs font-bold font-mono">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legs Detail List */}
      <div className="space-y-3">
        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Leg Details
        </span>
        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
          {legs.map((leg, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-slate-800 rounded-xl transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-400 font-bold">
                  {index + 1}
                </span>
                <div className="text-xs">
                  <span className="font-semibold text-slate-300">{leg.from_stop}</span>
                  <span className="mx-2 text-slate-600">→</span>
                  <span className="font-semibold text-slate-200">{leg.to_stop}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`text-xs font-extrabold ${theme.text}`}>
                  {leg.time_minutes}m
                </span>
                {leg.distance_km !== undefined && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {leg.distance_km} km
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteResult;
