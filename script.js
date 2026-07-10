const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
let allAds = [];
let filteredAds = [];
let currentPage = 0;
const perPage = 10;

// === PANAH GULIR DESKTOP ===
const contentArea = document.getElementById('mainContent');
if (window.innerWidth >= 768 && contentArea) {
    const scrollStep = 220;
    document.getElementById('scrollUp').addEventListener('click', () => {
        let currentTop = parseInt(contentArea.style.top) || 0;
        contentArea.style.top = Math.min(currentTop + scrollStep, 0) + 'px';
    });
    document.getElementById('scrollDown').addEventListener('click', () => {
        let currentTop = parseInt(contentArea.style.top) || 0;
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
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
}

function openDetail(id) {
    window.location.href = `iklan-saya.html?id=${id}`;
}

// === AMBIL DATA DARI API ===
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
        document.getElementById('loadMoreBox').style.display = 'none';
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

    document.getElementById('loadMoreBox').style.display = end < filteredAds.length ? 'block' : 'none';
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
        if (cat === 'Semua') {
            filteredAds = [...allAds];
        } else {
            filteredAds = allAds.filter(ad => ad.category === cat);
        }
        currentPage = 0;
        renderAds();
    });
});

// === TOMBOL MUAT LEBIH BANYAK ===
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    currentPage++;
    renderAds();
    if (window.innerWidth < 768) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

// === JALANKAN SAAT HALAMAN BERANDA DIBUKA ===
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.addEventListener('load', loadAllAds);
}

// === FUNGSI UNTUK HALAMAN DETAIL ===
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
            document.getElementById('detailViews').textContent = ad.views;
            document.getElementById('detailDesc').textContent = ad.description;
            document.getElementById('btnWa').onclick = () => window.open(`https://wa.me/${ad.whatsapp}`, '_blank');
            document.getElementById('btnManage').onclick = () => {
                window.location.href = `pasang.html?mode=edit&id=${currentId}`;
            };
        } catch (err) {
            document.querySelector('.detail-content').innerHTML = `<p style='color:red; text-align:center; padding:2rem;'>${err.message}</p>`;
        }
    }
    window.onload = loadDetail;
}

// === FUNGSI UNTUK HALAMAN PASANG ===
if (window.location.pathname.includes('pasang.html')) {
    let imageBase64 = '';
    let currentEditId = '';

    // Hitung karakter deskripsi
    const desc = document.getElementById('description');
    const count = document.getElementById('charCount');
    desc?.addEventListener('input', () => {
        count.textContent = desc.value.length + ' / 500';
    });

    // Konversi & tampilkan gambar
    document.getElementById('imageInput')?.addEventListener('change', handleImage);
    async function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const webp = await convertToWebP(file);
        imageBase64 = webp;
        document.getElementById('previewImage').src = webp;
    }

    function convertToWebP(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 200, 150);
                    resolve(canvas.toDataURL('image/webp', 0.60));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Cek mode: pasang baru atau edit
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

    // Kirim iklan baru
    document.getElementById('adForm')?.addEventListener('submit', async (e) => {
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
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = `
                    ✅ Iklan berhasil dipasang!<br><br>
                    <b>ID Iklan:</b><br>
                    <div class="secret-code">${result.id}</div><br>
                    <b>Kode Kelola:</b><br>
                    <div class="secret-code">${result.secret_code}</div><br>
                    Simpan kode ini baik-baik untuk keperluan edit/hapus nanti.
                `;
                document.getElementById('adForm').reset();
                document.getElementById('previewImage').src = '';
                count.textContent = '0 / 500';
                imageBase64 = '';
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch (err) {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal mengirim iklan. Coba lagi.';
        }
    });

    // Edit iklan
    document.getElementById('btnEdit')?.addEventListener('click', async () => {
        const secret = document.getElementById('secretCode').value.trim();
        if (!secret) return alert('Masukkan Kode Kelola!');

        const data = {
            id: currentEditId,
            secret_code: secret,
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            location: document.getElementById('location').value.trim(),
            description: document.getElementById('description').value.trim()
        };

        const status = document.getElementById('statusBox');
        status.innerHTML = 'Memperbarui iklan...';
        status.className = 'status-box';
        status.style.display = 'block';

        try {
            const res = await fetch(`${API_URL}?action=updateAd`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = '✅ Iklan berhasil diperbarui!';
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch (err) {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal memperbarui iklan.';
        }
    });

    // Hapus iklan
    document.getElementById('btnHapus')?.addEventListener('click', async () => {
        const secret = document.getElementById('secretCode').value.trim();
        if (!secret || !confirm('Yakin ingin menghapus iklan ini? Tindakan tidak bisa dibatalkan.')) return;

        const status = document.getElementById('statusBox');
        status.innerHTML = 'Menghapus iklan...';
        status.className = 'status-box';
        status.style.display = 'block';

        try {
            const res = await fetch(`${API_URL}?action=deleteAd&id=${currentEditId}&secret_code=${secret}`);
            const result = await res.json();
            if (result.success) {
                status.className = 'status-box status-success';
                status.innerHTML = '✅ Iklan berhasil dihapus!';
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                status.className = 'status-box status-error';
                status.innerHTML = `❌ ${result.error}`;
            }
        } catch (err) {
            status.className = 'status-box status-error';
            status.innerHTML = '❌ Gagal menghapus iklan.';
        }
    });

    window.onload = initForm;
}

// Pemicu Install PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Simpan peristiwa agar bisa dipicu nanti
    e.preventDefault();
    deferredPrompt = e;
    // Tampilkan tombol install
    document.getElementById('pwaInstallBtn').style.display = 'block';
});

// Klik tombol untuk mulai pasang
document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
    if (!deferredPrompt) {
        alert("Aplikasi sudah terpasang atau browser tidak mendukung fitur ini.");
        return;
    }
    // Tampilkan jendela pasang dari browser
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('Pengguna setuju memasang aplikasi');
    } else {
        console.log('Pengguna menolak pemasangan');
    }
    // Hapus penyimpanan
    deferredPrompt = null;
});

// Sembunyikan tombol jika sudah terpasang
window.addEventListener('appinstalled', () => {
    document.getElementById('pwaInstallBtn').style.display = 'none';
    deferredPrompt = null;
});

// script.js - Gabungan Notifikasi + Dola AI Chat (Semua dalam satu file)
// ==================================================
// Rewang - Asisten Situs Iklan | Versi Aman GitHub
// ==================================================
(function () {
  window.addEventListener('load', function () {

    // === GAYA TAMPILAN ===
    const style = document.createElement('style');
    style.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      body { margin: 0; }

      .dola-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 99999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10vh;
      }

      .dola-content {
        background: #1c1c1e;
        border: 1px solid #2c2c2e;
        width: 90%;
        max-width: 420px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        animation: bounceDown 0.6s ease-out forwards;
        overflow: hidden;
      }

      @keyframes bounceDown {
        0% { transform: translateY(-150%); opacity: 0; }
        60% { transform: translateY(10%); opacity: 1; }
        80% { transform: translateY(-5%); opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }

      .notif-view { padding: 30px; text-align: center; }
      .notif-view i { color: #34c759; font-size: 2.5rem; margin-bottom: 15px; }
      .notif-view h3 { font-size: 1.4rem; color: #fff; margin-bottom: 10px; font-weight: 600; }
      .notif-view p { color: #aaa; margin-bottom: 20px; line-height: 1.5; font-size: 0.95rem; }
      .notif-view button { width: 100%; border: none; padding: 12px; border-radius: 25px; font-weight: bold; margin-bottom: 10px; cursor: pointer; font-size: 1rem; }
      .btn-paham { background: #fff; color: #000; }
      .btn-chat { background: #007aff; color: #fff; }

      .chat-view { display: flex; flex-direction: column; height: 75vh; max-height: 600px; }
      .chat-header { background: #2c2c2e; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #3a3a3c; }
      .chat-header h3 { color: #fff; font-size: 1.1rem; font-weight: 600; margin: 0; }
      .chat-close { background: transparent; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }
      .chat-messages { flex: 1; padding: 15px; overflow-y: auto; background: #121214; }
      .chat-input-area { display: flex; gap: 10px; padding: 12px; background: #2c2c2e; }
      .chat-input-area input { flex: 1; padding: 12px 15px; border-radius: 20px; border: none; background: #3a3a3c; color: #fff; outline: none; font-size: 0.95rem; }
      .chat-input-area input::placeholder { color: #999; }
      .chat-input-area button { padding: 12px 18px; border-radius: 20px; border: none; background: #fff; color: #000; font-weight: bold; cursor: pointer; font-size: 0.95rem; }

      .pesan-pengguna { text-align: right; background: #007aff; color: #fff; padding: 10px 14px; border-radius: 16px 16px 4px 16px; margin: 8px 0; max-width: 85%; margin-left: auto; line-height: 1.5; font-size: 0.95rem; }
      .pesan-dola { text-align: left; background: #2c2c2e; color: #fff; padding: 10px 14px; border-radius: 16px 16px 16px 4px; margin: 8px 0; max-width: 85%; margin-right: auto; line-height: 1.5; font-size: 0.95rem; white-space: pre-line; }
    `;
    document.head.appendChild(style);

    // === STRUKTUR TAMPILAN ===
    const overlay = document.createElement('div');
    overlay.className = 'dola-overlay';
    overlay.innerHTML = `
      <div class="dola-content" id="kontenUtama">
        <div class="notif-view" id="tampilanNotif">
          <i>📱</i>
          <h3>Tampilan Lebih Nyaman di HP</h3>
          <p>Situs ini dioptimalkan untuk layar ponsel agar lebih mudah digunakan.</p>
          <button class="btn-paham" id="btnPaham">Siap, Mengerti</button>
          <button class="btn-chat" id="btnMulaiChat">💬 Ngobrol Sama Rewang</button>
        </div>
        <div class="chat-view" id="tampilanChat" style="display: none;">
          <div class="chat-header"><h3>🤝 Rewang - Teman & Pembantu</h3><button id="tutupChat">&times;</button></div>
          <div class="chat-messages" id="kotakPesan"></div>
          <div class="chat-input-area"><input type="text" id="inputPesan" placeholder="Tulis pertanyaan atau permintaan..."><button id="kirimPesan">Kirim</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // === ⚙️ PENGATURAN UTAMA (TANPA KUNCI DI SINI) ===
    const config = {
      namaSitus: "Situs Iklan Gratis", // Ganti nama situsmu
      urlSitus: window.location.origin,
      apiKey: window.GEMINI_API_KEY || "", // Ambil kunci dari luar kode
      model: "gemini-1.5-flash"
    };

    // === 📜 ATURAN JAWAB SESUAI PERMINTAANMU ===
    const sistemPrompt = `
Kamu adalah **Rewang**, asisten dan teman pembantu resmi di situs **${config.namaSitus}**.

✅ **ATURAN JAWAB WAJIB**:
1. Jawab **hanya berdasarkan konten iklan yang terdaftar & terupdate di situs ini saja**.
2. Jika barang/jasa ditanyakan **belum ada**:
   - Tawarkan: "Belum ada iklan itu di sini. Tapi kamu bisa pasang GRATIS, dan saya siap bantu buatkan kontennya yang menarik & SEO."
   - Tambahkan: "Fitur edit & hapus sangat mudah, bisa kapan saja dikelola sendiri."
3. Jika ditanya "Kenapa harus dari sini saja?" atau dibandingkan situs lain:
   - Jawab: "Lebih baik pakai solusi yang ada di situs ini saja, lebih pas & aman. Mana yang lebih nyaman buatmu: cari jawaban di sini atau keluar ke tempat lain?"
4. Jika masih memaksa/pertanyaan tidak nyambung/keberatan:
   - Jawab: "Kalau ada hal yang kurang pas, silakan konsultasi dengan admin situs ya."

❌ **DILARANG**:
- Jangan sebut/arahkan ke situs iklan lain.
- Nada bicara santai, ramah, tidak menyinggung.
    `;

    // === 🚀 FUNGSI PANGGIL AI ===
    async function tanyaRewang(teksPengguna) {
      const kunciBersih = config.apiKey.trim();
      if (!kunciBersih) {
        return "ℹ️ Sistem belum siap. Silakan hubungi admin.";
      }

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${config.model}:generateContent?key=${kunciBersih}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${sistemPrompt}\n\nPertanyaan: ${teksPengguna}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
          })
        });

        const data = await res.json();
        if (data.error) {
          console.log("Error:", data.error);
          return "ℹ️ Sedang ada gangguan, coba lagi sebentar.";
        }
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤝 Silakan tanya lagi ya.";

      } catch (err) {
        console.error("Kesalahan:", err);
        return "🚫 Gangguan jaringan, coba lagi.";
      }
    }

    // === 🖱️ INTERAKSI ===
    const tampilanNotif = document.getElementById('tampilanNotif');
    const tampilanChat = document.getElementById('tampilanChat');
    const btnPaham = document.getElementById('btnPaham');
    const btnMulaiChat = document.getElementById('btnMulaiChat');
    const tutupChat = document.getElementById('tutupChat');
    const kotakPesan = document.getElementById('kotakPesan');
    const inputPesan = document.getElementById('inputPesan');
    const kirimPesan = document.getElementById('kirimPesan');

    function tutupSemua() { overlay.style.display = 'none'; document.body.style.overflow = ''; }
    function bukaChat() {
      tampilanNotif.style.display = 'none'; tampilanChat.style.display = 'flex';
      if (!kotakPesan.innerHTML) {
        kotakPesan.innerHTML = `<div class="pesan-dola">🤝 Halo! Saya Rewang. Mau tanya apa atau butuh bantuan pasang iklan? Silakan sampaikan 😊</div>`;
      }
    }

    tutupChat.addEventListener('click', tutupSemua);
    btnPaham.addEventListener('click', tutupSemua);
    btnMulaiChat.addEventListener('click', bukaChat);
    overlay.addEventListener('click', e => e.target === overlay && tutupSemua());

    async function prosesKirim() {
      const teks = inputPesan.value.trim();
      if (!teks) return;
      kotakPesan.innerHTML += `<div class="pesan-pengguna">${teks}</div>`;
      inputPesan.value = '';
      kotakPesan.scrollTop = kotakPesan.scrollHeight;
      kotakPesan.innerHTML += `<div class="pesan-dola">🤝 Sedang dipikirkan...</div>`;
      const balasan = await tanyaRewang(teks);
      kotakPesan.lastChild.innerHTML = `🤝 ${balasan}`;
      kotakPesan.scrollTop = kotakPesan.scrollHeight;
    }

    kirimPesan.addEventListener('click', prosesKirim);
    inputPesan.addEventListener('keydown', e => e.key === 'Enter' && prosesKirim());

  });
})();
