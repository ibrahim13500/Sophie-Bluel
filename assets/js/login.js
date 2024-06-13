document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector('#login form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Formulaire de connexion soumis avec:', { email, password });

            const loginData = {
                email: email,
                password: password
            };

            try {
                const response = await fetch('http://localhost:5678/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('isLoggedIn', "true"); // Mettre à jour l'état de connexion
                    window.location.href = './index.html'; // Redirection après connexion réussie
                } else {
                    if (loginError) {
                        loginError.style.visibility = 'visible';
                        loginError.innerText = result.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
                    }

                    console.log('Erreur de connexion:', result.message);
                }
            } catch (error) {
                console.error('Erreur:', error);
                if (loginError) {
                    loginError.style.visibility = 'visible';
                    loginError.innerText = 'Une erreur s\'est produite. Veuillez réessayer plus tard.';
                }
            }
        });
    }
});
