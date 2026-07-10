const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const GEMINI_API_KEY = "AIzaSyCn80HehU6Jw5G3p7n_QdMoHiMDENY4t_U";
const GEMINI_MODEL = "gemini-1.5-flash";

let allAds = [];
let filteredAds = [];
let currentPage = 0;
const perPage = 10;

// === GULIRAN DESKTOP ===
const contentArea = document.getElementById('mainContent');
if (contentArea) {
    const scrollStep = 220;
    document.getElementById('scrollUp')?.addEventListener('click', () => {
        const currentTop = parseInt(contentArea.style.top) || 0;
        contentArea.style.top = Math.min(currentTop + scrollStep, 0) + 'px';
    });
    document.getElementById('scrollDown')?.addEventListener('click', () => {
        const currentTop = parseInt(contentArea.style.top) || 0;
        const maxScroll = contentArea.scrollHeight - contentArea.clientHeight;
        contentArea.style.top = Math.max(currentTop - scrollStep, -maxScroll) + 'px';
    });
}

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

// === AMBIL DATA IKLAN ===
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
    } catch (err) {
        container.innerHTML = "<p style='text-align:center; padding:3rem; color:red;'>Gagal memuat data. Coba muat ulang.</p>";
        console.error(err);
    }
}

// === TAMPILKAN IKLAN ===
function renderAds() {
    const container = document.getElementById('adsContainer');
    const start = currentPage * perPage;
    const end = start + perPage;
    const pageAds = filteredAds.slice(start, end);

    if (pageAds.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:3rem; color:#888;'>Tidak ada iklan yang sesuai</p>";
        document.getElementById('loadMoreBtn').style.display = 'none';
        return;
    }

    let html = '';
    pageAds.forEach((ad, idx) => {
        const pos = start + idx + 1;
        html += `
            <div class="ad-item-row" onclick="openDetail('${ad.id}')">
                <div class="ad-img" style="background-image:url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')"></div>
                <div class="ad-info">
                    <h4 class="ad-title">${ad.title}</h4>
                    <p class="ad-desc">${truncateText(ad.description)}</p>
                    <p class="ad-meta">📍 ${ad.location} • 📅 ${timeAgo(ad.date)} • 👁️ ${ad.views || 0}</p>
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

    document.getElementById('loadMoreBtn').style.display = end < filteredAds.length ? 'block' : 'none';
}

// === FITUR PENCARIAN ===
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.trim().toLowerCase();
        filteredAds = allAds.filter(ad =>
            ad.title.toLowerCase().includes(keyword) ||
            ad.description.toLowerCase().includes(keyword)
        );
        currentPage = 0;
        renderAds();
    });
}

// === FILTER KATEGORI ===
document.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
        item.classList.add('active');
        const cat = item.dataset.cat;
        filteredAds = cat === 'Semua' ? [...allAds] : allAds.filter(ad => ad.category === cat);
        currentPage = 0;
        renderAds();
    });
});

// === TOMBOL MUAT LEBIH BANYAK ===
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    currentPage++;
    renderAds();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

// === JALANKAN HALAMAN BERANDA ===
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.addEventListener('load', loadAllAds);
}

// === HALAMAN DETAIL IKLAN ===
if (window.location.pathname.includes('iklan-saya.html')) {
    let currentId = '';
    async function loadDetail() {
        const params = new URLSearchParams(window.location.search);
        currentId = params.get('id');
        if (!currentId) {
            document.querySelector('.detail-content').innerHTML = "<p style='text-align:center; padding:2rem;'>Iklan tidak ditemukan</p>";
            return;
        }
        try {
            const res = await fetch(`${API_URL}?action=detail&id=${currentId}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const ad = data.ad;
            document.getElementById('detailImg').style.backgroundImage = `url('${ad.image || 'https://rewangiklan.my.id/image/no-image.webp'}')`;
            document.getElementById('detailTitle').textContent = ad.title;
            document.getElementById('detailCat').textContent = ad.category;
            document.getElementById('detailLoc').textContent = ad.location;
            document.getElementById('detailViews').textContent = ad.views || 0;
            document.getElementById('detailDesc').textContent = ad.description;
            document.getElementById('btnWa').onclick = () => window.open(`https://wa.me/${ad.whatsapp}`, '_blank');
            document.getElementById('btnManage').onclick = () => window.location.href = `pasang.html?mode=edit&id=${currentId}`;
        } catch (err) {
            document.querySelector('.detail-content').innerHTML = `<p style='color:red; text-align:center; padding:2rem;'>${err.message}</p>`;
        }
    }
    window.addEventListener('load', loadDetail);

    // Notifikasi halaman detail
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
        .notif-kelola {
            background: #ecfccb; border-left: 5px solid #84cc16;
            padding: 15px; margin: 15px 0; border-radius: 8px;
            font-size: 15px; line-height: 1.6;
        }
    `;
    document.head.appendChild(notifStyle);
    const notifHTML = `
        <div class="notif-kelola">
            ✅ <b>Iklan Anda sudah tayang!</b><br>
            Bisa diedit atau dihapus kapan saja dengan Kode Kelola yang didapat saat pasang iklan.<br><br>
            Semoga laris manis di <b>Rewang Iklan</b> 🤞<br>
            Bagikan: <a href="https://rewangiklan.my.id" target="_blank">rewangiklan.my.id</a>
        </div>
    `;
    const tempatDetail = document.querySelector('.detail-content');
    if (tempatDetail) tempatDetail.insertAdjacentHTML('afterbegin', notifHTML);
}

// === HALAMAN PASANG / EDIT IKLAN ===
if (window.location.pathname.includes('pasang.html')) {
    let imageBase64 = '';
    let currentEditId = '';

    const desc = document.getElementById('description');
    const count = document.getElementById('charCount');
    desc?.addEventListener('input', () => count.textContent = desc.value.length + ' / 500');

    document.getElementById('imageInput')?.addEventListener('change', handleImage);
    async function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const webp = await convertToWebP(file);
        imageBase64 = webp;
        document.getElementById('previewImage').src = webp;
    }

    function convertToWebP(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 200, 150);
                    resolve(canvas.toDataURL('image/webp', 0.6));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function initForm() {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        currentEditId = params.get('id');

        if (mode === 'edit' && currentEditId) {
            document.getElementById('formTitle').textContent = 'Edit / Hapus Iklan';
            document.getElementById('btnKirim').style.display = 'none';
            document.getElementById('btnEdit').style.display = 'block';
            document.getElementById('btnHapus').style.display = 'block';
            document.getElementById('secretGroup').style.display = 'block';

            try {
                const res = await fetch(`${API_URL}?action=detail&id=${currentEditId}`);
                const data = await res.json();
                if (data.success) {
                    const ad = data.ad;
                    document.getElementById('title').value = ad.title;
                    document.getElementById('category').value = ad.category;
                    document.getElementById('location').value = ad.location;
                    document.getElementById('whatsapp').value = ad.whatsapp;
                    document.getElementById('description').value = ad.description;
                    document.getElementById('previewImage').src = ad.image || '';
                    imageBase64 = ad.image || '';
                    count.textContent = ad.description.length + ' / 500';
                }
            } catch (err) {
                document.getElementById('statusBox').innerHTML = `<div class="status-error">${err.message}</div>`;
                document.getElementById('statusBox').style.display = 'block';
            }
        }
    }

    document.getElementById('adForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const status = document.getElementById('statusBox');
        status.innerHTML = 'Mengirim iklan...';
        status.className = 'status-box';
        status.style.display = 'block';

        const payload = {
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            location: document.getElementById('location').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.replace(/\D/g, ''),
            description: document.getElementById('description').value.trim(),
            image: imageBase64,
            date: new Date().toISOString()
        };

        try {
            const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await res.json();
            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = `
                    ✅ Iklan berhasil dipasang!<br><br>
                    <b>ID Iklan:</b><br><div class="secret-code">${result.id}</div><br>
                    <b>Kode Kelola:</b><br><div class="secret-code">${result.secret}</div><br>
                    Simpan kode ini untuk edit/hapus nanti.
                `;
                document.getElementById('adForm').reset();
                document.getElementById('previewImage').src = '';
                count.textContent = '0 / 500';
                imageBase64 = '';
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal mengirim iklan. Coba lagi.';
        }
    });

    document.getElementById('btnEdit')?.addEventListener('click', async () => {
        const secret = document.getElementById('secretCode').value.trim();
        if (!secret) return alert('Masukkan Kode Kelola!');
        const status = document.getElementById('statusBox');
        status.innerHTML = 'Memperbarui iklan...';
        status.className = 'status-box';
        status.style.display = 'block';

        try {
            const res = await fetch(`${API_URL}?action=update`, {
                method: 'POST',
                body: JSON.stringify({
                    id: currentEditId, secret,
                    title: document.getElementById('title').value.trim(),
                    category: document.getElementById('category').value,
                    location: document.getElementById('location').value.trim(),
                    description: document.getElementById('description').value.trim()
                })
            });
            const result = await res.json();
            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = '✅ Iklan berhasil diperbarui!';
                setTimeout(() => window.location.href = `iklan-saya.html?id=${currentEditId}`, 1500);
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal memperbarui iklan.';
        }
    });

    document.getElementById('btnHapus')?.addEventListener('click', async () => {
        const secret = document.getElementById('secretCode').value.trim();
        if (!secret || !confirm('Yakin hapus iklan? Tidak bisa dikembalikan.')) return;
        const status = document.getElementById('statusBox');
        status.innerHTML = 'Menghapus iklan...';
        status.className = 'status-box';
        status.style.display = 'block';

        try {
            const res = await fetch(`${API_URL}?action=delete`, {
                method: 'POST',
                body: JSON.stringify({ id: currentEditId, secret })
            });
            const result = await res.json();
            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = '✅ Iklan berhasil dihapus!';
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal menghapus iklan.';
        }
    });

    window.addEventListener('load', initForm);

    // === ASISTEN DOLA - MUNCUL DI SEMUA LAYAR ===
    const dolaStyle = document.createElement('style');
    dolaStyle.textContent = `
        .dola-chat-box {position:fixed; bottom:20px; right:20px; z-index:9999; font-family:Arial,sans-serif;}
        .dola-btn-buka {background:#2563eb; color:white; border:none; width:55px; height:55px; border-radius:50%; font-size:22px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.2);}
        .dola-konten {display:none; position:absolute; bottom:70px; right:0; width:320px; height:480px; background:#fff; border-radius:16px; box-shadow:0 5px 20px rgba(0,0,0,0.25); overflow:hidden; border:1px solid #e5e7eb;}
        .dola-header {background:#2563eb; color:white; padding:12px; display:flex; justify-content:space-between; align-items:center;}
        .dola-pesan {height:360px; overflow-y:auto; padding:12px; background:#f9fafb; font-size:14px; line-height:1.6;}
        .pesan-dola {background:#e2e8f0; padding:10px 14px; border-radius:14px 14px 14px 4px; margin:8px 0; max-width:90%; white-space:pre-wrap;}
        .pesan-user {background:#dbeafe; padding:10px 14px; border-radius:14px 14px 4px 14px; margin:8px 0; max-width:90%; margin-left:auto; text-align:right;}
        .dola-input {display:flex; gap:8px; padding:10px; border-top:1px solid #eee;}
        .dola-input input {flex:1; padding:10px 14px; border:1px solid #ddd; border-radius:20px; font-size:14px;}
        .dola-input button {background:#2563eb; color:white; border:none; padding:10px 16px; border-radius:20px; font-weight:500;}
    `;
    document.head.appendChild(dolaStyle);

    const dolaHTML = `
        <div class="dola-chat-box">
            <button class="dola-btn-buka" id="bukaDola">💬</button>
            <div class="dola-konten" id="kontenDola">
                <div class="dola-header">
                    <span>🤝 Dola - Buat Iklan Otomatis</span>
                    <button style="background:none; color:white; border:none; font-size:20px;" id="tutupDola">&times;</button>
                </div>
                <div class="dola-pesan" id="kotakPesanDola">
                    <div class="pesan-dola">
                        Halo! Saya Dola 😊 Bisa buatkan teks iklan rapi dan menarik.
                        Contoh: "Jual sepeda motor Honda Vario 2022, kondisi mulus, harga Rp18 juta, WA 08123456789, Surabaya"
                    </div>
                </div>
                <div class="dola-input">
                    <input type="text" id="teksPesanDola" placeholder="Tulis permintaan...">
                    <button id="kirimDola">Kirim</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dolaHTML);

    const aturanDola = `
Kamu adalah Dola, asisten pembuat iklan Rewang Iklan.
Jawab sesuai format ini:

📌 JUDUL
📝 ISI
💰 HARGA
📞 KONTAK & LOKASI

Jika ditanya "Nama kamu siapa?", jawab:
"Nama saya Dola 😊 Saya asisten pembuat iklan untuk situs Rewang Iklan. Saya siap bantu buatkan teks iklan yang rapi dan siap pakai."
`;

    const btnBuka = document.getElementById('bukaDola');
    const btnTutup = document.getElementById('tutupDola');
    const kotakPesan = document.getElementById('kotakPesanDola');
    const inputPesan = document.getElementById('teksPesanDola');
    const kontenDola = document.getElementById('kontenDola');

    btnBuka.addEventListener('click', () => kontenDola.style.display = 'block');
    btnTutup.addEventListener('click', () => kontenDola.style.display = 'none');

    async function tanyaGemini(teks) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: `${aturanDola}\n\nPertanyaan: ${teks}` }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mohon maaf, sedang ada gangguan.";
        } catch (err) {
            console.error(err);
            if (err.message.includes("API key")) return "❌ Kunci API belum aktif atau salah.";
            if (err.message.includes("quota")) return "⏳ Batas pemakaian habis, coba besok.";
            return "🚫 Gangguan jaringan, coba lagi sebentar.";
        }
    }

    async function prosesDola() {
        const teks = inputPesan.value.trim();
        if (!teks) return;
        kotakPesan.innerHTML += `<div class="pesan-user">${teks}</div>`;
        inputPesan.value = '';
        kotakPesan.scrollTop = kotakPesan.scrollHeight;
        kotakPesan.innerHTML += `<div class="pesan-dola">⏳ Sedang diproses...</div>`;
        kotakPesan.scrollTop = kotakPesan.scrollHeight;
        const hasil = await tanyaGemini(teks);
        kotakPesan.lastChild.innerHTML = hasil;
        kotakPesan.scrollTop = kotakPesan.scrollHeight;
    }

    document.getElementById('kirimDola').addEventListener('click', prosesDola);
    inputPesan.addEventListener('keydown', e => e.key === 'Enter' && prosesDola());
}

// === PWA INSTAL ===
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwaInstallBtn')?.style.display = 'block';
});
document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(outcome === 'accepted' ? 'Terpasang' : 'Dibatalkan');
    deferredPrompt = null;
});
window.addEventListener('appinstalled', () => {
    document.getElementById('pwaInstallBtn')?.style.display = 'none';
});

// === NOTIFIKASI DESKTOP ===
window.addEventListener('load', () => {
    if (window.innerWidth >= 768) {
        const notifStyle = document.createElement('style');
        notifStyle.textContent = `
            .notif-overlay {position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:99999; display:flex; align-items:center; justify-content:center;}
            .notif-box {background:#fff; border-radius:16px; width:90%; max-width:400px; padding:32px; text-align:center; box-shadow:0 8px 24px rgba(0,0,0,0.2);}
            .notif-box h3 {font-size:1.3rem; margin-bottom:12px; color:#222;}
            .notif-box p {font-size:1rem; color:#555; margin-bottom:24px; line-height:1.5;}
            .btn-paham {background:#2563eb; color:white; border:none; padding:10px 24px; border-radius:20px; font-size:1rem; cursor:pointer;}
            .btn-paham:hover {background:#1d4ed8;}
        `;
        document.head.appendChild(notifStyle);
        const notif = document.createElement('div');
        notif.className = 'notif-overlay';
        notif.innerHTML = `
            <div class="notif-box">
                <h3>Lebih Nyaman di HP</h3>
                <p>Situs ini dioptimalkan untuk layar ponsel agar lebih mudah digunakan.</p>
                <button class="btn-paham">Siap, Mengerti</button>
            </div>
        `;
        document.body.appendChild(notif);
        notif.querySelector('.btn-paham').addEventListener('click', () => notif.remove());
        notif.addEventListener('click', e => e.target === notif && notif.remove());
    }
});
