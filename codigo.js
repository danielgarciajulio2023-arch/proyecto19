/*************************************************
 * DATA GLOBAL
 *************************************************/
const productos = [
  { id: 1, nombre: "Camiseta Lakers", precio: 80,  img: "https://i.imgur.com/fWZlO7B.png" },
  { id: 2, nombre: "Camiseta Bulls",  precio: 75,  img: "https://i.imgur.com/8K6QbCk.png" },
  { id: 3, nombre: "Nike LeBron",     precio: 160, img: "https://i.imgur.com/dhKz1Vf.png" },
  { id: 4, nombre: "Jordan Retro",    precio: 180, img: "https://i.imgur.com/W5PC7Qm.png" },
  { id: 5, nombre: "Short NBA",       precio: 45,  img: "https://i.imgur.com/Qk9tG2i.png" }
];

let carrito   = JSON.parse(localStorage.getItem("carrito")) || [];
let historial = JSON.parse(localStorage.getItem("historial")) || [];

let jugadores = ["LeBron James", "Stephen Curry", "Michael Jordan", "Kobe Bryant", "Kevin Durant"];

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "admin", pass: "1234" }
];

let usuarioActivo = localStorage.getItem("usuarioActivo");

/*************************************************
 * REFERENCIAS DOM
 *************************************************/
const productosContainer = document.getElementById("productosContainer");
const carritoList   = document.getElementById("carrito");
const totalSpan     = document.getElementById("total");
const badge         = document.getElementById("countBadge");
const bienvenida    = document.getElementById("bienvenida");
const historialList = document.getElementById("historialList");

const facturaModal  = document.getElementById("facturaModal");
const detalleFactura = document.getElementById("detalleFactura");
const totalFactura   = document.getElementById("totalFactura");

/*************************************************
 * INICIALIZACIÓN
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  renderProductos();
  renderJugadores();
  renderCarrito();
  renderHistorial();
  actualizarBadge();
  cargarSesion();
});

/*************************************************
 * PRODUCTOS
 *************************************************/
function renderProductos() {
  productosContainer.innerHTML = "";

  productos.forEach(p => {
    const card = document.createElement("article");
    card.className = "producto";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h4>${p.nombre}</h4>
      <strong>$${p.precio}</strong>
      <button class="btn" onclick="agregarAlCarrito(${p.id})">Agregar</button>
    `;
    productosContainer.appendChild(card);
  });
}

/*************************************************
 * JUGADORES
 *************************************************/
function renderJugadores() {
  const contenedor = document.getElementById("listaJugadores");
  contenedor.innerHTML = "";

  jugadores.forEach(j => {
    const div = document.createElement("div");
    div.className = "player";
    div.textContent = j;
    contenedor.appendChild(div);
  });
}

/*************************************************
 * CARRITO
 *************************************************/
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const item = carrito.find(i => i.id === id);

  if (item) item.cantidad++;
  else carrito.push({ ...producto, cantidad: 1 });

  guardarDatos();
  renderCarrito();
}

function renderCarrito() {
  carritoList.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} x${item.cantidad}
      <button onclick="eliminarProducto(${index})">❌</button>
    `;
    carritoList.appendChild(li);
  });

  totalSpan.textContent = total.toFixed(2);
  actualizarBadge();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarDatos();
  renderCarrito();
}

function vaciarCarrito() {
  if (!confirm("¿Vaciar carrito?")) return;
  carrito = [];
  guardarDatos();
  renderCarrito();
}

function actualizarBadge() {
  badge.textContent = carrito.reduce((s, p) => s + p.cantidad, 0);
}

/*************************************************
 * CHECKOUT Y FACTURA
 *************************************************/
function abrirCheckout() {
  if (!usuarioActivo) return alert("Debes iniciar sesión");
  document.getElementById("checkout").style.display = "block";
}

function cerrarCheckout() {
  document.getElementById("checkout").style.display = "none";
}

function confirmarCompra() {
  if (carrito.length === 0) return alert("Carrito vacío");

  const compra = {
    usuario: usuarioActivo,
    fecha: new Date().toLocaleString(),
    productos: carrito,
    total: carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)
  };

  historial.unshift(compra);
  mostrarFactura(compra);

  carrito = [];
  guardarDatos();
  renderCarrito();
  renderHistorial();
  cerrarCheckout();
}

function mostrarFactura(compra) {
  detalleFactura.innerHTML = "";
  compra.productos.forEach(p => {
    detalleFactura.innerHTML += `<li>${p.nombre} x${p.cantidad}</li>`;
  });
  totalFactura.textContent = compra.total.toFixed(2);
  facturaModal.style.display = "flex";
}

function cerrarFactura() {
  facturaModal.style.display = "none";
}

/*************************************************
 * HISTORIAL
 *************************************************/
function renderHistorial() {
  historialList.innerHTML = "";
  historial.forEach(h => {
    historialList.innerHTML += `
      <li>${h.fecha} – ${h.usuario} – $${h.total}</li>
    `;
  });
}

/*************************************************
 * LOGIN / REGISTRO
 *************************************************/
function login() {
  const user = document.getElementById("loginUsuario").value;
  const pass = document.getElementById("loginPassword").value;
  const msg  = document.getElementById("loginMsg");

  const encontrado = usuarios.find(u => u.user === user && u.pass === pass);
  if (!encontrado) {
    msg.textContent = "❌ Usuario o contraseña incorrectos";
    return;
  }

  localStorage.setItem("usuarioActivo", user);
  usuarioActivo = user;
  cargarSesion();
}

function registrar() {
  const user = document.getElementById("regUsuario").value;
  const pass = document.getElementById("regPassword").value;
  const msg  = document.getElementById("registroMsg");

  if (!user || !pass) {
    msg.textContent = "⚠️ Completa todos los campos";
    return;
  }

  if (usuarios.some(u => u.user === user)) {
    msg.textContent = "❌ Usuario ya existe";
    return;
  }

  usuarios.push({ user, pass });
  guardarDatos();
  msg.textContent = "✅ Registro exitoso";
}

function cargarSesion() {
  if (!usuarioActivo) return;
  bienvenida.textContent = `👋 Bienvenido ${usuarioActivo}`;
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("registroSection").style.display = "none";
  document.getElementById("logoutBtn").hidden = false;
}

function logout() {
  localStorage.removeItem("usuarioActivo");
  location.reload();
}

/*************************************************
 * MENÚ HAMBURGUESA
 *************************************************/
const hambBtn = document.getElementById("hambBtn");
const menu = document.getElementById("menuLateral");
const overlay = document.getElementById("overlay");

hambBtn.addEventListener("click", toggleMenu);
overlay.addEventListener("click", cerrarMenu);

function toggleMenu() {
  menu.classList.toggle("abierto");
  overlay.classList.toggle("activo");
  hambBtn.textContent = menu.classList.contains("abierto") ? "✖" : "☰";
}

function cerrarMenu() {
  menu.classList.remove("abierto");
  overlay.classList.remove("activo");
  hambBtn.textContent = "☰";
}

/*************************************************
 * UTILIDADES
 *************************************************/
function guardarDatos() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("historial", JSON.stringify(historial));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}
