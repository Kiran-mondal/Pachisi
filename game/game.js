// রেন্ডারের রুবি ব্যাকএন্ড লিংক
const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let scene, camera, renderer, controls;
const SQUARE_SIZE = 2; 
let squareCoordinates = {}; 

// ==========================================
// API CALL: সার্ভার থেকে ছক্কা রোল করা
// ==========================================
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

        console.log("Ruby Backend Result:", data);
        setTimeout(() => { if (rollBtn) rollBtn.disabled = false; }, 1000);
    } catch (error) {
        console.error("API Error:", error);
        resultText.innerText = "Server Error!";
        if (rollBtn) rollBtn.disabled = false;
    }
}

document.getElementById('roll-dice-btn')?.addEventListener('click', () => {
    rollDiceFromServer();
});

// ==========================================
// THREE.JS: 3D ইঞ্জিন এবং বোর্ড জেনারেটর
// ==========================================
function init3DGame() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    container.innerHTML = ''; 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f08); 

    // ক্যামেরা সেটআপ
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 45, 45); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
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

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// 🌟 পঁচিশির বোর্ড এবং ইয়ার্ড জেনারেট করা 🌟
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

    // ১. সেন্টার হোম
    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(SQUARE_SIZE * 3, 0.6, SQUARE_SIZE * 3), homeMat);
    centerHome.receiveShadow = true;
    scene.add(centerHome);
    squareCoordinates['home'] = { x: 0, y: 0.3, z: 0 };

    // ২. চার কোণার ইয়ার্ড (1000091051.png ইমেজের মতো)
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

    // ৩. ৪টি দিকের আর্ম (পথ) জেনারেট করা
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

                squareCoordinates[`${armName}-arm-sq-${count++}`] = { x: posX, y: 0.25, z: posZ };
            }
        }
    }

    createArm('bottom', 0, SQUARE_SIZE * 2, true);      
    createArm('top', 0, -SQUARE_SIZE * 2, true);        
    createArm('right', SQUARE_SIZE * 2, 0, false);      
    createArm('left', -SQUARE_SIZE * 2, 0, false);      
}

// 🌟 থ্রিডি গোলাকার ঘুঁটি (Tokens) সেটআপ 🌟
function setupTokens3D() {
    const tokenGeo = new THREE.SphereGeometry(0.7, 32, 32); 
    
    const colors = {
        red: 0xff3333,    
        black: 0x555555,  
        yellow: 0xffcc00, 
        green: 0x00cc44   
    };

    // রেড প্লেয়ারের ঘুঁটি সেটআপ
    for(let i=0; i<4; i++) {
        let redToken = new THREE.Mesh(tokenGeo, new THREE.MeshStandardMaterial({ color: colors.red, roughness: 0.3 }));
        
        if(i < 3) {
            let yard = squareCoordinates['yard-red'];
            redToken.position.set(yard.x - 1.5 + (i * 1.5), yard.y + 0.7, yard.z);
        } else {
            let boardSq = squareCoordinates['bottom-arm-sq-18']; 
            if(boardSq) redToken.position.set(boardSq.x, boardSq.y + 0.7, boardSq.z);
        }
        
        redToken.castShadow = true;
        scene.add(redToken);
    }

    // ব্ল্যাক প্লেয়ারের ঘুঁটি সেটআপ
    for(let i=0; i<4; i++) {
        let blackToken = new THREE.Mesh(tokenGeo, new THREE.MeshStandardMaterial({ color: colors.black, roughness: 0.3 }));
        
        if(i < 3) {
            let yard = squareCoordinates['yard-black'];
            blackToken.position.set(yard.x - 1.5 + (i * 1.5), yard.y + 0.7, yard.z);
        } else {
            let boardSq = squareCoordinates['top-arm-sq-12']; 
            if(boardSq) blackToken.position.set(boardSq.x, boardSq.y + 0.7, boardSq.z);
        }
        
        blackToken.castShadow = true;
        scene.add(blackToken);
    }
}

window.init3DGame = init3DGame;
                                  
