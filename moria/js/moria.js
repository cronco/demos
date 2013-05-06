(function () {
	
	/*
	 * setMsg
	 */
	function setMsg(str) {
		msg.classList.remove('is-shown');
		setTimeout(function () { msg.innerHTML = str; }, 750);
		setTimeout(function () { msg.classList.add('is-shown'); }, 1500);
	}
	
	/*
	 * startScene
	 */
	function startScene() {
		scene.classList.add('is-loaded');
		aud_intro.play();
		aud_intro.addEventListener('timeupdate', function () {
			var finished = Math.ceil(this.currentTime) == Math.ceil(this.duration);
			if (finished) {
				doorReady();
			}
		});
	}
	
	/*
	 * doorReady
	 */
	function doorReady() {
		// Pause intro
		aud_intro.pause();
		// Activate door and show intructions
		scene.classList.add('is-ready');
		msg.classList.add('is-shown');
		
		setMsg('Gandalf seems to be having trouble opening the door. "Speak, friend, and enter" read the runes. What could it mean? Click on the door and see if you can crack it.')
		
		// Set up speech recognition
		if (speech) {
			// Create speech instance
			window.recognition = new webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = false;
			recognition.lang = 'en-GB';

			// Submit password when spoken
			recognition.onresult = function(event) {
				var result = getSpeechEventResult(event);

				checkPassword(result);
			};

			// Handle various audio input errors
			recognition.onerror = function(event) {
				if (event.error == 'no-speech') {
					setMsg('HINT: The door says speak up! (Or adjust your mic settings)')
				}
				if (event.error == 'audio-capture') {
					setMsg('HINT: The door claims your microphone is not installed or not working correctly. Try using the text field above instead.')
					keyb.classList.add('is-shown');
					recognition.stop();
				}
				if (event.error == 'not-allowed') {
					setMsg('HINT: You (or your browser/device) denied access to the microphone. Try using the text field above instead.')
					keyb.classList.add('is-shown');
					recognition.stop();
				}
			};
		}
		
		// Start listening for input when gate clicked
		gate.addEventListener('click', function (e) {
			if (!gate.classList.contains('is-open')) {
				if (speech) {
					recognition.start();
				} else {
					setMsg('No audio input support, falling back to keyboard input');
					keyb.classList.add('is-shown');
				}
			}
		});
	}
	
	/*
	 * checkPassword
	 */
	function checkPassword (pass) {
		pass = pass.toLowerCase();
		if ( pass == 'melon' || pass == 'mellon' ) {
			if (speech)
				recognition.stop();
			else
				keyb.classList.remove('is-shown');
			aud_open.play();
			gate.classList.add('is-open');
			var str = ['Well done! <strong>"Mellon"</strong> is the Elvish word for friend.'];
			if (speech) str.push('Of course, Chrome will only recognise English (or other Earth-language) words, so here we say "melon".');
			str.push('You may now continue on your quest!');
			setMsg(str.join("\n"));
		} else {
			setMsg('You said: <strong>' + pass + '</strong>. Try again.');
			aud_fool.play();
		}
	}
	
	/*
	 * getSpeechEventResult
	 */
	function getSpeechEventResult(event) {
		return event.results[event.resultIndex][0].transcript.trim();
	}
	
	// Init
	var speech = ('webkitSpeechRecognition' in window); // Speech API available?
	var scene = document.querySelector('.scene'); // Scene element
	var gate = document.querySelector('.gate'); // Gate element
	var keyb = document.querySelector('.keyb'); // Keyboard input pane
	var keybInput = document.getElementById('password');
	var msg = document.querySelector('.msg'); // Message element
	var skip = document.querySelector('.skip-intro');
	
	skip.addEventListener('click', doorReady);
	keyb.addEventListener('submit', function (e) {
		checkPassword(keybInput.value.trim());
		e.preventDefault();
	});
	
	// Get sounds
	var aud_intro = document.querySelector('.snd-intro'); // Intro
	var aud_fool = document.querySelector('.snd-fool'); // Try again
	var aud_open = document.querySelector('.snd-open'); // Door open
	
	// Start after images loaded
	var preloads = document.querySelector('.preload').getElementsByTagName('img');
	for ( var i = 0; i < preloads.length; i ++ ) {
		preloads[i].addEventListener('load', function(e) {
			var preloader = this.parentNode;
			preloader.removeChild(this);
			if (preloader.childNodes.length == 0) startScene();
		});
	}
})();
