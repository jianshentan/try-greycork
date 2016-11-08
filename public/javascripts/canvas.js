/* globals $ */
/* globals loadImage */
/* globals mobile */
   
var CAMERA_ID = 'camera';
var CAMERA_BUTTON_ID = 'camera-button';
var SAVE_BUTTON_ID = 'save-button';
var STICKER_BUTTON_ID = 'sticker-button';
var EDITOR_CONTAINER_ID = 'editor-middle';
var CANVAS_ID = 'canvas';
var SAVED_IMAGE_ID = 'saved-img';
var TRASH_BUTTON_ID = 'trash-button';
var CAMERA_ICON_ID = 'camera-icon';
var STICKER_MENU_ID = 'sticker-menu';
var STICKER_MENU_BACK_ID = 'sticker-menu-bar-back';
var STICKER_MENU_STICKERS_ID = 'sticker-menu-stickers';
var STICKER_ICON_CLASS = 'sticker-icon';
var DOWNLOAD_OVERLAY_ID = 'download-overlay';
var DOWNLOAD_BUTTON_ID = 'download-overlay-ok-button';
var DOWNLOAD_BACK_BUTTON_ID = 'download-overlay-menu-bar-back';
var SHARE_CHECKBOX_ID = 'share-download';
var PROMOCODE_CONTAINER_ID = 'promocode-container';
var INSTRUCTIONS_CONTAINER_ID = 'instructions-container';

var SIZE_MULTIPLIER = 2; // how much to scale the downloaded/saved image 
var stickerStack = []; // stack of active stickers

$(document).ready(function() {

  /**
   * Take picture / Upload picture and put picture in the background canvas
   **/
   
  var editor = $("#"+EDITOR_CONTAINER_ID);
  var camera = document.getElementById(CAMERA_ID);
  
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
        $(canvas).css("width", ($(canvas).width() / SIZE_MULTIPLIER) + "px");
        
        // image offsets to keep canvas centered
        $(canvas).css("left", "50%");
        $(canvas).css("top", "50%");
        $(canvas).css("transform", "translateX(-50%) translateY(-50%)");
        
        // canvas is ready!
        $(window).trigger("uploadImage", [ /* param1, param2 */]);
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
    var colElement = $("<div class='col-xs-6 sticker-menu-col'></div>");
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
  
  /**
   * Handle events if mobile 
   **/
  if (!mobile) {
    console.log("start");
    $(window).trigger("showStickerMenu");
  } 
   
});

/**
 * EVENT: 'uploadImage'
 **/ 
$(window).on("uploadImage", function(e, p1, p2) {
  // update buttons
  $("#"+SAVE_BUTTON_ID).addClass("active"); // show save button
  $("#"+TRASH_BUTTON_ID).addClass("active"); // show trash icon
  $("#"+CAMERA_BUTTON_ID).removeClass("active"); // hide camera icon
  $("#"+STICKER_BUTTON_ID).addClass("active"); // show sticker button
  $("#"+INSTRUCTIONS_CONTAINER_ID).removeClass("active"); // show sticker button
  
  // Sticker Button on click
  $("#"+TRASH_BUTTON_ID).off('click');
  $("#"+STICKER_BUTTON_ID).click(function() {
    $(window).trigger("showStickerMenu", [ /* param1, param2 */]);
  });
  
  // Save Button on click
  $("#"+TRASH_BUTTON_ID).off('click');
  $("#"+SAVE_BUTTON_ID).click(function() {
    $(window).trigger("openDownloadOverlay");
  });
  
  // Trash Button on click
  $("#"+TRASH_BUTTON_ID).off('click');
  $("#"+TRASH_BUTTON_ID).click(function() {
    if (confirm("Are you sure you want to discard your image and start again?")) {
      $(window).trigger("deleteImage");  
    }
  });
 
});

/**
 * EVENT: 'showStickerMenu'
 **/
$(window).on("showStickerMenu", function(e, p1, p2) {
  if (mobile) {
    $("#"+STICKER_MENU_ID).slideDown(function() {
      
      $("#"+STICKER_MENU_ID).addClass("active");
      
      $("#"+STICKER_MENU_BACK_ID).click(function() {
        $("#"+STICKER_MENU_ID).slideUp(function() {
          $("#"+STICKER_MENU_ID).removeClass("active");
        });
      });
      
      $("."+STICKER_ICON_CLASS).each(function() {
        $(this).unbind('click');
        $(this).one('click', function(){
          // add new sticker to canvas
          var path = $(this).attr("src");
          stickerStack.push(new Sticker(path, "#"+EDITOR_CONTAINER_ID));
          
          // hide sticker menu
          $("#"+STICKER_MENU_ID).slideUp(function() {
            $("#"+STICKER_MENU_ID).removeClass("active");
          });
        });
      });
      
    });
  } else {
    console.log("here");
    $("."+STICKER_ICON_CLASS).each(function() {
      //$(this).unbind('click');
      $(this).one('click', function(){
        // add new sticker to canvas
        var path = $(this).attr("src");
        console.log(path);
        stickerStack.push(new Sticker(path, "#"+EDITOR_CONTAINER_ID));
      });
    });
  }
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
  
  // trigger the download overlay
  $(window).trigger("openDownloadOverlay", [ /* param1, param2 */]);
 
});

/**
 * EVENT: 'deleteImage'
 **/ 
$(window).on("deleteImage", function(e, p1, p2) {
  
  // reset canvas
  var canvas = document.getElementById(CANVAS_ID);
  $(canvas).css("width", "100vw");
  $(canvas).remove();
  $("#"+EDITOR_CONTAINER_ID).append($("<canvas id='canvas'></canvas>"));
  
  // empty sticker stack and delete each sticker
  for (var i in stickerStack) {
    stickerStack[i].deleteSticker(); 
  }
  stickerStack = [];
  
  // hide sticker-menu-button, trash-button and save-button, but show camera-button
  $("#"+SAVE_BUTTON_ID).removeClass("active"); // show save button
  $("#"+TRASH_BUTTON_ID).removeClass("active"); // show trash icon
  $("#"+CAMERA_BUTTON_ID).addClass("active"); // hide camera icon
  $("#"+STICKER_BUTTON_ID).removeClass("active"); // show sticker button
  $("#"+INSTRUCTIONS_CONTAINER_ID).addClass("active"); // show sticker button
 
});

/**
 * EVENT: 'openDownloadOverlay'
 **/ 
$(window).on('openDownloadOverlay', function(e, p1, p2) {
  $("#"+DOWNLOAD_OVERLAY_ID).slideDown(function() {
    $("#"+DOWNLOAD_OVERLAY_ID).addClass('active');
  });
  
  var isChecked = $("#"+SHARE_CHECKBOX_ID).is(":checked");
  
  // download the image!
  $("#"+DOWNLOAD_BUTTON_ID).off('click');
  $("#"+DOWNLOAD_BUTTON_ID).click(function() {
    if (isChecked) {
      // send image off to server...
      // TODO
    }      
    $(window).trigger("saveImage");
    $(window).trigger("closeDownloadOverlay");
  });
  
  // clicked on back button
  $("#"+DOWNLOAD_BACK_BUTTON_ID).off('click');
  $("#"+DOWNLOAD_BACK_BUTTON_ID).click(function() {
    
    $("#"+DOWNLOAD_BUTTON_ID).unbind('click');
    
    $("#"+DOWNLOAD_OVERLAY_ID).slideUp(function() {
      $("#"+DOWNLOAD_OVERLAY_ID).removeClass('active');
    });
    
  });
  
});

/**
 * EVENT: 'closeDownloadOverlay'
 **/ 
$(window).on('closeDownloadOverlay', function(e, p1, p2) {
  // hide all buttons in editor
  $("#"+SAVE_BUTTON_ID).removeClass("active"); // show save button
  $("#"+TRASH_BUTTON_ID).removeClass("active"); // show trash icon
  $("#"+CAMERA_BUTTON_ID).removeClass("active"); // hide camera icon
  $("#"+STICKER_BUTTON_ID).removeClass("active"); // show sticker button
 
  $("#"+DOWNLOAD_OVERLAY_ID).slideUp(function() {
    $("#"+DOWNLOAD_OVERLAY_ID).removeClass('active');
    $("#"+PROMOCODE_CONTAINER_ID).addClass('active');
  });
});







 