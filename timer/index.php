<?php
session_set_cookie_params(172800,"/timer/");
session_start();

if(isset($_SESSION['t_username'])){
	if($_SESSION['t_username'] == 'jonallenaz'){
		include('index-login.php');
	} else{
		include('_in/index.php');
	}
} else{
	include('index-login.html');
}

?>
