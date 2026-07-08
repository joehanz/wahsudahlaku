const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
let allAds = [];
let currentPage = 0;
const perPage = 10;

// Fungsi bantu
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

// Geser kategori
document.querySelector('.cat-arrow.left')?.addEventListener('click', () => {
    document.getElementById('categoryScroll').scrollBy({ left: -110, behavior: 'smooth' });
});
document.querySelector('.cat-arrow.right')?.addEventListener('click', () => {
    document.getElementById('categoryScroll').scrollBy({ left: 110, behavior: 'smooth' });
});

// Ambil data iklan
async function loadAllAds() {
    const container = document.getElementById('adsContainer');
    container.innerHTML = "<p style='text-align:center; padding:2rem; color:#888;'>Memuat iklan...</p>";

    try {
        const res = await fetch(API_URL, { method: "GET", redirect: "follow" });
        allAds = await res.json();
        allAds.sort((a, b) => new Date(b.date) - new Date(a.date));

        document.getElementById('totalAds').textContent = allAds.length;
        currentPage = 0;
        renderAds();
    } catch (err) {
        container.innerHTML = "<p style='text-align:center; padding:2rem; color:red;'>Gagal memuat data. Coba muat ulang.</p>";
        console.error(err);
    }
}

// Tampilkan iklan
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

// Jalankan saat buka halaman beranda
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.addEventListener('load', loadAllAds);
}

// ======================================
// FUNGSI KHUSUS UNTUK HALAMAN PASANG IKLAN
// ======================================
if (window.location.pathname.includes('pasang.html')) {
    let imageBase64 = "";

    // Hitung jumlah karakter deskripsi
    const descField = document.getElementById("description");
    const charCount = document.getElementById("charCount");
    descField?.addEventListener("input", () => {
        charCount.textContent = `${descField.value.length} / 500`;
    });

    // Ubah gambar ke format WebP dan tampilkan pratinjau
    document.getElementById("imageInput")?.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        imageBase64 = await convertToWebP(file);
        document.getElementById("previewImage").src = imageBase64;
    });

    function convertToWebP(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 300;
                    canvas.height = 225;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, 300, 225);
                    resolve(canvas.toDataURL("image/webp", 0.7));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Kirim data iklan ke server
    document.getElementById("adForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const statusBox = document.getElementById("statusBox");
        statusBox.textContent = "Mengirim iklan, mohon tunggu...";
        statusBox.className = "status-box";
        statusBox.style.display = "block";

        const data = {
            title: document.getElementById("title").value.trim(),
            category: document.getElementById("category").value,
            location: document.getElementById("location").value.trim(),
            whatsapp: document.getElementById("whatsapp").value.trim(),
            description: document.getElementById("description").value.trim(),
            image: imageBase64,
            date: new Date().toISOString()
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                statusBox.className = "status-box status-success";
                statusBox.innerHTML = `
                    ✅ Iklan berhasil dipasang!<br><br>
                    <b>ID Iklan:</b><br>
                    <span class="secret-code-box">${result.id}</span><br><br>
                    <b>Kode Kelola / Rahasia:</b><br>
                    <span class="secret-code-box">${result.secret_code}</span><br><br>
                    Simpan kode ini dengan aman! Diperlukan jika ingin mengedit atau menghapus iklan Anda nanti.
                `;
                document.getElementById("adForm").reset();
                document.getElementById("previewImage").src = "";
                charCount.textContent = "0 / 500";
                imageBase64 = "";
            } else {
                statusBox.className = "status-box status-error";
                statusBox.textContent = `❌ ${result.error || "Gagal menyimpan iklan"}`;
            }
        } catch (err) {
            statusBox.className = "status-box status-error";
            statusBox.textContent = "❌ Terjadi kesalahan jaringan. Coba lagi nanti.";
            console.error(err);
        }
    });
}
