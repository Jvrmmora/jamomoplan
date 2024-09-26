let plan = [];
let currentDay = 0;
let currentWeek = 0;
let completionStatus = Array.from({length: 30}, () => false);
const userId = 'user1'; // Puedes cambiar esto por un ID de usuario dinámico

// Recuperar el plan desde el servidor
async function loadPlan() {
    try {
        const response = await fetch('http://localhost:3000/plan');
        const data = await response.json();
        plan = data;
        renderContent();
    } catch (error) {
        console.error('Error loading plan:', error);
    }
}

// Recuperar el progreso desde el servidor
async function loadProgress() {
    try {
        const response = await fetch(`http://localhost:3000/progress/${userId}`);
        const data = await response.json();
        if (data) {
            completionStatus = data.completionStatus;
            renderContent();
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Guardar el progreso en el servidor
async function saveProgress() {
    try {
        const response = await fetch('http://localhost:3000/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, completionStatus })
        });
        const data = await response.json();
        console.log('Progress saved:', data);
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

function renderContent() {
    if (plan.length === 0) return;
    const content = document.getElementById('content');
    content.innerHTML = `<h2>${plan[currentWeek].week}</h2>`;
    content.innerHTML += `<div class="day">${plan[currentWeek].days[currentDay]}</div>`;
    renderCheckbox();
    renderSummary();
    renderProgressTitle();
    renderProgressBar();
}

function renderCheckbox() {
    const checkboxContainer = document.getElementById('checkbox-container');
    checkboxContainer.innerHTML = `
        <input type="checkbox" id="day-checkbox" ${completionStatus[currentWeek * 7 + currentDay] ? 'checked' : ''}>
        <label for="day-checkbox">He completado este día</label>
    `;
}

function renderSummary() {
    const summary = document.getElementById('summary');
    const remainingDays = [];
    for (let i = 0; i < completionStatus.length; i++) {
        if (!completionStatus[i]) {
            const weekIndex = Math.floor(i / 7);
            const dayIndex = i % 7;
            remainingDays.push(`Día ${i + 1}: ${plan[weekIndex].days[dayIndex]}`);
        }
    }
    summary.innerHTML = remainingDays.length > 0 
        ? `<h3 onclick="toggleSummary()">Días por completar: ⬇️</h3><ul>${remainingDays.map(day => `<li class="pending">${day}</li>`).join('')}</ul>`
        : '<h3>¡Todos los días completados!</h3>';
}

function toggleSummary() {
    const summaryList = document.querySelector('#summary ul');
    summaryList.classList.toggle('expanded');
}

function renderProgressTitle() {
    const progressTitle = document.createElement('h2');
    progressTitle.id = 'progress-title';
    const completedDays = completionStatus.filter(status => status).length;
    const progressPercentage = ((completedDays / 30) * 100).toFixed(2);
    progressTitle.textContent = `Progreso Actual: ${progressPercentage}%`;
    document.getElementById('summary').appendChild(progressTitle);
}

function renderProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const completedDays = completionStatus.filter(status => status).length;
    const progressPercentage = (completedDays / 30) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Añadir la imagen de la bandera al final de la barra de progreso
    const flag = document.createElement('img');
    flag.src = 'images/flag.png'; // Asegúrate de que la ruta sea correcta
    flag.className = 'flag';
    progressContainer.appendChild(flag); // Añadir la bandera al contenedor de progreso

    progressContainer.appendChild(progressBar);
    document.getElementById('summary').appendChild(progressContainer);
}

function nextDay() {
    if (currentDay < plan[currentWeek].days.length - 1) {
        currentDay++;
    } else if (currentWeek < plan.length - 1) {
        currentWeek++;
        currentDay = 0;
    }
    renderContent();
}

function prevDay() {
    if (currentDay > 0) {
        currentDay--;
    } else if (currentWeek > 0) {
        currentWeek--;
        currentDay = plan[currentWeek].days.length - 1;
    }
    renderContent();
}

function markAsDone() {
    const checkbox = document.getElementById('day-checkbox');
    if (checkbox.checked) {
        completionStatus[currentWeek * 7 + currentDay] = true;
        alert(`¡Bien hecho! Completaste el ${plan[currentWeek].days[currentDay]}.`);
        sendEmailNotification();
        saveProgress();
        renderContent();
    } else {
        alert('Marca el día como completado.');
    }
}

function sendEmailNotification() {
    const templateParams = {
        to_email: 'tu_correo@ejemplo.com', // Cambia esto por tu dirección de correo
        day: plan[currentWeek].days[currentDay], // Envía el día completado
        subject: `🎉 Notificación de Progreso dia numero ${plan[currentWeek].days[currentDay]}` 
    };

    emailjs.send('service_rqigop3', 'template_n80o0be', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('¡Correo enviado exitosamente! 🎉');
        }, function(error) {
            console.log('FAILED...', error);
            alert('Error al enviar el correo. Intenta nuevamente.');
        });
}

// Cargar el plan y el progreso al iniciar
loadPlan();
loadProgress();