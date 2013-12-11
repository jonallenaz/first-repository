<?php
session_start();
$loggedin = false;
$t_username = $_SESSION["t_username"];
require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');
$result = mysql_query("SELECT * FROM $db_table WHERE username='$t_username'");
$row = mysql_fetch_array($result);
$salt = $row[2];

if (isset($_SESSION['t_username']) && isset($_SESSION['t_signature']) && isset($_SESSION['t_loggedin']) && $_SESSION['t_loggedin'] = true && $_SESSION['t_signature'] == md5($_SESSION['t_username'] . $salt)){
	$loggedin = true;
}

$output = array(
	"loggedin" => $loggedin,
	"username" => $_SESSION['t_username'],
	"HTTP_USER_AGENT" => $_SERVER['HTTP_USER_AGENT'],
	'salt' => $salt
);
print(json_encode($output));

?>
