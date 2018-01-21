/*
 * Create a list that holds all of your cards
 */

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

var noOfMoves = 0;
var cardTypes = ['diamond', 'paper-plane-o', 'bolt', 'cube', 'anchor', 'leaf', 'bicycle', 'bomb'];
var openCards = [];
var $deck = $('.deck');
var $restartButton = $('.restart');
var $moves = $('.moves');
var cardClass = '.card';
var cardSymbolClass = '.card .fa';
var rating;
var ratingInterval;
var timeTaken;

(function init() {
	loadGrid();
	$restartButton.click(reset);
	$deck.on('click', cardClass, handleCardClick);
	$deck.on('click', cardSymbolClass, stopPropagationIfMatched);
})();


function loadGrid() {
	// Randomly arrange the cards in a grid
	var grid = cardTypes.concat(cardTypes);
	var shuffledGrid = shuffle(grid);

	resetPlayGround();

	for (index in shuffledGrid) {
		$deck.append(getCardHtml(shuffledGrid[index]));
	}
	// Store current timer in a variable to clear later
	ratingInterval = setInterval(function () {
		// If 15 moves are made, reduce the rating
		if (noOfMoves % 15 === 0 && rating > 1) {
			$('.star-rating-' + rating).removeClass('fa-star').addClass('fa-star-o');
			rating--;
		}
		// Display timer in minutes and seconds
		$('.minutes').text(parseInt(timeTaken / 60, 10));
		$('.seconds').text(timeTaken % 60);
		timeTaken++;
	}, 1000);
}

function resetPlayGround() {
	// Reset grid, timer and star rating
	$deck.text('');
	rating = 3;
	timeTaken = 0;
	$('.minutes').text(0); 
	$('.seconds').text(0);
	if (ratingInterval) {
		// Clear existing timer to start everything from 0
		clearInterval(ratingInterval);
	}
	$moves.text(noOfMoves);
	$('.fa-star-o').removeClass('fa-star-o').addClass('fa-star')
}

// Pre-provided function
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function getCardHtml(cardType) {
	// Generate HTML string from the card type to put on the grid
	return $('<li class="card animated"><i class="fa fa-' + cardType + '"></i></li>');
}

function reset() {
	// Reset the complete game
	noOfMoves = 0;
	openCards = [];
	rating = 3;
	loadGrid();
	// Hide the success screen
	$('#game-complete').css({
		display: 'none'
	});
}


function handleCardClick(e) {
	var $target = $(e.target);
	var currentCardType;
	var lastCardType;
	// Open card only if it is unopened
	if (!$target.hasClass('open')) {
		showCard($target);
	}

	// If open cards has even number of elements, means one move has completed
	if (openCards.length % 2 === 0) {
		updateNumberOfMoves();
		lastCardType = openCards[openCards.length - 2];
		currentCardType = openCards[openCards.length - 1];
		// Mark cards if matched
		if (currentCardType === lastCardType) {
			$('.fa-' + currentCardType).parent().addClass('match');
		} else {
			// Mark current match as wrong and reset cards to old position
			markWrong(lastCardType, currentCardType);
			resetCards(lastCardType, currentCardType);
		}

	}
	// If openCards = 16, means we have a game complete
	if (openCards.length === 16) {
		$('#game-complete').css({
			display: 'flex'
		});
		if (ratingInterval) {
			// Stop the timer
			clearInterval(ratingInterval);
		}
		$('.rating').text(rating);
	}
}

/*
Gets a card type from card element, and marks appropriate classes
Adds the current card type to open cards array 
*/
function showCard($card) {
	var currentCardType = getCardType($card);
	$card.addClass('open show');
	flipEffect($card);
	openCards.push(currentCardType);
}


// Finds the card type from the card HTML element 
function getCardType($element) {
	for (index in cardTypes) {
		if ($element.find('.fa-' + cardTypes[index]).length) {
			return cardTypes[index];
		}
	}
}

// Update number of moves
function updateNumberOfMoves() {
	noOfMoves++;
	$('.moves').text(noOfMoves);
}

// Marks current and last card wrong by adding classes and animation
function markWrong(lastCardType, currentCardType) {
	var $lastCard = getCardElement(lastCardType);
	var $currentCard = getCardElement(currentCardType);
	$lastCard.addClass('wrong-match');
	$currentCard.addClass('wrong-match');
	shakeEffect($lastCard);
	shakeEffect($currentCard);
}

// Get HTML card element from card type
function getCardElement(cardType) {
	return $('.open .fa-' + cardType).parent();
}


// Wait for a few milliseconds for animation to complete and close the cards
function resetCards(lastCardType, currentCardType) {
	setTimeout(function () {
		closeCard(lastCardType);
		closeCard(currentCardType);
	}, 900);
}


/*
Get card element from card type, and removes open card classes
Plus remove the card from openCards list
*/
function closeCard(cardType) {
	var $card = getCardElement(cardType);
	var index = openCards.indexOf(cardType);
	$card.removeClass('open show wrong-match');
	resetAnimations($card);
	if (index > -1) {
		openCards.splice(index, 1);
	}
}


// Resets the animation by removing all animation classes we used
function resetAnimations($target) {
	$target.removeClass('flipInY shake');
}

// Adds the shake effect class to card element
function shakeEffect($card) {
	resetAnimations($card);
	$card.addClass('shake');
}

// Adds the flip effect class to card element
function flipEffect($card) {
	resetAnimations($card);
	$card.addClass('flipInY');
}

// Trick to stop click from propagating to parent if parent is already open
function stopPropagationIfMatched(e) {
	if ($(e.target).parent().hasClass('match') || $(e.target).parent().hasClass('open')) {
		e.stopPropagation();
	}
}