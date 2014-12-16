// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .
//= require bootstrap-sprockets
//= require sweet-alert.min
//= require Chart.min


// Set Chart options, data and create them.
Chart.defaults.global.responsive = true;
Chart.defaults.global.tooltipEvents = ["mousemove", "touchstart", "touchmove"];


// Firebase data for charts
var statbase = new Firebase("https://twitch-substats.firebaseio.com/users");

statbase.once('value', function(statbaseSnapshot) {

  var subscriberList = [];

  statbaseSnapshot.forEach(function(user) {
    var key = user.key();
    var value = user.val();
    //console.log(key);
    //console.log(value.subcount);
    //console.log(value.subs);
    subscriberList.push({
                        name: key,
                        subcount: value.subcount,
                        subs: value.subs
                        });
  });


  for ( var i = 0, user; user = subscriberList[i++]; ) {

    $("#user-box-rows").append("<div class=\"col-md-4\">"
    +  "<div class=\"user-boxes\">"
    +    "<h2><span class=\"label label-default\">"+user.subcount+"</span> "+user.name+"</h2>"
    +    "<div id=\"center\">"
    +     "<canvas id=\"chart-"+i+"\" width=\"310\" height=\"200\"></canvas>"
    +    "</div>"
    +    "<p><a class=\"btn btn-default\" data-method=\"get\" href=\"/twitchdoe/stats/"+user.name+"\" role=\"button\">View details &raquo;</a></p>"
    +  "</div>"
    +"</div>");

    // Setup days for x-axis
    /*
    var previousDays = [];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var date = new Date();
    var daypointer = date.getDay();

    while (previousDays.length < 7) {
      previousDays.push(days[daypointer]);
      daypointer--;
      if ( daypointer < 0 ) {
        daypointer = 6;
      }
    }
    previousDays.reverse();
    */


    // Calculate daily subcounts for the past week    
    var subtimestamps = []
    for (var key in user.subs) {
      if (user.subs.hasOwnProperty(key)) {
        subtimestamps.push( user.subs[key].time );
      }
    }
    subtimestamps.reverse()
    //console.log( subtimestamps );

    var pastSubs = [0, 0, 0, 0, 0, 0, 0];
    var pastSubDates = [];
    var dailySubs = 0;
    var dateChanges = 0;
    var firstCycle = true;

    for ( var t = 0, timestamp; timestamp = subtimestamps[t++]; ) {
      var regExp = /(\d*).(\d*).(\d*)/;
      var match = timestamp.match(regExp);
      if ( match ) {
        if ( match[1] ) {
          var stampDayOfMonth = match[1]; // day of month
        }
        if ( match[2] ) {
          var stampMonth = match[2]; // month
        }
        if ( match[3] ) {
          var stampYear = match[3]; // year
        }
      }

      if ( firstCycle ) {
        var previousStampDayOfMonth = stampDayOfMonth;
        var previousStampMonth = stampMonth;
        var previousStampYear = stampYear;
        firstCycle = false;
      }

      if ( previousStampYear == stampYear && previousStampMonth == stampMonth && previousStampDayOfMonth == stampDayOfMonth ) {
        dailySubs++;
      } else {
        pastSubs[dateChanges] = dailySubs;
        pastSubDates.push( previousStampDayOfMonth +"."+previousStampMonth+"."+previousStampYear );
        dailySubs = 0;
        dateChanges++;
        previousStampDayOfMonth = stampDayOfMonth;
        previousStampMonth = stampMonth;
        previousStampYear = stampYear;
      }

      if ( dateChanges >= 7 ) {
        break;
      }
    }
    pastSubs.reverse();
    pastSubDates.reverse();
    //console.log(pastSubs);

    // Build the chart
    var data = {
      labels: pastSubDates,
      datasets: [
        {
          label: "Subscriber counts",
          fillColor: "rgba(91,166,191,0.25)",
          strokeColor: "rgba(220,220,220,0.8)",
          highlightFill: "rgba(220,220,220,0.75)",
          highlightStroke: "rgba(220,220,220,1)",
          data: [ pastSubs[0], pastSubs[1], pastSubs[2], pastSubs[3], pastSubs[4], pastSubs[5], pastSubs[6] ]
        }
      ]
    };

    var ctx = document.getElementById("chart-"+i).getContext("2d");
    var lineChart = new Chart(ctx).Line(data);
  }

});




