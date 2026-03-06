// Game State
let balance = 100.00;
let selectedHorse = null;
let betAmount = 0;
let isRacing = false;
let raceAnimationId = null;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const horseCards = document.querySelectorAll('.horse-card');
const betInput = document.getElementById('bet-amount');
const startBtn = document.getElementById('start-race');
const sprites = [
    document.getElementById('sprite-1'),
    document.getElementById('sprite-2'),
    document.getElementById('sprite-3'),
    document.getElementById('sprite-4'),
    document.getElementById('sprite-5')
];
const modal = document.getElementById('result-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

// Audio Elements
const soundCash = document.getElementById('sound-cash');
const soundRace = document.getElementById('sound-race');
const soundWin = document.getElementById('sound-win');

// Initialize
function updateBalance() {
    balanceDisplay.innerText = `$${balance.toFixed(2)}`;
}

// Horse Selection
horseCards.forEach(card => {
    card.addEventListener('click', () => {
        if (isRacing) return;

        horseCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedHorse = parseInt(card.dataset.horse);
        validateBet();
    });
});

// Bet Validation
betInput.addEventListener('input', validateBet);

function validateBet() {
    betAmount = parseFloat(betInput.value);
    const isValid = selectedHorse &&
        betAmount > 0 &&
        betAmount <= balance &&
        !isRacing;

    startBtn.disabled = !isValid;
    startBtn.style.opacity = !isValid ? "0.3" : "1";
}

// Race Logic
function startRace() {
    if (isRacing) return;

    const trackWidth = document.querySelector('.track-area').clientWidth;
    const finishLineX = trackWidth - 100; // Finish line position minus horse width

    // Play Cash Sound
    soundCash.currentTime = 0;
    soundCash.play().catch(e => console.log("Audio play failed:", e));

    isRacing = true;
    startBtn.disabled = true;
    balance -= betAmount;
    updateBalance();

    // Play Race Music
    soundRace.currentTime = 0;
    soundRace.volume = 0.5;
    soundRace.play().catch(e => console.log("Audio play failed:", e));

    // Reset positions
    const positions = [0, 0, 0, 0, 0];
    sprites.forEach(s => {
        s.style.left = '0px';
        s.classList.add('running');
    });

    function raceFrame() {
        let winner = null;

        for (let i = 0; i < 5; i++) {
            // Unpredictable movement with random bursts
            const nitro = Math.random() > 0.985 ? 18 : 0;
            const jitter = (Math.random() - 0.5) * 2;
            const step = (Math.random() * 4) + (nitro * Math.random()) + jitter;

            positions[i] = Math.max(0, positions[i] + step);
            sprites[i].style.left = `${positions[i]}px`;

            if (positions[i] >= finishLineX) {
                winner = i + 1;
                break;
            }
        }

        if (winner) {
            endRace(winner);
        } else {
            raceAnimationId = requestAnimationFrame(raceFrame);
        }
    }

    raceAnimationId = requestAnimationFrame(raceFrame);
}

function endRace(winner) {
    isRacing = false;
    cancelAnimationFrame(raceAnimationId);

    // Stop Race Music
    soundRace.pause();

    sprites.forEach(s => s.classList.remove('running'));

    const won = selectedHorse === winner;
    const horseName = document.querySelector(`.horse-card[data-horse="${winner}"] .horse-name`).innerText;

    if (won) {
        const prize = betAmount * 2;
        balance += prize;

        // Play Win Sound
        soundWin.currentTime = 0;
        soundWin.play().catch(e => console.log("Audio play failed:", e));

        modalTitle.innerText = "🏆 VITÓRIA!";
        modalTitle.className = "win-text";
        modalMessage.innerText = `O ${horseName} foi imbatível! Você faturou +$${prize.toFixed(2)}.`;
    } else {
        modalTitle.innerText = "QUASE LÁ!";
        modalTitle.className = "lose-text";
        modalMessage.innerText = `O vencedor foi o ${horseName}. Sua sorte virá na próxima!`;
    }

    updateBalance();
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 800);
}

function closeModal() {
    modal.style.display = 'none';

    // Reset positions
    sprites.forEach(s => s.style.left = '0px');
    selectedHorse = null;
    horseCards.forEach(c => c.classList.remove('selected'));
    betInput.value = '';
    validateBet();
}

startBtn.addEventListener('click', startRace);

// Initialize UI
updateBalance();
