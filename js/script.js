// Función para alternar entre modo oscuro y modo claro
document.getElementById('toggleDarkMode').addEventListener('click', function () {
    document.body.classList.toggle('light-mode');
    const header = document.querySelector('header');
    header.classList.toggle('light-mode');
    
    // Guardar la preferencia en localStorage
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Cargar la preferencia de tema al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
});

// Simulación de CRUD con localStorage (para guardar reseñas)
const formResena = document.getElementById('formResena');
const listaResenas = document.getElementById('listaResenas');

// Mostrar reseñas guardadas
function mostrarResenas() {
    listaResenas.innerHTML = ''; // Limpiar la lista
    const resenas = JSON.parse(localStorage.getItem('resenas')) || [];
    resenas.forEach((resena, index) => {
        const divResena = document.createElement('div');
        divResena.classList.add('resena');
        divResena.innerHTML = `
            <h4>${resena.nombre}</h4>
            <p>${resena.descripcion}</p>
            <img src="${resena.foto}" alt="${resena.nombre}" width="100">
            <button onclick="eliminarResena(${index})">Eliminar</button>
        `;
        listaResenas.appendChild(divResena);
    });
}

// Guardar una nueva reseña
formResena.addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreTrago').value;
    const descripcion = document.getElementById('descripcion').value;
    const foto = document.getElementById('fotoTrago').files[0];

    if (foto) {
        const reader = new FileReader();
        reader.onload = function () {
            const nuevaResena = {
                nombre: nombre,
                descripcion: descripcion,
                foto: reader.result,
            };
            const resenas = JSON.parse(localStorage.getItem('resenas')) || [];
            resenas.push(nuevaResena);
            localStorage.setItem('resenas', JSON.stringify(resenas));
            mostrarResenas();
        };
        reader.readAsDataURL(foto);
    }
});

// Eliminar una reseña
function eliminarResena(index) {
    const resenas = JSON.parse(localStorage.getItem('resenas')) || [];
    resenas.splice(index, 1);
    localStorage.setItem('resenas', JSON.stringify(resenas));
    mostrarResenas();
}

// Cargar las reseñas al iniciar
document.addEventListener('DOMContentLoaded', mostrarResenas);

// Iniciar sesión con Firebase
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Redirigir a home.html si el login es exitoso
            window.location.href = 'home.html';
        })
        .catch(error => {
            alert(error.message);
        });
});

// Registrar usuario con Firebase
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Redirigir a home.html después del registro
            window.location.href = 'home.html';
        })
        .catch(error => {
            alert(error.message);
        });
});

// Guardar mensaje de contacto
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const mensaje = document.getElementById('mensaje').value;

    // Puedes agregar lógica aquí para enviar el mensaje a un correo o base de datos
    alert('Gracias por tu mensaje, te responderemos pronto.');
});


// Alternar entre modo oscuro y claro
document.getElementById('toggleDarkMode').addEventListener('click', function () {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    
    // Guardar la preferencia en localStorage
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Cargar la preferencia de tema al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }
});
// script.js

// Capturar el formulario de registro
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevenir el envío del formulario

    // Obtener los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const edad = parseInt(document.getElementById('edad').value);
    const password = document.getElementById('password').value;

    // Validación de los datos
    if (!nombre || !email || !telefono || !edad || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if (edad < 18) {
        alert("Debes ser mayor de 18 años para registrarte.");
        return;
    }

    // Crear objeto con los datos del usuario
    const usuario = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        edad: edad,
        password: password
    };

    // Almacenar en localStorage (de forma simulada)
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Confirmación de registro
    alert("¡Registro exitoso!");
    window.location.href = "home.html"; // Redirigir al inicio después del registro
});

// Mostrar los usuarios registrados (para fines de prueba)
document.addEventListener('DOMContentLoaded', function() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const listaUsuarios = document.getElementById('listaUsuarios');

    if (usuarios.length === 0) {
        listaUsuarios.innerHTML = "<p>No hay usuarios registrados.</p>";
    } else {
        usuarios.forEach(usuario => {
            const div = document.createElement('div');
            div.classList.add('usuario');
            div.innerHTML = `
                <h3>${usuario.nombre}</h3>
                <p>Email: ${usuario.email}</p>
                <p>Teléfono: ${usuario.telefono}</p>
                <p>Edad: ${usuario.edad}</p>
            `;
            listaUsuarios.appendChild(div);
        });
    }
});
