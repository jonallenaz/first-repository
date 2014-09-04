<?php
	session_start();
	// username and password sent from form
	$t_username = $_POST['t_username'];
	$t_password = $_POST['t_password'];
	$t_email = $_POST['t_email'];
	$t_form = $_POST['t_form'];
	$show_form = false;
	$message = "";

	if($t_form != 'register' && $t_username && $t_password){
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
			$_SESSION["t_loggedin"] = true;
			$_SESSION["t_username"] = $t_username;
			$_SESSION["t_signature"] = md5($t_username . $t_password);

			$login_ip = $_SERVER['REMOTE_ADDR'];
			$login_date = date("Y-m-d H:i:s");

			$sql = "UPDATE $db_table SET login_ip='$login_ip', login_date='$login_date' WHERE username='$t_username' and password='$t_password'";
			$result = mysql_query($sql);
?>
			<script type="text/javascript">
				window.top.location.href = window.top.location.href;
			</script>
<?
		} else{
			$message = "Incorrect username or password.";
			$show_form = true;
		}
	} else if($t_form == 'register' && $t_username && $t_email && $t_password){
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
	} else{
		$show_form = true;
	}

	if($show_form == true){
?>
<!DOCTYPE html>
<html>
<head>
	<title>Time Tracking</title>
	<link rel="icon" href="favicon.ico" type="image/x-icon">
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	<link href='http://fonts.googleapis.com/css?family=Cutive+Mono' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="css/login.css">
</head>
<body>

	<div id="overlay"></div>
	<header>
		<form name="login_form" id="login_form" method="post" action="">
			<h1>Login</h1>
			<input placeholder="Username" name="t_username" type="text" id="t_username" tabindex="1" autofocus>
			<input placeholder="Password" name="t_password" type="password" id="t_password" tabindex="2">
			<button type="submit" tabindex="-1">Login</button>
			<span class="message"><?=$message?></span>
			<!-- <div class="login_register">Need an account? <a href="#register">Register</a></div> -->
			<input type="hidden" name="t_form" value="login">
		</form>
		<form name="register_form" id="register_form" class="hide" method="post" action="">
			<h1>Register</h1>
			<input placeholder="Username" name="t_username" type="text" id="r_username" tabindex="3">
			<input placeholder="Email Address" name="t_email" type="text" id="r_email" tabindex="4">
			<input placeholder="Password" name="t_password" type="password" id="r_password" tabindex="5">
			<button type="submit" tabindex="-1">Register</button>
			<div class="login_register">Have an account? <a href="#login">Login</a></div>
			<input type="hidden" name="t_form" value="register">
		</form>
	</header>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js" type="text/javascript"></script>
<script>

	$('body').on('click', '.login_register a', function(e){
		$('header').toggleClass('flip');
		return false;
	});
	$(function(){
		$('#register_form').removeClass('hide');
<? if($t_form == 'register'){ ?>
		$('header').toggleClass('flip');
<? } ?>
	});

	// Google Analytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-6958613-3']);
	_gaq.push(['_trackPageview']);
	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
</script>
</body>
</html>
<?php
	}
?>
