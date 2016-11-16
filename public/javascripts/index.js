/* global $ */
/* global localStorage */

$(document).ready(function () {
  /**
   * ----------- Carousel ------------
   **/
  if (mobile) {
    var carousel;
    carousel = $("ul");
    
    // initialize carousel
    carousel.itemslide({
      one_item: true
    });
    
    // reload carousel on window resize
    $(window).resize(function () {
      carousel.reload();
    });
    
    // detect carousel index to update nav
    carousel.on('changePos', function(e) {
      var slideIndex = carousel.getActiveIndex();
      $(".slider-nav").each(function(){
        $(this).removeClass("active");
      });
      $(".slider-nav[data-index='"+slideIndex+"']").addClass("active");
    });
    
    // skip tutorial
    $("#skip-tutorial").click(function() {
      $("#slider").slideUp();  
      localStorage.setItem("skippedTutorial", "true");
    });
    
    // complete tutorial
    $("#play-now").click(function() {
      $("#slider").slideUp();  
      localStorage.setItem("completedTutorial", "true");
    });
    
    // unless skippedTutorial or completedTutorial, show tutorial
    if (localStorage.getItem("completedTutorial") == "true" ||
        localStorage.getItem("skippedTutorial") == "true") {
      $("#slider").hide();
    } else {
      $("#slider").show();
    }
  }
  
  /**
   * ----------- Nav bar------------
   **/
  
  var navContainer = $("#nav-container");
  var navWidth = navContainer.width();
  navContainer.css("left", -navWidth);
  
  $("#nav-button, #sticker-nav-button").click(function() {
    navContainer.animate({
      left: 0
    });
  });
  
  $("#nav-button-close").click(function() {
    navContainer.animate({
      left: -navWidth
    });
  });
  
  $("#nav-play").click(function() { 
    window.location = '/';
  });
  
  $("#nav-instructions").click(function() {
    clearCache(function() {
      window.location = '/';
    });
  });
  
  $("#nav-store").click(function() {
    window.location = 'https://www.greycork.com';
  });
  
  $("#nav-blog").click(function() {
    window.location = 'https://www.greycork.com';
  });
  
  $("#nav-privacy").click(function() {
    window.location = '/privacy';
  });
   
});
   
function clearCache(cb) {
  localStorage.setItem("completeTutorial", "false");
  localStorage.setItem("skippedTutorial", "false");
  cb();
}
 