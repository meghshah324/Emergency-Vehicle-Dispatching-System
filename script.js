// // Global data structure
// let data = {
//     stations: [],
//     distances: []
// };

// // Load data from `stationsData.json`
// async function loadData() {
//     try {
//         const response = await fetch('/stationsData.json');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         data = await response.json();
//         console.log('Data loaded successfully:', data);
//     } catch (error) {
//         console.error("Error loading data:", error);
//         document.getElementById("output").innerText = "Error loading data. Please try again later.";
//     }
// }

// // Input validation helper
// function validateInput(input, type) {
//     if (!input) return false;
//     if (type === 'number') return !isNaN(input) && input > 0;
//     return true;
// }

// // Add a station based on form input
// function addStation() {
//     try {
//         const stationId = document.getElementById("stationId")?.value.trim();
//         const stationZipcode = document.getElementById("stationZipcode")?.value.trim();
//         const vehiclesInput = document.getElementById("vehicles")?.value.trim();

//         if (!stationId || !stationZipcode || !vehiclesInput) {
//             throw new Error("All fields are required");
//         }

//         const vehicles = vehiclesInput.split(',').map(v => v.trim()).filter(v => v);
//         if (vehicles.length === 0) {
//             throw new Error("At least one vehicle must be specified");
//         }

//         data.stations.push({ id: stationId, zipcode: stationZipcode, vehicles });

//         document.getElementById("output").innerText = `Station ${stationId} added successfully.`;
//     } catch (error) {
//         console.error("Error adding station:", error);
//         document.getElementById("output").innerText = `Error: ${error.message}`;
//     }
// }

// // Add a distance between two stations based on form input
// function addDistance() {
//     try {
//         const zipcode1 = document.getElementById("zipcode1")?.value.trim();
//         const zipcode2 = document.getElementById("zipcode2")?.value.trim();
//         const distance = parseFloat(document.getElementById("distance")?.value);

//         if (!zipcode1 || !zipcode2) {
//             throw new Error("Both zipcodes are required");
//         }
//         if (!validateInput(distance, 'number')) {
//             throw new Error("Distance must be a positive number");
//         }
//         if (zipcode1 === zipcode2) {
//             throw new Error("Cannot add distance between same zipcode");
//         }

//         data.distances.push({ zipcode1, zipcode2, distance });
//         document.getElementById("output").innerText = `Distance from ${zipcode1} to ${zipcode2} added successfully.`;
//     } catch (error) {
//         console.error("Error adding distance:", error);
//         document.getElementById("output").innerText = `Error: ${error.message}`;
//     }
// }

// // Save data to the server
// async function saveData() {
//     try {
//         if (!data.stations.length && !data.distances.length) {
//             throw new Error("No data to save");
//         }
//         console.log("Start");
//         const response = await fetch("http://localhost:3000/append-data", { // Use full URL here
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });
//         if (!response.ok) {
//             throw new Error(`Server responded with status: ${response.status}`);
//         }
//         console.log("End");

//         const result = await response.json();
//         document.getElementById("output").innerText = result.message;
//         data = { stations: [], distances: [] }; // Clear local data after saving
//     } catch (error) {
//         console.error("Error saving data:", error);
//         document.getElementById("output").innerText = `Error saving data: ${error.message}`;
//     }
// }
// Graph class implementation
// Global data structures
let data = {
    stations: [],
    distances: []
};

// Separate structure to track unsaved data
let unsavedData = {
    stations: [],
    distances: []
};

// Load data from `stationsData.json`
async function loadData() {
    try {
        const response = await fetch('/stationsData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
        console.log('Data loaded successfully:', data);
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById("output").innerText = "Error loading data. Please try again later.";
    }
}

// Input validation helper
function validateInput(input, type) {
    if (!input) return false;
    if (type === 'number') return !isNaN(input) && input > 0;
    return true;
}

// Check for duplicates in both saved and unsaved data
function isDuplicateStation(newStation) {
    // Check in saved data
    const savedDuplicate = data.stations.some(station => 
        station.id === newStation.id || 
        station.zipcode === newStation.zipcode
    );
    
    // Check in unsaved data
    const unsavedDuplicate = unsavedData.stations.some(station => 
        station.id === newStation.id || 
        station.zipcode === newStation.zipcode
    );
    
    return savedDuplicate || unsavedDuplicate;
}

function isDuplicateDistance(newDistance) {
    function checkDistance(distance) {
        return (
            (distance.zipcode1 === newDistance.zipcode1 && 
             distance.zipcode2 === newDistance.zipcode2) ||
            (distance.zipcode1 === newDistance.zipcode2 && 
             distance.zipcode2 === newDistance.zipcode1)
        );
    }
    
    // Check in both saved and unsaved data
    return data.distances.some(checkDistance) || 
           unsavedData.distances.some(checkDistance);
}

// Add a station based on form input
function addStation() {
    try {
        const stationId = document.getElementById("stationId")?.value.trim();
        const stationZipcode = document.getElementById("stationZipcode")?.value.trim();
        const vehiclesInput = document.getElementById("vehicles")?.value.trim();

        if (!stationId || !stationZipcode || !vehiclesInput) {
            throw new Error("All fields are required");
        }

        const vehicles = vehiclesInput.split(',')
            .map(v => v.trim())
            .filter(v => v);
        
        if (vehicles.length === 0) {
            throw new Error("At least one vehicle must be specified");
        }

        const newStation = { id: stationId, zipcode: stationZipcode, vehicles };

        if (isDuplicateStation(newStation)) {
            throw new Error("Station with this ID or zipcode already exists");
        }

        // Add to unsaved data instead of data
        unsavedData.stations.push(newStation);
        
        document.getElementById("output").innerText = `Station ${stationId} added successfully (unsaved).`;
        
        // Clear form
        document.getElementById("stationId").value = "";
        document.getElementById("stationZipcode").value = "";
        document.getElementById("vehicles").value = "";
        
    } catch (error) {
        console.error("Error adding station:", error);
        document.getElementById("output").innerText = `Error: ${error.message}`;
    }
}

// Add a distance between two stations based on form input
function addDistance() {
    try {
        const zipcode1 = document.getElementById("zipcode1")?.value.trim();
        const zipcode2 = document.getElementById("zipcode2")?.value.trim();
        const distance = parseFloat(document.getElementById("distance")?.value);

        if (!zipcode1 || !zipcode2) {
            throw new Error("Both zipcodes are required");
        }
        if (!validateInput(distance, 'number')) {
            throw new Error("Distance must be a positive number");
        }
        if (zipcode1 === zipcode2) {
            throw new Error("Cannot add distance between same zipcode");
        }

        const newDistance = { zipcode1, zipcode2, distance };
        
        if (isDuplicateDistance(newDistance)) {
            throw new Error("Distance between these zipcodes already exists");
        }

        // Add to unsaved data instead of data
        unsavedData.distances.push(newDistance);
        
        document.getElementById("output").innerText = 
            `Distance from ${zipcode1} to ${zipcode2} added successfully (unsaved).`;
        
        // Clear form
        document.getElementById("zipcode1").value = "";
        document.getElementById("zipcode2").value = "";
        document.getElementById("distance").value = "";
        
    } catch (error) {
        console.error("Error adding distance:", error);
        document.getElementById("output").innerText = `Error: ${error.message}`;
    }
}

// Save data to the server
async function saveData() {
    try {
        if (!unsavedData.stations.length && !unsavedData.distances.length) {
            throw new Error("No new data to save");
        }

        console.log("Saving unsaved data:", unsavedData);
        
        const response = await fetch("http://localhost:3000/append-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(unsavedData)  // Only send unsaved data
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        
        // Update the main data object with the newly saved data
        data.stations.push(...unsavedData.stations);
        data.distances.push(...unsavedData.distances);
        
        // Clear unsaved data
        unsavedData = {
            stations: [],
            distances: []
        };

        document.getElementById("output").innerText = 
            `${result.message}\nSaved ${unsavedData.stations.length} stations and ${unsavedData.distances.length} distances.`;
            
    } catch (error) {
        console.error("Error saving data:", error);
        document.getElementById("output").innerText = `Error saving data: ${error.message}`;
    }
}

// Initialize
// document.addEventListener('DOMContentLoaded', () => {
//     loadData();
//     // Reset unsaved data on page load
//     unsavedData = {
//         stations: [],
//         distances: []
//     };
// });
class Vertex {
    constructor(id) {
        this.id = id;
        this.adjacent = {};
    }
    addNeighbor(neighbor, weight = 0) {
        this.adjacent[neighbor.id] = weight;
    }
}

class Graph {
    constructor() {
        this.vertDict = {};
    }

    addVertex(node) {
        if (!this.vertDict[node]) {
            this.vertDict[node] = new Vertex(node);
        }
        return this.vertDict[node];
    }

    getVertex(id) {
        return this.vertDict[id] || null;
    }

    addEdge(from, to, cost = 0) {
        if (typeof cost !== 'number' || cost < 0) {
            throw new Error('Invalid cost value');
        }
        
        const fromVertex = this.addVertex(from);
        const toVertex = this.addVertex(to);
        fromVertex.addNeighbor(toVertex, cost);
        toVertex.addNeighbor(fromVertex, cost);
    }
}

function buildGraph() {
    const graph = new Graph();
    data.distances.forEach(({ zipcode1, zipcode2, distance }) => {
        try {
            graph.addEdge(zipcode1, zipcode2, distance);
        } catch (error) {
            console.error(`Error adding edge ${zipcode1}-${zipcode2}:`, error);
        }
    });
    return graph;
}

class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;
        
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        
        if (!added) {
            this.items.push(queueElement);
        }
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

function dijkstra(graph, startId) {
    if (!graph.getVertex(startId)) {
        throw new Error('Start vertex not found in graph');
    }

    const distances = {};
    const previous = {}; // To maintain the path
    const vertices = Object.keys(graph.vertDict);
    
    vertices.forEach(vertex => {
        distances[vertex] = Infinity;
        previous[vertex] = null;
    });
    
    distances[startId] = 0;
    const pq = new PriorityQueue();
    pq.enqueue(startId, 0);

    while (!pq.isEmpty()) {
        const { element: current } = pq.dequeue();
        const currentVertex = graph.getVertex(current);
        
        if (!currentVertex) continue;

        Object.entries(currentVertex.adjacent).forEach(([neighborId, weight]) => {
            const newDist = distances[current] + weight;
            if (newDist < distances[neighborId]) {
                distances[neighborId] = newDist;
                previous[neighborId] = current; // Store the predecessor for the path
                pq.enqueue(neighborId, newDist);
            }
        });
    }
    return { distances, previous }; // Return both distances and the previous array
}

function findShortestPath(previous, startId, targetId) {
    const path = [];
    let current = targetId;

    while (current && current !== startId) {
        path.unshift(current);
        current = previous[current];
    }

    if (current === startId) {
        path.unshift(startId);
        return path;
    }

    return []; // Return empty if no path is found
}

async function findNearestVehicle() {
    try {
        const zipcodeInput = document.getElementById("zipcodeInput")?.value.trim();
        const vehicleTypeInput = document.getElementById("vehicleTypeInput")?.value.trim();
        const output = document.getElementById("output");

        if (!zipcodeInput || !vehicleTypeInput) {
            throw new Error("Both zipcode and vehicle type are required");
        }

        if (!data.stations.length) {
            await loadData();
        }

        const stationZipcodes = data.stations.map(station => station.zipcode);
        if (!stationZipcodes.includes(zipcodeInput)) {
            output.innerHTML = `<p>Error: Invalid zipcode entered. Please try another zipcode.</p>`;
            return;
        }

        // Check current location first
        const currentStation = data.stations.find(
            station => station.zipcode === zipcodeInput && station.vehicles.includes(vehicleTypeInput)
        );

        if (currentStation) {
            output.innerHTML = `
                <h3>Vehicle Available at Entered Zipcode:</h3>
                <p>Station ID: ${currentStation.id}</p>
                <p>Vehicle Type: ${vehicleTypeInput}</p>
                <p>Distance: 0 (at entered location)</p>
                <p>Path: ${zipcodeInput}</p>
            `;
            return;
        }

        const eligibleStations = data.stations.filter(station => 
            station.vehicles.includes(vehicleTypeInput)
        );

        if (eligibleStations.length === 0) {
            output.innerHTML = `<p>No stations have a ${vehicleTypeInput} available.</p>`;
            return;
        }

        const graph = buildGraph();
        const { distances, previous } = dijkstra(graph, zipcodeInput);

        const nearestStation = eligibleStations.reduce((nearest, station) => {
            const dist = distances[station.zipcode] ?? Infinity;
            return dist < nearest.distance ? { ...station, distance: dist } : nearest;
        }, { distance: Infinity });

        if (nearestStation.distance === Infinity) {
            output.innerHTML = `<p>No reachable stations with ${vehicleTypeInput} from the entered zipcode.</p>`;
        } else {
            const path = findShortestPath(previous, zipcodeInput, nearestStation.zipcode);
            output.innerHTML = `
                <h3>Nearest Station Found:</h3>
                <p>Station ID: ${nearestStation.id}</p>
                <p>Vehicle Type: ${vehicleTypeInput}</p>
                <p>Distance: ${nearestStation.distance.toFixed(2)} km</p>
                <p>Path: ${path.join(" → ")}</p>
            `;
        }
    } catch (error) {
        console.error("Error finding nearest vehicle:", error);
        document.getElementById("output").innerText = `Error: ${error.message}`;
    }
}


// Initialize
// document.addEventListener('DOMContentLoaded', () => {
//     loadData();
//     document.getElementById("findButton")?.addEventListener("click", findNearestVehicle);
// });
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Reset unsaved data on page load
    document.getElementById("findButton")?.addEventListener("click", findNearestVehicle);
    unsavedData = {
        stations: [],
        distances: []
    };
});

