document.addEventListener('DOMContentLoaded', () => {

    const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
    let currentPlayer = ''; 
    let currentDiceRoll = 0;
    let isComputerTurn = false;
    let hasExtraTurn = false; 
    let turnOrder = [];
    let activeSafeZones = [];
    
    // Players Configuration
    const players = {
        red: { type: 'human', displayColor: '#d32f2f', displayName: 'RED', id: 'player-card-red' },
        green: { type: 'human', displayColor: '#388e3c', displayName: 'GREEN', id: 'player-card-green' }, 
        black: { type: 'human', displayColor: '#666666', displayName: 'BLACK', id: 'player-card-black' },
        yellow: { type: 'human', displayColor: '#fbc02d', displayName: 'YELLOW', id: 'player-card-yellow' }
    };

    // Board Paths
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
    const defaultSafeZones = ['red-arm-sq-1', 'red-arm-sq-24', 'green-arm-sq-17', 'green-arm-sq-8', 'black-arm-sq-24', 'black-arm-sq-1', 'yellow-arm-sq-8', 'yellow-arm-sq-17'];

    function getSquareId(color, step) {
        if (step === 0) return `yard-${color}`;
        if (step >= 1 && step <= 64) return perimeter[(startIndexes[color] + step - 1) % 64];
        if (step >= 65 && step <= 72) return homeStretches[color][step - 65];
        return 'home';
    }

    function createBoard() {
        arms.forEach(armId => {
            const container = document.getElementById(armId);
            if (!container) return; container.innerHTML = ''; 
            for (let i = 1; i <= 24; i++) {
                const sq = document.createElement('div');
                sq.classList.add('square');
                const sqId = `${armId}-sq-${i}`;
                sq.dataset.id = sqId;
                
                if (activeSafeZones.includes(sqId)) {
                    sq.classList.add('safe-zone');
                    sq.innerHTML = '<i class="fa-solid fa-star" style="color: rgba(212, 175, 55, 0.5); font-size: 10px; position: absolute;"></i>';
                }
                container.appendChild(sq);
            }
        });
    }

    function createTokenElem(color) {
        const t = document.createElement('div');
        t.classList.add('token', `token-${color}`);
        t.dataset.color = color;
        t.dataset.step = 0; 
        return t;
    }

    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const allColors = ['red', 'green', 'black', 'yellow'];
            turnOrder = allColors.filter(c => document.getElementById(`status-${c}`).value !== 'none');
            
            if(turnOrder.length < 2) {
                alert("Please enable at least 2 players to start!");
                return;
            }

            turnOrder.forEach(c => {
                players[c].type = document.getElementById(`status-${c}`).value;
                document.getElementById(`name-${c}`).innerText = players[c].type === 'human' ? `${c.toUpperCase()}` : `BOT-${c.toUpperCase()}`;
                const card = document.getElementById(players[c].id);
                if(card) { card.style.visibility = 'visible'; card.style.opacity = '1'; }
            });

            allColors.forEach(c => {
                if(!turnOrder.includes(c)) {
                    const card = document.getElementById(players[c].id);
                    if(card) { card.style.visibility = 'hidden'; card.style.opacity = '0.3'; }
                }
            });

            const variant = document.getElementById('variant-select').value;
            activeSafeZones = (variant === 'chaupar') ? [] : defaultSafeZones;

            createBoard();

            turnOrder.forEach((color) => {
                const yard = document.getElementById(`yard-${color}`);
                if(yard) { yard.innerHTML = ''; for (let i = 0; i < 4; i++) yard.appendChild(createTokenElem(color)); }
            });

            currentPlayer = turnOrder[0];
            
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            updateTurnUI();
        });
    }

    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');

    function updateTurnUI() {
        document.getElementById('turn-indicator').innerText = `${players[currentPlayer].displayName}'S TURN`;
        document.getElementById('turn-indicator').style.color = players[currentPlayer].displayColor;
        
        currentDiceRoll = 0; 
        resultText.innerHTML = hasExtraTurn ? "EXTRA TURN!<br>Roll again." : "Roll Pasha<br>to move.";

        document.querySelectorAll('.corner-player').forEach(card => card.classList.remove('active-turn'));
        document.getElementById(players[currentPlayer].id)?.classList.add('active-turn');
        
        // সব গুটি থেকে লাফানো বন্ধ করা
        document.querySelectorAll('.token').forEach(t => t.classList.remove('playable'));

        if (players[currentPlayer].type === 'computer') {
            isComputerTurn = true;
            if(rollBtn) { rollBtn.disabled = true; rollBtn.innerText = "THINKING..."; }
            setTimeout(rollTheDice, 800); 
        } else {
            isComputerTurn = false;
            if(rollBtn) { rollBtn.disabled = false; rollBtn.innerText = "ROLL PASHA"; }
        }
    }

    rollBtn?.addEventListener('click', () => { if (!isComputerTurn && currentDiceRoll === 0) rollTheDice(); });

    function hasValidMoves(playerColor, rollValue) {
        let tokens = Array.from(document.querySelectorAll(`.token-${playerColor}:not(.finished)`));
        let validTokens = tokens.filter(t => (parseInt(t.dataset.step) + rollValue) <= 73);
        return validTokens.length > 0;
    }

    // 🌟 গুটি লাফানোর জন্য ফাংশন 🌟
    function highlightPlayableTokens(playerColor, rollValue) {
        document.querySelectorAll('.token').forEach(t => t.classList.remove('playable'));
        
        let tokens = Array.from(document.querySelectorAll(`.token-${playerColor}:not(.finished)`));
        tokens.forEach(token => {
            let currentStep = parseInt(token.dataset.step);
            if ((currentStep + rollValue) <= 73) {
                token.classList.add('playable'); // যে গুটিগুলো চালা যাবে তারা লাফাবে
            }
        });
    }

    function rollTheDice() {
        if(rollBtn) rollBtn.disabled = true; 
        resultText.innerText = "Rolling...";
        
        const video = document.getElementById('pasha-video');
        const overlay = document.getElementById('dice-overlay');
        
        if (overlay) overlay.classList.add('hidden');
        
        if (video) {
            video.play().catch(e => console.log("Play issue on mobile:", e));
            setTimeout(() => { video.currentTime = 0; }, 50); 
        }

        setTimeout(() => {
            if (video) video.pause(); 

            const faces = [1, 3, 4, 6];
            const v1 = faces[Math.floor(Math.random() * 4)]; 
            const v2 = faces[Math.floor(Math.random() * 4)];
            
            currentDiceRoll = v1 + v2; 
            hasExtraTurn = (v1 === v2); 
            
            if (overlay) {
                document.getElementById('v1-text').innerText = v1;
                document.getElementById('v2-text').innerText = v2;
                overlay.classList.remove('hidden');
            }
            
            resultText.innerHTML = (v1===v2) ? 
                `<span style="color:var(--glow-gold)">Doublet!</span><br>${v1} & ${v2}<br>Move: <b>${currentDiceRoll}</b>` : 
                `${v1} & ${v2}<br>Move: <b>${currentDiceRoll}</b>`;
            
            if (!hasValidMoves(currentPlayer, currentDiceRoll)) {
                resultText.innerHTML += "<br><span style='color:red;'>No Moves!</span>";
                setTimeout(switchTurn, 1500);
                return;
            }

            if (isComputerTurn) {
                setTimeout(moveComputerToken, 600);
            } else {
                if(rollBtn) rollBtn.disabled = false;
                highlightPlayableTokens(currentPlayer, currentDiceRoll); // 🌟 গুটি লাফানো শুরু 🌟
            }
        }, 1200); 
    }

    function performMove(token) {
        document.querySelectorAll('.token').forEach(t => t.classList.remove('playable')); // ক্লিক করার পর লাফানো বন্ধ
        if (token.classList.contains('finished')) return; 

        let currentStep = parseInt(token.dataset.step);
        let targetStep = currentStep + currentDiceRoll;
        
        if (targetStep > 73) return; 
        
        let targetId = getSquareId(currentPlayer, targetStep);
        let targetSquare = targetId === 'home' ? document.querySelector('.center-home') : document.querySelector(`[data-id="${targetId}"]`);
        
        if(targetSquare) {
            token.style.transform = "scale(1.5) translateY(-5px)";
            token.style.zIndex = "50";
            
            setTimeout(() => {
                if (targetId !== 'home' && !activeSafeZones.includes(targetId)) {
                    let enemyTokens = Array.from(targetSquare.querySelectorAll('.token')).filter(t => t.dataset.color !== currentPlayer);
                    if (enemyTokens.length > 0) {
                        enemyTokens.forEach(enemy => {
                            enemy.dataset.step = 0; 
                            let startNode = document.getElementById(`yard-${enemy.dataset.color}`);
                            if(startNode) startNode.appendChild(enemy);
                        });
                        hasExtraTurn = true; 
                    }
                }

                targetSquare.appendChild(token); 
                token.dataset.step = targetStep;   
                
                if (targetId === 'home') {
                    token.classList.add('finished'); 
                    token.style.transform = "scale(0.8)";
                    hasExtraTurn = true; 
                } else {
                    token.style.transform = "scale(1)";
                }
                token.style.zIndex = "10";
                
                setTimeout(switchTurn, 400);
            }, 300); 
        } else {
            setTimeout(switchTurn, 300);
        }
    }

    function moveComputerToken() {
        let tokens = Array.from(document.querySelectorAll(`.token-${currentPlayer}:not(.finished)`));
        let validTokens = tokens.filter(t => (parseInt(t.dataset.step) + currentDiceRoll) <= 73);
        
        if (validTokens.length > 0) {
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
                                         
