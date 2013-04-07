var valid_username = false;
var valid_email = false;

$('#t_username').on('keydown', function(){
	valid_username = false;
	$('#submit').attr('disabled','disabled');
	$('#t_username').siblings('.mark').html('');
	$('#message').html('');
});
$('#t_username').on('blur', function(){
	var t_username = $(this).val();
	if(!t_username){ return; }
	var data = 't_username=' + t_username;
	$('#t_username').siblings('.mark').html('');
	var check_username = $.ajax({
		type: 'POST',
		url: 'check_user.php',
		data: data
	});
	check_username.done(function(data){
		switch(data){
			case 'true':
				$('#t_username').siblings('.mark').html('&#x2713;').css('color','#00CC00');
				valid_username = true;
				if(valid_username && valid_email && $('#t_password').val()){
					$('#submit').removeAttr('disabled');
				}
				break;
			case 'no_data':
				break;
			default:
				$('#message').html(data);
				$('#t_username').siblings('.mark').html('&#x2717;').css('color','#CC0000');
		}
	});
});

$('#t_email').on('keydown', function(){
	valid_email = false;
	$('#submit').attr('disabled','disabled');
	$('#t_email').siblings('.mark').html('');
	$('#message').html('');
});
$('#t_email').on('blur', function(){
	var t_email = $(this).val();
	if(!t_email){ return; }
	if(!isValidEmailAddress(t_email)){
		$('#message').html('Invalid email address.');
		$('#t_email').siblings('.mark').html('&#x2717;').css('color','#CC0000');
		return false;
	}
	var data = 't_email=' + t_email;
	$('#t_email').siblings('.mark').html('');
	var check_username = $.ajax({
		type: 'POST',
		url: 'check_user.php',
		data: data
	});
	check_username.done(function(data){
		switch(data){
			case 'true':
				$('#t_email').siblings('.mark').html('&#x2713;').css('color','#00CC00');
				valid_email = true;
				if(valid_username && valid_email && $('#t_password').val()){
					$('#submit').removeAttr('disabled');
				}
				break;
			case 'no_data':
				break;
			default:
				$('#message').html(data);
				$('#t_email').siblings('.mark').html('&#x2717;').css('color','#CC0000');
		}
	});
});

$('#t_password').on('keydown', function(){
	if(valid_username && valid_email && $('#t_password').val()){
		$('#submit').removeAttr('disabled');
	}
});

$('#form_new_user').submit(function(){
	var t_username = $('#t_username').val();
	var t_email = $('#t_email').val();
	var t_password = $('#t_password').val();
	console.log('username: ' + t_username, valid_username);
	console.log('email: ' + t_email, valid_email);
	console.log('password: ' + t_password);
	if(!t_username || !valid_username){
		$('#t_username').focus();
		return false;
	}
	if(!t_email || !valid_email){
		$('#t_email').focus();
		return false;
	}
	if(!t_password){
		$('#t_password').focus();
		return false;
	}
	console.log('submit');
	return false;
});

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}
