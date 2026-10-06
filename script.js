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
            if (target) { e.preventDefault(); activateTab(target); }
        });
    });

    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

    // 🌟 Setup Variables 🌟
    let selectedMode = 'pass_play';
    let selectedPlayers = 4;
    let selectedColor = 'red';

    // Helper to toggle active classes
    function handleSelection(selector, callback) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(btn.getAttribute('data-val'));
            });
        });
    }

    handleSelection('.mode-btn', val => selectedMode = val);
    handleSelection('.player-btn', val => selectedPlayers = parseInt(val));
    handleSelection('.color-btn', val => selectedColor = val);

    // Start Game
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            void document.getElementById('actual-game-screen').offsetWidth;

            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    // তিনটি অপশনই 3D ইঞ্জিনে পাঠানো হলো
                    window.init3DGame(selectedMode, selectedPlayers, selectedColor);
                }
            }, 300);
        });
    }

    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (typeof window.rollDiceFromServer === 'function') {
                window.rollDiceFromServer();
            }
        });
    }
});
