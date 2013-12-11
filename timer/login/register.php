<?php
session_start();

// username and password sent from form
$t_username = $_POST['t_username'];
$t_email = $_POST['t_email'];
$t_password = $_POST['t_password'];
$message = '';

if($t_username && $t_email && $t_password){
	require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

	$register_ip = $_SERVER['REMOTE_ADDR'];
	$register_date = date("Y-m-d H:i:s");

	$sql = "SELECT 'ID' FROM $db_table WHERE register_ip='$register_ip' AND register_date >= SYSDATE() - INTERVAL 1 DAY";
	$result = mysql_query($sql);
	$count = mysql_num_rows($result);
	if($count < 1){
		$t_username = stripslashes($t_username);
		$t_email = stripslashes($t_email);
		$t_password = stripslashes($t_password);
		$t_username = mysql_real_escape_string($t_username);
		$t_email = mysql_real_escape_string($t_email);
		$t_password = mysql_real_escape_string($t_password);
		$t_password = md5($t_password);

		$sql = "INSERT INTO $db_table (username, password, email, register_ip, register_date, login_ip, login_date) VALUES ('$t_username', '$t_password', '$t_email', '$register_ip', '$register_date', '$register_ip', '$register_date')";
		$result = mysql_query($sql);

		$_SESSION["t_loggedin"] = true;
		$_SESSION["t_username"] = $t_username;
		$_SESSION["t_signature"] = md5($t_username . $t_password);
?>
		<script type="text/javascript">
			window.top.location.href = window.top.location.href;
		</script>
<?
	} else{
		$message = "Please only register once.";
	}
}
?>
	<style>
			#message {
			color: #cc0000;
			font-size: 12px;
			padding-top:5px;
		}
	</style>
	<form id="form_new_user" name="form_new_user" method="post" action="">
		<table width="190" border="0" align="center" cellpadding="0" cellspacing="0">
			<tr>
				<td colspan="3"><strong>Register</strong> <small>(free for first 50 users)</small></td>
			</tr>
			<tr>
				<td align="right"></td>
				<td><input placeholder="Username" name="t_username" type="text" id="t_username"> <span class="mark"></span></td>
			</tr>
			<tr>
				<td align="right"></td>
				<td><input placeholder="Email" name="t_email" type="text" id="t_email"> <span class="mark"></span></td>
			</tr>
			<tr>
				<td align="right"></td>
				<td><input placeholder="Password" name="t_password" type="password" id="t_password"></td>
			</tr>
			<tr>
				<td colspan="3" align="center"><input id="submit" type="submit" value="Register" disabled="disabled"></td>
			</tr>
			<tr>
				<td colspan="3" id="message"><?= $message; ?></td>
			</tr>
		</table>
	</form>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>
<script type="text/javascript" src="/timer/js/register.js"></script>
