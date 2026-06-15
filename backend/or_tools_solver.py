from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_tsp(time_matrix):
    """
    time_matrix: N×N list of lists, time_matrix[i][j] = minutes from stop i to stop j
    Returns: ordered list of stop indices (e.g., [0, 2, 1, 3])
    """
    num_nodes = len(time_matrix)
    
    # Create routing index manager
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, 0)  # 1 vehicle, start at node 0
    
    # Create routing model
    routing = pywrapcp.RoutingModel(manager)
    
    # Distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(time_matrix[from_node][to_node] * 100)  # Convert to integer (cents)
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.FromSeconds(1)  # 1 second max
    
    # Solve
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        return None
    
    # Extract route
    route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        route.append(node)
        index = solution.Value(routing.NextVar(index))
    
    return route
