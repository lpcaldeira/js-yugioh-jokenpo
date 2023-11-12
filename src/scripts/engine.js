const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById('score_points')
  },
  cardSprites: {
    avatar: document.getElementById('card-image'),
    name: document.getElementById('card-name'),
    type: document.getElementById('card-type')
  },
  fieldCards: {
    player: document.getElementById('player-field-card'),
    computer: document.getElementById('computer-field-card')
  },
  handCards: {
    player: 'player-cards',
    playerCards: document.querySelector('#player-cards'),
    computer: 'computer-cards',
    computerCards: document.querySelector('#computer-cards')
  },
  actions: {
    nextDuel: document.getElementById('next-duel')
  }
}

const results = {
  win: 'win',
  lose: 'lose'
}
const pathAssets = './src/assets/'
const pathIcons = './src/assets/icons/'
const pathAudios = './src/assets/audios/'

const cardData = [
  {
    id: 0,
    name: 'Blue Eyes White Dragon',
    type: 'Paper',
    img: `${pathIcons}dragon.png`,
    winOf: [1],
    loseOf: [2]
  },
  {
    id: 1,
    name: 'Dark Magician',
    type: 'Rock',
    img: `${pathIcons}magician.png`,
    winOf: [2],
    loseOf: [0]
  },
  {
    id: 2,
    name: 'Exodia',
    type: 'Scissors',
    img: `${pathIcons}exodia.png`,
    winOf: [0],
    loseOf: [1]
  },
];

async function getRandomCardId() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex].id;
}

async function createCardImage(cardId, fieldSide) {
  const cardElementImage = document.createElement('img');
  cardElementImage.setAttribute('height', '100px');
  cardElementImage.setAttribute('src', `${pathIcons}card-back.png`);
  cardElementImage.setAttribute('data-id', cardId);
  cardElementImage.classList.add('card');

  // cartas do player
  if (fieldSide === state.handCards.player) {

    // adiciona evento de hover
    cardElementImage.addEventListener('mouseover', () => {
      drawSelectCard(cardId)
    });

    // adiciona evento de click
    cardElementImage.addEventListener('click', () => {
      setCardsField(cardId)
    });
  }

  return cardElementImage;
}

async function drawSelectCard(cardId) {
  const card = await getCardById(cardId);
  state.cardSprites.avatar.src = card.img;
  state.cardSprites.name.innerText = card.name;
  state.cardSprites.type.innerText = `Attribute: ${card.type}`;
}

async function removeAllCardsImages() {
  const { computerCards, playerCards } = state.handCards
  let imgElements = computerCards.querySelectorAll('img');
  imgElements.forEach((img) => img.remove());
  
  imgElements = playerCards.querySelectorAll('img');
  imgElements.forEach((img) => img.remove())
}

async function checkDuelResults(playerCardId, computerCardId) {
  let duelResults = "draw";

  const playerCard = await getCardById(playerCardId);
  const computerCard = await getCardById(computerCardId);

  if (playerCard.winOf.includes(computerCardId)) {
    duelResults = results.win;
    state.score.playerScore++;
    await playAudio(duelResults);
  } else if (computerCard.winOf.includes(playerCardId)) {
    duelResults = results.lose;
    state.score.computerScore++;
    await playAudio(duelResults);
  }

  return duelResults;
}

async function drawButton(duelResults) {
  state.actions.nextDuel.innerText = duelResults.toUpperCase();
  await showHiddenResultButton(true);
}

async function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function setCardsField(cardId) {
  await removeAllCardsImages();

  const computerCardId = await getRandomCardId();
  
  await showHiddenCardFields(true);

  await drawCardsInField(cardId, computerCardId);

  const duelResults = await checkDuelResults(cardId, computerCardId);

  await updateScore();
  await drawButton(duelResults);
}

async function drawCards(cardNumbers, fieldSide) {
  for (let index = 0; index < cardNumbers; index++) {
    const randomIdCard = await getRandomCardId();
    const cardImage = await createCardImage(randomIdCard, fieldSide);
    
    document.getElementById(fieldSide).appendChild(cardImage);
  }
}

async function getCardById(cardId) {
  return cardData.find(c => c.id === cardId);
}

async function resetDuel() {
  // limpa as informações da carta a esquerda
  await hiddenCardDetails(false);
  // esconde o botão de resultado
  await showHiddenResultButton(false);
  // limpa o field cards
  await showHiddenCardFields(false);
  // redistribui as cartas
  init();
}

/* ==========================

AUXILIAR FUNCTIONS

========================== */

async function drawCardsInField(cardId, computerCardId) {
  state.fieldCards.player.src = cardData[cardId].img;
  state.fieldCards.computer.src = cardData[computerCardId].img;
}

async function showHiddenResultButton(show) {
  let display = show ? 'block' : 'none';
   state.actions.nextDuel.style.display = display;
}

async function showHiddenCardFields(show) {
  let display = show ? 'block' : 'none';
  state.fieldCards.player.style.display = display;
  state.fieldCards.computer.style.display = display;
}

async function hiddenCardDetails() {
  state.cardSprites.avatar.src = '';
  state.cardSprites.name.innerText = '';
  state.cardSprites.type.innerText = '';
}

async function playAudio(status) {
  const audio = new Audio(`${pathAudios}${status}.wav`);
  audio.play();
}

/* ==========================

PERMANENT FUNCTIONS

========================== */

async function playAudioBackground() {
  const backgroundMusic = document.getElementById('bgm');
  backgroundMusic.play();
}

// auto-run function
const init = (function autorun(){
  showHiddenCardFields(false);

  drawCards(5, state.handCards.player)
  drawCards(5, state.handCards.computer)

  playAudioBackground();

  return autorun; // return itself to reference
}());
