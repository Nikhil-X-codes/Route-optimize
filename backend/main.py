from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import math
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from osrm_client import get_travel_time, get_distance_matrix
from or_tools_solver import solve_tsp


app = FastAPI(title="Route Optimizer API", version="1.0.0")

raw_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Stop(BaseModel):
    id: int
    lat: float
    lon: float
    label: str

class OptimizeRequest(BaseModel):
    stops: List[Stop]
    return_to_depot: bool = False

class OptimizeResponse(BaseModel):
    optimized_route: List[int]
    total_time_minutes: float
    total_distance_km: float
    legs: List[dict]
    message: str

# ============================================
# ROOT + HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/")
@app.head("/")
def root():
    return {"status": "ok", "service": "route-optimizer-api"}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "osrm": "connected (public server)",
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# OPTIMIZE ENDPOINT
# ============================================

@app.post("/api/optimize", response_model=OptimizeResponse)
def optimize_route(request: OptimizeRequest):
    try:
        # 1. Build N×N time and distance matrices
        n = len(request.stops)
        if n == 0:
            raise HTTPException(status_code=400, detail="At least one stop must be provided")
            
        coords = [[s.lat, s.lon] for s in request.stops]
        time_matrix, dist_matrix = get_distance_matrix(coords)
        
        if time_matrix is None or dist_matrix is None:
            raise HTTPException(status_code=400, detail="Live Data is not available")
            
        osrm_count = 0
        
        # Table request succeeded
        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                osrm_count += 1
                time_min = time_matrix[i][j]
                dist_km = dist_matrix[i][j]
                print(f"  [OSRM REAL] | Stop {i} -> {j} ({request.stops[i].label} -> {request.stops[j].label}) | {time_min:.2f} min | {dist_km:.2f} km (real road data)")
        
        # Summary of data sources used
        print(f"\n{'='*50}")
        print(f"  DATA SOURCE SUMMARY")
        print(f"  OSRM (real road data): {osrm_count}/{osrm_count} pairs")
        print(f"{'='*50}\n")
        
        # 2. Solve TSP with OR-Tools
        route = solve_tsp(time_matrix)
        
        if route is None:
            raise HTTPException(status_code=500, detail="OR-Tools failed to find solution")
        
        # Handle return_to_depot
        if request.return_to_depot and route[0] != route[-1]:
            route.append(route[0])
        
        # 3. Calculate total time, total distance, and per-leg details
        legs = []
        total_time = 0.0
        total_distance = 0.0
        
        for idx in range(len(route) - 1):
            from_idx = route[idx]
            to_idx = route[idx + 1]
            leg_time = time_matrix[from_idx][to_idx]
            leg_dist = dist_matrix[from_idx][to_idx]
            total_time += leg_time
            total_distance += leg_dist
            
            legs.append({
                "from_stop": request.stops[from_idx].label,
                "to_stop": request.stops[to_idx].label,
                "time_minutes": round(leg_time, 2),
                "distance_km": round(leg_dist, 2),
                "from_index": from_idx,
                "to_index": to_idx
            })
        
        # 4. Return response
        return OptimizeResponse(
            optimized_route=route,
            total_time_minutes=round(total_time, 2),
            total_distance_km=round(total_distance, 2),
            legs=legs,
            message="Route optimized successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
