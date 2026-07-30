document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Tab Navigation ---
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

    activateTab('home-tab'); // Start fresh on home

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

    // --- 2. My Projects Modal ---
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

    // --- 3. GAME SETUP & INITIALIZATION ---
    const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
    let currentPlayer = 'red'; 
    let currentDiceRoll = 0;
    let isComputerTurn = false;
    let turnOrder = [];
    
    // Core player data
    const players = {
        red: { type: 'human', displayColor: '#d32f2f', displayName: 'RED', id: 'player-card-red' },
        green: { type: 'computer', displayColor: '#388e3c', displayName: 'GREEN', id: 'player-card-green' }, 
        black: { type: 'computer', displayColor: '#212121', displayName: 'BLACK', id: 'player-card-black' },
        yellow: { type: 'computer', displayColor: '#fbc02d', displayName: 'YELLOW', id: 'player-card-yellow' }
    };

    // Setup Screen Elements
    const modeSelect = document.getElementById('mode-select');
    const configGreen = document.getElementById('config-green');
    const configYellow = document.getElementById('config-yellow');
    const startGameBtn = document.getElementById('start-game-btn');
    const setupScreen = document.getElementById('game-setup-screen');
    const actualGameScreen = document.getElementById('actual-game-screen');

    // Toggle 2-Player / 4-Player config visibility
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            if (e.target.value === '2') {
                configGreen.style.display = 'none';
                configYellow.style.display = 'none';
            } else {
                configGreen.style.display = 'flex';
                configYellow.style.display = 'flex';
            }
        });
    }

    function createBoard() {
        arms.forEach(armId => {
            const container = document.getElementById(armId);
            if (!container) return; 
            container.innerHTML = ''; // Clear if rebuilding
            for (let i = 1; i <= 24; i++) {
                const sq = document.createElement('div');
                sq.classList.add('square');
                sq.dataset.id = `${armId}-sq-${i}`;
                
                if (i >= 1 && i <= 7) {
                    sq.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                }
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

    // Start Game Button Logic
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            const is2Player = modeSelect.value === '2';
            
            // Read types from dropdowns
            players.red.type = document.getElementById('type-red').value;
            players.black.type = document.getElementById('type-black').value;
            
            if (is2Player) {
                turnOrder = ['red', 'black'];
                document.getElementById('player-card-green').style.visibility = 'hidden';
                document.getElementById('player-card-yellow').style.visibility = 'hidden';
            } else {
                players.green.type = document.getElementById('type-green').value;
                players.yellow.type = document.getElementById('type-yellow').value;
                // Anti-clockwise turn order logic
                turnOrder = ['red', 'green', 'black', 'yellow']; 
                document.getElementById('player-card-green').style.visibility = 'visible';
                document.getElementById('player-card-yellow').style.visibility = 'visible';
            }

            // Update names on cards based on type
            turnOrder.forEach(color => {
                const nameElem = document.getElementById(`name-${color}`);
                if (nameElem) {
                    nameElem.innerText = players[color].type === 'human' ? `P-${color.toUpperCase()}` : `BOT-${color.toUpperCase()}`;
                }
            });

            createBoard();
            
            // Place initial tokens ONLY for active players
            turnOrder.forEach((color) => {
                // Map color to its starting arm
                const armId = color + '-arm'; 
                
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

            currentPlayer = turnOrder[0];
            
            // Hide setup, show game
            setupScreen.style.display = 'none';
            actualGameScreen.style.display = 'flex';
            
            updateTurnUI();
        });
    }

    // --- 4. Game Turn & Dice Logic ---
    const turnIndicator = document.getElementById('turn-indicator');
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    const pasha1 = document.getElementById('pasha-1');
    const pasha2 = document.getElementById('pasha-2');
    const validDiceFaces = [1, 3, 4, 6];

    function updateTurnUI() {
        const turnText = `${players[currentPlayer].displayName}'S TURN`;
        if (turnIndicator) {
            turnIndicator.innerText = turnText;
            turnIndicator.style.color = players[currentPlayer].displayColor;
        }
        
        currentDiceRoll = 0; 
        if (resultText) resultText.innerHTML = "Roll Pasha<br>to move.";

        // Highlight active corner player
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
        const currentIndex = turnOrder.indexOf(currentPlayer);
        currentPlayer = turnOrder[(currentIndex + 1) % turnOrder.length]; 
        updateTurnUI();
    }

});
