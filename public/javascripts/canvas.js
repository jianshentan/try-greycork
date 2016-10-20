$(document).ready(function() {
  
  /**
   * Take picture / Upload picture and put picture in the background canvas
   **/
  var camera = document.getElementById('camera');
  var frame = document.getElementById('frame');
     
  camera.addEventListener('change', function(e) {
    var file = e.target.files[0]; 
    
    loadImage.parseMetaData(file, function(data) {
      var options = { canvas: true };  
      if (data.exif) {
        options.orientation = data.exif.get('Orientation');
      }
      loadImage(file, function(canvas) {
        // delete canvas if canvas already exists
        $("#editor-middle").find("#canvas").remove();
        // create canvas
        $(canvas).attr('id', 'canvas')
        $(canvas).attr('draggable', 'false')
        $("#editor-middle").append(canvas);
        $(window).trigger("canvasReady", [ /* param1, param2 */])
      }, options);
    });
  });
  
  /**
   * Create a sticker 
   * TODO - sticker should be a class (instead of a file with globals vars)
   **/
  $(window).on("canvasReady", function(e, p1, p2) {

    var sticker1 = new Sticker("../images/test.png", "#main");
    var sticker2 = new Sticker("../images/camera.png", "#main");
    
    
    // TODO using 'globalCompositeOperation', select the appropriate XOR effect
    //      join the sticker with canvas to produce an image
    $("#save").click(function() {
      var destinationCanvas = document.getElementById('canvas');
      var destinationCtx = destinationCanvas.getContext('2d');
      destinationCtx.globalCompositeOperation = 'source-atop';
      console.log(sticker1);
      destinationCtx.drawImage(sticker1.getCanvas(), 0, 0);  
      sticker1.destroy();
      //destinationCtx.drawImage(sticker2.getStickerCanvas(), 0, 0);  
    });
    
    
    /* TEST
    var stickerContainer2 = document.createElement('div');
    stickerContainer2.className = "sticker-container";
    $("#main").append($(stickerContainer2));
    createSticker("../images/test.png", stickerContainer2);
    */
  });
  
});

class Shape {
  constructor(src, ctx) {
    this.src = src;
  }
  /*
  f() {}
  g() {}
  */
}