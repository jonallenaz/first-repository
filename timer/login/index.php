<?php
	session_start();
	// username and password sent from form
	$t_username = $_POST['t_username'];
	$t_password = $_POST['t_password'];
	$show_form = false;

	if($t_username && $t_password){
		require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

		$t_username = stripslashes($t_username);
		$t_password = stripslashes($t_password);
		$t_username = mysql_real_escape_string($t_username);
		$t_password = mysql_real_escape_string($t_password);
		$t_password = md5($t_password);
		$sql = "SELECT 'ID' FROM $db_table WHERE username='$t_username' and password='$t_password'";
		$result = mysql_query($sql);

		// Mysql_num_row is counting table row
		$count = mysql_num_rows($result);

		// If result matched $t_username and $t_password, table row must be 1 row
		if($count == 1){
			// Register $t_username, $t_password and redirect to file "login_success.php"
			$_SESSION["t_username"] = $t_username;
?>
			<script type="text/javascript">
				window.top.location.href = window.top.location.href;
			</script>
<?
		} else{
			echo "Wrong Username or Password<br>";
			$show_form = true;
		}
	} else{
		$show_form = true;
	}

	if($show_form == true){
?>
		<form name="form1" method="post" action="">
			<table width="190" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td colspan="3"><strong>Login </strong></td>
				</tr>
				<tr>
					<td align="right"></td>
					<td><input placeholder="Username" name="t_username" type="text" id="t_username"> <span class="mark"></span></td>
				</tr>
				<tr>
					<td align="right"></td>
					<td><input placeholder="Password" name="t_password" type="password" id="t_password"></td>
				</tr>
				<tr>
					<td colspan="3" align="center"><input type="submit" value="Login"></td>
				</tr>
			</table>
		</form>
<?php
	}
?>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>
<script type="text/javascript">
	$('#t_username').on('keyup', function(){
		$('#t_username').siblings('.mark').html('');
		$('#message').html('');
	});
	$('#t_username').on('blur', function(){
		var t_username = $(this).val();
		if(!t_username){ return; }
		var data = 't_username=' + t_username;
		$('#t_username').siblings('.mark').html('');
		var check_username = $.ajax({
			type: 'POST',
			url: 'check_user.php',
			data: data
		});
		check_username.done(function(data){
			switch(data){
				case 'true':
					$('#t_username').siblings('.mark').html('&#x2717;').css('color','#CC0000');
					break;
				case 'no_data':
					break;
				default:
					$('#t_username').siblings('.mark').html('&#x2713;').css('color','#00CC00');
			}
		});
	});
</script>
