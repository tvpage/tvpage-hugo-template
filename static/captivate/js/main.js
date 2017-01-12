(function($){

	$('.slider').slick({
      infinite: true,
	    speed: 900,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    responsive: [{
	        breakpoint: 768,
	        settings: {
	            arrows: false,
	            slidesToShow: 3,
	            slidesToScroll: 3
	        }
	    }]
    });

	$(".video").on("click", function(e){
		window.location.href = $(e.currentTarget).find("a").prop("href");
	});

}(jQuery));