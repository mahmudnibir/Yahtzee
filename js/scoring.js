/*jshint esversion: 6 */

// Scoring holders
let numberOfYahtzees = 0;
let yahtzeeScore = 0;
let upperBonus = 0;
let upperSectionsFilled = 0;
let bonusActive = false;
let finalScore = 0;

// Selected duplicate dice information holder
let duplicates = {};

// DOM elements
const upperBonusScoreField = document.getElementById('upper-bonus-score');
const scoreMessage = document.getElementById('scoreMessage');
const finalScoreElement = document.getElementById('finalScore');
const yahtzeeLogo = document.getElementById('logo');
const opponentStatusText = document.getElementById('opponent-status-text');
const opponentScoreElement = document.getElementById('opponent-score');
const winnerMessage = document.getElementById('winnerMessage');

let computerScore = 0;
let computerCategories = [];

// Make an array with the score box elements
let scoreFields = [];
for (let i = 1; i < 14; i++) {
	scoreFields[i] = document.getElementById(i + '-score');
}

// Make an array with the speculative score box elements
let speculativeScoreTabs = [];
for (let i = 1; i < 14; i++) {
	speculativeScoreTabs[i] = scoreFields[i].nextSibling.nextSibling;
}

// Check if value can be found in given array
function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

// Return the sum of an array
function sumArray (array) {
	let summedArray = array.reduce(function(previousValue, currentValue) {
		return previousValue + currentValue;
	});

	return summedArray;
}

// Return the sum of specified duplicate values in an array
function sumDuplicates(value, array) {
	let count = 0;
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) {
			count++;
		}
	}
	return count * value;
}

// Update the duplicates object with the value & number of duplicates in an array
function countDuplicates(array) {
	duplicates = {};
	array.forEach (function(i) {
		duplicates[i] = (duplicates[i] || 0) + 1;
	});
}

// Check the status of upper section bonus
function updateUpperBonus () {
	if (upperSectionsFilled === 6 && upperBonus < 63) { // Upper section is full and bonus is not reached
		upperBonusScoreField.innerHTML = '&mdash;';
	} else if ( upperBonus < 63 ) { // Bonus not yet reached
		upperBonusScoreField.innerHTML = -63 + parseInt(upperBonus);
	} else { // Bonus reached
		upperBonusScoreField.innerHTML = 35;
		upperBonusScoreField.previousSibling.previousSibling.innerHTML = 'Bonus &#10003;';
		bonusActive = true;
	}
}

// Locking in score on upper section
function lockScoreUpper() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	upperBonus += parseInt(score);
	upperSectionsFilled += 1;
	roundNumber += 1;
	if (!bonusActive) {
		updateUpperBonus();
	}
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		if (gameMode === 'computer') {
			playComputerTurn();
		} else {
			countFinalScore();
		}
	} else {
		startComputerTurn();
	}
}

// Locking in score on lower section
function lockScoreLower() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	roundNumber += 1;
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		if (gameMode === 'computer') {
			playComputerTurn();
		} else {
			countFinalScore();
		}
	} else {
		startComputerTurn();
	}
}

// Locking in Yahtzee score
function lockYahtzeeScore() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	roundNumber += 1;
	numberOfYahtzees += 1;
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		if (gameMode === 'computer') {
			playComputerTurn();
		} else {
			countFinalScore();
		}
	} else {
		startComputerTurn();
	}
}

function startComputerTurn() {
	if (gameMode === 'computer') {
		playComputerTurn();
	}
}

function playComputerTurn() {
	isComputerTurn = true;
	rollButton.disabled = true;
	updateOpponentStatus('Computer is thinking');
	let heldDice = [];
	let attempt = 0;
	diceArea.innerHTML = '';
	selectedDiceArea.innerHTML = '';

	function computerRoll() {
		let dice = heldDice.slice();
		while (dice.length < 5) {
			dice.push(randomizeDie());
		}
		attempt += 1;
		updateOpponentStatus('Computer roll ' + attempt + ' of 3');
		renderComputerDice(dice, heldDice);

		if (attempt < 3) {
			heldDice = chooseComputerHolds(dice);
			setTimeout(function() {
				renderComputerDice(dice, heldDice);
			}, 320);
			setTimeout(computerRoll, 500);
		} else {
			setTimeout(function() {
				lockComputerScore(dice);
			}, 450);
		}
	}

	setTimeout(computerRoll, 500);
}

function renderComputerDice(dice, heldDice) {
	diceArea.innerHTML = '';
	selectedDiceArea.innerHTML = '';
	dice.forEach(function(value, index) {
		let isHeld = heldDice.indexOf(value) > -1;
		let die = document.createElement('div');
		die.className = isHeld ? 'die-selected computer-die' : 'die computer-die';
		die.setAttribute('die-value', value);
		die.setAttribute('die-index', index);
		die.setAttribute('aria-hidden', 'true');
		(isHeld ? selectedDiceArea : diceArea).appendChild(die);
	});
}

function chooseComputerHolds(dice) {
	let counts = {};
	dice.forEach(function(value) {
		counts[value] = (counts[value] || 0) + 1;
	});
	let bestValue = dice[0];
	dice.forEach(function(value) {
		if (counts[value] > counts[bestValue] || (counts[value] === counts[bestValue] && value > bestValue)) {
			bestValue = value;
		}
	});
	return counts[bestValue] > 1 ? dice.filter(function(value) {
		return value === bestValue;
	}) : [bestValue];
}

function getComputerScores(dice) {
	let counts = {};
	dice.forEach(function(value) {
		counts[value] = (counts[value] || 0) + 1;
	});
	let values = Object.keys(counts).map(Number).sort(function(a, b) { return a - b; });
	let hasThree = values.some(function(value) { return counts[value] >= 3; });
	let hasFour = values.some(function(value) { return counts[value] >= 4; });
	let hasFullHouse = values.some(function(value) { return counts[value] === 3; }) && values.some(function(value) { return counts[value] === 2; });
	let hasSmallStraight = [
		[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]
	].some(function(straight) { return straight.every(function(value) { return values.indexOf(value) > -1; }); });
	let hasLargeStraight = values.join('') === '12345' || values.join('') === '23456';
	let sum = sumArray(dice);
	return {
		1: sumDuplicates(1, dice),
		2: sumDuplicates(2, dice),
		3: sumDuplicates(3, dice),
		4: sumDuplicates(4, dice),
		5: sumDuplicates(5, dice),
		6: sumDuplicates(6, dice),
		7: hasThree ? sum : 0,
		8: hasFour ? sum : 0,
		9: hasFullHouse ? 25 : 0,
		10: hasSmallStraight ? 30 : 0,
		11: hasLargeStraight ? 40 : 0,
		12: values.length === 1 ? 50 : 0,
		13: sum
	};
}

function lockComputerScore(dice) {
	let scores = getComputerScores(dice);
	let availableCategories = [];
	for (let category = 1; category < 14; category++) {
		if (computerCategories.indexOf(category) === -1) {
			availableCategories.push(category);
		}
	}
	let category = availableCategories.sort(function(a, b) {
		return scores[b] - scores[a];
	})[0];
	computerCategories.push(category);
	computerScore += scores[category];
	opponentScoreElement.innerHTML = computerScore;
	diceArea.innerHTML = '';
	selectedDiceArea.innerHTML = '';
	isComputerTurn = false;
	if (roundNumber === 14) {
		countFinalScore();
	} else {
		rollButton.disabled = false;
		updateOpponentStatus('Your turn');
	}
}

function updateOpponentStatus(message) {
	if (gameMode === 'computer') {
		opponentStatusText.innerHTML = message;
	}
}

// Trigger Yahtzee celebration animation
function celebrateYahtzee() {
	yahtzeeLogo.className = 'animated tada';
	setTimeout(function() {
		yahtzeeLogo.className = '';
	}, 1500);
}

// Update score table with calculated scores from selected dice on all possible scoring categories
function updateScoreTable() {
	countDuplicates(diceSelected);

	// Update zero score tabs on upper section
	for (let i = 1; i < 7; i++) {
		if (scoreFields[i].innerHTML === '') {
			speculativeScoreTabs[i].style.display = 'table-cell';
			speculativeScoreTabs[i].className = 'speculative-score zero-score';
			speculativeScoreTabs[i].innerHTML = 0;
			speculativeScoreTabs[i].addEventListener('click', lockScoreUpper, false);
		}
	}

	// Update zero score tabs on lower section
	for (let j = 7; j < 14; j++) {
		if (scoreFields[j].innerHTML === '') {
			speculativeScoreTabs[j].style.display = 'table-cell';
			speculativeScoreTabs[j].className = 'speculative-score zero-score';
			speculativeScoreTabs[j].innerHTML = 0;
			speculativeScoreTabs[j].addEventListener('click', lockScoreLower, false);
		}
	}

	// Aces, twos, threes, fours, fives, sixes
	for (let k = 1; k < 7; k++) {
		if (isInArray(k, diceSelected) && scoreFields[k].innerHTML === '') {
			speculativeScoreTabs[k].style.display = 'table-cell';
			speculativeScoreTabs[k].className = 'speculative-score';
			speculativeScoreTabs[k].innerHTML = sumDuplicates(k, diceSelected);
			speculativeScoreTabs[k].addEventListener('click', lockScoreUpper, false);
		}
	}

	// Three-of-a-kind
	if ((duplicates[1] > 2 || duplicates[2] > 2 || duplicates[3] > 2 || duplicates[4] > 2 || duplicates[5] > 2 || duplicates[6] > 2) && scoreFields[7].innerHTML === '') {
		speculativeScoreTabs[7].style.display = 'table-cell';
		speculativeScoreTabs[7].className = 'speculative-score';
		speculativeScoreTabs[7].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[7].addEventListener('click', lockScoreLower, false);
	}

	// Four-of-a-kind
	if ((duplicates[1] > 3 || duplicates[2] > 3 || duplicates[3] > 3 || duplicates[4] > 3 || duplicates[5] > 3 || duplicates[6] > 3) && scoreFields[8].innerHTML === '') {
		speculativeScoreTabs[8].style.display = 'table-cell';
		speculativeScoreTabs[8].className = 'speculative-score';
		speculativeScoreTabs[8].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[8].addEventListener('click', lockScoreLower, false);
	}

	// Full House
	if ((duplicates[1] === 2 || duplicates[2] === 2 || duplicates[3] === 2 || duplicates[4] === 2 || duplicates[5] === 2 || duplicates[6] === 2) && (duplicates[1] === 3 || duplicates[2] === 3 || duplicates[3] === 3 || duplicates[4] === 3 || duplicates[5] === 3 || duplicates[6] === 3) && scoreFields[9].innerHTML === '') {
		speculativeScoreTabs[9].style.display = 'table-cell';
		speculativeScoreTabs[9].className = 'speculative-score';
		speculativeScoreTabs[9].innerHTML = 25;
		speculativeScoreTabs[9].addEventListener('click', lockScoreLower, false);
	}

	// Small Straight
	if ( (scoreFields[10].innerHTML === '') && (( isInArray(1, diceSelected) && isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) ) || ( isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) ) || ( isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) && isInArray(6, diceSelected) )) ) {
		speculativeScoreTabs[10].style.display = 'table-cell';
		speculativeScoreTabs[10].className = 'speculative-score';
		speculativeScoreTabs[10].innerHTML = 30;
		speculativeScoreTabs[10].addEventListener('click', lockScoreLower, false);
	}

	// Large Straight
	if ( (scoreFields[11].innerHTML === '') && (( isInArray(1, diceSelected) && isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) ) || ( isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) && isInArray(6, diceSelected) )) ) {
		speculativeScoreTabs[11].style.display = 'table-cell';
		speculativeScoreTabs[11].className = 'speculative-score';
		speculativeScoreTabs[11].innerHTML = 40;
		speculativeScoreTabs[11].addEventListener('click', lockScoreLower, false);
	}

	// Chance
	if (diceSelected.length === 5 && scoreFields[13].innerHTML === '') {
		speculativeScoreTabs[13].style.display = 'table-cell';
		speculativeScoreTabs[13].className = 'speculative-score';
		speculativeScoreTabs[13].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[13].addEventListener('click', lockScoreLower, false);
	}

	// Yahtzee
	if ((duplicates[1] === 5 || duplicates[2] === 5 || duplicates[3] === 5 || duplicates[4] === 5 || duplicates[5] === 5 || duplicates[6] === 5) && (scoreFields[12].innerHTML === '' || numberOfYahtzees > 0)) {

		// Multiple Yahtzees, give the bonus score and check the Joker scoring rule
		if (numberOfYahtzees > 0) {

			celebrateYahtzee();
			//alert('Yay! You scored a 100 point Yahtzee bonus!');
			yahtzeeScore = 50 + (numberOfYahtzees * 100);
			scoreFields[12].innerHTML = yahtzeeScore;
			scoreFields[12].previousSibling.previousSibling.innerHTML = 'Yahtzee' + (Array(numberOfYahtzees + 1).join(' &#10003;'));
			numberOfYahtzees += 1;

			// Check if corresponding upper section box has been used, if it is allow Joker placement on lower boxes
			if (scoreFields[diceSelected[1]].innerHTML !== '') {
				//alert('Since the upper section box is filled, the Joker rule allows you some extra scoring choices on the lower section');

				// Joker scoring for Full House
				if (scoreFields[9].innerHTML === '') {
					speculativeScoreTabs[9].style.display = 'table-cell';
					speculativeScoreTabs[9].className = 'speculative-score';
					speculativeScoreTabs[9].innerHTML = 25;
					speculativeScoreTabs[9].addEventListener('click', lockScoreLower, false);
				}

				// Joker scoring for Small Straight
				if (scoreFields[10].innerHTML === '') {
					speculativeScoreTabs[10].style.display = 'table-cell';
					speculativeScoreTabs[10].className = 'speculative-score';
					speculativeScoreTabs[10].innerHTML = 30;
					speculativeScoreTabs[10].addEventListener('click', lockScoreLower, false);
				}

				// Joker scoring for Large Straight
				if (scoreFields[11].innerHTML === '') {
					speculativeScoreTabs[11].style.display = 'table-cell';
					speculativeScoreTabs[11].className = 'speculative-score';
					speculativeScoreTabs[11].innerHTML = 40;
					speculativeScoreTabs[11].addEventListener('click', lockScoreLower, false);
				}

			} else { // Zero out lower section to force placement on the free upper section box
				for (let l = 7; l < 14; l++) {
					if (scoreFields[l].innerHTML === '') {
						speculativeScoreTabs[l].style.display = 'table-cell';
						speculativeScoreTabs[l].className = 'speculative-score zero-score';
						speculativeScoreTabs[l].innerHTML = 0;
						speculativeScoreTabs[l].addEventListener('click', lockScoreLower, false);
					}
				}
			}


		// First Yahtzee
		} else {
			celebrateYahtzee();
			speculativeScoreTabs[12].style.display = 'table-cell';
			speculativeScoreTabs[12].className = 'speculative-score';
			yahtzeeScore = 50;
			speculativeScoreTabs[12].innerHTML = yahtzeeScore;
			speculativeScoreTabs[12].removeEventListener('click', lockScoreLower, false);
			speculativeScoreTabs[12].addEventListener('click', lockYahtzeeScore, false);
		}
	}
}



function countFinalScore () {
	for (let i = scoreFields.length - 1; i >= 1; i--) {

		if (scoreFields[i].innerHTML !== '') {
			finalScore += parseInt(scoreFields[i].innerHTML);
		}
	}

	if (bonusActive) {
		finalScore += 35;
	}

	finalScoreElement.innerHTML = finalScore;
	scoreMessage.style.visibility = 'visible';
	scoreMessage.classList.add('is-visible');
	scoreMessage.querySelector('.score-total').className = 'score-total bounceIn animated';
	if (gameMode === 'computer') {
		winnerMessage.innerHTML = computerScore > finalScore ? '<br>Computer wins' : computerScore < finalScore ? '<br>You win' : '<br>It is a tie';
	}

	rollButton.className = 'roll-3 playagain';
	rollButton.innerHTML = 'NEW GAME';
	rollButton.addEventListener('click', resetGame, false);
}