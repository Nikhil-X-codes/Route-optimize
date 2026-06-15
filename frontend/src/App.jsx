import React, { useState, useEffect } from 'react';
import StopEditor from './components/StopEditor';
import MapView from './components/MapView';
import RouteResult from './components/RouteResult';
import { checkHealth, optimizeRoute } from './api/client';

const App = () => {
  // 1. Initial State Setup
  const [stops, setStops] = useState([]);

  const [returnToDepot, setReturnToDepot] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', details: null });

  // Optimization Results
  const [optimizationResult, setOptimizationResult] = useState(null);

  // 2. Run Health Check on Mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setBackendHealth({ status: 'healthy', details: data });
      } catch (err) {
        setBackendHealth({ status: 'unhealthy', details: null });
      }
    };
    fetchHealth();
  }, []);

  // 3. Optimize Route Handler
  const handleOptimize = async () => {
    setIsOptimizing(true);
    setError(null);
    setOptimizationResult(null);

    try {
      // Standardize input stops coordinates (ensure numeric types)
      const cleanStops = stops.map(s => ({
        id: s.id,
        lat: parseFloat(s.lat),
        lon: parseFloat(s.lon),
        label: s.label || `Stop ${s.id}`,
      }));

      // Validation
      const invalidStop = cleanStops.find(s => isNaN(s.lat) || isNaN(s.lon));
      if (invalidStop) {
        throw new Error(`Stop "${invalidStop.label}" has invalid coordinates.`);
      }

      // Call API
      const result = await optimizeRoute(cleanStops, returnToDepot);
      setOptimizationResult(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Banner/Header */}
      <header className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Route Optimizer</h1>
            <p className="text-[10px] text-slate-400 font-medium">Dispatch Routing Portal</p>
          </div>
        </div>

        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              backendHealth.status === 'checking'
                ? 'bg-amber-400 animate-pulse'
                : backendHealth.status === 'healthy'
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
          ></span>
          <span className="text-slate-300 font-medium">
            {backendHealth.status === 'checking' && 'Connecting to API...'}
            {backendHealth.status === 'healthy' && 'API Online'}
            {backendHealth.status === 'unhealthy' && 'API Offline'}
          </span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Column - Stop Editor & Routing Control (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
          {/* Stops List */}
          <div className="flex-1 min-h-[350px]">
            <StopEditor stops={stops} setStops={setStops} />
          </div>

          {/* Routing Actions Panel */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            {/* Depot Return Checkbox */}
            <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors duration-150">
              <input
                type="checkbox"
                checked={returnToDepot}
                onChange={(e) => setReturnToDepot(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Return to Depot</span>
                <span className="text-[10px] text-slate-500">Route completes back at start location</span>
              </div>
            </label>

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || stops.length < 2}
              className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 ${
                !isOptimizing && stops.length >= 2 ? 'active:scale-[0.98]' : ''
              }`}
            >
              {isOptimizing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing Route...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Calculate Optimal Route
                </>
              )}
            </button>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Route Result Component */}
          {optimizationResult && (
            <RouteResult result={optimizationResult} stops={stops} />
          )}
        </div>

        {/* Right Column - MapView Container (7 cols) */}
        <div className="lg:col-span-7 h-[calc(100vh-120px)] min-h-[450px]">
          <MapView
            stops={stops}
            optimizedRoute={optimizationResult ? optimizationResult.optimized_route : null}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
