$(document).ready(function(){

	/* 本地数据初始化 */
	if(typeof(localStorage.SaruQuality) == undefined || isNaN(localStorage.SaruQuality))
		localStorage.SaruQuality = 0;

	if(typeof(localStorage.SaruRepeat) == undefined || isNaN(localStorage.SaruRepeat))
		localStorage.SaruRepeat = 0;

	if(typeof(localStorage.SaruLike) == undefined || isNaN(localStorage.SaruLike))
		localStorage.SaruLike = '{}';

	/* 常量 */
	var audio     = document.getElementById('music'),
			isPlaying = true,
			SaruData  = {
				'current' : 0,
				'prev'    : -1,
				'quality' : parseInt(localStorage.SaruQuality),
				'rmode'   : parseInt(localStorage.SaruRepeat)
			},
			SaruLike = localStorage.SaruLike;

	for (var i = 0; i < playlist.length; i++){
		var item = playlist[i];
		$('.play-list ul').append('<li class="item' + i + '">' + item.title + ' - ' + item.artist + '</li>');
	}

	/* 随机 */
	var randomNum = function(min,max){
		var radx;

		// 避免只有一首时死循环
		if ((+max - min) <= 1) return 0;

		// 随机避免和现在重复
		while ( !radx || radx === SaruData['current'] ){
			radx = Math.floor(min + Math.random() * (max - min));
		}

		return radx;
	}

	/* 播放事件 */

	var Saru_EventPlay = function(){
		$('#player').addClass('playing');
		$('.start i').removeClass('fa-play').addClass('fa-pause');
	}

	/* 暂停事件 */

	var Saru_EventStop = function(){
		$('#player').removeClass('playing');
		$('.start i').removeClass('fa-pause').addClass('fa-play');
	}

	/* 进度条更新事件 */

	var Saru_EventUpdateProgress = function() {
		$('#progress .current').css({'width': audio.currentTime / audio.duration * 100 + '%'});
	}

	/* 自动切歌 */

	var Saru_ChangeNext = function(){
		audio.pause();
		var nextMusic = 0;

		switch(SaruData['rmode']){
			case 0: // 随机播放
			default:
				playMusic(randomNum(0, playlist.length));
				break;

			case 1: // 单曲循环
				audio.currentTime = 0.0;
				audio.play();
				break;

			case 2: // 列表顺序
				if (SaruData['current'] == playlist.length - 1){
					playMusic(0);
				} else {
					playMusic(SaruData['current'] + 1);
				}
				break;
		}
	}

	var Saru_ChangePrev = function(){
		audio.pause();
		if((+SaruData['current'] + 1) === SaruData['prev'] && SaruData['prev'] > -1) {
			playMusic(SaruData['prev']);
		} else if (+SaruData['current'] == 0){
			playMusic(playlist.length - 1);
		} else if (SaruData['current'] == playlist.length) {
			playMusic(SaruData['current']);
		} else {
			playMusic(SaruData['current'] - 1);
		}
	}

	/* 音乐播放 */

	var playMusic = function(i){
		// 记录
		SaruData['prev']    = localStorage.SaruPrev    = SaruData['current'];
		SaruData['current'] = localStorage.SaruCurrent = i;

		// 获取ID
		item = playlist[i];

		audio.setAttribute("src", item['sources'][0]['source']);
		audio.addEventListener('play',  Saru_EventPlay, false);
		audio.addEventListener('pause', Saru_EventStop, false);
		audio.addEventListener('timeupdate', Saru_EventUpdateProgress, false);
		audio.addEventListener('ended', Saru_ChangeNext, false);


		// 设置封面
		cover = item['cover'] ? item['cover'] : 'img/album.jpg';

		$('#cover').attr({
			'style': 'background-image:url(' + cover + ');',
			'title': item['title'] + ' - ' + item['artist']
		});

		// 设置标题
		$('hgroup h1').html(item['title']);
		$('hgroup h2').html(item['artist']);

		// 播放列表
		$('.play-list ul li').removeClass('playing').eq(i).addClass('playing');

		// 提示
		Notification.requestPermission(function (perm) {
			if (perm == "granted") {
				var notification = new Notification (item['title'], {
					dir: "auto",
					lang: "hi",
					tag: "SaruFM",
					icon: item['cover'],
					body: item['title'] + ' - ' + item['artist']
				});
				notification.onshow = function(){
					setTimeout(function(){
						notification.close();
					}, 5000);
				}
			}
		});

		// 开始播放
		audio.play();
	}

	playMusic(0);


	$('.center').click(function() {
		if ($('#player').hasClass('playing')){
			audio.pause();
		} else {
			audio.play();
		}
	});

	$('.control .prev').click(function(){
		Saru_ChangePrev();
	})

	$('.control .next').click(function(){
		Saru_ChangeNext();
	})

	$('.play-list ul li').click(function(){
		if(!$(this).hasClass('playing')){
			var className = $(this).attr('class');
			var num       = parseInt(className.substr(4));
			$('#wrap .list-button').animate({marginRight: -5},300);
			$('#wrap .play-list ul').animate({marginRight: -400},300);
			audio.pause();
			playMusic(num);
		}
	});

	/* HotKey */
	$(document).keydown(function(e) {
		var keycode = e.keyCode || e.which || e.charCode;

		switch (keycode) {
			case 39:
			case 78: // 右键, n键; 下一首
				Saru_ChangeNext();
				break;

			case 37: // 左键; 上一首
				Saru_ChangePrev();
				break;

			case 80:
			case 32: // P键, 空格键; 播放暂停
				if ($('#player').hasClass('playing')){
					audio.pause();
				} else {
					audio.play();
				}
				break;

			case 76: //L键; 喜欢
				break;
		}
	});
});
