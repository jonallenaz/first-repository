<?php
	session_start();
	if( isset($_SESSION['t_username']) && isset($_POST['t_data']) ){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = $_SESSION['t_username'];
		$t_data = $_POST['t_data'];

		$sql = "SELECT * FROM $db_table WHERE username='$t_username'";
		$result = mysql_query($sql);
		$row = mysql_fetch_array($result);
		$user_id = $row['ID'];
		// var_dump($row);

		// delete previous timer entries
		$sql = "DELETE FROM $db_timers WHERE user_id='$user_id'";
		$result = mysql_query($sql);

		// var_dump($t_data);
		foreach($t_data as $key => $value){
			// $value = stripslashes($value);
			$sql = 'INSERT INTO '.$db_timers.' (`user_id`, `timer_key`, `timer_json`) VALUES ("'.$user_id.'", "'.$key.'", "'.$value.'")';
			var_dump($sql);
			if (!mysql_query($sql)){
				die('Error: ' . mysql_error());
			}
			// $result = msql_query($sql);
			var_dump($result);
		}


	} else{
		echo("no_data");
	}
?>
