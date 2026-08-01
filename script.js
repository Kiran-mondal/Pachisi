document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Tab Navigation ---
    const tabSections = document.querySelectorAll('.tab-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const navLinksContainer = document.getElementById('nav-links');

    function activateTab(targetId) {
        tabSections.forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-links .nav-btn').forEach(nav => nav.classList.remove('active'));
        document.getElementById(targetId)?.classList.add('active');
        document.querySelector(`.nav-links [data-target="${targetId}"]`)?.classList.add('active');
        navLinksContainer?.classList.remove('active');
    }
    activateTab('home-tab'); 

    navButtons.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); activateTab(btn.getAttribute('data-target')); }));
    document.getElementById('hamburger')?.addEventListener('click', () => navLinksContainer.classList.toggle('active'));

    // --- 2. GAME VARIABLES & PATH MAPPING ---
    const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
    let currentPlayer = 'red'; 
    let currentDiceRoll = 0;
    let isComputerTurn = false;
    let hasExtraTurn = false; 
    let turnOrder = [];
    
    const players = {
        red: { type: 'human', displayColor: '#d32f2f', displayName: 'RED', id: 'player-card-red' },
        green: { type: 'computer', displayColor: '#388e3c', displayName: 'GREEN', id: 'player-card-green' }, 
        black: { type: 'computer', displayColor: '#212121', displayName: 'BLACK', id: 'player-card-black' },
        yellow: { type: 'computer', displayColor: '#fbc02d', displayName: 'YELLOW', id: 'player-card-yellow' }
    };

    // PERIMETER PATH (Anti-clockwise)
    const perimeter = [
        'red-arm-sq-1', 'red-arm-sq-4', 'red-arm-sq-7', 'red-arm-sq-10', 'red-arm-sq-13', 'red-arm-sq-16', 'red-arm-sq-19', 'red-arm-sq-22',
        'red-arm-sq-24', 'red-arm-sq-21', 'red-arm-sq-18', 'red-arm-sq-15', 'red-arm-sq-12', 'red-arm-sq-9', 'red-arm-sq-6', 'red-arm-sq-3',
        
        'green-arm-sq-17', 'green-arm-sq-18', 'green-arm-sq-19', 'green-arm-sq-20', 'green-arm-sq-21', 'green-arm-sq-22', 'green-arm-sq-23', 'green-arm-sq-24',
        'green-arm-sq-8', 'green-arm-sq-7', 'green-arm-sq-6', 'green-arm-sq-5', 'green-arm-sq-4', 'green-arm-sq-3', 'green-arm-sq-2', 'green-arm-sq-1',
        
        'black-arm-sq-24', 'black-arm-sq-21', 'black-arm-sq-18', 'black-arm-sq-15', 'black-arm-sq-12', 'black-arm-sq-9', 'black-arm-sq-6', 'black-arm-sq-3',
        'black-arm-sq-1', 'black-arm-sq-4', 'black-arm-sq-7', 'black-arm-sq-10', 'black-arm-sq-13', 'black-arm-sq-16', 'black-arm-sq-19', 'black-arm-sq-22',
        
        'yellow-arm-sq-8', 'yellow-arm-sq-7', 'yellow-arm-sq-6', 'yellow-arm-sq-5', 'yellow-arm-sq-4', 'yellow-arm-sq-3', 'yellow-arm-sq-2', 'yellow-arm-sq-1',
        'yellow-arm-sq-17', 'yellow-arm-sq-18', 'yellow-arm-sq-19', 'yellow-arm-sq-20', 'yellow-arm-sq-21', 'yellow-arm-sq-22', 'yellow-arm-sq-23', 'yellow-arm-sq-24'
    ];

    const homeStretches = {
        red: ['red-arm-sq-2', 'red-arm-sq-5', 'red-arm-sq-8', 'red-arm-sq-11', 'red-arm-sq-14', 'red-arm-sq-17', 'red-arm-sq-20', 'red-arm-sq-23'],
        green: ['green-arm-sq-9', 'green-arm-sq-10', 'green-arm-sq-11', 'green-arm-sq-12', 'green-arm-sq-13', 'green-arm-sq-14', 'green-arm-sq-15', 'green-arm-sq-16'],
        black: ['black-arm-sq-23', 'black-arm-sq-20', 'black-arm-sq-17', 'black-arm-sq-14', 'black-arm-sq-11', 'black-arm-sq-8', 'black-arm-sq-5', 'black-arm-sq-2'],
        yellow: ['yellow-arm-sq-16', 'yellow-arm-sq-15', 'yellow-arm-sq-14', 'yellow-arm-sq-13', 'yellow-arm-sq-12', 'yellow-arm-sq-11', 'yellow-arm-sq-10', 'yellow-arm-sq-9']
    };

    const startIndexes = { red: 0, green: 16, black: 32, yellow: 48 };
    const safeZones = ['red-arm-sq-1', 'red-arm-sq-24', 'green-arm-sq-17', 'green-arm-sq-8', 'black-arm-sq-24', 'black-arm-sq-1', 'yellow-arm-sq-8', 'yellow-arm-sq-17'];

    function getSquareId(color, step) {
        if (step >= 1 && step <= 64) return perimeter[(startIndexes[color] + step - 1) % 64];
        if (step >= 65 && step <= 72) return homeStretches[color][step - 65];
        return 'home';
    }

    // --- 3. INITIALIZATION ---
    function createBoard() {
        arms.forEach(armId => {
            const container = document.getElementById(armId);
            if (!container) return; container.innerHTML = ''; 
            for (let i = 1; i <= 24; i++) {
                const sq = document.createElement('div');
                sq.classList.add('square');
                const sqId = `${armId}-sq-${i}`;
                sq.dataset.id = sqId;
                
                if (safeZones.includes(sqId)) {
                    sq.classList.add('safe-zone');
                    sq.innerHTML = '<i class="fa-solid fa-star" style="color: rgba(212, 175, 55, 0.5); font-size: 14px; position: absolute;"></i>';
                }
                container.appendChild(sq);
            }
        });
    }

    function createTokenElem(color) {
        const t = document.createElement('div');
        t.classList.add('token', `token-${color}`);
        t.dataset.color = color;
        t.dataset.step = 1; 
        return t;
    }

    document.getElementById('start-game-btn')?.addEventListener('click', () => {
        const mode = document.getElementById('mode-select').value;
        players.red.type = document.getElementById('type-red').value;
        players.black.type = document.getElementById('type-black').value;
        
        if (mode === '2') {
            turnOrder = ['red', 'black'];
            document.getElementById('player-card-green').style.visibility = 'hidden';
            document.getElementById('player-card-yellow').style.visibility = 'hidden';
        } else {
            players.green.type = document.getElementById('type-green').value;
            players.yellow.type = document.getElementById('type-yellow').value;
            turnOrder = ['red', 'green', 'black', 'yellow']; 
        }

        turnOrder.forEach(c => document.getElementById(`name-${c}`).innerText = players[c].type === 'human' ? `P-${c.toUpperCase()}` : `BOT-${c.toUpperCase()}`);

        createBoard();
        turnOrder.forEach((color) => {
            const startSquare = document.querySelector(`[data-id="${getSquareId(color, 1)}"]`);
            if(startSquare) { for (let i = 0; i < 4; i++) startSquare.appendChild(createTokenElem(color)); }
        });

        currentPlayer = turnOrder[0];
        document.getElementById('game-setup-screen').style.display = 'none';
        document.getElementById('actual-game-screen').style.display = 'flex';
        updateTurnUI();
    });

    // --- 4. DICE LOGIC & SMART AI ---
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');

    function updateTurnUI() {
        document.getElementById('turn-indicator').innerText = `${players[currentPlayer].displayName}'S TURN`;
        document.getElementById('turn-indicator').style.color = players[currentPlayer].displayColor;
        
        currentDiceRoll = 0; 
        resultText.innerHTML = hasExtraTurn ? "EXTRA TURN!<br>Roll again." : "Roll Pasha<br>to move.";

        document.querySelectorAll('.corner-player').forEach(card => card.classList.remove('active-turn'));
        document.getElementById(players[currentPlayer].id)?.classList.add('active-turn');

        if (players[currentPlayer].type === 'computer') {
            isComputerTurn = true;
            if(rollBtn) { rollBtn.disabled = true; rollBtn.innerText = "THINKING..."; }
            setTimeout(rollTheDice, 600); 
        } else {
            isComputerTurn = false;
            if(rollBtn) { rollBtn.disabled = false; rollBtn.innerText = "ROLL PASHA"; }
        }
    }

    function drawDots(containerId, number) {
        const container = document.getElementById(containerId);
        if(!container) return; container.innerHTML = ''; 
        for (let i = 0; i < number; i++) {
            const dot = document.createElement('div'); dot.classList.add('dot'); container.appendChild(dot);
        }
    }

    rollBtn?.addEventListener('click', () => {
        if (isComputerTurn || currentDiceRoll > 0) return;
        rollTheDice();
    });

    // 🌟 SMART VALIDATION: Check if any token can move legally 🌟
    function hasValidMoves(playerColor, rollValue) {
        let tokens = Array.from(document.querySelectorAll(`.token-${playerColor}:not(.finished)`));
        let validTokens = tokens.filter(t => (parseInt(t.dataset.step) + rollValue) <= 73);
        return validTokens.length > 0;
    }

    function rollTheDice() {
        if(rollBtn) rollBtn.disabled = true; 
        resultText.innerText = "Rolling...";
        const p1 = document.getElementById('pasha-1'); const p2 = document.getElementById('pasha-2');
        p1?.classList.add('rolling'); p2?.classList.add('rolling');

        const faces = [1, 3, 4, 6];
        let shuffle = setInterval(() => {
            drawDots('dot-container-1', faces[Math.floor(Math.random() * 4)]);
            drawDots('dot-container-2', faces[Math.floor(Math.random() * 4)]);
        }, 60);

        setTimeout(() => {
            clearInterval(shuffle); p1?.classList.remove('rolling'); p2?.classList.remove('rolling');
            const v1 = faces[Math.floor(Math.random() * 4)]; const v2 = faces[Math.floor(Math.random() * 4)];
            drawDots('dot-container-1', v1); drawDots('dot-container-2', v2);
            
            currentDiceRoll = v1 + v2; 
            hasExtraTurn = (v1 === v2); // Extra turn on Doublet!
            
            resultText.innerHTML = (v1===v2) ? `Doublet: ${v1} & ${v2}<br>Move: ${currentDiceRoll}` : `Result: ${v1} & ${v2}<br>Move: ${currentDiceRoll}`;
            
            // 🌟 SMART FALLBACK: Auto-skip turn if player/bot has no valid moves 🌟
            if (!hasValidMoves(currentPlayer, currentDiceRoll)) {
                resultText.innerHTML += "<br><span style='color:red;'>No Valid Moves!</span>";
                setTimeout(switchTurn, 1500);
                return;
            }

            if (isComputerTurn) setTimeout(moveComputerToken, 500);
            else if(rollBtn) rollBtn.disabled = false;
        }, 500); 
    }

    // --- 5. MOVEMENT & CAPTURING LOGIC ---
    function performMove(token) {
        if (token.classList.contains('finished')) return; 

        let currentStep = parseInt(token.dataset.step);
        let targetStep = currentStep + currentDiceRoll;
        
        // Block invalid human click
        if (targetStep > 73) {
            if(!isComputerTurn) alert("You need exact number to reach home!");
            return; 
        }
        
        let targetId = getSquareId(currentPlayer, targetStep);
        let targetSquare = targetId === 'home' ? document.querySelector('.center-home') : document.querySelector(`[data-id="${targetId}"]`);
        
        if(targetSquare) {
            token.style.transform = "scale(1.5) translateY(-15px)";
            token.style.zIndex = "50";
            
            setTimeout(() => {
                // CAPTURING LOGIC
                if (targetId !== 'home' && !safeZones.includes(targetId)) {
                    let enemyTokens = Array.from(targetSquare.querySelectorAll('.token')).filter(t => t.dataset.color !== currentPlayer);
                    if (enemyTokens.length > 0) {
                        enemyTokens.forEach(enemy => {
                            enemy.dataset.step = 1; 
                            let startNode = document.querySelector(`[data-id="${getSquareId(enemy.dataset.color, 1)}"]`);
                            if(startNode) startNode.appendChild(enemy);
                        });
                        hasExtraTurn = true; 
                        resultText.innerHTML = "CAPTURE!<br>Extra Turn!";
                    }
                }

                targetSquare.appendChild(token); 
                token.dataset.step = targetStep;   
                
                if (targetId === 'home') {
                    token.classList.add('finished'); 
                    token.style.transform = "scale(0.8)";
                    hasExtraTurn = true; 
                    resultText.innerHTML = "Reached HOME!<br>Extra Turn!";
                } else {
                    token.style.transform = "scale(1)";
                }
                token.style.zIndex = "10";
                
                setTimeout(switchTurn, 400);
            }, 300); 
        } else {
            // Failsafe
            setTimeout(switchTurn, 300);
        }
    }

    function moveComputerToken() {
        let tokens = Array.from(document.querySelectorAll(`.token-${currentPlayer}:not(.finished)`));
        // Filter out tokens that will overshoot the Home
        let validTokens = tokens.filter(t => (parseInt(t.dataset.step) + currentDiceRoll) <= 73);
        
        if (validTokens.length > 0) {
            // Bot Logic: Move the token that is furthest ahead
            validTokens.sort((a,b) => parseInt(b.dataset.step) - parseInt(a.dataset.step));
            let tokenToMove = validTokens[0];
            
            tokenToMove.style.transform = "scale(1.3)"; 
            setTimeout(() => performMove(tokenToMove), 300);
        } else {
            switchTurn();
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('token')) {
            const token = e.target;
            if (token.classList.contains('finished') || isComputerTurn || token.dataset.color !== currentPlayer || currentDiceRoll === 0) return;
            performMove(token); 
        }
    });

    function switchTurn() {
        if (!hasExtraTurn) {
            const currentIndex = turnOrder.indexOf(currentPlayer);
            currentPlayer = turnOrder[(currentIndex + 1) % turnOrder.length]; 
        }
        hasExtraTurn = false;
        updateTurnUI();
    }

});
