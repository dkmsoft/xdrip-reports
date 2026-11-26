<?php
	if (isset($_POST["ref"])) $ref = $_POST["ref"];
   else $ref = "";
	if (isset($_POST["message"])) $mess = $_POST["message"];
	else $mess = "";
?>
<!DOCTYPE html>
<html lang="en">
 <head>
   <meta charset="utf-8">
	<meta name="author" content=""/>
	<meta name="apple-mobile-web-app-capable" content="yes"/>
	<meta name="viewport" content="initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"/> 
	<title>xDrip+ Reports</title>
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
	<style>
		.btn { display:inline-block; padding:5px 8px; margin-bottom:0; font-size:14px; font-weight:normal;
         line-height:1.42857143; text-align:center; white-space:nowrap; vertical-align:middle; cursor:pointer;
         border:1px solid transparent; border-radius:4px}
      .btn-default {color:#333; background-color:#efefef; border-color:#ccc}
      .btn-primary {color:#fff; background-color: #428bca; border-color: #357ebd}
      .btn-lg {padding:10px 16px; font-size:18px; line-height:1.33; border-radius:6px}
   	.dialog {width:320px; border:gray 1px solid; padding:15px; position:absolute; font-family:Arial; display:none;
         font-size:16px; color:black; background-color:aliceblue; text-align:center; border-radius:10px; box-shadow:0 4px 8px rgba(0, 0, 0, .5)}
      .panel {padding:10px; margin-bottom:0px; margin-top:8px; border:1px solid #e3e3e3;  border-radius: 6px; width:325px; background-color:#FAFAFA;
  			-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);
		}
		.closeicon {width:24px; height:30px; float:right; margin-top:-10px;
         font-size:20px; font-weight:bold; text-align:center; cursor:pointer} 
      .daterange {text-decoration:underline; cursor:pointer; font-size:18px; text-align:left; margin-bottom:5px}  
      table { border-collapse: collapse}
      .mess {color:red; font-weight:bold; background-color:#EEEEEE; border-radius:4px; padding:4px; box-shadow:0 1px 2px rgba(0, 0, 0, .5);
      	margin-top:8px; width:250px; text-align:center; display:none}
		th, td {border: 1px solid lightgray; text-align:center; padding:5px}
		th {background-color:#EEEEEE}
	</style>
	<script src="https://code.jquery.com/jquery-4.0.0.min.js" crossorigin="anonymous"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.pie.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.fillbetween.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.stack.min.js"></script>
	<script type="text/javascript" src="js/xdripreports.js"></script>

</head>
<body style="margin:20px 0px 0px 20px; font-family:'Open Sans', Verdana; background-color:white">
   <h2><img src="xdrip_icon.png" style="width:26px" /> xDrip Reports</h2>
   
   <div id="dataget">
   	Data Reference: <input id="ref" type="text" style="width:55px;padding:3px; font-size:16px" value="<?php echo($ref)?>"/>
   	&nbsp;<div id="btnGet" class="btn btn-default">Retrieve</div>
   	&nbsp;&nbsp;<div id="btnNew" class="btn btn-default">Upload New</div>
   </div>
   <div id="params" class="panel" style="display:none">
   	<p>
   		From <span id="startDate"></span> to <span id="endDate"></span>&nbsp;&nbsp;<span id="btnDates" class="btn btn-default">Change</span>
  		</p>
   	<p>Target Low: <input id="inpLow" type="number" step="0.1" value="" style="width:50px"/>&nbsp;&nbsp;
   		High: <input id="inpHigh" type="number" step="0.1" value="" style="width:50px"/>
   	</p>
   	<p id="bgformat" style="border:lightgray 1px solid; padding:5px; width:280px; background-color:white">
   		<input id="mg" type="radio" name="format" value="mg" checked> mg/dl (90)&nbsp;&nbsp;
			<input id="mmol" type="radio" name="format" value="mmol"> mmol/L (5.0)
   	</p>
   </div>
   <div id="buttonbar" style="display:none; margin-top:15px">
   	<div id="btnRepSummary" class="btn btn-primary">Summary</div>&nbsp;
  		<div id="btnRepDist" class="btn btn-primary">Distribution</div>&nbsp;
  		<div id="btnRepPercent" class="btn btn-primary">Percentile</div>&nbsp;
  	   <div id="btnRepHour" class="btn btn-primary">Hourly</div>&nbsp;
   </div>		
  	<div id="mess" class="mess"></div>	
   <p>&nbsp;</p>
   <div id="tooutput" style="width:820px;margin-bottom:15px">
   	<div id="reporttop" style="display:none">
   		<h3 style="margin-bottom:2px">Glucose Analysis: <div id="fromdate" style="display:inline-block"></div> - <div id="todate" style="display:inline-block"></div>
   			&nbsp;&nbsp;<span id="numdays" style="font-size:90%"></span>
   			<div id="btnPDF" class="btn btn-default" style="margin-left:45px">Generate PDF</div>
   		</h3>
   		<hr style="border:1px solid gray"/>
   		<div style="display:inline-block; margin-top:15px">Estimated A1c:&nbsp;<span id="estA1c"></span></div>
   		<div style="display:inline-block; margin-left:25px">Hypo events:&nbsp;<span id="hypo"></span></div>
   	</div>
   	<div id="distreport" style="margin-top:25px; display:none">
   		<table>
   			<tr>
   				<td rowspan="5"><div id="plot_dist" style="width:220px; height:220px; margin:12px"></div></td>
   				<th>Range</th><th>% Read</th><th># Read</th><th>Average</th><th>Median</th><th>Std Dev</th>
   			</tr>
   			<tr id="linein"></tr>
   			<tr id="linebelow"></tr>
   			<tr id="lineabove"></tr>
   			<tr id="overall"></tr>
   		</table>
   	</div>
   	<div id="plot_pcnt" style="width:780px; height:400px; margin-top:25px; display:none"></div>
   </div>
   <div id="datepanel" class="dialog">
   	<div id="close" class="closeicon">&#10060;</div>
   	<div>
   		<div style="display:inline-block">Start Date<br/><input id="inpStart" type="date" /></div>
   		<div style="display:inline-block;margin-left:20px">End Date<br/><input id="inpEnd" type="date" /></div>
   		<p>&nbsp;</p>
   		<div class="daterange" data-days="1">Last day</div>
   		<div class="daterange" data-days="3">Last 3 days</div>
   		<div class="daterange" data-days="7">Last week</div>
   		<div class="daterange" data-days="14">Last 2 weeks</div>
   		<div class="daterange" data-days="30">Last 30 days</div>
   		<div class="daterange" data-days="90">Last 3 months</div>
   		<hr/>
   		<div id="btnOK" class="btn btn-primary">OK</div>
   	</div>
   </div>
   <div id="debug"></div>
</html>
