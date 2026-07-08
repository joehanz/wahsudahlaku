const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
let allAds = [];
let currentPage = 0;
const perPage = 10;

// Scroll desktop
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

// Geser kategori
const catScroll = document.getElementById('categoryScroll');
document.querySelector('.cat-arrow.left').addEventListener('click', () => catScroll.scrollBy({left: -120, behavior: 'smooth'}));
document.querySelector('.cat-arrow.right').addEventListener('click', () => catScroll.scrollBy({left: 120, behavior: 'smooth'}));

// Potong teks
function truncateText(text, max = 250) {
    return text.length > max ? text.substring(0, max) + "..." : text;
}

// Waktu relatif
function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
}

// Buka halaman detail
function openDetail(id) {
    window.location.href = `iklan-saya.html?id=${id}`;
}

// Muat semua iklan
async function loadAllAds() {
    try {
        const res = await fetch(API_URL);
        allAds = await res.json();
        document.getElementById('totalAds').textContent = allAds.length;
        renderAds();
    } catch (err) {
        document.getElementById('adsContainer').innerHTML = "<p style='text-align:center; padding:2rem; color:red;'>Gagal memuat iklan</p>";
    }
}

// Tampilkan iklan per halaman + sisip banner setiap 5 iklan
function renderAds() {
    const start = currentPage * perPage;
    const end = start + perPage;
    const pageAds = allAds.slice(start, end);
    const container = document.getElementById('adsContainer');

    let html = "";
    pageAds.forEach((ad, idx) => {
        const pos = start + idx + 1;
        html += `
            <div class="ad-item-row" onclick="openDetail('${ad.id}')">
                <div class="ad-img" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
                <div class="ad-info">
                    <h4 class="ad-title">${ad.title}</h4>
                    <p class="ad-desc">${truncateText(ad.description)}</p>
                    <p class="ad-meta">📍 ${ad.location} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0} kali</p>
                    <span class="read-more">Baca selengkapnya →</span>
                </div>
            </div>
        `;
        if (pos % 5 === 0) {
            html += `<div class="ad-banner-box">BANNER IKLAN 300×300</div>`;
        }
    });

    if (currentPage === 0) container.innerHTML = html;
    else container.innerHTML += html;

    document.getElementById('loadMoreBox').style.display = end < allAds.length ? "block" : "none";
}

// Tombol muat lebih banyak
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    currentPage++;
    renderAds();
});

// Layer Dola
document.getElementById('dolaBtn')?.addEventListener('click', () => {
    document.getElementById('dolaLayer').classList.add('active');
});
document.getElementById('dolaClose')?.addEventListener('click', () => {
    document.getElementById('dolaLayer').classList.remove('active');
});

// Jalankan saat halaman dimuat
if(window.location.pathname.includes('index.html') || window.location.pathname === '/'){
    window.onload = loadAllAds;
}
