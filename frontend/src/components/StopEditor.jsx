import React from 'react';

const StopEditor = ({ stops, setStops }) => {
  // Add a new stop with default values
  const addStop = () => {
    const nextId = stops.length > 0 ? Math.max(...stops.map(s => s.id)) + 1 : 0;
    const newStop = {
      id: nextId,
      lat: 12.97, // default Bangalore area lat
      lon: 77.59, // default Bangalore area lon
      label: `New Stop ${nextId}`,
    };
    setStops([...stops, newStop]);
  };

  // Remove a stop by index
  const removeStop = (indexToRemove) => {
    if (stops.length <= 2) {
      alert('A route requires at least 2 stops (Depot + 1 destination).');
      return;
    }
    const updated = stops.filter((_, idx) => idx !== indexToRemove);
    setStops(updated);
  };

  // Update a specific field for a stop
  const updateStopField = (index, field, value) => {
    const updated = [...stops];
    let parsedValue = value;
    
    // Parse lat and lon as floats, leaving strings for editing
    if (field === 'lat' || field === 'lon') {
      const num = parseFloat(value);
      parsedValue = isNaN(num) ? value : num;
    }

    updated[index] = {
      ...updated[index],
      [field]: parsedValue,
    };
    setStops(updated);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Route Stops</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage delivery locations and depot</p>
        </div>
        <button
          onClick={addStop}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md shadow-blue-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Stop
        </button>
      </div>

      {/* List / Table */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {stops.map((stop, index) => {
          const isDepot = index === 0;

          return (
            <div
              key={stop.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isDepot
                  ? 'bg-rose-50/30 border-rose-100 hover:border-rose-200'
                  : 'bg-slate-50/30 border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isDepot ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {isDepot ? 'Depot (Start & End)' : `Delivery Stop #${index}`}
                  </span>
                  {isDepot && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Warehouse
                    </span>
                  )}
                </div>
                {!isDepot && (
                  <button
                    onClick={() => removeStop(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors duration-150"
                    title="Remove Stop"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stop.label}
                    disabled={isDepot && stop.label === 'Depot'} // Allow rename unless default
                    onChange={(e) => updateStopField(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                    placeholder="E.g., Warehouse, Client A"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stop.lat}
                    onChange={(e) => updateStopField(index, 'lat', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    placeholder="12.9716"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stop.lon}
                    onChange={(e) => updateStopField(index, 'lon', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    placeholder="77.5946"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StopEditor;
