$(function() {
	$.fn.extend({
		game: function(options){

			// Global Options //
			var defaults = {
				feed : "data/gamedata.json"
			}
			var opts = $.extend(defaults, options);
			var root = $(this);
			var gameData = [];
			var turnIndex = 0;
			var gameEnded = false;
			var charsAllowed = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',' '];

			var turnWord = "";
			var turnInput = "";
			var turnGoodChars = "";
			var turnBadChars = "";
			var turnTriesLeft = 5;
			
			// User Agent Variables
			var isPhone = false;
			var isIpad = false;


			// Getters & Setters //
			function setGameData(data){
				gameData = data;
			}
			function getGameData(){
				return gameData;
			}
			function setTurnIndex(id){
				turnIndex = id;
			}
			function getTurnIndex(){
				return turnIndex;
			}
			function setTurnWord(word){
				turnWord = word;
			}
			function getTurnWord(){
				return turnWord;
			}
			function setTurnInput(word){
				turnInput = word;
			}
			function getTurnInput(){
				return turnInput;
			}
			function setTurnGoodChars(chars){
				turnGoodChars = chars;
			}
			function getTurnGoodChars(){
				return turnGoodChars;
			}
			function setTurnBadChars(chars){
				turnBadChars = chars;
			}
			function getTurnBadChars(){
				return turnBadChars;
			}
			function setTurnTriesLeft(numb){
				turnTriesLeft = numb;
			}
			function getTurnTriesLeft(){
				return turnTriesLeft;
			}
			function setAllowedChars(chars){
				charsAllowed = chars;
			}
			function getAllowedChars(){
				return charsAllowed;
			}
			function setWordGuessed(bool){
				wordGuessed = bool;
			}
			function getWordGuessed(){
				return wordGuessed;
			}
			function setGameEnded(bool){
				gameEnded = bool;
			}
			function getGameEnded(){
				return gameEnded;
			}
			function setIsPhone(bool){
				isPhone = bool;
			}
			function getIsPhone(){
				return isPhone;
			}
			function setIsIpad(bool){
				isIpad = bool;
			}
			function getIsIpad(){
				return isIpad;
			}
			function setUserAgent(){
				// Detect User Agent
				if(navigator.userAgent.match(/Android/i) ||
					navigator.userAgent.match(/webOS/i) ||
					navigator.userAgent.match(/iPhone/i) ||
					navigator.userAgent.match(/iPod/i)) {
					setIsPhone(true);					
				}
				if(navigator.userAgent.match(/iPad/i)){
					setIsIpad(true);
				}
			}

			// Functions //
			function init(){
				loadGame();
				setUserAgent();
			}

			function loadGame(){
				if(opts.feed){
					$.ajax({
						url: opts.feed,
						dataType: "json",
						success: function(data) {
							setupGame(data);
						}
					});
				}
			}

			function setupGame(data){
				setGameData(data);				// Store data locally
				createGameStructure(data);		// Create html elements
				var ti = getTurnIndex();		// Get first index
				newTurn(ti);					// Initialize new turn
				console.log('setupGame(): startTurn()');
				startTurn();					// Start first turn automatically
			}

			function newTurn(index){
				var data = getGameData();
				resetTurn();
				setTurnIndex(index);
				setTurnWord(data[index].word);
				createTurnStructure(index);

				console.log('newTurn(): updateInputWord()');
				updateInputWord();				// Setup input word area				
			}

			function createGameStructure(data){
				$.each(data, function(index, item) {
					var el = $('<li class="row_'+index+'"></li>');
					$("#game").append(el);
				});
			}

			function createTurnStructure(index){
				// Select Row & Append Form
				el = $("#game").find(".row_"+index);
				el.addClass("selected");
				appendForm(el);
			}

			function getTriesText(){
				var phone = getIsPhone();
				var text;
				if(phone){
					text = "";
				}else{
					text = "Tries left: "
				}
				return text;
			}

			function appendForm(el){
				el.append('<div class="word"><div class="cursor"></div></div>');
				el.append('<div class="mask"></div>');
				el.append('<input type="text" id="wordinput">');
				$("#wordinput").focus();
				touchClick();
				$(".tries").text(getTriesText()+getTurnTriesLeft()+'');
			}


			function touchClick(){ 							// iOs devices only show keyboard after user action
				$('.selected').click(function(event) {
					$("#wordinput").focus();
				});
			}

			function removeForm(el){
				el.empty();
				$('.error').empty();
			}

			function reconstructOutput(){
				var windowWidth = $(window).width();

				if(windowWidth>768){
					$('.output').remove();
					$('')
				}
			}

			function appendGuessedWord(data,index,row){
				var word = capFirstLetter(data[index].word);
				row.append($('<span class="guessed animated flash">'+word+'</span>')).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
					function(){
						if(!getGameEnded()){
							startTurn();
						}
					});
			}
			
			function capFirstLetter(string){
			    return string.charAt(0).toUpperCase() + string.slice(1);
			}

			function placeGuessedWord(){
				var currentTurn = getTurnIndex();
				var prevTurn = currentTurn-1;
				var data = getGameData();

				// If game has ended, append to current row
				if(getGameEnded()){
					el = $("#game").find(".row_"+currentTurn);
					appendGuessedWord(data,currentTurn,el);
					console.log("placeGuesssedWord() in final turn=",data[currentTurn].word, currentTurn);
				// If turn has ended, append to previous row
				}else{
					el = $("#game").find(".row_"+prevTurn);
					appendGuessedWord(data,prevTurn,el);
					console.log("placeGuesssedWord() in previous turn=",data[prevTurn].word);
				}		
			}

			function resetTurn(){
				
				endTurn();
				var current = getTurnIndex();

				// Reset all turnbased variables
				setTurnWord("");
				setTurnInput("");
				setTurnGoodChars("");
				setTurnBadChars("");
				setTurnTriesLeft(5);

				// Remove current selected class
				el = $("#game").find(".row_"+current);
				removeForm(el);
				el.removeClass("selected");

				// Hide Output
				$('.outputwrapper').addClass('hidden');
			}

			function nextTurn(){
				var current = getTurnIndex();
				var data = getGameData();
				
				console.log("nextTurn() says: current turn=",current,data.length);
				
				$.each(data, function(index, item) {
					
					if(data.length > current+1){ 			// Is next turn out of range, then game has ended
						if(current+1 == index){ 
							console.log("nextTurn() says: next turn=",index);
							newTurn(index);
						}
					}else{
						console.log("nextTurn() says: game ended");
						setGameEnded(true);
						resetTurn();
						return false;
					}
				});
			}

			function isAllowed(key){
				var check = $.inArray(key, getAllowedChars());
				if(check > -1){
					return key;
				}else{
					console.log('Only letters and spaces are allowed.');
				}
				
			};

			function startTurn(){
				$('.cursor').addClass('animateCursor');
				$(root).keypress(function(event) {
					var key = isAllowed(String.fromCharCode(event.which).toLowerCase()); // Only allowed chars will fire event
					$('.cursor').removeClass('animateCursor');

					if(!hasGuessed(key)){
						if(inWord(key)){
							setTurnGoodChars(getTurnGoodChars()+key);
							console.log('startTurn(): updateInputWord()');
							updateInputWord(key);
						}else{
							setTurnBadChars(getTurnBadChars()+key);
							setTurnTriesLeft(turnTriesLeft-1);
							displayTriesLeft();
							displayBadWord(key);
						}
					}
					if(hasTurnEnded()){
						endTurn();
						nextTurn();									// Start next turn or end game
						placeGuessedWord();							// Run after nextTurn()
						endAnimation();
					}
				});
			}

			function hasTurnEnded(){
				var inputWord = getTurnInput();
				var currentWord = getTurnWord();
				var t = ["Sweet!", "Bummer!"];
				var i = ["img/circle.png", "img/bummer.png"];

				if((inputWord === currentWord) || (getTurnTriesLeft()==0)) {
					if(inputWord === currentWord){
						console.log('>>>> word has been guessed');
						// displayOverlay(t[0],i[0]);					// text: Sweet! img: ok
					}else if(getTurnTriesLeft()==0){
						console.log('>>>> too many wrong letters');
						// displayOverlay(t[1],i[1]);					// text: Bummer! img: x
					}
					return true;
				}else{
					return false;
				}
			}

			function endTurn(){
				$("#wordinput").blur();
				$(root).unbind("keypress");
			}

			function hasGuessed(char){
				var guessed = getTurnGoodChars()+getTurnBadChars();
				if(guessed.search(char) === -1){
					return false;
				}else{
					return true;
				}
			}

			function inWord(char){
				var currentWord = getTurnWord();
				if(currentWord.search(char) === -1){
					return false;
				}else{
					return true;
				}
			}

			function updateInputWord(key){
				var good = getTurnGoodChars();
				var inputWord = getTurnInput();
				var currentWord = getTurnWord();
				var patt = new RegExp("[^" + good + "]", "g");
				inputWord = currentWord.replace(patt, " ");
				
				setTurnInput(inputWord);
				
				console.log("updateInputWord(): inputWord=",inputWord);

				displayGoodWord(key);
			}

			function findLetterPositions(word,letter) {
				var startIndex = 0;								// Initial starting point
				var foundIndex;
				var indices = [];

				while ((foundIndex = word.indexOf(letter, startIndex)) > -1) { // While there is still a match
					indices.push(foundIndex);					// Push the matching index to array
					startIndex = foundIndex+1;					// Move 1 char to the right, beyond found letter
				}
				return indices;
			}

			function displayGoodWord(key){
				var index = getTurnTriesLeft();	
				var tw = getTurnWord();
				var w = getTurnInput();
				var el = $(".word");
				var indices = findLetterPositions(tw, key);
				var guessed = getTurnGoodChars()+getTurnBadChars();
				var border;

				console.log("turninput",w,indices);			
				if(guessed==""){
					// Render word with spaces
					for(i = 0; i < tw.length; i++){
						if(tw[i]==' '){
							border = "";
						} else{
							border = "borderbottom";
						}
						el.append($('<div class="letter '+border+'"><span data-letter-index="'+i+'"> </span></div>'));
					}
				}else{
					// Only replace new letters
					for(j=0; j < indices.length; j++){
						$("span[data-letter-index="+indices[j]+"]").empty().text(key).addClass('moveUp');
					}
				}
			}

			function displayBadWord(key){
				$('#wrong').addClass('animateOutput').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
					function(){
						$(this).removeClass('animateOutput');
					});
				$('.outputwrapper').removeClass('hidden');
				$('.error').append('<span class="animateWrongLetterColor">'+key+'</span>');
			}

			function displayTriesLeft(){
				var w = getTurnTriesLeft();
				$(".tries").text(getTriesText()+w);
			}

			function displayOverlay(t,i){
				var ol = $('.overlay');
				var icon = $('#icon');
				var m = $('#message');
				var current = getTurnIndex();
				var rowColor = $("#game").find(".row_"+current).css('color');

				continueClick();							// Initialize click listener
				m.text(''+t+'');
				icon.attr("src",''+i+'');
				ol.removeClass('hidden');
				icon.addClass('animated bounceIn');
				ol.css('backgroundColor', rowColor);
			}

			function continueClick(){
				$('#continue').click(function(event) {
					
					startTurn();							// Start next turn
					console.log('click: startTurn()');

					$('.overlay').addClass('hidden');
					endAnimation();
					$("#wordinput").focus();
					$(this).unbind();						// To prevent double or triple firing
				});
			}

			function endAnimation(){
				var data = getGameData();
				var delay = 0;
				var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

				if(getGameEnded()){
					$('.output').remove();

					setTimeout(function(){
						$.each(data, function(index, item) {
							var el = $('<div class="bar_'+index+'"></div>');
							var rowColor = $("#game").find(".row_"+index).css('color');
							$(".row_"+index).append(el);
							el.css('backgroundColor', rowColor);
							el.addClass('animateBarWidth').css('-webkit-animation-delay',''+delay+'s').one(animationEnd, 
								function(){
									$(this).css('width', '100%');
								});
							delay +=0.1;
						});
					}, 2000);
					setTimeout(function(){
						$('#game').append('<div class="end"><div class="rotate"><div id="available">available</br>now!</div></div><img id="sticker" src="img/sticker.png" alt="sticker" width="200"/></div>');
						$('#available').addClass('animated bounceIn');
						
						$('#sticker').addClass('animated bounceIn').one(animationEnd, 
							function(){
								$(this).removeClass('animated bounceIn').addClass('animateRotation');
								$('.in2').css('fill','#ffffff');
								
								setTimeout(function(){
									$('.mail2').css('fill','#ffffff');
								}, 500);
								
								$('.in2, .mail2').hover(
									function() {
										$(this).css('fill','#58595B');
									},function(){
										$(this).css('fill','#fff');
									});
							});
					}, 3400);
				}
			}

			init();

		}
	});
});