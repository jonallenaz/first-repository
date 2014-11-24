var WEB_ROOT = 'http://www.ellatek.com/ractive';
var SAVE_DELAY = 30; // number of seconds of inactivity between saves
var SAVE_THROTTLE = 5; // minimun number of seconds between saves

var Timer = function(obj) {
	obj = obj || {};
	var today = new Date();
	var date = (today.getMonth() - 1 < 10) ? '0' + today.getMonth() - 1 : today.getMont() - 1;
	date += (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
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
		fg_color: obj.fg_color || '#AAB7C0',
		dial_css: obj.dial_css || '',
		second_css: obj.second_css || 'text-decoration:none;',
		minute_css: obj.minute_css || 'text-decoration:none;',
		hour_css: obj.hour_css || 'text-decoration:none;',
		date: obj.date || (today.getMonth() + 1) + '/' + today.getDate()
	};
};

var TimerList = Ractive.extend({
	template: '#template',
	bg_colors: ['#FFFFFF', '#FCD112', '#F50505', '#000000', '#595854'],
	fg_colors: ['#AAB7C0', '#AAB7C0', '#AAB7C0', '#AAB7C0', '#AAB7C0'],
	color_idx: 0,

	addTimer: function(obj) {
		if (obj) this.color_idx++;
		var bg = (obj && obj.bg_color) ? obj.bg_color : this.bg_colors[(this.color_idx % this.bg_colors.length)];
		var fg = (obj && obj.fg_color) ? obj.fg_color : this.fg_colors[(this.color_idx++ % this.fg_colors.length)];
		this.unshift('timers', new Timer(obj || {
			'bg_color': bg,
			'fg_color': fg
		}));
		if(obj && obj.running == 'true'){
			this.fire('runTimer', 0, 0);
			this.fire('runTimer', 0, 0);
		}
		// this.updateColorPick(0);
		// this.sortTimers();
		ractive.saveTimers();
		ractive.updateAllColorPicks();
		$('li[data-num="0"] .task').focus();
	},

	checkStatus: function(message) {
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'check'
			},
			success: function(data) {
				if (typeof data != 'object') {
					data = JSON.parse(data);
				}
				if (data.loggedin) {
					$('.login, .overlay').hide();
				} else {
					$('.login, .overlay').show();
					$('.login #password').html('');
					$('.login .message').hide().html(message || '').fadeIn();
				}
			},
			error: function(a, b) {
				console.log('error', a, b);
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

	loadTimers: function() {
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
				if (timers.length) {
					var json, time, bg, fg;
					for (var t_idx = timers.length - 1; t_idx >= 0; t_idx--) {
						if (timers[t_idx].hasOwnProperty('timer_key')) {
							// load old timers
							if (timers[t_idx].timer_key == 'TimerOptions')
								continue;
							json = JSON.parse(timers[t_idx].timer_json);
							ractive.addTimer({
								'elapsed_time': json.total,
								'total_time': json.total,
								'bg_color': '#' + json.color,
								'fg_color': '#AAB7C0',
								'task': json.cust + ' ' + json.task,
								'id': json.timer_key,
								'date': json.date
							});
						} else if (timers[t_idx].hasOwnProperty('json')) {
							// load new timers
							json = JSON.parse(unescape(timers[t_idx].json));
							ractive.addTimer(json);
						}
					}
				} else {
					ractive.addTimer();
				}
				ractive.updateDisplay();
				ractive.sortTimers();
				ractive.updateAllColorPicks();
			},
			error: function(a, b) {
				console.log('error', a, b);
			}
		});
	},

	login: function(un, pw) {
		$.ajax({
			async: false,
			dataType: 'jsonp',
			url: WEB_ROOT + "/php/status.php",
			data: {
				'fn': 'login',
				'un': un,
				'pw': pw
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
			},
			error: function(a, b) {
				console.log('error', a, b);
			}
		});
	},

	logout: function() {
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
				ractive.checkStatus();
			},
			error: function(a, b) {
				console.log('error', a, b);
			}
		});
	},

	pad: function(num, len, pad_str) {
		return (len - String(num).length + 1 >= 0) ? Array(len - String(num).length + 1).join(pad_str || '0') + num : num.toString().substring(String(num).length - len + 1);
	},

	removeTimer: function(index) {
		this.splice('timers', index, 1);
		ractive.saveTimers();
		ractive.updateDisplay();
		ractive.updateAllColorPicks();
	},

	runTimer: function(index, id) {
		if (this.data.timers[index].id != id) {
			var new_num, old_running;
			for (var idx = this.data.timers.length - 1; idx >= 0; idx--) {
				if (this.data.timers[idx].id == id) {
					new_num = idx;
					this.fire('runTimer', idx, idx);
					this.fire('runTimer', idx, idx);
					break;
				}
			}
			return;
		}
		var prev_elapsed_time = this.get('timers.' + index + '.total_time');
		var elapsed_time = new Date() - this.data.timers[index].start_time + this.data.timers[index].elapsed_time;
		this.set('timers.' + index + '.display_time', this.formatTime(elapsed_time));
		this.set('timers.' + index + '.display_hours', this.formatHours(elapsed_time));
		this.set('timers.' + index + '.total_time', elapsed_time);
		this.sumTotal(this.data.timers);

		if (Math.floor(prev_elapsed_time / (SAVE_DELAY * 1000)) != Math.floor(elapsed_time / (SAVE_DELAY * 1000))) {
			ractive.saveTimers();
		}
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

	saveTimers: $.throttle((SAVE_THROTTLE * 1000), false, function() {
		ractive.saveThrottled();
		return true;
	}),

	saveThrottled: function() {
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
				// console.log(data);
				ractive.checkStatus(data.message);
			},
			error: function(a, b) {
				console.log('error', a, b);
			}
		});
	},

	sortTimers: function() {
		var num = ractive.data.options.selectedSortable;
		var column = ractive.data.sortable[num].id;
		var direction = ractive.data.options.sortDirection;
		if (column) {
			ractive.data.timers.sort(function(a, b) {
				if (a[column] == b[column]) {
					return a.id < b.id ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
				}
				return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
			});
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
		current_total = this.get('total_time').toString().slice(0,-3);
		if(prev_total != current_total){
			document.title = current_total;
		}
	},

	updateAllColorPicks: $.throttle((300), false, function() {
		for (var idx = 0; idx < ractive.data.timers.length; idx++) {
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
		this.sumTotal(this.data.timers);
		for (var num = this.data.timers.length - 1; num >= 0; num--) {
			var id = this.data.timers[num].id;
			var elapsed_time = this.get('timers.' + num + '.total_time');
			/* update css */
			var css_obj = getDialCSS(elapsed_time, num, false /*Boolean(this.data.timers[num].running === true)*/ );
			ractive.set('timers.' + num + '.dial_css', css_obj.dial_css);
			ractive.set('timers.' + num + '.hour_css', css_obj.hour_hand);
			ractive.set('timers.' + num + '.minute_css', css_obj.minute_hand);
			ractive.set('timers.' + num + '.second_css', css_obj.second_hand);
		}
		ractive.saveTimers();
	},

	init: function(options) {
		var self = this;
		this.on({
			fn: function(event, arg) {
				var split = arg.split(':');
				var num = (split.length > 1) ? split[1] : 0;
				fn = split[0];
				switch (fn) {
					case 'add':
						this.addTimer();
						break;
					case 'logout':
						this.logout();
						this.set('timers',[]);
						this.addTimer();
						break;
					case 'stop_all':
						for (var num = this.data.timers.length - 1; num >= 0; num--) {
							if (this.data.timers[num].running) {
								this.fire('runTimer', num, num);
							}
						}
						break;
					case 'rm_tracked':
						for (var num = this.data.timers.length - 1; num >= 0; num--) {
							if (this.data.timers[num].tracked) {
								ractive.removeTimer(num);
							}
						}
						ractive.updateDisplay();
						break;
					case 'rm_zero':
						for (var num = this.data.timers.length - 1; num >= 0; num--) {
							if (!this.data.timers[num].total_time && !this.data.timers[num].elapsed_time) {
								ractive.removeTimer(num);
							}
						}
						ractive.updateDisplay();
						break;
					case 'rm_old':
						var today = new Date();
						var today_date = (today.getMonth() + 1) + '/' + today.getDate()
						for (var num = this.data.timers.length - 1; num >= 0; num--) {
							if (this.data.timers[num].date != today_date) {
								ractive.removeTimer(num);
							}
						}
						ractive.updateDisplay();
						break;
					case 'rm_all':
						for (var num = this.data.timers.length - 1; num >= 0; num--) {
							ractive.removeTimer(num);
						}
						ractive.updateDisplay();
						break;
					case 'sort':
						var sort = ractive.get('sortable.'+num);
						ractive.set('sortable.'+num+'.dir', (sort.dir == 'up' ? 'down' : 'up'));
						ractive.set('options.sortDirection', (sort.dir == 'up' ? 'down' : 'up'));
						ractive.set('options.selectedSortable', num);
						break;
					default:
						console.log(fn, num);
				}
			},
			runTimer: function(event, idx) {
				var num = (typeof idx != 'undefined') ? idx : event.index.num;
				var id = this.data.timers[num].id;
				var css_obj;
				var count_running = 0;
				if (this.data.timers[num].running === false) {
					for (var idx = this.data.timers.length - 1; idx >= 0; idx--) {
						if (this.data.timers[idx].running) {
							count_running++;
						}
					}
					if (count_running >= 3) {
						alert("Let's try not to do too much multitasking!");
						return false;
					}
					this.set('timers.' + num + '.running', true);
					this.data.timers[num].start_time = new Date();
					this.data.timers[num].interval = setInterval(function() {
						ractive.runTimer(num, id);
					}, 76);
					this.set('timers.' + num + '.display_text', 'Stop');
					// css_obj = getDialCSS(this.data.timers[num].elapsed_time, num, true);
				} else {
					this.set('timers.' + num + '.running', false);
					this.data.timers[num].elapsed_time = new Date() - this.data.timers[num].start_time + this.data.timers[num].elapsed_time;
					clearInterval(this.data.timers[num].interval);
					this.set('timers.' + num + '.display_text', 'Start');
					/* update css */
					css_obj = getDialCSS(this.data.timers[num].elapsed_time, num, false);
					ractive.set('timers.' + num + '.dial_css', css_obj.dial_css);
					ractive.set('timers.' + num + '.hour_css', css_obj.hour_hand);
					ractive.set('timers.' + num + '.minute_css', css_obj.minute_hand);
					ractive.set('timers.' + num + '.second_css', css_obj.second_hand);
				}
				ractive.saveThrottled();
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
			selectedSortable: '0'
		}
	}
});
ractive.checkStatus();
ractive.loadTimers();

ractive.set('untracked_time', ractive.formatTime(ractive.get('untracked_time')));
ractive.set('tracked_time', ractive.formatTime(ractive.get('tracked_time')));
ractive.set('total_time', ractive.formatTime(ractive.get('total_time')));

/*
ractive.observe('sortColumn options.sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('sortColumn');
	var direction = ractive.get('options.sortDirection');
	ractive.data.timers.sort(function(a, b) {
		return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
	});
});
*/

ractive.observe('options.selectedSortable options.sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('options.selectedSortable');
	if(column >= ractive.get('sortable').length){ return; }
	ractive.sortTimers(column);
	ractive.saveTimers();
});

ractive.observe('timers.*.tracked', function(new_value, old_value, keypath) {
	ractive.updateDisplay();
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

$('body').on('blur', '.digital', function(e) {
	var num = $(this).closest('li').data('num');
	ractive.editTime(num, true);
	var val = $(this).val();
	if (val.indexOf('	') >= 0) {
		$(this).val(val.replace('	', ''));
		e.preventDefault();
		return false;
	}
});
$('body').on('keyup', '.digital', function(e) {
	var num = $(this).closest('li').data('num');
	ractive.editTime(num, false);
});
$('body').on('mouseover', '.mult', function(e) {
	$(this).nextAll('.drop').first().addClass('on');
});
$('body').on('mouseout', '.mult', function(e) {
	$(this).nextAll('.drop').first().removeClass('on');
});
$('body').on('mouseover', '.drop', function(e) {
	$(this).addClass('on');
});
$('body').on('mouseout', '.drop', function(e) {
	$(this).removeClass('on');
});
$('body').on('keypress', '.task', function(e){
	if(e.which === 13){
		e.preventDefault();
		$(this).nextAll('.start').click();
	}
});

$('#login-form').submit(function(e) {
	e.preventDefault();
	ractive.login($('#username').val(), $('#password').val());
	return false;
});
