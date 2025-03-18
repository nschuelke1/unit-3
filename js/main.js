

//execute script when window is loaded
window.onload = function(){

        //SVG dimension variables
        var w = 900, h = 500;

        //Example 1.2 line 1...container block
        var container = d3.select("body") //get the <body> element from the DOM
           .append("svg") //put a new svg in the body
           .attr("width", w) //assign the width
           .attr("height", h) //assign the height
           .attr("class", "container") //always assign a class (as the block name) for styling and future selection
           .style("background-color", "rgba(0,0,0,0.2)") //only put a semicolon at the end of the block!
            

           //innerRect block
            var innerRect = container.append("rect") //put a new rect in the svg

                .datum(400) //a single value is a datum
                .attr("width", function(d){ //rectangle width
                    return d * 2; //400 * 2 = 800
                }) 
                .attr("height", function(d){ //rectangle height
                    return d; //400
                })
                .attr("class", "innerRect") //class name
                .attr("x", 50) //position from left on the x (horizontal) axis
                .attr("y", 50) //position from top on the y (vertical) axis
                .style("fill", "#FFFFFF"); //fill color

                var x = d3.scaleLinear() //create the scale
                .range([90, 810]) //output min and max
                .domain([0, 3]); //input min and max

                // Define the cityPop array
                var cityPop = [
                    { 
                        city: 'Madison',
                        population: 233209
                    },
                    {
                        city: 'Milwaukee',
                        population: 594833
                    },
                    {
                        city: 'Green Bay',
                        population: 104057
                    },
                    {
                        city: 'Superior',
                        population: 27244
                    }
                ];

                // Above Example 2.8 line 20: Create the x scale
                var x = d3.scaleLinear() // Create the scale
                    .range([90, 810]) // Output min and max
                    .domain([0, 3]); // Input min and max

                // Above Example 2.8 line 20: Calculate population range for y scale
                var minPop = d3.min(cityPop, function(d) {
                    return d.population;
                });
                var maxPop = d3.max(cityPop, function(d) {
                    return d.population;
                });

                // Create the y scale
                var y = d3.scaleLinear()
                    .range([450, 50]) // Adjusted range to fill the inner rectangle
                    .domain([0, 700000]); // Fixed domain to fit chart title and axis

                // Above Example 2.8 line 20: Add the color scale generator
                var color = d3.scaleLinear()
                    .range(["#FDBE85", "#D94701"]) // Gradient from light to dark orange
                    .domain([minPop, maxPop]);

                // Add circles to the container
                var circles = container.selectAll(".circles") // Create an empty selection
                    .data(cityPop) // Feed in an array
                    .enter()
                    .append("circle")
                    .attr("class", "circles")
                    .attr("id", function(d) { return d.city; })
                    .attr("r", function(d) {
                        var area = d.population * 0.01; // Calculate radius based on population
                        return Math.sqrt(area / Math.PI);
                    })
                    .attr("cx", function(d, i) { return x(i); }) // Use x scale for horizontal positioning
                    .attr("cy", function(d) { return y(d.population); }) // Use y scale for vertical positioning
                    .style("fill", function(d) { return color(d.population); }) // Color based on population
                    .style("stroke", "#000"); // Black stroke for the circles

                // Example 3.6 and 3.7: Create and add the y-axis
                var yAxis = d3.axisLeft(y); // Create a y-axis generator
                var axis = container.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(50, 0)") // Move the axis 50px to the right
                    .call(yAxis); // Add the y-axis

                // Example 3.12: Add a title to the chart
                var title = container.append("text")
                    .attr("class", "title")
                    .attr("text-anchor", "middle")
                    .attr("x", 450) // Center title horizontally
                    .attr("y", 30) // Position title near the top
                    .text("City Populations");

                // Example 3.14: Create circle labels
                var labels = container.selectAll(".labels")
                    .data(cityPop)
                    .enter()
                    .append("text")
                    .attr("class", "labels")
                    .attr("text-anchor", "left")
                    .attr("y", function(d) { return y(d.population) + 5; });

                // First line of label: City name
                var nameLine = labels.append("tspan")
                    .attr("class", "nameLine")
                    .attr("x", function(d, i) { return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5; })
                    .text(function(d) { return d.city; });

                // Second line of label: Population
                // Example 3.17: Formatting population numbers
                var format = d3.format(",");
                var popLine = labels.append("tspan")
                    .attr("class", "popLine")
                    .attr("x", function(d, i) { return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5; })
                    .attr("dy", "15") // Vertical offset for the second line
                    .text(function(d) { return "Pop. " + format(d.population); });
                }