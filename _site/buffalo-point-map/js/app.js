var main = function(vis, layers) {
  var vizjson = 'https://investigativepost.carto.com/api/v2/viz/b0970304-5b31-11e6-8287-0e05a8b3e3d7/viz.json';
  var options = {
    shareable: false,
    title: false,
    description: false,
    search: false,
    tiles_loader: true
  };
  cartodb.createVis('map', vizjson, options)
  .done(onVisCreated)
  .error(function(err) { alert('error!'); });
};

var onVisCreated = function(vis, layers) {
  var sublayer = layers[1].getSubLayer(0);

  sublayer.infowindow.set({
    template: document.getElementById('infowindowTemplate').innerHTML
  });

  var originalSQL = sublayer.getSQL();
  var originalCartoCSS = sublayer.getCartoCSS();
  var widgets = new Widgets();

    addWidget(widgets, {
    title: 'Lead Count PPB',
    filters: [
      {
        title: "0 PPB",
        condition: "lead_ppb = 0"
      },
      {
        title: "0-5 PPB",
        condition: "lead_ppb > 0 AND lead_ppb <= 5"
      },
      {
        title: "5-10 PPB",
        condition: "lead_ppb > 5 AND lead_ppb <= 10"
      },
      {
        title: "10-15 PPB",
        condition: "lead_ppb > 10 AND lead_ppb < 15"
      },
      {
        title: "Greater than 15 PPB",
        condition: "lead_ppb > 15"
      }
    ]
  });

    addWidget(widgets, {
    title: 'Year Sampled',
    filters: [
      {
        title: "2002",
        condition: "year = 2002"
      },
      {
        title: "2005",
        condition: "year = 2005"
      },
      {
        title: "2008",
        condition: "year = 2008"
      },
      {
        title: "2011",
        condition: "year = 2011"
      },
      {
        title: "2014",
        condition: "year = 2014"
      }
    ]
  });

    addWidget(widgets, {
    title: 'Zipcode',
    filters: [
      {
        title: "14201",
        condition: "zipcode = 14201"
      },
      {
        title: "14204",
        condition: "zipcode = 14204"
      },
      {
        title: "14206",
        condition: "zipcode = 14206"
      },
      {
        title: "14207",
        condition: "zipcode = 14207"
      },
      {
        title: "14208",
        condition: "zipcode = 14208"
      },
      {
        title: "14209",
        condition: "zipcode = 14209"
      },
      {
        title: "14210",
        condition: "zipcode = 14210"
      },
      {
        title: "14211",
        condition: "zipcode = 14211"
      },
      {
        title: "14212",
        condition: "zipcode = 14212"
      },
      {
        title: "14213",
        condition: "zipcode = 14213"
      },
        {
        title: "14214",
        condition: "zipcode = 14214"
      },
      {
        title: "14215",
        condition: "zipcode = 14215"
      },
      {
        title: "14216",
        condition: "zipcode = 14216"
      },
      {
        title: "14220",
        condition: "zipcode = 14220"
      },
      {
        title: "14222",
        condition: "zipcode = 14222"
      }
    ]
  });

  var stats = addStats();
  loadStats(stats, widgets);

  widgets.each(function(widget) {
    widget.bind('change:activeFilter', function() {

      var sql = generateSQL(originalSQL, widgets);
      var cartoCSS = generateCartoCSS(originalCartoCSS, widgets);

      sublayer.set({
        sql: sql,
        cartocss: cartoCSS
      });

      loadStats(stats, widgets);
    });
  });

  renderStats(stats);
  renderWidgets(widgets);
};

var loadStats = function(stats, widgets) {
  var statsQuery = "SELECT COUNT(address) AS count FROM buffalo_lead";

  var filterConditions = widgets.getActiveFilterConditions();
  if (filterConditions.length) {
    statsQuery += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("Stats query: ", statsQuery);

  cartodb.SQL({ user: 'investigativepost'}).execute(statsQuery, function(data) {
    var row = data.rows[0];
    stats.set({
      count: row.count,
      min: row.min,
      max: row.max,
      avg: row.avg
    });
  });
};

var generateSQL = function(originalSQL, widgets) {
  var sql = originalSQL;
  var filterConditions = widgets.getActiveFilterConditions();

  if (filterConditions.length) {
    sql += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("SQL: ", sql);

  return sql;
};

var generateCartoCSS = function(originalCartoCSS, widgets) {
  var cartoCSS = originalCartoCSS;
  var filterConditions = widgets.getActiveFilterConditions();

  console.log("CartoCSS: ", cartoCSS);

  return cartoCSS;
};

window.onload = main;
