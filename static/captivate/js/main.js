(function($){
    var formatDate = function(unixTimestamp) {
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
        	d = (new Date(Number(unixTimestamp) * 1000)),
        	month = months[d.getMonth()],
			day = '' + d.getDate() + ',',
			year = d.getFullYear();
			return [month, day, year].join(' ');
    };

	$('.slider').slick({
      infinite: true,
	    speed: 900,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    nextArrow: '<div class="col-sm-1 col-md-1"><button type="button" class="slick-next">Next</button></div>',
	    prevArrow: '<div class="col-sm-1 col-md-1"><button type="button" class="slick-prev">Previous</button></div>',
	    responsive: [{
	        breakpoint: 768,
	        settings: {
	            arrows: false,
	            slidesToShow: 3,
	            slidesToScroll: 3
	        }
	    }]
    });
    
	$(".latest-video").on({
		click: function(e){
			// alert('test');
		},
		mouseover: function(e){
			$hoverDiv = $(this).find('.latest-video-hover');
			if (!$hoverDiv.hasClass('active')) {
				$(this).find('.latest-video-hover').addClass('active');
			}
		},
		mouseout: function(e){
			$hoverDiv = $(this).find('.latest-video-hover');
			if ($hoverDiv.hasClass('active')) {
				$(this).find('.latest-video-hover').removeClass('active');
			}
		}
	});

	$('#subcribeModal').on('show.bs.modal', function(event) {
		$('.subscribe-body').show();
		$('.subscribed-body').hide();
	});

	$('.subscribe-button').on('click', function(event) {
		event.preventDefault();
		$('.subscribe-body').hide();
		$('.subscribed-body').show();
	});

	$('.video-details .published-date').text(function(i, s){
		return formatDate(s);
	});
}(jQuery));