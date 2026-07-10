// === KONFIGURASI UTAMA ===
const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const GEMINI_API_KEY = "AIzaSyCn80HehU6Jw5G3p7n_QdMoHiMDENY4t_U";
const GEMINI_MODEL = "gemini-1.5-flash";

let allAds = [];
let filteredAds = [];
let currentPage = 0;
const perPage = 10;

// === FUNGSI BANTU ===
function truncateText(text, max = 250) {
    return text && text.length > max ? text.substring(0, max) + '...' : text || '';
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Baru saja';
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return `${Math.floor(diff / 1440)} hari lalu`;
}

function openDetail(id) {
    window.location.href = `iklan-saya.html?id=${id}`;
}

// === AMBIL & TAMPILKAN IKLAN ===
async function loadAllAds() {
    const container = document.getElementById('adsContainer');
    if (!container) return;
    container.innerHTML = "<p style='text-align:center; padding:3rem; color:#888;'>Memuat iklan...</p>";
    try {
        const res = await fetch(API_URL, { method: 'GET', redirect: 'follow' });
        allAds = await res.json();
        allAds.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredAds = [...allAds];
        document.getElementById('totalAds').textContent = allAds.length;
        currentPage = 0;
        renderAds();
    } catch {
        container.innerHTML = "<p style='text-align:center; padding:3rem; color:red;'>Gagal memuat data.</p>";
    }
}

function renderAds() {
    const container = document.getElementById('adsContainer');
    const start = currentPage * perPage;
    const end = start + perPage;
    const pageAds = filteredAds.slice(start, end);
    if (pageAds.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:3rem; color:#888;'>Tidak ada iklan</p>";
        document.getElementById('loadMoreBtn').style.display = 'none';
        return;
    }
    let html = '';
    pageAds.forEach((ad, idx) => {
        html += `
        <div class="ad-item-row" onclick="openDetail('${ad.id}')">
            <div class="ad-img" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
            <div class="ad-info">
                <h4 class="ad-title">${ad.title}</h4>
                <p class="ad-desc">${truncateText(ad.description)}</p>
                <p class="ad-meta">📍 ${ad.location} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0}</p>
                <span class="read-more">Baca selengkapnya →</span>
            </div>
        </div>`;
    });
    container.innerHTML = html;
    document.getElementById('loadMoreBtn').style.display = end < filteredAds.length ? 'block' : 'none';
}

// === JALANKAN FITUR HALAMAN BERANDA ===
window.addEventListener('load', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadAllAds();
        document.getElementById('searchInput')?.addEventListener('input', e => {
            const k = e.target.value.trim().toLowerCase();
            filteredAds = allAds.filter(a => a.title.toLowerCase().includes(k) || a.description.toLowerCase().includes(k));
            currentPage = 0;
            renderAds();
        });
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => { currentPage++; renderAds(); });
    }

    // === HALAMAN DETAIL IKLAN ===
    if (window.location.pathname.includes('iklan-saya.html')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            fetch(`${API_URL}?action=detail&id=${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const ad = data.ad;
                    document.getElementById('detailImg').style.backgroundImage = `url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')`;
                    document.getElementById('detailTitle').textContent = ad.title;
                    document.getElementById('detailCat').textContent = ad.category;
                    document.getElementById('detailLoc').textContent = ad.location;
                    document.getElementById('detailViews').textContent = ad.views || 0;
                    document.getElementById('detailDesc').textContent = ad.description;
                    document.getElementById('btnWa').onclick = () => window.open(`https://wa.me/${ad.whatsapp}`, '_blank');
                }
            });
        }
    }

    // === HALAMAN PASANG IKLAN + ASISTEN DOLA ===
    if (window.location.pathname.includes('pasang.html')) {
        let imageBase64 = '';
        document.getElementById('imageInput')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = 200; c.height = 150;
                    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 200, 150);
                    imageBase64 = c.toDataURL('image/webp', 0.6);
                    document.getElementById('previewImage').src = imageBase64;
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });

        // === ASISTEN DOLA - MUNCUL DI SEMUA UKURAN LAYAR ===
        const dolaCSS = document.createElement('style');
        dolaCSS.textContent = `
            .dola-box{position:fixed;bottom:20px;right:20px;z-index:9999}
            .dola-btn{width:55px;height:55px;border-radius:50%;background:#2563eb;color:white;border:none;font-size:22px;cursor:pointer;box-shadow:0 2px 8px #0003}
            .dola-window{display:none;position:absolute;bottom:70px;right:0;width:320px;height:480px;background:#fff;border-radius:16px;box-shadow:0 4px 16px #0003;overflow:hidden;border:1px solid #eee}
            .dola-head{background:#2563eb;color:white;padding:12px;display:flex;justify-content:space-between;align-items:center}
            .dola-body{height:360px;overflow-y:auto;padding:12px;background:#f8fafc;font-size:14px;line-height:1.6}
            .msg-dola{background:#e2e8f0;padding:8px 12px;border-radius:12px 12px 12px 4px;margin:6px 0;max-width:92%;white-space:pre-wrap}
            .msg-user{background:#dbeafe;padding:8px 12px;border-radius:12px 12px 4px 12px;margin:6px 0 6px auto;max-width:92%;text-align:right}
            .dola-input{display:flex;gap:6px;padding:10px;border-top:1px solid #eee}
            .dola-input input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:20px}
            .dola-input button{background:#2563eb;color:white;border:none;padding:8px 14px;border-radius:20px}
        `;
        document.head.appendChild(dolaCSS);

        const dolaHTML = `
        <div class="dola-box">
            <button class="dola-btn" id="dolaOpen">💬</button>
            <div class="dola-window" id="dolaWin">
                <div class="dola-head"><span>🤝 Dola Pembuat Iklan</span><button id="dolaClose" style="background:none;color:white;border:none;font-size:20px">&times;</button></div>
                <div class="dola-body" id="dolaBody"><div class="msg-dola">Halo! Saya Dola 😊 Tulis saja kebutuhan iklanmu, nanti saya buatkan rapi.<br>Contoh: Jual motor Vario 2020, mulus, harga 17jt, WA 08123456789, Surabaya</div></div>
                <div class="dola-input"><input type="text" id="dolaInput" placeholder="Ketik pesan..."><button id="dolaSend">Kirim</button></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', dolaHTML);

        const dolaAturan = `Kamu adalah Dola, asisten khusus pembuat iklan untuk Rewang Iklan. Jawab selalu sesuai format:
📌 JUDUL
📝 ISI
💰 HARGA
📞 KONTAK & LOKASI
🔗 https://rewangiklan.my.id

Jika ditanya "Nama kamu siapa?", jawab:
"Nama saya Dola 😊 Saya asisten pembuat iklan untuk situs Rewang Iklan. Saya siap bantu buatkan teks iklan yang rapi dan siap pakai."

Jangan jawab di luar tugas ini.`;

        const dolaOpen = document.getElementById('dolaOpen');
        const dolaClose = document.getElementById('dolaClose');
        const dolaWin = document.getElementById('dolaWin');
        const dolaBody = document.getElementById('dolaBody');
        const dolaInput = document.getElementById('dolaInput');

        dolaOpen.onclick = () => dolaWin.style.display = 'block';
        dolaClose.onclick = () => dolaWin.style.display = 'none';

        async function tanyaAI(teks) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `${dolaAturan}\n\nPertanyaan: ${teks}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1200 } })
                });
                const data = await res.json();
                return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mohon maaf, sedang ada gangguan.";
            } catch {
                return "Gagal terhubung, coba lagi sebentar.";
            }
        }

        async function prosesDola() {
            const teks = dolaInput.value.trim();
            if (!teks) return;
            dolaBody.innerHTML += `<div class="msg-user">${teks}</div>`;
            dolaInput.value = '';
            dolaBody.scrollTop = dolaBody.scrollHeight;
            dolaBody.innerHTML += `<div class="msg-dola">⏳ Sedang disusun...</div>`;
            dolaBody.scrollTop = dolaBody.scrollHeight;
            const hasil = await tanyaAI(teks);
            dolaBody.lastChild.outerHTML = `<div class="msg-dola">${hasil}</div>`;
            dolaBody.scrollTop = dolaBody.scrollHeight;
        }

        document.getElementById('dolaSend').onclick = prosesDola;
        dolaInput.addEventListener('keydown', e => e.key === 'Enter' && prosesDola());

        // === FORM KIRIM IKLAN ===
        document.getElementById('adForm')?.addEventListener('submit', async e => {
            e.preventDefault();
            const status = document.getElementById('statusBox');
            status.innerHTML = 'Mengirim...';
            status.style.display = 'block';
            const data = {
                title: document.getElementById('title').value.trim(),
                category: document.getElementById('category').value,
                location: document.getElementById('location').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.replace(/\D/g, ''),
                description: document.getElementById('description').value.trim(),
                image: imageBase64,
                date: new Date().toISOString()
            };
            try {
                const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
                const hasil = await res.json();
                if (hasil.success) {
                    status.innerHTML = `✅ Berhasil!<br>ID: ${hasil.id}<br>Kode Kelola: ${hasil.secret}`;
                    document.getElementById('adForm').reset();
                    document.getElementById('previewImage').src = '';
                    imageBase64 = '';
                } else {
                    status.innerHTML = `❌ ${hasil.error}`;
                }
            } catch {
                status.innerHTML = '❌ Gagal terkirim';
            }
        });
    }
});
