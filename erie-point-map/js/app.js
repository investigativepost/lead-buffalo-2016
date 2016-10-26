var main = function(vis, layers) {
  var vizjson = 'https://investigativepost.carto.com/api/v2/viz/3cf3b162-5b37-11e6-b739-0e3ebc282e83/viz.json';
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
        condition: "lead_result = 0"
      },
      {
        title: "0-5 PPB",
        condition: "lead_result > 0 AND lead_result <= 5"
      },
      {
        title: "5-10 PPB",
        condition: "lead_result > 5 AND lead_result <= 10"
      },
      {
        title: "10-15 PPB",
        condition: "lead_result > 10 AND lead_result < 15"
      },
      {
        title: "Greater than 15 PPB",
        condition: "lead_result > 15"
      }
    ]
  });

    addWidget(widgets, {
    title: 'Year Sampled',
    filters: [
      {
        title: "2004",
        condition: "year = 2004"
      },
      {
        title: "2007",
        condition: "year = 2007"
      },
      {
        title: "2010",
        condition: "year = 2010"
      },
      {
        title: "2013",
        condition: "year = 2013"
      }
    ]
  });

//     addWidget(widgets, {
//     title: 'Zipcode',
//     filters: [
//       {
//         title: "14004",
//         condition: "zip = 14004"
//       },
//       {
//         title: "14006",
//         condition: "zip = 14006"
//       },
//       {
//         title: "14031",
//         condition: "zip = 14031"
//       },
//       {
//         title: "14043",
//         condition: "zip = 14043"
//       },
//       {
//         title: "14047",
//         condition: "zip = 14047"
//       },
//       {
//         title: "14057",
//         condition: "zip = 14057"
//       },
//       {
//         title: "14075",
//         condition: "zip = 14075"
//       },
//       {
//         title: "14085",
//         condition: "zip = 14085"
//       },
//       {
//         title: "14086",
//         condition: "zip = 14086"
//       },
//       {
//         title: "14127",
//         condition: "zip = 14127"
//       },
//         {
//         title: "14150",
//         condition: "zip = 14150"
//       },
//       {
//         title: "14206",
//         condition: "zip = 14206"
//       },
//       {
//         title: "14215",
//         condition: "zip = 14215"
//       },
//       {
//         title: "14217",
//         condition: "zip = 14217"
//       },
//       {
//         title: "14218",
//         condition: "zip = 14218"
//       },
//       {
//         title: "14219",
//         condition: "zip = 14219"
//       },
//       {
//         title: "14220",
//         condition: "zip = 14220"
//       },
//       {
//         title: "14221",
//         condition: "zip = 14221"
//       },
//       {
//         title: "14224",
//         condition: "zip = 14224"
//       },
//       {
//         title: "14225",
//         condition: "zip = 14225"
//       },
//       {
//         title: "14226",
//         condition: "zip = 14226"
//       }
//     ]
//   });

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
  var statsQuery = "SELECT COUNT(address) AS count FROM erie_county_lead_points";

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
