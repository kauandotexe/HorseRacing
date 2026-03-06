// Estado do Jogo
let balance = 100.00;
let selectedHorse = null;
let betAmount = 0;
let isRacing = false;
let raceAnimationId = null;

// Elementos da UI
const balanceDisplay = document.getElementById('balance');
const horseButtons = document.querySelectorAll('.horse-btn');
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
const modalCard = document.getElementById('modal-card');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

// Áudios
const soundCash = document.getElementById('sound-cash');
const soundRace = document.getElementById('sound-race');
const soundWin = document.getElementById('sound-win');

function updateBalance() {
    balanceDisplay.innerText = `$${balance.toFixed(2)}`;
}

// Seleção do Corredor
horseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRacing) return;
        horseButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedHorse = parseInt(btn.dataset.horse);
        validateBet();
    });
});

betInput.addEventListener('input', validateBet);

function validateBet() {
    betAmount = parseFloat(betInput.value);
    const isValid = selectedHorse &&
        betAmount > 0 &&
        betAmount <= balance &&
        !isRacing;
    startBtn.disabled = !isValid;
}

function startRace() {
    if (isRacing) return;

    // Dimensões da pista (calculadas no momento para evitar erro de proporção)
    const trackWidth = document.querySelector('.track-stadium').clientWidth;
    const finishLineX = trackWidth - 160; // Compensação da linha de chegada e largura do sprite

    // Sons de Início
    soundCash.currentTime = 0;
    soundCash.play().catch(e => console.log("Erro áudio:", e));

    isRacing = true;
    startBtn.disabled = true;
    balance -= betAmount;
    updateBalance();

    // Música Tema
    soundRace.currentTime = 0;
    soundRace.volume = 0.4;
    soundRace.play().catch(e => console.log("Erro áudio:", e));

    const positions = [40, 40, 40, 40, 40]; // Posição inicial (offset da esquerda)
    sprites.forEach(s => {
        s.style.left = '40px';
        s.classList.add('running');
    });

    function raceFrame() {
        let winner = null;

        for (let i = 0; i < 5; i++) {
            // Algoritmo de Movimento Dinâmico
            const nitro = Math.random() > 0.988 ? 22 : 0;
            const jitter = (Math.random() - 0.4) * 2;
            const step = (Math.random() * 4.2) + (nitro * Math.random()) + jitter;

            positions[i] = Math.max(40, positions[i] + step);
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
    soundRace.pause();
    sprites.forEach(s => s.classList.remove('running'));

    const won = selectedHorse === winner;
    const horseName = document.querySelector(`.horse-btn[data-horse="${winner}"] .h-name`).innerText;

    modalCard.classList.remove('win', 'lose');

    if (won) {
        const prize = betAmount * 2;
        balance += prize;
        soundWin.currentTime = 0;
        soundWin.play().catch(e => console.log("Erro áudio:", e));

        modalTitle.innerText = "🏆 VITÓRIA!";
        modalCard.classList.add('win');
        modalMessage.innerText = `O ${horseName} deu o sangue e venceu! Você acaba de faturar +$${prize.toFixed(2)}.`;
    } else {
        modalTitle.innerText = "❌ DERROTA!";
        modalCard.classList.add('lose');
        modalMessage.innerText = `Dessa vez o ${horseName} foi mais rápido. Não desista do pódio!`;
    }

    updateBalance();
    setTimeout(() => {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }, 800);
}

function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        sprites.forEach(s => s.style.left = '40px');
        selectedHorse = null;
        horseButtons.forEach(b => b.classList.remove('selected'));
        betInput.value = '';
        validateBet();
    }, 300);
}

startBtn.addEventListener('click', startRace);
updateBalance();
