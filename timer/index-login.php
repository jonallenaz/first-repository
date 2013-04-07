<!DOCTYPE html>
<html>
<head>
	<title>Time Tracking</title>
	<link rel="icon" href="favicon.ico" type="image/x-icon">
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
	<link href='http://fonts.googleapis.com/css?family=Cutive+Mono' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="css/style.css">
</head>
<body>

<style>
	body{ margin-right: 200px; }
	.login{
		position: fixed;
		right: 0;
		top: 100px;
		width: 200px;
		height: 100%;
		background: #cccccc;
		background: rgba(200,200,215,.98);
		border-left: 1px solid #aaa;
   }
   .login-link, .register-link {
		font-size: 9px;
		margin: 0 10px;
		color: #777777;
	}
	.login-link:hover, .register-link:hover{
		color: #444444;
	}
	.login .info{
		height: auto;
		overflow: auto;
	}
	.login .info h3{
		margin: 10px;
	}
	.login .info ul {
		margin: 0;
		padding: 0 0 0 30px;
		list-style-type: square;
	}
	.login .info img{
		margin: 10px auto;
		display: block;
	}
</style>
<div class="login">
	<iframe src="login/" width="200" height="140" frameborder="0" scrolling="no"></iframe>
	<a href="register/" class="register-link">New user? Click here to register.</a>
	<a href="login/" class="login-link hidden">Already registered? Click here to login.</a>
	<div class="info">
		<h3>Why login?</h3>
		<ul>
			<li>New design</li>
			<li>Drag and drop</li>
			<li>Analog timer option</li>
			<li>Select light or dark theme</li>
			<li>See total time marked as tracked</li>
			<li>Match color of other timers with same project</li>
			<li>Request features or report bugs</li>
		</ul>
		<img src="images/new_timer.png">
	</div>
</div>

<div class="infoBar">

<!--    <div class="info">
		Name: <input type="text" name="name" value="" placeholder="Name">
	</div>
 -->
	<div class="info wide">
		<div class="info auto">
			Total Time: <br>
		</div>
		<div class="info"><div class="totalTime" class='timer'>00:00:00.00</div><div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div></div>
		<a class="stopAll btn">stop all</a>
		<a class="removeTracked btn">removed tracked<div class="removeCheck">Are you sure?<br>Click to remove.</div></a>
	</div>
	<div class="info narrow">
<!--         <div class="info auto">Total Hours: </div>
 -->        <div class="info"><div class="hours">Hours: <span class="totalHours">0.00</span></div></div>
	</div>
	<div class="info narrow help">
		<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
			<input type="hidden" name="cmd" value="_s-xclick">
			<input type="hidden" name="hosted_button_id" value="3VVH4K8JQNQL2">
			<input type="hidden" name="on0" value="Buy me a:">
			<div class="info">Help the cause, buy me a: </div>
			<div class="info hide">
				<select name="os0">
					<option value="Cookie">Cookie $1.00 USD</option>
					<option value="Ice Cream Cone">Ice Cream Cone $5.00 USD</option>
					<option value="Date Night">Date Night $20.00 USD</option>
				</select><br>
				<input type="hidden" name="currency_code" value="USD">
				<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynow_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
				<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
			</div>
		</form>
	</div>
	<div class="clear"></div>
</div>

<div class="box hidden">
	<div class="remove">X</div>
	<div class="removeCheck">Are you sure?<br>Click to remove.</div>
	<div class="changeColor"><input class="color" name="color" value="66ff00"></div>
	<div class="date"></div>
	<label class="tracked"><input type="checkbox" name="tracked"><br/>tracked</label>
	<input type="text" name="cust" value="" placeholder="Customer">
	<input type="text" name="task" value="" placeholder="Project/Task">
	<input type="hidden" class="tt" name="tt" value="">

	<div class="controls">
		<a href="#" class="start" alternate="Stop">Start</a>
		<div class="hours">Hrs: <span>0.00</span></div>
	</div>
	<div class="clear"></div>
	<input type="text'" class="timer" value="00:00:00.00">
	<div class="labels">HOUR<span>MIN</span><span>SEC</span><span>1/100</span></div>

	<ul class="splits">
		<li></li>
	</ul>
</div>
<div class="more">+</div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" type="text/javascript"></script>
<script src="js/timer.js" type="text/javascript"></script>
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
