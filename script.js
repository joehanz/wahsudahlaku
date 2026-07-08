const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
let allAds = [];
let currentPage = 0;
const perPage = 10;
const CACHE_KEY = "rewang_ads_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 menit sekali ambil data baru

// === BANTUAN SCROLL ===
const content = document.getElementById('mainContent');
const scrollStep = 220;
if(document.getElementById('scrollUpBtn')){
    document.getElementById('scrollUpBtn').addEventListener('click', () => {
        let current = parseInt(content.style.top) || 0;
        content.style.top = Math.min(current + scrollStep, 0) + "px";
    });
    document.getElementById('scrollDownBtn').addEventListener('click', () => {
        let current = parseInt(content.style.top) || 0;
        let maxScroll = content.scrollHeight - content.clientHeight;
        content.style.top = Math.max(current - scrollStep, -maxScroll) + "px";
    });
}

// === GESER KATEGORI ===
const catScroll = document.getElementById('categoryScroll');
document.querySelector('.cat-arrow.left')?.addEventListener('click', () => catScroll.scrollBy({left: -120, behavior: 'smooth'}));
document.querySelector('.cat-arrow.right')?.addEventListener('click', () => catScroll.scrollBy({left: 120, behavior: 'smooth'}));

// === FUNGSI BANTU ===
function truncateText(text, max = 250) {
    return text?.length > max ? text.substring(0, max) + "..." : text || "";
}

function timeAgo(dateStr) {
    if(!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
}

function openDetail(id) {
    window.location.href = `iklan-saya.html?id=${id}`;
}

// === AMBIL DATA DENGAN CACHE ===
async function loadAllAds() {
    const container = document.getElementById('adsContainer');
    container.innerHTML = "<p style='text-align:center; padding:2rem; color:#888;'>Memuat iklan...</p>";

    // Cek dulu cache lokal
    const cache = localStorage.getItem(CACHE_KEY);
    const cacheData = cache ? JSON.parse(cache) : null;
    const now = Date.now();

    if (cacheData && (now - cacheData.timestamp) < CACHE_TIME) {
        allAds = cacheData.data;
        renderAds();
        document.getElementById('totalAds').textContent = allAds.length;
        return;
    }

    // Kalau kadaluarsa atau belum ada, ambil baru
    try {
        const res = await fetch(API_URL, {cache: "no-cache"});
        allAds = await res.json();
        // Simpan ke cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: now,
            data: allAds
        }));
        document.getElementById('totalAds').textContent = allAds.length;
        renderAds();
    } catch (err) {
        container.innerHTML = "<p style='text-align:center; padding:2rem; color:red;'>Gagal memuat iklan, coba muat ulang</p>";
        console.error(err);
    }
}

// === TAMPILKAN IKLAN ===
function renderAds() {
    const start = currentPage * perPage;
    const end = start + perPage;
    const pageAds = allAds.slice(start, end);
    const container = document.getElementById('adsContainer');

    if (pageAds.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:2rem; color:#888;'>Belum ada iklan</p>";
        document.getElementById('loadMoreBox').style.display = "none";
        return;
    }

    let html = "";
    pageAds.forEach((ad, idx) => {
        const pos = start + idx + 1;
        html += `
            <div class="ad-item-row" onclick="openDetail('${ad.id}')">
                <div class="ad-img" loading="lazy" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
                <div class="ad-info">
                    <h4 class="ad-title">${ad.title || "Tanpa Judul"}</h4>
                    <p class="ad-desc">${truncateText(ad.description)}</p>
                    <p class="ad-meta">📍 ${ad.location || "-"} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0} kali</p>
                    <span class="read-more">Baca selengkapnya →</span>
                </div>
            </div>
        `;
        // Sisip banner setiap 5 iklan
        if (pos % 5 === 0) {
            html += `<div class="ad-banner-box">BANNER IKLAN 300×300</div>`;
        }
    });

    if (currentPage === 0) container.innerHTML = html;
    else container.innerHTML += html;

    document.getElementById('loadMoreBox').style.display = end < allAds.length ? "block" : "none";
}

// === TOMBOL MUAT LEBIH BANYAK ===
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    currentPage++;
    renderAds();
    window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
});

// === LAYER DOLA ===
document.getElementById('dolaBtn')?.addEventListener('click', () => {
    document.getElementById('dolaLayer').classList.add('active');
});
document.getElementById('dolaClose')?.addEventListener('click', () => {
    document.getElementById('dolaLayer').classList.remove('active');
});

// === JALANKAN ===
if(window.location.pathname.includes('index.html') || window.location.pathname === '/'){
    window.addEventListener('load', loadAllAds);
}
