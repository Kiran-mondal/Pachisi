// Render Backend URL
const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 
let scene, camera, renderer, controls;

// 🌟 গ্লোবাল ফাংশন হিসেবে ডিক্লেয়ার করা হলো যাতে script.js একে কল করতে পারে
window.init3DGame = function() {
    console.log("3D Engine Initializing from game/game.js...");

    if (typeof THREE === 'undefined') {
        alert("Error: Three.js লাইব্রেরি লোড হয়নি!");
        return;
    }

    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    
    container.innerHTML = ''; 

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

    // --- বোর্ড তৈরি করা ---
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); 
    const homeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.7 }); 
    
    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), homeMat);
    scene.add(centerHome);

    const squareGeo = new THREE.BoxGeometry(1.9, 0.5, 1.9);
    function createArm(startX, startZ, isVertical, dirSign) {
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * 2) : startX + (row * dirSign * 2);
                let posZ = isVertical ? startZ + (row * dirSign * 2) : (col * 2);
                
                let mesh = new THREE.Mesh(squareGeo, boardMat);
                mesh.position.set(posX, 0, posZ);
                scene.add(mesh);
            }
        }
    }
    
    createArm(0, 4, true, 1);      // Bottom
    createArm(0, -4, true, -1);    // Top
    createArm(4, 0, false, 1);     // Right
    createArm(-4, 0, false, -1);   // Left

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

// 🌟 ডাইস রোল API ফাংশন (গ্লোবাল)
window.rollDiceFromServer = async function(playerName = 'red') {
    const rollBtn = document.getElementById('roll-dice-btn');
    const resultText = document.getElementById('dice-result');
    if (rollBtn) rollBtn.disabled = true;
    resultText.innerText = "Rolling...";

    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${playerName}`);
        const data = await response.json();
        resultText.innerHTML = `${data.dice[0]} & ${data.dice[1]}<br>Move: <b>${data.totalMove}</b>`;
        setTimeout(() => { if (rollBtn) rollBtn.disabled = false; }, 1000);
    } catch (error) {
        resultText.innerText = "Error!";
        if (rollBtn) rollBtn.disabled = false;
    }
};
            
