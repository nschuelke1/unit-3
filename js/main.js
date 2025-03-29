// Begin script when the window loads
window.onload = setMap;

// Set up the choropleth map
function setMap() {
    // Map frame dimensions
    var width = 960,
        height = 500;

    // Create an SVG container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // Choose a projection suitable for North America and Europe
    var projection = d3.geoMercator()
        .center([10, 50]) // Adjust to focus on North America and Europe
        .scale(500)      // Adjust scaling to fit the SVG dimensions
        .translate([width / 2, height / 2]); // Center the map in the container

    // Create a path generator using the projection
    var path = d3.geoPath().projection(projection);

    // Use Promise.all to load data asynchronously
    var promises = [
        d3.csv("data/nato.csv"), // Load attributes from CSV
        d3.json("data/world.topojson") // Load background spatial data
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        // Assign the loaded datasets to variables
        var csvData = data[0], // NATO CSV data
            world = data[1];   // World TopoJSON data

        // Translate TopoJSON to GeoJSON
        var worldCountries = topojson.feature(world, world.objects.ne_110m_admin_0_countries).features;

        // Match GeoJSON countries with CSV data
        worldCountries.forEach(country => {
            let csvRow = csvData.find(row => row.Name === country.properties.NAME); // Match by country name
            country.properties.gdpSpending = csvRow ? csvRow["2023"] : null; // Add GDP data to GeoJSON properties
        });

        // Create individual paths for each country
        map.selectAll(".country")
            .data(worldCountries) // Bind GeoJSON features
            .enter()
            .append("path")
            .attr("class", function(d) {
                return "country " + d.properties.NAME; // Unique class based on country name
            })
            .attr("d", path) // Apply GeoPath generator
            .style("fill", function(d) {
                // Style dynamically based on GDP spending
                if (d.properties.gdpSpending) {
                    return d.properties.gdpSpending > 1000 ? "#ff0000" : "#00ff00"; // Example: High GDP in red, low in green
                }
                return "#ccc"; // Default color if GDP data is missing
            });

        // Log for debugging
        console.log(csvData);
        console.log(worldCountries);
    }
    console.log("CSV Data Loaded:", csvData); // After loading the CSV
    console.log("GeoJSON Data Loaded:", worldCountries[0]); // After translating TopoJSON to GeoJSON
    console.log("CSV Data Example:", csvData[0]); // First row of CSV data
    console.log("GeoJSON Country Example:", worldCountries[0].properties.NAME); // First country name
}