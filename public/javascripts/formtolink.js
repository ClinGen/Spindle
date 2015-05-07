function formtolink() {
	if (document.getElementById('idValue') !== "") {
		var link = window.location.href;
		link = link.split('/gene/')[0];
		link = link + '/gene/' + document.getElementById('idType').value + '/' + document.getElementById('idValue').value;
		window.location.href = link;
	}
	return false;
}