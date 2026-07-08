const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
let allAds = [];
let currentPage = 0;
const perPage = 10;

// Fungsi Bantu
function truncateText(text, max = 250) {
    return text && text.length > max ? text.substring(0, max) + "..." : text || "";
}

function timeAgo(dateStr) {
    if (!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
}

function openDetail(id) {
    window.location.href = `iklan-saya.html?id=${id}`;
}

// Geser Kategori
document.querySelector('.cat-arrow.left')?.addEventListener('click', () => {
    document.getElementById('categoryScroll').scrollBy({ left: -110, behavior: 'smooth' });
});
document.querySelector('.cat-arrow.right')?.addEventListener('click', () => {
    document.getElementById('categoryScroll').scrollBy({ left: 110, behavior: 'smooth' });
});

// Ambil Data Iklan
async function loadAllAds() {
    const container = document.getElementById('adsContainer');
    container.innerHTML = "<p style='text-align:center; padding:2rem; color:#888;'>Memuat iklan...</p>";

    try {
        const res = await fetch(API_URL, { method: "GET", redirect: "follow" });
        allAds = await res.json();
        allAds.sort((a, b) => new Date(b.date) - new Date(a.date)); // Urut terbaru di atas

        document.getElementById('totalAds').textContent = allAds.length;
        currentPage = 0;
        renderAds();
    } catch (err) {
        container.innerHTML = "<p style='text-align:center; padding:2rem; color:red;'>Gagal memuat data. Coba muat ulang.</p>";
        console.error(err);
    }
}

// Tampilkan Iklan
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
                <div class="ad-img" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
                <div class="ad-info">
                    <h4 class="ad-title">${ad.title || "Tanpa Judul"}</h4>
                    <p class="ad-desc">${truncateText(ad.description)}</p>
                    <p class="ad-meta">📍 ${ad.location || "-"} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0}</p>
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

// Tombol Muat Lebih Banyak
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

// Jalankan
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.addEventListener('load', loadAllAds);
}
