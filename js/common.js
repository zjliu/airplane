function eRandom(m,n,isInt){
	var max = Math.max(m,n);
	var min = Math.min(m,n);
	var result = min + (max-min)*Math.random();
	return isInt ? Math.round(result) : result;
}

function randomColor(){
	return "rgba(" + [eRandom(0,255,true),eRandom(0,255,true),eRandom(0,255,true),Math.random().toFixed(2)] +")"
}

function randomAngle(){
	return eRandom(-Math.PI,Math.PI);
}

function randomStar(boundaryX,boundaryY,minRadius,maxRadius,speed){
	this.r = eRandom(minRadius,maxRadius,true);
	this.x = eRandom(this.r,boundaryX,true);
	this.y = eRandom(this.r,boundaryY,true);
	this.color = randomColor();
	this.angle = randomAngle();
	this.speed = speed || 0.05;
	this.draw = function(context){
		context.save();
		context.fillStyle = this.color;
		var angle = Math.PI*2/5;
		context.beginPath();
		var point0 = getPointPosition(this.angle,this);
		context.moveTo(point0.x,point0.y);
		var indexArray = [0,2,4,1,3];
		for(var i=1,l=indexArray.length;i<l;i++){
			var position = getPointPosition(this.angle+angle*indexArray[i],this);
			context.lineTo(position.x,position.y);
		}
		context.moveTo(point0.x,point0.y);
		context.closePath();
		context.fill();
		context.restore();
		return this;
	}
	this.changeColor=function(){
		var array = this.color.split(',');
		var A = parseFloat(array[3]);
		this.colorDir = this.colorDir || 1;	
		A=A>1?1.00:A;
		A=A<0?0.00:A;
		if(this.colorDir === 1){
			if(A===1.00){
				this.colorDir = -1;
			}
			else{
				A = A + this.speed;
			}
		}
		else{
			if(A===0.00){
				this.colorDir = 1;
			}
			else{
				A = A - this.speed;
			}
		}
		array[3] = A.toFixed(2)+")";
		this.color = array.toString();
	}

	this.move = function(speed){
		if(this.y>boundaryY){
			this.y = 0;
		}
		else{
			this.y+=speed;
		}
	}

	function getPointPosition(angle,star){
		return {"x":star.x+Math.cos(angle)*star.r,"y":star.y+Math.sin(angle)*star.r};
	}
}
window.requestNextAnimationFrame =
	(function () {
		var originalWebkitRequestAnimationFrame = undefined,
		wrapper = undefined,
		callback = undefined,
		geckoVersion = 0,
		userAgent = navigator.userAgent,
		index = 0,
		self = this;
		// Workaround for Chrome 10 bug where Chrome
		// does not pass the time to the animation function
		if (window.webkitRequestAnimationFrame) {
			 // Define the wrapper
			 wrapper = function (time) {
				if (time === undefined) {
					time = +new Date();
				}
				self.callback(time);
			};

			// Make the switch
			originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;    
			window.webkitRequestAnimationFrame = function (callback, element) {
				self.callback = callback;
				// Browser calls the wrapper and wrapper calls the callback
				 originalWebkitRequestAnimationFrame(wrapper, element);
			}
		}

		// Workaround for Gecko 2.0, which has a bug in
		// mozRequestAnimationFrame() that restricts animations
		// to 30-40 fps.

		if (window.mozRequestAnimationFrame) {
			// Check the Gecko version. Gecko is used by browsers
			// other than Firefox. Gecko 2.0 corresponds to
			// Firefox 4.0.
			index = userAgent.indexOf('rv:');

			if (userAgent.indexOf('Gecko') != -1) {
				geckoVersion = userAgent.substr(index + 3, 3);
				if (geckoVersion === '2.0') {
					// Forces the return statement to fall through
					// to the setTimeout() function.
					window.mozRequestAnimationFrame = undefined;
				}
			}
		}

		return window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function (callback, element) {
				var start,
				finish;
				window.setTimeout( function () {
					start = +new Date();
					callback(start);
					finish = +new Date();
					self.timeout = 1000 / 60 - (finish - start);
			}, self.timeout);
		};
	})
();
