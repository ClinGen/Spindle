//document.getElementById('logname').focus();

function checkIdentical() {
	if (document.getElementById('newpwd').value != document.getElementById('newpwd2').value) {
		alert ('Not identical! Enter again.');
		return false;
	}
	else return true;
}
