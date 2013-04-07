<?php
	// username and password sent from form 
	$t_username = $_POST['t_username']; 
	$t_email = $_POST['t_email']; 
	$t_password = $_POST['t_password']; 

	require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');
	$sql = "SELECT 'ID' FROM $db_table";
	$result = mysql_query($sql);
	$count = mysql_num_rows($result);

	if($t_username && $t_password){

		$t_username = stripslashes($t_username);
		$t_email = stripslashes($t_email);
		$t_password = stripslashes($t_password);
		$t_username = mysql_real_escape_string($t_username);
		$t_email = mysql_real_escape_string($t_email);
		$t_password = mysql_real_escape_string($t_password);
		$t_password = md5($t_password);
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
			<table width="150" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td align="right"></td>
					<td><input placeholder="Username" name="t_username" type="text" id="t_username"></td>
				</tr>
				<tr>
					<td align="right"></td>
					<td><input placeholder="Email" name="t_email" type="text" id="t_email"></td>
				</tr>
				<tr>
					<td align="right"></td>
					<td><input placeholder="Password" name="t_password" type="password" id="t_password"></td>
				</tr>
				<tr>
					<td colspan="3" align="center"><small>(<?= $count ?>)</small> <input type="submit" value="Create New User"></td>
				</tr>
			</table>
		</form>
<?php
	}
?>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>
<script type="text/javascript">
	$('#t_username').on('blur', function(){
		var t_username = $(this).val();
		if(!t_username){ return; }
		var data = 't_username=' + t_username;
		var check_username = $.ajax({
			type: 'POST',
			url: 'check_user.php',
			data: data
		});
		check_username.done(function(data){
			console.log(data);
		});
	});
</script>
