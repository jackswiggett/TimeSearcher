var svg = d3.select("#visualization-area")
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

var data = [
  {date: new Date(2010, 1, 1), value: 10},
  {date: new Date(2010, 1, 3), value: 20},
  {date: new Date(2010, 1, 5), value: 5},
  {date: new Date(2010, 1, 6), value: 40},
  {date: new Date(2010, 1, 10), value: 41},
  {date: new Date(2010, 1, 12), value: 30}
];

timeScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([100, 700]);

valueScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([400, 100]);

var line = d3.line()
    .x(function(d) { return timeScale(d.date); })
    .y(function(d) { return valueScale(d.value); });

svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none");

