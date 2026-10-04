const CONFIG = {
  weddingDate: "2027-06-18T18:00:00+02:00",
  rsvpWhatsApp: "", // npr. "381641234567" - ostavi prazno ako ne želiš WhatsApp
  coupleNames: "Danijel & Aleena"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* =========================
   LOADER
========================= */
window.addEventListener("load", () => {
  setTimeout(() => $("#loader")?.classList.add("hide"), 900);
});


/* =========================
   SMOOTH SCROLL
========================= */
$$("[data-scroll]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(btn.dataset.scroll)?.scrollIntoView({
      behavior: "smooth"
    });
  });
});


/* =========================
   MUSIC
   Browseri blokiraju autoplay.
   Muzika se zato pokreće na prvi klik/touch.
========================= */
const music = $("#music");
const musicToggle = $("#musicToggle");

function updateMusicButton() {
  musicToggle.classList.toggle("playing", !music.paused);
  musicToggle.setAttribute(
    "aria-label",
    music.paused ? "Uključi muziku" : "Isključi muziku"
  );
}

async function startMusic() {
  try {
    await music.play();
    updateMusicButton();
  } catch (_) {}
}

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    await startMusic();
  } else {
    music.pause();
    updateMusicButton();
  }
});

["pointerdown", "touchstart"].forEach(eventName => {
  window.addEventListener(eventName, () => {
    if (music.paused) startMusic();
  }, { once: true, passive: true });
});


/* =========================
   SCRATCH CARDS
========================= */
function setupScratchCard(card) {
  const canvas = card.querySelector(".scratch-canvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // gold foil
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#e6c887");
    gradient.addColorStop(.45, "#cda45f");
    gradient.addColorStop(.7, "#f0d69b");
    gradient.addColorStop(1, "#bd8d42");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // fine foil texture
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let x = -rect.height; x < rect.width + rect.height; x += 16) {
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(-.5);
      ctx.fillRect(0, -30, 4, rect.height + 60);
      ctx.restore();
    }
  }

  resize();
  window.addEventListener("resize", resize);

  let drawing = false;

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const source = e.touches?.[0] || e;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top
    };
  }

  function scratch(e) {
    if (!drawing) return;

    const {x, y} = pointFromEvent(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 19, 0, Math.PI * 2);
    ctx.fill();

    checkRevealed();
  }

  function checkRevealed() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 40) {
      if (pixels[i] === 0) transparent++;
    }

    const total = Math.floor(pixels.length / 40);

    if (transparent / total > .52) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      card.classList.add("revealed");
    }
  }

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    canvas.setPointerCapture?.(e.pointerId);
    scratch(e);
  });

  canvas.addEventListener("pointermove", scratch);
  canvas.addEventListener("pointerup", () => drawing = false);
  canvas.addEventListener("pointercancel", () => drawing = false);
  canvas.addEventListener("pointerleave", () => drawing = false);
}

$$(".scratch-card").forEach(setupScratchCard);


/* =========================
   COUNTDOWN
========================= */
const weddingTimestamp = new Date(CONFIG.weddingDate).getTime();

function updateCountdown() {
  const diff = Math.max(0, weddingTimestamp - Date.now());

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  $("#days").textContent = String(days).padStart(3, "0");
  $("#hours").textContent = String(hours).padStart(2, "0");
  $("#minutes").textContent = String(minutes).padStart(2, "0");
  $("#seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =========================
   SCROLL REVEALS
========================= */
const revealTargets = [
  ".date > *",
  ".countdown .section-inner",
  ".story-image",
  ".story-copy",
  ".gallery > *",
  ".event-card",
  ".dress-card",
  ".rsvp > *",
  ".gift-card",
  ".final-content"
];

revealTargets.forEach(selector => {
  $$(selector).forEach((el, index) => {
    el.classList.add("reveal-ready");
    el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: .12});

$$(".reveal-ready").forEach(el => revealObserver.observe(el));


/* =========================
   GALLERY LIGHTBOX
========================= */
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");

$$(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.image;
    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
  });
});

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.classList.remove("no-scroll");
  setTimeout(() => lightboxImage.src = "", 200);
}

$("#closeLightbox").addEventListener("click", closeLightbox);

lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});


/* =========================
   GIFT
========================= */
$("#giftButton").addEventListener("click", () => {
  const box = $("#giftDetails");
  const open = box.classList.toggle("show");
  $("#giftButton").textContent = open ? "HIDE DETAILS" : "VIEW DETAILS";
});


/* =========================
   RSVP
   Ako upišeš broj u CONFIG.rsvpWhatsApp,
   forma automatski otvara WhatsApp poruku.
   Ako je prazan, prikazuje potvrdu na stranici.
========================= */
$("#rsvpForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = $("#guestName").value.trim();
  const attendance = $("#attendance").value;
  const guests = $("#guestCount").value;
  const message = $("#guestMessage").value.trim();

  const status =
    attendance === "yes"
      ? `DA — dolazim (${guests} osoba)`
      : "NE — ne mogu da dođem";

  const whatsappText =
`Pozdrav Danijel & Aleena!%0A%0A` +
`Ime: ${encodeURIComponent(name)}%0A` +
`Odgovor: ${encodeURIComponent(status)}%0A` +
`Poruka: ${encodeURIComponent(message || "-")}`;

  if (CONFIG.rsvpWhatsApp) {
    window.open(`https://wa.me/${CONFIG.rsvpWhatsApp}?text=${whatsappText}`, "_blank");
  } else {
    $("#formMessage").textContent =
      attendance === "yes"
        ? `Hvala, ${name}! Vaša potvrda je zabeležena. ❤️`
        : `Hvala, ${name}! Žao nam je što nećete moći da dođete.`;
  }

  e.target.reset();
  $("#guestCount").value = "1";
});


/* =========================
   SIMPLE PARALLAX HERO
========================= */
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const heroPhoto = $(".hero-photo");

  if (heroPhoto && y < window.innerHeight * 1.2) {
    heroPhoto.style.transform = `scale(1.04) translateY(${y * .08}px)`;
  }
}, {passive: true});
