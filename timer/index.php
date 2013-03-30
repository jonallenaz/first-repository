<?php
session_start();

if(isset($_SESSION['t_username'])){
	include('_in/index.php');
} else{
	include('index-login.html');
}

?>
