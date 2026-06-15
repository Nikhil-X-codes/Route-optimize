import requests

OSRM_BASE_URL = "http://router.project-osrm.org"

def get_travel_time(origin, destination):
    """
    origin = [lat, lon] e.g., [12.9716, 77.5946]
    destination = [lat, lon] e.g., [12.9352, 77.6245]
    Returns: travel time in minutes (float)
    """
    # Format: lon,lat;lon,lat (OSRM expects lon first)
    coords = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords}?overview=false"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check for valid route
        if data.get('code') != 'Ok' or not data.get('routes'):
            return None
            
        # Duration in seconds → minutes
        duration_seconds = data['routes'][0]['duration']
        return duration_seconds / 60
        
    except requests.exceptions.Timeout:
        print("OSRM request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"OSRM request failed: {e}")
        return None
    except (KeyError, IndexError):
        print("Invalid OSRM response format")
        return None


def get_distance_matrix(coordinates):
    """
    coordinates: list of [lat, lon] pairs
    Returns: (duration_matrix, distance_matrix) in minutes and km, or (None, None) on error
    """
    if not coordinates:
        return None, None
        
    # Format coords: lon,lat;lon,lat... (OSRM expects lon first)
    coords_str = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
    url = f"{OSRM_BASE_URL}/table/v1/driving/{coords_str}?annotations=duration,distance"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('code') != 'Ok' or 'durations' not in data or 'distances' not in data:
            return None, None
            
        # Convert seconds to minutes, meters to km
        durations = [[(d / 60.0) if d is not None else 0.0 for d in row] for row in data['durations']]
        distances = [[(d / 1000.0) if d is not None else 0.0 for d in row] for row in data['distances']]
        return durations, distances
        
    except requests.exceptions.RequestException as e:
        print(f"OSRM table request failed: {e}")
        return None, None
    except (KeyError, IndexError, ValueError) as e:
        print(f"Error parsing OSRM table response: {e}")
        return None, None
