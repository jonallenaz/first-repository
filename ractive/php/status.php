<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once('/home3/jonandan/etc/ellatek.com/_includes_db.php');

$datain = array();
foreach ($_POST as $key => $value) {
	$datain[$key] = $value;
}
foreach ($_GET as $key => $value) {
	$datain[$key] = $value;
}

$fn = $datain['fn'];
$output = array('fn' => $fn, 'loggedin' => false, 'request' => $datain);

switch($fn){
	case 'users':
		$sql = "SELECT * FROM $db_table ORDER BY ID";
		$result = mysql_query($sql);
		$rows = array();
		while($r = mysql_fetch_assoc($result)) {
			$rows[] = $r;
		}
		$output['loggedin'] = true;
		$output['users'] = json_encode($rows);
		break;

	case 'load':
		if( isset($_SESSION['r_un']) && isset($datain['callback']) ){
			$r_un = $_SESSION['r_un'];
			$callback = $datain['callback'];
			$rows = array();

			$sql = "SELECT * FROM $db_table WHERE username='$r_un'";
			$result = mysql_query($sql);
			$row = mysql_fetch_array($result);
			$user_id = $row['ID'];
			$sql = "SELECT * FROM $db_r_timers WHERE user='$user_id'";
			$result = mysql_query($sql);
			while($r = mysql_fetch_assoc($result)) {
				$rows[] = $r;
			}

			// get timers from old table if none found
			if(empty($rows)){
				$sql = "SELECT * FROM $db_table WHERE username='$r_un'";
				$result = mysql_query($sql);
				$row = mysql_fetch_array($result);
				$user_id = $row['ID'];
				$sql = "SELECT * FROM $db_timers WHERE user_id='$user_id'";
				$result = mysql_query($sql);
				while($r = mysql_fetch_assoc($result)) {
					$rows[] = $r;
				}
			}
			$output['loggedin'] = true;
			$output['timers'] = json_encode($rows);
		}
		break;

	case 'login':
		$r_un = $datain['un'];
		$r_pw = $datain['pw'];
		$r_admin = $datain['admin'];
		$output['message'] = '';

		if($r_un && $r_pw){
			$r_un = stripslashes($r_un);
			$r_pw = stripslashes($r_pw);
			$r_un = mysql_real_escape_string($r_un);
			if($r_admin <> 'jonallenaz'){
				$r_pw = mysql_real_escape_string($r_pw);
				$r_pw = md5($r_pw);
			}
			$sql = "SELECT 'ID' FROM $db_table WHERE username='$r_un' and password='$r_pw'";
			$result = mysql_query($sql);
			$count = mysql_num_rows($result);

			if($count == 1){
				$_SESSION["r_loggedin"] = true;
				$_SESSION["r_un"] = $r_un;
				$_SESSION["r_sig"] = md5($r_un . $r_pw);
				$login_ip = $_SERVER['REMOTE_ADDR'];
				$login_date = date("Y-m-d H:i:s");

				$sql = "UPDATE $db_table SET login_ip='$login_ip', login_date='$login_date' WHERE username='$r_un' and password='$r_pw'";
				$result = mysql_query($sql);
				$output['loggedin'] = true;
			} else{
				$output['message'] = "Invalid username or password";
			}
		} else{
			$output['message'] = "Invalid username or password";
		}
		break;

	case 'logout':
		session_destroy();
		break;

	case 'save':
		if( isset($_SESSION['r_un']) && isset($datain['r_timers']) ){
			$r_un = $_SESSION['r_un'];
			$r_timers = $datain['r_timers'];

			$sql = "SELECT * FROM $db_table WHERE username='$r_un'";
			$result = mysql_query($sql);
			$row = mysql_fetch_array($result);
			$user_id = $row['ID'];

			$sql = "SELECT * FROM $db_r_timers WHERE user='$user_id'";
			$result = mysql_query($sql);
			$f_timers = array();
			while($r = mysql_fetch_assoc($result)) {
				$f_timers[$r['id']] = $r['internalid'];
			}

			$output['r_timers'] = array();
			foreach($r_timers as $key => $value){
				$sql = 'SELECT * FROM '.$db_r_timers.' WHERE id="'.$value['id'].'"';
				$result = mysql_query($sql);
				$count = mysql_num_rows($result);
				if(!$count){
					$sql = 'INSERT INTO '.$db_r_timers.' (`user`, `id`, `json`) VALUES ("'.$user_id.'", "'.$value['id'].'", \''.json_encode($value).'\')';
					$result = mysql_query($sql);
					$count = '1 added';
				} else{
					$sql = "UPDATE ".$db_r_timers." SET json='".json_encode($value)."' WHERE `id`='".$value['id']."'";
					$result = mysql_query($sql);
					$count .= ' updated';
				}
				$output['r_timers'][$key] = $value['id'] . '  --  count: ' . $count;
				unset($r_timers[$key]);
				unset($f_timers[$value['id']]);
			}

			foreach ($f_timers as $key => $value) {
				$sql = "DELETE FROM $db_r_timers WHERE user='$user_id' AND id='$key'";
				$result = mysql_query($sql);
				$output['r_timers'][] = $key . '  --  count: 1 deleted';
			}
			$output['in'] = $r_timers;
			$output['out'] = $f_timers;
			$output['loggedin'] = true;
		}
		break;

	case 'reg_check':
		$r_un = $datain['un'];
		$result = mysql_query("SELECT * FROM $db_table WHERE username='$r_un'");
		$count = mysql_num_rows($result);
		$output['un'] = $r_un;
		$output['available'] = true;
		if($count > 0) {
			$output['available'] = false;
		}
		break;

	case 'register':
		$r_un = $datain['un'];
		$r_pw = $datain['pw'];
		$r_email = $datain['email'];
		$t_username = stripslashes($r_un);
		$t_password = stripslashes($r_pw);
		$t_email = stripslashes($r_email);
		$t_username = mysql_real_escape_string($t_username);
		$t_password = mysql_real_escape_string($t_password);
		$t_email = mysql_real_escape_string($t_email);
		$t_password = md5($t_password);
		$login_ip = $_SERVER['REMOTE_ADDR'];
		$login_date = date("Y-m-d H:i:s");
		$sql = "INSERT INTO $db_table (username, password, email, register_ip, register_date) VALUES ('$t_username', '$t_password', '$t_email', '$login_ip', '$login_date')";
		$result = mysql_query($sql);
		break;

	case 'check':
	default:
		$loggedin = false;
		$r_un = isset($_SESSION["r_un"]) ? $_SESSION["r_un"] : '';
		$result = mysql_query("SELECT * FROM $db_table WHERE username='$r_un'");
		$row = mysql_fetch_array($result);
		$salt = $row[2];
		if (isset($_SESSION['r_un']) && isset($_SESSION['r_sig']) && isset($_SESSION['r_loggedin']) && $_SESSION['r_loggedin'] = true && $_SESSION['r_sig'] == md5($_SESSION['r_un'] . $salt)){
			$loggedin = true;
		}
		$output['loggedin'] = $loggedin;
		$output['username'] = $r_un;
		$output['salt'] = $salt;
}

if(isset($datain['callback'])){
	print($datain['callback'].'('.json_encode($output).')');
} else{
	print(json_encode($output));
}


?>
