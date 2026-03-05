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
}

// Race Logic
const finishLineX = document.querySelector('.track-container').clientWidth - 120; // 50px line + 70px horse width

function startRace() {
    if (isRacing) return;

    isRacing = true;
    startBtn.disabled = true;
    balance -= betAmount;
    updateBalance();

    // Reset positions
    const positions = [0, 0, 0, 0, 0];
    sprites.forEach(s => {
        s.style.left = '0px';
        s.classList.add('running');
    });

    function raceFrame() {
        let winner = null;

        for (let i = 0; i < 5; i++) {
            // Random Walk step + Random "Nitro" boost
            const nitro = Math.random() > 0.95 ? 15 : 0; // Rare 15px jump
            const step = (Math.random() * 4.5) + (nitro * Math.random());
            positions[i] += step;
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

    sprites.forEach(s => s.classList.remove('running'));

    const won = selectedHorse === winner;
    const horseName = document.querySelector(`.horse-card[data-horse="${winner}"] .horse-name`).innerText;

    if (won) {
        const prize = betAmount * 2;
        balance += prize;
        modalTitle.innerText = "VITÓRIA DO BRUNO!";
        modalTitle.className = "win-text";
        modalMessage.innerText = `O ${horseName} deu o sangue e foi o grande campeão! Você agora tem +$${prize.toFixed(2)} na conta.`;
    } else {
        modalTitle.innerText = "QUASE LÁ, CAMPEÃO!";
        modalTitle.className = "lose-text";
        modalMessage.innerText = `Dessa vez o ${horseName} foi mais rápido. O importante é o networking!`;
    }

    updateBalance();
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.firstElementChild.classList.add('active');
    }, 500);
}

function closeModal() {
    modal.style.display = 'none';
    modal.firstElementChild.classList.remove('active');

    // Reset UI
    betInput.value = '';
    selectedHorse = null;
    horseCards.forEach(c => c.classList.remove('selected'));
    sprites.forEach(s => s.style.left = '0px');
    validateBet();
}

startBtn.addEventListener('click', startRace);

// Export for console debugging
window.game = { balance, startRace, closeModal };
