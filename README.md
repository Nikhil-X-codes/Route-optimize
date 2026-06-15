# Route Optimizer

A last-mile Route Optimizer application that solves the Traveling Salesperson Problem (TSP) using Google's OR-Tools and obtains real-world road distances and durations using OSRM (Open Source Routing Machine).

## Project Structure

The project is organized into the following subfolders:
- `backend/` - FastAPI backend application, TSP solver, and OSRM integration.
- `frontend/` - React frontend application using Vite, Leaflet, and TailwindCSS.

---

## Getting Started

### Prerequisites
The following tools are recommended to run the project:
- **Python**: `3.10+`
- **Node.js**: `18+`

---

## 1. Backend Setup & Run

The backend is a FastAPI application that runs on port `8000` by default.

### Virtual Environment
A Python virtual environment is set up in `backend/.venv`.

To activate the virtual environment:

#### Windows PowerShell
```powershell
.\backend\.venv\Scripts\Activate.ps1
```

#### Windows Command Prompt (cmd.exe)
```cmd
.\backend\.venv\Scripts\activate.bat
```

#### Git Bash / WSL / macOS / Linux
```bash
source backend/.venv/Scripts/activate
```

### Running the Backend
From the `backend` directory, run:
```bash
python main.py
```
Or use `uvicorn`:
```bash
uvicorn main:app --reload --port 8000
```

---

## 2. Frontend Setup & Run

The frontend is a React application built with Vite and runs on port `3000`.

### Installation
From the `frontend` directory, run:
```bash
npm install
```

### Running the Frontend
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 3. End-to-End Verification Flow

1. Ensure the **FastAPI backend** is running on port `8000`.
2. Ensure the **React frontend** is running on port `3000`.
3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Click **Add Stop** to add 3 to 5 delivery coordinates around a city (e.g., Bangalore center coordinates: `12.9716, 77.5946`).
5. Click **Optimize Route** to solve the TSP and view the path on the interactive Leaflet map.
6. Verify that the calculated total travel time and sequence are displayed correctly.
7. Monitor backend logs to see output showing OSRM real data requests.
