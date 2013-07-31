<?php
session_start();
session_set_cookie_params(172800,"/timer/");

if(isset($_SESSION['t_username'])){
		include('_in/index.php');
} else{
	include('index-login.php');
}

?>
