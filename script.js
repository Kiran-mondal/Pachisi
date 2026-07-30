document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Multi-Page / Tab Navigation Logic ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');
    const navLinksContainer = document.getElementById('nav-links');
    const hamburger = document.getElementById('hamburger');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            
            tabSections.forEach(section => section.classList.remove('active'));
            document.querySelectorAll('.nav-links .nav-btn').forEach(nav => nav.classList.remove('active'));
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
            
            if (btn.parentElement.tagName === 'LI') {
                btn.classList.add('active');
            } else if (targetId === 'game-tab') {
                document.querySelector('.nav-links [data-target="game-tab"]').classList.add('active');
            }

            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
            }
        });
    });

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });
    }

    // --- 2. My Projects Modal Logic ---
    const myProjectsBtn = document.getElementById('my-projects-btn');
    const projectsModal = document.getElementById('projects-modal');
    const closeModal = document.getElementById('close-modal');
    const projectsContainer = document.getElementById('projects-container');

    const myProjectsData = [
        { title: "E-commerce Platform", description: "Modern shopping platform.", link: "#" },
        { title: "Real-time Chat App", description: "Socket.io real-time chat.", link: "#" }
    ];

    function renderProjects() {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = ''; 
        myProjectsData.forEach(project => {
            const div = document.createElement('div');
            div.classList.add('project-card');
            div.innerHTML = `
                <h3 style="color: #8b0000; font-family: 'Cinzel', serif; margin-bottom:5px;">${project.title}</h3>
                <p style="font-family: Arial, sans-serif;">${project.description}</p>
                <a href="${project.link}" target="_blank" style="color: #d4af37; font-weight: bold; text-decoration: none; margin-top: 10px; display: inline-block;">View Project</a>
            `;
            projectsContainer.appendChild(div);
        });
    }

    if (myProjectsBtn && projectsModal && closeModal) {
        myProjectsBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            renderProjects(); 
            projectsModal.classList.remove('hidden'); 
            if (navLinksContainer.classList.contains('active')) navLinksContainer.classList.remove('active');
        });
        closeModal.addEventListener('click', () => projectsModal.classList.add('hidden'));
    }

    // --- 3. Board Setup with Numbers & Markers ---
    const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
    const colors = ['black', 'yellow', 'green', 'red'];

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
            if(sq12) { 
                sq12.appendChild(createToken(12)); 
                sq12.appendChild(createToken(12)); 
            }
        });
    }
    
    createBoard();
    placeInitialTokens();

    // --- 4. Game Logic (Turns & Bot) ---
    let currentPlayer = 'red'; 
    let currentDiceRoll = 0;
    let isComputerTurn = false;

    const players = {
        red: { type: 'human', displayColor: '#d32f2f', displayName: 'Your Turn' },
        green: { type: 'computer', displayColor: '#388e3c', displayName: 'Player 2' }, 
        yellow: { type: 'human', displayColor: '#fbc02d', displayName: 'Player 3' },
        black: { type: 'human', displayColor: '#212121', displayName: 'Player 4' }
    };

    const turnIndicator = document.getElementById('turn-indicator');
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    const pasha1 = document.getElementById('pasha-1');
    const pasha2 = document.getElementById('pasha-2');
    const validDiceFaces = [1, 3, 4, 6];

    function updateTurnUI() {
        if (!turnIndicator) return;
        turnIndicator.innerText = `${players[currentPlayer].displayName}'s Move`;
        turnIndicator.style.color = players[currentPlayer].displayColor;
        currentDiceRoll = 0; 
        
        if (resultText) resultText.innerText = "Roll Pasha to move.";

        if (players[currentPlayer].type === 'computer') {
            isComputerTurn = true;
            if (rollBtn) {
                rollBtn.disabled = true;
                rollBtn.innerText = "Thinking...";
            }
            setTimeout(playComputerTurn, 1500); 
        } else {
            isComputerTurn = false;
            if (rollBtn) {
                rollBtn.disabled = false;
                rollBtn.innerText = "Roll Pasha";
            }
        }
    }

    // --- 5. 4-Sided Stick Dice Animation ---
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
                    resultText.innerText = `Doublet! (${val1} & ${val2}). Move: ${currentDiceRoll}`;
                } else {
                    resultText.innerText = `Result: ${val1} & ${val2}. Move: ${currentDiceRoll}`;
                }
            }
            
            if (isComputerTurn) {
                setTimeout(moveComputerToken, 1000);
            } else {
                if (rollBtn) rollBtn.disabled = false;
            }
        }, 1000); 
    }

    // --- 6. Token Real Movement Logic ---
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
                
                if (resultText) resultText.innerText = "Move completed.";
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
            
