document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Default to Home Tab on Refresh ---
    const tabSections = document.querySelectorAll('.tab-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const navLinksContainer = document.getElementById('nav-links');
    const hamburger = document.getElementById('hamburger');

    function activateTab(targetId) {
        tabSections.forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-links .nav-btn').forEach(nav => nav.classList.remove('active'));
        
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        
        const targetNav = document.querySelector(`.nav-links [data-target="${targetId}"]`);
        if (targetNav) targetNav.classList.add('active');

        if (navLinksContainer && navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
        }
    }

    // Force home tab on page load
    activateTab('home-tab');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(btn.getAttribute('data-target'));
        });
    });

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });
    }

    // --- 2. Modal Logic ---
    const myProjectsBtn = document.getElementById('my-projects-btn');
    const projectsModal = document.getElementById('projects-modal');
    const closeModal = document.getElementById('close-modal');

    if (myProjectsBtn && projectsModal && closeModal) {
        myProjectsBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            projectsModal.classList.remove('hidden'); 
            if (navLinksContainer && navLinksContainer.classList.contains('active')) navLinksContainer.classList.remove('active');
        });
        closeModal.addEventListener('click', () => projectsModal.classList.add('hidden'));
    }

    // --- 3. Board & Game State Setup ---
    const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
    let currentPlayer = 'red'; 
    let currentDiceRoll = 0;
    let isComputerTurn = false;

    const players = {
        red: { type: 'human', displayColor: '#d32f2f', displayName: 'YOUR', id: 'player-card-red' },
        green: { type: 'computer', displayColor: '#388e3c', displayName: 'PLAYER 2', id: 'player-card-green' }, 
        yellow: { type: 'human', displayColor: '#fbc02d', displayName: 'PLAYER 3', id: 'player-card-yellow' },
        black: { type: 'human', displayColor: '#212121', displayName: 'PLAYER 4', id: 'player-card-black' }
    };

    function createBoard() {
        arms.forEach(armId => {
            const container = document.getElementById(armId);
            if (!container) return; 
            for (let i = 1; i <= 24; i++) {
                const sq = document.createElement('div');
                sq.classList.add('square');
                sq.dataset.id = `${armId}-sq-${i}`;
                
                const mark = document.createElement('span');
                mark.style.fontSize = '8px';
                mark.style.color = 'rgba(139, 0, 0, 0.4)';
                mark.style.position = 'absolute';
                mark.style.pointerEvents = 'none'; 
                
                if (i >= 1 && i <= 7) {
                    sq.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                } else {
                    mark.innerText = i;
                }
                
                sq.appendChild(mark);
                container.appendChild(sq);
            }
        });
    }

    function createTokenElem(color, armId, pos) {
        const t = document.createElement('div');
        t.classList.add('token', `token-${color}`);
        t.dataset.color = color;
        t.dataset.arm = armId;
        t.dataset.pos = pos; 
        return t;
    }

    // Fresh Start Every Time
    function placeInitialTokens() {
        const colors = ['black', 'yellow', 'green', 'red'];
        colors.forEach((color, index) => {
            const armId = arms[index];
            
            const sq6 = document.querySelector(`[data-id="${armId}-sq-6"]`);
            if(sq6) sq6.appendChild(createTokenElem(color, armId, 6));
            
            const sq7 = document.querySelector(`[data-id="${armId}-sq-7"]`);
            if(sq7) sq7.appendChild(createTokenElem(color, armId, 7));
            
            const sq12 = document.querySelector(`[data-id="${armId}-sq-12"]`);
            if(sq12) { 
                sq12.appendChild(createTokenElem(color, armId, 12)); 
                sq12.appendChild(createTokenElem(color, armId, 12)); 
            }
        });
    }
    
    createBoard();
    placeInitialTokens();

    // --- 4. Game Turn & Dice Logic ---
    const turnIndicator = document.getElementById('turn-indicator');
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    const pasha1 = document.getElementById('pasha-1');
    const pasha2 = document.getElementById('pasha-2');
    const validDiceFaces = [1, 3, 4, 6];

    function updateTurnUI() {
        const turnText = `${players[currentPlayer].displayName}'S MOVE`;
        if (turnIndicator) {
            turnIndicator.innerText = turnText;
            turnIndicator.style.color = players[currentPlayer].displayColor;
        }
        
        currentDiceRoll = 0; 
        if (resultText) resultText.innerHTML = "Roll Pasha<br>to move.";

        // Highlight corner player
        document.querySelectorAll('.corner-player').forEach(card => card.classList.remove('active-turn'));
        const activeCard = document.getElementById(players[currentPlayer].id);
        if(activeCard) activeCard.classList.add('active-turn');

        if (players[currentPlayer].type === 'computer') {
            isComputerTurn = true;
            if (rollBtn) {
                rollBtn.disabled = true;
                rollBtn.innerText = "THINKING...";
            }
            setTimeout(playComputerTurn, 1000); 
        } else {
            isComputerTurn = false;
            if (rollBtn) {
                rollBtn.disabled = false;
                rollBtn.innerText = "ROLL PASHA";
            }
        }
    }

    function drawDots(containerId, number) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; 
        for (let i = 0; i < number; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            container.appendChild(dot);
        }
    }
    drawDots('dot-container-1', 1);
    drawDots('dot-container-2', 4);

    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (isComputerTurn) return; 
            if (currentDiceRoll > 0) {
                alert("You have already rolled! Please click on your token to move.");
                return;
            }
            rollTheDice();
        });
    }

    function rollTheDice() {
        if (rollBtn) rollBtn.disabled = true; 
        if (resultText) resultText.innerText = "Rolling...";
        
        if (pasha1) pasha1.classList.add('rolling');
        if (pasha2) pasha2.classList.add('rolling');

        let shuffleInterval = setInterval(() => {
            let temp1 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
            let temp2 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
            drawDots('dot-container-1', temp1);
            drawDots('dot-container-2', temp2);
        }, 100);

        setTimeout(() => {
            clearInterval(shuffleInterval);
            if (pasha1) pasha1.classList.remove('rolling');
            if (pasha2) pasha2.classList.remove('rolling');

            const val1 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
            const val2 = validDiceFaces[Math.floor(Math.random() * validDiceFaces.length)];
            
            drawDots('dot-container-1', val1);
            drawDots('dot-container-2', val2);
            
            currentDiceRoll = val1 + val2; 

            if (resultText) {
                if (val1 === val2) {
                    resultText.innerHTML = `Doublet: ${val1} & ${val2}<br>Move: ${currentDiceRoll}`;
                } else {
                    resultText.innerHTML = `Result: ${val1} & ${val2}<br>Move: ${currentDiceRoll}`;
                }
            }
            
            if (isComputerTurn) {
                setTimeout(moveComputerToken, 800);
            } else {
                if (rollBtn) rollBtn.disabled = false;
            }
        }, 800); 
    }

    // --- 5. Token Real Movement Logic ---
    function performMove(token) {
        let currentPos = parseInt(token.dataset.pos);
        let armId = token.dataset.arm;
        
        let targetPos = currentPos + currentDiceRoll;
        if (targetPos > 24) targetPos = 24; 
        
        let targetSquare = document.querySelector(`[data-id="${armId}-sq-${targetPos}"]`);
        
        if(targetSquare) {
            token.style.transform = "scale(1.5) translateY(-15px)";
            token.style.zIndex = "50";
            
            setTimeout(() => {
                targetSquare.appendChild(token); 
                token.dataset.pos = targetPos;   
                
                token.style.transform = "scale(1) translateY(0)";
                token.style.zIndex = "10";
                
                if (resultText) resultText.innerHTML = "Move<br>completed.";
                setTimeout(switchTurn, 500);
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
            }, 500);
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
                alert(`It's ${players[currentPlayer].displayName}'s turn!`);
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
});
