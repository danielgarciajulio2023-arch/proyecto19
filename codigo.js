/*************************************************
 * ESTADO GLOBAL
 *************************************************/
const productos = [
  { id: 1, nombre: "Camiseta Lakers", precio: 80, img: "https://i.imgur.com/fWZlO7B.png" },
  { id: 2, nombre: "Camiseta Bulls", precio: 75, img: "https://i.imgur.com/8K6QbCk.png" },
  { id: 3, nombre: "Nike LeBron", precio: 160, img: "https://i.imgur.com/dhKz1Vf.png" },
  { id: 4, nombre: "Jordan Retro", precio: 180, img: "https://i.imgur.com/W5PC7Qm.png" },
  { id: 5, nombre: "Short NBA", precio: 45, img: "https://i.imgur.com/Qk9tG2i.png" }
];

let carrito   = JSON.parse(localStorage.getItem("carrito")) || [];
let historial = JSON.parse(localStorage.getItem("historial")) || [];
let jugadores = ["LeBron James", "Curry", "Jordan", "Kobe", "Durant"];

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
  { user: "admin", pass: "1234" }
];

let usuarioActivo = localStorage.getItem("usuarioActivo");

/*************************************************
 * REFERENCIAS DOM
 *************************************************/
const productosContainer = document.getElementById("productosContainer");
const carritoList = document.getElementById("carrito");
const totalSpan = document.getElementById("total");
const countBadge = document.getElementById("countBadge");
const bienvenida = document.getElementById("bienvenida");
const historialList = document.getElementById("historialList");

const facturaModal = document.getElementById("facturaModal");
const detalleFactura = document.getElementById("detalleFactura");
const totalFactura = document.getElementById("totalFactura");

/*************************************************
 * INICIALIZACIÓN
 *************************************************/
renderProductos();
mostrarCarrito();
renderHistorial();
actualizarContador();
if (usuarioActivo) mostrarSesion(usuarioActivo);

/*************************************************
 * RENDER PRODUCTOS
 *************************************************/
function renderProductos() {
  productosContainer.innerHTML = "";
  productos.forEach(p => {
    productosContainer.innerHTML += `
      <div class="producto">
        <img src="${p.img}">
        <p>${p.nombre}</p>
        <strong>$${p.precio}</strong>
        <button onclick="agregarAlCarrito(${p.id})">Agregar</button>
      </div>
    `;
  });
}

/*************************************************
 * CARRITO
 *************************************************/
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const item = carrito.find(i => i.id === id);

  item ? item.cantidad++ : carrito.push({ ...prod, cantidad: 1 });
  guardar();
  mostrarCarrito();
}

function mostrarCarrito() {
  carritoList.innerHTML = "";
  let total = 0;

  carrito.forEach((item, i) => {
    total += item.precio * item.cantidad;
    carritoList.innerHTML += `
      <li>
        ${item.nombre} x${item.cantidad}
        <button onclick="eliminarProducto(${i})">❌</button>
      </li>
    `;
  });

  totalSpan.textContent = total.toFixed(2);
  actualizarContador();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardar();
  mostrarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardar();
  mostrarCarrito();
}

function actualizarContador() {
  countBadge.textContent = carrito.reduce((s, p) => s + p.cantidad, 0);
}

/*************************************************
 * CHECKOUT Y COMPRA
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
    total: carrito.reduce((s,p) => s + p.precio*p.cantidad, 0)
  };

  historial.unshift(compra);
  mostrarFactura(compra);

  carrito = [];
  guardar();
  mostrarCarrito();
  renderHistorial();
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
  const user = document.getEleme
const hambBtn = document.getElementById("hambBtn");
const menu = document.getElementById("menuLateral");
const overlay = document.getElementById("overlay");

hambBtn.addEventListener("click", () => {
  menu.classList.toggle("abierto");
  overlay.classList.toggle("activo");
  hambBtn.textContent = menu.classList.contains("abierto") ? "✖" : "☰";
});

// cerrar al tocar el fondo oscuro
overlay.addEventListener("click", cerrarMenu);

function cerrarMenu(){
  menu.classList.remove("abierto");
  overlay.classList.remove("activo");
  hambBtn.textContent = "☰";
}

// cerrar al hacer click en un link
menu.querySelectorAll("a").forEach(link=>{
  link.addEventListener("click", cerrarMenu);
});
