const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let currentDiceRoll = 0; // বর্তমান ছক্কার মান স্টোর করার জন্য
let globalPath = [];     // ঘুঁটি চলার পথের সব স্থানাঙ্ক (Coordinates)
let tokensArray = [];    // ক্লিক ডিটেক্ট করার জন্য সব ঘুঁটির লিস্ট

window.init3DGame = function() {
    const container = document.getElementById('three-canvas-container');
    
    // Dimension Polling (আগের ক্র্যাশ ঠেকানোর ট্রিক)
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        setTimeout(window.init3DGame, 100);
        return; 
    }

    container.innerHTML = ''; 
    globalPath = []; 
    tokensArray = [];

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f08); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 45); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffdf70, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2.2; 
    controls.enableDamping = true;

    // ==========================================
    // ১. পঁচিশি বোর্ড তৈরি
    // ==========================================
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); 
    const safeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.6 }); 
    const homeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.7 }); 
    
    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), homeMat);
    centerHome.receiveShadow = true;
    scene.add(centerHome);

    const yardGeo = new THREE.BoxGeometry(12, 0.4, 12); 
    const yardMats = {
        yellow: new THREE.MeshStandardMaterial({ color: 0x111111 }),
        black: new THREE.MeshStandardMaterial({ color: 0x2a2118 }),
        red: new THREE.MeshStandardMaterial({ color: 0x4a3224 }),
        green: new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
    };

    const yardCoords = {
        yellow: { x: -9, z: -9 },
        black: { x: 9, z: -9 },
        red: { x: -9, z: 9 },
        green: { x: 9, z: 9 }
    };

    // ইয়ার্ড তৈরি
    for (let key in yardCoords) {
        let yard = new THREE.Mesh(yardGeo, yardMats[key]);
        yard.position.set(yardCoords[key].x, -0.05, yardCoords[key].z);
        yard.receiveShadow = true;
        scene.add(yard);
    }

    const squareGeo = new THREE.BoxGeometry(1.9, 0.5, 1.9);
    function createArm(startX, startZ, isVertical, dirSign) {
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * 2) : startX + (row * dirSign * 2);
                let posZ = isVertical ? startZ + (row * dirSign * 2) : (col * 2);
                
                let isSafeZone = (row === 3 && col === 0) || (row === 0 && (col === -1 || col === 1));
                let mesh = new THREE.Mesh(squareGeo, isSafeZone ? safeMat : boardMat);
                mesh.position.set(posX, 0, posZ);
                mesh.receiveShadow = true;
                scene.add(mesh);
                
                // ঘুঁটি চলার জন্য পথের স্থানাঙ্ক সেভ করে রাখা হচ্ছে
                globalPath.push({ x: posX, z: posZ });
            }
        }
    }
    
    createArm(0, 4, true, 1);      
    createArm(0, -4, true, -1);    
    createArm(4, 0, false, 1);     
    createArm(-4, 0, false, -1);   

    // ==========================================
    // ২. ঘুঁটি (Tokens) সেটআপ 
    // ==========================================
    const tokenGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const tokenColors = {
        red: 0xff3333,
        green: 0x00cc44,
        yellow: 0xffcc00,
        black: 0x555555
    };

    for (let color in tokenColors) {
        const tMat = new THREE.MeshStandardMaterial({ color: tokenColors[color], roughness: 0.3 });
        let yard = yardCoords[color];
        
        for (let i = 0; i < 4; i++) {
            let token = new THREE.Mesh(tokenGeo, tMat);
            // ৪টি ঘুঁটিকে ইয়ার্ডের ভেতর ছড়িয়ে বসানো
            let offsetX = (i % 2 === 0) ? -1.5 : 1.5;
            let offsetZ = (i < 2) ? -1.5 : 1.5;
            
            token.position.set(yard.x + offsetX, 1, yard.z + offsetZ);
            token.castShadow = true;
            
            // ঘুঁটির বর্তমান অবস্থা সেভ রাখা
            token.userData = { color: color, step: -1, isAtHome: true, baseX: yard.x + offsetX, baseZ: yard.z + offsetZ };
            scene.add(token);
            tokensArray.push(token);
        }
    }

    // ==========================================
    // ৩. ঘুঁটি মুভমেন্ট লজিক (Raycaster / Touch)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (event) => {
        if(currentDiceRoll === 0) return; // ছক্কা না চাললে কাজ করবে না

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tokensArray);
        
        if (intersects.length > 0) {
            let clickedToken = intersects[0].object;
            
            // ঘুঁটিটি লাফিয়ে উঠবে (Animation Effect)
            clickedToken.position.y += 1.5;
            setTimeout(() => { clickedToken.position.y -= 1.5; }, 200);
            
            // নতুন ঘরে বসানোর লজিক
            let nextStep = clickedToken.userData.step === -1 ? 0 : clickedToken.userData.step + currentDiceRoll;
            
            if (nextStep < globalPath.length) {
                clickedToken.position.set(globalPath[nextStep].x, 1, globalPath[nextStep].z);
                clickedToken.userData.step = nextStep;
                clickedToken.userData.isAtHome = false;
                
                // মুভ কমপ্লিট হলে ছক্কা রিসেট করা
                currentDiceRoll = 0;
                document.getElementById('dice-result').innerText = "Move Complete!";
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
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

// ==========================================
// ৪. API থেকে ডাইস রোল 
// ==========================================
window.rollDiceFromServer = async function(playerName = 'red') {
    if (currentDiceRoll > 0) return; // আগের মুভ শেষ না হলে চালতে দেবে না

    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    if (rollBtn) rollBtn.disabled = true;
    resultText.innerText = "Rolling...";

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${playerName}`);
        const data = await response.json();
        
        currentDiceRoll = data.totalMove; // ছক্কার মান গ্লোবালি সেভ হলো
        
        resultText.innerHTML = `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${currentDiceRoll}</b><br><span style="font-size:10px; color:#ffdf70;">Tap a token to move</span>`;
        
        setTimeout(() => { if (rollBtn) rollBtn.disabled = false; }, 1000);
    } catch (error) {
        resultText.innerText = "Error API!";
        if (rollBtn) rollBtn.disabled = false;
    }
};
                    
