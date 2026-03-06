let balance = 100.00;
let selectedHorse = null;
let betAmount = 0;
let isRacing = false;
let raceAnimationId = null;

// Audio
const soundCash = document.getElementById('sound-cash');
const soundRace = document.getElementById('sound-race');
const soundWin = document.getElementById('sound-win');

function updateUI() {
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;

    const placeBetBtn = document.getElementById('place-bet');
    const startRaceBtn = document.getElementById('start-race');
    const betInput = document.getElementById('bet-amount');

    const amount = parseFloat(betInput.value);
    const valid = selectedHorse !== null && !isNaN(amount) && amount > 0 && amount <= balance && !isRacing && startRaceBtn.style.display !== 'block';

    placeBetBtn.disabled = !valid;
}

// Horse Selection
document.querySelectorAll('.horse-item').forEach(item => {
    item.addEventListener('click', () => {
        if (isRacing || document.getElementById('start-race').style.display === 'block') return;

        document.querySelectorAll('.horse-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedHorse = parseInt(item.dataset.horse);
        updateUI();
    });
});

document.getElementById('bet-amount').addEventListener('input', updateUI);

// PLACE BET
document.getElementById('place-bet').addEventListener('click', () => {
    const betInput = document.getElementById('bet-amount');
    betAmount = parseFloat(betInput.value);

    if (selectedHorse && betAmount > 0 && betAmount <= balance) {
        soundCash.currentTime = 0;
        soundCash.play().catch(() => { });

        balance -= betAmount;
        updateUI();

        document.getElementById('place-bet').style.display = 'none';
        document.getElementById('start-race').style.display = 'block';
        betInput.disabled = true;
    }
});

// START RACE
document.getElementById('start-race').addEventListener('click', () => {
    if (isRacing) return;

    isRacing = true;
    document.getElementById('start-race').disabled = true;

    soundRace.currentTime = 0;
    soundRace.play().catch(() => { });

    const trackWidth = document.querySelector('.track-area').clientWidth;
    const finishX = trackWidth - 100;

    const sprites = [1, 2, 3, 4, 5].map(i => document.getElementById(`sprite-${i}`));
    const positions = [20, 20, 20, 20, 20];

    sprites.forEach(s => {
        s.style.left = '20px';
        s.classList.add('running');
    });

    function move() {
        let winnerIndex = -1;
        for (let i = 0; i < 5; i++) {
            const speed = (Math.random() * 3) + (Math.random() > 0.98 ? 15 : 0);
            positions[i] += speed;
            sprites[i].style.left = positions[i] + 'px';

            if (positions[i] >= finishX) {
                winnerIndex = i + 1;
                break;
            }
        }

        if (winnerIndex !== -1) {
            isRacing = false;
            soundRace.pause();
            sprites.forEach(s => s.classList.remove('running'));

            const won = selectedHorse === winnerIndex;
            const horseName = document.querySelector(`.horse-item[data-horse="${winnerIndex}"] .name`).innerText;

            const modal = document.getElementById('result-overlay');
            const title = document.getElementById('modal-title');
            const msg = document.getElementById('modal-message');

            title.innerText = won ? "VITÓRIA! 🏆" : "DERROTA! ❌";
            title.className = won ? "win" : "lose";

            if (won) {
                const prize = betAmount * 2;
                balance += prize;
                soundWin.currentTime = 0;
                soundWin.play().catch(() => { });
                msg.innerText = `O ${horseName} venceu! Você faturou +$${prize.toFixed(2)}.`;
            } else {
                msg.innerText = `O ${horseName} chegou primeiro. Tente novamente!`;
            }

            document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
            modal.style.display = 'flex';
        } else {
            raceAnimationId = requestAnimationFrame(move);
        }
    }
    raceAnimationId = requestAnimationFrame(move);
});

// RESET
function closeModal() {
    document.getElementById('result-overlay').style.display = 'none';

    // Reset positions
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`sprite-${i}`).style.left = '20px';
    }

    // Reset UI
    document.getElementById('place-bet').style.display = 'block';
    document.getElementById('start-race').style.display = 'none';
    document.getElementById('start-race').disabled = false;
    document.getElementById('bet-amount').disabled = false;
    document.getElementById('bet-amount').value = '';

    selectedHorse = null;
    document.querySelectorAll('.horse-item').forEach(i => i.classList.remove('selected'));

    isRacing = false;
    updateUI();
}

// Global for onclick
window.closeModal = closeModal;

updateUI();
