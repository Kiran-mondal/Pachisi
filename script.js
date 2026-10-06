// Mobile Error Handling
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error Detected: " + message + " at line " + lineno);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {

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

    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

    // Game Start Button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            // Force browser to render layout
            void document.getElementById('actual-game-screen').offsetWidth;

            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    alert("Error: 3D Engine script is missing!");
                }
            }, 300);
        });
    }

    // Roll Dice Button
    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (typeof window.rollDiceFromServer === 'function') {
                window.rollDiceFromServer('red');
            }
        });
    }
});
