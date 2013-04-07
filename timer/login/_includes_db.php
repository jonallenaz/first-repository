<?php

$db_host = 'localhost';
$db_name = 'jonandan_timer';
$db_user = 'jonandan_timer';
$db_pass = '//Tim3r';
$db_table = 'timer_users';
$db_test = 'test';

// Connect to server and select databse.
mysql_connect("$db_host", "$db_user", "$db_pass")or die("cannot connect"); 
mysql_select_db("$db_name")or die("cannot select DB");

?>
