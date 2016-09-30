var tzo = new Date().getTimezoneOffset() * 60 * 1000;

function getDialCSS(time, box_num, running) {
	var date = new Date(time + tzo);
	var milliseconds = date.getMilliseconds();
	var seconds = date.getSeconds();
	var minutes = date.getMinutes();
	var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	var seconds_per_turn = ((seconds + (milliseconds / 1000)) / 60);
	var minutes_per_turn = ((minutes + ((seconds + (milliseconds / 1000)) / 60)) / 60);
	var hours_per_turn = ((hours + ((minutes + ((seconds + (milliseconds / 1000)) / 60)) / 60)) / 12);

	var dial_css = '', second_hand = '', minute_hand = '', hour_hand = '';
	if (running) {
		dial_css = [];
		dial_css.push('@-webkit-keyframes moveSeconds' + box_num + ' {0% {-webkit-transform: rotate(' + seconds_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (seconds_per_turn + 1) + 'turn);}}');
		dial_css.push('@-webkit-keyframes moveMinutes' + box_num + ' {0% {-webkit-transform: rotate(' + minutes_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (minutes_per_turn + 1) + 'turn);}}');
		dial_css.push('@-webkit-keyframes moveHours' + box_num + ' {0% {-webkit-transform: rotate(' + hours_per_turn + 'turn);}100% {-webkit-transform: rotate(' + (hours_per_turn + 1) + 'turn);}}');
		dial_css.push('@keyframes moveSeconds' + box_num + ' {0% {transform: rotate(' + seconds_per_turn + 'turn);}100% {transform: rotate(' + (seconds_per_turn + 1) + 'turn);}}');
		dial_css.push('@keyframes moveMinutes' + box_num + ' {0% {transform: rotate(' + minutes_per_turn + 'turn);}100% {transform: rotate(' + (minutes_per_turn + 1) + 'turn);}}');
		dial_css.push('@keyframes moveHours' + box_num + ' {0% {transform: rotate(' + hours_per_turn + 'turn);}100% {transform: rotate(' + (hours_per_turn + 1) + 'turn);}}');
		dial_css = dial_css.join('\n');
		second_hand = '-webkit-animation: moveSeconds' + box_num + ' 60s linear infinite;';
		second_hand += 'animation: moveSeconds' + box_num + ' 60s linear infinite;';
		minute_hand = '-webkit-animation: moveMinutes' + box_num + ' 3600s linear infinite;';
		minute_hand += 'animation: moveMinutes' + box_num + ' 3600s linear infinite;';
		hour_hand = '-webkit-animation: moveHours' + box_num + ' 43200s linear infinite;';
		hour_hand += 'animation: moveHours' + box_num + ' 43200s linear infinite;';
	} else {
		// second_hand = '-webkit-animation: none;';
		// second_hand += 'animation: none;';
		second_hand += '-webkit-transform: rotate(' + seconds_per_turn + 'turn);';
		second_hand += 'transform: rotate(' + seconds_per_turn + 'turn);';
		// minute_hand = '-webkit-animation: none;';
		// minute_hand += 'animation: none;';
		minute_hand += '-webkit-transform: rotate(' + minutes_per_turn + 'turn);';
		minute_hand += 'transform: rotate(' + minutes_per_turn + 'turn);';
		// hour_hand = '-webkit-animation: none;';
		// hour_hand += 'animation: none;';
		hour_hand += '-webkit-transform: rotate(' + hours_per_turn + 'turn);';
		hour_hand += 'transform: rotate(' + hours_per_turn + 'turn);';
	}

	var css_obj = {
		'dial_css': dial_css,
		'second_hand': second_hand,
		'minute_hand': minute_hand,
		'hour_hand': hour_hand
	};
	return css_obj;
}
