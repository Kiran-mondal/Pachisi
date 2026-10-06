const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

window.init3DGame = function() {
    if (typeof THREE === 'undefined') {
        console.error("Three.js not loaded.");
        return;
    }

    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    container.innerHTML = ''; 

    let width = container.clientWidth || window.innerWidth * 0.9;
    let height = container.clientHeight || 400;

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

    // সম্পূর্ণ বোর্ড তৈরি
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); 
    const safeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.6 }); 
    const homeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360, roughness: 0.7 }); 

    const yardMats = {
        yellow: new THREE.MeshStandardMaterial({ color: 0x111111 }),
        black: new THREE.MeshStandardMaterial({ color: 0x2a2118 }),
        red: new THREE.MeshStandardMaterial({ color: 0x4a3224 }),
        green: new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
    };

    const squareGeo = new THREE.BoxGeometry(1.9, 0.5, 1.9);
    const yardGeo = new THREE.BoxGeometry(12, 0.4, 12); 

    const centerHome = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), homeMat);
    scene.add(centerHome);

    const createYard = (x, z, mat) => {
        let yard = new THREE.Mesh(yardGeo, mat);
        yard.position.set(x, -0.05, z);
        scene.add(yard);
    };
    
    createYard(-9, -9, yardMats.yellow); 
    createYard(9, -9, yardMats.black);   
    createYard(-9, 9, yardMats.red);       
    createYard(9, 9, yardMats.green);    

    function createArm(startX, startZ, isVertical, dirSign) {
        for (let row = 0; row < 8; row++) {
            for (let col = -1; col <= 1; col++) {
                let posX = isVertical ? (col * 2) : startX + (row * dirSign * 2);
                let posZ = isVertical ? startZ + (row * dirSign * 2) : (col * 2);
                
                let isSafeZone = (row === 3 && col === 0) || (row === 0 && (col === -1 || col === 1));
                let mesh = new THREE.Mesh(squareGeo, isSafeZone ? safeMat : boardMat);
                mesh.position.set(posX, 0, posZ);
                scene.add(mesh);
            }
        }
    }

    createArm(0, 4, true, 1);      
    createArm(0, -4, true, -1);    
    createArm(4, 0, false, 1);     
    createArm(-4, 0, false, -1);   

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
    
