$(document).ready(function() {
  
  // GLOBALS 
  var editor = $("#editor-middle");
  var sizeMultiplier = 4;
  
  /**
   * Take picture / Upload picture and put picture in the background canvas
   **/
  var camera = document.getElementById('camera');
  var frame = document.getElementById('frame');
  
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
      loadImage(file, function(canvas) {
        // delete canvas if canvas already exists
        editor.find("#canvas").remove();
        // create canvas
        $(canvas).attr('id', 'canvas')
        $(canvas).attr('draggable', 'false')
        editor.append(canvas);
        $(window).trigger("canvasReady", [ /* param1, param2 */])
        
        // resize canvas display to fit screen
        $(canvas).css("width", ($(canvas).width() / sizeMultiplier) + "px")
        
      }, options);
    });
  });
 
  $(window).on("canvasReady", function(e, p1, p2) {

    var stickerStack = [];
    var sticker1 = new Sticker("../images/square.png", "#editor-middle");
    //var sticker2 = new Sticker("../images/camera.png", "#editor-middle");
    
    stickerStack.push(sticker1);
    //stickerStack.push(sticker2);
    
    $("#save").click(function() {
      var destinationCanvas = document.getElementById('canvas');
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
      }
      
      /*
      // convert to image
      var dataURL = destinationCanvas.toDataURL();  
      $(destinationCanvas).css("display", "none");
      var img = document.createElement('img');
      img.id = "savedImg";
      img.src = dataURL;
      editor.append(img);
      
      $("#save").off();
      */
    });
   
  });
  
});