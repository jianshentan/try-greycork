/* globals $ */
/* globals loadImage */
   
var CAMERA_BUTTON_ID = 'camera';
var SAVE_BUTTON_ID = 'save-button';
var STICKER_BUTTON_ID = 'sticker-button';
var EDITOR_CONTAINER_ID = 'editor-middle';
var CANVAS_ID = 'canvas';
var SAVED_IMAGE_ID = 'saved-img';
var TRASH_ICON_ID = 'trash-icon';
var CAMERA_ICON_ID = 'camera-icon';
var STICKER_MENU_ID = 'sticker-menu';
var STICKER_MENU_BACK_ID = 'sticker-menu-bar-back';
var STICKER_MENU_STICKERS_ID = 'sticker-menu-stickers';
var STICKER_ICON_CLASS = 'sticker-icon';

var SIZE_MULTIPLIER = 2; // how much to scale the downloaded/saved image 

var stickerStack = []; // stack of active stickers

$(document).ready(function() {
  
  /**
   * Take picture / Upload picture and put picture in the background canvas
   **/
   
  var editor = $("#"+EDITOR_CONTAINER_ID);
  var camera = document.getElementById(CAMERA_BUTTON_ID);
  
  camera.addEventListener('change', function(e) {
    var file = e.target.files[0]; 
    
    loadImage.parseMetaData(file, function(data) {
      var options = { 
        canvas: true, 
        maxWidth: editor.width() * SIZE_MULTIPLIER,
        minWidth: editor.width() * SIZE_MULTIPLIER,
        maxHeight: editor.height() * SIZE_MULTIPLIER,
        minHeight: editor.height() * SIZE_MULTIPLIER 
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
        $(canvas).css("width", ($(canvas).width() / SIZE_MULTIPLIER) + "px")
        
        // image offsets to keep canvas centered
        $(canvas).css("left", "50%");
        $(canvas).css("top", "50%");
        $(canvas).css("transform", "translateX(-50%) translateY(-50%)");
        
        // canvas is ready!
        $(window).trigger("uploadImage", [ /* param1, param2 */])
      }, options);
    });
  });
  
  /**
   * Generate sticker menu from stickers in images/stickers/ directory
   **/
    
  var stickerPaths = [
    "/images/stickers/square.png",
    "/images/stickers/test.png",
    "/images/stickers/test.png",
    "/images/stickers/square.png"
  ];
  var stickersContainer = $("#"+STICKER_MENU_STICKERS_ID);
  
  var columns = [];
  for (var i=0; i < stickerPaths.length; i++) {
    
    var stickerPath = stickerPaths[i];      
    var imgElement = $("<img class='sticker-icon' src='"+stickerPath+"'/>");
    var colElement = $("<div class='col-xs-6 sticker-menu-col'></div>")
    colElement.append(imgElement);
    columns.push(colElement);
    
    if (i % 2 != 0 || i == stickerPaths.length - 1) {
      var rowElement = $("<div class='row sticker-menu-row'></div>");
      for (var j in columns) {
        rowElement.append(columns[j]);
      }
      stickersContainer.append(rowElement);
      columns = [];
    }
  }
  
});

/**
 * EVENT: 'uploadImage'
 **/ 
$(window).on("uploadImage", function(e, p1, p2) {
  // update buttons
  $("#"+SAVE_BUTTON_ID).addClass("active"); // show save button
  $("#"+TRASH_ICON_ID).addClass("active"); // show trash icon
  $("#"+CAMERA_ICON_ID).removeClass("active"); // hide camera icon
  $("#"+STICKER_BUTTON_ID).addClass("active"); // show sticker button

  // var sticker1 = new Sticker("../images/stickers/square.png", "#"+EDITOR_CONTAINER_ID);
  // var sticker2 = new Sticker("../images/camera.png", "#"+EDITOR_CONTAINER_ID);
  // stickerStack.push(sticker1);
  // stickerStack.push(sticker2);
  
  // Sticker Button on click
  $("#"+STICKER_BUTTON_ID).click(function() {
    $(window).trigger("showStickerMenu", [ /* param1, param2 */])
  });
  
  // Save Button on click
  $("#"+SAVE_BUTTON_ID).click(function() {
    $(window).trigger("saveImage")
  });
 
});

/**
 * EVENT: 'showStickerMenu'
 **/
$(window).on("showStickerMenu", function(e, p1, p2) {
  $("#"+STICKER_MENU_ID).slideDown(function() {
    
    $("#"+STICKER_MENU_ID).addClass("active");
    
    $("#"+STICKER_MENU_BACK_ID).click(function() {
      $(window).trigger("hideStickerMenu")
    });
    
    $("."+STICKER_ICON_CLASS).each(function() {
      $(this).unbind('click');
      $(this).one('click', function(){
        var path = $(this).attr("src");
        stickerStack.push(new Sticker(path, "#"+EDITOR_CONTAINER_ID));
        console.log(stickerStack);
        $(window).trigger("hideStickerMenu")
      });
    });
    
  });
});

/**
 * EVENT: 'hideStickerMenu'
 **/
$(window).on("hideStickerMenu", function(e, p1, p2) {
  $("#"+STICKER_MENU_ID).slideUp(function() {
    $("#"+STICKER_MENU_ID).removeClass("active");
  });
});

/**
 * EVENT: 'saveImage'
 **/
$(window).on("saveImage", function(e) {
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
    destinationCtx.scale(SIZE_MULTIPLIER, SIZE_MULTIPLIER);
    destinationCtx.translate(imgCanvasPos.left, imgCanvasPos.top);

    // sticker offsets to take into account that canvas is centered
    var offsetTop = $(destinationCanvas).offset().top - $("#"+EDITOR_CONTAINER_ID).offset().top;
    var offsetLeft = $(destinationCanvas).offset().left;
    destinationCtx.translate(-offsetLeft, -offsetTop);

    // set rotation/scale
    destinationCtx.translate(imgCanvas.width/2, imgCanvas.height/2);
    destinationCtx.rotate(imgCanvasRotation * Math.PI/180);
    destinationCtx.scale(imgCanvasScale, imgCanvasScale);
    destinationCtx.translate(-imgCanvas.width/2, -imgCanvas.height/2)
    
    // draw image
    destinationCtx.drawImage(imgCanvas, 0, 0);
    
    destinationCtx.restore();
    
    // hide sticker after flattening
    $(stickerStack[i].getSticker()).hide();
  }
  
  // convert to image
  var dataURL = destinationCanvas.toDataURL();  
  $(destinationCanvas).css("display", "none");
  var img = document.getElementById(SAVED_IMAGE_ID);
  img.src = dataURL;
  $(img).css("width", $(destinationCanvas).width());
  $(img).css("height", $(destinationCanvas).height());
  
  // center saved image
  $(img).css("position", "absolute");
  $(img).css("left", "50%");
  $(img).css("top", "50%");
  $(img).css("transform", "translateX(-50%) translateY(-50%)");
  
  $("#"+EDITOR_CONTAINER_ID).append(img);
  
  $("#"+SAVE_BUTTON_ID).off();
});
