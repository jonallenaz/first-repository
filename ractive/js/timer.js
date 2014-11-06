var DELAY = 76;
var Timer = function(obj) {
	obj = obj || {};
	var today = new Date();
	var date = (today.getMonth() - 1 < 10) ? '0' + today.getMonth() - 1 : today.getMont() - 1;
	date += (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
	return {
		id: obj.id || ractive.formatId(),
		start_time: obj.start_time || '',
		elapsed_time: obj.elapsed_time || 0,
		total_time: obj.total_time || 0,
		display_hours: obj.display_hours || ractive.formatHours(obj.total_time || 0),
		display_time: obj.display_time || ractive.formatTime(obj.total_time || 0),
		display_text: obj.display_text || 'Start',
		running: obj.running || false,
		tracked: obj.tracked || false,
		task: obj.task || '',
		bg_color: obj.bg_color || '#FFFFFF',
		fg_color: obj.fg_color || '#444444',
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
	fg_colors: ['#444444', '#333333', '#aaaaaa', '#AAAAAA', '#CCCCCC'],
	color_idx: 0,

	addTimer: function(obj) {
		if (obj) this.color_idx++;
		var bg = (obj && obj.bg_color) ? obj.bg_color : this.bg_colors[(this.color_idx % this.bg_colors.length)];
		var fg = (obj && obj.fg_color) ? obj.fg_color : this.fg_colors[(this.color_idx++ % this.fg_colors.length)];
		this.unshift('timers', new Timer(obj || {
			'bg_color': bg,
			'fg_color': fg
		}));
		this.updateColorPick(0);
		this.sortTimers();
	},

	updateColorPick: function(idx) {
		$('li[data-id="' + this.get('timers.' + idx + '.id') + '"] .colorpick').colpick({
			layout: 'hex',
			submit: false,
			onChange: function(hsb, hex, rgb, el) {
				var num = $(el).closest('li').data('num')
				ractive.set('timers.' + num + '.bg_color', '#' + hex);
				var fg = (hsb.b > 50) ? '#444444' : '#AAAAAA';
				ractive.set('timers.' + num + '.fg_color', fg);
			},
			color: this.get('timers.' + idx + '.bg_color')
		});
	},

	updateAllColorPicks: function() {
		for (var idx = ractive.data.timers.length - 1; idx >= 0; idx--) {
			this.updateColorPick(idx);
		}
	},

	removeTimer: function(index) {
		this.splice('timers', index, 1);
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

		// if(Math.floor(prev_elapsed_time / 1000) != Math.floor(elapsed_time / 1000)){
		/* update css */
		var css_obj = getDialCSS(elapsed_time, index, false);
		// console.log(Math.floor(elapsed_time / 1000));
		this.set('timers.' + index + '.dial_css', css_obj.dial_css);
		this.set('timers.' + index + '.hour_css', css_obj.hour_hand);
		this.set('timers.' + index + '.minute_css', css_obj.minute_hand);
		this.set('timers.' + index + '.second_css', css_obj.second_hand);
		// }
	},

	sumTotal: function(timers) {
		var untracked = 0;
		var tracked = 0;
		var current_total = 0;
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
	},

	formatHours: function(time) {
		var formatted_time = (Math.floor(100 * time / (60 * 60 * 1000)) / 100).toFixed(2);
		if (formatted_time < 10) {
			formatted_time = '0' + formatted_time;
		}
		return formatted_time;
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

	formatId: function() {
		var today = new Date();
		var id = today.getFullYear().toString() + this.pad(today.getMonth() + 1, 2) + this.pad(today.getDate(), 2) + this.pad(today.getHours(), 2) + this.pad(today.getMinutes(), 2) + this.pad(today.getSeconds(), 2) + this.pad(today.getMilliseconds(), 3);
		// check if id already exists
		return id;
	},

	pad: function(num, len, pad_str) {
		return (len - String(num).length + 1 >= 0) ? Array(len - String(num).length + 1).join(pad_str || '0') + num : num.toString().substring(String(num).length - len + 1);
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
	},

	editTime: function(num){
		var running = ractive.get('timers.'+num+'.running');
		if(running){
			return false;
		}
		var time_string = ractive.get('timers.'+num+'.display_time');
		var regex = /^(\d{2,3}):([0-5]\d):([0-5]\d).(\d\d)?$/;
		var regex_test = regex.test(time_string);
		if(!regex_test){
			alert('Please format the time correctly (HH:MM:SS.SS).');
			return false;
		}
		time_string = time_string.split(':');
		var hours = time_string[0];
		var minutes = time_string[1];
		var seconds = time_string[2];
		var new_time = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
		ractive.set('timers.'+num+'.total_time', new_time);
		ractive.set('timers.'+num+'.elapsed_time', new_time);
		ractive.set('timers.'+num+'.display_hours', this.formatHours(new_time));
		this.updateDisplay();
	},

	sortTimers: function() {
		var num = ractive.data.selectedSortable;
		var column = ractive.data.sortable[num].id;
		var direction = ractive.data.sortDirection;
		if(column){
			ractive.data.timers.sort(function(a, b) {
				if (a[column] == b[column]) {
					return a.id < b.id ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
				}
				return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
			});
		}
	},

	init: function(options) {
		var self = this;
		this.on({
			remove: function(event) {
				this.removeTimer(event.index.i);
			},
			newTimer: function(event) {
				this.addTimer();
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
					if(count_running >= 3){
						alert("Let's try not to do too much multitasking!");
						return false;
					}
					this.set('timers.' + num + '.running', true);
					this.data.timers[num].start_time = new Date();
					this.data.timers[num].interval = setInterval(function() {
						ractive.runTimer(num, id);
					}, DELAY);
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
			},
			sortTimers: function(event, column) {
				this.sortTimers(column);
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
			'id': '',
			'name': '- None -'
		}, {
			'id': 'id',
			'name': 'Time Created'
		}, {
			'id': 'task',
			'name': 'Project / Task'
		}, {
			'id': 'bg_color',
			'name': 'Timer Color'
		}, {
			'id': 'total_time',
			'name': 'Total Time'
		}, ],
		sortDirection: 'down',
		selectedSortable: '1'
	}
});

ractive.set('untracked_time', ractive.formatTime(ractive.get('untracked_time')));
ractive.set('tracked_time', ractive.formatTime(ractive.get('tracked_time')));
ractive.set('total_time', ractive.formatTime(ractive.get('total_time')));

ractive.observe('sortColumn sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('sortColumn');
	var direction = ractive.get('sortDirection');
	ractive.data.timers.sort(function(a, b) {
		return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
	});
});

ractive.observe('selectedSortable sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('selectedSortable');
	ractive.sortTimers(column);
});

ractive.observe('timers.*.tracked', function(new_value, old_value, keypath) {
	ractive.updateDisplay();
});

if (!Object.keys(ractive.data.timers).length) {
/*	ractive.addTimer({
		"elapsed_time": 362806,
		"total_time": 362806,
		"bg_color": "#FFFFFF",
		"fg_color": "#444444"
	});
*/	ractive.addTimer();
	ractive.updateDisplay();
}

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

$('body').on('blur', '.digital', function(el) {
	var num = $(this).closest('li').data('num');
	ractive.editTime(num);
});

function confirm(el) {
	$(el).removeClass('confirm').html('x');
}
