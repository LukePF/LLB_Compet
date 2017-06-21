var ctrler = 0;
function actMagic() {
	changeUI();
	exeAudio();
}

function changeUI() {
	if (ctrler == 0) {
		ctrler = 1;
		document.getElementById("only_btn").setAttribute("value", "Pause & Play");
		
		} else if (ctrler == 1) {
		
		document.getElementById("db_box").setAttribute("class", "db_hide");
		document.getElementById("db_btn_bar").setAttribute("class", "db_hide");

		document.getElementById("music_h4").setAttribute("class", "secondTitle music_show");
		document.getElementById("audio_box").setAttribute("class", "cont_box music_show");
		document.getElementById("submit_bar").setAttribute("class", "cont_box music_show");

		document.getElementById("only_btn").setAttribute("value", "Restart");
		ctrler = 2;
		
	} else if (ctrler == 2) {

		document.getElementById("db_box").setAttribute("class", "db_show");
		document.getElementById("db_btn_bar").setAttribute("class", "db_show");

		document.getElementById("music_h4").setAttribute("class", "secondTitle music_hide");
		document.getElementById("audio_box").setAttribute("class", "cont_box music_hide");
		document.getElementById("submit_bar").setAttribute("class", "cont_box music_hide");

		document.getElementById("only_btn").setAttribute("value", "Pause & play");
		ctrler = 1;
		document.getElementById('player').pause();

	}

}
/*
llb_app.addListener('window_state', function (data) {
	if (data.fullscreen) {
		document.getElementById("app_menu_title").setAttribute("class", "title_style_hidden");
		document.getElementById("test_window_state").setAttribute("class", "body_style_show");

	} else {
		document.getElementById("app_menu_title").setAttribute("class", "title_style_show");
		document.getElementById("test_window_state").setAttribute("class", "body_style_hidden");
		
		llb_app.request("exit");
		
	}
})
*/