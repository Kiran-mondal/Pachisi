// --- 1. Menu & Modals Logic ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const closeRules = document.getElementById('close-rules');

rulesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    rulesModal.classList.remove('hidden');
});
closeRules.addEventListener('click', () => rulesModal.classList.add('hidden'));

const myProjectsBtn = document.getElementById('my-projects-btn');
const modal = document.getElementById('projects-modal');
const closeModal = document.getElementById('close-modal');
const projectsContainer = document.getElementById('projects-container');

const myProjectsData = [
    { title: "E-commerce Platform", description: "Modern shopping platform.", link: "#" },
    { title: "Real-time Chat App", description: "Socket.io real-time chat.", link: "#" }
];

function renderProjects() {
    projectsContainer.innerHTML = ''; 
    myProjectsData.forEach(project => {
        const div = document.createElement('div');
        div.classList.add('project-card');
        div.innerHTML = `
            <h3 style="color: #8b0000; font-family: 'Cinzel', serif;">${project.title}</h3>
            <p style="font-family: Arial, sans-serif;">${project.description}</p>
            <a href="${project.link}" target="_blank" style="color: #d4af37; font-weight: bold; text-decoration: none; margin-top: 10px; display: inline-block;">View Project</a>
        `;
        projectsContainer.appendChild(div);
    });
}
myProjectsBtn.addEventListener('click', (e) => { e.preventDefault(); renderProjects(); modal.classList.remove('hidden'); });
closeModal.addEventListener('click', () => modal.classList.add('hidden'));

// --- 2. Board Setup with Numbers & Markers ---
const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
const colors = ['black', 'yellow', 'green', 'red'];

function createBoard() {
    arms.forEach(armId => {
        const container = document.getElementById(armId);
        for (let i = 1; i <= 24; i++) {
            const sq = document.createElement('div');
            sq.classList.add('square');
            sq.dataset.id = `${armId}-sq-${i}`;
            
            const mark = document.createElement('span');
            mark.style.fontSize = '10px';
            mark.style.color = 'rgba(139, 0, 0, 0.6)';
            mark.style.position = 'absolute';
            mark.style.pointerEvents = 'none'; 
            
            if (i >= 1 && i <= 7) {
                sq.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                mark.innerText = i + ' 🏠';
            } else {
                mark.innerText = i;
            }
            
            sq.appendChild(mark);
            container.appendChild(sq);
        }
    });
}

function placeInitialTokens() {
    colors.forEach((color, index) => {
        const armId = arms[index];
        const createToken = (pos) => {
            const t = document.createElement('div');
            t.classList.add('token', `token-${color}`);
            t.dataset.color = color;
            t.dataset.arm = armId;
            t.dataset.pos = pos; 
            return t;
        };
        const sq6 = document.querySelector(`[data-id="${armId}-sq-6"]`);
        if(sq6) sq6.appendChild(createToken(6));
        const sq7 = document.querySelector(`[data-id="${armId}-sq-7"]`);
        if(sq7) sq7.appendChild(createToken(7));
        const sq12 = document.querySelector(`[data-id="${armId}-sq-12"]`);
        if(sq12) { sq12.appendChild(createToken(12)); sq12.appendChild(createToken(12)); }
    });
}
createBoard();
placeInitialTokens();

// --- 3. Game Logic (Turns & Bot) ---
let currentPlayer = 'red'; 
let currentDiceRoll = 0;
let isComputerTurn = false;

const players = {
    red: { type: 'human', displayColor: '#d32f2f' },
    green: { type: 'computer', displayColor: '#388e3c' }, 
    yellow: { type: 'human', displayColor: '#fbc02d' },
    black: { type: 'human', displayColor: '#212121' }
};

const turnIndicator = document.getElementById('turn-indicator');
const rollBtn = document.getElementById('roll-dice-btn');
const resultText = document.getElementById('dice-result');
const pasha1 = document.getElementById('pasha-1');
const pasha2 = document.getElementById('pasha-2');
const validDiceFaces = [1, 3, 4, 6];

function updateTurnUI() {
    turnIndicator.innerText = `Current Turn: ${currentPlayer.toUpperCase()}`;
    turnIndicator.style.color = players[currentPlayer].displayColor;
    currentDiceRoll = 0; 
    resultText.innerText = "Roll the Pasha to move.";

    if (players[currentPlayer].type === 'computer') {
        isComputerTurn = true;
        rollBtn.disabled = true;
        rollBtn.innerText = "Computer is playing...";
        setTimeout(playComputerTurn, 1500); 
    } else {
        isComputerTurn = false;
        rollBtn.disabled = false;
        rollBtn.innerText = "Roll the Pasha";
    }
}

// --- 4. 4-Sided Stick Dice Animation ---
function drawDots(containerId, number) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 
    for (let i = 0; i < number; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        container.appendChild(dot);
    }
}

drawDots('dot-container-1', 1);
drawDots('dot-container-2', 4);

rollBtn.addEventListener('click', () => {
    if (isComputerTurn) return; 
    if (currentDiceRoll > 0) {
        alert("You have already rolled! Please click on your token to move.");
        return;
    }
    rollTheDice();
});

function rollTheDice() {
    rollBtn.disabled = true; 
    resultText.innerText = "Rolling...";
    
    pasha1.classList.add('rolling');
    pasha2.classList.add('rolling');

    let shuffleInterval = setInterval(() => {
        let temp1 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
        let temp2 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
        drawDots('dot-container-1', temp1);
        drawDots('dot-container-2', temp2);
    }, 100);

    setTimeout(() => {
        clearInterval(shuffleInterval);
        pasha1.classList.remove('rolling');
        pasha2.classList.remove('rolling');

        const val1 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
        const val2 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
        
        drawDots('dot-container-1', val1);
        drawDots('dot-container-2', val2);
        
        currentDiceRoll = val1 + val2; 

        if (val1 === val2) {
            resultText.innerText = `Doublet! (${val1} & ${val2}). Move: ${currentDiceRoll}`;
        } else {
            resultText.innerText = `Result: ${val1} & ${val2}. Move: ${currentDiceRoll}`;
        }
        
        if (isComputerTurn) {
            setTimeout(moveComputerToken, 1000);
        } else {
            rollBtn.disabled = false;
        }
    }, 1000); 
}

// --- 5. Token Real Movement Logic ---
function performMove(token) {
    let currentPos = parseInt(token.dataset.pos);
    let armId = token.dataset.arm;
    
    let targetPos = currentPos + currentDiceRoll;
    if (targetPos > 24) targetPos = 24; // Temporary cap
    
    let targetSquare = document.querySelector(`[data-id="${armId}-sq-${targetPos}"]`);
    
    if(targetSquare) {
        token.style.transform = "scale(1.5) translateY(-15px)";
        token.style.zIndex = "50";
        
        setTimeout(() => {
            targetSquare.appendChild(token); 
            token.dataset.pos = targetPos;   
            
            token.style.transform = "scale(1) translateY(0)";
            token.style.zIndex = "10";
            
            resultText.innerText = "Move completed.";
            setTimeout(switchTurn, 600);
        }, 300); 
    }
}

function playComputerTurn() {
    rollTheDice();
}

function moveComputerToken() {
    const computerTokens = document.querySelectorAll(`.token-${currentPlayer}`);
    if (computerTokens.length > 0 && currentDiceRoll > 0) {
        const tokenToMove = computerTokens[0]; 
        
        tokenToMove.style.transform = "scale(1.3)"; 
        setTimeout(() => {
            tokenToMove.style.transform = "scale(1)";
            performMove(tokenToMove); 
        }, 800);
    } else {
        switchTurn();
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('token')) {
        const token = e.target;
        const tokenColor = token.dataset.color;
        
        if (isComputerTurn) return; 
        if (tokenColor !== currentPlayer) {
            alert(`It's ${currentPlayer.toUpperCase()}'s turn! You cannot move this token.`);
            return;
        }
        if (currentDiceRoll === 0) {
            alert("Please roll the Pasha first!");
            return;
        }

        performMove(token); 
    }
});

function switchTurn() {
    const turnOrder = ['red', 'green', 'yellow', 'black'];
    const currentIndex = turnOrder.indexOf(currentPlayer);
    currentPlayer = turnOrder[(currentIndex + 1) % 4]; 
    updateTurnUI();
}

updateTurnUI();
