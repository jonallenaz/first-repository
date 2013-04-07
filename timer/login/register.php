<?php
	// username and password sent from form 
	$t_username = $_POST['t_username']; 
	$t_email = $_POST['t_email']; 
	$t_password = $_POST['t_password']; 

	if($t_username && $t_password){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = stripslashes($t_username);
		$t_email = stripslashes($t_email);
		$t_password = stripslashes($t_password);
		$t_username = mysql_real_escape_string($t_username);
		$t_email = mysql_real_escape_string($t_email);
		$t_password = mysql_real_escape_string($t_password);
		$t_password = md5($t_password);
		// $sql = "SELECT 'ID' FROM $db_table WHERE username='$t_username' and password='$t_password'";
		$sql = "INSERT INTO $db_table (username, password, email) VALUES ('$t_username', '$t_password', '$t_email')";
		$result = mysql_query($sql);

?>
	<script type="text/javascript">
		window.location.reload();
	</script>
<?
	} else{
?>
		<form name="form_new_user" method="post" action="">
			<table width="190" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td colspan="3"><strong>Register </strong></td>
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
					<td colspan="3" align="center"><input type="submit" value="Submit"></td>
				</tr>
				<tr>
					<td colspan="3" id="message"></td>
				</tr>
			</table>
		</form>
<?php
	}
?>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>
<script type="text/javascript" src="/timer/js/register.js"></script>
