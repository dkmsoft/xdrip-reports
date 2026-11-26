var touchDevice = (window.navigator.userAgent.indexOf("Mobile") > 0 || window.navigator.userAgent.indexOf("Android") > 0);
var DOWN_EVENT, UP_EVENT;
if (touchDevice) DOWN_EVENT = "touchstart";
else DOWN_EVENT = "mousedown";
var ONE_DAY = 24*60*60*1000;
var smallDevice;   // phone or 7" tablet in portrait 
var sendVars;
var bgData = null;
var params, startDate, endDate, firstDate;
var plot;

//-----------------------------
$(document).ready(function() {
   var wd = $(window).width();
   var ht = $(window).height();
	smallDevice = (wd < 420);
	if (smallDevice) $("body").css("margin", "5px");
	if (localStorage.getItem("xdripparams") == null || localStorage.getItem("xdripparams") == "") {
      params = {bgFormat:"mg", bgMin:70, bgMax:180};
      try {
         localStorage.xdripparams = JSON.stringify(params);
      } catch(err) { }   
   } else params = jQuery.parseJSON(localStorage.xdripparams);
	if ($("#ref").val() > "") {
	   GetData();
	}
   if (smallDevice) window.setTimeout("window.scrollTo(0,1)", 1000);
});


//-----------------------------
function GetData() {
   var sendVars = {ref:$("#ref").val(), action:"readfile"};
   $.ajax({type:"POST", url:"xdripserver.php", data:sendVars,
      success: function(data) {
         if (data == "") {
            DisplayMessage("No data found");
            return;
         }
         $("#btnGet").hide();
         $("#ref").attr("disabled","disabled");
         // Create data object
         if (data.substr(0,3) == "SQL") {
            DisplayMessage("You need to upload CSV export file, not database file.");
            return;
         }
         var arr = data.split("\n");
         var line, bgval, dte;
         bgData = [];
         for (var i = 0; i < arr.length; i++) {
            line = arr[i].split(";");
            if (line.length < 3) continue;
            if (line[2].length == 0) continue;  // calibration line
            if (!$.isNumeric(line[2])) continue;
            bgval = parseInt(line[2]);
            if (params.bgFormat == "mmol") bgval = Math.round(bgval * 10 / 18) / 10;
            dte = GetDate(line[0], line[1]);
            bgData.push({date:dte, bg:bgval});
         }
         $("#params").show();
         $("#buttonbar").show();
         $("#mess").hide();
         firstDate = bgData[0].date;
         firstDate.setHours(0);
         firstDate.setMinutes(0);
         startDate = firstDate;
         endDate = bgData[bgData.length-1].date;
         $("#startDate").text(FormatDate(startDate, "DD MMM"));
         $("#endDate").text(FormatDate(endDate, "DD MMM"));
         $("#inpLow").val(params.bgMin);
         $("#inpHigh").val(params.bgMax);
         $("#" + params.bgFormat).attr("checked", "checked");
      }
   });
}

//-----------------------------
function CheckBGFormat() {
   var fmt = $("input[name='format']:checked").val();
   if (fmt == params.bgFormat) return;
   params.bgFormat = fmt;
   for (var i = 0; i < bgData.length; i++) {
      if (params.bgFormat == "mmol") bgData[i].bg = Math.round(bgData[i].bg * 10 / 18) / 10;
      else bgData[i].bg = Math.round(bgData[i].bg * 18);
   }
   if (params.bgFormat == "mmol" && params.bgMin > 20) {
      params.bgMin = Math.round(params.bgMin * 10 / 18) / 10;
      params.bgMax = Math.round(params.bgMax * 10 / 18) / 10; 
   } else if (params.bgFormat == "mg" && params.bgMin < 20) {
      params.bgMin = Math.round(params.bgMin * 18);
      params.bgMax = Math.round(params.bgMax * 18);
   }
   $("#inpLow").val(params.bgMin);
   $("#inpHigh").val(params.bgMax);
   localStorage.xdripparams = JSON.stringify(params);
}

//-----------------------------
function CalcHbA1C(eAG) {
   if (params.bgFormat == "mmol") eAG *= 18;
   return Math.round((eAG + 46.7) * 10 / 28.7) / 10;
}

//-----------------------------
function GetDate(day, time) {
   var elem = day.split(".");
   var dayIdx = DayFirst() ? 0 : 1;
   var monthIdx = (dayIdx == 0) ? 1 : 0;
   var dt = new Date(parseInt(elem[2]), parseInt(elem[monthIdx]) - 1, parseInt(elem[dayIdx]), parseInt(time.substr(0,2)), parseInt(time.substr(3)));
   return dt;
}

//----------------------------
function ZeroPad(number, width) {
   var ret = "" + number.toString();
   while ( ret.length < width ) ret = "0" + ret;
   return ret;
}

//----------------------------
function FormatDate(dte, format) {
   var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   switch (format) {
      case "DD MMM": return (dte.getDate() + " " + months[dte.getMonth()]);
      case "DD MMM YYYY": return (dte.getDate() + " " + months[dte.getMonth()] + " " + dte.getFullYear());
      default: return dte.getFullYear() + "-" + ZeroPad((dte.getMonth() + 1),2) + "-" + ZeroPad(dte.getDate(),2);
   }   
}

//-----------------------------
function ShowHeader() {
   $("#fromdate").text(FormatDate(startDate, "DD MMM YYYY"));
   $("#todate").text(FormatDate(endDate, "DD MMM YYYY"));
   var oneDay = 24 * 60 * 60 * 1000;
   var numDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
   $("#numdays").text("(" + numDays + " days)");
   var hypoEvents = [];
   var inHypo = false;
   var hypoIdx, msec, mins;
   var tot = 0;
   var cnt = 0;
   var totmins = 0;
   for (var i = 0; i < bgData.length; i++) {
      if (bgData[i].date < startDate || bgData[i].date > endDate) continue;
      tot += bgData[i].bg;
      cnt++;
      if (inHypo) {
         if (bgData[i].bg < params.bgMin) continue;
         inHypo = false;
         if (i - hypoIdx < 5) continue;
         msec = bgData[i].date - bgData[hypoIdx].date;
         mins = Math.floor(msec / 60000);
         hypoEvents.push(mins);
         totmins += mins;
      } else if (bgData[i].bg < params.bgMin) {
         inHypo = true;
         hypoIdx = i;
      }
   } 
   var hba1c = CalcHbA1C(tot/cnt); 
   var IFCC = Math.round((10.93 * hba1c) - 23.50);
   $("#estA1c").html("<b>" + hba1c + "%</b> or <b>" + IFCC + "</b> mmol/mol" );
   $("#hypo").html("<b>" + hypoEvents.length + "</b>");
   if (hypoEvents.length) $("#hypo").append(" - ave duration " + Math.round(totmins/hypoEvents.length) + " mins");
   $("#reporttop").show();
  
}

//-----------------------------
function DistributionReport() {
   ShowHeader();
   var tot = 0;
   var cnt = 0;
   var above = {bg:[]};
   var below = {bg:[]};
   var inrange = {bg:[]};
   var all = {bg:[]};
   for (var i = 0; i < bgData.length; i++) {
      if (bgData[i].date < startDate || bgData[i].date > endDate) continue;
      tot += bgData[i].bg;
      if (bgData[i].bg > params.bgMax) above.bg.push(bgData[i].bg);
      else if (bgData[i].bg < params.bgMin) below.bg.push(bgData[i].bg);
      else inrange.bg.push(bgData[i].bg);
      all.bg.push(bgData[i].bg);
      cnt++;
   }
   below.percent = Math.round(below.bg.length * 1000 / cnt) / 10;
   inrange.percent = Math.round(inrange.bg.length * 1000 / cnt) / 10;
   above.percent = Math.round(above.bg.length * 1000 / cnt) / 10;
   
   var data = [{label:'In Range', data:inrange.bg.length, color:'lightgreen'},
       {label:'Above', data:above.bg.length, color:'lemonchiffon'},
       {label:'Below', data:below.bg.length, color:'lightcoral'}
   ];
   var code = "<td style='background-color:lightcoral;height:40px'>Below<br/>&lt;" + params.bgMin + "</td><td>" + below.percent + "%</td><td>" + below.bg.length + "</td>";
   code += "<td>" + GetAverage(below.bg) + "</td><td>" + GetMedian(below.bg) + "</td><td>" + GetStdDeviation(below.bg) + "</td>";
   $("#linebelow").html(code); 
   code = "<td style='background-color:lightgreen;height:40px'>In Range</td><td>" + inrange.percent + "%</td><td>" + inrange.bg.length + "</td>";
   code += "<td>" + GetAverage(inrange.bg) + "</td><td>" + GetMedian(inrange.bg) + "</td><td>" + GetStdDeviation(inrange.bg) + "</td>";
   $("#linein").html(code);
   code = "<td style='background-color:lemonchiffon;height:40px'>Above<br/>&gt;" + params.bgMax + "</td><td>" + above.percent + "%</td><td>" + above.bg.length + "</td>";
   code += "<td>" + GetAverage(above.bg) + "</td><td>" + GetMedian(above.bg) + "</td><td>" + GetStdDeviation(above.bg) + "</td>";
   $("#lineabove").html(code);
   code = "<td style='background-color:white;height:40px'>All</td><td>&nbsp;</td><td>" + cnt + "</td>";
   code += "<td>" + GetAverage(all.bg) + "</td><td>" + GetMedian(all.bg) + "</td><td>" + GetStdDeviation(all.bg) + "</td>";
   $("#overall").html(code);
   
   $('#distreport').show();
   plot = $.plot('#plot_dist', data, {
      series: {
         pie: {show: true, label:{show:false}}
      },
      legend: {show:false}
   });
}

//-----------------------------
function PercentageReport() {
   if (!$("reporttop").is(":visible")) ShowHeader();
   var tot = 0;
   var cnt = 0;
   var above = 0;
   var below = 0;
   var slot, val, tval;
   var timeslots = {};
   
   var days = Math.round((endDate - startDate) / ONE_DAY);
   var incr = 30;
   if (days > 30) incr = 12;
   else if (days > 14) incr = 15;
   else if (days > 7) incr = 20;
   for (var i = 0; i < bgData.length; i++) {
      if (bgData[i].date < startDate || bgData[i].date > endDate) continue;
      slot = "H" + ZeroPad(bgData[i].date.getHours(), 2).toString() + RoundFractionHour(bgData[i].date.getMinutes(), incr).toString();
      if (timeslots[slot] == null) timeslots[slot] = [];
      timeslots[slot].push(bgData[i].bg);
   }
   // Generate data series
   var arr, pos;
   var seriesMedian = [];
   var series10 = [];
   var series90 = [];
   var series25 = [];
   var series75 = [];
   timeslots = SortObjectProps(timeslots);
   for (var slot in timeslots) {
      tval = parseFloat(slot.substr(1,2) + "." + slot.substr(3));
      arr = timeslots[slot].sort((a, b) => a - b);
      if (arr.length < 3) continue;
      seriesMedian.push([tval, GetMedian(arr)]);
      pos = Math.round(arr.length * 0.1) - 1;
      series10.push([tval, arr[pos]]);
      pos = Math.round(arr.length * 0.9) - 1;
      series90.push([tval, arr[pos]]);
      pos = Math.round(arr.length * 0.25) - 1;
      series25.push([tval, arr[pos]]);
      pos = Math.round(arr.length * 0.75) - 1;
      series75.push([tval, arr[pos]]);
   } 
//$("#debug").text(JSON.stringify(seriesMedian));
   var tsize;
   if (params.bgFormat == "mmol") tsize = 1;
   else tsize = 10;
   var options = {
      series: { shadowSize: 1,  lines:{show:true, fill:false} },
      yaxis: { position: "left", tickSize:tsize, min:0, tickLength:5 },
      xaxis: { tickSize:1, tickDecimals:0, tickLength:5, show:true },
      legend:{ show:true, position:"sw" }
   }
   var dataset = [
      {id: "lower", data: [[0, params.bgMin], [24, params.bgMin]], lines: { show: true, lineWidth: 2, fill: false }, color: "red" },
      {id: "upper", data: [[0, params.bgMax], [24, params.bgMax]], lines: { show: true, lineWidth: 2, fill: false, fillcolor:"lightgreen" }, color: "yellow" },
      {id: "med10", data: series10, lines: { show: true, lineWidth: 0.5, fill: false }, color: "rgb(176,196,222)" },
      {id: "med90", data: series90, lines: { show: true, lineWidth: 0.5, fill: 0.4, fillColor:"rgba(176,196,222, 0.5)" }, color: "rgb(176,196,222)", fillBetween:"med10", label:"10 - 90 percentile" },
      {id: "med25", data: series25, lines: { show: true, lineWidth: 0.5, fill: false }, color: "rgb(70,130,180)" },
      {id: "med75", data: series75, lines: { show: true, lineWidth: 0.5, fill: 0.4, fillColor:"rgba(70,130,180, 0.4)" }, color: "rgb(70,130,180)", fillBetween:"med25", label:"25 - 75 percentile" },
      {id: "median", data: seriesMedian, lines: { show: true, lineWidth: 2, fill: false }, color: "black", label:"median" }      
   ];
   
   $('#plot_pcnt').show();
   plot = $.plot($("#plot_pcnt"), dataset, options);
}

//-----------------------------
function HourlyReport() {
   if (!$("reporttop").is(":visible")) ShowHeader();
   var tot = 0;
   var cnt = 0;
   var above = 0;
   var below = 0;
   var slot, val, tval;
   var timeslots = {};
   for (var hr = 0; hr < 24; hr++) {
      timeslots["H" + ZeroPad(hr, 2)] = [];
   }
   for (var i = 0; i < bgData.length; i++) {
      if (bgData[i].date < startDate || bgData[i].date > endDate) continue;
      slot = "H" + ZeroPad(RoundToHour(bgData[i].date), 2);
      if (timeslots[slot] == undefined) alert(slot);
      timeslots[slot].push(bgData[i].bg);
   }
   // Generate data series
   var arr, pos1, pos2;
   var seriesMedian = [];
   var series25 = [];
   var series75 = [];
   for (var slot in timeslots) {
      tval = parseInt(slot.substr(1,2));
      arr = timeslots[slot].sort((a, b) => a - b);
      if (arr.length < 3) continue;
      seriesMedian.push([tval, GetMedian(arr)]);
      pos1 = Math.round(arr.length * 0.25) - 1;
      series25.push([tval, arr[pos1]]);
      pos2 = Math.round(arr.length * 0.75) - 1;
      series75.push([tval, (arr[pos2] - arr[pos1])]);
   } 
   var tsize;
   if (params.bgFormat == "mmol") tsize = 1;
   else tsize = 10;
   var options = {
      series: { stack:true, bars:{align: "center", barWidth:0.8},
      lines:{show:false, fill:false} },
      yaxis: { position: "left", tickSize:tsize, min:0 },
      xaxis: { tickSize:1, tickDecimals:0, show:true },
      legend:{ show:true, position:"sw" }
   }
   var dataset = [
     {id: "med25", data: series25, stack:true, bars:{show:true, lineWidth:0}, color: "white" },
     {id: "med75", data: series75, stack:true, bars:{show:true, lineWidth:0}, color:"rgb(70,130,180)", shadowSize:2, label:"25 - 75 percentile" },
     {id: "lower", data: [[0, params.bgMin], [24, params.bgMin]], stack:false, lines: { show: true, lineWidth: 2, fill: false }, color: "red" },
     {id: "upper", data: [[0, params.bgMax], [24, params.bgMax]], stack:false, lines: { show: true, lineWidth: 2, fill: false }, color: "yellow" },
     {id: "median", data: seriesMedian, stack:false, points: { show: true, lineWidth: 2}, color: "black", label:"median all values" }      
   ];
   
   $('#plot_pcnt').show();
   plot = $.plot($("#plot_pcnt"), dataset, options);
}

//-----------------------------
function GetMedian(arr) {
   if (arr.length == 0) return 0;
   var sortarr = arr.sort((a, b) => a - b);
   var mid = Math.floor(sortarr.length / 2);
   return sortarr.length % 2 !== 0 ? sortarr[mid] : Math.round((sortarr[mid - 1] + sortarr[mid]) * 10 / 2) / 10;
}

//-----------------------------
function GetAverage(arr) {
   if (arr.length == 0) return 0;
   var tot = 0;
   for (var i = 0; i < arr.length; i++) {
      tot += arr[i];
   }
   return Math.round(tot * 10 / arr.length) / 10;
}

//-----------------------------
function GetStdDeviation(arr) {
   if (arr.length == 0) return 0;
   var mean = GetAverage(arr);
   var tot = 0;
   for (var i = 0; i < arr.length; i++) {
      tot += (arr[i] - mean) * (arr[i] - mean);
   }
   var totmean = tot / arr.length;
   return Math.round(Math.sqrt(totmean) * 10) / 10;
}

//-----------------------------
function RoundFractionHour(x, incr) {
   // First round minutes to nearest increment
   var m = (x % incr) >= (incr/2) ? parseInt(x / incr) * incr + incr : parseInt(x / incr) * incr;
   var frac = Math.round(m * 10 / 60);
   if (frac > 9) frac = 0;
   return frac; // / 100;
}

//-----------------------------
function RoundToHour(x) {
   var hr = x.getHours();
   var mins = x.getMinutes();
   if (mins > 30) {
      hr++;
      if (hr > 23) hr = 0;
   }
   return hr;
}

//-----------------------------
function DisplayMessage(mess) {
   $("#mess").text(mess);
   $("#mess").show();
}

function DayFirst() {
   var locale = window.navigator.userLanguage || window.navigator.language;
   var formatObj = new Intl.DateTimeFormat(locale).formatToParts(new Date());
   return (formatObj[0].type == "day");
}

function SortObjectProps(o) {
   var sorted = {}, key, a = [];
   for (key in o) {
      if (o.hasOwnProperty(key)) a.push(key);
   }
   a.sort();
   for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
   }
   return sorted;
}

//-----------------------------
// Requires jsPDF and html2canvas libraries that are downloaded only prior to this function being called
function CreatePDF() {
   $("#btnPDF").hide();
   var doc = new jsPDF("p", "pt", "letter");

   //doc.text(20, 20, 'Hello world!');
   html2canvas(document.getElementById("tooutput"), {width:820, height:1000, scale:1, x:0, y:400}).then(function(canvas) {
      var imgData = canvas.toDataURL();
      var scale = 600 / canvas.width;
      doc.addImage(imgData, 'image/png', 20, 20, Math.round(canvas.width * scale), Math.round(canvas.height * scale));
      //doc.output('datauri');
      // doc.output('dataurlnewwindow');
      doc.save("xdrip_report.pdf");
      $("#mess").hide();
      $("#btnPDF").show();
   });
   
}   

//============== Event Handlers =================

$(function() {
	$('#btnRepSummary').on(DOWN_EVENT, function(event) {
		DistributionReport();
		PercentageReport();
		$(this).css("background-color", "#1D3749");
		$('#btnRepDist').css("background-color", "#428bca");
		$('#btnRepPercent').css("background-color", "#428bca");
		$('#btnRepHour').css("background-color", "#428bca");
   });
   //------------
   $('#btnRepDist').on(DOWN_EVENT, function(event) {
      $('#plot_pcnt').hide();
      DistributionReport();
      $(this).css("background-color", "#1D3749");
      $('#btnRepPercent').css("background-color", "#428bca");
      $('#btnRepSummary').css("background-color", "#428bca");
      $('#btnRepHour').css("background-color", "#428bca");
   });
   //------------
   $('#btnRepPercent').on(DOWN_EVENT, function(event) {
      $('#distreport').hide();
      PercentageReport();
      $(this).css("background-color", "#1D3749");
      $('#btnRepDist').css("background-color", "#428bca");
      $('#btnRepSummary').css("background-color", "#428bca");
      $('#btnRepHour').css("background-color", "#428bca");
   });
   //------------
   $('#btnRepHour').on(DOWN_EVENT, function(event) {
      $('#distreport').hide();
      HourlyReport();
      $(this).css("background-color", "#1D3749");
      $('#btnRepDist').css("background-color", "#428bca");
      $('#btnRepSummary').css("background-color", "#428bca");
      $('#btnRepPercent').css("background-color", "#428bca");
   });
   //------------
   $('#btnGet').on(DOWN_EVENT, function(event) {
      if ($("#ref").val() == "") DisplayMessage("Please enter data reference");
      else {
         DisplayMessage("Retrieving data ...");
         GetData();
      }
      
   });
   //------------
   $('#btnNew').on(DOWN_EVENT, function(event) {
      location.href = "index.php";
   });
   //------------
   $("input[name='format']").on("change", function(event) {
      CheckBGFormat();
   });
   
   //------------
   $('#inpLow').on("change", function(event) {
      params.bgMin = $(this).val();
      localStorage.xdripparams = JSON.stringify(params);
   });
   //------------
   $('#inpHigh').on("change", function(event) {
      params.bgMax = $(this).val();
      localStorage.xdripparams = JSON.stringify(params);
   });
   //------------
   $('#btnDates').on(DOWN_EVENT, function(event) {
      $("#inpStart").val(FormatDate(startDate, ""));
      $("#inpEnd").val(FormatDate(endDate, ""));
      var $panel = $("#datepanel");
      var x = 20;
      if (smallDevice) x = 5;
      $panel.css({left:x, top:140});
      $panel.show();
   });
   
   //------------
   $('#btnOK').on(DOWN_EVENT, function(event) {
      $("#datepanel").hide();
      var dte = new Date($("#inpStart").val());
      if (dte < firstDate) {
         alert("Start date selected before first data - changed to first data date.");
         startDate = firstDate;
      } else {
         startDate = dte;
         startDate.setHours(0);
         startDate.setMinutes(0);
      }   
      endDate = new Date($("#inpEnd").val());
      endDate.setHours(23);
      endDate.setMinutes(59);
      $("#startDate").text(FormatDate(startDate, "DD MMM"));
      $("#endDate").text(FormatDate(endDate, "DD MMM"));
   });
   
   //------------
   $('.daterange').on(DOWN_EVENT, function(event) {
      var days = parseInt($(this).attr("data-days")) - 1;
      endDate = bgData[bgData.length-1].date;
      $("#inpEnd").val(FormatDate(endDate, ""));
      var dateOffset = ONE_DAY * days;
      var dte = new Date();
      dte.setTime(endDate.getTime() - dateOffset);
      if (dte < firstDate) {
         alert("Start date selected before first data - changed to first data date.");
         startDate = firstDate;
      } else startDate = dte;
      $("#inpStart").val(FormatDate(startDate, ""));
   });
   
   //--------------   
   $('.closeicon').on(DOWN_EVENT, function(e) {
      $(this).parent().hide();
   });
   
   //------------
   $('#btnPDF').on(DOWN_EVENT, function(event) {
      $.getScript( "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js").done(function( script, textStatus ) {
         $.getScript( "js/html2canvas.min.js").done(function( script, textStatus ) {
            DisplayMessage("Creating PDF");
            CreatePDF();
         }); 
      });
    });
   
});