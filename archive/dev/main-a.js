$(function() {
	$.fn.extend({
		game: function(options){
			var defaults = {
				wrapper : '#game',
				feed : 'data/gamedata.json',

				start : 0, //startpunt in de json file
				tries : 5
			};

			// extend defaults with game options
			var o = $.extend(defaults, options);
			var root = $(this);

			var currentWordIndex = o.start;
			var currentWord = "";

			var inputWord = "";
			var goodChars = "";
			var badChars = "";
			var triesLeft = o.tries;
			var gameData = [];

			function init(){
				loadGameData();
			};

			function loadGameData(){
				if(o.feed){
					$.ajax({
						url: o.feed,
						dataType: "json",
						success: function(data) {
							setupGame(data);
							// make data globally accessible
							gameData = data;
						}
					});
				}
			}

			function setupGame(d){ 
				if(o.wrapper){
					// setup elements
					$wrap = root.find(o.wrapper);
					$.each(d, function(index, elem) {
						// create element for each data entry
						var el = $('<li data-index="'+index+'" class="row_'+index+'"></li>');
						$wrap.append(el);

						if(d.length > o.start){ //check of het startpunt niet verder ligt dan de lengte van de array

							if(o.start == index){ //only if the starting point equals an index, set it to "selected"

								// select start entry
								el.addClass("selected");
								// append form
								appendForm(el);
								// new turn start entry
								newTurn(elem,index); //reset variables, set new word, start keylistener
								
								return;
							} else{
							}

						}else{
							console.log("note: not enough data entries");
						}
					});
				}
			}

			//je wilt het misschien nog open houden of je een van de woorden kunt aanklikken, dwz met welk woord je begint
			//je wilt nadat je het eerste woord goed geraden hebt dit op de eerste plek tonen. als je het fout hebt, 
			//dan moet het eigenlijk ook getoond worden met iets van een message: try again ofzo
			//in alle gevallen gaat het actieve woord naar de volgende plek
			//heb je deze goed, dan moet ie weer op die plek getoond worden, daarna gaat ie als er nog woorden over zijn naar de volgende
			//als alle woorden op zijn ga je door naar de epilepsie animaties


			// bijhouden welke indexes je geraden hebt, die woorden tonen
			// 
			
			function updateGame(){
				var currentEl = $('li[data-index='+currentWordIndex+']');
				var prevEl = $('li[data-index='+(currentWordIndex-1)+']');
				prevEl.removeClass('selected');
				currentEl.addClass('selected');
				appendForm(currentEl);
				newTurn(gameData, currentWordIndex);
				
				console.log(currentWord);
			}

			function appendForm(el){
				el.append('<div class="word"></div>');
				el.append('<div class="error"></div>');
				el.append('<input type="text" id="wordinput">');
				$("#wordinput").focus();
			}

			function newTurn(d,i){ //reset variables and new word, start keylistener
				resetGame();
				setWord(d.word,i);
				startKeyListener();
			}
			
			function resetGame(){
				currentWord = "";
				inputWord = "";
				goodChars = "";
				badChars = "";
				triesLeft = o.tries;
			}

			function setWord(w,i){
				currentWord = w;
				currentWordIndex = i;
				console.log(currentWord,currentWordIndex);
			}

			function removeForm(el){
				el.empty();
			}

			function showGoodWord(w){
				$(".word").text(w);
			}
			function showBadWord(w){
				$(".error").text(w);
			}

			function hasGuessed(char){
				var guessed = goodChars+badChars;
				if(guessed.search(char) === -1){
					return false;
				}else{
					return true;
				}
			}

			function addToGuessed(char,good){
				if(good){
					goodChars += char;
				}else{
					badChars += char;
				}
			}

			function updateInputWord(){
				var patt = new RegExp("[^" + goodChars + "]", "g");	
				inputWord = currentWord.replace(patt, "_");

				showGoodWord(inputWord);
				console.log(inputWord);
			}

			function updateBadWord(){
				showBadWord(badChars);
			}

			function wordsMatch(){
				if(inputWord === currentWord){
					return true;
				}else{
					return false;
				}
			}

			function inWord(char){
				if(currentWord.search(char) === -1){
					console.log("niet erin");
					return false;
				}else{
					console.log("wel erin");
					return true;
				}
			}



			function startKeyListener(){
				$(root).keypress(function(event) {
					
					var k = String.fromCharCode(event.which).toLowerCase();
					
					if(!hasGuessed(k)){
						if(inWord(k)){
							addToGuessed(k,true);
							updateInputWord();
						}else{
							addToGuessed(k,false);
							updateBadWord();
							triesLeft --;
						}
					} else {

					}

					if(triesLeft === 0){
						alert("no no no!");
					}

					if(wordsMatch()){
						console.log("hatsjikidee");
						removeForm($('li[data-index='+currentWordIndex+']'));
						currentWordIndex ++;

						updateGame();
					}

					console.log(triesLeft);

				});
			}


			// initialize
			init();

		}
	});
});