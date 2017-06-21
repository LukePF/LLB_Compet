function playmusic(i) {
	var my = document.getElementById("player");
	
	if (i > 80) {
		i = 4;
	}else if(i > 50) {
		i = 3;
	}else if(i > 20) {
		i = 2;
	}else {
		i = 1;
	}

	switch (i) {
		case 4:
			my.setAttribute("src", "https://docs.google.com/uc?id=0B4HSFcUBdc3cMnBhSjU3TzNQWGM&export=download");
			document.getElementById("mp3name").innerText = "loading...";
			my.addEventListener("canplaythrough",
				function () {
					document.getElementById("mp3name").innerText = "Out of Control - Nothing's Carved In Stone"; 
				}, false);
			document.getElementById("lvl_number").innerText = "lv.4";
			document.getElementById("lvl_name").innerText = "Rock";
			my.play();
			break;
		case 3:
			my.setAttribute("src", "https://docs.google.com/uc?id=0B4HSFcUBdc3cYVJzcEJHeFFyTk0&export=download");
			document.getElementById("mp3name").innerText = "loading...";
			my.addEventListener("canplaythrough",
				function () {
					document.getElementById("mp3name").innerText = "Munou - österreich";
				}, false);
			document.getElementById("lvl_number").innerText = "lv.3";
			document.getElementById("lvl_name").innerText = "Busy Street";
			my.play();
			break;
		case 2:
			my.setAttribute("src", "https://docs.google.com/uc?id=0B4HSFcUBdc3cRnVXTGY0ZXJXV1k&export=download");
			document.getElementById("mp3name").innerText = "loading...";
			my.addEventListener("canplaythrough",
				function () {
					document.getElementById("mp3name").innerText = "History Maker - Dean Fujioka";
				}, false);
			document.getElementById("lvl_number").innerText = "lv.2";
			document.getElementById("lvl_name").innerText = "Normal Conversation";
			my.play();
			break;
		case 1:
			my.setAttribute("src", "https://docs.google.com/uc?id=0B4HSFcUBdc3cSkY5NEpjWlNTQnM&export=download");
			document.getElementById("mp3name").innerText = "loading...";
			my.addEventListener("canplaythrough",
				function () {
					document.getElementById("mp3name").innerText = "All Alone With You - Egoist";
				}, false);
			document.getElementById("lvl_number").innerText = "lv.1";
			document.getElementById("lvl_name").innerText = "Quite Whisper";
			my.play();
			break;
		default:
	}
}