import settings from "./settings.js";
import settingsBubbleTable from "./settings_bubbleTable.js";

/* globals areaChart */
const chart = d3.select(".dashboard .data")
    .append("svg")
    .attr("id", "svg_areaChart");
const commTable =d3.select(".commTable .data")
    .append("svg")
    .attr("id", "svg_commChart");

const data = {};
let selected = "CANADA";

// global variables for drawBubbles fn
const rankedCommData = [];
let count = 0;
let years;
let maxVal;
let rankedCommNames; // temp


function uiHandler(event) {
  if (event.target.id === "groups") {
    selected = document.getElementById("groups").value;
    const labelsToClear = document.getElementsByClassName("area-label");
    let i;
    for (i = 0; i < labelsToClear.length; i++) {
      labelsToClear[i].innerHTML = "";
    }
    if (!data[selected]) {
      d3.json("data/rail_meat_origATR_ON_BC_dest" + selected + ".json", function(err, filedata) {
        data[selected] = filedata;
        showArea();
      });
    } else {
      showArea();
    }
  }
}

function showArea() {
  areaChart(chart, settings, data[selected]);
}

function showComm() {
  // change area chart title to match selected province
  d3.select(".commTable h4")
      .text("Annual tonnages for all commodities, sorted by volume in 2016: " +
            i18next.t("ATR", {ns: "regions"}) +
            " to " + i18next.t("QC", {ns: "regions"}));

  // var rawCommData = [];
  d3.csv("data/test_commdata_origATR_destQC_SUBSET.csv", function(error, rows) {
    const rawCommData = [];
    rows.forEach(function(d) {
      const x = d[""];
      delete d[""];
      for (prop in d) {
        const y = prop,
        value = d[prop];
        rawCommData.push({
          x: y,
          y: x,
          value: +value
        });
      }
    });

    // //Extract data for only year 2016
    // var filterYear = rawCommData.filter(item => item.x === "2016");

    // //Sort these 2016 values
    // filterYear.sort((a,b) => (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0));
    // console.log("filterYear: ", filterYear)

    // //Save sorted commodities in array
    // var sortedCommArray = filterYear.map(item => item.y);
    // console.log("sortedCommArray: ", sortedCommArray)

    // //sort rawCommData according to string order in sortedCommArray
    // //??????????

    years = rawCommData.filter((item) => item.y === "wheat").map((item) => item.x);
    rawCommData.sort((a, b) => (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0));
    maxVal = rawCommData[0].value;

    // console.log("sorted Comm: ", rawCommData)
    // Commodities in descending order of yr 2016 value
    rankedCommNames = rawCommData.filter((item) => item.x === "2016").map((item) => item.y);
    // console.log("rankedCommNames: ", rankedCommNames)

    // var rankedCommData = [];
    for (let idx = 0; idx < rankedCommNames.length; idx++) {
      for (let jdx = 0; jdx < years.length; jdx++) {
        const thisVal = rawCommData.filter((item) => item.x === years[jdx] &&
                      item.y === rankedCommNames[idx]).map((item) => item.value)[0];
        rankedCommData.push( {"x": years[jdx], "y": rankedCommNames[idx], "value": thisVal} );
      }
    }

    // List of all variables and number of them
    const domain = d3.set(rankedCommData.map(
        function(d) {
          return d.x;
        })).values()
    const num = Math.sqrt(rankedCommData.length)
    drawBubbles(rankedCommData, years, maxVal, count)
  }) // end d3.csv
} // end showComm()

function drawBubbles(rankedCommData, years, maxVal, count) {
// ---------------------------------------
// Diplay-related
  const numPerPage = 5; // number of commodities to display per page
  const numCommodities = rankedCommNames.length;
  const numPages = Math.ceil(numCommodities/numPerPage);

  // Page counter display
  d3.select("#pageNum")
      .text(`Page  ${count + 1}/${numPages}`);

  d3.select("#commgrid").select("svg").remove(); // clear for next display
  if (count >= numPages - 1) d3.select("#nextButton").classed("inactive", true);
  else d3.select("#nextButton").classed("inactive", false);
  const s0 = count*numPerPage;
  const s1 = (count + 1) * numPerPage;

  // ---------------------------------------
  // svg params
  // Adapted from: https://www.d3-graph-gallery.com/graph/correlogram_basic.html
  // Graph dimension
  const margin = {top: 20, right: 0, bottom: 20, left: 150};
  const width = 1230 - margin.left - margin.right;
  const height = 370 - margin.top - margin.bottom;

  // Create the svg area
  const svg = d3.select("#commgrid")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // ---------------------------------------
  // bubble table params

  // Create a color scale
  // var color = d3.scaleLinear()
  //   .domain([1, 5, 10])
  //   .range(["#B22222", "#fff", "#000080"]);

  // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
  const size = d3.scaleSqrt()
      .domain([0, 1])
      .range([0, .1]);

  // X scale
  const x = d3.scaleLinear()
      .domain([2001, 2016])
      .range([0, width/1.1]);

  // Y scale
  const y = d3.scaleLinear()
      .domain([1, 5000])
      .range([0, height/1.5]);

  // ---------------------------------------
  // Slice the data to diplay n commodities at a time
  let displayData = [];
  displayData = rankedCommData.filter((item) => rankedCommNames.slice(s0, s1).indexOf((item).y) != -1);

  // ---------------------------------------
  // Diplay slice
  // Create one 'g' element for each cell of the correlogram
  const cor = svg.attr("class", "rankplot")
      .selectAll(".cor")
      .data(displayData)
      .enter()
      .append("g")
      .attr("class", "cor")
      .attr("transform", function(d, i) {
        let comm0;
        let idx;
        if (i === 0) {
          comm0 = d.y;
          idx = 0;
        }

        const y0 = 40;
        const delta = 2*size(maxVal); // 35;
        if (d.y !== comm0) {
          comm0 = d.y;
          if (i%years.length === 0) idx++; // only increment idx when i is divisible by the number of years
        }
        const ycoord = y0 + idx*delta;
        return "translate(" + x(d.x) + "," + ycoord + ")";
      });

  // add circles
  cor
      .append("circle")
      .attr("class", function(d) {
        return "comm_gen";
      })
      .attr("r", function(d) {
        return size(Math.abs(d.value));
        // return size(Math.log( Math.abs(d.value)) );
      })
      .style("fill", function(d) {
        // return color(d.value);
      });

  // label columns by year
  cor.append("text")
      .attr("dx", function(d) {
        return -20;
      })
      .attr("dy", function(d) {
        return -30;
      })
      .attr("class", "comm_yr")
      .text(function(d) {
        if (d.y === rankedCommNames[s0]) return d.x;
      });

  // label rows by commdity name
  cor.append("text")
      .attr("dx", function(d) {
        return -150;
      })
      .attr("dy", function(d) {
        return 4;
      })
      .attr("class", "comm_type")
      .text(function(d) {
        if (d.x === "2001") return d.y;
      });

  // label circle by value
  cor.append("text")
      .attr("dx", function(d) {
        return -2;
      })
      .attr("dy", function(d) {
        return 4;
      })
      .attr("class", "comm_value")
      .text(function(d) {
        if (d.value === 0) return d.value;
      });
} // .drawBubbles

i18n.load(["src/i18n"], function() {
  d3.queue()
      .defer(d3.json, "data/rail_meat_origATR_ON_BC_destQC.json")
      .await(function(error, data) {
        areaChart(chart, settings, data);
        showComm(); // display sorted commodity bubble table
        d3.select("#prevButton").classed("inactive", true);
        d3.select("#nextButton")
            .on("click", function() {
              count++;
              count === 0 ? d3.select("#prevButton").classed("inactive", true) :
                      d3.select("#prevButton").classed("inactive", false);
              drawBubbles(rankedCommData, years, maxVal, count);
            });

        d3.select("#prevButton")
            .on("click", function() {
              count--;
              count === 0 ? d3.select("#prevButton").classed("inactive", true) :
                      d3.select("#prevButton").classed("inactive", false);
              drawBubbles(rankedCommData, years, maxVal, count);
            });
      });
});

$(document).on("input change", function(event) {
  uiHandler(event);
});
