async function incrementStreak() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(`${window.env.BACK_END_ENV}/update-streak`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });

        const data = await response.json();
        document.getElementById('streak-count').textContent = data.streak;
        localStorage.setItem('lastStreakUpdate', new Date().toISOString());
        checkStreakButton();
    } catch (error) {
        console.error('Error al actualizar la racha:', error);
    }
}

async function displayStreak() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(`${window.env.BACK_END_ENV}/get-streak?userId=${user.id}`);
        const data = await response.json();
        document.getElementById('streak-count').innerText = data.streak;
    } catch (error) {
        console.error('Error al obtener la racha:', error);
    }
}

function checkStreakButton() {
    const lastStreakUpdate = localStorage.getItem('lastStreakUpdate');
    const streakButton = document.getElementById('streak-button');

    if (lastStreakUpdate) {
        const lastUpdateDate = new Date(lastStreakUpdate);
        const today = new Date();
        if (today.toDateString() === lastUpdateDate.toDateString()) {
            streakButton.disabled = true;
        } else {
            streakButton.disabled = false;
        }
    } else {
        streakButton.disabled = false;
    }
}