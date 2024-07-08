document.addEventListener('DOMContentLoaded', function() {
    fetch('https://steijlen.sd-lab.nl/ex-digsign/users')
        .then(response => response.json())
        .then(users => {
            console.log('Fetched users:', users);
            displayData(users);
        })
        .catch(error => console.error('Error fetching users:', error));
});

function displayData(users) {
    const apiDataDiv = document.getElementById('api-data');
    const modal = document.getElementById('password-modal');
    const closeButton = document.querySelector('.close-button');
    const submitButton = document.getElementById('submit-button');
    let currentUser;

    console.log('Display users:', users);

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user');

        userDiv.innerHTML = `
            <img src="${user.Avatar}" alt="Avatar of ${user.Voornaam} ${user.Achternaam}" width="100" height="100">
            <div>
                <h3>Naam:</h3>
                <h3>${user.Voornaam} ${user.tussen} ${user.Achternaam}</h3>
            </div>
        `;

        userDiv.addEventListener('click', () => {
            console.log('User clicked:', user);
            currentUser = user;
            modal.style.display = 'block';
        });

        apiDataDiv.appendChild(userDiv);
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    submitButton.addEventListener('click', () => {
        const passwordInput = document.getElementById('password-input').value.trim(); // Trimmed input value
        console.log('Password input:', passwordInput);
        console.log('Current user:', currentUser);
    
        if (passwordInput === currentUser.PIN) {
            // Register the login using the 'registrate' endpoint
            fetch('https://steijlen.sd-lab.nl/ex-digsign/registrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "user_id": currentUser.ID, "registreer": true })
            })
            .then(response => response.json())
            .then(registrationResponse => {
                console.log('Registration response:', registrationResponse);
                
                // Fetch registrations to count logins in the past week
                return fetch(`https://steijlen.sd-lab.nl/ex-digsign/registrations/${currentUser.ID}`)
                    .then(response => response.json())
                    .then(registrations => {
                        console.log('Fetched registrations:', registrations);
                        const loginCount = countLoginsInPastWeek(registrations);
                        console.log('Login count:', loginCount); // Log login count
                        const message = loginCount >= 3 ? "fijn dat je het zo gezellig vind bij ons!" : "we zouden het leuk vinden je vaker te zien!";
                        console.log('Redirecting with message:', message);
                        window.location.href = `success.html?message=${encodeURIComponent(message)}`;
                    });
            })
            .catch(error => console.error('Error registering login:', error));
        } else {
            alert('Incorrect password. Please try again.');
        }
    });
    

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function countLoginsInPastWeek(registrations) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // One week ago
    let count = 0;

    registrations.forEach(registration => {
        const registrationDate = new Date(registration.CREATED_ON_TS);
        if (registrationDate >= oneWeekAgo && registrationDate <= now) {
            count++;
        }
    });

    console.log('Login count for past week:', count);
    return count;
}
