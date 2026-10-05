const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let scene, camera, renderer, controls;
const SQUARE_SIZE = 2; 
let squareCoordinates = {}; 

// API CALL: Server Dice Roll
async function rollDiceFromServer(playerName = 'Player 1') {
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    
    if (rollBtn) rollBtn.disabled = true;
    resultText.innerText = "Rolling from Server...";

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${playerName}`);
        const data = await response.json();
        
        resultText.innerHTML = data.extraTurn ? 
            `<span style="color:#ffdf70">Doublet!</span><br>${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${data.totalMove}</b>` : 
            `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${data.totalMove}</b>`;

        setTimeout(() => { if (rollBtn) rollBtn.disabled = false; }, 1000);
    } catch (error) {
        console.error("API Error:", error);
        resultText.innerText = "Server Error!";
        if (rollBtn) rollBtn.disabled = false;
    }
}

// 3D Game Initialization
window.init3DGame = function() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    container.innerHTML = ''; 

    // Force exact dimensions to prevent 0x0 canvas bug
    let width = container.clientWidth || window.innerWidth * 0.9;
    let height = container.clientHeight || 400;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f08); 

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 45); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffdf70, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2.2; 
    controls.enableDamping = true;

    buildPachisiBoard3D();
    setupTokens3D();

    // Auto-resize if screen changes
    window.addEventListener('resize', () => {
        if(container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function buildPachisiBoard3D() {
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); 
    const safeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.6 }); 
    const homeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.7 }); 

    const yardMats = {
        yellow: new THREE.MeshStandardMaterial({ color: 0x111111 }),
        black: new THREE.MeshStandardMaterial({ color: 0x2a2118 }),
        red: new THREE.MeshStandardMaterial({ color: 0x4a3224 }),
        green: new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
    };

    const squareGeo = new THREE.BoxGeometry(SQUARE_SIZE * 0.95, 0.5, SQUARE_SIZE * 0.95);
    const yardGeo = new THREE.BoxGeometry(SQUARE_SIZE * 6, 0.4, SQUARE_SIZE * 6); 

    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(SQUARE_SIZE * 3, 0.6, SQUARE_SIZE * 3), homeMat);
    centerHome.receiveShadow = true;
    scene.add(centerHome);

    const createYard = (x, z, mat, name) => {
        let yard = new THREE.Mesh(yardGeo, mat);
        yard.position.set(x, -0.05, z);
        yard.receiveShadow = true;
        scene.add(yard);
        squareCoordinates[`yard-${name}`] = { x: x, y: 0.3, z: z };
    };
    
    createYard(-SQUARE_SIZE * 4.5, -SQUARE_SIZE * 4.5, yardMats.yellow, 'yellow'); 
    createYard(SQUARE_SIZE * 4.5, -SQUARE_SIZE * 4.5, yardMats.black, 'black');   
    createYard(-SQUARE_SIZE * 4.5, SQUARE_SIZE * 4.5, yardMats.red, 'red');       
    createYard(SQUARE_SIZE * 4.5, SQUARE_SIZE * 4.5, yardMats.green, 'green');    

    function createArm(armName, startX, startZ, isVertical) {
        let count = 1;
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * SQUARE_SIZE) : startX + (row * Math.sign(startX) * SQUARE_SIZE);
                let posZ = isVertical ? startZ + (row * Math.sign(startZ) * SQUARE_SIZE) : (col * SQUARE_SIZE);
                
                let isSafeZone = (row === 3 && col === 0) || (row === 0 && (col === -1 || col === 1));
                let mesh = new THREE.Mesh(squareGeo, isSafeZone ? safeMat : boardMat);
                mesh.position.set(posX, 0, posZ);
                mesh.receiveShadow = true;
                scene.add(mesh);
            }
        }
    }

    createArm('bottom', 0, SQUARE_SIZE * 2, true);      
    createArm('top', 0, -SQUARE_SIZE * 2, true);        
    createArm('right', SQUARE_SIZE * 2, 0, false);      
    createArm('left', -SQUARE_SIZE * 2, 0, false);      
}

function setupTokens3D() {
    const tokenGeo = new THREE.SphereGeometry(0.7, 32, 32); 
    const redMat = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.3 });
    
    for(let i=0; i<4; i++) {
        let redToken = new THREE.Mesh(tokenGeo, redMat);
        let yard = squareCoordinates['yard-red'];
        redToken.position.set(yard.x - 1.5 + (i * 1.5), yard.y + 0.7, yard.z);
        redToken.castShadow = true;
        scene.add(redToken);
    }
}

// Attach event listener to Dice Button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roll-dice-btn')?.addEventListener('click', () => {
        rollDiceFromServer();
    });
});
        
