// $(function(){

	var $grid = $('.grid').masonry({
		// columnWidth: '.grid-sizer',
		itemSelector: '.grid-item',
		gutter: '.gutter-sizer'
	});
	$grid.imagesLoaded().progress( function() {
		$grid.masonry('layout');
	});
	window.addEventListener("resize", function() {
		$grid.masonry('layout');
	}, false);

// });
