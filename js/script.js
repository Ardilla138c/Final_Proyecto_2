/* script.js - manejo de usuarios, reseñas y tema */
/* Recomendación: incluir defer en los scripts en los HTML */

(function(){ 
  'use strict';

  /* ---------- UTILIDADES ---------- */
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  function showAlert(message, type = 'success', timeout = 2800) {
    const existing = document.querySelector('.alert-fixed');
    if(existing) existing.remove();
    const div = document.createElement('div');
    div.className = `alert alert-${type} alert-fixed`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(()=> div.classList.add('show'), 10);
    setTimeout(()=> div.remove(), timeout);
  }

  /* ---------- TEMA (claro/oscuro) ---------- */
  // Nota: eliminé duplicados y centralicé la función de tema más abajo
  const themeToggle = qs('#toggleDarkMode');
  function applyStoredTheme(){
    const theme = localStorage.getItem('theme') || 'dark';
    if(theme === 'light') document.body.classList.remove('dark-mode');
    else document.body.classList.add('dark-mode');
  }
  applyStoredTheme();

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', current);
    });
  }

  /* ---------- SISTEMA DE USUARIOS (localStorage) ---------- */
  function getUsers(){ return JSON.parse(localStorage.getItem('usuarios')) || []; }
  function saveUsers(users){ localStorage.setItem('usuarios', JSON.stringify(users)); }
  function setCurrentUser(email){ localStorage.setItem('currentUser', email); }
  function getCurrentUser(){ return localStorage.getItem('currentUser') || null; }
  function logout(){ localStorage.removeItem('currentUser'); }

  /* ============================
     CONTROL DE ACCESO A PÁGINAS
     ============================ */

  /* ============================
   CONTROL DE ACCESO A PÁGINAS
   ============================ */

// Página actual (solo el nombre)
const currentPage = window.location.pathname.split('/').pop().toLowerCase();

// Páginas públicas (visibles sin iniciar sesión)
const publicPages = ['index.html', 'login.html', 'registro.html', ''];

// Función para obtener usuario actual
const currentUser = getCurrentUser();

(function enforceAccess() {
  if (!currentUser) {
    // Usuario NO logueado
    if (currentPage !== 'index.html' && currentPage !== '' && currentPage !== 'login.html' && currentPage !== 'registro.html') {
      // Si intenta entrar a páginas privadas sin login → enviarlo a login
      showAlert('Por favor inicia sesión para continuar.', 'warning', 1200);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
    }
  } else {
    // Usuario logueado
    if (['login.html', 'registro.html'].includes(currentPage)) {
      // Si ya está logueado, no debe volver al login/registro → redirigir al home
      setTimeout(() => {
        if (window.location.pathname.split('/').pop().toLowerCase() !== 'home.html') {
          window.location.href = 'home.html';
        }
      }, 400);
    }
  }
})();


  /* ---------- Mostrar / ocultar botones de navegación según sesión ---------- */
  function updateNavButtons(){
    const currentUser = getCurrentUser();
    // buscadores comunes de enlaces/buttons
    const loginLinks = qsa('a[href="login.html"], button[data-href="login.html"]');
    const registroLinks = qsa('a[href="registro.html"], button[data-href="registro.html"]');
    const cerrarBtns = qsa('#cerrarSesion, #cerrarSesionBtn');

    if(currentUser){
      // ocultar login/registro
      loginLinks.forEach(el => el.style.display = 'none');
      registroLinks.forEach(el => el.style.display = 'none');
      // mostrar cerrar sesión
      cerrarBtns.forEach(el => el.style.display = 'inline-block');
    } else {
      // mostrar login/registro
      loginLinks.forEach(el => el.style.display = 'inline-block');
      registroLinks.forEach(el => el.style.display = 'inline-block');
      // ocultar cerrar sesión
      cerrarBtns.forEach(el => el.style.display = 'none');
    }
  }

  // ejecutar al cargar DOM
  document.addEventListener('DOMContentLoaded', () => {
    updateNavButtons();
    // renderResenas se engancha más abajo; si no existe en esta página no hay problema
  });

  /* ---------- REGISTRO ---------- */
  const registerForm = qs('#registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = qs('#nombre')?.value?.trim();
      const email = qs('#email')?.value?.trim().toLowerCase();
      const telefono = qs('#telefono')?.value?.trim();
      const edad = parseInt(qs('#edad')?.value || 0, 10);
      const password = qs('#password')?.value;

      if(!nombre || !email || !telefono || !edad || !password){
        showAlert('Completa todos los campos.', 'warning');
        return;
      }
      if(!/\S+@\S+\.\S+/.test(email)){
        showAlert('Correo inválido.', 'warning'); return;
      }
      if(edad < 18){
        showAlert('Debes ser mayor de 18 años.', 'warning'); return;
      }
      const users = getUsers();
      if(users.some(u => u.email === email)){
        showAlert('Ya existe una cuenta con ese correo.', 'danger'); return;
      }
      users.push({ nombre, email, telefono, edad, password });
      saveUsers(users);
      setCurrentUser(email);

      // actualizamos UI y redirigimos al home
      updateNavButtons();
      showAlert('¡Registro exitoso! Bienvenido(a) ' + nombre, 'success');
      setTimeout(()=> window.location.href = 'home.html', 900);
    });
  }

  /* ---------- LOGIN ---------- */
  const loginForm = qs('#loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#email')?.value?.trim().toLowerCase();
      const password = qs('#password')?.value;
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if(!user){
        showAlert('Credenciales incorrectas.', 'danger'); return;
      }
      setCurrentUser(user.email);

      // actualizar botones y redirigir
      updateNavButtons();
      showAlert('Bienvenido(a) ' + user.nombre, 'success');
      setTimeout(()=> window.location.href = 'home.html', 700);
    });
  }

  /* ---------- CERRAR SESIÓN ---------- */
  // Nos aseguramos de enganchar todos los posibles botones/enlaces que definiste
  const cerrarSesionLinks = qsa('#cerrarSesion, #cerrarSesionBtn');
  cerrarSesionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      updateNavButtons();
      showAlert('Sesión cerrada. Redirigiendo al inicio...', 'info', 1000);
      setTimeout(()=> window.location.href = 'index.html', 600);
    });
  });

  /* ---------- Mostrar lista de usuarios (admin view) ---------- */
  const listaUsuariosEl = qs('#listaUsuarios');
  if(listaUsuariosEl){
    const users = getUsers();
    if(users.length === 0) listaUsuariosEl.innerHTML = '<p class="text-muted">No hay usuarios registrados.</p>';
    else {
      listaUsuariosEl.innerHTML = '';
      users.forEach(u=>{
        const div = document.createElement('div');
        div.className = 'usuario';
        div.innerHTML = `<h5>${u.nombre}</h5>
                         <p class="mb-0"><small class="text-muted">Email:</small> ${u.email}</p>
                         <p class="mb-0"><small class="text-muted">Tel:</small> ${u.telefono} • <small class="text-muted">Edad:</small> ${u.edad}</p>`;
        listaUsuariosEl.appendChild(div);
      });
    }
  }

  /* ---------- RESEÑAS ---------- */
  function getResenas(){ return JSON.parse(localStorage.getItem('resenas')) || []; }
  function saveResenas(r){ localStorage.setItem('resenas', JSON.stringify(r)); }

  const formResena = qs('#formResena');
  const listaResenas = qs('#listaResenas');

  if(!localStorage.getItem('resenas')){
    const ejemplo = [{
      nombreTrago: 'Sunset Bliss',
      descripcion: 'Cóctel tropical con un toque cítrico — dulce y refrescante.',
      foto: 'images/bebida1.jpg',
      autor: 'Claudia',
      fecha: new Date().toLocaleString(),
      comentarios: []
    }];
    saveResenas(ejemplo);
  }

  function renderResenas(){
    if(!listaResenas) return;
    listaResenas.innerHTML = '';
    const res = getResenas().slice().reverse();
    res.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'resena row align-items-center p-3 mb-3';
      card.innerHTML = `
        <div class="col-md-4">
          <img src="${r.foto}" alt="${r.nombreTrago}" class="resena-img shadow-sm img-fluid rounded">
        </div>
        <div class="col-md-8">
          <h4 class="mb-1">${r.nombreTrago}</h4>
          <div class="meta">por <strong>${r.autor}</strong> · ${r.fecha}</div>
          <p>${r.descripcion}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary btn-comentar" data-index="${getResenas().length - 1 - idx}">Comentar</button>
          </div>
          <div class="comentarios mt-2">
            ${(r.comentarios || []).map(c => `<p class="mb-1"><strong>${c.autor}:</strong> ${c.texto}</p>`).join('')}
          </div>
        </div>
      `;
      listaResenas.appendChild(card);
    });

    /* evento comentar */
    qsa('.btn-comentar').forEach(b => {
      b.addEventListener('click', e => {
        const i = parseInt(e.target.dataset.index, 10);
        const arr = getResenas();
        const currentEmail = getCurrentUser();
        if(!currentEmail){
          showAlert('Debes iniciar sesión para comentar.', 'warning');
          return;
        }
        const users = getUsers();
        const autor = (users.find(u=>u.email===currentEmail) || {}).nombre || 'Usuario';
        const texto = prompt('Escribe tu comentario:');
        if(texto && texto.trim()){
          arr[i].comentarios = arr[i].comentarios || [];
          arr[i].comentarios.push({ autor, texto, fecha: new Date().toLocaleString() });
          saveResenas(arr);
          renderResenas();
          showAlert('Comentario agregado', 'success');
        }
      });
    });
  }
  // renderResenas se llama en DOMContentLoaded (más abajo)
  

  /* manejo del formulario de reseña */
  if(formResena){
    formResena.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentEmail = getCurrentUser();
      if(!currentEmail){
        showAlert('Debes iniciar sesión para publicar una reseña.', 'warning');
        setTimeout(()=> window.location.href = 'login.html', 900);
        return;
      }
      const users = getUsers();
      const autor = (users.find(u=>u.email===currentEmail) || {}).nombre || 'Usuario';

      const nombreTrago = qs('#nombreTrago')?.value?.trim();
      const descripcion = qs('#descripcion')?.value?.trim();
      const fotoInput = qs('#fotoTrago');

      if(!nombreTrago || !descripcion){
        showAlert('Completa el nombre y la descripción.', 'warning'); return;
      }

      function pushResena(fotoData){
        const r = getResenas();
        r.push({
          nombreTrago,
          descripcion,
          foto: fotoData,
          autor,
          fecha: new Date().toLocaleString(),
          comentarios: []
        });
        saveResenas(r);
        renderResenas();
        showAlert('Reseña publicada', 'success');
        formResena.reset();
      }

      if(fotoInput && fotoInput.files && fotoInput.files[0]){
        const reader = new FileReader();
        reader.onload = () => pushResena(reader.result);
        reader.readAsDataURL(fotoInput.files[0]);
      } else {
        pushResena('images/tragos.jpg');
      }
    });
  }

  /* Mostrar bienvenida */
  const welcomeEl = qs('#welcomeUser');
  if(welcomeEl){
    const cur = getCurrentUser();
    if(cur){
      const users = getUsers();
      const u = users.find(x => x.email === cur);
      welcomeEl.innerHTML = `<div class="alert alert-success">Bienvenido(a), <strong>${u?.nombre || 'Usuario'}</strong> — disfruta compartiendo tus creaciones.</div>`;
    } else {
      welcomeEl.innerHTML = `<div class="alert alert-info">Bienvenido(a). <a href="login.html">Inicia sesión</a> o <a href="registro.html">Regístrate</a> para comentar.</div>`;
    }
  }

  /* contacto */
  const contactForm = qs('#contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nombre = qs('#nombre')?.value?.trim();
      const email = qs('#email')?.value?.trim();
      const mensaje = qs('#mensaje')?.value?.trim();
      if(!nombre || !email || !mensaje){
        showAlert('Completa todos los campos del contacto.', 'warning'); return;
      }
      const msgs = JSON.parse(localStorage.getItem('mensajesContacto') || '[]');
      msgs.push({nombre,email,mensaje, fecha: new Date().toLocaleString()});
      localStorage.setItem('mensajesContacto', JSON.stringify(msgs));
      showAlert('Gracias por tu mensaje, te responderemos pronto.', 'success');
      contactForm.reset();
    });
  }

  // Finalmente, cuando el DOM esté listo, llamamos renderResenas (si aplica)
  document.addEventListener('DOMContentLoaded', () => {
    renderResenas();
  });

})(); // fin del IIFE

/* ============================= */
/* 🍸 BEBIDA DEL DÍA (Portada) */
/* ============================= */
const bebidaDiaDiv = document.getElementById('bebidaDia');

if (bebidaDiaDiv) {
  async function cargarBebidaDelDia() {
    try {
      const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
      const data = await res.json();
      const bebida = data.drinks[0];

      bebidaDiaDiv.innerHTML = `
        <h3>${bebida.strDrink}</h3>
        <img src="${bebida.strDrinkThumb}" alt="${bebida.strDrink}" class="img-fluid bebida-img mt-2">
        <p class="mt-3"><strong>Instrucciones:</strong> ${bebida.strInstructions}</p>
      `;
    } catch (error) {
      bebidaDiaDiv.innerHTML = `
        <h3>Cold Brew de Avellana</h3>
        <img src="images/coldbrew.jpg" alt="Cold Brew de Avellana" class="img-fluid bebida-img mt-2">
        <p class="mt-3"><strong>Instrucciones:</strong> Mezcla café frío, leche de avena y jarabe de avellana. Sirve con hielo.</p>
      `;
    }
  }

  cargarBebidaDelDia();
}

/* ============================= */
/* ☀️🌙 Cambio de Tema */
/* ============================= */
const btnDia = document.getElementById('btnDia');
const btnNoche = document.getElementById('btnNoche');

function applyStoredThemeFinal(){
  const theme = localStorage.getItem('theme') || 'dark';
  if(theme === 'light') document.body.classList.remove('dark-mode');
  else document.body.classList.add('dark-mode');
  updateBtnActive(theme);
}
applyStoredThemeFinal();

function setTheme(theme){
  if(theme === 'light') document.body.classList.remove('dark-mode');
  else document.body.classList.add('dark-mode');
  localStorage.setItem('theme', theme);
  updateBtnActive(theme);
}

function updateBtnActive(theme){
  if(btnDia) btnDia.classList.toggle('active', theme === 'light');
  if(btnNoche) btnNoche.classList.toggle('active', theme === 'dark');
}

if(btnDia) btnDia.addEventListener('click', ()=> setTheme('light'));
if(btnNoche) btnNoche.addEventListener('click', ()=> setTheme('dark'));

/* ============================= */
/* ☀️🌙 Cambio de Tema (Día / Noche) */
/* ============================= */

//* ============================= */
/* ☀️🌙 Cambio de Tema (Día / Noche) global */
/* ============================= */
document.addEventListener('DOMContentLoaded', () => {
  const btnDia = document.getElementById('btnDia');
  const btnNoche = document.getElementById('btnNoche');

  // Función para aplicar tema guardado
  function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);

    // Actualizar botones activos
    if (btnDia) btnDia.classList.toggle('active', theme === 'light');
    if (btnNoche) btnNoche.classList.toggle('active', theme === 'dark');
  }

  // Cargar tema guardado al iniciar
  const storedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(storedTheme);

  // Eventos de los botones
  if (btnDia) btnDia.addEventListener('click', () => applyTheme('light'));
  if (btnNoche) btnNoche.addEventListener('click', () => applyTheme('dark'));
});
