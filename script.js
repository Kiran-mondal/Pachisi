document.addEventListener('DOMContentLoaded', () => {
    console.log("UI Script Loaded!");

    // ১. Tab কন্ট্রোল
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add('active');
        
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

    // ২. My Projects 
    document.getElementById('my-projects-btn')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.location.href = 'projects/index.html'; 
    });

    // ৩. Mobile Hamburger
    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

    // 🌟 ৪. Start Game Button 🌟
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            // game.js থেকে init3DGame() কল করা হচ্ছে
            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    alert("Error: 3D Engine is missing. Make sure game.js is loaded.");
                }
            }, 300);
        });
    }

    // 🌟 ৫. Roll Dice Button 🌟
    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            // game.js থেকে rollDiceFromServer() কল করা হচ্ছে
            if (typeof window.rollDiceFromServer === 'function') {
                window.rollDiceFromServer('red');
            }
        });
    }
});
