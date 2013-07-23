/*
**VARIABLES**
*	date = date timer was created
*	running = running state (stopped or counting)
*	interval = interval object
*	total = total time on timer
*	splits = [
*		{
*			date = date split was created
*			start = start time
*			end = end time
*			duration = elapsed time
*		}
*	]
*	cust = customer field
*	task = project / task field
*	color = background color of timer
*	tracked = timer has been marked as tracked
*
*/

// timer only runs if local storage is available
$(function() {
	if(TimeTracker.checkLocalStore()){
		// $('body').css('margin-top', ($('.infoBar').height()+44) );
		$start = $('div.box:first').find('.start');
		TimeTracker.startText = $start.text() || TimeTracker.startText;
		TimeTracker.stopText = $start.attr('alternate') || TimeTracker.stopText;

		// load stored timers or create new one if no timers are stored
		TimeTracker.loadTimers();
		TimeTracker.loadOptions();

		$("div.more").on('click', function(){
			// setTimeout(TimeTracker.createTimer,400);
			TimeTracker.createTimer();
			$('html, body').animate({
				scrollTop: 0
			}, 600);
		});
		$(".stopAll").on('click', function(){ TimeTracker.stopAll(); });

		$('body').on('click', '.start', function(e){ e.preventDefault(); TimeTracker.startStop($(this).closest('.box')); });
		$('body').on('change', '.color', function(){ $this = $(this); $box = $this.closest('.box'); if(true || !$box.find('input[name="tracked"]').is(':checked')){ $box.find('.front').css('background-color', '#'+$this.val()); } });
		$('body').on('change', 'input[id^="analog"]', function(){ $(this).closest('.box').find('.front').toggleClass('analog').toggleClass('digital'); });
		$('body').on('change', '#default_analog', function(){ $('.box').eq(0).find('.front').toggleClass('analog').toggleClass('digital'); TimeTracker.saveOption('default_analog', $(this).is(':checked')); });
		$('body').on('click', '.remove', function(){ TimeTracker.remove($(this).closest('.box')); });
		$("body").on('click', '.removeTracked', function(){ TimeTracker.removeTracked(); });
		$("body").on('click', '.removeAll', function(){ TimeTracker.removeAll(); });
		$("body").on('dblclick','.removeCheck', function(e){ e.preventDefault(); });
		$('body').on('click', '.tracked input', function(){ TimeTracker.track($(this).closest('.box')); });
		$('body').on('click', '.edit', function(){ $(this).closest('.box').toggleClass('flip'); });
		$('body').on('click','.show_splits', function(){ $(this).find('span').toggle(); $('.splits').slideToggle(600,function(){ TimeTracker.saveOption('splits', Boolean($('.splits:visible').length)); TimeTracker.resize(); }); });
		$('body').on('click','.match_color', function(){ $(this).find('span').toggle(); TimeTracker.match_color = Boolean($('.match_color .hidden:visible').length); TimeTracker.saveOption('match_color', TimeTracker.match_color); });
		$('body').on('click','.go_dark', function(){
			$(this).find('span').toggle();
			var href = $('#stylesheet').attr('href');
			if(href.indexOf('blank.css') >= 0){
				href = href.replace('blank.css', 'dark.css').replace('timer-','');
			} else{
				href = href.replace('dark.css', 'blank.css').replace('timer-','');
			}
			TimeTracker.saveOption('css', href);
			$('#stylesheet').attr('href', href);
		});
		$('.boxes').on('change', 'input', function(){
			var $this = $(this);
			$(this).attr('value',$this.val());
			var $box = $this.closest('.box');
			var num = $box.data('num') || (++TimeTracker.timers);
			var key = $box.data('key') || new Date().getTime();
			var t = JSON.parse(localStorage[key] || "{}");
			switch($this.attr('name')){
				case 'analog':
				case 'tracked':
					t[$this.attr('name')] = $this.is(':checked');
					break;
				case 'split':
					var s = parseInt($this.closest('li').find('span').text(),10)-1;
					t.splits[s].duration = $this.val() * 60000;
					t.splits[s].end = t.splits[s].start + t.splits[s].duration;
					// console.log($('li.split-'+(s+1), $box));
					$('li.split-'+(s+1), $box).html(TimeTracker.formatSplit(t.splits[s].start, t.splits[s].duration, s+1));
					var totalTime = 0;
					// total time
					for(s2=0,ss=t.splits.length; s2<ss; s2++){
						totalTime += parseInt(t.splits[s2].duration,10);
					}
					start_clock(totalTime, num, t.running);
					break;
				default:
					t[$this.attr('name')] = $this.val();
			}
			// console.log($this.attr('name'));
			if(TimeTracker.match_color && $this.val() && $this.attr('name') == 'cust'){
				var match = $box.siblings().find('input[name="cust"][value="'+$this.val()+'"]');
				// console.log('match',match);
				var tmp_color = match.closest('.box').find('.color').val();
				// console.log('tmp_color',tmp_color);
				if(tmp_color){
					$box.find('.color').val(tmp_color).change();
					t.color = tmp_color;
				}
			}
			localStorage[key] = JSON.stringify(t);
			TimeTracker.updateDisplay($box,true);
		});

		$('body').on('click',' .splits span', function(){
			$(this).closest('li').find('.elapsed').toggle();
			$('input[name="split"]').blur();
		});

		$('.boxes').on("ss-event-dropped", function(e, selected) {
			// Save position of each timer
			$objects = $(this).children();
			$objects.each(function(i) {
				var key = $(this).data('key');
				var t = JSON.parse(localStorage[key]);
				t.order = i+1;
				localStorage[key] = JSON.stringify(t);
			});
		});

		$('header').on('click', '.tab_name', function(){
			if(!$('#'+$(this).data('section')).is(':visible')){
				$('.tab_name.selected').removeClass('selected');
				$('header').find('section').fadeOut(300).delay(300).end().find('#'+$(this).data('section')).fadeIn(300);
				$(this).addClass('selected');
			}
		});

		setTimeout(function(){$('.paypal').css('right','-21.8em');},2000);

		// window.onresize = function(e){ TimeTracker.resize(); };
	}
});

var TimeTracker = {
	// variable declarations
	startText : 'Start',
	stopText : 'Stop',
	saveInterval : 5, // seconds between saving
	saveToDBInterval : 15, // minutes between saving to db
	timeLastSavedToDB: 0,
	o : new Date(1970, 1, 1, 0, 0, 0, 0).valueOf(),
	// colors : ['3F5D7D','279B61','008AB8','993333','A3E496','95CAE4','CC3333','FFCC33','FFFF7A','CC6699','108070','D29F28','C19A6B','F1868E','872514','3B444B','4D5D53','5B92E5','738678','592720','123456','FFFFFF','000000'],
	colors : ['000000','FFFFFF','7777777','CCCCCC','CC1111','FFC7DD','661166','FFFF33','339933','CCFFCC','000077','CCCCFF'],
	// black, white, dark grey, light grey, red, pink, purple, yellow, dark green, light green, dark blue, light blue
	int : {total:1, start:1, end:1, duration:1}, // parameters to set as Integer
	timers : 0, // number of timers
	match_color : false,

	checkLocalStore : function(){
		try{ return 'localStorage' in window && window.localStorage !== null; } catch(e){ return false; }
	},

	loadOptions : function(){
		var options = localStorage['TimerOptions'] || '{}';
		options = JSON.parse(options);

		if(!localStorage['TimerOptions']){
			localStorage['TimerOptions'] = JSON.stringify(options);
		}

		// load css
		if(options.css){
			var href = $('#stylesheet').attr('href');
			if(options.css != href){
				$(function(){
					$('.go_dark').click();
				});
			}
		}

		// load default_analog
		if(options.default_analog){
			$("#default_analog").click().change();
		}

		// load splits
		// if(options.splits){
			// $('.show_splits').find('span').toggle();
			// $('.splits').slideToggle(600, function(){ TimeTracker.resize(); });
		// }

		// load color
		if(options.match_color){
			$('.match_color').find('span').toggle();
			TimeTracker.match_color = true;
		}
	},

	saveOption : function(param, value){
		var options = localStorage['TimerOptions'] || '{}';
		options = JSON.parse(options);
		options[param] = value;
		localStorage['TimerOptions'] = JSON.stringify(options);
	},

	saveToDB : function(){
		var db = {};
		var db_size = 0;
		for(var key in localStorage){
			if(key.indexOf('TimeTracker') === 0 || key == 'TimerOptions'){
				db_size++;
				db[key] = localStorage[key];
			}
		}
		if(db_size){
			db = {'t_data':db};
			// console.log(db);
			$.ajax({
				type: "POST",
				url: "update/",
				data: db,
				success: function(data){
					// console.log(data);
				},
				error: function(a,b){
					console.log(a,b);
				}
			});
		}
	},

	loadTimers : function(){
		var localTimers = [];
		var obj;

		// remove timers already on the page
		$('div.box').each(function(){
			if(!$(this).hasClass('hidden')){
				TimeTracker.remove($(this), true);
			}
		});

		// load timers from local storage
		for(var key in localStorage){
			if(key.indexOf('TimerOptions') !== 0){
				obj = JSON.parse(localStorage[key]);
				localTimers.push(obj);
				localStorage.removeItem(key);
			}
		}
		if(!localTimers.length){
			TimeTracker.createTimer();
		} else{
			localTimers.sort(function(a,b){
				var order = {
					first: {
						field: 'order',
						fnBefore: parseInt,
						reverse: true
					}
				};
				return fnSort(a,b,order);
			});
			for(i = 0, len = localTimers.length; i < len; i++){
				TimeTracker.createTimer(localTimers[i]);
			}
		}
		$box = $('div.box:last');
		TimeTracker.updateDisplay($box, true);
	},

	createTimer : function(obj){
		var hex = (obj) ? '#'+obj.color : ( TimeTracker.colors[Math.floor(Math.random()*TimeTracker.colors.length)] );
		var $box = $("<div data-num='"+(++TimeTracker.timers)+"'></div>");
		$('.boxes').prepend($box);

		var save = true;
		var template = $('.box.template').html().replace(/##/gi, TimeTracker.timers);

		$box.addClass('box').html(template).find('.front').css({'background-color':hex}).end().fadeIn(600);
		$box.find('.color').val(hex);

		if(typeof obj != 'object'){ save = false; }
		obj = TimeTracker.initObj(obj);

		for(var i in obj){
			if(i in TimeTracker.int) obj[i] = parseInt(obj[i],10);
		}
		$box.data('num', TimeTracker.timers);
		$box.data('key', obj.timer_key);

		$splits = $box.find('.splits').empty();
		for(i=0,ii=obj.splits.length; i<ii; i++){
			$('<li class="split-'+(i+1)+'"></li>').html(TimeTracker.formatSplit(obj.splits[i].start, obj.splits[i].duration, (i+1))).prependTo($splits).slideDown('fast');
		}
		$splits.find('li').removeClass('first last');
		$splits.find('li:first').addClass('first').end().find('li:last').addClass('last');

		$box.find('.front').removeClass('analog').addClass('digital');
		if(obj.analog){
			$box.find('.front').addClass('analog').removeClass('digital');
			$box.find('input[id^="analog"]').attr('checked','checked');
		}

		$box.find('input[name="cust"]').attr('value',obj.cust).val(obj.cust).select();
		$box.find('input[name="task"]').val(obj.task);
		$box.find('div.date').html(obj.date);
		if(obj.tracked){
			$box.find('.tracked input').attr('checked',true).end().addClass('show_tracked');
		}
		$box.find('input.timer').val(TimeTracker.formatTime(obj.total));
		$box.find('.hours span').text(TimeTracker.formatHours(obj.total));
		obj.running = false;
		$box.find('.color').css('background-color', '#'+obj.color);
		$box.find('.front').css({'background-color':'#'+obj.color, 'opacity':'1'});
		$box.find('input.color').val(obj.color);
		jscolor.init();
		start_clock(obj.total, TimeTracker.timers, obj.running);
		if(save || true){ localStorage[obj.timer_key] = JSON.stringify(obj); }
		TimeTracker.resize();
	},

	initObj : function(obj){
		var hex = (obj) ? '#'+obj.color : ( TimeTracker.colors[Math.floor(Math.random()*TimeTracker.colors.length)] );
		var today = new Date();
		var date = (today.getMonth()+1) + "/" + today.getDate()/* + "/" + today.getFullYear()*/;

		if(obj && obj.hasOwnProperty('date') && obj.date.split('/').length > 2){
			obj.date = obj.date.substring(0, obj.date.lastIndexOf('/'));
		}

		if(typeof obj != 'object'){ obj = {}; save = false; }
		if(!obj.hasOwnProperty('timer_key') || new Date(obj.timer_key) == 'Invalid Date'){
			var tmp = today.getTime();
			while(tmp == today.getTime()){
				today = new Date();
			}
			obj.timer_key = today.getTime();
		}
		if(!obj.hasOwnProperty('date')){ obj.date = date; }
		if(!obj.hasOwnProperty('running')){ obj.running = false; }
		if(!obj.hasOwnProperty('total')){ obj.total = 0; }
		if(!obj.hasOwnProperty('cust')){ obj.cust = ''; }
		if(!obj.hasOwnProperty('task')){ obj.task = ''; }
		if(!obj.hasOwnProperty('color')){ obj.color = hex; }
		if(!obj.hasOwnProperty('tracked')){ obj.tracked = false; }
		if(!obj.hasOwnProperty('order')){ obj.order = TimeTracker.timers; } // not complete - need to sort
		if(!obj.hasOwnProperty('splits')){ obj.splits = []; }
		if(!obj.hasOwnProperty('analog')){ obj.analog = $("#default_analog").is(':checked'); }
		return obj;
	},

	resize : function(){
		$('.boxes').shapeshift({minHeight:230, centerGrid: false});
		$('.boxes .box').each(function(i) {
			var key = $(this).data('key');
			var t = JSON.parse(localStorage[key]);
			t.order = i+1;
			localStorage[key] = JSON.stringify(t);
		});
	},

	removeCheck : function($box){
		$box.find('.removeCheck').show().on('click',function(){TimeTracker.remove($box,true);}).delay('1500').fadeOut();
	},

	remove : function($box, rem, loop){
		if(!rem){
			TimeTracker.removeCheck($box);
		}
		if(rem){
			var num = $box.data('num');
			var t = JSON.parse(localStorage['TimeTracker'+num]);
			if(t.running){ TimeTracker.startStop($box); }
			$box.remove();
			if(!loop){ TimeTracker.resize(); }
			if(num){
				localStorage.removeItem('TimeTracker'+num);
			}
			//display total time
			var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
			if(tmpTotal.total == tmpTotal.untracked){ $('.trackedTime, .untrackedTime').fadeOut(600); } else{ $('.trackedTime, .untrackedTime').fadeIn(600); }
			$('.totalTime .timer').text(tmpTotal.total);
			$('.trackedTime .timer').text(tmpTotal.tracked);
			$('.untrackedTime .timer').text(tmpTotal.untracked);
			document.title = tmpTotal.total.toString().slice(0,-3);
			var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
			if(tmpHours.total != $('.totalTime .totalHours').text()){ $('.totalTime .totalHours').text(tmpHours.total); }
			if(tmpHours.tracked != $('.trackedTime .totalHours').text()){ $('.trackedTime .totalHours').text(tmpHours.tracked); }
			if(tmpHours.untracked != $('.untrackedTime .totalHours').text()){ $('.untrackedTime .totalHours').text(tmpHours.untracked); }
		}
	},

	removeTrackedCheck : function(){
		$('header .removeCheck').show().on('click',function(){TimeTracker.removeTracked(true);}).delay('1500').fadeOut();
	},

	removeTracked : function(rem){
		if(rem){
			$('div.box').each(function(){
				$this = $(this);
				if(!$this.hasClass('hidden')){
					var key = $this.data('key');
					var t = JSON.parse(localStorage[key]);
					if(t.tracked){
						if(t.running){ TimeTracker.startStop($this); }
						TimeTracker.remove($this,true, true);
					}
				}
			});
			TimeTracker.resize();
			//display total time
			var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
			if(tmpTotal.total == tmpTotal.untracked){ $('.trackedTime, .untrackedTime').fadeOut(600); } else{ $('.trackedTime, .untrackedTime').fadeIn(600); }
			$('.totalTime .timer').text(tmpTotal.total);
			$('.trackedTime .timer').text(tmpTotal.tracked);
			$('.untrackedTime .timer').text(tmpTotal.untracked);
			document.title = tmpTotal.total.toString().slice(0,-3);
			var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
			if(tmpHours.total != $('.totalTime .totalHours').text()){ $('.totalTime .totalHours').text(tmpHours.total); }
			if(tmpHours.tracked != $('.trackedTime .totalHours').text()){ $('.trackedTime .totalHours').text(tmpHours.tracked); }
			if(tmpHours.untracked != $('.untrackedTime .totalHours').text()){ $('.untrackedTime .totalHours').text(tmpHours.untracked); }
		} else{
			TimeTracker.removeTrackedCheck();
		}
	},

	removeAllCheck : function(){
		$('.removeAll .removeCheck').show().on('click',function(){TimeTracker.removeAll(true);}).delay('1500').fadeOut();
	},

	removeAll : function(rem){
		if(rem){
			$('div.box').each(function(){
				$this = $(this);
				if(!$this.hasClass('hidden')){
					var key = $this.data('key');
					var t = JSON.parse(localStorage[key]);
					// if(t.tracked){
						if(t.running){ TimeTracker.startStop($this); }
						TimeTracker.remove($this,true, true);
					// }
				}
			});
			TimeTracker.resize();
			//display total time
			var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
			if(tmpTotal.total == tmpTotal.untracked){ $('.trackedTime, .untrackedTime').fadeOut(600); } else{ $('.trackedTime, .untrackedTime').fadeIn(600); }
			$('.totalTime .timer').text(tmpTotal.total);
			$('.trackedTime .timer').text(tmpTotal.tracked);
			$('.untrackedTime .timer').text(tmpTotal.untracked);
			document.title = tmpTotal.total.toString().slice(0,-3);
			var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
			if(tmpHours.total != $('.totalTime .totalHours').text()){ $('.totalTime .totalHours').text(tmpHours.total); }
			if(tmpHours.tracked != $('.trackedTime .totalHours').text()){ $('.trackedTime .totalHours').text(tmpHours.tracked); }
			if(tmpHours.untracked != $('.untrackedTime .totalHours').text()){ $('.untrackedTime .totalHours').text(tmpHours.untracked); }
		} else{
			TimeTracker.removeAllCheck();
		}
	},

	startStop : function($box) {
		var el = $box.data('num');
		var key = $box.data('key');
		var t = TimeTracker.initObj(JSON.parse(localStorage[key] || "{}"));
		var $start = $box.find('.start');
		var $timer = $box.find('.timer');
		var $splits = $box.find('.splits');
		var currentTime = new Date();
		var timeZoneOffset = currentTime.getTimezoneOffset() * 60000;
		var totalTime = 0;

		for(var i in t){
			if(i in TimeTracker.int) t[i] = parseInt(t[i],10);
		}

		$start.text( t.running ? TimeTracker.startText : TimeTracker.stopText );

		t.running = !t.running;

		if (!t.running) {
			clearInterval(t.interval);
			$box.removeClass('running');

			// last split updated each time timer is stopped
			t.splits[t.splits.length-1].end = currentTime.valueOf() - timeZoneOffset;
			t.splits[t.splits.length-1].duration = t.splits[t.splits.length-1].end - t.splits[t.splits.length-1].start;

			// set total time
			for(s=0,ss=t.splits.length; s<ss; s++){
				totalTime += parseInt(t.splits[s].duration,10);
			}
			t.total = totalTime;
			start_clock(t.total, el, t.running);

			TimeTracker.updateDisplay($box);

			$('li.split-'+t.splits.length, $box).html(TimeTracker.formatSplit(t.splits[t.splits.length-1].start, t.splits[t.splits.length-1].duration, t.splits.length));
		} else {
			$('.box.running .start').each(function() {
				$(this).click();
			});

			start_clock(t.total, el, t.running);

			$box.addClass('running');
			// new split created each time the timer is started
			t.splits.push({
				"date": (currentTime.getMonth()+1) + "/" + currentTime.getDate() + "/" + currentTime.getFullYear(),
				"start": currentTime.valueOf() - timeZoneOffset,
				"end": 0,
				"duration": 0
			});
			$('<li class="split-'+t.splits.length+'"></li>').html(TimeTracker.formatSplit(t.splits[t.splits.length-1].start, t.splits[t.splits.length-1].duration, t.splits.length)).prependTo($splits).slideDown('fast');
			$splits.find('li').removeClass('first last');
			$splits.find('li:first').addClass('first').end().find('li:last').addClass('last');

			t.interval = setInterval(function(){ TimeTracker.updateDisplay($box); }, 43);
		}
		localStorage[key] = JSON.stringify(t);
		return false;
	},

	updateDisplay : function($box, includeLastSplit){
		var key = $box.data('key');
		var t = JSON.parse(localStorage[key]);
		var $timer = $box.find('.timer');
		var $hours = $box.find('.hours span');
		var currentTime = new Date();
		var timeZoneOffset = currentTime.getTimezoneOffset() * 60000;
		var totalTime = 0;
		var splitTime = 0;
		var ss = t.splits.length-1;

		for(var i in t){
			if(i in TimeTracker.int) t[i] = parseInt(t[i],10);
		}

		for(s=0; s<ss; s++){
			totalTime += parseInt(t.splits[s].duration,10);
		}
		if (t.running) {
			splitTime += currentTime.valueOf() - timeZoneOffset - parseInt(t.splits[t.splits.length-1].start,10);
			$('li.split-'+t.splits.length, $box).html(TimeTracker.formatSplit(t.splits[t.splits.length-1].start, splitTime, t.splits.length));
		} else if(t.splits.length && includeLastSplit){
			splitTime += t.splits[t.splits.length-1].duration;
		}
		totalTime += parseInt(splitTime,10);

		// save if saveinterval
		if(totalTime - t.total > TimeTracker.saveInterval * 1000){
			t.total = totalTime;
			t.splits[t.splits.length-1].end = currentTime.valueOf() - timeZoneOffset;
			t.splits[t.splits.length-1].duration = splitTime;
			localStorage[key] = JSON.stringify(t);
		}
		if(includeLastSplit || totalTime - TimeTracker.timeLastSavedToDB > TimeTracker.saveToDBInterval * 60000){
			TimeTracker.timeLastSavedToDB = totalTime;
			TimeTracker.saveToDB();
		}

		// display timer time and hours
		$timer.val(TimeTracker.formatTime(totalTime));
		var oldHours = $hours.text();
		var newHours = TimeTracker.formatHours(totalTime);
		if(oldHours != newHours){ $hours.text(newHours); }

		//display total time
		var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
		if(tmpTotal.total == tmpTotal.untracked){ $('.trackedTime, .untrackedTime').fadeOut(600); } else{ $('.trackedTime, .untrackedTime').fadeIn(600); }
		$('.totalTime .timer').text(tmpTotal.total);
		$('.trackedTime .timer').text(tmpTotal.tracked);
		$('.untrackedTime .timer').text(tmpTotal.untracked);
		document.title = tmpTotal.total.toString().slice(0,-3);
		var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
		if(tmpHours.total != $('.totalTime .totalHours').text()){ $('.totalTime .totalHours').text(tmpHours.total); }
		if(tmpHours.tracked != $('.trackedTime .totalHours').text()){ $('.trackedTime .totalHours').text(tmpHours.tracked); }
		if(tmpHours.untracked != $('.untrackedTime .totalHours').text()){ $('.untrackedTime .totalHours').text(tmpHours.untracked); }
	},

	totalTime : function(){
		var time = { total: 0, tracked: 0, untracked: 0 };
		var currentTime = new Date();
		var timeZoneOffset = currentTime.getTimezoneOffset() * 60000;
		for(var key in localStorage){
			if(key.indexOf('TimeTracker') === 0){
				obj = JSON.parse(localStorage[key]);

				for(s=0, ss=obj.splits.length-1; s<ss; s++){
					if(obj.tracked){
						time.tracked += parseInt(obj.splits[s].duration,10);
					} else{
						time.untracked += parseInt(obj.splits[s].duration,10);
					}
					time.total += parseInt(obj.splits[s].duration,10);
				}
				if (obj.running) {
					if(obj.tracked){
						time.tracked += currentTime.valueOf() - timeZoneOffset - parseInt(obj.splits[obj.splits.length-1].start,10);
					} else{
						time.untracked += currentTime.valueOf() - timeZoneOffset - parseInt(obj.splits[obj.splits.length-1].start,10);
					}
					time.total += currentTime.valueOf() - timeZoneOffset - parseInt(obj.splits[obj.splits.length-1].start,10);
				} else if(obj.splits.length){
					if(obj.tracked){
						time.tracked += obj.splits[obj.splits.length-1].duration;
					} else{
						time.untracked += obj.splits[obj.splits.length-1].duration;
					}
					time.total += obj.splits[obj.splits.length-1].duration;
				}
			}
		}
		return time;
	},

	formatSplit : function(start, duration, num){
		var end = start + duration;
		return '<span>' +
			num +
			'</span> ' +
			'<div class="elapsed">Total Minutes: <input name="split" type="text" value="' +
			parseFloat(duration / 60000).toFixed(3) +
			'"><span> Save </span></div><div class="splitTime">' +
			TimeTracker.formatTime(duration).toString().slice(0,-3) +
			'&nbsp;&nbsp;|&nbsp;&nbsp;' +
			TimeTracker.formatTime(start).toString().slice(0,-3) +
			' - ' +
			TimeTracker.formatTime(end).toString().slice(0,-3) +
			'</div>';
	},

	formatTime : function(ms) {
		var d, x;
		if(typeof ms == 'object'){
			for(var o in ms){
				d = new Date(ms[o] + parseInt(TimeTracker.o,10)).toString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
				x = String(ms[o] % 1000);
				while (x.length < 3) { x = '0' + x; }
				d += '.' + x;
				ms[o] = d.substr(0, d.length - 1);
			}
			return ms;
		}
		d = new Date(ms + parseInt(TimeTracker.o,10)).toString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
		x = String(ms % 1000);
		while (x.length < 3) { x = '0' + x; }
		d += '.' + x;
		return d.substr(0, d.length - 1);
	},

	formatHours : function(ms){
		var h;
		if(typeof ms == 'object'){
			for(var o in ms){
				h = ms[o] / (1000 * 60 * 60);
				ms[o] = h.toFixed(2);
			}
			return ms;
		}
		h = ms / (1000 * 60 * 60);
		return h.toFixed(2);
	},

	stopAll : function(){
		$('div.box').each(function(){
			$this = $(this);
			if(!$this.hasClass('hidden')){
					key = $this.data('key'),
					t = JSON.parse(localStorage[key]);
				if(t.running) TimeTracker.startStop($this);
			}
		});
	},

	track : function($box){
		var key = $box.data('key');
		var t = JSON.parse(localStorage[key]);

		if($box.find('.tracked input').is(':checked')){
			t.tracked = true;
			$box.addClass('show_tracked');
		} else{
			t.tracked = false;
			$box.removeClass('show_tracked');
		}
		localStorage[key] = JSON.stringify(t);
	},

	endTimeTracker : true
};

var fnToLowerCase = function(val){ return val.toLowerCase().trim(); };
var fnReturnVal = function(val){ return val; };
function fnSort(a,b,order){
	var checkNaN;
	for(var o in order){
		checkNaN = (order[o].hasOwnProperty('checkNaN')) ? order[o].checkNaN : true;
		order[o].fnBefore = order[o].fnBefore || fnReturnVal;
		if(order[o].fnBefore == 'toLowerCase'){ order[o].fnBefore = fnToLowerCase; }
		if(order[o].fnBefore == fnToLowerCase ){ checkNaN = false; }
		if( !a.hasOwnProperty(order[o].field) && !b.hasOwnProperty(order[o].field) ) return 0;
		if( !a.hasOwnProperty(order[o].field) || ( checkNaN && isNaN(order[o].fnBefore(a[order[o].field])) ) ) return 1;
		if( !b.hasOwnProperty(order[o].field) || ( checkNaN && isNaN(order[o].fnBefore(b[order[o].field])) ) ) return -1;
		if( order[o].fnBefore(a[order[o].field]) < order[o].fnBefore(b[order[o].field]) ) return ((order[o].reverse.toString() == 'true') ? 1 : -1);
		if( order[o].fnBefore(a[order[o].field]) > order[o].fnBefore(b[order[o].field]) ) return ((order[o].reverse.toString() == 'true') ? -1 : 1);
	}
	return 0;
}
