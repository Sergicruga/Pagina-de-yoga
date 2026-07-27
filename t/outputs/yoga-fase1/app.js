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
  { email: "alumna@demo.com", name: "Alumna/o Demo", passwordHash: "demo:demo123", role: "user", premium: false, purchases: [] },
  { email: "premium@demo.com", name: "Premium Demo", passwordHash: "demo:demo123", role: "user", premium: true, purchases: [] },
  { email: "profesora@demo.com", name: "Miriam", passwordHash: "demo:demo123", role: "teacher", premium: true, purchases: [] }
];

const serviceDetails = {
  yoga: {
    eyebrow: "Clases online",
    title: "Yoga online a tu ritmo",
    intro: "Practicas guiadas para moverte con seguridad desde casa, elegir el nivel adecuado y construir una rutina que puedas mantener.",
    image: "assets/hero-yoga.png",
    imageAlt: "Estudio luminoso preparado para una clase de yoga",
    libraryTitle: "Clases de yoga disponibles",
    categories: ["Yoga"],
    facts: [
      ["Que encontraras", "Clases organizadas por nivel, duracion y objetivo para elegir sin perder tiempo."],
      ["Para quien", "Para personas que empiezan, retoman la practica o quieren avanzar con una guia clara."],
      ["Como practicar", "Elige una sesion, prepara tu esterilla y sigue el video desde cualquier dispositivo."]
    ]
  },
  meditacion: {
    eyebrow: "Calma y respiracion",
    title: "Meditaciones para cada momento",
    intro: "Audios breves y sesiones guiadas para descansar, recuperar el foco y volver al cuerpo cuando necesitas bajar el ritmo.",
    image: "assets/hero-yoga.png",
    imageAlt: "Sala tranquila preparada para meditacion y respiracion",
    libraryTitle: "Audios y practicas de calma",
    categories: ["Meditacion", "Respiracion", "Relajacion"],
    facts: [
      ["Que encontraras", "Meditaciones, respiraciones y relajaciones con objetivos y duraciones diferentes."],
      ["Para quien", "Para quienes buscan dormir mejor, reducir tension o crear pequenos momentos de pausa."],
      ["Como practicar", "Solo necesitas auriculares y unos minutos; puedes escuchar cada audio donde estes."]
    ]
  },
  premium: {
    eyebrow: "Contenido exclusivo",
    title: "Premium con libertad para elegir",
    intro: "Accede a toda la biblioteca mediante suscripcion o compra solamente la clase que te interesa, sin asumir ningun compromiso.",
    image: "assets/profesora-provisional.png",
    imageAlt: "Profesora de yoga en un estudio luminoso",
    libraryTitle: "Contenido premium destacado",
    premiumOnly: true,
    facts: [
      ["Suscripcion", "Acceso completo a todos los videos y audios premium mientras el plan este activo."],
      ["Compra individual", "Desbloquea una sola clase y mantenla disponible en tu cuenta sin suscribirte."],
      ["Vista previa", "Reproduce el trailer antes de decidir que contenido encaja mejor contigo."]
    ]
  }
};

const defaultSiteContent = {
  heroTitle: "Yoga Team Studio",
  heroDescription: "Una web de yoga con zona privada, clases en video, audios de meditacion y contenido premium gestionado desde un panel sencillo.",
  teacherPhotoCustom: false,
  teacherSlides: [
    {
      title: "Hola, soy Miriam",
      description: "Acompano a personas que quieren cuidarse con una practica cercana, sencilla y respetuosa con su propio ritmo."
    },
    {
      title: "Una practica que se adapta a ti",
      description: "Cada clase incluye opciones claras para que puedas avanzar con confianza, tengas experiencia previa o estes empezando."
    },
    {
      title: "Movimiento, respiracion y descanso",
      description: "Encontraras yoga, meditaciones y ejercicios de respiracion pensados para integrar el bienestar en tu vida cotidiana."
    }
  ],
  services: {
    yoga: {
      cardTitle: "Yoga online",
      cardDescription: "Videos organizados por nivel, duracion y objetivo.",
      detailTitle: serviceDetails.yoga.title,
      detailIntro: serviceDetails.yoga.intro
    },
    meditacion: {
      cardTitle: "Meditacion",
      cardDescription: "Audios para descanso, foco, respiracion y calma.",
      detailTitle: serviceDetails.meditacion.title,
      detailIntro: serviceDetails.meditacion.intro
    },
    premium: {
      cardTitle: "Premium",
      cardDescription: "Contenido privado para alumnas con acceso activo.",
      detailTitle: serviceDetails.premium.title,
      detailIntro: serviceDetails.premium.intro
    }
  }
};

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
const contentFormTitle = document.querySelector("#contentFormTitle");
const contentSubmitButton = document.querySelector("#contentSubmitButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const profileForm = document.querySelector("#profileForm");
const adminRows = document.querySelector("#adminContentRows");
const userRows = document.querySelector("#userRows");
const toast = document.querySelector("#toast");
const mediaDialog = document.querySelector("#mediaDialog");
const mediaDialogTitle = document.querySelector("#mediaDialogTitle");
const mediaDialogBody = document.querySelector("#mediaDialogBody");
const closeMediaButton = document.querySelector("#closeMediaButton");
const teacherCarousel = document.querySelector("#teacherCarousel");
const teacherSlides = [...document.querySelectorAll("[data-teacher-slide]")];
const teacherCarouselDots = [...document.querySelectorAll("[data-teacher-slide-index]")];
const teacherCarouselStatus = document.querySelector("#teacherCarouselStatus");
const serviceDetailHero = document.querySelector("#serviceDetailHero");
const serviceDetailImage = document.querySelector("#serviceDetailImage");
const serviceDetailEyebrow = document.querySelector("#serviceDetailEyebrow");
const serviceDetailTitle = document.querySelector("#serviceDetailTitle");
const serviceDetailIntro = document.querySelector("#serviceDetailIntro");
const serviceDetailFacts = document.querySelector("#serviceDetailFacts");
const serviceDetailLibraryTitle = document.querySelector("#serviceDetailLibraryTitle");
const serviceDetailGrid = document.querySelector("#serviceDetailGrid");
const siteContentForm = document.querySelector("#siteContentForm");
const publicTeacherPhoto = document.querySelector("#publicTeacherPhoto");
const teacherPhotoLabel = document.querySelector("#teacherPhotoLabel");
const siteTeacherPhotoInput = document.querySelector("#siteTeacherPhoto");
const siteTeacherPhotoPreview = document.querySelector("#siteTeacherPhotoPreview");
const resetTeacherPhotoButton = document.querySelector("#resetTeacherPhotoButton");
let authMode = "login";
const mediaUrls = new Map();
const mediaDatabaseName = "luma-yoga-media";
const mediaStoreName = "uploads";
const siteTeacherPhotoStorageId = "site-teacher-photo";
let pendingPanel = null;
let editingItemId = null;
let currentTeacherSlide = 0;
let pendingSitePhotoPreviewUrl = null;

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

function normalizeSiteContent(savedContent = {}) {
  const savedSlides = Array.isArray(savedContent.teacherSlides) ? savedContent.teacherSlides : [];
  const savedServices = savedContent.services || {};

  return {
    heroTitle: savedContent.heroTitle ?? defaultSiteContent.heroTitle,
    heroDescription: savedContent.heroDescription ?? defaultSiteContent.heroDescription,
    teacherPhotoCustom: Boolean(savedContent.teacherPhotoCustom),
    teacherSlides: defaultSiteContent.teacherSlides.map((slide, index) => ({
      ...slide,
      ...(savedSlides[index] || {})
    })),
    services: Object.fromEntries(Object.entries(defaultSiteContent.services).map(([key, service]) => [
      key,
      {
        ...service,
        ...(savedServices[key] || {})
      }
    ]))
  };
}

function normalizeState(savedState) {
  const savedItems = Array.isArray(savedState.items) ? savedState.items : [];
  const mergedItems = [
    ...seedItems,
    ...savedItems.filter((savedItem) => !seedItems.some((seedItem) => seedItem.id === savedItem.id))
  ];

  return {
    ...savedState,
    siteContent: normalizeSiteContent(savedState.siteContent),
    items: mergedItems.map((item) => ({
      ...item,
      price: item.price ?? (item.premium ? 6 : 0),
      previewEnabled: item.previewEnabled ?? (item.premium && ["item-3", "item-4"].includes(item.id)),
      previewDuration: item.previewDuration ?? (item.id === "item-4" ? "4 min" : "2 min")
    })),
    users: (Array.isArray(savedState.users) ? savedState.users : seedUsers).map((user) => {
      const seedUser = seedUsers.find((entry) => entry.email === user.email);

      return {
        ...user,
        name: user.name || user.full_name || seedUser?.name || "",
        passwordHash: user.passwordHash || user.password_hash || seedUser?.passwordHash || "",
        purchases: user.purchases || []
      };
    })
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function currentUser() {
  if (!state.session) return null;
  return state.users.find((user) => user.email === state.session.email) || null;
}

async function getDatabase() {
  if (typeof window.getSupabase !== "function") return null;
  return window.getSupabase();
}

function userFromDatabase(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name || "",
    passwordHash: row.password_hash || "",
    role: row.role || "user",
    premium: Boolean(row.is_premium),
    purchases: []
  };
}

function upsertLocalUser(user) {
  const index = state.users.findIndex((entry) => entry.email === user.email);
  if (index >= 0) {
    state.users[index] = {
      ...state.users[index],
      ...user,
      purchases: state.users[index].purchases || user.purchases || []
    };
    return state.users[index];
  }

  state.users.push(user);
  return user;
}

async function syncUsersFromDatabase() {
  try {
    const db = await getDatabase();
    if (!db) return;

    const { data, error } = await db
      .from("users")
      .select("id,email,full_name,password_hash,role,is_premium")
      .order("created_at", { ascending: false });

    if (error) throw error;

    data.forEach((row) => upsertLocalUser(userFromDatabase(row)));
    saveState();
    renderUserRows();
  } catch (error) {
    console.error("Could not sync users from Supabase:", error);
    notify(`No se pudieron cargar usuarios de Supabase: ${error.message || "revisa permisos"}`);
  }
}

function isTeacher() {
  return currentUser()?.role === "teacher";
}

function canOpen(item) {
  const user = currentUser();
  return !item.premium || user?.premium || user?.role === "teacher" || user?.purchases?.includes(item.id);
}

function showView(route) {
  const requestedService = route.startsWith("servicio-") ? route.replace("servicio-", "") : null;
  const serviceKey = serviceDetails[requestedService] ? requestedService : null;
  const visibleRoute = serviceKey ? "servicio" : route;

  views.forEach((view) => {
    view.hidden = view.dataset.view !== visibleRoute;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.route === (serviceKey ? "clases" : visibleRoute));
  });

  if (visibleRoute === "dashboard") {
    if (!state.session) {
      openAuthDialog("login");
      showView("inicio");
      return;
    }
    renderDashboard();
  }

  if (visibleRoute === "contenido") {
    renderPublicContent();
  }

  if (serviceKey) {
    renderServiceDetail(serviceKey);
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

function currentTeacherPhotoUrl() {
  return mediaUrls.get(siteTeacherPhotoStorageId) || "assets/profesora-provisional.png";
}

function renderSiteContent() {
  const siteContent = state.siteContent;
  document.querySelector("#publicHeroTitle").textContent = siteContent.heroTitle;
  document.querySelector("#publicHeroDescription").textContent = siteContent.heroDescription;

  siteContent.teacherSlides.forEach((slide, index) => {
    document.querySelector(`[data-teacher-slide-title="${index}"]`).textContent = slide.title;
    document.querySelector(`[data-teacher-slide-description="${index}"]`).textContent = slide.description;
  });

  Object.entries(siteContent.services).forEach(([key, service]) => {
    document.querySelector(`[data-service-card-title="${key}"]`).textContent = service.cardTitle;
    document.querySelector(`[data-service-card-description="${key}"]`).textContent = service.cardDescription;
  });

  const photoUrl = currentTeacherPhotoUrl();
  publicTeacherPhoto.src = photoUrl;
  siteTeacherPhotoPreview.src = photoUrl;
  teacherPhotoLabel.textContent = mediaUrls.has(siteTeacherPhotoStorageId) ? "Foto de la profesora" : "Foto provisional";

  const currentRoute = window.location.hash.replace("#", "");
  const serviceKey = currentRoute.startsWith("servicio-") ? currentRoute.replace("servicio-", "") : null;
  if (serviceDetails[serviceKey]) renderServiceDetail(serviceKey);
}

function populateSiteEditor() {
  const siteContent = state.siteContent;
  document.querySelector("#siteHeroTitle").value = siteContent.heroTitle;
  document.querySelector("#siteHeroDescription").value = siteContent.heroDescription;
  siteContent.teacherSlides.forEach((slide, index) => {
    document.querySelector(`#siteTeacherTitle${index + 1}`).value = slide.title;
    document.querySelector(`#siteTeacherDescription${index + 1}`).value = slide.description;
  });

  const fieldPrefixes = {
    yoga: "Yoga",
    meditacion: "Meditacion",
    premium: "Premium"
  };
  Object.entries(siteContent.services).forEach(([key, service]) => {
    const prefix = fieldPrefixes[key];
    document.querySelector(`#site${prefix}CardTitle`).value = service.cardTitle;
    document.querySelector(`#site${prefix}CardDescription`).value = service.cardDescription;
    document.querySelector(`#site${prefix}DetailTitle`).value = service.detailTitle;
    document.querySelector(`#site${prefix}DetailIntro`).value = service.detailIntro;
  });

  if (pendingSitePhotoPreviewUrl) {
    URL.revokeObjectURL(pendingSitePhotoPreviewUrl);
    pendingSitePhotoPreviewUrl = null;
  }
  siteTeacherPhotoInput.value = "";
  siteTeacherPhotoPreview.src = currentTeacherPhotoUrl();
}

function renderServiceDetail(serviceKey) {
  const detail = serviceDetails[serviceKey];
  const editableDetail = state.siteContent.services[serviceKey];
  if (!detail) return;

  serviceDetailHero.dataset.service = serviceKey;
  serviceDetailImage.src = serviceKey === "premium" ? currentTeacherPhotoUrl() : detail.image;
  serviceDetailImage.alt = detail.imageAlt;
  serviceDetailEyebrow.textContent = detail.eyebrow;
  serviceDetailTitle.textContent = editableDetail.detailTitle;
  serviceDetailIntro.textContent = editableDetail.detailIntro;
  serviceDetailLibraryTitle.textContent = detail.libraryTitle;
  serviceDetailFacts.innerHTML = detail.facts.map(([title, description]) => `
    <article class="service-detail-fact">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>
  `).join("");

  const relatedItems = state.items.filter((item) => detail.premiumOnly
    ? item.premium
    : detail.categories.includes(item.category));
  serviceDetailGrid.innerHTML = relatedItems.length
    ? relatedItems.map(contentCard).join("")
    : '<p class="empty-service-content">Todavia no hay contenido publicado en esta categoria.</p>';
}

function showTeacherSlide(index) {
  currentTeacherSlide = (index + teacherSlides.length) % teacherSlides.length;
  teacherSlides.forEach((slide, slideIndex) => {
    slide.hidden = slideIndex !== currentTeacherSlide;
  });
  teacherCarouselDots.forEach((dot, dotIndex) => {
    const active = dotIndex === currentTeacherSlide;
    dot.classList.toggle("active", active);
    if (active) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
  teacherCarouselStatus.textContent = `${currentTeacherSlide + 1} de ${teacherSlides.length}`;
}

function contentCard(item) {
  const user = currentUser();
  const locked = !canOpen(item);
  const hasPreview = item.previewEnabled;
  const canBuySingle = locked && item.premium && item.price > 0;
  const typeLabel = item.type === "video" ? "Video" : "Audio";
  const symbol = item.type === "video" ? "play" : "audio";
  const boughtSingle = Boolean(user?.purchases?.includes(item.id));
  const accessText = locked ? "Premium" : item.premium ? boughtSingle ? "Comprado" : "Premium incluido" : "Gratis";
  const mediaUrl = mediaUrls.get(item.id);
  const media = mediaUrl && !locked
    ? item.type === "video"
      ? `<video class="media-player" controls preload="metadata" playsinline src="${escapeHtml(mediaUrl)}" aria-label="${escapeHtml(item.title)}"></video>`
      : `<audio class="media-player" controls preload="metadata" src="${escapeHtml(mediaUrl)}" aria-label="${escapeHtml(item.title)}"></audio>`
    : `<div class="media-thumb">${symbol}</div>`;

  return `
    <article class="content-card ${locked ? "locked" : ""}">
      ${media}
      <div class="card-meta">
        <span class="chip">${typeLabel}</span>
        <span class="chip">${item.category}</span>
        <span class="chip">${item.level}</span>
        <span class="chip ${item.premium ? "premium" : ""}">${accessText}</span>
        ${item.previewEnabled ? `<span class="chip preview">Trailer ${escapeHtml(item.previewDuration || "demo")}</span>` : ""}
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
  const teacher = isTeacher();
  const displayName = user.name || user.email;
  document.querySelector("#sidebarTitle").textContent = teacher ? "Gestion" : "Mi espacio";
  document.querySelector("#welcomeTitle").textContent = teacher ? "Gestion de contenidos" : `Hola, ${displayName}`;
  document.querySelector("#sessionRole").textContent = teacher ? "Administracion" : "Alumna/o";
  document.querySelector("#premiumStatus").hidden = teacher;
  document.querySelector("#premiumStatus").textContent = user.premium ? "Premium activo" : "Plan gratis";
  document.querySelector("#premiumStatus").classList.toggle("premium", user.premium);
  const purchasedCount = user.purchases?.length || 0;
  document.querySelector("#profileName").value = user.name || "";
  document.querySelector("#profileEmail").value = user.email || "";
  document.querySelector("#profileText").textContent = `Nombre: ${displayName}. Email: ${user.email}. Acceso: ${user.premium ? "suscripcion premium" : "plan gratis"}. Compras individuales: ${purchasedCount}.`;

  document.querySelectorAll(".admin-only").forEach((element) => {
    element.hidden = !teacher;
  });
  document.querySelectorAll(".side-link.student-only").forEach((element) => {
    element.hidden = teacher;
  });

  dashboardGrid.innerHTML = state.items.map(contentCard).join("");
  renderAdminRows();
  renderUserRows();
  if (teacher) {
    populateSiteEditor();
    syncUsersFromDatabase();
  }
}

function renderAdminRows() {
  adminRows.innerHTML = state.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.title)}</td>
      <td>${item.type === "video" ? "Video" : "Audio"}</td>
      <td>${item.premium ? "Premium" : "Gratis"}</td>
      <td>${item.premium && item.price > 0 ? escapeHtml(formatPrice(item.price)) : "-"}</td>
      <td>${item.previewEnabled ? escapeHtml(item.previewDuration || "Si") : "No"}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-button" type="button" data-edit-item="${item.id}">Editar</button>
          <button class="secondary-button" type="button" data-delete-item="${item.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function resetContentEditor() {
  editingItemId = null;
  contentForm.reset();
  contentFormTitle.textContent = "Subir contenido";
  contentSubmitButton.textContent = "Guardar contenido";
  cancelEditButton.hidden = true;
}

function editContentItem(item) {
  if (!item || !isTeacher()) return;

  editingItemId = item.id;
  contentForm.reset();
  document.querySelector("#itemTitle").value = item.title || "";
  document.querySelector("#itemDescription").value = item.description || "";
  document.querySelector("#itemType").value = item.type || "video";
  document.querySelector("#itemCategory").value = item.category || "Yoga";
  document.querySelector("#itemLevel").value = item.level || "Principiante";
  document.querySelector("#itemDuration").value = item.duration || "";
  document.querySelector("#itemPrice").value = Number(item.price || 0);
  document.querySelector("#itemPremium").checked = Boolean(item.premium);
  document.querySelector("#itemPreview").checked = Boolean(item.previewEnabled);
  document.querySelector("#itemPreviewDuration").value = item.previewDuration || "";
  contentFormTitle.textContent = `Editar: ${item.title}`;
  contentSubmitButton.textContent = "Guardar cambios";
  cancelEditButton.hidden = false;
  showPanel("admin");
  contentForm.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#itemTitle").focus({ preventScroll: true });
}

function renderUserRows() {
  userRows.innerHTML = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.name || user.email)}<br><small>${escapeHtml(user.email)}</small></td>
      <td>${user.role === "teacher" ? "Profesora" : "Alumna/o"}</td>
      <td>${user.premium ? "Si" : "No"}</td>
      <td><button class="secondary-button" type="button" data-toggle-user="${user.email}">${user.premium ? "Quitar" : "Dar"} premium</button></td>
    </tr>
  `).join("");
}

function showPanel(panelName) {
  if (panelName === "profile" && isTeacher()) {
    panelName = "admin";
  }

  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.hidden = panel.id !== `panel-${panelName}`;
  });
  document.querySelectorAll(".side-link[data-panel]").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });
}

function openDashboardPanel(panelName) {
  if (!state.session) {
    pendingPanel = panelName;
    openAuthDialog("login");
    document.querySelector("#emailInput").value = panelName === "admin"
      ? "profesora@demo.com"
      : "alumna@demo.com";
    notify(panelName === "admin" ? "Inicia sesion como profesora." : "Inicia sesion para abrir tu biblioteca.");
    return;
  }

  if (panelName === "admin" && !isTeacher()) {
    notify("Este panel solo esta disponible para la profesora.");
    return;
  }

  window.location.hash = "dashboard";
  showView("dashboard");
  showPanel(panelName);
}

function demoPasswordHash(password) {
  return `demo:${password}`;
}

async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const fullName = document.querySelector("#nameInput").value.trim();
  const passwordHash = demoPasswordHash(password);
  let user = null;

  if (!password) {
    notify("Introduce una contraseña.");
    openAuthDialog(authMode);
    document.querySelector("#emailInput").value = normalizedEmail;
    return;
  }

  try {
    const db = await getDatabase();
    if (db) {
      const { data: existingUser, error: findError } = await db
        .from("users")
        .select("id,email,full_name,password_hash,role,is_premium")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (findError) throw findError;

      if (authMode === "register") {
        if (existingUser) {
          user = userFromDatabase(existingUser);
          if (user.passwordHash && user.passwordHash !== passwordHash) {
            notify("Esta cuenta ya existe. Inicia sesion con su contraseña.");
            openAuthDialog("login");
            document.querySelector("#emailInput").value = normalizedEmail;
            return;
          }
          notify("Esta cuenta ya existia. Hemos iniciado sesion.");
        } else {
          const { data: createdUser, error: insertError } = await db
            .from("users")
            .insert({
              email: normalizedEmail,
              full_name: fullName,
              password_hash: passwordHash,
              role: "user",
              is_premium: false,
              last_login_at: new Date().toISOString()
            })
            .select("id,email,full_name,password_hash,role,is_premium")
            .single();

          if (insertError) throw insertError;
          user = userFromDatabase(createdUser);
          notify("Cuenta creada en Supabase.");
        }
      } else {
        if (!existingUser) {
          notify("No existe una cuenta con ese email. Registrate primero.");
          openAuthDialog("register");
          document.querySelector("#emailInput").value = normalizedEmail;
          return;
        }

        user = userFromDatabase(existingUser);
        if (user.passwordHash && user.passwordHash !== passwordHash) {
          notify("Contraseña incorrecta.");
          openAuthDialog("login");
          document.querySelector("#emailInput").value = normalizedEmail;
          return;
        }
        await db
          .from("users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("email", normalizedEmail);
      }
    }
  } catch (error) {
    console.error("Supabase user flow failed:", error);
    notify(`Supabase no dejo completar la accion: ${error.message || "revisa permisos/RLS"}`);
    return;
  }

  if (!user) {
    const localUser = state.users.find((entry) => entry.email === normalizedEmail);
    if (authMode === "login" && !localUser) {
      notify("No existe una cuenta con ese email. Registrate primero.");
      openAuthDialog("register");
      document.querySelector("#emailInput").value = normalizedEmail;
      return;
    }

    user = localUser || {
      email: normalizedEmail,
      role: "user",
      premium: false,
      purchases: [],
      name: fullName,
      passwordHash
    };
  }

  if (user.passwordHash && user.passwordHash !== passwordHash) {
    notify("Contraseña incorrecta.");
    openAuthDialog("login");
    document.querySelector("#emailInput").value = normalizedEmail;
    return;
  }

  user = upsertLocalUser(user);
  state.session = { email: normalizedEmail };
  saveState();
  updateHeader();
  showView("dashboard");
  window.location.hash = "dashboard";

  const targetPanel = pendingPanel;
  pendingPanel = null;
  if (targetPanel === "admin" && !isTeacher()) {
    showPanel("library");
    notify("La cuenta iniciada no tiene acceso al panel de profesora.");
  } else {
    showPanel(targetPanel || (isTeacher() ? "admin" : "library"));
  }
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} EUR`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes > 0) {
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`;
  }

  return `${remainingSeconds} s`;
}

function readMediaDuration(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.match(/^(audio|video)\//)) {
      resolve("");
      return;
    }

    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    const url = URL.createObjectURL(file);

    media.preload = "metadata";
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(formatDuration(media.duration));
    };
    media.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    media.src = url;
  });
}

function openMediaDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Este navegador no permite guardar archivos localmente"));
      return;
    }

    const request = indexedDB.open(mediaDatabaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(mediaStoreName)) {
        database.createObjectStore(mediaStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacen de archivos"));
  });
}

async function storeMediaFile(itemId, file) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    transaction.objectStore(mediaStoreName).put({
      id: itemId,
      blob: file,
      name: file.name,
      type: file.type,
      savedAt: Date.now()
    });
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("No se pudo guardar el archivo"));
    };
  });
}

async function getStoredMedia(itemId) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readonly");
    const request = transaction.objectStore(mediaStoreName).get(itemId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("No se pudo leer el archivo"));
    transaction.oncomplete = () => database.close();
  });
}

async function deleteStoredMedia(itemId) {
  const database = await openMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    transaction.objectStore(mediaStoreName).delete(itemId);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("No se pudo eliminar el archivo"));
    };
  });
}

async function restoreStoredMedia() {
  let restoredCount = 0;

  try {
    const records = await Promise.all(state.items.map((item) => getStoredMedia(item.id)));
    records.forEach((record, index) => {
      if (!record?.blob) return;
      const item = state.items[index];
      const previousUrl = mediaUrls.get(item.id);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      mediaUrls.set(item.id, URL.createObjectURL(record.blob));
      restoredCount += 1;
    });

    const teacherPhotoRecord = await getStoredMedia(siteTeacherPhotoStorageId);
    if (teacherPhotoRecord?.blob) {
      const previousUrl = mediaUrls.get(siteTeacherPhotoStorageId);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      mediaUrls.set(siteTeacherPhotoStorageId, URL.createObjectURL(teacherPhotoRecord.blob));
      restoredCount += 1;
    }
  } catch (error) {
    console.error("Could not restore media files:", error);
  }

  if (restoredCount > 0) {
    renderSiteContent();
    renderPublicContent();
    if (state.session && window.location.hash === "#dashboard") {
      renderDashboard();
    }
  }
}

function previewLimitInSeconds(value) {
  const text = String(value || "").toLowerCase();
  const hours = Number(text.match(/([\d.,]+)\s*h/)?.[1]?.replace(",", ".") || 0);
  const minutes = Number(text.match(/([\d.,]+)\s*min/)?.[1]?.replace(",", ".") || 0);
  const seconds = Number(text.match(/([\d.,]+)\s*s/)?.[1]?.replace(",", ".") || 0);
  return Math.round((hours * 3600) + (minutes * 60) + seconds);
}

function openMediaViewer(item, preview = false) {
  const mediaUrl = mediaUrls.get(item.id);
  if (!mediaUrl) {
    notify("El archivo no esta disponible. La profesora debe volver a subir este contenido.");
    return;
  }

  const media = document.createElement(item.type === "video" ? "video" : "audio");
  media.className = "dialog-media";
  media.controls = true;
  media.preload = "metadata";
  media.src = mediaUrl;
  if (item.type === "video") media.playsInline = true;

  mediaDialogTitle.textContent = preview ? `Trailer: ${item.title}` : item.title;
  mediaDialogBody.replaceChildren();

  if (preview) {
    const limit = previewLimitInSeconds(item.previewDuration);
    const note = document.createElement("p");
    note.className = "media-preview-note";
    note.textContent = `Vista previa disponible: ${item.previewDuration || "duracion limitada"}.`;
    mediaDialogBody.append(note);

    if (limit > 0) {
      media.addEventListener("timeupdate", () => {
        if (media.currentTime < limit) return;
        media.pause();
        media.currentTime = 0;
        notify("Has llegado al final del trailer.");
      });
    }
  }

  mediaDialogBody.append(media);
  mediaDialog.showModal();
  media.play().catch(() => {});
}

function closeMediaViewer() {
  if (mediaDialog.open) mediaDialog.close();
}

function clearMediaViewer() {
  const media = mediaDialogBody.querySelector("audio, video");
  if (media) {
    media.pause();
    media.removeAttribute("src");
    media.load();
  }
  mediaDialogBody.replaceChildren();
}

function updateHeader() {
  const user = currentUser();
  loginButton.textContent = user ? user.role === "teacher" ? "Profesora" : user.name || user.email : "Iniciar sesion";
  registerButton.textContent = user ? user.role === "teacher" ? "Panel" : "Mi espacio" : "Registrarse";
  document.querySelectorAll(".teacher-home-only").forEach((element) => {
    element.hidden = user?.role !== "teacher";
  });
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
    ? "Demo: la contraseña se guarda en la tabla users solo para pruebas."
    : "Demo: prueba alumna@demo.com o profesora@demo.com con demo123.";
  document.querySelector("#authSubmitButton").textContent = isRegister ? "Crear cuenta" : "Entrar";
  document.querySelectorAll(".register-only").forEach((element) => {
    element.hidden = !isRegister;
  });
  document.querySelector("#emailInput").value = isRegister ? "" : "alumna@demo.com";
  document.querySelector("#passwordInput").value = "";
  document.querySelector("#passwordInput").autocomplete = isRegister ? "new-password" : "current-password";
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
    pendingPanel = null;
    openAuthDialog(authButton.dataset.authMode);
    return;
  }

  const dashboardShortcut = event.target.closest("[data-dashboard-panel]");
  if (dashboardShortcut) {
    openDashboardPanel(dashboardShortcut.dataset.dashboardPanel);
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
    if (!item || !canOpen(item)) {
      notify("Este contenido es premium.");
      return;
    }
    openMediaViewer(item);
  }

  const previewButton = event.target.closest("[data-preview-item]");
  if (previewButton) {
    const item = state.items.find((entry) => entry.id === previewButton.dataset.previewItem);
    if (item) openMediaViewer(item, true);
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

  const editButton = event.target.closest("[data-edit-item]");
  if (editButton) {
    const item = state.items.find((entry) => entry.id === editButton.dataset.editItem);
    editContentItem(item);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-item]");
  if (deleteButton) {
    const itemId = deleteButton.dataset.deleteItem;
    const index = state.items.findIndex((entry) => entry.id === itemId);
    if (index < 0) return;
    state.items.splice(index, 1);
    const mediaUrl = mediaUrls.get(itemId);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    mediaUrls.delete(itemId);
    deleteStoredMedia(itemId).catch((error) => console.error("Could not delete media file:", error));
    if (editingItemId === itemId) resetContentEditor();
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
    getDatabase().then((db) => {
      if (!db) return;
      return db
        .from("users")
        .update({ is_premium: user.premium })
        .eq("email", user.email);
    }).then((result) => {
      if (result?.error) throw result.error;
      notify(`Premium actualizado para ${user.email}.`);
    }).catch((error) => {
      console.error("Could not update premium in Supabase:", error);
      notify(`No se pudo actualizar premium en Supabase: ${error.message || "revisa permisos"}`);
    });
  }
});

loginButton.addEventListener("click", () => {
  if (state.session) {
    window.location.hash = "dashboard";
    return;
  }
  openAuthDialog("login");
});
closeAuthButton.addEventListener("click", () => {
  pendingPanel = null;
  authDialog.close();
});
authDialog.addEventListener("cancel", () => {
  pendingPanel = null;
});
closeMediaButton.addEventListener("click", closeMediaViewer);
mediaDialog.addEventListener("click", (event) => {
  if (event.target === mediaDialog) closeMediaViewer();
});
mediaDialog.addEventListener("close", clearMediaViewer);
registerButton.addEventListener("click", () => {
  if (!state.session) {
    openAuthDialog("register");
    return;
  }
  window.location.hash = "dashboard";
});

logoutButton.addEventListener("click", () => {
  state.session = null;
  pendingPanel = null;
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
  const password = document.querySelector("#passwordInput").value;
  authDialog.close();
  login(email, password);
});

document.querySelector("#itemFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const duration = await readMediaDuration(file);
  if (!duration) return;

  document.querySelector("#itemDuration").value = duration;
  notify(`Duracion detectada: ${duration}.`);
});

cancelEditButton.addEventListener("click", () => {
  resetContentEditor();
  notify("Edicion cancelada.");
});

document.querySelector("#previousTeacherSlide").addEventListener("click", () => {
  showTeacherSlide(currentTeacherSlide - 1);
});

document.querySelector("#nextTeacherSlide").addEventListener("click", () => {
  showTeacherSlide(currentTeacherSlide + 1);
});

teacherCarouselDots.forEach((dot) => {
  dot.addEventListener("click", () => showTeacherSlide(Number(dot.dataset.teacherSlideIndex)));
});

teacherCarousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showTeacherSlide(currentTeacherSlide - 1);
  if (event.key === "ArrowRight") showTeacherSlide(currentTeacherSlide + 1);
});

siteTeacherPhotoInput.addEventListener("change", () => {
  const file = siteTeacherPhotoInput.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  if (pendingSitePhotoPreviewUrl) URL.revokeObjectURL(pendingSitePhotoPreviewUrl);
  pendingSitePhotoPreviewUrl = URL.createObjectURL(file);
  siteTeacherPhotoPreview.src = pendingSitePhotoPreviewUrl;
});

resetTeacherPhotoButton.addEventListener("click", async () => {
  if (!isTeacher()) return;
  const currentUrl = mediaUrls.get(siteTeacherPhotoStorageId);
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  mediaUrls.delete(siteTeacherPhotoStorageId);
  if (pendingSitePhotoPreviewUrl) {
    URL.revokeObjectURL(pendingSitePhotoPreviewUrl);
    pendingSitePhotoPreviewUrl = null;
  }
  siteTeacherPhotoInput.value = "";
  state.siteContent.teacherPhotoCustom = false;
  saveState();
  try {
    await deleteStoredMedia(siteTeacherPhotoStorageId);
  } catch (error) {
    console.error("Could not reset teacher photo:", error);
  }
  renderSiteContent();
  populateSiteEditor();
  notify("Se ha restaurado la foto provisional.");
});

siteContentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isTeacher()) return;

  const photoFile = siteTeacherPhotoInput.files[0];
  if (photoFile && !photoFile.type.startsWith("image/")) {
    notify("Selecciona un archivo de imagen valido.");
    return;
  }

  const readValue = (selector) => document.querySelector(selector).value.trim();
  const nextSiteContent = normalizeSiteContent({
    heroTitle: readValue("#siteHeroTitle"),
    heroDescription: readValue("#siteHeroDescription"),
    teacherPhotoCustom: photoFile ? true : state.siteContent.teacherPhotoCustom,
    teacherSlides: [1, 2, 3].map((number) => ({
      title: readValue(`#siteTeacherTitle${number}`),
      description: readValue(`#siteTeacherDescription${number}`)
    })),
    services: {
      yoga: {
        cardTitle: readValue("#siteYogaCardTitle"),
        cardDescription: readValue("#siteYogaCardDescription"),
        detailTitle: readValue("#siteYogaDetailTitle"),
        detailIntro: readValue("#siteYogaDetailIntro")
      },
      meditacion: {
        cardTitle: readValue("#siteMeditacionCardTitle"),
        cardDescription: readValue("#siteMeditacionCardDescription"),
        detailTitle: readValue("#siteMeditacionDetailTitle"),
        detailIntro: readValue("#siteMeditacionDetailIntro")
      },
      premium: {
        cardTitle: readValue("#sitePremiumCardTitle"),
        cardDescription: readValue("#sitePremiumCardDescription"),
        detailTitle: readValue("#sitePremiumDetailTitle"),
        detailIntro: readValue("#sitePremiumDetailIntro")
      }
    }
  });

  const submitButton = event.submitter;
  submitButton.disabled = true;
  submitButton.textContent = "Guardando...";

  try {
    if (photoFile) {
      await storeMediaFile(siteTeacherPhotoStorageId, photoFile);
      const previousUrl = mediaUrls.get(siteTeacherPhotoStorageId);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      mediaUrls.set(siteTeacherPhotoStorageId, URL.createObjectURL(photoFile));
    }

    state.siteContent = nextSiteContent;
    saveState();
    renderSiteContent();
    populateSiteEditor();
    notify("Los cambios de la web se han guardado.");
  } catch (error) {
    console.error("Could not save site content:", error);
    notify(`No se pudieron guardar los cambios: ${error.message || "revisa el almacenamiento"}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar cambios de la web";
  }
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = currentUser();
  if (!user) return;

  const oldEmail = user.email;
  const newName = document.querySelector("#profileName").value.trim();
  const newEmail = document.querySelector("#profileEmail").value.trim().toLowerCase();

  if (!newName || !newEmail) {
    notify("Completa nombre y email para guardar el perfil.");
    return;
  }

  const emailInUse = state.users.some((entry) => entry.email === newEmail && entry.email !== oldEmail);
  if (emailInUse) {
    notify("Ese email ya esta usado por otra cuenta.");
    return;
  }

  user.name = newName;
  user.email = newEmail;
  state.session.email = newEmail;
  saveState();
  updateHeader();
  renderDashboard();
  renderPublicContent();
  notify("Perfil actualizado.");

  getDatabase().then((db) => {
    if (!db) return null;
    return db
      .from("users")
      .update({ email: newEmail, full_name: newName })
      .eq("email", oldEmail);
  }).then((result) => {
    if (result?.error) throw result.error;
  }).catch((error) => {
    console.error("Could not update profile in Supabase:", error);
    notify(`Perfil guardado en demo, pero Supabase no actualizo: ${error.message || "revisa permisos"}`);
  });
});

contentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fileInput = document.querySelector("#itemFile");
  const file = fileInput.files[0];
  const titleInput = document.querySelector("#itemTitle");
  const rawTitle = titleInput.value.trim();

  if (!rawTitle) {
    notify("El titulo es obligatorio para guardar contenido.");
    titleInput.focus();
    titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const existingItem = editingItemId
    ? state.items.find((entry) => entry.id === editingItemId)
    : null;
  const item = {
    ...existingItem,
    id: existingItem?.id || `item-${Date.now()}`,
    title: rawTitle,
    description: document.querySelector("#itemDescription").value,
    type: document.querySelector("#itemType").value,
    category: document.querySelector("#itemCategory").value,
    level: document.querySelector("#itemLevel").value,
    duration: document.querySelector("#itemDuration").value || "Sin duracion",
    price: Number(document.querySelector("#itemPrice").value || 0),
    premium: document.querySelector("#itemPremium").checked,
    previewEnabled: document.querySelector("#itemPreview").checked,
    previewDuration: document.querySelector("#itemPreviewDuration").value || "2 min",
    fileName: file?.name || existingItem?.fileName || "archivo-local-demo"
  };

  const wasEditing = Boolean(existingItem);
  contentSubmitButton.disabled = true;
  contentSubmitButton.textContent = "Guardando...";

  try {
    if (file) {
      await storeMediaFile(item.id, file);
      const previousUrl = mediaUrls.get(item.id);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      mediaUrls.set(item.id, URL.createObjectURL(file));
      item.hasStoredMedia = true;
    }

    if (wasEditing) {
      const itemIndex = state.items.findIndex((entry) => entry.id === item.id);
      state.items[itemIndex] = item;
    } else {
      state.items.unshift(item);
    }
    saveState();
    resetContentEditor();
    renderDashboard();
    renderPublicContent();
    notify(wasEditing ? "Contenido actualizado." : file ? "Contenido y archivo guardados en la demo." : "Contenido guardado sin archivo multimedia.");
  } catch (error) {
    console.error("Could not store media file:", error);
    notify(`No se pudo guardar el archivo: ${error.message || "revisa el espacio del navegador"}`);
  } finally {
    contentSubmitButton.disabled = false;
    contentSubmitButton.textContent = editingItemId ? "Guardar cambios" : "Guardar contenido";
  }
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
renderSiteContent();
showTeacherSlide(0);
renderPublicContent();
routeFromHash();
restoreStoredMedia();
