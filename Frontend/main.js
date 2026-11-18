document.addEventListener('DOMContentLoaded', function() {
    
    // ===== LÓGICA DE LOGIN =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('✅ ' + data.message);
                    console.log('Usuario logueado:', data.usuario);
                    // Aquí podrías redirigir: window.location.href = 'dashboard.html';
                } else {
                    alert('❌ ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            });
        });
    }

});