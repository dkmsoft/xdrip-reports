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
		if (window.navigator.userAgent.indexOf("Android") < 0) location.href = "pc.php";
      
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
<body style="margin:15px; font-family:'Open Sans', Verdana; font-size:16px; background-color:white">
   <h2><img src="xdrip_icon.png" style="width:26px" /> xDrip+ Reports</h2>
	<p>Here you can upload your CGM glucose readings from xDrip+ and then produce reports.<br/>
	If you want to use data you have uploaded within the last three days and you know your reference number,
		<a href="xdripreports.php">proceed to reports</a>.
	</p>
	<h3>Upload your data</h3>
	<p><b>Step 1 - Export your data from xDrip+</b></p>
	To export data, select "Import/Export Features" from the menu on the top right of xDrip home screen, then "Export CSV".
	<br/>From the calendar that pops up, select the start date from which you want to report from. Limit this to a maximum of three months.
	 Once this is done, your data will be exported to a file called "exportCSVxxxxx-xxxx.zip" where x is a digit. The file is placed in a folder
	called "xdrip" in the internal memory of the phone.
	<p><b>Step 2 - Select the exported file then upload</b></p>
	<form id="form1" method="post" enctype="multipart/form-data" action="savefileupload.php"> 
     <p><input id="uploadedfile" type="file" name="uploadedfile" accept="zip,csv" style="width:300px; font-size:110%"/></p>
     <p><input id="btnUpload" onclick="ValidateFile()" type="button" value="Upload File" class="btn btn-primary"/></p>
     <input type="hidden" name="domain" value="" />
   </form>  
   <div id="labMess" style="width:300px; color:red"><?php echo($mess)?></div>
   <h3>Notes / Troubleshooting</h3>
   <ul>
   	<li>Uploaded data is stored on the server for three days before being deleted. <i>The data is completely anonymous - no personal information is captured or stored.</i></li>
   	<li>Most likely you will want to look at the reports on a PC rather than your phone. To do this, copy the exported zip file to your
   		PC and then access this URL from your PC browser to upload the file. The reporting software will automatically uncompress the file
   		on the server. Alternatively, you can upload from your phone and you will get a unique reference number. Then in your PC browser, you can enter this reference to access your data.
   	</li>
   	<li>If you get an error when uploading your file, there appears to be an issue with older Android versions (prior to 9) when
   		you use the "Files" option from the browser to select the exported file. The file has a "zip" extension but if it shows a "csv"
   		extension when you select it, the upload will fail. To resolve this you need to unzip the file first and then select the uncompressed ".csv" file.
   		Alternatively, employ the point above where this issue will not occur.
   		<br/>If you need to uncompress the file on your phone, a good app to do that is the Google "Files" app.
   	</li>
 
   </ul>
  
</body>
</html>
