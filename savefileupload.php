<?php
   $mess = "";
	$ref = "";
	$path = getcwd() . "/database";
	if (!file_exists($_FILES['uploadedfile']['tmp_name'])) $mess = "File too large!";
   if ($mess == "") {
   	$ref = GetUniqueId($path);
      $mess = SaveFile($_FILES['uploadedfile']['name'], $ref, $path);
   }
	if (strpos($mess, "success") > 0) $urlbackto = "xdripreports.php";
	else $urlbackto = $_POST["domain"];
     
   //----------------------
   function SaveFile($exportName, $id, $path) {
   	$ext = strtolower(pathinfo($exportName, PATHINFO_EXTENSION));
      $targetFile = $path . "/" . $id . ".csv";
		if ($ext == "zip") {
			$zip = new ZipArchive;
			$res = $zip->open($_FILES['uploadedfile']['tmp_name']);
			if ($res === TRUE) {
				$folder = $path . "/" . $id . "/";
				$zip->extractTo($folder);
 				$zip->close();
				unlink($_FILES['uploadedfile']['tmp_name']);
				$files = scandir($folder);
				$firstFile = $folder . $files[2];
        		rename($firstFile, $targetFile);
    			rmdir($path . "/" . $id);
			} else {
				unlink($_FILES['uploadedfile']['tmp_name']);
         	return "There was an error uncompressing file, please try again!";
			}
		} else {
      	if (!move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $targetFile)) {
      		unlink($_FILES['uploadedfile']['tmp_name']);
         	return "There was an error uploading the file, please try again!";
			}	
      }
      return "Your data is successfully uploaded with reference: <b>" . $id . "</b>"; 
   }

	//--------------------------
   function GetUniqueId($path) {
      do {
         $key = strtoupper(substr(md5(rand()), 0, 5));
      } while (file_exists($path . "/" . $key . ".json"));
      return $key;
   }	


?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <title>xDrip Data Upload</title>
</head>
<body>
   <form id="form1" method="POST" action="<?php echo($urlbackto)?>">
		<input type="hidden" name="ref" value="<?php echo($ref)?>" />
		<input type="hidden" name="message" value="<?php echo($mess)?>" />
	</form>
	<script type="text/javascript">
		document.forms["form1"].submit();
	</script>
</body>
</html>     
         
