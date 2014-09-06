<?php
	// session_start();
	// if( isset($_SESSION['t_username']) && isset($_POST['t_data']) ){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = 'jonallenaz';//$_SESSION['t_username'];
		// $t_data = $_POST['t_data'];
		$sql = "SELECT * FROM $db_table WHERE username='$t_username'";
		$result = mysql_query($sql);
		$row = mysql_fetch_array($result);
		$user_id = $row['ID'];
		print('user_id: '.$user_id.'<br>');
		// var_dump($row);


		// load all previous timer entries
		$sql = "SELECT * FROM $db_timers WHERE user_id='$user_id'";
		$result = mysql_query($sql);
		$rows = array();
		while($r = mysql_fetch_assoc($result)) {
		    $rows[] = $r;
		}
		// print_r($rows);
		// update timer entries with current data
		$key = '20140411065418917';
		$value = '{"timer_key":"20140411065418917","date":"4/11","running":false,"total":13023849,"cust":"test1","task":"misc","color":"008ACF","tracked":false,"order":4,"splits":[{"date":"4/11/2014","start":1397199274198,"end":1397199275160,"duration":962},{"date":"4/11/2014","start":1397199304571,"end":1397200303022,"duration":998451},{"date":"4/11/2014","start":1397200540081,"end":1397202141921,"duration":1601840},{"date":"4/11/2014","start":1397203021613,"end":1397210783581,"duration":7761968},{"date":"4/11/2014","start":1397224433969,"end":1397227093591,"duration":2659622},{"date":"4/11/2014","start":1397229226342,"end":1397229227348,"duration":1006}],"analog":false,"interval":8}';
		$sql = "UPDATE $db_timers SET `timer_json` = '".$value."' WHERE timer_key='".$key."' IF @@ROWCOUNT=0 INSERT INTO $db_timers VALUES ('".$user_id."', '".$key."', '".$value."')";
		$result = mysql_query($sql);
		$row = mysql_fetch_array($result);
		$print_r('result: '.$row);

// UPDATE Table1 SET (...) WHERE Column1='SomeValue'
// IF @@ROWCOUNT=0
//     INSERT INTO Table1 VALUES (...)


		// delete previous time entries not updated









		// delete previous timer entries
		// $sql = "DELETE FROM $db_timers WHERE user_id='$user_id'";
		// $result = mysql_query($sql);

		// var_dump($t_data);
		// foreach($t_data as $key => $value){
			// $sql = 'INSERT INTO '.$db_timers.' (`user_id`, `timer_key`, `timer_json`) VALUES ("'.$user_id.'", "'.$key.'", \''.$value.'\')';
			// var_dump($sql);
			// if (!mysql_query($sql)){
				// die('Error: ' . mysql_error());
			// }
			// var_dump($result);
		// }


	// } else{
		// echo("no_data");
	// }
?>
