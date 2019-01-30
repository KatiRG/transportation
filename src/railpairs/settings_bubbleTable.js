export default {
  aspectRatio: 19 / 3,
  margin: {
    top: 30,
    right: 0,
    bottom: 0,
    left: 60
  },
  alt: i18next.t("alt", {ns: "commodities"}),
  filterData: function(data) {
    const formatNumber = d3.format(".0f"); // d3.format(".2f");
    const format = function(d) {
      return formatNumber(d);
    };
    console.log("data in sett: ", data);
    const obj = {};
    data.map((d) => {
      const keys = Object.keys(d);
      keys.splice(keys.indexOf("year"), 1);

      for (const key of keys) {
        if (!obj[key]) {
          obj[key] = [];
        }
        obj[key].push({
          year: d.year,
          value: format(d[key] * 1.0 / 1e6)
        });
      }
    });
    console.log("obj: ", obj);

    return Object.keys(obj).map(function(k) {
      return {
        id: k,
        dataPoints: obj[k]
      };
    });
  },
  x: {
    getValue: function(d) {
      // return d.year;
      return new Date(d.year + "-01");
    },
    getText: function(d) {
      console.log("d in x: ", d)
      return d.year;
    }
  },
  r: {
    inverselyProportional: false, // if true, bubble size decreases with value
    getValue: function(d) {
      return d.value;
    }
  },
  z: { // Object { id: "total", dataPoints: (21) […] }, and similarly for id: local, id: itin
    getId: function(d) {
      return d.id;
    },
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "commodities"});
    },
    getDataPoints: function(d) {
      return d.dataPoints;
    },
  },
  width: 990
};