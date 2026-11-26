<?php
	if (isset($_POST["action"])) $action = $_POST["action"];
   else if (isset($_GET["action"])) $action = $_GET["action"];
   else $action = "readfile";
	switch (strtolower($action)) {
 		case "readfile":
			if (isset($_POST["ref"])) $ref = $_POST["ref"];
			else if (isset($_GET["ref"])) $ref = $_GET["ref"];
			else {
				echo("");
				break;
			}
			$path = getcwd() . "/database/" . $ref . ".csv";
			if (file_exists($path)) {
				$data = file_get_contents($path);
			} else $data = "";	
			echo($data);
			break;
	
		case "purge":
			PurgeOldData();
			break;	
	}
	
	//----------------
	function PurgeOldData() {
		$files = glob(getcwd() . "/Database/*.csv");
   	usort($files, function($a, $b) {
      	return filectime($a) > filectime($b);
   	});
		// All 3 days ago
		$cnt = 0;
		$days = 3;
		$old = time() - ($days * 24 * 60 * 60);
		foreach ($files as $file) {
      	if (filectime($file) < $old) {
      		echo(date("F d Y H:i:s.", filectime($file)) . " - " . $file . "<br/>");
				unlink($file);
      	} else $cnt++;
		}
		echo($cnt . " currently in database.");	
	}
	
?>