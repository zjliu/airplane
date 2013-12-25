window.onload=function(){
	var airDiv = document.getElementById("airDiv");
	var canvas = airDiv.querySelector("canvas"),
	context = canvas.getContext("2d");
	var bulletMp3 = airDiv.querySelector("#mp3");
	var startBtn = airDiv.querySelector(".gameStart span");
	var endBtn = airDiv.querySelector(".gameEnd span.playAgain");
	
	var air = new jAir({		
		"bg" : "img/air.jpg",
		"canvas" : canvas,
		"bulletMp3" :bulletMp3,
		"bulletSpeed":20,
		"airSpeed":10,
		"startBtn":startBtn,
		"endBtn":endBtn
	});

	this.air = air;
}
