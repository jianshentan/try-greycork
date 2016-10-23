/* globals $ */

$(document).ready(function() {
   
  var CAMERA_BUTTON_ID = 'camera';
  var SAVE_BUTTON_ID = 'save';
  var EDITOR_CONTAINER_ID = 'editor-middle';
  var CANVAS_ID = 'canvas';
  var SAVED_IMAGE_ID = 'saved-img';
 
  var editor = $("#"+EDITOR_CONTAINER_ID);
  var sizeMultiplier = 2;
 
  /**
   * Take picture / Upload picture and put picture in the background canvas
   **/
  var camera = document.getElementById(CAMERA_BUTTON_ID);
  
  camera.addEventListener('change', function(e) {
    var file = e.target.files[0]; 
    
    loadImage.parseMetaData(file, function(data) {
      var options = { 
        canvas: true, 
        maxWidth: editor.width() * sizeMultiplier,
        minWidth: editor.width() * sizeMultiplier,
        maxHeight: editor.height() * sizeMultiplier,
        minHeight: editor.height() * sizeMultiplier
      };  
      if (data.exif) {
        options.orientation = data.exif.get('Orientation');
      }
      loadImage(file, function(tempCanvas) {
        
        /**
         * We need to draw the resulting canvas (tempCanvas) into
         * our canvas object, instead of just adding the tempCanvas
         * to the page because the tempCanvas has exif meta data
         * attached to it, complicating rotations...
         * By drawing the tempCanvas into our canvas element, we
         * flatten the image thereby mitigating rotation complexities
         **/
         
        var canvas = document.getElementById(CANVAS_ID);
        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(tempCanvas, 0, 0);
        $(canvas).css("width", ($(canvas).width() / sizeMultiplier) + "px")
        //$(canvas).css("height", ($(canvas).height() / sizeMultiplier) + "px")
        
        // canvas is ready!
        $(window).trigger("canvasReady", [ /* param1, param2 */])
      }, options);
    });
  });
 
  $(window).on("canvasReady", function(e, p1, p2) {

    var stickerStack = [];
    var sticker1 = new Sticker("../images/square.png", "#"+EDITOR_CONTAINER_ID);
    //var sticker2 = new Sticker("../images/camera.png", "#"+EDITOR_CONTAINER_ID);
    
    stickerStack.push(sticker1);
    //stickerStack.push(sticker2);
    
    $("#"+SAVE_BUTTON_ID).click(function() {
      var destinationCanvas = document.getElementById(CANVAS_ID);
      var destinationCtx = destinationCanvas.getContext('2d');
      destinationCtx.globalCompositeOperation = 'source-atop';
      
      // flatten canvases
      for (var i in stickerStack) {
         
        var imgCanvas = stickerStack[i].getSticker();
        var imgCanvasPos = stickerStack[i].getPosition();
        var imgCanvasRotation = stickerStack[i].getRotation();
        var imgCanvasScale = stickerStack[i].getScale();
               
        destinationCtx.save();

        // set position / scale
        destinationCtx.scale(sizeMultiplier, sizeMultiplier);
        destinationCtx.translate(imgCanvasPos.left, imgCanvasPos.top);
        // set rotation/scale
        destinationCtx.translate(imgCanvas.width/2, imgCanvas.height/2);
        destinationCtx.rotate(imgCanvasRotation * Math.PI/180);
        destinationCtx.scale(imgCanvasScale, imgCanvasScale);
        destinationCtx.translate(-imgCanvas.width/2, -imgCanvas.height/2)
        
        // draw image
        destinationCtx.drawImage(imgCanvas, 0, 0);
        
        destinationCtx.restore();
        
        // hide sticker after flattening
        $(stickerStack[i].getSticker()).hide()
      }
      
      // convert to image
      var dataURL = destinationCanvas.toDataURL();  
      $(destinationCanvas).css("display", "none");
      var img = document.getElementById(SAVED_IMAGE_ID);
      img.src = dataURL;
      $(img).css("width", $(destinationCanvas).width());
      $(img).css("height", $(destinationCanvas).height());
      
      editor.append(img);
      
      $("#"+SAVE_BUTTON_ID).off();
    });
   
  });
  
});