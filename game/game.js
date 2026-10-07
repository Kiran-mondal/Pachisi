const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let currentDiceRoll = 0; 
let tokensArray = [];    
let diceMeshes = [];
let isRolling = false;

let activeGameMode = 'pass_play';
let turnOrder = [];
let currentTurnIndex = 0;
let humanPlayerColor = 'red';

// 🌟 Perimeter Path & Home Paths 🌟
let perimeterPath = [];
for(let i=0; i<8; i++) perimeterPath.push({x: 2, z: 4 + i*2}); 
perimeterPath.push({x: 0, z: 18}); 
for(let i=0; i<8; i++) perimeterPath.push({x: -2, z: 18 - i*2}); 
for(let i=0; i<8; i++) perimeterPath.push({x: -4 - i*2, z: 2}); 
perimeterPath.push({x: -18, z: 0}); 
for(let i=0; i<8; i++) perimeterPath.push({x: -18 + i*2, z: -2}); 
for(let i=0; i<8; i++) perimeterPath.push({x: -2, z: -4 - i*2}); 
perimeterPath.push({x: 0, z: -18}); 
for(let i=0; i<8; i++) perimeterPath.push({x: 2, z: -18 + i*2}); 
for(let i=0; i<8; i++) perimeterPath.push({x: 4 + i*2, z: -2}); 
perimeterPath.push({x: 18, z: 0}); 
for(let i=0; i<8; i++) perimeterPath.push({x: 18 - i*2, z: 2}); 

const homePaths = {
    green: [{x:0, z:4}, {x:0, z:6}, {x:0, z:8}, {x:0, z:10}, {x:0, z:12}, {x:0, z:14}, {x:0, z:16}, {x:0, z:0}],
    red: [{x:-4, z:0}, {x:-6, z:0}, {x:-8, z:0}, {x:-10, z:0}, {x:-12, z:0}, {x:-14, z:0}, {x:-16, z:0}, {x:0, z:0}],
    yellow: [{x:0, z:-4}, {x:0, z:-6}, {x:0, z:-8}, {x:0, z:-10}, {x:0, z:-12}, {x:0, z:-14}, {x:0, z:-16}, {x:0, z:0}],
    black: [{x:4, z:0}, {x:6, z:0}, {x:8, z:0}, {x:10, z:0}, {x:12, z:0}, {x:14, z:0}, {x:16, z:0}, {x:0, z:0}]
};

const safeCoords = [
    {x: 2, z: 4}, {x: -4, z: 2}, {x: -2, z: -4}, {x: 4, z: -2}, 
    {x: 0, z: 18}, {x: -18, z: 0}, {x: 0, z: -18}, {x: 18, z: 0} 
];

function isSafeSquare(x, z) {
    return safeCoords.some(c => c.x === x && c.z === z);
}

function getTargetCoord(token, roll) {
    let currentStep = token.userData.step;
    let nextStep = currentStep === -1 ? (roll - 1) : currentStep + roll;
    
    if (nextStep > 66) {
        let homeStep = nextStep - 67;
        if (homeStep > 7) return null; 
        return { coord: homePaths[token.userData.color][homeStep], step: nextStep };
    } else {
        let actualPathIndex = (nextStep + token.userData.startOffset) % 68;
        return { coord: perimeterPath[actualPathIndex], step: nextStep };
    }
}

window.init3DGame = function(mode, numPlayers, pColor) {
    activeGameMode = mode || 'pass_play';
    humanPlayerColor = pColor || 'red';
    
    const baseOrder = ['red', 'green', 'yellow', 'black'];
    let startIndex = baseOrder.indexOf(humanPlayerColor);
    
    if (numPlayers === 2) {
        turnOrder = [baseOrder[startIndex], baseOrder[(startIndex + 2) % 4]]; 
    } else if (numPlayers === 3) {
        turnOrder = [baseOrder[startIndex], baseOrder[(startIndex + 1) % 4], baseOrder[(startIndex + 2) % 4]];
    } else {
        turnOrder = [...baseOrder.slice(startIndex), ...baseOrder.slice(0, startIndex)];
    }

    currentTurnIndex = 0;
    updateTurnIndicator();

    const container = document.getElementById('three-canvas-container');
    if (!container || container.clientWidth === 0) {
        setTimeout(() => window.init3DGame(mode, numPlayers, pColor), 100);
        return; 
    }

    container.innerHTML = ''; 
    tokensArray = [];
    diceMeshes = []; 

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 45); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Sharp graphics
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffdf70, 1.2);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2.2; 
    controls.enableDamping = true;

    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }); 
    const safeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.5 }); 
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x4a3224, linewidth: 2 });
    
    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0xdcb360 }));
    centerHome.receiveShadow = true;
    scene.add(centerHome);

    const homePathMats = {
        green: new THREE.MeshStandardMaterial({ color: 0x00cc44, roughness: 0.8 }),
        red: new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.8 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.8 }),
        black: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 })
    };

    const squareGeo = new THREE.BoxGeometry(2, 0.5, 2); 
    function createArm(startX, startZ, isVertical, dirSign, innerColorMat) {
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * 2) : startX + (row * dirSign * 2);
                let posZ = isVertical ? startZ + (row * dirSign * 2) : (col * 2);
                
                let mat = boardMat;
                if (isSafeSquare(posX, posZ)) mat = safeMat;
                else if (col === 0 && row < 7) mat = innerColorMat; 
                
                let mesh = new THREE.Mesh(squareGeo, mat);
                mesh.position.set(posX, 0, posZ);
                mesh.receiveShadow = true;
                scene.add(mesh);
                
                let edges = new THREE.EdgesGeometry(squareGeo);
                let line = new THREE.LineSegments(edges, edgeMaterial);
                line.position.set(posX, 0, posZ);
                scene.add(line);
            }
        }
    }
    
    createArm(0, 4, true, 1, homePathMats.green);      
    createArm(0, -4, true, -1, homePathMats.yellow);    
    createArm(4, 0, false, 1, homePathMats.black);     
    createArm(-4, 0, false, -1, homePathMats.red);   

    const pasaGeo = new THREE.BoxGeometry(0.8, 0.8, 2.5); 
    const pasaMat = new THREE.MeshStandardMaterial({ color: 0xffdf70, roughness: 0.5 });
    for (let i = 0; i < 2; i++) {
        let pasa = new THREE.Mesh(pasaGeo, pasaMat);
        pasa.position.set(i === 0 ? -1.5 : 1.5, 0.4, 0); 
        pasa.castShadow = true;
        scene.add(pasa);
        diceMeshes.push(pasa);
    }

    const points = [];
    points.push(new THREE.Vector2(0, 0));       
    points.push(new THREE.Vector2(0.6, 0));     
    points.push(new THREE.Vector2(0.6, 0.2));   
    points.push(new THREE.Vector2(0.4, 0.3));   
    points.push(new THREE.Vector2(0.6, 0.6));   
    points.push(new THREE.Vector2(0.4, 1.0));   
    points.push(new THREE.Vector2(0.2, 1.2));   
    points.push(new THREE.Vector2(0.35, 1.3));  
    points.push(new THREE.Vector2(0.35, 1.5));  
    points.push(new THREE.Vector2(0, 1.6));     

    const tokenGeo = new THREE.LatheGeometry(points, 32);
    const tokenColors = { red: 0xff3333, green: 0x00cc44, yellow: 0xffcc00, black: 0x555555 };
    const startOffsets = { green: 0, red: 17, yellow: 34, black: 51 }; 
    const yardCoords = { yellow: { x: -9, z: -9 }, black: { x: 9, z: -9 }, red: { x: -9, z: 9 }, green: { x: 9, z: 9 } };

    turnOrder.forEach(color => {
        const tMat = new THREE.MeshStandardMaterial({ color: tokenColors[color], roughness: 0.3 });
        let yard = yardCoords[color];
        
        for (let i = 0; i < 4; i++) {
            let token = new THREE.Mesh(tokenGeo, tMat);
            let offsetX = (i % 2 === 0) ? -1.5 : 1.5;
            let offsetZ = (i < 2) ? -1.5 : 1.5;
            
            token.position.set(yard.x + offsetX, 0.25, yard.z + offsetZ);
            token.castShadow = true;
            
            token.userData = { 
                color: color, 
                step: -1, 
                startOffset: startOffsets[color],
                yardX: yard.x + offsetX,
                yardZ: yard.z + offsetZ,
                isFinished: false
            };
            scene.add(token);
            tokensArray.push(token);
        }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (event) => {
        let currentPlayerColor = turnOrder[currentTurnIndex];
        
        if (activeGameMode === 'computer' && currentPlayerColor !== humanPlayerColor) return;
        if(currentDiceRoll === 0 || isRolling) return; 

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tokensArray);
        
        if (intersects.length > 0) {
            let clickedToken = intersects[0].object;
            const resEl = document.getElementById('dice-result');
            
            if (clickedToken.userData.color !== currentPlayerColor || clickedToken.userData.isFinished) {
                if(resEl) resEl.innerText = "Invalid Token!";
                return; 
            }
            
            let moveData = getTargetCoord(clickedToken, currentDiceRoll);
            if (!moveData) {
                if(resEl) resEl.innerText = "Exact Roll Required!";
                return;
            }

            clickedToken.position.y += 1.5; 
            setTimeout(() => { 
                clickedToken.position.set(moveData.coord.x, 0.25, moveData.coord.z);
                clickedToken.userData.step = moveData.step;
                
                if (moveData.step === 74) {
                    clickedToken.userData.isFinished = true;
                } else {
                    let tokenAtTarget = tokensArray.find(t => 
                        t !== clickedToken && t.userData.step !== -1 && !t.userData.isFinished &&
                        Math.abs(t.position.x - moveData.coord.x) < 0.1 && 
                        Math.abs(t.position.z - moveData.coord.z) < 0.1
                    );

                    if (tokenAtTarget && tokenAtTarget.userData.color !== clickedToken.userData.color) {
                        if (!isSafeSquare(moveData.coord.x, moveData.coord.z)) {
                            tokenAtTarget.userData.step = -1;
                            tokenAtTarget.position.y += 2;
                            setTimeout(() => {
                                tokenAtTarget.position.set(tokenAtTarget.userData.yardX, 0.25, tokenAtTarget.userData.yardZ);
                            }, 300);
                        }
                    }
                }
                
                currentDiceRoll = 0;
                if(resEl) resEl.innerText = "Move Complete!";
                switchTurn(); 
            }, 250);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        if (isRolling) {
            diceMeshes.forEach((die, index) => {
                die.rotation.x += Math.random() * 0.4;
                die.rotation.y += Math.random() * 0.4;
                die.rotation.z += Math.random() * 0.4;
                die.position.y = 1.5 + Math.abs(Math.sin(Date.now() * 0.01 + index)) * 2;
            });
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if(container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
};

function switchTurn() {
    currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    const rollBtn = document.getElementById('roll-dice-btn');
    
    let currentPlayer = turnOrder[currentTurnIndex];
    const colorNames = {red: 'RED', green: 'GREEN', yellow: 'YELLOW', black: 'BLACK'};
    const hexColors = {red: '#ff3333', green: '#00cc44', yellow: '#ffcc00', black: '#aaaaaa'};
    
    if (indicator) {
        indicator.innerText = `${colorNames[currentPlayer]}'S TURN`;
        indicator.style.color = hexColors[currentPlayer];
    }

    if (activeGameMode === 'computer' && currentPlayer !== humanPlayerColor) {
        if (rollBtn) rollBtn.disabled = true;
        setTimeout(() => playComputerTurn(currentPlayer), 1500);
    } else {
        if (rollBtn) rollBtn.disabled = false;
        const resEl = document.getElementById('dice-result');
        if(resEl) resEl.innerText = "Roll Pasha to move.";
    }
}

// 🌟 Smart AI Logic 🌟
async function playComputerTurn(botColor) {
    const resultText = document.getElementById('dice-result');
    if(resultText) resultText.innerText = `Computer (${botColor}) is thinking...`;
    
    isRolling = true; 

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${botColor}`);
        const data = await response.json();
        let botDiceRoll = data.totalMove;
        
        setTimeout(() => {
            isRolling = false; 
            diceMeshes.forEach((die) => {
                die.position.y = 0.4; 
                die.rotation.set(0, 0, (Math.random() > 0.5 ? Math.PI/2 : 0)); 
            });
            
            if(resultText) resultText.innerHTML = `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${botDiceRoll}</b>`;
            
            setTimeout(() => {
                let botTokens = tokensArray.filter(t => t.userData.color === botColor && !t.userData.isFinished);
                if (botTokens.length === 0) {
                    setTimeout(switchTurn, 1000);
                    return;
                }

                let validTokens = botTokens.map(t => ({ token: t, move: getTargetCoord(t, botDiceRoll) })).filter(m => m.move !== null);
                
                if (validTokens.length > 0) {
                    let bestMove = null;
                    let highestScore = -Infinity;

                    validTokens.forEach(moveObj => {
                        let score = 0;
                        let targetCoord = moveObj.move.coord;
                        let targetStep = moveObj.move.step;

                        if (targetStep === 74) score += 200; 
                        else if (targetStep > 66) score += 30; 

                        let tokenAtTarget = tokensArray.find(t => 
                            t !== moveObj.token && t.userData.step !== -1 && !t.userData.isFinished &&
                            Math.abs(t.position.x - targetCoord.x) < 0.1 && 
                            Math.abs(t.position.z - targetCoord.z) < 0.1
                        );

                        if (tokenAtTarget && tokenAtTarget.userData.color !== botColor) {
                            if (!isSafeSquare(targetCoord.x, targetCoord.z)) {
                                score += 100; 
                            }
                        }

                        if (isSafeSquare(targetCoord.x, targetCoord.z)) score += 40;
                        score += targetStep;

                        if (score > highestScore) {
                            highestScore = score;
                            bestMove = moveObj;
                        }
                    });

                    let tokenToMove = bestMove.token;
                    let moveData = bestMove.move;

                    tokenToMove.position.y += 1.5;
                    setTimeout(() => { 
                        tokenToMove.position.set(moveData.coord.x, 0.25, moveData.coord.z);
                        tokenToMove.userData.step = moveData.step;
                        
                        if (moveData.step === 74) {
                            tokenToMove.userData.isFinished = true;
                        } else {
                            let tokenAtTarget = tokensArray.find(t => 
                                t !== tokenToMove && t.userData.step !== -1 && !t.userData.isFinished &&
                                Math.abs(t.position.x - moveData.coord.x) < 0.1 && 
                                Math.abs(t.position.z - moveData.coord.z) < 0.1
                            );

                            if (tokenAtTarget && tokenAtTarget.userData.color !== tokenToMove.userData.color) {
                                if (!isSafeSquare(moveData.coord.x, moveData.coord.z)) {
                                    tokenAtTarget.userData.step = -1;
                                    tokenAtTarget.position.y += 2;
                                    setTimeout(() => {
                                        tokenAtTarget.position.set(tokenAtTarget.userData.yardX, 0.25, tokenAtTarget.userData.yardZ);
                                    }, 300);
                                }
                            }
                        }
                        
                        if(resultText) resultText.innerText = "Computer Moved.";
                        setTimeout(switchTurn, 1000); 
                    }, 250);
                } else {
                    if(resultText) resultText.innerText = "Computer has no valid moves.";
                    setTimeout(switchTurn, 1000);
                }
            }, 1000);
            
        }, 800); 

    } catch (error) {
        isRolling = false;
        if(resultText) resultText.innerText = "Computer Skipped Turn.";
        setTimeout(switchTurn, 1000);
    }
}

window.rollDiceFromServer = async function() {
    if (currentDiceRoll > 0 || isRolling) return; 
    let currentPlayer = turnOrder[currentTurnIndex];

    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    if (rollBtn) rollBtn.disabled = true;
    if(resultText) resultText.innerText = "Rolling...";

    isRolling = true; 

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${currentPlayer}`);
        const data = await response.json();
        
        setTimeout(() => {
            isRolling = false; 
            diceMeshes.forEach((die) => {
                die.position.y = 0.4; 
                die.rotation.set(0, 0, (Math.random() > 0.5 ? Math.PI/2 : 0)); 
            });

            currentDiceRoll = data.totalMove; 
            if(resultText) resultText.innerHTML = `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${currentDiceRoll}</b><br><span style="font-size:10px; color:#ffdf70;">Tap your token</span>`;
            
        }, 800); 
        
    } catch (error) {
        isRolling = false;
        if(resultText) resultText.innerText = "Error API!";
        if (rollBtn) rollBtn.disabled = false;
    }
};
                
