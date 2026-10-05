document.addEventListener('DOMContentLoaded', () => {

    // ১. ট্যাব কন্ট্রোল (Home, Play, Rules)
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
        }
        
        // মোবাইল মেনু বন্ধ করা
        const navLinks = document.getElementById('nav-links');
        if(navLinks) navLinks.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            if (!btn.hasAttribute('href') || btn.getAttribute('href') === '#') {
                e.preventDefault(); 
            }
            activateTab(btn.getAttribute('data-target')); 
        });
    });

    // ২. My Projects ট্যাবের লজিক (অপরিবর্তিত)
    const myProjectsBtn = document.getElementById('my-projects-btn');
    if (myProjectsBtn) {
        myProjectsBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            window.location.href = 'projects/index.html'; 
        });
    }

    // ৩. মোবাইল মেনু (হ্যামবার্গার)
    document.getElementById('hamburger')?.addEventListener('click', (e) => {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
            e.currentTarget.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        }
    });

    // ৪. গেম স্টার্ট লজিক (3D ইঞ্জিনের সাথে কানেক্ট করা)
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // সেটআপ স্ক্রিন লুকিয়ে আসল গেম স্ক্রিন আনবে
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            // একটু সময় নিয়ে Three.js ইঞ্জিন চালু করবে
            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    console.error("3D Engine is not loaded properly. Check game/game.js file.");
                }
            }, 150);
        });
    }
});
