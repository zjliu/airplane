var jAir = (function () {
    var direction = { left: 37, right: 39, up: 38, down: 40 };
    var position = function (x, y) {
        this.x = x;
        this.y = y;
    }
    var Air = function (x, y, w, h, speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.draw = function (context, bgCanvas) {
            context.drawImage(bgCanvas, this.x, this.y, this.w, this.h, this.position.x, this.position.y, this.w, this.h);
        }
    }
    var Bulet = function (x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.direction = direction;
    }
    var JunAir = function (option) {
        this.bg = option.bg;
        this.canvas = option.canvas;
        this.context = this.canvas.getContext("2d");
        this.W = this.canvas.width;
        this.H = this.canvas.height;

        //子弹声音
        this.bulletMp3 = option.bulletMp3;

        //子弹速度
        this.bulletSpeed = option.bulletSpeed || 200;
        this.autoShoot = option.autoShoot || true;

        //air 移动速度
        this.airSpeed = option.airSpeed || 150;
        //air 是否自动射击	
        this.autoShoot = option.autoShoot || true;
		//star 是否加星星背景
		this.showStar = option.showStar===undefined ? false : option.showStar;
        //星星下落速度
        this.starSpeed = option.starSpeed || 60;

        //开始游戏按钮
        this.startBtn = option.startBtn;
        //结束游戏按钮
        this.endBtn = option.endBtn;

        this.air = new Air(255, 215, 50, 60);
        this.commonAir = new Air(112, 125, 50, 60);
        this.goldAir = new Air(225, 125, 50, 60);
        this.bullet = new Air(275, 129, 10, 17);

        this.airData = {};

        this.isGameRun = false;
		this.commonAirRun = false;
		
		//得分
        this.score = 0;
		//轰炸机速度
        this.commonAirSpeed = 150;
		//射击时间间隔
		this.shootInterval = 750;
		//游戏帧率
		this.maxfps = 10;
		this.fps = 10; 
		
		this.orgLife = 3;
		this.life = this.orgLife;

        this.init();
    }
    JunAir.prototype = {
        init: function () {
            self = this;
            var bgImg = document.createElement("img");
            bgImg.onload = function () {
                var bgCanvas = document.createElement("canvas");
                bgCanvas.width = bgImg.width;
                bgCanvas.height = bgImg.height;
                var bgContext = bgCanvas.getContext("2d");
                bgContext.drawImage(bgImg, 0, 0);
                self.bgCanvas = bgCanvas;
                self.bgContext = bgContext;
                self.begin();
            }
            bgImg.src = self.bg;
        },
		begin: function () {
			var self=this;
			self.initData();
            self.bindEvent();
			function loop(time){
				var now = (+new Date());
				self.lastFpsTime = self.lastFpsTime || now;
				var fps = 1000 / Math.round(now - self.lastFpsTime);
				if(fps <= self.maxfps || !fps){
					this.fps = fps;
					self.draw();
					self.updateCanvas();
					self.lastFpsTime = now; 
				}
				self.requestId = requestAnimationFrame(loop);
			}
			self.requestId = requestAnimationFrame(loop);
        },
		initData: function () {
            //init air
            var position = { x: (self.W - self.air.w) / 2, y: self.H - self.air.h };
            var air = new Air(this.air.x, this.air.y, this.air.w, this.air.h);
            air.position = position;
            this.airData.air = air;

            //init commonAir
            var commonAirs = this.airData.commonAir = [];
            var sp = 5;
            var top = 50;
            var airWidth = this.commonAir.w;
            var airHeight = this.commonAir.h;
            var rowCount = 3;
            for (var j = 0; j < rowCount; j++) {
                var maxCount = Math.floor(this.W / (airWidth + sp)) - (rowCount - j);
                var marginLeft = (this.W - (maxCount * (airWidth + sp) - sp)) / 2;
                for (var i = 0; i < maxCount; i++) {
					var speed = eRandom(this.commonAirSpeed-50,this.commonAirSpeed + 50);
                    var newCommonAir = new Air(this.commonAir.x, this.commonAir.y, this.commonAir.w, this.commonAir.h, speed);
                    var left = i === 0 ? marginLeft : (marginLeft + sp);
                    newCommonAir.position = { x: (airWidth + sp) * i + left, y: top + j * (airHeight + sp) };
                    commonAirs.push(newCommonAir);
                }
            }
			this.maxCommonAirLength = commonAirs.length;

            this.airData.bullets = [];

            //init star
			this.airData.stars = [];
			if(self.showStar){
				for (var i = 0; i < 100; i++) {
					this.airData.stars.push(new randomStar(this.W, this.H, 5, 10, 0.05));
				}
			}
        },
		draw: function () {
            var airData = this.airData;
            var context = this.context;
            var bgCanvas = this.bgCanvas;
            //clear canvas
            this.clearCanvas();

            //draw score
            this.drawScoreAndLife();

            //Star
            var stars = airData.stars;
            for (var i = 0, l = stars.length; i < l; i++) {
				stars[i].draw(context);
            }

            //draw air
            airData.air.draw(context, bgCanvas);

            //draw common air
            for (var i = 0, commonAir = airData.commonAir, l = commonAir.length; i < l; i++) {
                commonAir[i].draw(context, bgCanvas);
            }

            //draw Bullets
            var bullets = airData.bullets;
            for (var i = 0, l = bullets.length; i < l; i++) {
                bullets[i].draw(context, bgCanvas);
            }
        },
		updateCanvas:function(){
			//star
			var stars =this.airData.stars;
            for (var i = 0, l = stars.length; i < l; i++) {
				var star = stars[i];
                star.move(this.starSpeed/this.fps);
                star.changeColor();
            }
			
			if(!this.isGameRun) return;

			//air
			if (this.keyObj) {
                for (key in this.keyObj) {
					var type = this.keyObj[key].type;
					this.dealKeyEvent(type);
                }
            }

			if(!this.commonAirRun) return;
			//commonAir
			this.commonAirDataChange();

			//Bullets
			this.bulletMove();
		},
		drawScoreAndLife: function () {
            var context = this.context;
            context.save();
            context.font = "30px Verdana";
            var gradient = context.createLinearGradient(100, 0, 100, 50);
            gradient.addColorStop("0", "magenta");
            gradient.addColorStop("0.5", "blue");
            gradient.addColorStop("1.0", "red");
            context.fillStyle = gradient;
            context.fillText("score: " + this.score, 10, 30);
			context.fillText("life: "+ this.life,this.W-125,30);
            context.restore();
        },
		commonAirDataChange:function(){	
			var maxLength = this.maxCommonAirLength;
			var commonAirs = this.airData.commonAir;
			var length = commonAirs.length;
			if(length<=0) return;
			var airs = [];
			var first = commonAirs[0];
				first.index=0;
			var last = commonAirs[length-1];
				if(last) last.index = length -1;
			var mid = commonAirs[Math.round((length-1)/2)];
				if(mid) mid.index = Math.round((length-1)/2); 
				
			airs.push(first);
			if(length<=maxLength/3 && length>=3){
				airs.push(mid);
				airs.push(last);
			}
			if(length<=maxLength/2 && length>=2){
				airs.push(last);
			}	
			for(var i=0;i<airs.length;i++){
				this.commonAirChange(airs[i]);	
			}
		},
		commonAirChange:function(commonAir){
			if(!commonAir) return;
            var air = self.airData.air;
            var cp = commonAir.position;
            var ap = air.position;
            if (Math.abs(cp.x - ap.x) <= Math.min(commonAir.w,air.w)/2 && Math.abs(cp.y - ap.y) <= commonAir.h/2) {
                self.airData.commonAir.splice(commonAir.index, 1);
				this.life--;
				if(this.life ===0){
					self.gameEnd();
				}
                return;
            }
            if (self.H - cp.y <= air.h) {
                self.airData.commonAir.splice(commonAir.index, 1);
            } else {
                var moveTan = (cp.y - ap.y) / (cp.x - ap.x);
                var angle = Math.atan(moveTan);
                var dir = cp.x > ap.x ? -1 : 1;
                var xp = dir * Math.abs(Math.cos(angle) * (commonAir.speed/self.fps));
                var yp = Math.abs(Math.sin(angle) * (commonAir.speed/self.fps));
                yp = yp <= 1 ? 1 : yp;
                cp.x = cp.x + xp;
                cp.y = cp.y + yp;
            }
		},
		bulletMove: function () {
            for (var i = 0, bullets = this.airData.bullets; i < bullets.length; i++) {
                var bullet = bullets[i];
                bullet.position.y -= (this.bulletSpeed/this.fps);
                if (bullet.position.y < 0 || this.collision(bullet)) {
                    bullets.splice(i, 1);
                    continue;
                }
            }
        },
		collision: function (bullet, index) {
            for (var i = 0, commonAir = this.airData.commonAir; i < commonAir.length; i++) {
                var air = commonAir[i];
                var bPosition = bullet.position;
                var aPosition = air.position;
                if (bPosition.x >= aPosition.x && bPosition.x < aPosition.x + air.w && bPosition.y >= aPosition.y && bPosition.y <= aPosition.y + air.h - 2) {
                    commonAir.splice(i, 1);
                    this.score += 50;
                    return true;
                }
            }
        },
        bindEvent: function () {
            var self = this;
            document.addEventListener("keydown", function (e) {
                if (e.keyCode < 36 || e.keyCode > 41) return;
                if (!self.isGameRun) return;
                self.keyObj = self.keyObj || {};
                var type = self.getDirectionByKeyCode(e.keyCode);
				if(type ==="up" && !self.commonAirRun) return;
                self.keyObj[e.keyCode] = { "type": type };
            }, false);

            document.addEventListener("keyup", function (e) {
                if (e.keyCode < 36 || e.keyCode > 41) return;
                if (self.keyObj) {
                    delete self.keyObj[e.keyCode];
                }
            }, false);

            if (self.startBtn) {
                self.startBtn.addEventListener("click", function (e) {
                    self.startBtn.parentNode.style.display = "none";
                    self.gameStart();
                });
            }

            if (self.endBtn) {
                self.endBtn.addEventListener("click", function (e) {
                    self.gameReStart();
                });
            }

            self.canvas.addEventListener("contextmenu", function (e) {
                e.preventDefault();
            });
        },
		dealKeyEvent: function (type) {
            var speed = (this.airSpeed/this.fps);
            var position = this.airData.air.position;
            switch (type) {
                case "left":
                    if (position.x >= speed)
                        this.airMoveLeft();
                    break;
                case "right":
                    if (position.x <= this.W - this.air.w - speed)
                        this.airMoveRight();
                    break;
                case "up":
                    this.shoot();
                    break;
            }
        },
        shoot: function () {
            var air = this.airData.air;
            var bullets = this.airData.bullets;
            this.lastShortTime = self.lastShortTime || 0;
            var currentValue = Date.now();
            var value = currentValue - this.lastShortTime;
            if (value <= this.shootInterval) {
                return false;
            } else {
                this.lastShortTime = currentValue;
            }
            var bullet = this.bullet;
            var newBullet = new Air(bullet.x, bullet.y, bullet.w, bullet.h);
            newBullet.position = { x: air.position.x + 20, y: air.position.y };
            bullets.push(newBullet);
            if (this.bulletMp3) {
                this.bulletMp3.play();
            }
        },
        airMove: function (type) {
            this.airData.air.position.x += type * (this.airSpeed/this.fps);
        },
        airMoveLeft: function () {
            this.airMove(-1);
        },
        airMoveRight: function () {
            this.airMove(1);
        },
        resetGame: function () {
            this.airData = {};
            this.isGameRun = false;
			this.commonAirRun = false;
            this.score = 0;
			this.life = this.orgLife;
        },
        gameStart: function () {
			var self=this;
            this.isGameRun = true;
			setTimeout(function(){
				self.commonAirRun = true;
			},2000);
        },
        gameEnd: function () {
            this.isGameRun = false;
			this.commonAirRun = false;
            self.startBtn.parentNode.style.display = "none";
            var endDiv = self.endBtn.parentNode;
            endDiv.style.display = "block";
            endDiv.querySelector(".score").innerText = this.score;
        },
        gameReStart: function () {
            self.endBtn.parentNode.style.display = "none";
            this.resetGame();
            this.begin();
            this.gameStart();
        },
        getDirectionByKeyCode: function (keyCode) {
            for (key in direction) {
                if (direction[key] === keyCode) {
                    return key;
                }
            }
        },
        clearCanvas: function () {
            this.context.clearRect(0, 0, this.W, this.H);
        },
        getFPS: function () {
            var now = (+new Date());
            if (!this.lastFpsTime) {
                this.lastFpsTime = now;
                return 0;
            }
            var fps = 1000 / (now - this.lastFpsTime);
            return fps;
        }
    }
    return JunAir;
})();
