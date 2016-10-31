var svg = d3.select("#visualization-area")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500)
    .attr("id", "visualization-svg");

var timeScale, valueScale, stocks, generatePathCoords;

d3.csv("data/stock_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        // convert stock data into a format that is easy to visualize
        stocks = data.columns;
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
        timeScale = d3.scaleTime()
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

        valueScale = d3.scaleLinear()
            .domain([0, maxStockValue])
            .range([400, 100]);

        // create and display SVG paths for all the stocks
        generatePathCoords = d3.line()
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

        svg.on("click", create_filter_box);
    }
});

// add trash bin
// <image x="10" y="20" width="80" height="80" xlink:href="recursion.svg" />
svg.append("image")
    .attr("x", 710)
    .attr("y", 410)
    .attr("width", 80)
    .attr("height", 80)
    .attr("xlink:href", "images/trash.svg");

function create_filter_box() {
    x_pos = d3.mouse(svg.node())[0];
    y_pos = d3.mouse(svg.node())[1];

    box_group = svg.append("g")

    box_group.append("rect")
        .attr("x", x_pos)
        .attr("y", y_pos)
        .attr("width", 100)
        .attr("height", 100)
        .attr("class", "filter-box-inside")
        .style("fill", "rgba(0, 0, 0, .3)")
        .style("stroke", "none")
        .call(d3.drag().on("drag", on_box_drag)
                       .on("end", on_box_drag_end));

    box_group.append("rect")
        .attr("x", x_pos)
        .attr("y", y_pos)
        .attr("width", 100)
        .attr("height", 100)
        .attr("class", "filter-box-outside")
        .style("fill", "none")
        .style("stroke", "rgba(0, 0, 255, .5)")
        .style("stroke-width", 4)
        .call(d3.drag().on("drag", on_box_resize));

    update_lines();
}

function on_box_drag() {
    var x_pos = Number(d3.select(this).attr("x")) + d3.event.dx;
    var y_pos = Number(d3.select(this).attr("y")) + d3.event.dy;

    d3.select(this)
        .attr("x", x_pos)
        .attr("y", y_pos);
    d3.select(this.parentNode).select(".filter-box-outside")
        .attr("x", x_pos)
        .attr("y", y_pos);

    update_lines();
}

function on_box_drag_end() {
    if (d3.mouse(svg.node())[0] > 710 && d3.mouse(svg.node())[1] > 410) {
        d3.select(this.parentNode).remove();
    }

    update_lines();
}

function on_box_resize() {
    var width = Number(d3.select(this).attr("width"));
    var height = Number(d3.select(this).attr("height"));

    var mouse_x = d3.mouse(svg.node())[0] - d3.event.dx;
    var mouse_y = d3.mouse(svg.node())[1] - d3.event.dy;
    var box_left_x = Number(d3.select(this).attr("x"));
    var box_right_x = box_left_x + width;
    var box_top_y = Number(d3.select(this).attr("y"));
    var box_bottom_y = box_top_y + height;

    var moveLeft = false;
    var moveRight = false;
    var moveTop = false;
    var moveBottom = false;

    var new_x = box_left_x;
    var new_y = box_top_y;
    var new_width = width;
    var new_height = height;

    if (mouse_x < box_left_x + 4) {
        moveLeft = true;
    } else if (mouse_x > box_right_x - 4) {
        moveRight = true;
    }

    if (mouse_y < box_top_y + 4) {
        moveTop = true;
    } else if (mouse_y > box_bottom_y - 4) {
        moveBottom = true;
    }

    if (moveLeft) {
        new_x += d3.event.dx;
        new_width -= d3.event.dx;
    }

    if (moveRight) {
        new_width += d3.event.dx;
    }

    if (moveTop) {
        new_y += d3.event.dy;
        new_height -= d3.event.dy;
    }

    if (moveBottom) {
        new_height += d3.event.dy;
    }

    if (new_width < 10) {
        new_width = 10;
    }

    if (new_height < 10) {
        new_height = 10;
    }

    d3.select(this)
        .attr("x", new_x)
        .attr("y", new_y)
        .attr("width", new_width)
        .attr("height", new_height);
    d3.select(this.parentNode).select(".filter-box-inside")
        .attr("x", new_x)
        .attr("y", new_y)
        .attr("width", new_width)
        .attr("height", new_height);

    update_lines();
}

function filter_stocks(stocks) {
    filter_boxes = d3.selectAll(".filter-box-inside");

    var filtered_stocks = stocks;

    filter_boxes.each(function() {
        var box = d3.select(this);

        // determine the date-range and value-range for this filter box
        var box_x = Number(box.attr("x"));
        var box_y = Number(box.attr("y"));
        var box_width = Number(box.attr("width"));
        var box_height = Number(box.attr("height"));

        var start_time = timeScale.invert(box_x);
        var end_time = timeScale.invert(box_x + box_width);

        var max_value = valueScale.invert(box_y);
        var min_value = valueScale.invert(box_y + box_height);

        filtered_stocks = filtered_stocks.filter(function(stock) {
            // find all the stock values within the specific date range
            var filtered_values = stock.filter(function(d) {
                return d.date >= start_time && d.date <= end_time;
            });

            // determine whether the values fall within the value range
            return d3.max(filtered_values, d => d.value) <= max_value &&
                   d3.min(filtered_values, d => d.value) >= min_value;
        });
    });

    return filtered_stocks;
}

function update_lines() {
    var lines = d3.select("#visualization-svg").selectAll(".stock-line")
        .data(filter_stocks(stocks));

    lines.enter().append("path")
        .attr("d", generatePathCoords)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("class", "stock-line");

    lines.exit().remove();

    lines.attr("d", generatePathCoords)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("class", "stock-line");
}
