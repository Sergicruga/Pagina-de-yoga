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
    premium: true,
    previewEnabled: true,
    previewDuration: "4 min",
    fileName: "premium-video.mp4"
  }
];

const seedUsers = [
  { email: "alumna@demo.com", role: "user", premium: false },
  { email: "premium@demo.com", role: "user", premium: true },
  { email: "profesora@demo.com", role: "teacher", premium: true }
];

const state = loadState();

const views = [...document.querySelectorAll("[data-view]")];
const navLinks = [...document.querySelectorAll(".main-nav a")];
const authDialog = document.querySelector("#authDialog");
const authForm = document.querySelector("#authForm");
const closeAuthButton = document.querySelector("#closeAuthButton");
const loginButton = document.querySelector("#loginButton");
const dashboardButton = document.querySelector("#dashboardButton");
const logoutButton = document.querySelector("#logoutButton");
const contentGrid = document.querySelector("#contentGrid");
const dashboardGrid = document.querySelector("#dashboardGrid");
const typeFilter = document.querySelector("#typeFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const contentForm = document.querySelector("#contentForm");
const adminRows = document.querySelector("#adminContentRows");
const userRows = document.querySelector("#userRows");
const toast = document.querySelector("#toast");

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    return normalizeState(JSON.parse(saved));
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
      previewEnabled: item.previewEnabled ?? (item.premium && ["item-3", "item-4"].includes(item.id)),
      previewDuration: item.previewDuration ?? (item.id === "item-4" ? "4 min" : "2 min")
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
  return !item.premium || user?.premium || user?.role === "teacher";
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
  const locked = !canOpen(item);
  const hasPreview = locked && item.previewEnabled;
  const typeLabel = item.type === "video" ? "Video" : "Audio";
  const symbol = item.type === "video" ? "play" : "audio";
  const actionText = locked
    ? hasPreview
      ? `Ver trailer ${item.previewDuration || ""}`.trim()
      : "Necesitas premium"
    : "Abrir contenido";
  const actionAttribute = hasPreview ? `data-preview-item="${item.id}"` : `data-open-item="${item.id}"`;

  return `
    <article class="content-card ${locked ? "locked" : ""}">
      <div class="media-thumb">${symbol}</div>
      <div class="card-meta">
        <span class="chip">${typeLabel}</span>
        <span class="chip">${item.category}</span>
        <span class="chip">${item.level}</span>
        <span class="chip ${item.premium ? "premium" : ""}">${item.premium ? "Premium" : "Gratis"}</span>
        ${item.premium && item.previewEnabled ? `<span class="chip preview">Trailer ${escapeHtml(item.previewDuration || "demo")}</span>` : ""}
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${hasPreview ? `<p class="preview-note">Puedes ver una muestra antes de hacerte premium.</p>` : ""}
      <p><strong>${escapeHtml(item.duration)}</strong> - ${escapeHtml(item.fileName || "archivo-demo")}</p>
      <button class="${locked ? "secondary-button" : "primary-button"}" type="button" ${actionAttribute}>
        ${escapeHtml(actionText)}
      </button>
    </article>
  `;
}

function renderDashboard() {
  const user = currentUser();
  document.querySelector("#welcomeTitle").textContent = `Hola, ${user.email}`;
  document.querySelector("#sessionRole").textContent = user.role === "teacher" ? "Profesora" : "Alumna";
  document.querySelector("#premiumStatus").textContent = user.premium ? "Premium activo" : "Plan gratis";
  document.querySelector("#premiumStatus").classList.toggle("premium", user.premium);
  document.querySelector("#profileText").textContent = `Email: ${user.email}. Acceso: ${user.premium ? "premium" : "gratis"}.`;

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

function login(email, role, premium) {
  let user = state.users.find((entry) => entry.email === email);
  if (!user) {
    user = { email, role, premium };
    state.users.push(user);
  } else {
    user.role = role;
    user.premium = premium || user.premium || role === "teacher";
  }
  state.session = { email };
  saveState();
  updateHeader();
  showView("dashboard");
  window.location.hash = "dashboard";
}

function updateHeader() {
  const user = currentUser();
  loginButton.textContent = user ? user.email : "Entrar";
  dashboardButton.textContent = user ? "Mi espacio" : "Crear acceso";
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

loginButton.addEventListener("click", () => authDialog.showModal());
closeAuthButton.addEventListener("click", () => authDialog.close());
dashboardButton.addEventListener("click", () => {
  if (!state.session) {
    authDialog.showModal();
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
  const email = document.querySelector("#emailInput").value.trim() || "alumna@demo.com";
  const role = document.querySelector("#roleInput").value;
  const premium = document.querySelector("#premiumInput").checked || role === "teacher";
  authDialog.close();
  login(email, role, premium);
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
