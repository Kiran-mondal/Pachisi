document.addEventListener('DOMContentLoaded', () => {
    console.log("Script.js loaded successfully!");

    // ১. ট্যাব পরিবর্তন করার লজিক
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            const target = btn.getAttribute('data-target');
            if (target) {
                e.preventDefault(); 
                document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
                const targetEl = document.getElementById(target);
                if (targetEl) targetEl.classList.add('active');
            }
        });
    });

    // ২. পোর্টফোলিও লিংক
    const myProjectsBtn = document.getElementById('my-projects-btn');
    if (myProjectsBtn) {
        myProjectsBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            window.location.href = 'projects/index.html'; 
        });
    }

    // ৩. মোবাইল মেনু
    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

    // 🌟 ৪. গেম স্টার্ট বাটন লজিক (Error Checker সহ) 🌟
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log("Start button clicked!");
            
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    alert("Error: 3D Engine (game.js) লোড হয়নি! index.html এ স্ক্রিপ্টের সিরিয়াল চেক করো।");
                }
            }, 300);
        });
    } else {
        console.error("Start Game Button not found in HTML!");
    }
});
