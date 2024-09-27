let plan = [];
let currentDay = 0;
let currentWeek = 0;
let completionStatus = Array.from({ length: 30 }, () => false);
let completionDates = Array.from({ length: 30 }, () => false);
let descriptions = Array.from({ length: 30 }, () => '');

// Inicializar SUNEditor
let editor;

document.addEventListener('DOMContentLoaded', () => {
    editor = SUNEDITOR.create('day-description', {
        buttonList: [
            ['undo', 'redo', 'bold', 'underline', 'italic', 'strike', 'list', 'align', 'font', 'fontSize', 'formatBlock', 'table', 'link', 'image', 'video', 'fullScreen']
        ],
        lang: SUNEDITOR_LANG['ko']
    });

    loadPlan();
    loadProgress();
});

// Recuperar el plan desde el servidor
async function loadPlan() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/plan', {
            headers: {
                'Authorization': token
            }
        });
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        const data = await response.json();
        plan = data;
        renderContent();
    } catch (error) {
        console.error('Error loading plan:', error);
    }
}

// Recuperar el progreso desde el servidor
async function loadProgress() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch(`http://localhost:3000/progress/${user.email}`, {
            headers: {
                'Authorization': token
            }
        });
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        const data = await response.json();
        if (data) {
            completionStatus = data.completionStatus;
            completionDates = data.completionDates;
            descriptions = data.descriptions || descriptions;
            redirectToLastCompletedDay();
            renderContent();
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Guardar el progreso en el servidor
async function saveProgress() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch('http://localhost:3000/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ userId: user.email, completionStatus, descriptions })
        });
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
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
    renderCompletionDate()
    renderDescription();
    renderSummary();
    renderProgressTitle();
    renderProgressBar();
}

function renderCheckbox() {
    const checkboxContainer = document.getElementById('checkbox-container');
    checkboxContainer.innerHTML = `
        <input type="checkbox" id="day-checkbox" ${completionStatus[currentWeek * 7 + currentDay] ? 'checked' : ''} onchange="toggleMarkAsDoneButton()">
        <label for="day-checkbox">He completado este día</label>
    `;
    toggleMarkAsDoneButton();
    renderCompletionDate();
}
function renderCompletionDate() {
    const completionDateContainer = document.getElementById('completion-date-container');
    const dayIndex = currentWeek * 7 + currentDay;
    const completionDate = completionDates[dayIndex];
    if (completionDate) {
        completionDateContainer.innerHTML = `<span class="tag">Completado el ${completionDate}</span>`;
    } else {
        completionDateContainer.innerHTML = '';
    }
}
function renderDescription() {
    const dayIndex = currentWeek * 7 + currentDay;
    editor.setContents(descriptions[dayIndex]);
}

function saveDescription() {
    const dayIndex = currentWeek * 7 + currentDay;
    const description = editor.getContents();
    descriptions[dayIndex] = description;
    showAlert('Descripcion guardada', 'success');
    saveProgress();
}

function renderSummary() {
    const summary = document.getElementById('summary');
    const remainingDays = [];
    for (let i = 0; i < completionStatus.length; i++) {
        const weekIndex = Math.floor(i / 7);
        const dayIndex = i % 7;
        const dayText = `Día ${i + 1}: ${plan[weekIndex].days[dayIndex]}`;
        if (completionStatus[i]) {
            remainingDays.push(`<li class="completed">${dayText} </li>`);
        } else {
            remainingDays.push(`<li class="pending">${dayText}</li>`);
        }
    }
    summary.innerHTML = remainingDays.length > 0 
        ? `<h3 onclick="toggleSummary()">Días por completar:</h3><ul>${remainingDays.join('')}</ul>`
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
    const dayIndex = currentWeek * 7 + currentDay;
    if (checkbox.checked) {
        completionStatus[dayIndex] = true;
        showAlert(`¡Bien hecho! Completaste el ${plan[currentWeek].days[currentDay]}.`, 'success');
        sendEmailNotification();
    } else {
        completionStatus[dayIndex] = false;
    }
    saveProgress();
    renderContent();
}

function toggleMarkAsDoneButton() {
    const checkbox = document.getElementById('day-checkbox');
    const markAsDoneButton = document.getElementById('mark-as-done-button');
    const dayIndex = currentWeek * 7 + currentDay;
    if (checkbox.checked && completionStatus[dayIndex]) {
        markAsDoneButton.disabled = true;
    } else {
        markAsDoneButton.disabled = false;
    }
}

function sendEmailNotification() {
    const user = JSON.parse(localStorage.getItem('user'));
    const templateParams = {
        to_email: 'tu_correo@ejemplo.com', // Cambia esto por tu dirección de correo
        day: plan[currentWeek].days[currentDay], // Envía el día completado
        subject: `🎉 Hola! ${user.firstName} Notificación de Progreso dia numero ${plan[currentWeek].days[currentDay]}` 
    };

    emailjs.send('service_rqigop3', 'template_n80o0be', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showAlert('¡Correo enviado exitosamente! 🎉', 'success');
        }, function(error) {
            console.log('FAILED...', error);
            // showAlert('Error al enviar el correo. Intenta nuevamente.', 'error');
        });
}

// Funciones de autenticación y perfil
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
        document.getElementById('user-initials').textContent = initials;
        const userInitials = document.getElementById('user-initials');
        const userMenu = document.getElementById('user-menu');

        userInitials.addEventListener('click', () => {
            userMenu.classList.toggle('visible');
        });

        document.addEventListener('click', (event) => {
            if (!userInitials.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.remove('visible');
            }
        });
    } else {
        window.location.href = 'login.html';
    }
});

function redirectToLastCompletedDay() {
    const lastCompletedIndex = completionStatus.lastIndexOf(true);
    if (lastCompletedIndex !== -1) {
        currentWeek = Math.floor(lastCompletedIndex / 7);
        currentDay = lastCompletedIndex % 7;
    }
    renderContent();
}

function showProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const newFirstName = prompt('Nuevo nombre:', user.firstName);
    const newLastName = prompt('Nuevo apellido:', user.lastName);
    const newPassword = prompt('Nueva contraseña:');
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, firstName: newFirstName, lastName: newLastName, password: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('user', JSON.stringify(data));
        alert('Perfil actualizado');
        location.reload();
    })
    .catch(err => console.error(err));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('Sesion finalizada', 'warnning');
    setTimeout(() => { window.location.href = 'login.html';}, 1000);
}