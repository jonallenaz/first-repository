var Timer = function(obj) {
	return {
		id: obj.id || ractive.formatId(),
		start_time: obj.start_time || '',
		elapsed_time: obj.elapsed_time || 0,
		total_time: obj.total_time || 0,
		display_time: obj.display_time || ractive.formatTime(0),
		display_text: obj.display_text || 'Start',
		project: obj.project || '',
		task: obj.task || '',
		color: obj.color || 'yellow',
		dial_css: obj.dial_css || '',
		second_css: obj.second_css || 'text-decoration:none;',
		minute_css: obj.minute_css || 'text-decoration:none;',
		hour_css: obj.hour_css || 'text-decoration:none;'
	};
};

var TimerList = Ractive.extend({
	template: '#template',
	colors: ['#FFFFFF', '#FCD112', '#F50505', '#000000', '#595854'],
	color_idx: 0,

	addTimer: function() {
		this.push('timers', new Timer({'color': this.colors[(this.color_idx++ % this.colors.length)]}));
	},

	removeTimer: function(index) {
		this.splice('timers', index, 1);
	},

	runTimer: function(index) {
		var elapsed_time = new Date() - this.data.timers[index].start_time + this.data.timers[index].elapsed_time;
		this.set('timers.' + index + '.display_time', this.formatTime(elapsed_time));
		this.set('timers.' + index + '.total_time', elapsed_time);
		this.sumTotal(this.data.timers);
	},

	sumTotal: function(timers){
		var current_total = 0;
		for(var idx in timers){
			if(!timers.hasOwnProperty(idx)){ continue; }
			current_total += timers[idx].total_time;
		}
		this.set('total_time', this.formatTime(current_total));
	},

	formatTime: function(time) {
		var h = 0, m = 0, s = 0, ms = 0;
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
			runTimer: function(event) {
				var num = event.index.num;
				var css_obj;
				if (this.data.timers[num].display_text == 'Start') {
					this.data.timers[num].start_time = new Date();
					this.data.timers[num].interval = setInterval(function() {
						ractive.runTimer(num);
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
				ractive.set('timers.'+num+'.dial_css', css_obj.dial_css);
				ractive.set('timers.'+num+'.hour_css', css_obj.hour_hand);
				ractive.set('timers.'+num+'.minute_css', css_obj.minute_hand);
				ractive.set('timers.'+num+'.second_css', css_obj.second_hand);
			},
			sortTimers: function(event, column) {
				var sort = this.data.sortable[column];
				var direction = (sort.id == this.data.sortColumn && sort.direction == this.data.sortDirection && sort.direction == 'up') ? 'down' : 'up';
				ractive.set('sortColumn', sort.id);
				ractive.set('sortDirection', direction);
				ractive.set('sortable.'+column+'.direction', direction);
				// console.log(column, this.data.sortable[column]);
				// console.log(this.data.timers);
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
		sortable: [
			{'id': 'id', 'name': 'Created', 'direction': 'up', 'sorted': true},
			{'id': 'project', 'name': 'Project', 'direction': 'up', 'sorted': false},
			{'id': 'total_time', 'name': 'Total', 'direction': 'up', 'sorted': false},
		],
		sortColumn: 'id',
		sortDirection: 'up'
	}
});

ractive.set('total_time', ractive.formatTime(ractive.get('total_time')));

ractive.observe('sortColumn sortDirection', function(new_value, old_value, keypath){
	var column = ractive.get('sortColumn');
	var direction = ractive.get('sortDirection');
	ractive.data.timers.sort(function(a, b) {
		return a[column] < b[column] ? (direction == 'up' ? -1 : 1) : (direction == 'up' ? 1 : -1);
	});
});

if (!Object.keys(ractive.data.timers).length) {
	ractive.addTimer();
	ractive.addTimer();
}
