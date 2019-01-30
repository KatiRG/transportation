import settings from "./stackedAreaSettings.js";
import settBubble from "./settings_bubbleTable.js";
import createLegend from "./createLegend.js";
// import drawBubbles from "./drawbubbles.js";

const data = {};
let selectedRegion = "ATR";
let selectedComm = "meat";

// const regions = ["ATR", "QC", "ON", "MB", "SK", "AB", "BC", "USMEX"];
const regions = ["ATR", "ON", "QC", "MB", "SK", "AB", "BC"];
const remainingRegions = regions.filter((item) => item !== selectedRegion);

// const formatNumber = d3.format(","); // d3.format(".2f");
// const format = function(d) {
//   return formatNumber(d);
// };

// ---------------------------------------------------------------------
/* globals areaChart */
const chartPair1 = d3.select("#pair1")
    .append("svg")
    .attr("id", "svg_pair1");
const chartPair2 = d3.select("#pair2")
    .append("svg")
    .attr("id", "svg_pair2");
const chartPair3 = d3.select("#pair3")
    .append("svg")
    .attr("id", "svg_pair3");
const chartPair4 = d3.select("#pair4")
    .append("svg")
    .attr("id", "svg_pair4");
const chartPair5 = d3.select("#pair5")
    .append("svg")
    .attr("id", "svg_pair5");
const chartPair6 = d3.select("#pair6")
    .append("svg")
    .attr("id", "svg_pair6");
// const chartPair7 = d3.select("#pair7")
//     .append("svg")
//     .attr("id", "svg_pair7");
// const chartPair8 = d3.select("#pair8")
//     .append("svg")
//     .attr("id", "svg_pair8");
// ---------------------------------------------------------------------
// global variables for commodities bubble table
// const rankedCommData = [];
// let count = 0;
// let years;
// let maxVal;
// let rankedCommNames; // temp
const commTable = d3.select("#commgrid")
    .append("svg")
    .attr("id", "svg_commgrid");

// ---------------------------------------------------------------------
function uiHandler(event) {
  if (event.target.id === "commodity") {
    selectedComm = document.getElementById("commodity").value;
  }
  if (event.target.id === "region") {
    selectedRegion= document.getElementById("region").value;
  }

  if (!data[selectedRegion]) {
    // Read in chosen region as ORIGIN
    d3.json("data/rail/rail_" + selectedComm + "_orig" + selectedRegion+ "_all_dest.json", function(err, fileorig) {
      data[selectedRegion] = fileorig;
    });
  } else {
    showArea();
  }
}

// ---------------------------------------------------------------------
function showArea() {
  areaChart(chartPair1, settings, data[selectedRegion]);
}
function showComm(region) {
  const thisReg = i18next.t(region, {ns: "railRegions"});
  d3.select("#commTableTitle")
      .text(`Commodities originating from ${thisReg}, total tonnage (millions) for all destinations`);

  // Read commodities file for selected region
  d3.json("data/rail/commdata_" + selectedRegion + ".json", function(err, json) {
  // d3.json("data/rail/rankdata_YOW.json", function(err, json) {
    console.log(json);
    bubbleTable(commTable, settBubble, json);
  });
}

// ---------------------------------------------------------------------
// Landing page displays
i18n.load(["src/i18n"], function() {
  settings.x.label = i18next.t("x_label", {ns: "railArea"}),
  settings.y.label = i18next.t("y_label", {ns: "railArea"}),
  // settBubble.z.getText = i18next.t("y_label", {ns: "commodities"}),

  d3.json("data/rail/" + selectedComm + "_" + selectedRegion + ".json", function(err, json1) {
    data[selectedRegion] = json1;
    const numYears = json1.length;

    for (let idx = 0; idx < remainingRegions.length; idx++) {
      const thisReg = remainingRegions[idx];
      d3.json("data/rail/" + selectedComm + "_" + thisReg + ".json", function(err, json2) {
        data[thisReg] = json2;

        // Construct data object pair to send to stacked area chart
        const arrPair = [];
        for (let idx = 0; idx < numYears; idx++) {
          arrPair.push({
            year: data[thisReg][idx].year,
            [selectedRegion + "to" + thisReg]: data[selectedRegion][idx][thisReg],
            [thisReg + "to" + selectedRegion]: data[thisReg][idx][selectedRegion]
          });
        }

        // send to areaChart
        if (idx == 0) {
          areaChart(chartPair1, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend1");
        } else if (idx == 1) {
          areaChart(chartPair2, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend2");
        } else if (idx == 2) {
          areaChart(chartPair3, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend3");
        } else if (idx == 3) {
          areaChart(chartPair4, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend4");
        } else if (idx == 4) {
          areaChart(chartPair5, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend5");
        } else if (idx == 5) {
          areaChart(chartPair6, settings, arrPair);
          createLegend([selectedRegion, thisReg], "#legend6");
        } else if (idx == 6) {
          areaChart(chartPair7, settings, arrPair);
          // createLegend([selectedRegion, thisReg], "#legend7");
        } else if (idx == 7) {
          areaChart(chartPair8, settings, arrPair);
          // createLegend([selectedRegion, thisReg], "#legend8");
        }
      }); // inner d3.json
    } // for loop
  }); // outer d3.json

  showComm(selectedRegion);
});

$(document).on("change", uiHandler);