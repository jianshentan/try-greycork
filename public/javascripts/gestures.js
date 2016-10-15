//Provides requestAnimationFrame from @ greggman in a cross browser way.
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();

}

// Globals
var input = {dragStartX:0, dragStartY:0, dragX:0, dragY:0, dragDX:0, dragDY:0, dragging:false, touchStartDistance:0, touchStartAngle:0};
var plateContainer;
var prefixedTransform;
var currentScale = 1;
var currentRotation = 0;
var posX = 0;
var posY = 0;
var velocityX = 0;
var velocityY = 0;
var containerWidth = $(window).width();
var containerHeight = $(window).height();
var plateWidth = 400;
var plateHeight = 400;
var maxScale = 1.5;
var minScale = 0.5

// Init the gestures
// TODO: 
// 0) make this file into a sticker Class file
// 1) dynamic image upload 
// 2) reset button 
// 3) handle multiple images (or maybe its just two instances)
function createSticker(imgSrc, stickerContainer) {
	
	plateContainer = stickerContainer; 
	
  var stickerCanvas = document.createElement('canvas');
  stickerCanvas.id = "sticker";
	
  var img = new Image();
  img.onload = function() {
  	stickerCanvas.width = this.width * 0.8;
    stickerCanvas.height = this.height * 0.8;
		var ctx = stickerCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, this.width * 0.8, this.height * 0.8);  
  	plateContainer.appendChild(stickerCanvas);
  };
  img.src = imgSrc;
    
	if('transform' in document.body.style){
		prefixedTransform='transform';
	}else if('webkitTransform' in document.body.style){
		prefixedTransform='webkitTransform';
	}
	// listeners
	if (window.PointerEvent) {
    input.pointers=[];
    plateContainer.addEventListener("pointerdown", pointerDownHandler, false);
  }else{
		plateContainer.addEventListener('touchstart', onTouchStart);
		plateContainer.addEventListener('mousedown', onPlateMouseDown);
	}
	
	/*
	posX=containerWidth*0.5;
	posY=containerHeight*0.5;
	*/
	
	posX = 0;
	posY = 0;

	onAnimationFrame();
};

function onAnimationFrame() {

	requestAnimationFrame( onAnimationFrame );

	if(input.dragDX !== 0) velocityX = input.dragDX;
	if(input.dragDY !== 0) velocityY = input.dragDY;
	
	posX += velocityX;
	posY += velocityY;
 
  // TODO fuck this shit. think about it later...
	//restict this shit horizontally
	/*
	if(posX<-75) posX=-75;
	else if(posX>containerWidth-75) posX=containerWidth-75;

	//restict vertically
	if(posY<0) posY=0;
	else if(posY>containerHeight) posY=containerHeight;
	*/

	//set the transform
	plateContainer.style[prefixedTransform]= 'translate('+posX+'px,'+posY+'px) rotate('+currentRotation+'deg) scale('+currentScale+') translateZ(0)';

	velocityX= velocityX*0.8;
	velocityY= velocityY*0.8;

	input.dragDX=0;
	input.dragDY=0;

}

function getSticker() {
}


/*
 * Events
 */

function onPlateMouseDown(event) {
	event.preventDefault();
	document.addEventListener('mouseup', onDocumentMouseUp);
	document.addEventListener('mousemove', onDocumentMouseMove);
	if(event.shiftKey === true) {
		//assume second touchpoint is in middle of screen
		handleGestureStart(posX, posY, event.clientX, event.clientY);
	} else {
		handleGestureStop();
		handleDragStart(event.clientX, event.clientY);
	}
}

function onDocumentMouseMove(event) {
	if(event.shiftKey) {
		handleGesture(posX, posY, event.clientX, event.clientY); 
	} else {
		handleDragging(event.clientX, event.clientY);
	}

}

function onDocumentMouseUp(event) {
	document.removeEventListener('mouseup', onDocumentMouseUp);
	document.removeEventListener('mousemove', onDocumentMouseMove);
	
	handleGestureStop();
		
	event.preventDefault();
	handleDragStop();
}

function onTouchStart(event) {
	event.preventDefault();
	if( event.touches.length === 1){
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
		handleDragStart(event.touches[0].clientX , event.touches[0].clientY);
	}else if( event.touches.length === 2 ){
		handleGestureStart(event.touches[0].clientX, event.touches[0].clientY, event.touches[1].clientX, event.touches[1].clientY );
	}
}

function onTouchMove(event) {
	event.preventDefault();
	if( event.touches.length  === 1){
		handleDragging(event.touches[0].clientX, event.touches[0].clientY);
	}else if( event.touches.length === 2 ){
		handleGesture(event.touches[0].clientX, event.touches[0].clientY, event.touches[1].clientX, event.touches[1].clientY );
	}
}

function onTouchEnd(event) {
	event.preventDefault();
	if( event.touches.length  === 0 && input.dragging){
		handleDragStop();
		document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchEnd);
	}else if(event.touches.length === 1 ){
		handleGestureStop();
		handleDragStart(event.touches[0].clientX, event.touches[0].clientY);
	}
}
function indexOfPointer(pointerId){
  for (var i=0;i<input.pointers.length;i++){
    if(input.pointers[i].pointerId === pointerId) {
       return i;
    }
  }
  return -1;
}
function pointerDownHandler(event) {
  var pointerIndex=indexOfPointer(event.pointerId);
  if(pointerIndex<0){
    input.pointers.push(event);
  }else{
    input.pointers[pointerIndex] = event;
  }
  if( input.pointers.length === 1){
		handleDragStart(input.pointers[0].clientX , input.pointers[0].clientY);
    window.addEventListener("pointermove", pointerMoveHandler, false);
    window.addEventListener("pointerup", pointerUpHandler, false);
	}else if( input.pointers.length === 2 ){
		handleGestureStart(input.pointers[0].clientX, input.pointers[0].clientY, input.pointers[1].clientX, input.pointers[1].clientY );
	}
}

function pointerMoveHandler(event) {
  var pointerIndex=indexOfPointer(event.pointerId);
  if(pointerIndex<0){
    input.pointers.push(event);
  }else{
    input.pointers[pointerIndex] = event;
  }
  
  if( input.pointers.length  === 1){
		handleDragging(input.pointers[0].clientX, input.pointers[0].clientY);
	}else if( input.pointers.length === 2 ){
    console.log(input.pointers[0], input.pointers[1]);
		handleGesture(input.pointers[0].clientX, input.pointers[0].clientY, input.pointers[1].clientX, input.pointers[1].clientY );
	}
}

function pointerUpHandler(event) {
  var pointerIndex=indexOfPointer(event.pointerId);
  if(pointerIndex<0){
    
  }else{
    input.pointers.splice(pointerIndex,1);
  }
  
	if( input.pointers.length  === 0 && input.dragging){
		handleDragStop();
    window.removeEventListener("pointermove", pointerMoveHandler, false);
    window.removeEventListener("pointerup", pointerUpHandler, false);
	}else if(input.pointers.length === 1 ){
		handleGestureStop();
		handleDragStart(input.pointers[0].clientX, input.pointers[0].clientY);
	}
  
}
function handleDragStart(x ,y ){
	input.dragging = true;
	input.dragStartX = input.dragX = x;
	input.dragStartY = input.dragY = y;
}

function handleDragging(x ,y ){
	if(input.dragging) {
		input.dragDX = x-input.dragX;
		input.dragDY = y-input.dragY;
		input.dragX = x;
		input.dragY = y;
	}
}

function handleDragStop(){
	if(input.dragging) {
		input.dragging = false;
		input.dragDX=0;
		input.dragDY=0;
	}
}
function handleGestureStart(x1, y1, x2, y2){
	input.isGesture = true;
	//calculate distance and angle between fingers
	var dx = x2 - x1;
	var dy = y2 - y1;
	input.touchStartDistance=Math.sqrt(dx*dx+dy*dy);
	input.touchStartAngle=Math.atan2(dy,dx);
	//we also store the current scale and rotation of the actual object we are affecting. This is needed because to enable incremental rotation/scaling. 
	input.startScale=currentScale;
	input.startAngle=currentRotation;
}
function handleGesture(x1, y1, x2, y2){
	if(input.isGesture){
		//calculate distance and angle between fingers
		var dx = x2 - x1;
		var dy = y2 - y1;
		var touchDistance=Math.sqrt(dx*dx+dy*dy);
		var touchAngle=Math.atan2(dy,dx);
		//calculate the difference between current touch values and the start values
		var scalePixelChange = touchDistance - input.touchStartDistance;
		var angleChange = touchAngle - input.touchStartAngle;
		//calculate how much this should affect the actual object
		currentScale=input.startScale + scalePixelChange*0.01;
		currentRotation=input.startAngle+(angleChange*180/Math.PI);
		if(currentScale<minScale) currentScale=minScale;
		if(currentScale>maxScale) currentScale=maxScale;
	}
}
function handleGestureStop(){
	input.isGesture= false;
}