const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let scene, camera, renderer, controls;
const SQUARE_SIZE = 2; 
let squareCoordinates = {}; 
let tokensArray = []; 

// 🌟 অরিজিনাল 2D গেম লজিক ভেরিয়েবল 🌟
let currentPlayer = 'red'; 
let currentDiceRoll = 0;
let hasExtraTurn = false;

// অরিজিনাল পেরিমিটার পাথ (যে পথে ঘুঁটি ঘুরবে)
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

async function rollDiceFromServer(playerName = 'red') {
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    if (rollBtn) rollBtn.disabled = true;
    resultText.innerText = "Rolling...";

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${playerName}`);
        const data = await response.json();
        
        currentDiceRoll = data.totalMove;
        hasExtraTurn = data.extraTurn;

        resultText.innerHTML = hasExtraTurn ? 
            `<span style="color:#ffdf70">Doublet!</span><br>${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${currentDiceRoll}</b>` : 
            `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${currentDiceRoll}</b>`;

        setTimeout(() => { if (rollBtn) rollBtn.disabled = false; }, 1000);
    } catch (error) {
        resultText.innerText = "Server Error!";
        if (rollBtn) rollBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roll-dice-btn')?.addEventListener('click', () => {
        if(currentDiceRoll === 0) rollDiceFromServer(currentPlayer);
    });
});

window.init3DGame = function() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    container.innerHTML = ''; 
    tokensArray = []; 

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

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffdf70, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2.2; 
    controls.enableDamping = true;

    buildPachisiBoard3D();
    setupTokens3D();

    // 🌟 ঘুঁটি মুভমেন্ট লজিক (Raycaster) 🌟
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (event) => {
        if(currentDiceRoll === 0) return; // ছক্কা না চাললে ক্লিক কাজ করবে না

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tokensArray);
        
        if (intersects.length > 0) {
            let clickedToken = intersects[0].object;
            
            // লজিক: ঘুঁটি এক ঘর থেকে অন্য ঘরে যাবে
            let currentStep = clickedToken.userData.step;
            let targetStep = currentStep + currentDiceRoll;
            
            if(targetStep <= 64) {
                let targetSquareId = perimeter[targetStep - 1]; // পাথ থেকে আইডি বের করা
                let targetCoords = squareCoordinates[targetSquareId];
                
                if(targetCoords) {
                    // ঘুঁটিকে নতুন কোঅর্ডিনেটে পাঠানো
                    clickedToken.position.set(targetCoords.x, targetCoords.y + 0.7, targetCoords.z);
                    clickedToken.userData.step = targetStep;
                    
                    // মুভ শেষ হলে ছক্কার মান রিসেট করা
                    currentDiceRoll = 0;
                    document.getElementById('dice-result').innerText = "Move Complete.";
                }
            }
        }
    });

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
    scene.add(centerHome);

    const createYard = (x, z, mat, name) => {
        let yard = new THREE.Mesh(yardGeo, mat);
        yard.position.set(x, -0.05, z);
        scene.add(yard);
        squareCoordinates[`yard-${name}`] = { x: x, y: 0.3, z: z };
    };
    
    createYard(-SQUARE_SIZE * 4.5, -SQUARE_SIZE * 4.5, yardMats.yellow, 'yellow'); 
    createYard(SQUARE_SIZE * 4.5, -SQUARE_SIZE * 4.5, yardMats.black, 'black');   
    createYard(-SQUARE_SIZE * 4.5, SQUARE_SIZE * 4.5, yardMats.red, 'red');       
    createYard(SQUARE_SIZE * 4.5, SQUARE_SIZE * 4.5, yardMats.green, 'green');    

    // আর্মগুলোর নাম অরিজিনাল লজিকের সাথে মেলানো হলো
    function createArm(armName, startX, startZ, isVertical, dirSign) {
        let count = 1;
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * SQUARE_SIZE) : startX + (row * dirSign * SQUARE_SIZE);
                let posZ = isVertical ? startZ + (row * dirSign * SQUARE_SIZE) : (col * SQUARE_SIZE);
                
                let isSafeZone = (row === 3 && col === 0) || (row === 0 && (col === -1 || col === 1));
                let mesh = new THREE.Mesh(squareGeo, isSafeZone ? safeMat : boardMat);
                mesh.position.set(posX, 0, posZ);
                scene.add(mesh);
                squareCoordinates[`${armName}-arm-sq-${count++}`] = { x: posX, y: 0.25, z: posZ };
            }
        }
    }

    createArm('red', 0, SQUARE_SIZE * 2, true, 1);      
    createArm('black', 0, -SQUARE_SIZE * 2, true, -1);        
    createArm('green', SQUARE_SIZE * 2, 0, false, 1);      
    createArm('yellow', -SQUARE_SIZE * 2, 0, false, -1);      
}

function setupTokens3D() {
    const tokenGeo = new THREE.SphereGeometry(0.7, 32, 32); 
    const redMat = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.3 });
    
    for(let i=0; i<4; i++) {
        let redToken = new THREE.Mesh(tokenGeo, redMat);
        // ঘুঁটির বর্তমান স্টেপ ট্র্যাকিংয়ের জন্য userData ব্যবহার করা হলো
        redToken.userData = { color: 'red', step: 0 }; 
        
        let yard = squareCoordinates['yard-red'];
        if(yard) redToken.position.set(yard.x - 1.5 + (i * 1.5), yard.y + 0.7, yard.z);
        scene.add(redToken);
        tokensArray.push(redToken);
    }
        }
    
