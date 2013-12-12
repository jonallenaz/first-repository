<?php
session_start();
if($_SESSION['t_username'] == 'jonallenaz'){
	require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

	$result = mysql_query("SELECT * FROM $db_timers ORDER BY timer_id DESC");
	echo "<table border='1'>
	<tr>
	<th>timer_id</th>
	<th>user_id</th>
	<th>username</th>
	<th>timer_key</th>
	<th>timer_json</th>
	</tr>";
	while($row = mysql_fetch_array($result)){
		$row_id = $row['user_id'];
		$row_result = mysql_query("SELECT username FROM $db_table WHERE ID='$row_id'");
		$row_row = mysql_fetch_array($row_result);
		$row_username = $row_row['username'];

		echo "<tr>";
		echo "<td>" . $row['timer_id'] . "</td>";
		echo "<td>" . $row['user_id'] . "</td>";
		echo "<td>" . $row_username . "</td>";
		echo "<td>" . $row['timer_key'] . "</td>";
		echo "<td>" . $row['timer_json'] . "</td>";
		echo "</tr>";
	}
	echo "</table>";
}
?>
