<?php
	if(isset($_POST['t_username'])){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = stripslashes($_POST['t_username']);
		$t_username = mysql_real_escape_string($t_username);
		$sql = "SELECT 'ID' FROM $db_table WHERE username='$t_username'";
		$result = mysql_query($sql);
		$count = mysql_num_rows($result);
		if($count < 1){
			echo 'true';
		} else {
			echo 'Username already taken!';
		}
	} else if(isset($_POST['t_email'])){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_email = stripslashes($_POST['t_email']);
		$t_email = mysql_real_escape_string($t_email);
		$sql = "SELECT 'ID' FROM $db_table WHERE email='$t_email'";
		$result = mysql_query($sql);
		$count = mysql_num_rows($result);
		if($count < 1){
			echo 'true';
		} else {
			echo 'Email already registered';
		}
	} else{
		echo("no_data");
	}
?>
