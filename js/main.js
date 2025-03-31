(function () {
    // Define variables within the local scope
    let csvData;
    let usStates;

    // Function to create the Natural Breaks color scale
    function makeColorScale(data, expressed) {
        var colorClasses = [
            "#D4B9DA", // Light
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"  // Dark
        ];

        // Create a threshold color scale
        var colorScale = d3.scaleThreshold().range(colorClasses);

        // Build an array of all values for the expressed attribute
        var domainArray = data.map(d => parseFloat(d[expressed]));

        // Cluster the data using Ckmeans to create natural breaks
        var clusters = ss.ckmeans(domainArray, colorClasses.length);

        // Create domain from cluster minimums
        var domainBreaks = clusters.map(cluster => d3.min(cluster));
        domainBreaks.shift(); // Remove the first minimum to create proper breakpoints

        // Assign the domain to the color scale
        colorScale.domain(domainBreaks);

        return colorScale;
    }

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

            // Create the color scale for 2023
            var colorScale = makeColorScale(csvData, "2023");

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
                    return colorScale(d.properties["2023"]); // Apply color scale for 2023 population
                });

            console.log("Color scale domain:", colorScale.domain());
            console.log("CSV Data Loaded:", csvData);
            console.log("GeoJSON Data Loaded:", usStates[0]);
        });
    }

    // Call setMap within the local scope
    setMap();
})();