var svg = d3.select("#visualization-area")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

d3.csv("data/stock_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        stock_names = data.columns;
        stock_names.shift(); // remove "date" column

        // for now, we just graph the first stock
        name = stock_names[0];
        values = data.map(function (d) {
            return { 
                date: new Date(d.date),
                value: Number(d[name])
            };
        });

        timeScale = d3.scaleTime()
            .domain(d3.extent(values, d => d.date))
            .range([100, 700]);

        valueScale = d3.scaleLinear()
            .domain([0, d3.max(values, d => d.value)])
            .range([400, 100]);

        var line = d3.line()
            .x(function(d) { return timeScale(d.date); })
            .y(function(d) { return valueScale(d.value); });

        svg.append("path")
            .datum(values)
            .attr("d", line)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none");

    }
});
