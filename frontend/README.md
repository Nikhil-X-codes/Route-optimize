# Route Optimizer - Frontend

This is the React frontend for the **Route Optimizer** application. It provides an interactive map interface to manage delivery locations, send optimization requests to the FastAPI backend, and visualize the resulting route.

## Features

- **Interactive Leaflet Map**: Visualize the starting depot, delivery stops, and the final optimized route path.
- **Dynamic Stop Management**: Add, remove, and update the coordinates (latitude/longitude) and labels of stops.
- **Validation**: Inputs are parsed safely to prevent runtime crashes during typing or editing coordinates.
- **Route Summary Panel**: Clear display of the optimal sequence and the total travel time.

## Tech Stack

- **Framework**: React (using Vite)
- **Styling**: TailwindCSS
- **Map Library**: React Leaflet & Leaflet
- **HTTP Client**: Fetch API

## Getting Started

### Installation

Navigate to the `frontend/` directory and install dependencies:
```bash
npm install
```

### Running in Development Mode

To start the Vite development server:
```bash
npm run dev
```

The application will run on [http://localhost:3000](http://localhost:3000) by default.

### Building for Production

To create a production build in the `dist` folder:
```bash
npm run build
```
