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

  // event listeners for menu toggle
  const hambBtn = document.getElementById("hambBtn");
  hambBtn.addEventListener("click", toggleMenu);
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

function promptAgregarJugador() {
  const nombre = prompt("Nombre del jugador:");
  if (nombre) {
    jugadores.push(nombre);
    renderJugadores();
  }
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
  actualizarBadge();

  // 👉 Abrir el carrito automáticamente
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("overlay");

  panel.classList.add("abierto");
  overlay.classList.add("activo");
}

function renderCarrito() {
  carritoList.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;

    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${item.img}" width="60" alt="${item.nombre}">
        <div>
          <strong>${item.nombre}</strong>
          <div style="font-size:13px; color:#666;">$${item.precio} c/u</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
        <span>${item.cantidad}</span>
        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
        <button style="background:transparent; border:none; color:red; font-size:18px;" onclick="eliminarProducto(${index})">❌</button>
      </div>
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

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  guardarDatos();
  renderCarrito();
  actualizarBadge();
}

function actualizarBadge() {
  badge.textContent = carrito.reduce((s, p) => s + (p.cantidad || 0), 0);
}

/*************************************************
 * CHECKOUT Y FACTURA
 *************************************************/
function abrirCheckout() {
  if (!usuarioActivo) return alert("Debes iniciar sesión");
  document.getElementById("checkout").hidden = false;

  // Autofill usuario nombre if available
  const nombreInput = document.getElementById("nombreCliente");
  if (usuarioActivo && !nombreInput.value) nombreInput.value = usuarioActivo;
}

function cerrarCheckout() {
  document.getElementById("checkout").hidden = true;
}

function confirmarCompra() {
  if (carrito.length === 0) return alert("Carrito vacío");

  const nombre = document.getElementById("nombreCliente").value || usuarioActivo || "Invitado";
  const email  = document.getElementById("emailCliente").value || "";
  const direccion = document.getElementById("direccionCliente").value || "";
  const metodo = document.getElementById("metodoPago").value || "No indicado";

  const compra = {
    usuario: usuarioActivo || nombre,
    fecha: new Date().toLocaleString(),
    productos: carrito.map(p => ({ id: p.id, nombre: p.nombre, cantidad: p.cantidad, precio: p.precio })),
    total: carrito.reduce((s, p) => s + p.precio * p.cantidad, 0),
    direccion, email, metodo
  };

  historial.unshift(compra);
  guardarDatos();
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
    detalleFactura.innerHTML += `<li>${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toFixed(2)}</li>`;
  });
  totalFactura.textContent = compra.total.toFixed(2);
  facturaModal.hidden = false;
}

function cerrarFactura() {
  if (facturaModal) facturaModal.hidden = true;
}

/*************************************************
 * HISTORIAL
 *************************************************/
function renderHistorial() {
  historialList.innerHTML = "";
  if (historial.length === 0) {
    historialList.innerHTML = "<li>No hay compras todavía.</li>";
    return;
  }
  historial.forEach(h => {
    historialList.innerHTML += `
      <li>
        <strong>${h.fecha}</strong> – ${h.usuario} – $${h.total.toFixed(2)}
        <details>
          <summary>Ver detalle</summary>
          <ul>
            ${h.productos.map(p => `<li>${p.nombre} x${p.cantidad} — $${(p.precio * p.cantidad).toFixed(2)}</li>`).join("")}
          </ul>
        </details>
      </li>
    `;
  });
}

/*************************************************
 * LOGIN / REGISTRO
 *************************************************/
function login() {
  const user = document.getElementById("loginUsuario").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();
  const msg  = document.getElementById("loginMsg");

  const encontrado = usuarios.find(u => u.user === user && u.pass === pass);
  if (!encontrado) {
    msg.textContent = "❌ Usuario o contraseña incorrectos";
    setTimeout(()=> msg.textContent = "", 4000);
    return;
  }

  localStorage.setItem("usuarioActivo", user);
  usuarioActivo = user;
  cargarSesion();
}

function registrar() {
  const user = document.getElementById("regUsuario").value.trim();
  const pass = document.getElementById("regPassword").value.trim();
  const msg  = document.getElementById("registroMsg");

  if (!user || !pass) {
    msg.textContent = "⚠️ Completa todos los campos";
    setTimeout(()=> msg.textContent = "", 3000);
    return;
  }

  if (usuarios.some(u => u.user === user)) {
    msg.textContent = "❌ Usuario ya existe";
    setTimeout(()=> msg.textContent = "", 3000);
    return;
  }

  usuarios.push({ user, pass });
  guardarDatos();
  msg.textContent = "✅ Registro exitoso";
  setTimeout(()=> msg.textContent = "", 3000);
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
  usuarioActivo = null;
  location.reload();
}

/*************************************************
 * MENÚ HAMBURGUESA
 *************************************************/
function toggleMenu() {
  const menu = document.getElementById("menuLateral");
  const overlay = document.getElementById("overlay");

  menu.classList.toggle("abierto");
  overlay.classList.toggle("activo");
  document.getElementById("hambBtn").textContent = menu.classList.contains("abierto") ? "✖" : "☰";
}

function cerrarMenu() {
  const menu = document.getElementById("menuLateral");
  const overlay = document.getElementById("overlay");
  menu.classList.remove("abierto");
  overlay.classList.remove("activo");
  document.getElementById("hambBtn").textContent = "☰";
}

/*************************************************
 * PANEL CARRITO Y OVERLAY
 *************************************************/
function togglePanel() {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("overlay");

  panel.classList.toggle("abierto");
  overlay.classList.toggle("activo");
}

function overlayClick() {
  // Si se hace click en overlay cerramos panel y menu y checkout
  const panel = document.getElementById("cartPanel");
  const menu = document.getElementById("menuLateral");
  const overlay = document.getElementById("overlay");

  panel.classList.remove("abierto");
  menu.classList.remove("abierto");
  overlay.classList.remove("activo");
  cerrarCheckout();
  cerrarFactura();
}

/*************************************************
 * UTILIDADES
 *************************************************/
function guardarDatos() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("historial", JSON.stringify(historial));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  if (usuarioActivo) localStorage.setItem("usuarioActivo", usuarioActivo);
}
