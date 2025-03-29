// Begin script when the window loads
window.onload = setMap;

// Declare globally
let csvData; 
let europeanCountries;

function setMap() {
    // Map frame dimensions
    var width = 960, height = 500;

    // Create an SVG container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // Choose a projection suitable for Europe
    var projection = d3.geoMercator()
        .center([10, 50]) // Adjust to focus on Europe
        .scale(500)      // Adjust scaling to fit the SVG dimensions
        .translate([width / 2, height / 2]); // Center the map in the container

    // Create a path generator using the projection
    var path = d3.geoPath().projection(projection);

    // Use Promise.all to load data asynchronously
    var promises = [
        d3.csv("data/nato.csv"), // Load attributes from CSV
        d3.json("data/EuropeanCountries.topojson") // Load Europe-specific spatial data
    ];

    Promise.all(promises).then(function (data) {
        // Assign globally
        csvData = data[0]; // NATO CSV data
        var europe = data[1]; // European TopoJSON data

        // Translate TopoJSON to GeoJSON
        europeanCountries = topojson.feature(europe, europe.objects.european_countries).features; // Update key as needed
        console.log("Europe Data Structure:", europe);
        console.log("Available Objects in TopoJSON:", Object.keys(europe.objects));

        // Match GeoJSON countries with CSV data
        europeanCountries.forEach(country => {
            let csvRow = csvData.find(row => row.Country === country.properties.NAME); // Match by country name
            country.properties.gdpSpending = csvRow ? csvRow["2023e"] : null; // Add GDP data to GeoJSON properties
        });

        // Create individual paths for each country
        map.selectAll(".country")
            .data(europeanCountries) // Bind GeoJSON features
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "country " + d.properties.NAME; // Unique class based on country name
            })
            .attr("d", path) // Apply GeoPath generator
            .style("fill", function (d) {
                // Style dynamically based on GDP spending
                if (d.properties.gdpSpending) {
                    return d.properties.gdpSpending > 1.5 ? "#ff0000" : "#00ff00"; // Example: High GDP in red, low in green
                }
                return "#ccc"; // Default color if GDP data is missing
            });

        // Log for debugging
        console.log("CSV Data Loaded:", csvData);
        console.log("GeoJSON Data Loaded:", europeanCountries[0]);

        // Log GeoJSON country names here, where the data is ready
        console.log("GeoJSON Country Names:");
        europeanCountries.forEach(country => console.log(country.properties.NAME));
    });

    // Access globally after Promise resolves
    setTimeout(() => {
        console.log("CSV Data Globally Accessible:", csvData); // Should now be available
        console.log("GeoJSON Data Globally Accessible:", europeanCountries ? europeanCountries[0] : "europeanCountries undefined"); // Guard against undefined
    }, 1000); // Delay to ensure data is loaded
}