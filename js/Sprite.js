//Sprite
var Sprite = function (name,painter,behaviors){
	this.name = name;
	this.painter = painter;

	this.top = 0;
	this.left = 0;
	this.width = 0;
	this.height = 0;
	this.velocityX = 0;
	this.velocityY = 0;
	this.visible = true;
	this.animating = false;
	this.behaviors = behaviors || [];

	
}

Sprite.prototype = {
	print : function (context){
		if(this.painter !== undefined && this.visible){
			this.painter.paint(this,context);
		}
	},
	update : function (context,time){
		for(var i=0,l=this.behaviors.length;i<l;i++){
			this.behaviors[i].execute(this,context,time);
		}
	}
}
//ImagePainter
var ImagePainter = function (imageUrl){
	this.image = new Image();
	this.image.src = imageUrl;
}
ImagePainter.prototype = {
	paint:function(sprint,context){
		if(this.image.complete){
			context.drawImage(this.image,sprite.left,sprite.top,sprite.width,sprite.height);
		}
	}
}

//SprinteSheet
var SpriteSheetPainter = function(spriteSheet,cells){
	this.cells = cells || [];
	this.cellIndex = 0;
	this.spriteSheet = spriteSheet;
}
SpriteSheetPainter.prototype = {
	advance : function(){	
		this.cellIndex = this.cellIndex === this.cells.length-1 ? 0 : this.cellIndex+1;
	},
	paint : function(sprite,context){
		var cell = this.cells[this.cellIndex];
		context.drawImage(this.spriteSheet,cell.x,cell.y,cell.w,cell.h,
						  sprite.left,sprite.top,cell.w,cell.h);
	}
}
