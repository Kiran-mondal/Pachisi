// ১. তোমার রেন্ডারের লাইভ লিংক
const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

let scene, camera, renderer, controls;
const SQUARE_SIZE = 2; // প্রতিটি ঘরের সাইজ
let squareCoordinates = {}; // প্রতিটি ঘরের 3D পজিশন সেভ রাখার জন্য

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

    // সিন এবং ব্যাকগ্রাউন্ড
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f08); 

    // ক্যামেরা সেটআপ (আইসোমেট্রিক ভিউ)
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 45, 45); 
    camera.lookAt(0, 0, 0);

    // রেন্ডারার
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // লাইটিং (আলো)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffdf70, 1);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // মাউস দিয়ে ঘোরানোর কন্ট্রোল
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2.2; // মাটির নিচে যাবে না
    controls.enableDamping = true;

    // থ্রিডি বোর্ড তৈরি করা
    buildPachisiBoard3D();
    
    // টেস্টিংয়ের জন্য একটি ঘুঁটি তৈরি
    setupTokens3D();

    // অ্যানিমেশন লুপ
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// 🌟 পঁচিশির প্লাস (+) আকৃতির বোর্ড তৈরি 🌟
function buildPachisiBoard3D() {
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xecd6b0, roughness: 0.9 }); // সাধারণ ঘর
    const safeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.6 }); // সেফ জোন (গোল্ডেন)
    const homeMat = new THREE.MeshStandardMaterial({ color: 0x7a1f1f, roughness: 0.7 }); // সেন্টার হোম (লাল)

    const squareGeo = new THREE.BoxGeometry(SQUARE_SIZE * 0.95, 0.5, SQUARE_SIZE * 0.95);

    // সেন্টার হোম (৩x৩ সাইজ)
    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(SQUARE_SIZE * 3, 0.6, SQUARE_SIZE * 3), homeMat);
    centerHome.receiveShadow = true;
    scene.add(centerHome);
    squareCoordinates['home'] = { x: 0, y: 0.3, z: 0 };

    // ৪টি দিকের আর্ম জেনারেট করার ফাংশন
    function createArm(armName, startX, startZ, isVertical) {
        let count = 1;
        // প্রতিটি আর্ম ৮টি সারি এবং ৩টি কলামের হয়
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                
                let posX = isVertical ? (col * SQUARE_SIZE) : startX + (row * Math.sign(startX) * SQUARE_SIZE);
                let posZ = isVertical ? startZ + (row * Math.sign(startZ) * SQUARE_SIZE) : (col * SQUARE_SIZE);
                
                // সেফ জোন (Cross) নির্ধারণ
                let isSafeZone = (row === 3 && col === 0) || (row === 0 && (col === -1 || col === 1));
                
                let mesh = new THREE.Mesh(squareGeo, isSafeZone ? safeMat : boardMat);
                mesh.position.set(posX, 0, posZ);
                mesh.receiveShadow = true;
                scene.add(mesh);

                // কোঅর্ডিনেট সেভ করে রাখা
                let sqId = `${armName}-arm-sq-${count++}`;
                squareCoordinates[sqId] = { x: posX, y: 0.25, z: posZ };
            }
        }
    }

    // ৪টি দিকের আর্ম কল করা
    createArm('bottom', 0, SQUARE_SIZE * 2, true);      // নিচের আর্ম
    createArm('top', 0, -SQUARE_SIZE * 2, true);        // ওপরের আর্ম
    createArm('right', SQUARE_SIZE * 2, 0, false);      // ডানদিকের আর্ম
    createArm('left', -SQUARE_SIZE * 2, 0, false);      // বাঁদিকের আর্ম
}

// 🌟 থ্রিডি ঘুঁটি (Token) সেটআপ 🌟
function setupTokens3D() {
    const tokenGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.5, 32);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    
    // টেস্টিংয়ের জন্য একটি ঘুঁটি সেফ জোনে বসানো হলো
    let testToken = new THREE.Mesh(tokenGeo, redMat);
    let targetSq = squareCoordinates['bottom-arm-sq-11']; // সেফ জোন
    testToken.position.set(targetSq.x, targetSq.y + 0.75, targetSq.z);
    testToken.castShadow = true;
    scene.add(testToken);
}

// গ্লোবাল ফাংশন হিসেবে অ্যাক্সেস দেওয়ার জন্য (যাতে script.js কল করতে পারে)
window.init3DGame = init3DGame;
             
