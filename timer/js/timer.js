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
var debug = true;
// timer only runs if local storage is available
$(function() {
	if(TimeTracker.checkLocalStore()){
		$('body').css('margin-top', ($('.infoBar').height()+44) );
		$start = $('div.box:first').find('.start');
		TimeTracker.startText = $start.text() || TimeTracker.startText;
		TimeTracker.stopText = $start.attr('alternate') || TimeTracker.stopText;

		// load stored timers or create new one if no timers are stored
		TimeTracker.loadTimers();

		$("div.more").on('click', function(){ TimeTracker.createTimer(); });
		$(".stopAll").on('click', function(){ TimeTracker.stopAll(); });
		$(".removeTracked").on('click', function(){ TimeTracker.removeTracked(); });

		$('body').on('click', '.start', function(e){ e.preventDefault(); TimeTracker.startStop($(this).closest('.box')); });
		$('body').on('change', '.color', function(){ $this = $(this); $box = $this.closest('.box'); if(!$box.find('input[name="tracked"]').is(':checked')){ $box.css('background-color', '#'+$this.val()); } });
		$('body').on('click', '.remove', function(){ TimeTracker.remove($(this).closest('.box')); });
		$('body').on('click', '.tracked input', function(){ TimeTracker.track($(this).closest('.box')); });
		$('body').on('change', 'input', function(){
			var $this = $(this);
			var $box = $this.closest('.box');
			var num = $box.data('num') || (++TimeTracker.timers);
			var t = JSON.parse(localStorage['TimeTracker'+num] || "{}");
			if($this.attr('name') == 'tracked'){
				t[$this.attr('name')] = $this.is(':checked');
			} else if($this.attr('name') == 'split'){
				var s = parseInt($this.closest('li').find('span').text(),10)-1;
				t.splits[s].duration = $this.val() * 60000;
				t.splits[s].end = t.splits[s].start + t.splits[s].duration;
				console.log($('li.split-'+(s+1), $box));
				$('li.split-'+(s+1), $box).html(TimeTracker.formatSplit(t.splits[s].start, t.splits[s].duration, s+1));
			} else{
				t[$this.attr('name')] = $this.val();
			}
			localStorage['TimeTracker'+num] = JSON.stringify(t);
			TimeTracker.updateDisplay($box,true);
		});

		$('body').on('click',' .splits span', function(){
			$(this).closest('li').find('.elapsed').toggle();
		});

		window.onresize = function(e){ TimeTracker.resize(); };
	}

	// register
	$('body').on('click', '.register-link', function(e){
		e.preventDefault();
		$('.login iframe').attr('src', 'login/register.php');
		$(this).fadeOut(function(){
			$('.login-link').fadeIn();
		});
		return false;
	});
	$('body').on('click', '.login-link', function(e){
		e.preventDefault();
		$('.login iframe').attr('src', 'login/');
		$(this).fadeOut(function(){
			$('.register-link').fadeIn();
		});
		return false;
	});
});

var TimeTracker = {
	// variable declarations
	startText : 'Start',
	stopText : 'Stop',
	saveInterval : 5, // seconds between saving
	o : new Date(1970, 1, 1, 0, 0, 0, 0).valueOf(),
	colors : ['3F5D7D','279B61','008AB8','993333','A3E496','95CAE4','CC3333','FFCC33','FFFF7A','CC6699','108070','D29F28','C19A6B','F1868E','872514','3B444B','4D5D53','5B92E5','738678','592720','123456','FFFFFF','000000'],
	colorTracked : 'AAAABB',
	int : {total:1, start:1, end:1, duration:1}, // parameters to set as Integer
	timers : 0, // number of timers

	checkLocalStore : function(){
		try{ return 'localStorage' in window && window.localStorage !== null; } catch(e){ return false; }
	},

	loadTimers : function(){
		var localTimers = false;
		var obj;

		// remove timers already on the page
		$('div.box').each(function(){
			if(!$(this).hasClass('hidden')){
				TimeTracker.remove($(this), true);
			}
		});

		// load timers from local storage
		for(var key in localStorage){
			if(key.indexOf('TimeTracker') === 0){
				obj = JSON.parse(localStorage[key]);
				localStorage.removeItem(key);
				TimeTracker.createTimer(obj);
				localTimers = true;
			}
		}
		if(!localTimers){
			TimeTracker.createTimer();
		}
		$box = $('div.box:last');
		TimeTracker.updateDisplay($box, true);
	},

	createTimer : function(obj){
		var hex = (obj) ? '#'+obj.color : ( TimeTracker.colors[Math.floor(Math.random()*TimeTracker.colors.length)] );
		var $more = $(".more").before("<div data-num='"+(++TimeTracker.timers)+"'></div>");
		var $box = $more.prev().hide();
		var save = true;

		$box.addClass('box').html($('div.box:first').html()).css('background-color',hex).fadeIn();
		$box.find('.color').val(hex);

		if(typeof obj != 'object'){ save = false; }
		obj = TimeTracker.initObj(obj);

		for(var i in obj){
			if(i in TimeTracker.int) obj[i] = parseInt(obj[i],10);
		}
		$box.data('num', TimeTracker.timers);

		$splits = $box.find('.splits').empty();
		for(i=0,ii=obj.splits.length; i<ii; i++){
			$('<li class="split-'+(i+1)+'"></li>').html(TimeTracker.formatSplit(obj.splits[i].start, obj.splits[i].duration, (i+1))).prependTo($splits.show()).slideDown('fast');
		}
		$splits.find('li').removeClass('first last');
		$splits.find('li:first').addClass('first').end().find('li:last').addClass('last');

		$box.find('input[name="cust"]').val(obj.cust).select();
		$box.find('input[name="task"]').val(obj.task);
		$box.find('div.date').html(obj.date);
		if(obj.tracked){
			$box.find('.tracked input').attr('checked',true);
		}
		$box.find('input.timer').val(TimeTracker.formatTime(obj.total));
		$box.find('.hours span').text(TimeTracker.formatHours(obj.total));
		obj.running = false;
		$box.find('.color').css('background-color', '#'+obj.color);
		$box.css('background-color', '#'+((obj.tracked) ? TimeTracker.colorTracked : obj.color));
		$box.find('input.color').val(obj.color);
		jscolor.init();
		if(save || true){ localStorage['TimeTracker'+TimeTracker.timers] = JSON.stringify(obj); }
		TimeTracker.resize();
	},

	initObj : function(obj){
		var hex = (obj) ? '#'+obj.color : ( TimeTracker.colors[Math.floor(Math.random()*TimeTracker.colors.length)] );
		var today = new Date();
		var date = (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear();

		if(typeof obj != 'object'){ obj = {}; save = false; }
		if(!obj.hasOwnProperty('date')){ obj.date = date; }
		if(!obj.hasOwnProperty('running')){ obj.running = false; }
		if(!obj.hasOwnProperty('total')){ obj.total = 0; }
		if(!obj.hasOwnProperty('cust')){ obj.cust = ''; }
		if(!obj.hasOwnProperty('task')){ obj.task = ''; }
		if(!obj.hasOwnProperty('color')){ obj.color = hex; }
		if(!obj.hasOwnProperty('tracked')){ obj.tracked = false; }
		if(!obj.hasOwnProperty('order')){ obj.order = TimeTracker.timers; } // not complete - need to sort
		if(!obj.hasOwnProperty('splits')){ obj.splits = []; }
		return obj;
	},

	resize : function(){
		var cur = 0;
		var prev = 0;

		$('body').css('margin-top', ($('.infoBar').height()+44) );
		$('.newline').removeClass('newline');
		$('.box').each(function(i, el){
			$el = $(this);
			if(!prev){
				prev = $el.offset();
				return true;
			}
			cur = $el.offset();
			if(parseInt(cur.top,10) > parseInt(prev.top,10)){
				$el.addClass('newline');
				cur = $el.offset();
			}
			prev = cur;
		});
	},

	removeCheck : function($box){
		$box.find('.removeCheck').show().on('click',function(){TimeTracker.remove($box,true);}).delay('1500').fadeOut();
	},

	remove : function($box, rem){
		if(!rem){
			TimeTracker.removeCheck($box);
		}
		if(rem){
			var num = $box.data('num');
			var t = JSON.parse(localStorage['TimeTracker'+num]);
			if(t.running){ TimeTracker.startStop($box); }
			$box.fadeOut(600,function(){
				$(this).remove();
				TimeTracker.resize();
				if(num){
					localStorage.removeItem('TimeTracker'+num);
				}
				//display total time
				var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
				$('.totalTime').text(tmpTotal);
				document.title = tmpTotal.toString().slice(0,-3);
				var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
				if(tmpHours != $('.totalHours').text()){ $('.totalHours').text(tmpHours); }
			});
		}
	},

	startStop : function($box) {
		var el = $box.data('num');
		var t = TimeTracker.initObj(JSON.parse(localStorage['TimeTracker'+el] || "{}"));
		var $start = $box.find('.start');
		// var curText = $start.text();
		// var altText = $start.attr('alternate');
		var $timer = $box.find('.timer');
		var $splits = $box.find('.splits');
		var currentTime = new Date();
		var timeZoneOffset = currentTime.getTimezoneOffset() * 60000;
		var totalTime = 0;

		for(var i in t){
			if(i in TimeTracker.int) t[i] = parseInt(t[i],10);
		}

		$start.text( t.running ? TimeTracker.startText : TimeTracker.stopText );
		// $start.attr('alternate', curText);

		t.running = !t.running;

		if (!t.running) {
			clearInterval(t.interval);

			// last split updated each time timer is stopped
			t.splits[t.splits.length-1].end = currentTime.valueOf() - timeZoneOffset;
			t.splits[t.splits.length-1].duration = t.splits[t.splits.length-1].end - t.splits[t.splits.length-1].start;

			// set total time
			for(s=0,ss=t.splits.length; s<ss; s++){
				totalTime += parseInt(t.splits[s].duration,10);
			}
			t.total = totalTime;
			TimeTracker.updateDisplay($box);

			$('li.split-'+t.splits.length, $box).html(TimeTracker.formatSplit(t.splits[t.splits.length-1].start, t.splits[t.splits.length-1].duration, t.splits.length));
		} else {
			// new split created each time the timer is started
			t.splits.push({
				"date": (currentTime.getMonth()+1) + "/" + currentTime.getDate() + "/" + currentTime.getFullYear(),
				"start": currentTime.valueOf() - timeZoneOffset,
				"end": 0,
				"duration": 0
			});
			$splits.show();
			$('<li class="split-'+t.splits.length+'"></li>').html(TimeTracker.formatSplit(t.splits[t.splits.length-1].start, t.splits[t.splits.length-1].duration, t.splits.length)).prependTo($splits).slideDown('fast');
			$splits.find('li').removeClass('first last');
			$splits.find('li:first').addClass('first').end().find('li:last').addClass('last');

			t.interval = setInterval(function(){ TimeTracker.updateDisplay($box); }, 43);
		}
		localStorage['TimeTracker'+el] = JSON.stringify(t);
		return false;
	},

	updateDisplay : function($box, includeLastSplit){
		var el = $box.data('num');
		var t = JSON.parse(localStorage['TimeTracker'+el]);
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
			localStorage['TimeTracker'+el] = JSON.stringify(t);
		}

		// display timer time and hours
		$timer.val(TimeTracker.formatTime(totalTime));
		var oldHours = $hours.text();
		var newHours = TimeTracker.formatHours(totalTime);
		if(oldHours != newHours){ $hours.text(newHours); }

		//display total time
		var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
		$('.totalTime').text(tmpTotal);
		document.title = tmpTotal.toString().slice(0,-3);
		var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
		if(tmpHours != $('.totalHours').text()){ $('.totalHours').text(tmpHours); }
	},

	totalTime : function(){
		var totalTime = 0;
		var currentTime = new Date();
		var timeZoneOffset = currentTime.getTimezoneOffset() * 60000;
		for(var key in localStorage){
			if(key.indexOf('TimeTracker') === 0){
				obj = JSON.parse(localStorage[key]);
				for(s=0, ss=obj.splits.length-1; s<ss; s++){
					totalTime += parseInt(obj.splits[s].duration,10);
				}
				if (obj.running) {
					totalTime += currentTime.valueOf() - timeZoneOffset - parseInt(obj.splits[obj.splits.length-1].start,10);
				} else if(obj.splits.length){
					totalTime += obj.splits[obj.splits.length-1].duration;
				}
			}
		}
		return totalTime;
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
		var d = new Date(ms + parseInt(TimeTracker.o,10)).toString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
		var x = String(ms % 1000);
		while (x.length < 3) { x = '0' + x; }
		d += '.' + x;
		return d.substr(0, d.length - 1);
	},

	formatHours : function(ms){
		var h = ms / (1000 * 60 * 60);
		return h.toFixed(2);
	},

	stopAll : function(){
		$('div.box').each(function(){
			$this = $(this);
			if(!$this.hasClass('hidden')){
				var el = $this.data('num'),
					t = JSON.parse(localStorage['TimeTracker'+el]);
				if(t.running) TimeTracker.startStop($this);
			}
		});
	},

	track : function($box){
		var ele = $box.data('num');
		var t = JSON.parse(localStorage['TimeTracker'+ele]);

		if($box.find('.tracked input').is(':checked')){
			t.tracked = true;
			$box.css('background-color', '#'+TimeTracker.colorTracked);
		} else{
			t.tracked = false;
			$box.css('background-color', '#'+$box.find('input.color').val());
		}
		localStorage['TimeTracker'+ele] = JSON.stringify(t);
	},

	removeTrackedCheck : function(){
		$('.infoBar .removeCheck').show().on('click',function(){TimeTracker.removeTracked(true);}).delay('1500').fadeOut();
	},

	removeTracked : function(rem){
		if(rem){
			$('div.box').each(function(){
				$this = $(this);
				if(!$this.hasClass('hidden')){
					var el = $this.data('num');
					var t = JSON.parse(localStorage['TimeTracker'+el]);
					if(t.tracked){
						if(t.running){ TimeTracker.startStop($this); }
						TimeTracker.remove($this,true);
					}
				}
			});
			//display total time
			var tmpTotal = TimeTracker.formatTime(TimeTracker.totalTime());
			$('.totalTime').text(tmpTotal);
			document.title = tmpTotal.toString().slice(0,-3);
			var tmpHours = TimeTracker.formatHours(TimeTracker.totalTime());
			if(tmpHours != $('.totalHours').text()){ $('.totalHours').text(tmpHours); }
		} else{
			TimeTracker.removeTrackedCheck();
		}
	},

	endTimeTracker : true
};

