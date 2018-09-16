const loadJSON = (callback) => {
	let xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', true);
	xobj.onreadystatechange = () => {
		if (xobj.readyState == 4 && xobj.status == "200") {
			callback(JSON.parse(xobj.responseText));
		}
	};
	xobj.send(null);  
}

loadJSON((json) => {
	graphJSON(json);
});

const graphJSON = (json) => {
	// dataset initializing
	let dataset = [], overallTemp, color, month,
		baseTemp = json.baseTemperature,
		colorArray = ["navy", "darkviolet", "mediumseagreen", "palegreen", "greenyellow", "yellow", "orange", "darkorange", "tomato", "firebrick", "maroon"],
		monthConvert = {
			1: "January",
			2: "February",
			3: "March",
			4: "April",
			5: "May",
			6: "June",
			7: "July",
			8: "August",
			9: "September",
			10: "October",
			11: "November",
			12: "December"
		};
		
	json.monthlyVariance.forEach(val => {
		overallTemp = baseTemp + val["variance"];
		color = "black";
		
		if (overallTemp < 3) {
			color = colorArray[0];
		}
		else if (overallTemp >= 3 && overallTemp < 12) {
			color = colorArray[Math.floor(overallTemp) - 2];
		}
		else {
			color = colorArray[0];
		}
		dataset.push([val.year, val.month, val.variance, overallTemp, color, monthConvert[val.month]]);
	})
		
	// setting svg canvas and elements
	const w = .95 * document.documentElement.clientWidth, 
		  h = .95 * document.documentElement.clientHeight,
		  padding = 100,
		  xScale = d3.scaleLinear()
					 .domain([d3.min(dataset, d => d[0]), d3.max(dataset, d => d[0]) + 1])
					 .range([padding, w - padding]),
		  yScale = d3.scaleLinear()
					 .domain([13 , 1])
					 .range([h - padding, padding]),
		  svg = d3.select("body")
				  .append("svg")
				  .attr("width", w)
				  .attr("height", h),
		  xAxis = d3.axisBottom(xScale),
		  yAxis = d3.axisLeft(yScale)
					.tickValues([1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5])
					.tickFormat(function(d) {
						return monthConvert[d - 0.5]
					})
					.tickSize(0),
		  tooltip = d3.select("body")
					.append("div")
					.attr("class", "tooltip");

	// setting bars
	svg.selectAll("rect")
	   .data(dataset)
	   .enter()
	   .append("rect")
	   .attr("class", "heatBar")
	   .attr("x", d => xScale(d[0]))
	   .attr("y", d => yScale(d[1]))
	   .attr("width", (w - (2 * padding)) / (dataset.length / 12))
	   .attr("height", (h - (2 * padding)) / 12)
	   .attr("fill", d => d[4])
	   .on("mousemove", function(d) {
			tooltip.style("opacity", .9)
				  .style("left", (d3.event.pageX + 10) + "px")		
				  .style("top", (d3.event.pageY - 40) + "px");
			tooltip.html("<strong>" + d[0] +  " - " + d[5] + "<br/>" + Number(d[3]).toFixed(3) + " °C</strong><br/>" + Number(d[2]).toFixed(3) + " °C");  
		})
		.on("mouseout", function(d) {
			tooltip.style("opacity", 0)
		})

	// placing x and y axis on svg
	svg.append("g")
	   .attr("transform", "translate(0, " + (h - padding) + ")")
	   .call(xAxis)
	   .style("font-family", "Cambria");
	  
	svg.append("g")
	   .attr("transform", "translate(" + (padding) + ", 0)")
	   .call(yAxis)
	   .style("font-family", "Cambria");
	  
	// title text
	const titleLabel = svg.append("text")
						  .text("Monthly Global Land Surface Temperature, 1753 - 2015")
						  .attr("class", "titleLabel")
						  .attr("fill", "black"),
		  titleBox = titleLabel.node()
							   .getBBox();
	  
	titleLabel.attr("x", (w - titleBox.width) / 2)
			  .attr("y", padding / 2 - titleBox.height / 3);

	const titleSubLabel = svg.append("text")
							 .text("Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average. Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07")
							 .attr("class", "titleSubLabel")
							 .attr("fill", "black"),
		  titleSubBox = titleSubLabel.node()
									 .getBBox();
	  
	titleSubLabel.attr("x", (w - titleSubBox.width) / 2)
				 .attr("y", padding / 2 + 1.5 * titleSubBox.height);
	  
	// x axis label text
	const xAxisLabel = svg.append("text")
						  .text("Years")
						  .attr("class", "xAxisLabel")
						  .attr("fill", "black"),
		  xAxisBox = xAxisLabel.node()
							   .getBBox();
	  
	xAxisLabel.attr("x", (w - xAxisBox.width) / 2)
			  .attr("y", h - padding / 2);

	// y axis label text  
	const yAxisLabel = svg.append("text")
						  .text("Months")
						  .attr("class", "yAxisLabel")
						  .attr("fill", "black"),
		  yAxisBox = yAxisLabel.node()
							   .getBBox();
	  
	yAxisLabel.attr("transform", "rotate(" + -90 + ", " + (padding / 2) + ", " + ((h + yAxisBox.width) / 2) + ")")
			  .attr("x", padding / 2)
			  .attr("y", (h + yAxisBox.width) / 2); 
	 
	// color legend 
	svg.selectAll("rect.colorBar")
	   .data(colorArray)
	   .enter()
	   .append("rect")
	   .attr("class", "colorBar")
	   .attr("x", (d,i) => 7 * w / 10 + i * w / 50)
	   .attr("y", h - 2 * padding / 3)
	   .attr("height", h / 50)
	   .attr("width", w / 50)
	   .attr("fill", d => d);
	  
	const colorAxisScale = d3.scaleLinear()
							 .domain([2, 13])
							 .range([7 * w / 10, 7 * w / 10 + 11 * w / 50]),
		  colorAxis = d3.axisBottom(colorAxisScale)
						.tickFormat(function(d) {
							if (d === 2 || d === 13) {
								return "";
							}
							else {
								return d;
							}
						});

	svg.append("g")
	   .attr("transform", "translate(0, " + (51 * h / 50  - 2 * padding / 3) + ")")
	   .call(colorAxis)
	   .style("font-family", "Cambria");
}
