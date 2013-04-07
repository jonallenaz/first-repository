$('#t_username').on('keyup', function(){
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
				break;
			case 'no_data':
				break;
			default:
				$('#message').html(data);
				$('#t_username').siblings('.mark').html('&#x2717;').css('color','#CC0000');
		}
	});
});

$('#t_email').on('keyup', function(){
	$('#t_email').siblings('.mark').html('');
	$('#message').html('');
});
$('#t_email').on('blur', function(){
	var t_email = $(this).val();
	if(!t_email){ return; }
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
				break;
			case 'no_data':
				break;
			default:
				$('#message').html(data);
				$('#t_email').siblings('.mark').html('&#x2717;').css('color','#CC0000');
		}
	});
});
