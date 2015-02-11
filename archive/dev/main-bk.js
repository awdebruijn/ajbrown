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
			var gameEnded = false;

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

			// Functions //
			function init(){
				loadGame();
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
				startTurn();					// Start first turn automatically
				continueClick();				// Initialize click listener
			}

			function newTurn(index){
				var data = getGameData();
				resetTurn();
				setTurnIndex(index);
				setTurnWord(data[index].word);
				createTurnStructure(index);
				updateInputWord();				// Setup input word area		
				//startTurn();					
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

			function appendForm(el){
				el.append('<div class="word"></div>');
				el.append('<div class="output"><span class="error"></span><span class="tries"></span></div>');
				el.append('<input type="text" id="wordinput">');
				$("#wordinput").focus();
				$(".error").text('Wrong: ');
				$(".tries").text(''+getTurnTriesLeft()+'');
			}

			function removeForm(el){
				el.empty();
			}

			function appendGuessedWord(data,index,row){
				var word = capFirstLetter(data[index].word);

				row.append($('<span class="guessed">'+word+'</span>'));
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
					console.log("guessed word in last turn=",data[currentTurn].word, currentTurn);
				// If turn has ended, append to previous row
				}else{
					el = $("#game").find(".row_"+prevTurn);
					appendGuessedWord(data,prevTurn,el);
					console.log("guessed word=",data[prevTurn].word);
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
			}

			function nextTurn(){
				var current = getTurnIndex();
				var data = getGameData();
				
				console.log("current turn:",current);
				
				$.each(data, function(index, item) {
					if(data.length > current+1){ 			// Is next turn out of range, then game has ended
						if(current+1 == index){ 
							newTurn(index);
							console.log("next turn",index);
							placeGuessedWord();
						}
					}else{
						console.log("game ended");
						setGameEnded(true);
						resetTurn();
						placeGuessedWord();
						return false;
					}
				});
			}

			function isAllowed(key){
				var check = $.inArray(key, getAllowedChars());
				if(check > -1){
					return key;
				}else{
					console.log('That key is not allowed');
				}
				
			};

			function startTurn(){
				$(root).keypress(function(event) {
					var key = String.fromCharCode(event.which).toLowerCase();
					if(!hasGuessed(isAllowed(key))){
						if(inWord(isAllowed(key))){
							setTurnGoodChars(getTurnGoodChars()+isAllowed(key));
							updateInputWord(isAllowed(key));
						}else{
							setTurnBadChars(getTurnBadChars()+isAllowed(key));
							setTurnTriesLeft(turnTriesLeft-1);
							displayTriesLeft();
							displayBadWord();
						}
					}
					if(hasTurnEnded()){
						console.log('turn ended');
						nextTurn();
					}
				});
			}

			function endTurn(){
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

			function hasTurnEnded(){
				var inputWord = getTurnInput();
				var currentWord = getTurnWord();
				var t = ["Sweet!", "Bummer!"];
				var i = ["img/circle.png", "img/bummer.png"];

				if((inputWord === currentWord) || (getTurnTriesLeft()==0)) {
					if(inputWord === currentWord){
						endTurn();
						displayOverlay(t[0],i[0]);	// text: Sweet! img: ok
						return true;
					}else if(getTurnTriesLeft()==0){
						endTurn();
						displayOverlay(t[1],i[1]);	// text: Bummer! img: x
						return true;
					}
				}else{
					return false;
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

				newLetterPositions(currentWord, key); // zoek naar de plaatsen van letter uit keyinput

				console.log(newLetterPositions(currentWord, key));

				inputWord = currentWord.replace(patt, " ");
				setTurnInput(inputWord);
				displayGoodWord();
				console.log(inputWord);
			}

			function newLetterPositions(word,letter) {
				var startIndex = 0;								// Initial starting point
				var foundIndex;
				var indices = [];

				while ((foundIndex = word.indexOf(letter, startIndex)) > -1) { // While there is still a match, -1 means no match
					indices.push(foundIndex);					// Push the matching index to array
					startIndex = foundIndex+1;					// Move 1 char to the right, beyond found letter
				}
				return indices;
			}

			function displayGoodWord(){
				var w = getTurnInput();
				var el = $(".word");
				el.empty();
				for(i = 0; i < w.length; i++){
					el.append($('<div class="letter" data-letter-index="'+i+'">'+w[i]+'</div>'));
				}
			}

			function displayBadWord(){
				var w = getTurnBadChars();
				$(".error").text('Wrong: '+w);
			}

			function displayTriesLeft(){
				var w = getTurnTriesLeft();
				$(".tries").text(w);
			}

			function displayOverlay(t,i){
				var ol = $('.overlay');
				var icon = $('#icon');
				var m = $('#message');
				var current = getTurnIndex();
				var rowColor = $("#game").find(".row_"+current).css('color');

				m.text(''+t+'');
				icon.attr("src",''+i+'');
				ol.removeClass('hidden');
				icon.addClass('animated bounceIn');
				ol.css('backgroundColor', rowColor);
			}

			function continueClick(){
				$('#continue').click(function(event) {
					startTurn();							// Start next turn
					$('.overlay').addClass('hidden');
					$("#wordinput").focus();
				});
			}

			init();

		}
	});
});