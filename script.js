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
    checkBet(); // Re-valida o botão sempre que o saldo ou estado muda
}

// Seleção de Cavalo
horseItems.forEach(item => {
    item.addEventListener('click', () => {
        if (isRacing || startRaceBtn.style.display === 'block') return;

        console.log("Cavalo selecionado:", item.dataset.horse);
        horseItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedHorse = parseInt(item.dataset.horse);
        checkBet();
    });
});

betInput.addEventListener('input', checkBet);

function checkBet() {
    const amount = parseFloat(betInput.value);
    betAmount = isNaN(amount) ? 0 : amount;

    const isValid = selectedHorse !== null &&
        betAmount > 0 &&
        betAmount <= balance &&
        !isRacing &&
        startRaceBtn.style.display !== 'block';

    placeBetBtn.disabled = !isValid;
}

// Botar a Aposta
placeBetBtn.addEventListener('click', () => {
    if (placeBetBtn.disabled) return;

    console.log("Aposta confirmada:", betAmount);
    soundCash.currentTime = 0;
    soundCash.play().catch(e => console.log(e));

    balance -= betAmount;
    updateUI();

    placeBetBtn.style.display = 'none';
    startRaceBtn.style.display = 'block';
    startRaceBtn.disabled = false;
    betInput.disabled = true;
});

// Iniciar Corrida
function startRace() {
    if (isRacing) return;

    console.log("Corrida iniciada!");
    isRacing = true;
    startRaceBtn.disabled = true;

    soundRace.currentTime = 0;
    soundRace.play().catch(e => console.log(e));

    const trackWidth = document.querySelector('.track-area').clientWidth;
    const finishX = trackWidth - 140; // Ajuste para a linha de chegada
    const pos = [20, 20, 20, 20, 20];

    sprites.forEach(s => {
        s.style.left = '20px';
        s.classList.add('running');
    });

    function frame() {
        let winner = null;
        for (let i = 0; i < 5; i++) {
            const burst = Math.random() > 0.985 ? 18 : 0;
            const speed = (Math.random() * 4) + burst;
            pos[i] += speed;
            sprites[i].style.left = pos[i] + 'px';

            if (pos[i] >= finishX) {
                winner = i + 1;
                break;
            }
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

    console.log("Resultado:", won ? "Ganhou" : "Perdeu", "Vencedor:", name);

    const title = document.getElementById('modal-title');
    title.innerText = won ? "VITÓRIA! 🏆" : "DERROTA! ❌";
    title.className = won ? "win" : "lose";

    if (won) {
        const prize = betAmount * 2;
        balance += prize;
        soundWin.currentTime = 0;
        soundWin.play().catch(e => console.log(e));
        document.getElementById('modal-message').innerText = `O ${name} foi o campeão! Você faturou +$${prize.toFixed(2)}.`;
    } else {
        document.getElementById('modal-message').innerText = `O ${name} cruzou primeiro. Não foi dessa vez!`;
    }

    updateUI();
    overlay.style.display = 'flex';
}

// RESET COMPLETO PARA JOGAR DE NOVO
function resetGame() {
    console.log("Resetando jogo...");
    overlay.style.display = 'none';
    cancelAnimationFrame(raceAnimationId);

    // Reset de Posições
    sprites.forEach(s => {
        s.style.left = '20px';
        s.classList.remove('running');
    });

    // Reset de Botões
    placeBetBtn.style.display = 'block';
    startRaceBtn.style.display = 'none';
    startRaceBtn.disabled = false;
    placeBetBtn.disabled = true;

    // Reset de Input e Seleção
    betInput.disabled = false;
    betInput.value = '';
    selectedHorse = null;
    horseItems.forEach(i => i.classList.remove('selected'));

    isRacing = false;
    updateUI();
}

// Tornar global para o botão 'onclick'
window.closeModal = resetGame;

startRaceBtn.addEventListener('click', startRace);
updateUI();
