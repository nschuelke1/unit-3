// Begin script when the window loads
window.onload = setMap;

// Set up the choropleth map
function setMap() {
    // Use Promise.all to parallelize asynchronous data loading
    var promises = [
        d3.csv("data/nato.csv"),
        d3.json("data/world.topojson")
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        // Assign the loaded datasets to variables
        var csvData = data[0], // NATO CSV data
            world = data[1];   // World TopoJSON data

        // Log the datasets to check their content
        console.log(csvData);
        console.log(world);

        // Continue with your data processing and map setup...
    }
}