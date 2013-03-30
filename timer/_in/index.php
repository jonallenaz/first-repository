<?
session_start();
if(!isset($_SESSION['t_username'])){
	session_destroy();
?>
	<script type="text/javascript">
		window.location.reload();
	</script>
<?
} else{
?>
<!DOCTYPE html>
<html>
<head>
	<title>Time Tracking</title>
	<link rel="icon" href="favicon.ico" type="image/x-icon">
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	<link href='http://fonts.googleapis.com/css?family=Cutive+Mono' rel='stylesheet' type='text/css'>
	<link id="stylesheet" rel="stylesheet" href="css/timers.css">
</head>
<body>

<header style="display:block;">
	<div class="tabs">
		<div class="tab_name selected" data-section="tab_time"><span>Time</span><img src="images/ico_clock.png" alt="time"></div>
		<div class="tab_name" data-section="tab_options"><span>Options</span><img src="images/ico_settings.png" alt="options"></div>
		<div class="tab_name" data-section="tab_profile"><span>Profile</span><img src="images/ico_profile.png" alt="profile"></div>
	</div>

	<section id="tab_time">
		<div class="top_box totalTime">
			<p>Total Time:<p>
			<div class="timer">00:00:00.00</div>
			<div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div>
			<p>Hours: <span class="totalHours">0.00</span></p>
		</div>
		<div class="btn_wrap">
			<a class="stopAll btn">stop all</a>
			<br>
			<a class="removeTracked btn">removed tracked<div class="removeCheck">Click again to remove.</div></a>
		</div>
		<div class="top_box untrackedTime">
			<p>Untracked Time:<p>
			<div class="timer">00:00:00.00</div>
			<div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div>
			<p>Hours: <span class="totalHours">0.00</span></p>
		</div>
		<div class="top_box trackedTime">
			<p>Tracked Time:<p>
			<div class="timer">00:00:00.00</div>
			<div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div>
			<p>Hours: <span class="totalHours">0.00</span></p>
		</div>
	</section>

	<section id="tab_options">
		<div class="btn_wrap"><a class="show_splits btn"><span>show</span><span class="hidden">hide</span> splits</a></div>
		<div class="btn_wrap"><a class="stopAll btn">stop all</a></div>
		<div class="btn_wrap"><a class="removeTracked btn">removed tracked<div class="removeCheck">Click again to remove.</div></a></div>
		<div class="btn_wrap"><a class="go_dark btn"><span>go dark</span><span class="hidden">lighten up</span></a></div>
		<div class="btn_wrap"><a class="match_color btn"><span>match color</span><span class="hidden">keep color</span></a></div>
	</section>

	<section id="tab_profile">
		<div class="btn_wrap"><a class="btn" href="logout/">logout</a></div>
<?php
	if($_SESSION['t_username'] == 'thejon76'){
?>
		<div class="top_box">
			<iframe src="login/new_user.php" width="220" height="200" scrolling="no" frameborder="0"></iframe>
		</div>
<?php
	}
?>
		<div class="top_box">
			<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
				<input type="hidden" name="cmd" value="_s-xclick">
				<input type="hidden" name="hosted_button_id" value="3VVH4K8JQNQL2">
				<input type="hidden" name="on0" value="Buy me a:">
				<p>Help the cause, buy me a: </p>
				<p>
					<select name="os0">
						<option value="Cookie">Cookie $1.00 USD</option>
						<option value="Ice Cream Cone">Ice Cream Cone $5.00 USD</option>
						<option value="Date Night">Date Night $20.00 USD</option>
					</select>
				</p><p>
					<input type="hidden" name="currency_code" value="USD">
					<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynow_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
					<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
				</p>
			</form>
		</div>
	</section>
</header>

<div class="more">+</div>

<div class="box hidden template">
	<div class="remove">X</div>
	<div class="removeCheck">Are you sure?<br>Click to remove.</div>
	<input type="text" name="cust" value="" placeholder="Project">
	<input type="text" name="task" value="" placeholder="Task">
	<input type="hidden" class="tt" name="tt" value="">

	<input type="text'" class="timer" value="00:00:00.00">
	<div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div>
	<ul class="splits">
		<li></li>
	</ul>
	<div class="clear"></div>
	<div class="controls">
		<a href="#" class="start" alternate="Stop">Start</a>
		<div class="hours">Hrs: <span>0.00</span></div>
	</div>

	<div class="date"></div>
	<div class="changeColor"><input class="color" name="color" value="66ff00"></div>
	<div class="clear"></div>
	<label class="tracked">tracked<br/><input type="checkbox" name="tracked"></label>

</div>
<div class="boxes">
</div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js" type="text/javascript"></script>
<script src="js/jquery-ui-1.9.2.custom.min.js" type="text/javascript"></script>
<script src="js/jquery.shapeshift.min.js" type="text/javascript"></script>
<script src="js/jquery.ui.touch-punch.min.js" type="text/javascript"></script>
<script src="js/timers.js" type="text/javascript"></script>
<script src="jscolor/jscolor.js" type="text/javascript"></script>
<script type="text/javascript">
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
<? } ?>
