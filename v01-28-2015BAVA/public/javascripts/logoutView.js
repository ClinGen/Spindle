$(document).ready(function() {
	$("#summarydataboard").css('display','block');
	$("#toplinks").css('display', 'none');

	setTimeout(function () { $(location).attr('href', '/'); }, 60000);
});
