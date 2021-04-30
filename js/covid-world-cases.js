//Width and height
// (Not needed for r2d3; specified automatically OR in chunk header)
//var width = 900;
//var height = 450;
var margin = {left:35, right:50, bottom:25, top:10};
// Date parsing
var parseTime = d3.timeParse("%Y-%m-%d");

// Read data
// (data were prepared and saved with R)
//
//d3.json("data/rcovid_trim.json", function(data) {
//  console.log(data);
//  covidVis(data);
//});


// Make the vis
//function covidVis(data) {
 // D3 code chunk
    
    //
    // This data stuff is stupid but nothing seems
    // to work except this garbage.
    //
    var latest_date = d3.max(data, function(d) { return parseTime(d.date); })
    
    var data_usa = data.filter(function(d) {
        return d.country == "US";
    });
    data_usa.forEach(function(d) {
        d.date2 = parseTime(d.date);
    });
    var data_usamax = data_usa
        .filter(function(d) {return d.date2 >= latest_date; });
    
    
    data.forEach(function(d) {
        d.date2 = parseTime(d.date);
    });
    var data_max = data
        .filter(function(d) {return d.date2 >= latest_date; });
    
    var dataNest = d3.nest()
        .key(function(d) { return d.country; })
        .entries(data);

    
    //console.log(data_usa);
    //console.log(dataNest);
    //console.log(latest_date);
    //console.log(data_usamax);

    // SCALES //
    // Date scale
    var dateScale = d3.scaleTime()
          .domain([ d3.min(data, d => parseTime(d.date)),
                    d3.max(data, d => parseTime(d.date)) ])
          .range([ margin.left, width - margin.right ]);
    
    var yScale = d3.scaleLinear()
          //.domain([ d3.min(data, d => d.Cases7),
          .domain([ 0, d3.max(data, d => d.Cases7) ])
          .range([ height-margin.bottom, margin.top]);
    
    var xAxis = d3.axisBottom(dateScale)
        .tickFormat(d3.timeFormat("%b")).tickSize(0).tickPadding(10);
    var xAxisGrid = d3.axisBottom(dateScale)
        .tickSize(height-margin.bottom).tickFormat('').ticks(5);

    var yAxis = d3.axisLeft(yScale).tickSize(0).ticks(5).tickPadding(10);
    var yAxisGrid = d3.axisLeft(yScale)
        .tickSize(-width+margin.right+margin.left).tickFormat('').ticks(5);
    
    // line generator
    var line = d3.line()
          .x(function(d) { return dateScale(parseTime(d.date)); })
          .y(function(d) { return yScale(d.Cases7); })
    
    
    // Don't need to define this variable for r2d3
    //var svg = d3.select("#covid-container1");
    //var svg = d3.selectAll("div")//d3.select("#covid-container1")
    //    .append("svg")
    //    .attr("width", width)
    //    .attr("height", height);
    
    // Tooltips
    // Tooltips
    // Refs:
    // https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
    // http://bl.ocks.org/rpgove/f2abb9b4acaec88f099b
    // https://data-map-d3.readthedocs.io/en/latest/steps/step_08.html
    // https://datatricks.co.uk/animated-d3-js-bar-chart-in-r

    var Tooltip = d3.select('#htmlwidget_container')//d3.select("#covid-container")
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .attr("class", "xtooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none");
    var tipover = function(d) {
        d3.select(this).raise();
        Tooltip.style("opacity", 0.8);
        };
    var tipmove = function(d) {
        Tooltip
          .html(d.key)
          .style("left", (d3.mouse(this)[0]) + "px")
          .style("top", (d3.mouse(this)[1]-25) + "px");
        };
    var tipout = function(d) {
        Tooltip.style("opacity", 0);
        d3.select(this).lower();
        };

    
    // add the Gridlines
    svg.append("g")
        .attr("class", "grid")
        .call(xAxisGrid);
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxisGrid);
    
    // Countries with top 50 populations
    svg.selectAll(".line")
        .data(dataNest)
        .enter()
        .append("path")
        .attr("class", "world-line")
        .attr("d", function(d) {
            return d3.line()
                .x(function(d) { return dateScale(parseTime(d.date)); })
                .y(function(d) { return yScale(d.Cases7); })
                (d.values);
        })
        .on("mouseover", tipover)
        .on("mousemove", tipmove)
        .on("mouseout", tipout);

    
    // Some colors
    // "#ff9966"  -- orange-ish; loosely based on WaPo
    // "#e64d00"  -- darker orange
    // "#ff3333"  -- red
    // "#c0514d"  -- burnt red
    
    // US stuff
    svg.append("path")
        .datum(data_usa)
        .attr("class", "usa-line")
        .attr("id", "usa-line")
        .attr("d", line);
    svg.append("circle")
        .data(data_usamax)
        .attr("class", "usa-circle")
        .attr("cx", d => dateScale(parseTime(d.date)))
        .attr("cy", d => yScale(d.Cases7))
        .attr("r", 5);
    svg.append("text")
        .data(data_usamax)
        .attr("class", "usa-text")
        .attr("x", d => dateScale(parseTime(d.date))+15)
        .attr("y", d => yScale(d.Cases7)+5)
        .text(d => d.country);

    
    // Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height-margin.bottom) + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

