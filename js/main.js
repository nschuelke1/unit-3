// Begin script when the window loads
window.onload = setMap;

// Declare globally
let csvData;
let usStates; // Updated variable name for states

function setMap() {
    // Map frame dimensions
    var width = 960, height = 500;

    // Create an SVG container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // Choose a projection suitable for the US
    var projection = d3.geoAlbersUsa() // Updated projection for US
        .scale(1000) // Adjust scaling to fit the SVG dimensions
        .translate([width / 2, height / 2]); // Center the map in the container

    // Create a path generator using the projection
    var path = d3.geoPath().projection(projection);

    // Use Promise.all to load data asynchronously
    var promises = [
        d3.csv("data/states.csv"), // Load attributes from CSV
        d3.json("data/states.topojson") // Load US-specific spatial data
    ];

    Promise.all(promises).then(function (data) {
        // Assign globally
        csvData = data[0]; // States CSV data
        var statesTopojson = data[1]; // US TopoJSON data

        // Translate TopoJSON to GeoJSON
        usStates = topojson.feature(statesTopojson, statesTopojson.objects.gz_2010_us_040_00_500k).features; // Updated key as needed
        console.log("Available Objects in TopoJSON:", Object.keys(statesTopojson.objects));
        console.log("US TopoJSON Data Structure:", statesTopojson);

        // Match GeoJSON states with CSV data
        usStates.forEach(state => {
            let csvRow = csvData.find(row => row.Name === state.properties.name); // Match by state name
            state.properties.population = csvRow ? csvRow["Population"] : null; // Add population data to GeoJSON properties
        });

        // Create individual paths for each state
        map.selectAll(".state")
            .data(usStates) // Bind GeoJSON features
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "state " + d.properties.name; // Unique class based on state name
            })
            .attr("d", path) // Apply GeoPath generator
            .style("fill", function (d) {
                // Style dynamically based on population
                if (d.properties.population) {
                    return d.properties.population > 5000000 ? "#ff0000" : "#00ff00"; // Example: High population in red, low in green
                }
                return "#ccc"; // Default color if population data is missing
            });

        // Log for debugging
        console.log("CSV Data Loaded:", csvData);
        console.log("GeoJSON Data Loaded:", usStates[0]);

        // Log GeoJSON state names here, where the data is ready
        console.log("GeoJSON State Names:");
        usStates.forEach(state => console.log(state.properties.name));
    });

    // Access globally after Promise resolves
    setTimeout(() => {
        console.log("CSV Data Globally Accessible:", csvData); // Should now be available
        console.log("GeoJSON Data Globally Accessible:", usStates ? usStates[0] : "usStates undefined"); // Guard against undefined
    }, 1000); // Delay to ensure data is loaded
}