<?php
	if( isset($_SESSION['t_username']) && ( isset($_POST['t_data']) || isset($_GET['t_data']) ) ){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = $_SESSION['t_username'];

		$sql = "SELECT 'ID' FROM $db_table WHERE username='$t_username'";
		$result = mysql_query($sql);
		$row = mysql_fetch_array($result);
		$user_id = $row['ID'];

		$sql = "SELECT * FROM $db_timers WHERE user_id='$user_id'";
		$result = mysql_query($sql);
		while($row = mysql_fetch_array($result)){

		}


	} else{
		echo("no_data");
	}
?>
