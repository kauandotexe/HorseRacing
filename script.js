let balance = 100.00;
let selectedHorse = null;
let betAmount = 0;
let isRacing = false;
let raceAnimationId = null;

const balanceDisplay = document.getElementById('balance');
const horseItems = document.querySelectorAll('.horse-item');
const betInput = document.getElementById('bet-amount');
const placeBetBtn = document.getElementById('place-bet');
const startRaceBtn = document.getElementById('start-race');
const sprites = [1, 2, 3, 4, 5].map(i => document.getElementById(`sprite-${i}`));
const overlay = document.getElementById('result-overlay');

const soundCash = document.getElementById('sound-cash');
const soundRace = document.getElementById('sound-race');
const soundWin = document.getElementById('sound-win');

function updateUI() {
    balanceDisplay.innerText = `$${balance.toFixed(2)}`;
}

horseItems.forEach(item => {
    item.addEventListener('click', () => {
        if (isRacing || startRaceBtn.style.display === 'block') return;
        horseItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedHorse = parseInt(item.dataset.horse);
        checkBet();
    });
});

betInput.addEventListener('input', checkBet);

function checkBet() {
    betAmount = parseFloat(betInput.value);
    placeBetBtn.disabled = !(selectedHorse && betAmount > 0 && betAmount <= balance);
}

placeBetBtn.addEventListener('click', () => {
    soundCash.play();
    balance -= betAmount;
    updateUI();

    placeBetBtn.style.display = 'none';
    startRaceBtn.style.display = 'block';
    betInput.disabled = true;
});

function startRace() {
    isRacing = true;
    startRaceBtn.disabled = true;
    soundRace.play();

    const finishX = document.querySelector('.stadium').clientWidth - 100;
    const pos = [20, 20, 20, 20, 20];
    sprites.forEach(s => s.classList.add('running'));

    function frame() {
        let winner = null;
        for (let i = 0; i < 5; i++) {
            pos[i] += (Math.random() * 4) + (Math.random() > 0.99 ? 15 : 0);
            sprites[i].style.left = pos[i] + 'px';
            if (pos[i] >= finishX) { winner = i + 1; break; }
        }

        if (winner) {
            isRacing = false;
            soundRace.pause();
            sprites.forEach(s => s.classList.remove('running'));
            renderResult(winner);
        } else {
            raceAnimationId = requestAnimationFrame(frame);
        }
    }
    raceAnimationId = requestAnimationFrame(frame);
}

function renderResult(winner) {
    const won = selectedHorse === winner;
    const name = document.querySelector(`.horse-item[data-horse="${winner}"] .name`).innerText;

    document.getElementById('modal-title').innerText = won ? "VITÓRIA!" : "DERROTA!";
    document.getElementById('modal-title').className = won ? "win" : "lose";

    if (won) {
        const prize = betAmount * 2;
        balance += prize;
        soundWin.play();
        document.getElementById('modal-message').innerText = `O ${name} venceu! Você ganhou $${prize.toFixed(2)}.`;
    } else {
        document.getElementById('modal-message').innerText = `O vencedor foi o ${name}. Mais sorte na próxima!`;
    }

    updateUI();
    overlay.style.display = 'flex';
}

function closeModal() {
    overlay.style.display = 'none';
    sprites.forEach(s => s.style.left = '20px');
    placeBetBtn.style.display = 'block';
    startRaceBtn.style.display = 'none';
    startRaceBtn.disabled = false;
    betInput.disabled = false;
    betInput.value = '';
    selectedHorse = null;
    horseItems.forEach(i => i.classList.remove('selected'));
    checkBet();
}

startRaceBtn.addEventListener('click', startRace);
updateUI();
