var WEB_ROOT = 'http://www.ellatek.com/ractive2';
var SAVE_DELAY = 60; // number of seconds of inactivity between saves
var SAVE_THROTTLE = 5; // minimun number of seconds between saves

window.onbeforeunload = confirmExit;
function confirmExit(e) {
	$('.overlay, .loading').show();
	var time = new Date();
	// console.log('confirmExit', ractive.processing);
	if(ractive.processing){
		// console.log('saving changes...');
		return "Saving changes...";
	}
}
Ractive.DEBUG = false;

var Timer = function(obj) {
	obj = obj || {};
	var today = new Date();
	var date = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
	date += '/' + (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
	return {
		id: obj.id || ractive.formatId(),
		start_time: new Date(obj.start_time) || '',
		elapsed_time: parseInt(obj.elapsed_time, 10) || 0,
		total_time: parseInt(obj.total_time, 10) || 0,
		display_hours: obj.display_hours || ractive.formatHours(obj.total_time || 0),
		display_time: obj.display_time || ractive.formatTime(obj.total_time || 0),
		display_text: obj.display_text || 'Start',
		running: (obj.running == 'true') || false,
		tracked: (obj.tracked == 'true') || false,
		task: obj.task || '',
		bg_color: obj.bg_color || '#FFFFFF',
		dial_css: obj.dial_css || '',
		second_css: obj.second_css || 'text-decoration:none;',
		minute_css: obj.minute_css || 'text-decoration:none;',
		hour_css: obj.hour_css || 'text-decoration:none;',
		date: obj.date || date
	};
};

var TimerList = Ractive.extend({
	bg_colors: ['#FFFFFF', '#FCD112', '#F50505', '#000000', '#0055FF',  '#595854','#00EE00'],
	color_idx: 0,
	focus: false,
	is_loading: 0,
	processing: 0,
	template: '#template',
	un: '',

	addTimer: function(obj, loading) {
		ractive.processing++;
		// console.log('addTimer processing ++', ractive.processing);
		if (obj) this.color_idx++;
		var bg = (obj && obj.bg_color) ? obj.bg_color : this.bg_colors[(this.color_idx++ % this.bg_colors.length)];
		var today = obj ? (new Date(obj.date + '/' + new Date().getFullYear())) : new Date();
		var date = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
		date += '/' + (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
		if(obj){
			obj.date = date;
		}
		this.unshift('timers', new Timer(obj || {
			'bg_color': bg
		}));
		if(obj && obj.running == 'true'){
			this.fire('runTimer', 0, 0);
			this.fire('runTimer', 0, 0);
		}
		ractive.saveTimers();
		ractive.updateAllColorPicks();
		if(!loading){
			$('li[data-num="0"] .task').focus();
		}
		ractive.processing--;
		// console.log('addTimer processing --', ractive.processing);
	},

	checkStatus: function(message) {
		ractive.processing++;
		// console.log('checkStatus processing ++', ractive.processing, ractive.checkStatus.caller);
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'check'
			},
			success: function(data) {
				$('.loading').hide();
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				if (data.loggedin) {
					$('.overlay').hide();
					// console.log(data.username);
					ractive.un = data.username;
					if(data.username == 'jonallenaz'){
						$('.hidden').removeClass('hidden');
					}
				} else {
					$('.overlay, .login').show();
					if(!$('.login #password').is(':focus')){
						$('.login #password').html('');
						setTimeout(function() { $('#username').focus(); }, 400);
					}
					$('.login .message').hide().html(message || '').fadeIn();
				}
				ractive.processing--;
				// console.log('checkStatus processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('checkStatus error', a, b);
				ractive.processing--;
				// console.log('checkStatus processing --', ractive.processing);
			}
		});
	},

	editTime: function(num, show_alert) {
		var running = ractive.get('timers.' + num + '.running');
		if (running) {
			return false;
		}
		var time_string = ractive.get('timers.' + num + '.display_time');
		var regex = /^(\d{2,3}):([0-5]\d):([0-5]\d).(\d\d)?$/;
		var regex_test = regex.test(time_string);
		if (!regex_test) {
			if (show_alert)
				alert('Please format the time correctly (HH:MM:SS.SS).');
			return false;
		}
		time_string = time_string.split(':');
		var hours = time_string[0];
		var minutes = time_string[1];
		var seconds = time_string[2];
		var new_time = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
		ractive.set('timers.' + num + '.total_time', new_time);
		ractive.set('timers.' + num + '.elapsed_time', new_time);
		ractive.set('timers.' + num + '.display_hours', this.formatHours(new_time));
		this.updateDisplay();
	},

	formatHours: function(time) {
		var formatted_time = (Math.floor(100 * time / (60 * 60 * 1000)) / 100).toFixed(2);
		if (formatted_time < 10) {
			formatted_time = '0' + formatted_time;
		}
		return formatted_time;
	},

	formatId: function() {
		var today = new Date();
		var id = today.getFullYear().toString() + this.pad(today.getMonth() + 1, 2) + this.pad(today.getDate(), 2) + this.pad(today.getHours(), 2) + this.pad(today.getMinutes(), 2) + this.pad(today.getSeconds(), 2) + this.pad(today.getMilliseconds(), 3);
		// check if id already exists
		return id;
	},

	formatTime: function(time) {
		var h = 0,
			m = 0,
			s = 0,
			ms = 0;
		var formatted_time = '';
		h = Math.floor(time / (60 * 60 * 1000));
		time = time % (60 * 60 * 1000);
		m = Math.floor(time / (60 * 1000));
		time = time % (60 * 1000);
		s = Math.floor(time / 1000);
		ms = time % 1000;
		formatted_time = this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2) + '.' + this.pad(ms, 2).substring(0, 2);
		return formatted_time;
	},

	loadSummary: function(){
		ractive.processing++;
		// console.log('loadSummary processing ++', ractive.processing);
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'load'
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				var timers = JSON.parse(data.timers || '{}');
				var summary = [];
				if (timers.length) {
					var json;
					for (var t_idx = timers.length - 1; t_idx >= 0; t_idx--) {
						json = JSON.parse(unescape(timers[t_idx].json));
						summary.push(json);
					}
				}
				ractive.set('summary', summary);
				ractive.processing--;
				// console.log('loadSummary processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('loadSummary error', a, b);
				ractive.processing--;
				// console.log('loadSummary processing --', ractive.processing);
			}
		});
	},

	loadUsers: function(){
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'users'
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				var users = data.users;
				if (typeof users != 'object') {
					users = JSON.parse(users);
				}
				// console.log(users);
				ractive.set('users', users);
			},
			error: function(a, b) {
				console.log('loadUsers error', a, b);
			}
		});
	},

	loadTimers: function() {
		ractive.is_loading++;
		ractive.processing++;
		// console.log('loadTimers processing ++', ractive.processing);
		ractive.set('timers', []);
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'load'
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				var timers = JSON.parse(data.timers || '{}');
				// console.log('load timers', data);
				if (timers.length) {
					var json, time, bg, fg;
					for (var t_idx = timers.length - 1; t_idx >= 0; t_idx--) {
						if (timers[t_idx].hasOwnProperty('timer_key')) {
							// load old timers
							if (timers[t_idx].timer_key == 'TimerOptions')
								continue;
							json = JSON.parse(timers[t_idx].timer_json);
							// console.log('addTimer', json);
							ractive.addTimer({
								'elapsed_time': json.total,
								'total_time': json.total,
								'bg_color': '#' + json.color,
								'task': json.cust + ' ' + json.task,
								'id': json.timer_key,
								'date': json.date,
								'tracked': json.tracked.toString()
							}, true);
						} else if (timers[t_idx].hasOwnProperty('json')) {
							// load new timers
							json = JSON.parse(unescape(timers[t_idx].json));
							ractive.addTimer(json, true);
						}
					}
				} else {
					ractive.addTimer();
				}
				ractive.updateDisplay();
				ractive.sortTimers();
				ractive.updateAllColorPicks();
				ractive.processing--;
				// console.log('loadTimers processing --', ractive.processing);
				ractive.is_loading--;
			},
			error: function(a, b) {
				console.log('loadTimers error', a, b);
				ractive.processing--;
				// console.log('loadTimers processing --', ractive.processing);
				ractive.is_loading--;
			}
		});
	},

	login: function(un, pw, admin) {
		ractive.processing++;
		// console.log('login processing ++', ractive.processing);
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'login',
				'un': un,
				'pw': pw,
				'admin': admin
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				ractive.checkStatus(data.message);
				if (data.loggedin) {
					$('#username, #password').val('');
					ractive.loadTimers();
				}
				ractive.processing--;
				// console.log('login processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('login error', a, b);
				ractive.processing--;
				// console.log('login processing --', ractive.processing);
			}
		});
	},

	validateEmail: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},

	register: function(un, pw, email) {
		if(!un || !pw || !email || !this.validateEmail(email)){
			alert('Please enter a username, password and valid email to register.');
			return false;
		}
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'reg_check',
				'un': un
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				if (!data.available){
					alert('Username ' + un + ' is already taken.');
					return false;
				}
				$.ajax({
					async: false,
					dataType: 'jsonp',
					url: WEB_ROOT + "/php/status.php",
					data: {
						'fn': 'register',
						'un': un,
						'pw': pw,
						'email': email
					},
					success: function(data) {
						$('#register-form .link').click();
						$('#register-form input[type="text"], #register-form input[type="password"]').val('');
						ractive.login(un, pw);
					},
					error: function(a, b) {
						console.log('register error', a, b);
					}
				});
			},
			error: function(a, b) {
				console.log('reg_check error', a, b);
			}
		});
	},

	logout: function(un) {
		ractive.processing++;
		// console.log('logout processing ++', ractive.processing);
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'logout'
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				if(un == 'jonallenaz'){
					return;
				}
				ractive.checkStatus();
				ractive.processing--;
				// console.log('logout processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('logout error', a, b);
				ractive.processing--;
				// console.log('logout processing --', ractive.processing);
			}
		});
	},

	pad: function(num, len, pad_str) {
		return (len - String(num).length + 1 >= 0) ? Array(len - String(num).length + 1).join(pad_str || '0') + num : num.toString().substring(String(num).length - len + 1);
	},

	removeTimer: function(index) {
		ractive.processing++;
		// console.log('removeTimer processing ++', ractive.processing);
		this.splice('timers', index, 1);
		ractive.saveTimers();
		ractive.updateDisplay();
		ractive.updateAllColorPicks();
		ractive.processing--;
		// console.log('removeTimer processing --', ractive.processing);
	},

	runTimer: function(index, id) {
		if (this.get('timers.' + index + '.id') != id) {
			var new_num, old_running;
			for (var idx = this.get('timers').length - 1; idx >= 0; idx--) {
				if (this.get('timers.' + idx + '.id') == id) {
					new_num = idx;
					this.fire('runTimer', idx, idx);
					this.fire('runTimer', idx, idx);
					break;
				}
			}
			return;
		}
		var prev_elapsed_time = this.get('timers.' + index + '.total_time');
		var elapsed_time = new Date() - this.get('timers.' + index + '.start_time') + this.get('timers.' + index + '.elapsed_time');
		this.set('timers.' + index + '.display_time', this.formatTime(elapsed_time));
		this.set('timers.' + index + '.display_hours', this.formatHours(elapsed_time));
		this.set('timers.' + index + '.total_time', elapsed_time);
		this.sumTotal(this.get('timers'));

		// if (Math.floor(prev_elapsed_time / (SAVE_DELAY * 1000)) != Math.floor(elapsed_time / (SAVE_DELAY * 1000))) {
		// 	ractive.saveTimers();
		// }

		/* update css */
		var css_obj = getDialCSS(elapsed_time, index, false);
		this.set('timers.' + index + '.dial_css', css_obj.dial_css);
		if(Math.floor(prev_elapsed_time / (1000 * 60 * 5)) != Math.floor(elapsed_time / (1000 * 60 * 5))){
			this.set('timers.' + index + '.hour_css', css_obj.hour_hand);
		}
		if(Math.floor(prev_elapsed_time / (1000 * 5)) != Math.floor(elapsed_time / (1000 * 5))){
			this.set('timers.' + index + '.minute_css', css_obj.minute_hand);
		}
		this.set('timers.' + index + '.second_css', css_obj.second_hand);
	},

	saveRunningTimers: $.throttle((SAVE_DELAY*1000), false, function(){
		ractive.saveThrottled();
		return true;
	}),

	saveTimers: $.throttle((SAVE_THROTTLE * 1000), false, function() {
		ractive.saveThrottled();
		return true;
	}),

	saveThrottledTest: function() {
		ractive.processing++;
		// console.log('saveThrottledTest processing ++', ractive.processing);
		var r_timers = ractive.get('timers');
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'save',
				'r_timers': r_timers
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				ractive.checkStatus(data.message);
				if($('.summary').hasClass('on')){
					ractive.loadSummary();
				}
				// console.log('saveThrottledTest success!', data);
				ractive.processing--;
				// console.log('saveThrottledTest processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('saveThrottled error', a, b);
				ractive.processing--;
				// console.log('saveThrottledTest processing --', ractive.processing);
			}
		});
	},

	saveThrottled: function() {
		if(ractive.is_loading){
			// console.log('skip saving while loading...');
			return;
		}
		ractive.processing++;
		// console.log('saveThrottled processing ++', ractive.processing);
		if(WEB_ROOT.substring(0,10) != window.location.href.substring(0,10)){
			return ractive.saveThrottledTest;
		}
		var r_timers = ractive.get('timers');
		var r_options = ractive.get('options');
		// console.log(r_timers.length, 'r_timers', r_timers);
		// console.log('r_options', r_options);
		// return; // don't save while testing
		$.ajax({
			type: 'POST',
			url: WEB_ROOT + "/php/status.php",
			dataType: 'json',
			data: {
				'fn': 'save',
				'r_timers': r_timers,
				'r_options': r_options
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				ractive.checkStatus(data.message);
				if($('.summary').hasClass('on')){
					ractive.loadSummary();
				}
				// console.log('saveThrottled success!', data);
				ractive.processing--;
				// console.log('saveThrottled processing --', ractive.processing);
			},
			error: function(a, b) {
				console.log('saveThrottled error', a, b);
				ractive.processing--;
				// console.log('saveThrottled processing --', ractive.processing);
			}
		});
	},

	sortTimers: function() {
		var num = ractive.get('options.selectedSortable');
		var column = ractive.get('sortable.'+num+'.id');
		var direction = ractive.get('options.sortDirection');
		if (column) {
			var array = ractive.get('timers');
			array.sort(function(a, b) {
				if (a[column] == b[column]) {
					return a.id < b.id ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
				}
				return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
			});
			ractive.set('timers', array);
		}
	},

	sumTotal: function(timers) {
		var untracked = 0;
		var tracked = 0;
		var current_total = 0;
		var prev_total = this.get('total_time').toString().slice(0,-3);
		for (var idx in timers) {
			if (!timers.hasOwnProperty(idx)) {
				continue;
			}
			current_total += timers[idx].total_time;
			if (timers[idx].tracked) {
				tracked += timers[idx].total_time;
			} else {
				untracked += timers[idx].total_time;
			}
		}
		this.set('untracked_time', this.formatTime(untracked));
		this.set('tracked_time', this.formatTime(tracked));
		this.set('total_time', this.formatTime(current_total));
		current_total = this.get('untracked_time').toString().slice(0,-3);
		if(prev_total != current_total){
			document.title = current_total;
		}
	},

	switch: $.debounce(500, true, function(num) {
		$('#'+num).prop('checked', !$('#'+num).prop('checked'));
	}),

	updateAllColorPicks: $.throttle((300), false, function() {
		for (var idx = 0; idx < ractive.get('timers').length; idx++) {
			this.updateColorPick(idx);
		}
	}),

	updateColorPick: function(idx) {
		var cur_col = this.get('timers.' + idx + '.bg_color');
		$('.col-'+idx).colpick({
			layout: 'hex',
			submit: false,
			onChange: function(hsb, hex, rgb, el) {
				var cur_num = $(el).attr('data-num');
				ractive.set('timers.' + cur_num + '.bg_color', '#' + hex);
			},
			color: cur_col
		});
	},

	updateDisplay: function() {
		this.sumTotal(this.get('timers'));
		for (var num = this.get('timers').length - 1; num >= 0; num--) {
			var id = this.get('timers.'+num+'.id');
			var elapsed_time = this.get('timers.' + num + '.total_time');
			/* update css */
			var css_obj = getDialCSS(elapsed_time, num, false);
			ractive.set('timers.' + num + '.dial_css', css_obj.dial_css);
			ractive.set('timers.' + num + '.hour_css', css_obj.hour_hand);
			ractive.set('timers.' + num + '.minute_css', css_obj.minute_hand);
			ractive.set('timers.' + num + '.second_css', css_obj.second_hand);
		}
		ractive.saveTimers();
	},

	onrender: function(options) {
		var self = this;
		this.on({
			fn: function(event, arg) {
				var split = arg.split(':');
				var num = (split.length > 1) ? split[1] : -1;
				fn = split[0];
				var idx = 0;
				switch (fn) {
					case 'add':
						this.addTimer();
						break;
					case 'grid':
					case 'light':
						var cur = ractive.get('options.'+fn);
						ractive.set('options.'+fn, !cur);
						break;
					case 'logout':
						this.logout();
						this.set('timers',[]);
						this.addTimer();
						break;
					case 'stop_all':
						for (idx = this.get('timers').length - 1; idx >= 0; idx--) {
							if (this.get('timers.' + idx + '.running') && idx != num) {
								this.fire('runTimer', idx, idx);
							}
						}
						break;
					case 'rm_tracked':
						for (idx = this.get('timers').length - 1; idx >= 0; idx--) {
							if (this.get('timers.' + idx + '.tracked')) {
								ractive.removeTimer(idx);
							}
						}
						break;
					case 'rm_zero':
						for (idx = this.get('timers').length - 1; idx >= 0; idx--) {
							if (!this.get('timers.' + idx + '.total_time') && !this.get('timers.' + idx + '.elapsed_time')) {
								ractive.removeTimer(idx);
							}
						}
						break;
					case 'rm_old':
						var today = new Date();
						var today_date = (today.getMonth() + 1) + '/' + today.getDate();
						for (idx = this.get('timers').length - 1; idx >= 0; idx--) {
							if (this.get('timers.' + idx + '.date') != today_date) {
								ractive.removeTimer(idx);
							}
						}
						break;
					case 'rm_all':
						for (idx = this.get('timers').length - 1; idx >= 0; idx--) {
							ractive.removeTimer(idx);
						}
						break;
					case 'sort':
						var sort = ractive.get('sortable.'+num);
						ractive.set('sortable.'+num+'.dir', (sort.dir == 'up' ? 'down' : 'up'));
						ractive.set('options.sortDirection', (sort.dir == 'up' ? 'down' : 'up'));
						ractive.set('options.selectedSortable', num);
						break;
					case 'summary':
						$('.summary').toggleClass('on');
						if($('.summary').hasClass('on')){
							ractive.loadSummary();
						} else{
							ractive.set('summary', []);
						}
						$('.summary > span').html($('.summary').hasClass('on') ? 'v' : '^');
						break;
					case 'users':
						$('.users').toggleClass('on');
						if($('.users').hasClass('on')){
							ractive.loadUsers();
						} else{
							ractive.set('users', []);
						}
						$('.users > span').html($('.users').hasClass('on') ? 'v' : '^');
						break;
					case 'switch':
						ractive.switch(num);
						break;
					default:
						console.log(fn, num);
				}
				ractive.saveTimers();
				ractive.updateDisplay();
			},
			runTimer: function(event, idx) {
				var num = (typeof idx != 'undefined') ? idx : event.index.num;
				var id = this.get('timers.' + num + '.id');
				var css_obj;
				var count_running = 0;
				if (this.get('timers.' + num + '.running') === false) {
					for (var t_idx = this.get('timers').length - 1; t_idx >= 0; t_idx--) {
						if (this.get('timers.' + t_idx + '.running')) {
							count_running++;
						}
					}
					if (count_running >= 3) {
						alert("Let's try not to do too much multitasking!");
						return false;
					}
					this.set('timers.' + num + '.running', true);
					this.set('timers.' + num + '.start_time', new Date());
					this.set('timers.' + num + '.interval', setInterval(function() {
						ractive.runTimer(num, id);
						ractive.saveRunningTimers();
					}, 76));
					this.set('timers.' + num + '.display_text', 'Stop');
				} else {
					this.set('timers.' + num + '.running', false);
					this.set('timers.' + num + '.elapsed_time', new Date() - this.get('timers.' + num + '.start_time') + this.get('timers.' + num + '.elapsed_time'));
					clearInterval(this.get('timers.' + num + '.interval'));
					this.set('timers.' + num + '.display_text', 'Start');
					/* update css */
					css_obj = getDialCSS(this.get('timers.' + num + '.elapsed_time'), num, false);
					ractive.set('timers.' + num + '.dial_css', css_obj.dial_css);
					ractive.set('timers.' + num + '.hour_css', css_obj.hour_hand);
					ractive.set('timers.' + num + '.minute_css', css_obj.minute_hand);
					ractive.set('timers.' + num + '.second_css', css_obj.second_hand);
				}
				ractive.saveTimers();
			}
		});
	}
});

var ractive = new TimerList({
	el: container,
	data: {
		timers: [],
		untracked_time: 0,
		tracked_time: 0,
		total_time: 0,
		sort: function(array, column, direction) {
			array = array.slice(); // clone, so we don't modify the underlying data
			return array.sort(function(a, b) {
				return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
			});
		},
		sortable: [{
			'id': 'id',
			'name': 'Time Created',
			'dir': 'up'
		}, {
			'id': 'task',
			'name': 'Project / Task',
			'dir': 'up'
		}, {
			'id': 'bg_color',
			'name': 'Timer Color',
			'dir': 'up'
		}, {
			'id': 'total_time',
			'name': 'Total Time',
			'dir': 'up'
		}, ],
		options: {
			sortDirection: 'down',
			selectedSortable: '0',
			grid: true,
			light: true
		},
		summary: []
	}
});
ractive.checkStatus();
ractive.loadTimers();

ractive.set('untracked_time', ractive.formatTime(ractive.get('untracked_time')));
ractive.set('tracked_time', ractive.formatTime(ractive.get('tracked_time')));
ractive.set('total_time', ractive.formatTime(ractive.get('total_time')));

ractive.observe('options.selectedSortable options.sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('options.selectedSortable');
	if(column >= ractive.get('sortable').length){ return; }
	ractive.sortTimers(column);
	ractive.saveTimers();
});

ractive.observe('options.grid options.light', function(new_value, old_value, keypath){
	var fn = keypath.split('.')[1];
	$('link[id="css-' + fn + '"]')[0].disabled = !new_value;
});

ractive.observe('timers.*.tracked timers.*.task timers.*.bg_color', function(new_value, old_value, keypath) {
	ractive.updateDisplay();
	ractive.saveTimers();
});

// menu
$('body').on('click', '.menu', function(e){
	$('body').toggleClass('open');
	$('.options .on').removeClass('on').find('.drop').slideUp(300);
});
$('body').on('click', 'section', function(e){
	$('body').removeClass('open');
	$('.options .on').removeClass('on').find('.drop').slideUp(300);
});
$('body').on('click', '.mult', function(e){
	if(!e.originalEvent.target.children.length){
		return;
	}
	if($(this).hasClass('on')){
		$(this).removeClass('on');
		$(this).find('.drop').first().slideUp(300);
	} else{
		$('.on').removeClass('on').find('.drop').slideUp(300);
		$(this).addClass('on').find('.drop').first().slideDown(300);
	}
});

// details
$('body').on('click', '.task .more', function(e){
	$(this).closest('.timer').find('.details').slideToggle(300);
});

// close functionality
$('body').on('click', '.close, .close-label', function() {
	$(this).addClass('confirm').html('click to close');
	setTimeout(confirm, 2000, this);
});
$('body').on('click', '.confirm', function() {
	var num = $(this).closest('li').data('num');
	ractive.removeTimer(num);
	ractive.updateDisplay();
});
function confirm(el) {
	$(el).removeClass('confirm').html('x');
}

// edit time
$('body').on('blur', '.digital', function(e) {
	var num = $(this).closest('li').data('num');
	ractive.editTime(num, true);
	var val = $(this).val();
	if (val.indexOf('	') >= 0) {
		$(this).val(val.replace('	', ''));
		e.preventDefault();
		return false;
	}
	ractive.saveTimers();
});
$('body').on('keyup', '.digital', function(e) {
	var num = $(this).closest('li').data('num');
	ractive.editTime(num, false);
});

// input shadow color
$('body').on('focus', '.timer input', function(e){
	var num = $(e.target).closest('.timer').data('num');
	var color = ractive.get('timers.' + num + '.bg_color');
	$(this).css({"box-shadow":"inset 0 0 8px "+color});
});
$('body').on('blur', '.timer input', function(e){
	$(this).css({"box-shadow":"inset 0 0 0px black"});
});

// start and stop time on enter
$('body').on('keypress', '.task', function(e){
	if(e.which === 13){
		e.preventDefault();
		var num = $(this).closest('li').data('num');
		ractive.fire('fn', null, 'stop_all:'+num);
		$(this).nextAll('.start').click();
	}
});

// checkbox
$('body').on('click', '.toggle input[type="checkbox"]', function(e) {
  $(this).parent().toggleClass('checked', $(this).prop('checked'));
});

// login and register forms
$('body').on('click', '#login-form .link', function(e) {
	$('#login-form').fadeOut();
	$('#register-form').fadeOut().delay(400).fadeIn();
	setTimeout(function() { $('#reg_email').focus(); }, 700);
});
$('body').on('click', '#register-form .link', function(e) {
	$('#register-form').fadeOut();
	$('#login-form').fadeOut().delay(400).fadeIn();
	setTimeout(function() { $('#username').focus(); }, 700);
});
$(function(){
	$('#register-form').hide();
});
$('#login-form').submit(function(e) {
	e.preventDefault();
	ractive.login($('#username').val(), $('#password').val());
	return false;
});
$('#register-form').submit(function(e) {
	e.preventDefault();
	ractive.register($('#reg_username').val(), $('#reg_password').val(), $('#reg_email').val());
	return false;
});

// check status on focus of timer app
function onFocus(){
	if(!ractive.focus){
		ractive.focus = true;
		ractive.checkStatus();
	}
}
function onBlur(){
	ractive.focus = false;
}
if (/*@cc_on!@*/false) { // check for Internet Explorer
	document.onfocusin = onFocus;
	document.onfocusout = onBlur;
} else {
	window.onfocus = onFocus;
	window.onfocusout = onBlur;
}

// admin stuff
// $('body').on('click', '.admin', function(e){
// 	console.log('login as: ', $(this).text(), $(this).data('admin'), ractive.un);
// 	ractive.logout(ractive.un);
// 	ractive.login($(this).text(), $(this).data('admin'), ractive.un);
// 	location.reload();
// });
