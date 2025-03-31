(function () {
    // Define variables within the local scope
    let csvData;
    let usStates;

    // Main function to execute the map setup
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
        var projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        // Create a path generator using the projection
        var path = d3.geoPath().projection(projection);

        // Use Promise.all to load data asynchronously
        var promises = [
            d3.csv("data/states.csv"),
            d3.json("data/states.topojson")
        ];

        // Load the data and process it
        Promise.all(promises).then(function (data) {
            csvData = data[0]; // States CSV data
            var statesTopojson = data[1]; // US TopoJSON data

            // Translate TopoJSON to GeoJSON
            usStates = topojson.feature(statesTopojson, statesTopojson.objects.gz_2010_us_040_00_500k).features;
            console.log("Available Objects in TopoJSON:", Object.keys(statesTopojson.objects));
            console.log("US TopoJSON Data Structure:", statesTopojson);

            // Data join: Add yearly data from CSV to GeoJSON properties
            var attrArray = ["2020", "2021", "2022", "2023", "2024"];
            csvData.forEach(csvRow => {
                var csvKey = csvRow.Name;

                usStates.forEach(geoFeature => {
                    var geojsonKey = geoFeature.properties.NAME;

                    if (geojsonKey === csvKey) {
                        attrArray.forEach(attr => {
                            geoFeature.properties[attr] = parseFloat(csvRow[attr]);
                        });
                    }
                });
            });

            // Debugging: Log the updated GeoJSON
            console.log("Joined GeoJSON Features:", usStates);

            // Create individual paths for each state
            map.selectAll(".state")
                .data(usStates)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "state " + d.properties.NAME;
                })
                .attr("d", path)
                .style("fill", function (d) {
                    if (d.properties["2023"]) {
                        return d.properties["2023"] > 1000000 ? "#ff0000" : "#00ff00";
                    }
                    return "#ccc";
                });

            console.log("CSV Data Loaded:", csvData);
            console.log("GeoJSON Data Loaded:", usStates[0]);
        });
    }

    // Call setMap within the local scope
    setMap();
})();