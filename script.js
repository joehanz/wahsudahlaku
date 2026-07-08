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

// Fungsi Buka-Tutup Dola AI
const dolaOverlay = document.getElementById('dolaOverlay');
const dolaCloseBtn = document.getElementById('dolaCloseBtn');
const dolaBtnNav = document.getElementById('dolaBtn'); // Tombol di nav bawah

// Buka saat klik tombol Dola di navigasi
if (dolaBtnNav) {
  dolaBtnNav.addEventListener('click', () => {
    dolaOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Kunci gulir halaman belakang
  });
}

// Tutup saat klik tombol silang
if (dolaCloseBtn) {
  dolaCloseBtn.addEventListener('click', () => {
    dolaOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Kembalikan gulir
  });
}

// Tutup juga jika klik area gelap di luar kotak
if (dolaOverlay) {
  dolaOverlay.addEventListener('click', (e) => {
    if (e.target === dolaOverlay) {
      dolaOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// Contoh fungsi balasan Dola (bisa disesuaikan nanti)
const dolaInput = document.getElementById('dolaInput');
const dolaSendBtn = document.getElementById('dolaSendBtn');
const dolaChatBox = document.getElementById('dolaChatBox');

function kirimPesanDola() {
  const pesan = dolaInput.value.trim();
  if (!pesan) return;

  // Tampilkan pesan pengguna
  dolaChatBox.innerHTML += `<p style="text-align: right; background: #e0f2fe; padding: 8px; border-radius: 6px; margin: 6px 0;">${pesan}</p>`;
  dolaInput.value = '';
  dolaChatBox.scrollTop = dolaChatBox.scrollHeight;

  // Balasan otomatis Dola (bisa diganti panggilan API AI nanti)
  setTimeout(() => {
    let balasan = "Maaf, saya belum mengerti pertanyaan Anda. Bisa jelaskan lebih rinci?";
    if (pesan.toLowerCase().includes("iklan") || pesan.toLowerCase().includes("pasang")) {
      balasan = "Anda bisa pasang iklan gratis dengan klik tombol ➕ di halaman utama. Tidak perlu daftar, langsung tayang!";
    } else if (pesan.toLowerCase().includes("edit") || pesan.toLowerCase().includes("hapus")) {
      balasan = "Untuk mengedit atau menghapus iklan, buka detail iklan lalu pilih 'Kelola', dan masukkan ID serta Kode Rahasia yang Anda dapatkan saat pasang.";
    } else if (pesan.toLowerCase().includes("wa") || pesan.toLowerCase().includes("whatsapp")) {
      balasan = "Pastikan nomor WhatsApp diawali kode negara, contoh: 6281234567890.";
    }

    dolaChatBox.innerHTML += `<p style="text-align: left; background: #f3f4f6; padding: 8px; border-radius: 6px; margin: 6px 0;">🤖 ${balasan}</p>`;
    dolaChatBox.scrollTop = dolaChatBox.scrollHeight;
  }, 600);
}

// Kirim dengan klik tombol atau tekan Enter
if (dolaSendBtn) dolaSendBtn.addEventListener('click', kirimPesanDola);
if (dolaInput) dolaInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') kirimPesanDola(); });
