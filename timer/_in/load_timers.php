<?php
	session_start();
	if( isset($_SESSION['t_username']) && isset($_GET['callback']) ){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = $_SESSION['t_username'];
		$callback = $_GET['callback'];

		$sql = "SELECT * FROM $db_table WHERE username='$t_username'";
		$result = mysql_query($sql);
		$row = mysql_fetch_array($result);
		$user_id = $row['ID'];
		// var_dump($row);

		$sql = "SELECT * FROM $db_timers WHERE user_id='$user_id'";
		$result = mysql_query($sql);

		$rows = array();
		while($r = mysql_fetch_assoc($result)) {
			$rows[] = $r;
		}
		print $callback."(".json_encode($rows).")";

	} else{
		echo("{}");
	}
?>
