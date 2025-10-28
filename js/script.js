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

  /* registro */
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
      showAlert('¡Registro exitoso! Bienvenido(a) ' + nombre, 'success');
      setTimeout(()=> window.location.href = 'home.html', 900);
    });
  }

  /* login */
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
      showAlert('Bienvenido(a) ' + user.nombre, 'success');
      setTimeout(()=> window.location.href = 'home.html', 700);
    });
  }

  /* cerrar sesión */
  const cerrarSesionLink = qs('#cerrarSesion');
  if(cerrarSesionLink){
    cerrarSesionLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      showAlert('Sesión cerrada.', 'info');
      setTimeout(()=> window.location.href = 'index.html', 600);
    });
  }

  /* mostrar lista de usuarios */
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

  /* ---------- RESEÑAS (CRUD simple con comentarios) ---------- */
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
          <img src="${r.foto}" alt="${r.nombreTrago}" class="resena-img shadow-sm">
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
  renderResenas();

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

  const logoutBtn = qs('#logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      logout();
      showAlert('Has cerrado sesión.');
      setTimeout(()=> window.location.href = 'index.html', 700);
    });
  }

  document.addEventListener('DOMContentLoaded', renderResenas);

})();
// =============================
// 🍸 BEBIDA DEL DÍA (Portada)
// =============================
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
      // Si hay error o sin conexión, mostrar una bebida local
      bebidaDiaDiv.innerHTML = `
        <h3>Cold Brew de Avellana</h3>
        <img src="images/coldbrew.jpg" alt="Cold Brew de Avellana" class="img-fluid bebida-img mt-2">
        <p class="mt-3"><strong>Instrucciones:</strong> Mezcla café frío, leche de avena y jarabe de avellana. Sirve con hielo.</p>
      `;
    }
  }

  cargarBebidaDelDia();
}

const btnDia = document.getElementById('btnDia');
const btnNoche = document.getElementById('btnNoche');

function applyStoredTheme(){
  const theme = localStorage.getItem('theme') || 'dark';
  if(theme === 'light') document.body.classList.remove('dark-mode');
  else document.body.classList.add('dark-mode');
  updateBtnActive(theme);
}
applyStoredTheme();

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
