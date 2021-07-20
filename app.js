//@author: Robert D.
// API key variable
var apiKey = 'Tpk_46a92f9cc23242d0985987dcf2113f5e'
google.charts.load('current', {
  packages: ['corechart', 'bar']
});

//default chart format
var stocksJSON = {
  cols: [{
      id: 'Symbols',
      label: 'Symbols',
      type: 'string'
    },
    {
      id: 'Price',
      label: 'Price',
      type: 'number'
    }
  ],
  rows: []
};

//creates chart
function drawChart() {
  var chartData = new google.visualization.DataTable(stocksJSON, 0.6)
  var options = {
    title: 'Stock Prices',
    chartArea: {
      width: '50%'
    },
    hAxis: {
      title: 'Price in US $',
    },
    vAxis: {
      title: 'Symbol'
    }
  };
  var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
  chart.draw(chartData, options);
}

// creating an instance of Vue
const app = new Vue({
  el: '#app',
  data: {
    // An array of stock symbols as str
    stocks: [],
    seen: true
  },
  methods: {
  	// performs api call and starts update timer
    handleSubmit: function() {
      var iexUrl = "https://sandbox.iexapis.com/stable/stock/symbol/price"
      var stock = this.$refs.stock.value.toUpperCase();
      var options = {
        params: {
          token: apiKey
        },
      }
      var constructedUrl = iexUrl.replace("symbol", this.$refs.stock.value);
      axios.get(constructedUrl, options).then((res) => this.addStock(stock, res.data)).catch((err) => console.log(err));
      if (this.seen) {
      	setInterval(this.updateStocks, 5000)
        this.seen = false;
      }
    },
    //This method takes in the symbol and price as parameters and adds them to the datasets
    addStock: function(symbol, price) {
      this.stocks.push(symbol)
      stocksJSON.rows.push({
        c: [{
          v: symbol
        }, {
          v: price
        }]
      })
      // update chart
      google.charts.setOnLoadCallback(drawChart);
    },
    // update data and call batch request
    updateStocks: function() {
      var iexUrl = "https://sandbox.iexapis.com/stable/stock/market/batch?symbols=keys&types=price";
      var options = {
        params: {
          token: apiKey
        }
      }
      var constructedUrl = iexUrl.replace("keys", this.stocks)
      axios.get(constructedUrl, options).then((res) => this.updateList(res.data)).catch((err) => console.log(err));
      google.charts.setOnLoadCallback(drawChart);
      console.log(constructedUrl);
    },
    // helper method to update values
    updateList: function(newData) {
      var keys = Object.keys(newData)
      for (var index in keys) {
        stocksJSON.rows[index].c[1].v = newData[keys[index]].price
      }
    }
  }
});
