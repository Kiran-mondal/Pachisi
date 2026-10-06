// 🌟 Error Detector: মোবাইলে কোনো কোড ক্র্যাশ করলে সেটা স্ক্রিনে দেখাবে 🌟
window.onerror = function(message, source, lineno, colno, error) {
    alert("Mobile Error Detected!\nMessage: " + message + "\nLine: " + lineno);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
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

    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            try {
                document.getElementById('game-setup-screen').style.display = 'none';
                document.getElementById('actual-game-screen').style.display = 'flex';
                
                // ব্রাউজারকে লেআউট লোড করার জন্য বাধ্য করা
                void document.getElementById('actual-game-screen').offsetWidth;

                setTimeout(() => {
                    if (typeof window.init3DGame === 'function') {
                        window.init3DGame();
                    } else {
                        alert("Error: init3DGame() ফাংশন খুঁজে পাওয়া যাচ্ছে না! game/game.js ফাইলটি কি ঠিক জায়গায় আছে?");
                    }
                }, 500);
            } catch(err) {
                alert("Start Button Error: " + err.message);
            }
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
