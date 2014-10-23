var Timer = function(obj) {
	var today = new Date();
	var date = (today.getMonth() - 1 < 10) ? '0' + today.getMonth() - 1 : today.getMont() - 1;
	date += (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
	return {
		id: obj.id || ractive.formatId(),
		start_time: obj.start_time || '',
		elapsed_time: obj.elapsed_time || 0,
		total_time: obj.total_time || 0,
		display_hours: obj.display_hours || ractive.formatHours(0),
		display_time: obj.display_time || ractive.formatTime(0),
		display_text: obj.display_text || 'Start',
		project: obj.project || '',
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
	},

	updateColorPick: function(idx){
		$('li[data-id="'+this.get('timers.'+idx+'.id')+'"] .colorpick').colpick({
			layout:'hex',
			submit: false,
			onChange: function(hsb,hex,rgb,el){
				var num = $(el).closest('li').data('num')
				ractive.set('timers.'+num+'.bg_color', '#'+hex);
				var fg = (hsb.b > 50) ? '#444444' : '#AAAAAA';
				ractive.set('timers.'+num+'.fg_color', fg);
			},
			color: this.get('timers.'+idx+'.bg_color')
		});
	},

	updateAllColorPicks: function(){
		for(var idx = ractive.data.timers.length-1; idx >= 0; idx--){
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
		var elapsed_time = new Date() - this.data.timers[index].start_time + this.data.timers[index].elapsed_time;
		this.set('timers.' + index + '.display_time', this.formatTime(elapsed_time));
		this.set('timers.' + index + '.display_hours', this.formatHours(elapsed_time));
		this.set('timers.' + index + '.total_time', elapsed_time);
		this.sumTotal(this.data.timers);
	},

	sumTotal: function(timers) {
		var current_total = 0;
		for (var idx in timers) {
			if (!timers.hasOwnProperty(idx)) {
				continue;
			}
			current_total += timers[idx].total_time;
		}
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
		formatted_time = this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2) + '.' + this.pad(ms, 3);
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
				if (this.data.timers[num].display_text == 'Start') {
					this.data.timers[num].start_time = new Date();
					this.data.timers[num].interval = setInterval(function() {
						ractive.runTimer(num, id);
					}, 43);
					this.set('timers.' + num + '.display_text', 'Stop');
					css_obj = getDialCSS(this.data.timers[num].elapsed_time, num, true);
				} else {
					this.data.timers[num].elapsed_time = new Date() - this.data.timers[num].start_time + this.data.timers[num].elapsed_time;
					clearInterval(this.data.timers[num].interval);
					this.set('timers.' + num + '.display_text', 'Start');
					css_obj = getDialCSS(this.data.timers[num].elapsed_time, num, false);
				}
				/* update css */
				ractive.set('timers.' + num + '.dial_css', css_obj.dial_css);
				ractive.set('timers.' + num + '.hour_css', css_obj.hour_hand);
				ractive.set('timers.' + num + '.minute_css', css_obj.minute_hand);
				ractive.set('timers.' + num + '.second_css', css_obj.second_hand);
			},
			sortTimers: function(event, column) {
				var sort = this.data.sortable[column];
				var direction = (sort.id == this.data.sortColumn && sort.direction == this.data.sortDirection && sort.direction == 'up') ? 'down' : 'up';
				ractive.set('sortColumn', sort.id);
				ractive.set('sortDirection', direction);
				ractive.set('sortable.' + column + '.direction', direction);
			}
		});
	}
});

var ractive = new TimerList({
	el: container,
	data: {
		timers: [],
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
			'direction': 'up',
			'sorted': true
		}, {
			'id': 'task',
			'name': 'Project / Task',
			'direction': 'up',
			'sorted': false
		}, {
			'id': 'bg_color',
			'name': 'Timer Color',
			'direction': 'up',
			'sorted': false
		}, {
			'id': 'total_time',
			'name': 'Total Time',
			'direction': 'up',
			'sorted': false
		}, ],
		sortColumn: 'id',
		sortDirection: 'up'
	}
});

ractive.set('total_time', ractive.formatTime(ractive.get('total_time')));

ractive.observe('sortColumn sortDirection', function(new_value, old_value, keypath) {
	var column = ractive.get('sortColumn');
	var direction = ractive.get('sortDirection');
	ractive.data.timers.sort(function(a, b) {
		return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
	});
});

if (!Object.keys(ractive.data.timers).length) {
	ractive.addTimer({"id":"20141018071614515","start_time":"2014-10-20T20:23:50.276Z","elapsed_time":362808,"total_time":362806,"display_hours":"00.10","display_time":"00:06:02.806","display_text":"Start","task":"","bg_color":"#FFFFFF","fg_color":"#444444","dial_css":"","second_css":"-webkit-animation: none;animation: none;-webkit-transform: rotate(0.046799999999999994turn);transform: rotate(0.046799999999999994turn);","minute_css":"-webkit-animation: none;animation: none;-webkit-transform: rotate(0.10078000000000001turn);transform: rotate(0.10078000000000001turn);","hour_css":"-webkit-animation: none;animation: none;-webkit-transform: rotate(0.008398333333333334turn);transform: rotate(0.008398333333333334turn);","date":"10/18","interval":5});
	ractive.addTimer();
}


