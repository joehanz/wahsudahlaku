const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const PER_PAGE = 26;

let allAds = [];
let filteredAds = [];
let currentPage = 1;

/* =========================
LOAD & DROPDOWN LOGIC
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // Panggil pemuat data bawaan
  await loadAds();
  initSearch();
  initStickyBanner();

  // 1. KONTROL DROPDOWN (Hanya memicu sub-menu keluar, tidak memfilter hasil)
  const toggles = document.querySelectorAll(".dropdown-toggle");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault(); 
      e.stopPropagation(); // Stop bentrokan event bubbling
      
      const parent = toggle.parentElement;
      const menu = parent.querySelector(".dropdown-menu");
      
      // Tutup semua dropdown lain yang sedang terbuka
      document.querySelectorAll(".nav-item-dropdown").forEach(item => {
        if (item !== parent) item.classList.remove("show");
      });

      // Buka / Tutup dropdown saat ini
      parent.classList.toggle("show");

      // Hitung koordinat tombol secara realtime agar dropdown melayang bebas (Scroll Horizontal Friendly)
      if (parent.classList.contains("show") && menu) {
        const rect = toggle.getBoundingClientRect();
        menu.style.left = (rect.left + window.scrollX) + "px";
        menu.style.top = (rect.bottom + window.scrollY) + "px";
      }
    });
  });

  // 2. KONTROL KLIK SUB-KATEGORI (Ini yang memicu hasil pencarian iklan)
  document.querySelectorAll(".dropdown-menu a").forEach(subLink => {
    subLink.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Ambil nilai kategori dari data-category milik sub-menu yang diklik
      const value = this.dataset.category || this.innerText.trim();
      const select = document.getElementById("categoryFilter");
      
      if (select) {
        select.value = value;
        // Jalankan filter pencarian bawaan
        select.dispatchEvent(new Event("change"));
      }

      // Otomatis tutup kembali dropdown setelah sub-kategori dipilih
      document.querySelectorAll(".nav-item-dropdown").forEach(item => {
        item.classList.remove("show");
      });
    });
  });

  // Otomatis tutup dropdown jika pengguna mengklik area sembarang di luar menu
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-item-dropdown").forEach(item => {
      item.classList.remove("show");
    });
  });
});

/* =========================
LOAD DATA
========================= */
async function loadAds(){
  try{
    const res = await fetch(API_URL);
    const data = await res.json();

    allAds = Array.isArray(data)
      ? data.sort((a,b)=> new Date(b.date) - new Date(a.date))
      : [];

    filteredAds = [...allAds];

    renderHero();
    renderCategories();
    renderAds();
    renderLatest();
    renderPopular();
  }catch(err){
    console.error(err);
  }
}

/* =========================
HERO RANDOM
========================= */
function renderHero(){
  const hero = document.getElementById("hero");
  if(!hero || !allAds.length) return;

  const random = allAds[Math.floor(Math.random() * allAds.length)];
  if(random.image){
    hero.style.backgroundImage = `url(${random.image})`;
  }
}

/* =========================
SEARCH
========================= */
function initSearch(){
  const input = document.getElementById("searchInput");
  const select = document.getElementById("categoryFilter");

  if(input){
    input.addEventListener("input", filterAds);
  }
  if(select){
    select.addEventListener("change", filterAds);
  }
}

/* =========================
FILTER PROSES
========================= */
function filterAds(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  filteredAds = allAds.filter(ad=>{
    const text = `
      ${ad.title || ""}
      ${ad.description || ""}
    `.toLowerCase();

    const matchKeyword = text.includes(keyword);
    const matchCategory = !category || ad.category === category;

    return (matchKeyword && matchCategory);
  });

  currentPage = 1;
  renderAds();
}

/* =========================
KATEGORI
========================= */
function renderCategories(){
  const select = document.getElementById("categoryFilter");
  const sidebar = document.getElementById("sidebarCategories");

  if(!select) return;

  const categories = [...new Set(allAds.map(x=>x.category))].filter(Boolean);

  categories.forEach(cat=>{
    select.innerHTML += `
      <option value="${cat}">
        ${cat}
      </option>
    `;

    if(sidebar){
      sidebar.innerHTML += `
        <li>${cat}</li>
      `;
    }
  });
}

/* =========================
ADS
========================= */
function renderAds(){
  const wrap = document.getElementById("adsContainer");
  if(!wrap) return;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const items = filteredAds.slice(start, end);

  wrap.innerHTML = items.map(ad => {
    const phone = cleanWA(String(ad.whatsapp || ""));

    // selalu potong 250 karakter + link baca lagi
    let desc = ad.description || "";
    let shortDesc = makeLinks(desc.substring(0,250)) + '... <a href="iklan.html?id=' + ad.id + '">Baca lagi</a>';

    return `
      <div class="ad-card">
        <div class="ad-thumb">
          <img src="${ad.image || ''}" loading="lazy">
        </div>
        <div class="ad-content">
          <div class="ad-title">
            ${safe(ad.title)}
          </div>
          <div class="ad-desc">
            ${shortDesc}
          </div>
          <div class="ad-meta">
            <span>📍 ${safe(ad.location)}</span>
            <span>📅 ${formatDate(ad.date)}</span>
            <span>👁️ ${ad.views} Dilihat</span>
          </div>
          <div class="contact-buttons">
            <a class="call-btn" href="tel:${phone}">
              📞 <span>Telepon</span>
            </a>
            <a class="wa-btn" target="_blank" href="https://wa.me/${phone}?text=${encodeURIComponent(
              `Halo.\n\nSaya melihat iklan:\n${safe(ad.title)}\ndi situs:\nhttps://rewangiklan.my.id/\n\nSaya tertarik dan ingin mengetahui informasi lebih lanjut.\n\nTerima kasih.`
            )}">
              <img src="image/wa.svg" class="wa-icon" alt="WhatsApp">
              <span>WhatsApp</span>
            </a>
            <a class="manage-btn" href="iklan-saya.html">
              ⚙️ <span>Kelola</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  renderPagination();
}

/* =========================
PAGINATION
========================= */
function renderPagination(){
  const totalPages = Math.ceil(filteredAds.length / PER_PAGE);
  const pagination = document.getElementById("pagination");

  if(!pagination) return;

  if(totalPages <= 1){
    pagination.innerHTML = "";
    return;
  }

  let html = "";
  for(let i = 1; i <= totalPages; i++){
    html += `
      <button class="${i === currentPage ? "active" : ""}" onclick="goPage(${i})">
        ${i}
      </button>
    `;
  }
  pagination.innerHTML = html;
}

/* =========================
GO PAGE
========================= */
function goPage(page){
  currentPage = page;
  renderAds();
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

/* =========================
LATEST
========================= */
function renderLatest(){
  const box = document.getElementById("latestSidebar");
  if(!box) return;

  const latest = allAds.slice(0, 5);
  box.innerHTML = latest.map(ad=>`
    <div style="display:flex; gap:10px; margin-bottom:10px;">
      <img src="${ad.image}" style="width:60px; height:60px; object-fit:cover;">
      <div>
        ${ad.title}
      </div>
    </div>
  `).join("");
}

/* =========================
POPULAR
========================= */
function renderPopular(){
  const box = document.getElementById("popularSidebar");
  if(!box) return;

  const popular = allAds.slice(0, 5);
  box.innerHTML = popular.map(ad=>`
    <div style="display:flex; gap:10px; margin-bottom:10px;">
      <img src="${ad.image}" style="width:60px; height:60px; object-fit:cover;">
      <div>
        ${ad.title}
      </div>
    </div>
  `).join("");
}

/* =========================
DATE
========================= */
function formatDate(date){
  if(!date) return "";
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    dateStyle:"long",
    timeStyle:"short"
  });
}

/* =========================
WA
========================= */
function cleanWA(v){
  return String(v || "").replace(/\D/g,'');
}

/* =========================
SAFE
========================= */
function safe(v){
  return v || "";
}

/* =========================
STICKY BANNER
========================= */
function initStickyBanner(){
  const hero = document.getElementById("hero");
  const banner = document.getElementById("stickyBanner");

  if(!hero || !banner) return;

  window.addEventListener("scroll", ()=>{
    const rect = hero.getBoundingClientRect();
    if(rect.bottom < 0){
      banner.classList.add("show");
    }else{
      banner.classList.remove("show");
    }
  });
}

/* =========================
MOBILE ADS
========================= */
function initMobileAds(){
  if(window.innerWidth > 768) return;

  const mobileAds = document.getElementById("mobileAds");
  if(!mobileAds) return;

  const ads = document.querySelectorAll(".left-sidebar .ad300, .right-sidebar .ad300");
  ads.forEach(ad=>{
    mobileAds.appendChild(ad.cloneNode(true));
  });
}
window.addEventListener("load", initMobileAds);

/* =========================
AUTO LINK WEBSITE
========================= */
function makeLinks(text){
  return String(text || "").replace(
    /((https?:\/\/|www\.)[^\s]+)/gi,
    url=>{
      const href = url.startsWith("http") ? url : "https://" + url;
      return `<a href="${href}" target="_blank" rel="nofollow noopener">${url}</a>`;
    }
  );
}
