document.addEventListener('DOMContentLoaded', () => {

    // ট্যাব পরিবর্তন লজিক
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add('active');
        
        // মেনুবার অটো-ক্লোজ করা
        const navLinks = document.getElementById('nav-links');
        if(navLinks) navLinks.classList.remove('active');
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            const target = btn.getAttribute('data-target');
            if (target) {
                e.preventDefault(); 
                activateTab(target); 
            }
        });
    });

    // হ্যামবার্গার মেনু (মোবাইলের জন্য)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // গেম স্টার্ট লজিক
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('game-setup-screen').style.display = 'none';
            const gameScreen = document.getElementById('actual-game-screen');
            gameScreen.style.display = 'flex';
            
            // মোবাইল ব্রাউজারকে ডিসপ্লে রিফ্রেশ করার সময় দেওয়া
            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    console.error("3D Engine is still loading.");
                }
            }, 300);
        });
    }

    // ডাইস রোল লজিক
    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (typeof window.rollDiceFromServer === 'function') {
                window.rollDiceFromServer('red');
            }
        });
    }
});
