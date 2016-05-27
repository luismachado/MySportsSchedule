$(window).scroll(function() {
	if ($(document).scrollTop() < 60) {
		$('.navbar').addClass('shrink');
	}
	else {
		$('.navbar').removeClass('shrink');
	}
});

//Also save configs if modal is closed by pressing outside ou on the X
$('#myModal').on('hidden.bs.modal', function (e) {
		angular.element(document.getElementById('my_sports_schedule')).scope().saveConfig();
});