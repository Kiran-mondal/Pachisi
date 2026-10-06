document.addEventListener('DOMContentLoaded', () => {

    // Tab Logic
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

    // 🌟 Mode Selection Logic 🌟
    let selectedMode = 'pass_play';
    const modePassPlay = document.getElementById('mode-pass-play');
    const modeComputer = document.getElementById('mode-computer');

    if(modePassPlay && modeComputer) {
        modePassPlay.addEventListener('click', () => {
            selectedMode = 'pass_play';
            modePassPlay.style.borderColor = '#dcb360';
            modePassPlay.style.background = '#2a2118';
            modePassPlay.style.color = 'white';
            modeComputer.style.borderColor = 'transparent';
            modeComputer.style.background = '#1a0f08';
            modeComputer.style.color = 'gray';
        });
        
        modeComputer.addEventListener('click', () => {
            selectedMode = 'computer';
            modeComputer.style.borderColor = '#dcb360';
            modeComputer.style.background = '#2a2118';
            modeComputer.style.color = 'white';
            modePassPlay.style.borderColor = 'transparent';
            modePassPlay.style.background = '#1a0f08';
            modePassPlay.style.color = 'gray';
        });
    }

    // Start Game
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            void document.getElementById('actual-game-screen').offsetWidth;

            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame(selectedMode); // নির্বাচিত মোড পাস করা হলো
                }
            }, 300);
        });
    }

    // Roll Dice
    const rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            if (typeof window.rollDiceFromServer === 'function') {
                window.rollDiceFromServer();
            }
        });
    }
});
