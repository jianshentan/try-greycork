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
    
  } else {
    var leftSlider = $("#slider-left");
    var rightSlider = $("#slider-right");
    rightSlider.show();
    
    rightSlider.click(function() {
      leftSlider.show();
      
      var currNav = $(".slider-nav.active");
      var nextNav = currNav.next(".slider-nav");
      currNav.removeClass("active");
      nextNav.addClass("active"); 
      if (nextNav.is(":last-child")) {
        rightSlider.hide();
      }
      
      var currSlide = $(".slide-content.active");
      var nextSlide = currSlide.parent().next("li").find(".slide-content");
      currSlide.fadeOut(function() {
        currSlide.removeClass("active");
        nextSlide.fadeIn(function(){
          nextSlide.addClass("active");
        });  
      });
      
    });
    
    leftSlider.click(function() {
      rightSlider.show();
      
      var currNav = $(".slider-nav.active");
      var prevNav = currNav.prev(".slider-nav");
      currNav.removeClass("active");
      prevNav.addClass("active"); 
      if (prevNav.is(":first-child")) {
        leftSlider.hide();
      }
      
      var currSlide = $(".slide-content.active");
      var prevSlide = currSlide.parent().prev("li").find(".slide-content");
      currSlide.fadeOut(function() {
        currSlide.removeClass("active");
        prevSlide.fadeIn(function() {
          prevSlide.addClass("active");  
        });
      });
    });
    
    var slides = [];
    $(".slider-nav").each(function() {
      slides.push($(this).data("index"));
    });
    
  }
  
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
  localStorage.setItem("completedTutorial", "false");
  localStorage.setItem("skippedTutorial", "false");
  cb();
}

function isCanvasBlank(canvas) {
  var blank = document.createElement('canvas');
  blank.width = canvas.width;
  blank.height = canvas.height;

  return canvas.toDataURL() == blank.toDataURL();
}