document.addEventListener('DOMContentLoaded', () => {
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            activateTab(btn.getAttribute('data-target')); 
        });
    });

    document.getElementById('start-game-btn')?.addEventListener('click', () => {
        document.getElementById('game-setup-screen').style.display = 'none';
        document.getElementById('actual-game-screen').style.display = 'flex';
        
        // গেম স্ক্রিন আসার পর 3D ইঞ্জিন চালু হবে
        if (typeof init3DGame === 'function') {
            setTimeout(() => init3DGame(), 100);
        }
    });
});
