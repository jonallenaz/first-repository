var tzo = new Date().getTimezoneOffset() * 60 * 1000;

function start_clock(time, box_num, running){
	var date = new Date(time + tzo);
	var milliseconds = date.getMilliseconds();
	var seconds = date.getSeconds();
	var minutes = date.getMinutes();
	var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	var seconds_per_turn = ( ( seconds + ( milliseconds / 1000 ) ) / 60 );
	var minutes_per_turn = ( ( minutes + ( ( seconds + ( milliseconds / 1000 ) ) / 60 ) ) / 60 );
	var hours_per_turn = ( ( hours + ( ( minutes + ( ( seconds + ( milliseconds / 1000 ) ) / 60 ) ) / 60 ) ) / 12 );
	var $box = $('.box[data-num="' + box_num + '"]');
	var ss = $box.find('style');
	ss.html('');
	if(running){
		var box_rules = [];
		box_rules.push( '@-webkit-keyframes moveSeconds' + box_num + ' {0% {-webkit-transform: rotate(' + seconds_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (seconds_per_turn + 1) + 'turn);}}' );
		box_rules.push( '@-webkit-keyframes moveMinutes' + box_num + ' {0% {-webkit-transform: rotate(' + minutes_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (minutes_per_turn + 1) + 'turn);}}' );
		box_rules.push( '@-webkit-keyframes moveHours' + box_num + ' {0% {-webkit-transform: rotate(' + hours_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (hours_per_turn + 1) + 'turn);}}' );
		box_rules.push( '@keyframes moveSeconds' + box_num + ' {0% {transform: rotate(' + seconds_per_turn + 'turn);}100% {transform: rotate(' + (seconds_per_turn + 1) + 'turn);}}' );
		box_rules.push( '@keyframes moveMinutes' + box_num + ' {0% {transform: rotate(' + minutes_per_turn + 'turn);}100% {transform: rotate(' + (minutes_per_turn + 1) + 'turn);}}' );
		box_rules.push( '@keyframes moveHours' + box_num + ' {0% {transform: rotate(' + hours_per_turn + 'turn);}100% {transform: rotate(' + (hours_per_turn + 1) + 'turn);}}' );

		ss.html(box_rules.join('\n'));
		// console.log(ss.html());

		$box.find('.second-hand').css({'-webkit-animation': 'moveSeconds' + box_num + ' 60s linear infinite', 'animation': 'moveSeconds' + box_num + ' 60s linear infinite'});
		$box.find('.minute-hand').css({'-webkit-animation': 'moveMinutes' + box_num + ' 3600s linear infinite', 'animation': 'moveMinutes' + box_num + ' 3600s linear infinite'});
		$box.find('.hour-hand').css({'-webkit-animation': 'moveHours' + box_num + ' 43200s linear infinite', 'animation': 'moveHours' + box_num + ' 43200s linear infinite'});
	} else{
		$box.find('.second-hand').css({'-webkit-animation': 'none', 'animation': 'none', '-webkit-transform': 'rotate(' + seconds_per_turn + 'turn)', 'transform': 'rotate(' + seconds_per_turn + 'turn)'});
		$box.find('.minute-hand').css({'-webkit-animation': 'none', 'animation': 'none', '-webkit-transform': 'rotate(' + minutes_per_turn + 'turn)', 'transform': 'rotate(' + minutes_per_turn + 'turn)'});
		$box.find('.hour-hand').css({'-webkit-animation': 'none', 'animation': 'none', '-webkit-transform': 'rotate(' + hours_per_turn + 'turn)', 'transform': 'rotate(' + hours_per_turn + 'turn)'});
	}
}
