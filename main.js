/*
 *  Copyright (c) 2024 Steve Seguin. All Rights Reserved.
 *
 *  Use of this source code is governed by the APGLv3 open-source license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. Alternative licencing options can be made available on request.
 *
 */
/*jshint esversion: 6 */
async function main() {
	// main asyncronous thread; mostly initializes the user settings.

	var delayedStartupFuncs = [];
	// translation stuff start ////

	var ConfigSettings = getById("main-js");
	let ln_template = null;
	let altLabelOverride = null;

	if (urlParams.has("altlabel")) {
		try {
			altLabelOverride = urlParams.get("altlabel") || "";
		} catch (e) {
			altLabelOverride = "";
		}
		if (altLabelOverride) {
			try {
				altLabelOverride = decodeURIComponent(altLabelOverride);
			} catch (e) {}
			altLabelOverride = altLabelOverride.replace(/_/g, " ").trim();
			if (altLabelOverride.length === 0) {
				altLabelOverride = null;
			}
		} else {
			altLabelOverride = null;
		}
	}

	function applyAltLabelOverride(text) {
		if (!text) {
			return;
		}
		if (translation && translation.innerHTML) {
			translation.innerHTML["enter-display-name"] = text;
		}
		miscTranslations["enter-display-name"] = text;
	}
	
	try {
		if (ConfigSettings) {
			ln_template = ConfigSettings.getAttribute("data-translation"); // Translations
			if (typeof ln_template === "undefined") {
				ln_template = false;
			} else if (ln_template === null) {
				ln_template = false;
			}
		}

		if (urlParams.has("ln") || urlParams.has("language")) {
			ln_template = urlParams.get("ln") || urlParams.get("language") || null;
		} else if (session.language) {
			ln_template = session.language;
		} else {
			const storedLanguage = localStorage.getItem("vdo_ninja_language");
			if (storedLanguage) {
				ln_template = storedLanguage;
				session.language = storedLanguage;
			}
		}
	} catch (e) {
		errorlog(e);
	}
	
	if (ln_template === null) {
		// Only show menu if not in auth mode
		if (!urlParams.has("auth") && !urlParams.has("requireauth")) {
			getById("mainmenu").style.opacity = 1;
		}
	} else if (ln_template !== false) {
		// checking if manual lanuage override enabled
		try {
			log("Lang Template: " + ln_template);
			await changeLg(ln_template);
			if (altLabelOverride) {
				applyAltLabelOverride(altLabelOverride);
			}
			// Only show menu if not in auth mode
			if (!urlParams.has("auth") && !urlParams.has("requireauth")) {
				//getById("mainmenu").style.opacity = 1;
			}
		} catch (error) {
			errorlog(error);
			// Only show menu if not in auth mode
			if (!urlParams.has("auth") && !urlParams.has("requireauth")) {
				getById("mainmenu").style.opacity = 1;
			}
		}
	}
	
	// Initialize authentication if enabled
	if (window.vdoAuth) {
		getById("mainmenu").classList.add("hidden2");
		getById("header").classList.add("hidden2");
		
		await window.vdoAuth.init();
		// Menu visibility is now handled by auth completion
		if (session.authMode && (session.authToken || session.authSkipped)) {
			getById("mainmenu").style.opacity = 1;
		}
	}
	
	if (location.hostname !== "vdo.ninja" && location.hostname !== "backup.vdo.ninja" && location.hostname !== "proxy.vdo.ninja" && location.hostname !== "alt.vdo.ninja" && location.hostname !== "obs.ninja") {
		errorReport = false;

		if (location.hostname === "rtc.ninja") {
			try {
				if (session.label === false) {
					document.title = "RTC.Ninja";
				}
				getById("qos").innerHTML = "";
				getById("logoname").innerHTML = "";
				getById("helpbutton").style.display = "none";
				getById("helpbutton").style.opacity = 0;
				getById("reportbutton").style.display = "none";
				getById("reportbutton").style.opacity = 0;
				getById("dropButton").classList.add("hidden");
				getById("container-4").classList.add("hidden");
				if (!(urlParams.has("screenshare") || urlParams.has("ss"))) {
					getById("container-2").classList.add("hidden");
				}
				//getById("mainmenu").style.opacity = 1;
				getById("mainmenu").style.margin = "30px 0";
				getById("translateButton").style.display = "none";
				getById("translateButton").style.opacity = 0;
				// getById("legal").style.display = "none";
				// getById("legal").style.opacity = 0;
				getById("info").style.display = "none";
				getById("info").style.opacity = 0;
				getById("chatBody").innerHTML = "";
			} catch (e) {}
		} else if (session.label === false) {
			document.title = location.hostname;
		}
		try {
			if (ln_template === false) {
				if (location.hostname === "china.vdo.ninja") {
					changeLg("cn").then(() => {
						if (altLabelOverride) {
							applyAltLabelOverride(altLabelOverride);
						}
					});
				} else {
					changeLg("blank").then(() => {
						if (altLabelOverride) {
							applyAltLabelOverride(altLabelOverride);
						}
					});
				}
			}
			if (location.hostname === "china.vdo.ninja") {
				session.wss = "wss://china.rtc.ninja:8443";
			}
			//getById("mainmenu").style.opacity = 1;

			getById("qos").innerHTML = '<i class="las la-plug"></i>';
			getById("logoname").innerHTML = getById("qos").outerHTML;
			getById("helpbutton").style.display = "none";
			getById("reportbutton").style.display = "none";
			getById("chatBody").innerHTML = "";
			getById("qos").style.color = "#FFF7";
			//getById("qos").style.fontSize = "70%";
			getById("logoname").style.display = "none";
			getById("logoname").style.margin = "0 0 0 5px";
		} catch (error) {
			getById("mainmenu").style.opacity = 1;
			errorlog(error);
		}
	} else {
		// check if automatic language translation is available
		getById("mainmenu").style.opacity = 1;
		
		if (location.hostname === "alt.vdo.ninja"){
			session.wss = "wss://china.rtc.ninja:8443";
		} 
	}

	if (altLabelOverride) {
		applyAltLabelOverride(altLabelOverride);
	}

		//// translation stuff ends ////

	if (urlParams.has("cleanoutput") || urlParams.has("clean") || urlParams.has("cleanish")) {
		session.cleanOutput = true;
	}
	if (urlParams.has("mutestatus") || urlParams.has("showmutestate") || urlParams.has("showmuted")){
		session.showMuteState = true;
	}
	if (urlParams.has("unmutestatus") || urlParams.has("showunmutestate") || urlParams.has("showunmuted")){
		session.showUnMuteState = true;
	}
	if (urlParams.has("cleanviewer") || urlParams.has("cv")) {
		session.cleanViewer = true;
	}

	if (session.cleanOutput || session.cleanViewer) {
		session.audioMeterGuest = false;
	}

	// Track whether we should swap the default tone for the louder knock sample
	if (typeof session.knockToneEnabled === "undefined") {
		session.knockToneEnabled = false;
	}

	if (urlParams.has("hidehome")) {
		session.hidehome = true;
	}
	hideHomeCheck();
	
	if (window.obsstudio || isMELD) {
		session.studioSoftware = true;
		getById("saveRoom").style.display = "none"; // don't let the user save the room if in OBS
	}

	if (urlParams.has("previewmode")) {
		session.switchMode = true;
	}
	try {
		if (sessionStorage.getItem("deleteWhipOnLoad")) {
			let deleteWhip = sessionStorage.getItem("deleteWhipOnLoad");
			let deleteWhipObj = JSON.parse(deleteWhip);
			
			if (deleteWhipObj.location) {
				try {
					let targetUrl = new URL(deleteWhipObj.location);
					targetUrl.protocol = window.location.protocol;
					
					let xhttp = new XMLHttpRequest();
					xhttp.open("DELETE", targetUrl.toString(), true);
					if (deleteWhipObj.whipOutputToken) {
						xhttp.setRequestHeader("Authorization", "Bearer " + deleteWhipObj.whipOutputToken);
					}
					xhttp.send();
				} catch(e) {
					log(e);
				}
			}
			sessionStorage.removeItem("deleteWhipOnLoad");
		}
	} catch (e) {
		errorlog(e);
	}


	if (urlParams.has("director") || urlParams.has("dir")) {
		session.director = urlParams.get("director") || urlParams.get("dir") || session.roomid || urlParams.get("roomid") || urlParams.get("r") || urlParams.get("room") || filename || true;
		session.effect = null; // so the director can see the effects after a page refresh
		getById("avatarDiv3").classList.remove("hidden"); // lets the director see the avatar option
	}
	
	if (urlParams.has("feedbackbutton") || urlParams.has("fb")) {
		getById("unmuteSelf").classList.remove("hidden"); // lets the director see the avatar option
		//session.selfVolume = urlParams.get("fb") || null;
		session.selfVolume = urlParams.get("feedbackbutton") || urlParams.get("fb") || null;
		if (session.selfVolume){
			getById("unmuteSelf").setAttribute("title", `Hear yourself at ${parseFloat(session.selfVolume)}% volume`);
			getById("unmuteSelf").setAttribute("alt", `Hear yourself at ${parseFloat(session.selfVolume)}% volume`);
		}
	}

	if (urlParams.has("controls") || urlParams.has("videocontrols")) {
		session.showControls = true; // show the video control bar

		if (urlParams.get("controls") === "false") {
			session.showControls = false;
		} else if (urlParams.get("controls") === "0") {
			session.showControls = false;
		} else if (urlParams.get("controls") === "off") {
			session.showControls = false;
		}
	}
	if (urlParams.has("forcecontrols")) {
		session.showControls = 2;
		function keepControls() {
			var tmp = document.activeElement;
			document.querySelectorAll("video").forEach(ele => {
				ele.focus();
				ele.removeAttribute("controls");
				ele.setAttribute("controls", "");
			});
			tmp.focus();
		}
		getById("main").classList.add("forcecontrols");
		setInterval(function () {
			keepControls();
		}, 100);
	}
	if (urlParams.has("nocontrols")) {
		session.showControls = false; // show the video control bar
	}

	if (!isIFrame && !session.studioSoftware) {
		if (ChromiumVersion === 65) {
			// pass, since probably manycam and that's bugged
		} else if (getStorage("redirect") == "yes") {
			setStorage("redirect", "", 0);
			session.sticky = true;
		} else if (getStorage("settings") != "") {
			var URLGOTO = getStorage("settings");
			if (URLGOTO && URLGOTO.startsWith("https://")) {
				if (URLGOTO === window.location.href) {
					// continue, as its already matched
				} else if (!session.cleanOutput) {
					window.focus();
					document.body.classList.remove("hidden");

					session.sticky = await confirmAlt("Would you like to load your previous session?\n\nThis will redirect you to:\n\n" + URLGOTO, true);
					if (!session.sticky) {
						setStorage("settings", "", 0);
						log("deleting cookie as user said no");
					} else {
						var cookieSettings = decodeURI(URLGOTO);
						setStorage("redirect", "yes", 1);
						window.location.replace(cookieSettings);
					}
				} else {
					var cookieSettings = decodeURI(URLGOTO);
					setStorage("redirect", "yes", 1);
					window.location.replace(cookieSettings);
				}
			}
		}

		if (urlParams.has("sticky")) {
			// won't work with iframes.

			//if (getStorage("permission") == "") {
			//	session.sticky = confirm("Would you allow us to store a cookie to keep your session settings persistent?");
			//} else {
			session.sticky = true;

			getById("saveRoom").style.display = "none";
			//}
			//if (session.sticky) {
			setStorage("permission", "yes", 999);
			setStorage("settings", encodeURI(window.location.href), 90);
			//}
		}
	} else if (isIFrame && !window.obsstudio && urlParams.has("sticky")) {
		session.sticky = true;
		getById("saveRoom").style.display = "none";
	}

	if (urlParams.has("safemode")) {
		session.safemode = true; // load defa
	} else {
		session.store = {};
		try {
			loadSettings();
		} catch (e) {
			errorlog(e);
		}
	}

	if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) {
	  try {
		//getById("electronDragZone").style.cursor="grab";
		//getById("header").style.height = "max(calc(2% + 20px), 40px)";
		
		// Override window.prompt to use Electron's dialog via the contextBridge
		if (window.electronApi && window.electronApi.prompt) {
		  window.prompt = function (title, val) {
			return window.electronApi.prompt({ title, val });
		  };
		} else {
		  warnlog("electronApi prompt function not available");
		}

		const dragZone = document.getElementById("electronDragZone");
		if (dragZone) {
			dragZone.style.display = "block";
			dragZone.style.setProperty("-webkit-app-region", "drag");
		}

		const header = document.getElementById("header");
		if (header) {
			const interactiveSelectors = [
				"a",
				"button",
				"input",
				"select",
				"textarea",
				"[role='button']",
				"[onclick]"
			];

			header.querySelectorAll(interactiveSelectors.join(",")).forEach(node => {
				node.style.setProperty("-webkit-app-region", "no-drag");
				if (!node.style.pointerEvents || node.style.pointerEvents === "") {
					node.style.pointerEvents = "auto";
				}
			});
		}
	  } catch (e) {
		console.error("Error setting up Electron prompt:", e);
	  }
	}

	if (window.electronApi && window.electronApi.exposeDoSomethingInWebApp) {
		window.electronApi.exposeDoSomethingInWebApp(function (fauxEventData) {
			//alert("WORKS");
			//errorlog("WORKS!");
			session.remoteInterfaceAPI(fauxEventData);
		});
		if (window.electronApi.updateVersion){
			window.electronApi.updateVersion(session.version);
		}
	}

	if (urlParams.has("retrytimeout")) {
		session.retryTimeout = parseInt(urlParams.get("retrytimeout")) || 5000;
		if (session.retryTimeout < 5000) {
			session.retryTimeout = 5000;
		}
	}

	if (urlParams.has("ptz")) {
		session.ptz = true;
	}

	if (urlParams.has("notios")) {
		iOS = false;
		iPad = false;
	}

	if (urlParams.has("optimize")) {
		session.optimize = parseInt(urlParams.get("optimize")) || 0;
	}

	if (urlParams.has("nosettings") || urlParams.has("ns")) {
		session.screensharebutton = false;
		session.showSettings = false;
	}

	if (urlParams.has("nomicbutton") || urlParams.has("nmb")) {
		getById("mutebutton").style.setProperty("display", "none", "important");
	}

	if (urlParams.has("novice")) {
		// Hiding advanced items
		document.querySelectorAll(".advanced").forEach(element => {
			element.classList.add("hide");
		});
	}

	if (urlParams.has("userbackgroundimage") || urlParams.has("userbgimage") || urlParams.has("ubgimg")) {
		// URL or data:base64 image. Becomes local to this viewer only.
		let defaultMedia = urlParams.get("userbackgroundimage") || urlParams.get("userbgimage") || urlParams.get("ubgimg") || "./media/backgrounds/1.png";
		if (defaultMedia) {
			try {
				defaultMedia = decodeURIComponent(defaultMedia);
			} catch (e) {}
			session.defaultMedia = defaultMedia;
			try {
				let fallbackImage = new Image();
				fallbackImage.src = defaultMedia;
			} catch (e) {}
		}
	}
	if (urlParams.has("userforegroundimage") || urlParams.has("overlayimage") || urlParams.has("overlayimg")) {
		// URL or data:base64 image. Becomes local to this viewer only.
		let defaultMedia = urlParams.get("userforegroundimage") || urlParams.get("overlayimage") || urlParams.get("overlayimg") || "./media/avatar1.png";
		if (defaultMedia) {
			try {
				defaultMedia = decodeURIComponent(defaultMedia);
			} catch (e) {}
			session.defaultOverlayMedia = defaultMedia;
			try {
				let fallbackImage = new Image();
				fallbackImage.src = defaultMedia;
			} catch (e) {}
		}
	}

	if (urlParams.has("avatarimg") || urlParams.has("bgimage") || urlParams.has("bgimg")) {
		// URL or data:base64 image. Becomes local to this viewer only.  This is like &avatar, but slightly different. Just CSS in this case
		let avatarImg = urlParams.get("avatarimg") || urlParams.get("bgimage") || urlParams.get("bgimg") || "./media/avatar1.png";
		if (avatarImg=="0" || avatarImg == "false" || avatarImg == "no"){
			if (session.disableBackground!==false){
				session.disableBackground = true;
			}
		} else if (avatarImg) {
			try {
				avatarImg = decodeURIComponent(avatarImg);
			} catch (e) {}
			try {
				let fallbackImage = new Image();
				fallbackImage.src = avatarImg;
				session.style = -1;
				fallbackImage.onload = function () {
					document.documentElement.style.setProperty("--video-background-image", 'url("' + avatarImg + '")');
					if (session.meterStyle !== 5) {
						document.documentElement.style.setProperty("--video-background-image-size", "contain");
					}
					session.disableBackground = false;
				};
			} catch (e) {}
		} else {
			if (session.disableBackground!==false){
				session.disableBackground = true;
			}
		}
	}
	if (urlParams.has("avatarimg2") || urlParams.has("bgimage2") || urlParams.has("bgimg2")) {
		// URL or data:base64 image. Becomes local to this viewer only.  This is like &avatar, but slightly different. Just CSS in this case
		let avatarImg2 = urlParams.get("avatarimg2") || urlParams.get("bgimage2") || urlParams.get("bgimg2") || "./media/avatar2.png";
		if (avatarImg2) {
			try {
				avatarImg2 = decodeURIComponent(avatarImg2);
			} catch (e) {}
			try {
				let fallbackImage2 = new Image();
				fallbackImage2.src = avatarImg2;
				fallbackImage2.onload = function () {
					document.documentElement.style.setProperty("--video-background-image-talking", 'url("' + avatarImg2 + '")');
					if (session.meterStyle !== 5) {
						document.documentElement.style.setProperty("--video-background-image-size", "contain");
					}
				};
				session.audioEffects = true;
				session.meterStyle = 4;
				session.style = -1;
				if (session.showControls === null) {
					session.showControls = false;
				}
			} catch (e) {}
		}
	}

	if (urlParams.has("avatarimg3") || urlParams.has("bgimage3") || urlParams.has("bgimg3")) {
		// URL or data:base64 image. Becomes local to this viewer only.  This is like &avatar, but slightly different. Just CSS in this case
		let avatarImg3 = urlParams.get("avatarimg3") || urlParams.get("bgimage3") || urlParams.get("bgimg3") || "./media/avatar3.png";
		if (avatarImg3) {
			try {
				avatarImg3 = decodeURIComponent(avatarImg3);
			} catch (e) {}
			try {
				let fallbackImage3 = new Image();
				fallbackImage3.src = avatarImg3;
				fallbackImage3.onload = function () {
					document.documentElement.style.setProperty("--video-background-image-screaming", 'url("' + avatarImg3 + '")');
					if (session.meterStyle !== 5) {
						document.documentElement.style.setProperty("--video-background-image-size", "contain");
					}
				};
				session.audioEffects = true;
				session.meterStyle = 4;
				session.style = -1;
				if (session.showControls === null) {
					session.showControls = false;
				}
			} catch (e) {}
		}
	}

	if (urlParams.has("background") || urlParams.has("appbg")) {
		// URL or data:base64 image.  Use &chroma if you want to use a color instead of image.
		let background = urlParams.get("background") || urlParams.get("appbg") || "./media/logo_cropped.png";
		if (background) {
			try {
				background = decodeURIComponent(background);
			} catch (e) {}
			try {
				background = 'url("' + background + '")';
				document.documentElement.style.setProperty("--background-main-image", background);
			} catch (e) {}
		}
	}

	if (urlParams.has("poster")) {
		// URL or data:base64 image. Becomes local to this viewer only.  This is like &avatar, but slightly different. Just CSS in this case
		let posterImage = urlParams.get("poster") || "./media/avatar.webp";
		if (posterImage) {
			try {
				posterImage = decodeURIComponent(posterImage);
				session.posterImage = posterImage;
			} catch (e) {}
		}
	}

	if (urlParams.has("hideplaybutton") || urlParams.has("hpb")) {
		// URL or data:base64 image. Becomes local to this viewer only.  This is like &avatar, but slightly different. Just CSS in this case
		try {
			document.getElementById("bigPlayButton").classList.add("hidden");
		} catch (e) {}
	}

	if (urlParams.has("whip") || urlParams.has("whipview")) {
		session.whipView = urlParams.get("whip") || urlParams.get("whipview") || false;
		if (session.whipView) {
			setTimeout(function () {
				whipClient();
			}, 1000);
		}
	}
	
	if (urlParams.has("noaudiowhipin")){
		session.forceNoAudioWhipIn = true;
	}
	if (urlParams.has("novideowhipin")){
		session.forceNoVideoWhipIn = true;
	}
	
	if (urlParams.has("autoreload")){
		let refreshInterval = parseInt(urlParams.get("autoreload")) || 60;
		if (refreshInterval){
			refreshInterval = refreshInterval*60*1000; // minutes to milliseconds
			setInterval(function(){
				session.hangup(true)
			}, refreshInterval);
		}
	}
	
	if (urlParams.has("autoreload24")) {
		let reloadTime = urlParams.get("autoreload24");
		
		// Parse the reload time
		let [hours, minutes] = reloadTime.split(':').map(Number);
		
		if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
			let now = new Date();
			let reloadDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
			
			// If the reload time has already passed today, schedule for tomorrow
			if (reloadDate <= now) {
				reloadDate.setDate(reloadDate.getDate() + 1);
			}
			
			let timeUntilReload = reloadDate.getTime() - now.getTime();
			
			setTimeout


