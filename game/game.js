const RUBY_BACKEND_URL = "https://pachisi-rpfj.onrender.com"; 

window.init3DGame = function() {
    try {
        if (typeof THREE === 'undefined') {
            alert("Error: Three.js ইন্টারনেট থেকে লোড হয়নি!");
            return;
        }
        if (typeof THREE.OrbitControls === 'undefined') {
            alert("Error: OrbitControls লোড হয়নি!");
            return;
        }

        const container = document.getElementById('three-canvas-container');
        if (!container) {
            alert("Error: Canvas container HTML-এ পাওয়া যায়নি!");
            return;
        }
        
        container.innerHTML = ''; 

        // নির্দিষ্ট সাইজ দেওয়া হলো
        let width = container.clientWidth || 350;
        let height = container.clientHeight || 350;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a0f08); 

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 40, 40); 
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffdf70, 1);
        dirLight.position.set(20, 50, 20);
        scene.add(dirLight);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // সিম্পল একটি বোর্ড এবং হোম রেন্ডার
        const homeMat = new THREE.MeshStandardMaterial({ color: 0xdcb360 }); 
        const centerHome = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), homeMat);
        scene.add(centerHome);

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        
        // সব কাজ ঠিকঠাক হলে এই মেসেজটি আসবে
        alert("Success! 3D Board has been rendered properly.");

    } catch(err) {
        alert("3D Engine Error: " + err.message);
    }
};

window.rollDiceFromServer = async function(playerName = 'red') {
    const resultText = document.getElementById('dice-result');
    resultText.innerText = "Rolling API...";
    try {
        const response = await fetch(`${RUBY_BACKEND_URL}/api/roll?player=${playerName}`);
        const data = await response.json();
        resultText.innerHTML = `Move: <b>${data.totalMove}</b>`;
    } catch (error) {
        resultText.innerText = "API Error!";
    }
};
