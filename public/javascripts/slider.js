/* global $ */
/* global localStorage */

var carousel;
$(document).ready(function () {
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

});