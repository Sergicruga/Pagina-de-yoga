const storageKey = "luma-yoga-prototype";

const seedItems = [
  {
    id: "item-1",
    title: "Yoga suave de manana",
    description: "Una practica corta para despertar el cuerpo con calma.",
    type: "video",
    category: "Yoga",
    level: "Principiante",
    duration: "22 min",
    price: 0,
    premium: false,
    previewEnabled: false,
    previewDuration: "",
    fileName: "demo-video.mp4"
  },
  {
    id: "item-2",
    title: "Meditacion para dormir",
    description: "Audio guiado para cerrar el dia y soltar tension.",
    type: "audio",
    category: "Meditacion",
    level: "Principiante",
    duration: "14 min",
    price: 0,
    premium: false,
    previewEnabled: false,
    previewDuration: "",
    fileName: "demo-audio.mp3"
  },
  {
    id: "item-3",
    title: "Respiracion profunda",
    description: "Ejercicio premium para regular energia y enfoque.",
    type: "audio",
    category: "Respiracion",
    level: "Intermedio",
    duration: "11 min",
    price: 4,
    premium: true,
    previewEnabled: true,
    previewDuration: "2 min",
    fileName: "premium-audio.mp3"
  },
  {
    id: "item-4",
    title: "Flow de caderas",
    description: "Clase premium de movilidad, apertura y estabilidad.",
    type: "video",
    category: "Yoga",
    level: "Intermedio",
    duration: "38 min",
    price: 9,
    premium: true,
    previewEnabled: true,
    previewDuration: "4 min",
    fileName: "premium-video.mp4"
  }
];

const seedUsers = [
  { email: "alumna@demo.com", role: "user", premium: false, purchases: [] },
  { email: "premium@demo.com", role: "user", premium: true, purchases: [] },
  { email: "profesora@demo.com", role: "teacher", premium: true, purchases: [] }
];

const state = loadState();

const views = [...document.querySelectorAll("[data-view]")];
const navLinks = [...document.querySelectorAll(".main-nav a")];
const authDialog = document.querySelector("#authDialog");
const authForm = document.querySelector("#authForm");
const closeAuthButton = document.querySelector("#closeAuthButton");
const loginButton = document.querySelector("#loginButton");
const registerButton = document.querySelector("#registerButton");
const logoutButton = document.querySelector("#logoutButton");
const contentGrid = document.querySelector("#contentGrid");
const dashboardGrid = document.querySelector("#dashboardGrid");
const typeFilter = document.querySelector("#typeFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const contentForm = document.querySelector("#contentForm");
const adminRows = document.querySelector("#adminContentRows");
const userRows = document.querySelector("#userRows");
const toast = document.querySelector("#toast");
let authMode = "login";

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const parsed = normalizeState(JSON.parse(saved));
    return { ...parsed, session: null };
  }

  return normalizeState({
    session: null,
    items: seedItems,
    users: seedUsers
  });
}

function normalizeState(savedState) {
  return {
    ...savedState,
    items: savedState.items.map((item) => ({
      ...item,
      price: item.price ?? (item.premium ? 6 : 0),
      previewEnabled: item.previewEnabled ?? (item.premium && ["item-3", "item-4"].includes(item.id)),
      previewDuration: item.previewDuration ?? (item.id === "item-4" ? "4 min" : "2 min")
    })),
    users: savedState.users.map((user) => ({
      ...user,
      purchases: user.purchases || []
    }))
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function currentUser() {
  if (!state.session) return null;
  return state.users.find((user) => user.email === state.session.email) || null;
}

function isTeacher() {
  return currentUser()?.role === "teacher";
}

function canOpen(item) {
  const user = currentUser();
  return !item.premium || user?.premium || user?.role === "teacher" || user?.purchases?.includes(item.id);
}

function showView(route) {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== route;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });

  if (route === "dashboard") {
    if (!state.session) {
      authDialog.showModal();
      showView("inicio");
      return;
    }
    renderDashboard();
  }

  if (route === "contenido") {
    renderPublicContent();
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function routeFromHash() {
  const route = window.location.hash.replace("#", "") || "inicio";
  showView(route);
}

function renderPublicContent() {
  const type = typeFilter.value;
  const category = categoryFilter.value;
  const items = state.items.filter((item) => {
    const typeOk = type === "all" || item.type === type;
    const categoryOk = category === "all" || item.category === category;
    return typeOk && categoryOk;
  });

  contentGrid.innerHTML = items.map(contentCard).join("");
}

function contentCard(item) {
  const user = currentUser();
  const locked = !canOpen(item);
  const hasPreview = locked && item.previewEnabled;
  const canBuySingle = locked && item.premium && item.price > 0;
  const typeLabel = item.type === "video" ? "Video" : "Audio";
  const symbol = item.type === "video" ? "play" : "audio";
  const boughtSingle = Boolean(user?.purchases?.includes(item.id));
  const accessText = locked ? "Premium" : item.premium ? boughtSingle ? "Comprado" : "Premium incluido" : "Gratis";

  return `
    <article class="content-card ${locked ? "locked" : ""}">
      <div class="media-thumb">${symbol}</div>
      <div class="card-meta">
        <span class="chip">${typeLabel}</span>
        <span class="chip">${item.category}</span>
        <span class="chip">${item.level}</span>
        <span class="chip ${item.premium ? "premium" : ""}">${accessText}</span>
        ${item.premium && item.previewEnabled ? `<span class="chip preview">Trailer ${escapeHtml(item.previewDuration || "demo")}</span>` : ""}
        ${item.premium && item.price > 0 ? `<span class="chip price">${escapeHtml(formatPrice(item.price))}</span>` : ""}
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${locked ? `<p class="preview-note">Puedes comprar este contenido suelto o activar la suscripcion completa.</p>` : ""}
      <p><strong>${escapeHtml(item.duration)}</strong> - ${escapeHtml(item.fileName || "archivo-demo")}</p>
      <div class="card-actions">
        ${!locked ? `<button class="primary-button" type="button" data-open-item="${item.id}">Abrir contenido</button>` : ""}
        ${hasPreview ? `<button class="secondary-button" type="button" data-preview-item="${item.id}">Ver trailer ${escapeHtml(item.previewDuration || "")}</button>` : ""}
        ${canBuySingle ? `<button class="primary-button" type="button" data-buy-item="${item.id}">Comprar ${escapeHtml(formatPrice(item.price))}</button>` : ""}
        ${locked ? `<button class="secondary-button" type="button" data-subscribe>Suscribirme</button>` : ""}
      </div>
    </article>
  `;
}

function renderDashboard() {
  const user = currentUser();
  document.querySelector("#welcomeTitle").textContent = `Hola, ${user.email}`;
  document.querySelector("#sessionRole").textContent = user.role === "teacher" ? "Profesora" : "Alumna";
  document.querySelector("#premiumStatus").textContent = user.premium ? "Premium activo" : "Plan gratis";
  document.querySelector("#premiumStatus").classList.toggle("premium", user.premium);
  const purchasedCount = user.purchases?.length || 0;
  document.querySelector("#profileText").textContent = `Email: ${user.email}. Acceso: ${user.premium ? "suscripcion premium" : "plan gratis"}. Compras individuales: ${purchasedCount}.`;

  document.querySelectorAll(".admin-only").forEach((element) => {
    element.hidden = !isTeacher();
  });

  dashboardGrid.innerHTML = state.items.map(contentCard).join("");
  renderAdminRows();
  renderUserRows();
}

function renderAdminRows() {
  adminRows.innerHTML = state.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.title)}</td>
      <td>${item.type === "video" ? "Video" : "Audio"}</td>
      <td>${item.premium ? "Premium" : "Gratis"}</td>
      <td>${item.premium && item.price > 0 ? escapeHtml(formatPrice(item.price)) : "-"}</td>
      <td>${item.previewEnabled ? escapeHtml(item.previewDuration || "Si") : "No"}</td>
      <td><button class="secondary-button" type="button" data-delete-item="${item.id}">Eliminar</button></td>
    </tr>
  `).join("");
}

function renderUserRows() {
  userRows.innerHTML = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.email)}</td>
      <td>${user.role === "teacher" ? "Profesora" : "Alumna"}</td>
      <td>${user.premium ? "Si" : "No"}</td>
      <td><button class="secondary-button" type="button" data-toggle-user="${user.email}">${user.premium ? "Quitar" : "Dar"} premium</button></td>
    </tr>
  `).join("");
}

function showPanel(panelName) {
  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.hidden = panel.id !== `panel-${panelName}`;
  });
  document.querySelectorAll(".side-link[data-panel]").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });
}

function login(email) {
  let user = state.users.find((entry) => entry.email === email);
  if (!user) {
    user = {
      email,
      role: "user",
      premium: false,
      purchases: [],
      name: document.querySelector("#nameInput").value.trim()
    };
    state.users.push(user);
  } else {
    user.role = user.role || "user";
    user.premium = Boolean(user.premium || user.role === "teacher");
    user.purchases = user.purchases || [];
  }
  state.session = { email };
  saveState();
  updateHeader();
  showView("dashboard");
  window.location.hash = "dashboard";
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} EUR`;
}

function updateHeader() {
  const user = currentUser();
  loginButton.textContent = user ? user.email : "Iniciar sesion";
  registerButton.textContent = user ? "Mi espacio" : "Registrarse";
}

function openAuthDialog(mode) {
  authMode = mode;
  const isRegister = mode === "register";
  document.querySelector("#authEyebrow").textContent = isRegister ? "Crear cuenta" : "Acceso demo";
  document.querySelector("#authTitle").textContent = isRegister ? "Registrarse" : "Iniciar sesion";
  document.querySelector("#authHelper").textContent = isRegister
    ? "Crea una cuenta gratuita y entra directamente a tu espacio privado."
    : "Entra con tu email para acceder a tu espacio privado.";
  document.querySelector("#authNote").textContent = isRegister
    ? "Las nuevas cuentas se crean como alumnas. El acceso premium lo activa la profesora."
    : "Demo: usa profesora@demo.com para entrar como profesora.";
  document.querySelector("#authSubmitButton").textContent = isRegister ? "Crear cuenta" : "Entrar";
  document.querySelectorAll(".register-only").forEach((element) => {
    element.hidden = !isRegister;
  });
  document.querySelector("#emailInput").value = isRegister ? "" : "alumna@demo.com";
  authDialog.showModal();
}

function notify(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.body.addEventListener("click", (event) => {
  const authButton = event.target.closest("[data-auth-mode]");
  if (authButton) {
    openAuthDialog(authButton.dataset.authMode);
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    window.location.hash = routeButton.dataset.route;
  }

  const panelButton = event.target.closest("[data-panel]");
  if (panelButton) {
    if (panelButton.classList.contains("admin-only") && !isTeacher()) {
      notify("Solo la profesora puede abrir este panel.");
      return;
    }
    showPanel(panelButton.dataset.panel);
  }

  const openButton = event.target.closest("[data-open-item]");
  if (openButton) {
    const item = state.items.find((entry) => entry.id === openButton.dataset.openItem);
    notify(canOpen(item) ? `Abriendo: ${item.title}` : "Este contenido es premium.");
  }

  const previewButton = event.target.closest("[data-preview-item]");
  if (previewButton) {
    const item = state.items.find((entry) => entry.id === previewButton.dataset.previewItem);
    notify(`Reproduciendo trailer de ${item.title}. Despues se invita a activar premium.`);
  }

  const buyButton = event.target.closest("[data-buy-item]");
  if (buyButton) {
    const item = state.items.find((entry) => entry.id === buyButton.dataset.buyItem);
    if (!state.session) {
      openAuthDialog("login");
      notify("Inicia sesion para comprar este contenido.");
      return;
    }
    const user = currentUser();
    user.purchases = user.purchases || [];
    if (!user.purchases.includes(item.id)) {
      user.purchases.push(item.id);
    }
    saveState();
    renderDashboard();
    renderPublicContent();
    notify(`Compra simulada: ${item.title} queda desbloqueado para tu cuenta.`);
  }

  const subscribeButton = event.target.closest("[data-subscribe]");
  if (subscribeButton) {
    if (!state.session) {
      openAuthDialog("login");
      notify("Inicia sesion para activar la suscripcion.");
      return;
    }
    const user = currentUser();
    user.premium = true;
    saveState();
    renderDashboard();
    renderPublicContent();
    notify("Suscripcion simulada activada. Ya puedes ver todo el contenido premium.");
  }

  const deleteButton = event.target.closest("[data-delete-item]");
  if (deleteButton) {
    const index = state.items.findIndex((entry) => entry.id === deleteButton.dataset.deleteItem);
    state.items.splice(index, 1);
    saveState();
    renderDashboard();
    renderPublicContent();
  }

  const toggleUser = event.target.closest("[data-toggle-user]");
  if (toggleUser) {
    const user = state.users.find((entry) => entry.email === toggleUser.dataset.toggleUser);
    user.premium = !user.premium;
    saveState();
    renderDashboard();
  }
});

loginButton.addEventListener("click", () => {
  if (state.session) {
    window.location.hash = "dashboard";
    return;
  }
  openAuthDialog("login");
});
closeAuthButton.addEventListener("click", () => authDialog.close());
registerButton.addEventListener("click", () => {
  if (!state.session) {
    openAuthDialog("register");
    return;
  }
  window.location.hash = "dashboard";
});

logoutButton.addEventListener("click", () => {
  state.session = null;
  saveState();
  updateHeader();
  showPanel("library");
  renderPublicContent();
  history.replaceState(null, "", "#inicio");
  showView("inicio");
  notify("Sesion cerrada.");
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#emailInput").value.trim() || (authMode === "register" ? "nueva@demo.com" : "alumna@demo.com");
  authDialog.close();
  login(email);
});

contentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fileInput = document.querySelector("#itemFile");
  const item = {
    id: `item-${Date.now()}`,
    title: document.querySelector("#itemTitle").value,
    description: document.querySelector("#itemDescription").value,
    type: document.querySelector("#itemType").value,
    category: document.querySelector("#itemCategory").value,
    level: document.querySelector("#itemLevel").value,
    duration: document.querySelector("#itemDuration").value || "Sin duracion",
    price: Number(document.querySelector("#itemPrice").value || 0),
    premium: document.querySelector("#itemPremium").checked,
    previewEnabled: document.querySelector("#itemPreview").checked,
    previewDuration: document.querySelector("#itemPreviewDuration").value || "2 min",
    fileName: fileInput.files[0]?.name || "archivo-local-demo"
  };

  state.items.unshift(item);
  saveState();
  contentForm.reset();
  renderDashboard();
  renderPublicContent();
  notify("Contenido guardado en la demo.");
});

typeFilter.addEventListener("change", renderPublicContent);
categoryFilter.addEventListener("change", renderPublicContent);

document.querySelector("#togglePremiumSelf").addEventListener("click", () => {
  const user = currentUser();
  user.premium = !user.premium;
  saveState();
  renderDashboard();
});

window.addEventListener("hashchange", routeFromHash);

updateHeader();
renderPublicContent();
routeFromHash();
