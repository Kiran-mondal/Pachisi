// =========================================
// 1. Responsive Hamburger Menu Logic
// =========================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// =========================================
// 2. My Projects (JSON Data Render) Logic
// =========================================
const myProjectsBtn = document.getElementById('my-projects-btn');
const modal = document.getElementById('projects-modal');
const closeModal = document.getElementById('close-modal');
const projectsContainer = document.getElementById('projects-container');

// JSON Array to hold your portfolio projects
const myProjectsData = [
    {
        title: "E-commerce Platform",
        description: "A modern shopping platform integrated with a real-time payment gateway.",
        link: "#"
    },
    {
        title: "Real-time Chat Application",
        description: "A seamless chatting application built using Socket.io and Node.js.",
        link: "#"
    }
];

// Function to render project cards from JSON
function renderProjects() {
    projectsContainer.innerHTML = ''; 
    myProjectsData.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project-card');
        projectDiv.innerHTML = `
            <h3 style="color: #8b0000; font-family: 'Cinzel', serif;">${project.title}</h3>
            <p style="font-family: Arial, sans-serif; margin-top: 5px;">${project.description}</p>
            <a href="${project.link}" target="_blank" style="color: #d4af37; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px; font-family: Arial, sans-serif;">View Project</a>
        `;
        projectsContainer.appendChild(projectDiv);
    });
}

myProjectsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderProjects();
    modal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// =========================================
// 3. Traditional Dice (Pasha) Roll Logic
// =========================================
const rollBtn = document.getElementById('roll-dice-btn');
const pasha1 = document.getElementById('pasha-1');
const pasha2 = document.getElementById('pasha-2');
const resultText = document.getElementById('dice-result');

// Traditional Pachisi stick dice values: 1, 3, 4, 6
const validDiceFaces = [1, 3, 4, 6];

rollBtn.addEventListener('click', () => {
    const random1 = Math.floor(Math.random() * validDiceFaces.length);
    const random2 = Math.floor(Math.random() * validDiceFaces.length);

    const val1 = validDiceFaces[random1];
    const val2 = validDiceFaces[random2];

    pasha1.innerText = val1;
    pasha2.innerText = val2;

    if (val1 === val2) {
        resultText.innerText = `Result: Doublet! (${val1} & ${val2}). Move as a pair (Jodi) or separately.`;
    } else {
        resultText.innerText = `Result: ${val1} and ${val2}. Total move: ${val1 + val2}`;
    }
});

// =========================================
// 4. Board Generation & Initial Token Setup
// =========================================
const arms = ['black-arm', 'yellow-arm', 'green-arm', 'red-arm'];
const colors = ['black', 'yellow', 'green', 'red'];

// Generate 24 squares for each arm
function createBoard() {
    arms.forEach(armId => {
        const armContainer = document.getElementById(armId);
        
        for (let i = 1; i <= 24; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.id = `${armId}-sq-${i}`;
            
            // Highlighting the 'Belly' squares (1 to 7) as safe zones
            if (i >= 1 && i <= 7) {
                square.style.backgroundColor = 'rgba(212, 175, 55, 0.3)'; // Gold tint
            }
            
            armContainer.appendChild(square);
        }
    });
}

// Place tokens according to the traditional rules (6, 7, and Jodi on 12)
function placeInitialTokens() {
    colors.forEach((color, index) => {
        const armId = arms[index];
        
        const createToken = () => {
            const token = document.createElement('div');
            token.classList.add('token', `token-${color}`);
            token.dataset.color = color;
            return token;
        };

        const sq6 = document.querySelector(`[data-id="${armId}-sq-6"]`);
        if(sq6) sq6.appendChild(createToken());

        const sq7 = document.querySelector(`[data-id="${armId}-sq-7"]`);
        if(sq7) sq7.appendChild(createToken());

        const sq12 = document.querySelector(`[data-id="${armId}-sq-12"]`);
        if(sq12) {
            sq12.appendChild(createToken());
            sq12.appendChild(createToken()); // Jodi
        }
    });
}

// Initialize the board
createBoard();
placeInitialTokens();
