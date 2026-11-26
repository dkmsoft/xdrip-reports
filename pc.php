<?php
   if (isset($_POST["message"])) $mess = $_POST["message"];
   else $mess = "";
?>
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <meta content="Upload xDrip Glucose" name="description"/>
	<title>xDrip+ Reports</title>
   <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
   <style>
   	ul {margin-bottom:.3em; margin-top:.2em; margin-left:-20px}
   	.btn { display:inline-block; padding:6px 12px; margin-bottom:0; font-size:14px; font-weight:normal;
         line-height:1.4; text-align:center; white-space:nowrap; vertical-align:middle; cursor:pointer;
         border:1px solid transparent; border-radius:4px}
      .btn-default {color:#333; background-color:#efefef; border-color:#ccc}
      .btn-primary {color:#fff; background-color: #428bca; border-color: #357ebd}
      h3 {margin-bottom:0px; color:steelblue}
   </style>
	<script type="text/javascript">
      //---------------------------------------
      function ValidateFile() {
         document.forms["form1"].domain.value = window.location.href;
         fname = document.forms["form1"].uploadedfile.value.toLowerCase();
         if (fname == "") {
            alert("Please select a file first");
            return false;
         }
         arr = fname.split(".");
         ext = arr[arr.length - 1];
         if (ext == "zip" || ext == "csv")  {
            document.forms["form1"].submit();
            return true;
         }  
         alert("Image must be type zip or csv");
         return false;
      }
   </script>   
</head>
<body style="margin:20px 0px 20px 20px; font-family:'Open Sans', Verdana; width:550px; background-color:white">
   <h2><img src="xdrip_icon.png" style="width:26px" /> xDrip+ Reports</h2>
	<p>Here you can upload your CGM glucose readings from xDrip+ and then produce reports.<br/>
	If you want to use data you have uploaded within the last three days and you know your reference number,
		<a href="xdripreports.php">proceed to reports</a>.
	</p>
	<h3>Upload your data</h3>
	You are not currently accessing this page from your Android device which has xDrip+ running.
	If you have not already exported your data on your phone and copied the file to this PC, you need to do that first
	by going to <span style="color:steelblue">xdrip.dkmgames.com</span> on your phone.

	<p><b>Select the exported file then click Upload File</b></p>
	<form id="form1" method="post" enctype="multipart/form-data" action="savefileupload.php"> 
     <p><input id="uploadedfile" type="file" name="uploadedfile" accept="zip,csv" style="width:300px; font-size:110%"/></p>
     <p><input id="btnUpload" onclick="ValidateFile()" type="button" value="Upload File" class="btn btn-primary"/></p>
     <input type="hidden" name="domain" value="" />
   </form>  
   <div id="labMess" style="width:300px; color:red"><?php echo($mess)?></div>
   <h3>Notes</h3>

   	Uploaded data is stored on the server for three days before being deleted. <i>The data is completely anonymous - no personal information is captured or stored.</i></li>
   
</body>
</html>
