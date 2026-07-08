const API_URL = "https://script.google.com/macros/s/AKfycbx-BaNk5IxrhHHp6wSJlBM9OI4t2y1uAjwUlLFAW8whVcI2xtvlj3D8zx3SkN52Fc15Eg/exec";

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

// Potong teks maks 250 karakter
function truncateText(text, max = 250) {
    return text.length > max ? text.substring(0, max) + "..." : text;
}

// Format waktu
function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
}

// Muat daftar iklan untuk index.html
async function loadAds() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const container = document.getElementById('adsContainer');
        if (!data || data.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding:2rem; color:#888;'>Belum ada iklan aktif</p>";
            return;
        }
        container.innerHTML = data.map(ad => `
            <div class="ad-item-row" onclick="window.location.href='iklan-saya.html?id=${ad.id}'">
                <div class="ad-img" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
                <div class="ad-info">
                    <h4 class="ad-title">${ad.title}</h4>
                    <p class="ad-desc">${truncateText(ad.description)}</p>
                    <p class="ad-meta">📍 ${ad.location} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0} kali</p>
                    <span class="read-more">Baca selengkapnya →</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById('adsContainer').innerHTML = "<p style='text-align:center; padding:2rem; color:red;'>Gagal memuat iklan</p>";
    }
}

// Jalankan jika di halaman index
if(window.location.pathname.includes('index.html') || window.location.pathname === '/'){
    window.onload = loadAds;
}
