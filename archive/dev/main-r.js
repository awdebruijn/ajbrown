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

			var turnWord = "";
			var turnInput = "";
			var turnGoodChars = "";
			var turnBadChars = "";
			var turnTriesLeft = 5;

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
				newTurn(ti);					// Start new turn
			}

			function newTurn(index){
				var data = getGameData();

				resetTurn();
				setTurnIndex(index);
				setTurnWord(data[index].word);
				createTurnStructure(index);				
				startTurn();
			}

			function createTurnStructure(index){
				// Select Row & Append Form
				el = $("#game").find(".row_"+index);
				el.addClass("selected");
				appendForm(el);
			}

			function createGameStructure(data){
				$.each(data, function(index, item) {
					var el = $('<li class="row_'+index+'"></li>');
					$("#game").append(el);
				});
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

			

			function appendForm(el){
				el.append('<div class="word"></div>');
				el.append('<div class="error"></div>');
				el.append('<input type="text" id="wordinput">');
				$("#wordinput").focus();
			}
			function removeForm(el){
				el.empty();
			}

			function nextTurn(){
				var current = getTurnIndex();
				var data = getGameData();

				$.each(data, function(index, item) {
					if(data.length > current){
						if(current+1 == index){
							newTurn(index);
							console.log("next",index);
						}
					}else{
						console.log("game ended");
						return false;
					}
				});
			}

			function startTurn(){
				$(root).keypress(function(event) {
					var key = String.fromCharCode(event.which).toLowerCase();
					if(!hasGuessed(key)){
						if(inWord(key)){
							setTurnGoodChars(getTurnGoodChars()+key);
							updateInputWord();
						}else{
							setTurnBadChars(getTurnBadChars()+key);
							displayBadWord();
							
						}
					}
					if(hasTurnEnded()){
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
				if(inputWord === currentWord){
					return true;
				}else{
					return false;
				}
			}

			function inWord(char){
				var currentWord = getTurnWord();
				if(currentWord.search(char) === -1){
					console.log("niet erin");
					return false;
				}else{
					console.log("wel erin");
					return true;
				}
			}

			function updateInputWord(){
				var good = getTurnGoodChars();
				var currentWord = getTurnWord();
				var patt = new RegExp("[^" + good + "]", "g");	
				inputWord = currentWord.replace(patt, "_");
				setTurnInput(inputWord);
				displayGoodWord();
				console.log(inputWord);
			}

			function displayGoodWord(){
				var w = getTurnInput();
				$(".word").text(w);
			}

			function displayBadWord(){
				var w = getTurnBadChars();
				$(".error").text(w);
			}


			init();

		}
	});
});