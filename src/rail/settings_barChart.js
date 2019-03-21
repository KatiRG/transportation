export default {
  aspectRatio: 16 / 8,
  margin: {
    top: 50,
    left: 40,
    bottom: 50
  },
  x: {
    label: i18next.t("x_label", {ns: "railBar"}),
    getId: function(d) {
      return d.year;
    },
    getValue: function(...args) {
      return this.x.getId.apply(this, args);
    },
    getClass: function(...args) {
      return this.x.getId.apply(this, args);
    },
    getTickText: function(val) {
      return i18next.t(val, {ns: "railBar"});
    }
  },

  y: {
    label: i18next.t("y_label", {ns: "railBar"}),
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return (Math.round(d.value));
    },
    ticks: 10,
    tickSizeOuter: 0
  },

  z: {
    // label: i18next.t("z_label", {ns: "railBar"}),
    getId: function(d) {
      return d.category;
    },
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "railGeography"});
    }
  },
  width: 800
};