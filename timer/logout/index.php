<?php 
session_set_cookie_params(172800,"/timer/");
session_start();
session_destroy();
header("location:../");
?>
