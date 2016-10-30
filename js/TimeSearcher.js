var svg = d3.select("#visualization-area")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

d3.csv("data/stock_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        // convert stock data into a format that is easy to visualize
        var stocks = data.columns;
        stocks.shift(); // remove "date" column

        stocks = stocks.map(function(stock_name) {
            return data.map(function (d) {
                return {
                    date: new Date(d.date),
                    value: Number(d[stock_name])
                };
            });
        });

        // create time scale and value scale to map raw data to screen positions
        var timeScale = d3.scaleTime()
            .domain([
                new Date(stocks[0][0].date),
                new Date(stocks[0][stocks[0].length - 1].date)
            ])
            .range([100, 700]);

        var maxStockValue = d3.max(stocks, function(stock) {
            return d3.max(stock, function(d) {
                return d.value;
            });
        });

        var valueScale = d3.scaleLinear()
            .domain([0, maxStockValue])
            .range([400, 100]);

        // create and display SVG paths for all the stocks
        var generatePathCoords = d3.line()
            .x(function(d) { return timeScale(d.date); })
            .y(function(d) { return valueScale(d.value); });

        var lines = svg.selectAll(".stock-line")
            .data(stocks);

        lines.enter().append("path")
            .attr("d", generatePathCoords)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("class", "stock-line");

    }
});
