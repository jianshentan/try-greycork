/* global $ */

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
  $("#skip-tutorial, #play-now").click(function() {
    $("#slider").slideUp();  
  });

});