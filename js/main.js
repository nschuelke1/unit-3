(function () {
    // Define variables within the local scope
    let csvData;
    let usStates;

    // Function to create the Natural Breaks color scale
    function makeColorScale(data, expressed) {
        var colorClasses = [
            "#D4B9DA", "#C994C7", "#DF65B0", "#DD1C77", "#980043"
        ];

        var colorScale = d3.scaleThreshold().range(colorClasses);

        var domainArray = data.map(d => parseFloat(d[expressed]));

        var clusters = ss.ckmeans(domainArray, colorClasses.length);

        var domainBreaks = clusters.map(cluster => d3.min(cluster));
        domainBreaks.shift();

        colorScale.domain(domainBreaks);
        return colorScale;
    }

    // Function to create the choropleth map
    function setMap() {
        var width = window.innerWidth * 0.5, height = 460;

        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        var projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        var promises = [
            d3.csv("data/states.csv"),
            d3.json("data/states.topojson")
        ];

        Promise.all(promises).then(function (data) {
            csvData = data[0];
            var statesTopojson = data[1];

            usStates = topojson.feature(statesTopojson, statesTopojson.objects.gz_2010_us_040_00_500k).features;

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

            var colorScale = makeColorScale(csvData, "2023");

            map.selectAll(".state")
                .data(usStates)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "state " + d.properties.NAME;
                })
                .attr("d", path)
                .style("fill", function (d) {
                    return colorScale(d.properties["2023"]);
                });

            // Call setChart to add the bar chart
            setChart(csvData, colorScale);
        });
    }

    // Function to create the bar chart
    function setChart(csvData, colorScale) {
        var chartWidth = window.innerWidth * 0.425, chartHeight = 460, barPadding = 1;

        var chart = d3.select("body")
            .append("svg")
            .attr("class", "chart")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        var yScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([0, d3.max(csvData, d => parseFloat(d["2023"]))]);

        chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => i * (chartWidth / csvData.length))
            .attr("y", d => yScale(parseFloat(d["2023"])))
            .attr("width", chartWidth / csvData.length - barPadding)
            .attr("height", d => chartHeight - yScale(parseFloat(d["2023"])))
            .style("fill", d => colorScale(d["2023"]));
    }

    // Resize map and chart dynamically when the window is resized
    window.addEventListener('resize', function () {
        setMap();
        setChart(csvData, makeColorScale(csvData, "2023"));
    });

    setMap();
})();