lucide.createIcons();

const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const STORAGE_KEY = "rewang_iklan_history";
const ITEM_PER_PAGE = 26;
let allAds = [], displayAds = [], currentDisplayCount = 0, activeAd = null, editMode = false, deferredPrompt;
let imageBase64 = "";

const feedContainer = document.getElementById("feedContainer");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const navSearch = document.getElementById("navSearch");
const navTop = document.getElementById("navTop");
const navInstall = document.getElementById("navInstall");
const detailOverlay = document.getElementById("detailOverlay");
const adFormOverlay = document.getElementById("adFormOverlay");
const formTitle = document.getElementById("formTitle");
const btnKirim = document.getElementById("btnKirim");
const btnEdit = document.getElementById("btnEdit");
const btnHapus = document.getElementById("btnHapus");
const previewImage = document.getElementById("previewImage");
const secretGroup = document.getElementById("secretGroup");
const charCount = document.getElementById("charCount");
const imageInput = document.getElementById("imageInput");
const statusBox = document.getElementById("statusBox");
const installIcon = navInstall?.querySelector("i");
const installText = navInstall?.querySelector("span");

// === PERBAIKI DAFTAR KATEGORI SAMA DENGAN VERSI DESKTOP ===
document.getElementById("category").innerHTML = `
    <option value="">Pilih Kategori</option>
    <optgroup label="🚗 Kendaraan">
        <option value="Mobil Baru">Mobil Baru</option>
        <option value="Mobil Bekas">Mobil Bekas</option>
        <option value="Motor Baru">Motor Baru</option>
        <option value="Motor Bekas">Motor Bekas</option>
        <option value="Sepeda & Aksesoris">Sepeda & Aksesoris</option>
        <option value="Kendaraan Komersial">Kendaraan Komersial</option>
        <option value="Alat Berat & Mesin">Alat Berat & Mesin</option>
        <option value="Suku Cadang Kendaraan">Suku Cadang Kendaraan</option>
        <option value="Sewa Kendaraan">Sewa Kendaraan</option>
    </optgroup>
    <optgroup label="🏠 Properti">
        <option value="Rumah Dijual">Rumah Dijual</option>
        <option value="Rumah Disewa">Rumah Disewa</option>
        <option value="Apartemen & Kondominium">Apartemen & Kondominium</option>
        <option value="Tanah & Kavling">Tanah & Kavling</option>
        <option value="Ruko & Toko & Kantor">Ruko & Toko & Kantor</option>
        <option value="Gudang & Tempat Usaha">Gudang & Tempat Usaha</option>
        <option value="Kos-kosan & Penginapan">Kos-kosan & Penginapan</option>
        <option value="Kontrakan">Kontrakan</option>
    </optgroup>
    <optgroup label="📱 Elektronik & Gadget">
        <option value="HP & Smartphone">HP & Smartphone</option>
        <option value="Laptop & Komputer">Laptop & Komputer</option>
        <option value="Tablet & Aksesoris">Tablet & Aksesoris</option>
        <option value="Kamera & Fotografi">Kamera & Fotografi</option>
        <option value="TV & Audio Video">TV & Audio Video</option>
        <option value="Konsol & Game">Konsol & Game</option>
        <option value="Peralatan Rumah Tangga Elektronik">Peralatan Rumah Tangga Elektronik</option>
    </optgroup>
    <optgroup label="💼 Lowongan & Bisnis">
        <option value="Lowongan Kerja">Lowongan Kerja</option>
        <option value="Lowongan Freelance">Lowongan Freelance</option>
        <option value="Peluang Usaha & Waralaba">Peluang Usaha & Waralaba</option>
        <option value="Mitra Bisnis">Mitra Bisnis</option>
        <option value="Toko & Usaha Dijual">Toko & Usaha Dijual</option>
        <option value="Jasa Keuangan & Asuransi">Jasa Keuangan & Asuransi</option>
    </optgroup>
    <optgroup label="🛠️ Jasa & Layanan">
        <option value="Jasa Bangunan & Renovasi">Jasa Bangunan & Renovasi</option>
        <option value="Jasa Kebersihan">Jasa Kebersihan</option>
        <option value="Jasa Kursus & Pendidikan">Jasa Kursus & Pendidikan</option>
        <option value="Jasa Desain & Percetakan">Jasa Desain & Percetakan</option>
        <option value="Jasa Transportasi & Kirim">Jasa Transportasi & Kirim</option>
        <option value="Jasa Pernikahan & Acara">Jasa Pernikahan & Acara</option>
        <option value="Jasa Kesehatan & Kecantikan">Jasa Kesehatan & Kecantikan</option>
        <option value="Jasa Lainnya">Jasa Lainnya</option>
    </optgroup>
    <optgroup label="🛒 Barang & Rumah Tangga">
        <option value="Pakaian & Sepatu">Pakaian & Sepatu</option>
        <option value="Perlengkapan Anak & Bayi">Perlengkapan Anak & Bayi</option>
        <option value="Perabotan & Furnitur">Perabotan & Furnitur</option>
        <option value="Barang Antik & Koleksi">Barang Antik & Koleksi</option>
        <option value="Buku & Alat Tulis">Buku & Alat Tulis</option>
        <option value="Alat Olahraga & Hobi">Alat Olahraga & Hobi</option>
    </optgroup>
    <optgroup label="🐾 Hewan & Tanaman">
        <option value="Hewan Peliharaan">Hewan Peliharaan</option>
        <option value="Hewan Ternak & Unggas">Hewan Ternak & Unggas</option>
        <option value="Perlengkapan Hewan">Perlengkapan Hewan</option>
        <option value="Tanaman Hias & Bibit">Tanaman Hias & Bibit</option>
        <option value="Pertanian & Perkebunan">Pertanian & Perkebunan</option>
    </optgroup>
    <optgroup label="🍜 Kuliner & Makanan">
        <option value="Makanan & Minuman">Makanan & Minuman</option>
        <option value="Bahan Baku & Bumbu">Bahan Baku & Bumbu</option>
        <option value="Katering & Pesan Makanan">Katering & Pesan Makanan</option>
        <option value="Usaha Kuliner Dijual">Usaha Kuliner Dijual</option>
    </optgroup>
    <optgroup label="📦 Lainnya">
        <option value="Barang Lainnya">Barang Lainnya</option>
        <option value="Permintaan Pembelian">Permintaan Pembelian</option>
        <option value="Informasi Umum">Informasi Umum</option>
    </optgroup>
`;

// === FUNGSI PREVIEW & KONVERSI GAMBAR KE WEBP ===
imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
        previewImage.src = "";
        previewImage.style.display = "none";
        imageBase64 = editMode ? activeAd.image : "";
        return;
    }
    const webpData = await convertToWebP(file);
    imageBase64 = webpData;
    previewImage.src = webpData;
    previewImage.style.display = "block";
});

function convertToWebP(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 600;
                canvas.height = 450;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 600, 450);
                resolve(canvas.toDataURL("image/webp", 0.75));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// === PWA INSTAL ===
window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installIcon) {
        installIcon.removeAttribute("data-lucide");
        installIcon.innerHTML = `<img src="https://raw.githubusercontent.com/joehanz/wahsudahlaku/refs/heads/main/image/icon-rewangiklan.webp" style="width:22px;height:22px;object-fit:contain;">`;
    }
    if (installText) installText.textContent = "Instal";
});

navInstall.addEventListener("click", async () => {
    if (!deferredPrompt) return window.location.href = "https://rewangiklan.my.id/";
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
});

window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installIcon) {
        installIcon.removeAttribute("data-lucide");
        installIcon.innerHTML = `<img src="https://raw.githubusercontent.com/joehanz/wahsudahlaku/refs/heads/main/image/icon-rewangiklan.webp" style="width:22px;height:22px;object-fit:contain;">`;
    }
    if (installText) installText.textContent = "Beranda";
});

// === FUNGSI HITUNG PENGUNJUNG ===
async function tambahPengunjung(idIklan) {
    try {
        await fetch(`${API_URL}?action=detail&id=${encodeURIComponent(idIklan)}`);
    } catch (err) {
        console.log("Gagal simpan hitungan:", err);
    }
}

// === AMBIL DATA IKLAN ===
async function ambilDataIklan() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allAds = data.filter(item => item.status === "aktif").reverse();
        displayAds = [...allAds];
        tampilkanAwal();
        feedContainer.addEventListener("scroll", deteksiIklanAktif);
    } catch (err) {
        feedContainer.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle"></i><p>Gagal memuat iklan</p></div>`;
        lucide.createIcons({ context: feedContainer });
    }
}

// === DETEKSI IKLAN DI LAYAR ===
function deteksiIklanAktif() {
    document.querySelectorAll(".ad-card").forEach((kartu, indeks) => {
        const posisi = kartu.getBoundingClientRect();
        if (posisi.top >= 0 && posisi.top <= window.innerHeight / 2) {
            activeAd = displayAds[indeks];
        }
    });
}

// === TAMPILAN AWAL ===
function tampilkanAwal() {
    feedContainer.innerHTML = "";
    currentDisplayCount = 0;
    tambahIklan(0, ITEM_PER_PAGE);
    tambahTombolMuat();
}

// === TAMBAH IKLAN KE DAFTAR ===
function tambahIklan(dari, sampai) {
    const batas = Math.min(sampai, displayAds.length);
    for (let i = dari; i < batas; i++) {
        const iklan = displayAds[i];
        const kartu = document.createElement("div");
        kartu.className = "ad-card";
        const urlGambar = iklan.image || "https://picsum.photos/id/1040/800/1400";

        kartu.innerHTML = `
            <div class="spotlight"></div>
            <img src="${urlGambar}" alt="${iklan.title}" class="ad-image" loading="lazy">
            <div class="reflection-glass"></div>
            <div class="fade-overlay"></div>
            <h3 class="ad-title">${iklan.title || "Tanpa Judul"}</h3>
            <div class="side-actions">
                <div class="side-btn" onclick="bukaFormIklan()">
                    <i data-lucide="plus-circle"></i><span>Pasang Iklan</span>
                </div>
                <div class="side-btn" onclick="bukaDetailIklanSaya()">
                    <i data-lucide="image"></i><span>Detail Iklan</span>
                </div>
                <div class="side-btn" onclick="bagikanIklan('${iklan.id}')">
                    <i data-lucide="share-2"></i><span>Bagikan</span>
                </div>
            </div>`;

        const pantulan = kartu.querySelector(".reflection-glass");
        if (pantulan) pantulan.style.backgroundImage = `url('${urlGambar}')`;
        feedContainer.appendChild(kartu);
    }
    currentDisplayCount = batas;
    lucide.createIcons({ context: feedContainer });
    if (displayAds.length > 0) activeAd = displayAds[0];
}

// === TOMBOL MUAT LEBIH BANYAK ===
function tambahTombolMuat() {
    document.getElementById("load-more-wrap")?.remove();
    if (currentDisplayCount >= displayAds.length) return;
    const wrap = document.createElement("div");
    wrap.id = "load-more-wrap";
    wrap.className = "load-more-wrapper";
    wrap.innerHTML = `<button class="load-more-btn" onclick="muatLagi()"><i data-lucide="plus-circle"></i> Muat Lebih Banyak</button>`;
    feedContainer.appendChild(wrap);
    lucide.createIcons({ context: wrap });
}

function muatLagi() {
    const tombol = document.querySelector(".load-more-btn");
    tombol.disabled = true;
    tombol.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Memuat...`;
    setTimeout(() => {
        tambahIklan(currentDisplayCount, currentDisplayCount + ITEM_PER_PAGE);
        tambahTombolMuat();
    }, 500);
}

// === DETAIL IKLAN ===
async function bukaDetailIklanSaya() {
    if (!activeAd) return alert("Data tidak ditemukan");
    await tambahPengunjung(activeAd.id);
    try {
        const res = await fetch(`${API_URL}?action=detail&id=${encodeURIComponent(activeAd.id)}`);
        const hasil = await res.json();
        if (hasil.success) activeAd.views = hasil.ad.views;
    } catch {}

    document.getElementById("detailImg").style.backgroundImage = `url(${activeAd.image || "https://picsum.photos/id/1040/800/1400"})`;
    document.getElementById("detailTitle").textContent = activeAd.title || "Tanpa Judul";
    document.getElementById("detailCat").textContent = activeAd.category || "Lainnya";
    document.getElementById("detailLoc").textContent = activeAd.location || "Tidak diketahui";
    document.getElementById("detailViews").textContent = activeAd.views || "0";
    document.getElementById("detailDesc").textContent = activeAd.description || "Tidak ada deskripsi";
    document.getElementById("btnWa").onclick = () => {
        const nomor = activeAd.whatsapp.toString().replace(/\D/g, "");
        const pesan = encodeURIComponent(`Halo, tertarik dengan iklan "${activeAd.title}"`);
        window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
    };
    detailOverlay.classList.add("show");
}

function tutupDetailIklan() {
    detailOverlay.classList.remove("show");
}

// === BUKA FORM ===
async function bukaEditIklan() {
    tutupDetailIklan();
    if (!activeAd) return;
    editMode = true;
    formTitle.textContent = "✏️ Edit Iklan";
    btnKirim.style.display = "none";
    btnEdit.classList.add("show");
    btnHapus.classList.add("show");
    secretGroup.style.display = "flex";
    statusBox.style.display = "none";
    imageBase64 = activeAd.image || "";
    document.getElementById("title").value = activeAd.title || "";
    document.getElementById("category").value = activeAd.category || "";
    document.getElementById("location").value = activeAd.location || "";
    document.getElementById("whatsapp").value = activeAd.whatsapp || "";
    document.getElementById("description").value = activeAd.description || "";
    charCount.textContent = `${activeAd.description?.length || 0} / 3000`;
    if (activeAd.image) {
        previewImage.src = activeAd.image;
        previewImage.style.display = "block";
    } else {
        previewImage.src = "";
        previewImage.style.display = "none";
    }
    adFormOverlay.classList.add("show");
}

function bukaFormIklan() {
    editMode = false;
    formTitle.textContent = "📝 Pasang Iklan Baru";
    btnKirim.style.display = "block";
    btnEdit.classList.remove("show");
    btnHapus.classList.remove("show");
    secretGroup.style.display = "none";
    statusBox.style.display = "none";
    imageBase64 = "";
    document.getElementById("adForm").reset();
    charCount.textContent = "0 / 3000";
    previewImage.src = "";
    previewImage.style.display = "none";
    adFormOverlay.classList.add("show");
}

function tutupFormIklan() {
    adFormOverlay.classList.remove("show");
    statusBox.style.display = "none";
    imageBase64 = "";
    editMode = false;
}

document.getElementById("description").addEventListener("input", function () {
    charCount.textContent = `${this.value.length} / 3000`;
});

// === FUNGSI PEMBATASAN & RIWAYAT ===
function cekBatasIklan() {
    const riwayat = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const sekarang = new Date();
    const batas24jam = 24 * 60 * 60 * 1000;
    const jumlah = riwayat.filter(t => (sekarang - new Date(t)) < batas24jam).length;
    if (jumlah >= 3) { alert("⚠️ Maksimal 3 iklan dalam 24 jam!"); return false; }
    return true;
}

function cekKemiripan() {
    const teksBaru = (document.getElementById("title").value + " " + document.getElementById("description").value).toLowerCase().trim();
    const lama = JSON.parse(localStorage.getItem(STORAGE_KEY + "_teks") || "[]");
    for (let t of lama) {
        const persen = hitungPersenMirip(teksBaru, t);
        if (persen >= 0.8) { alert(`⚠️ Iklan mirip ${Math.round(persen*100)}% dengan yang lama! Ubah dulu ya.`); return false; }
    }
    return true;
}

function hitungPersenMirip(a, b) {
    const ka = a.split(" "), kb = b.split(" ");
    let sama = 0; ka.forEach(k => { if (kb.includes(k)) sama++ });
    return sama / Math.max(ka.length, kb.length);
}

function simpanKeRiwayat(judul, deskripsi) {
    const riwayat = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const teks = JSON.parse(localStorage.getItem(STORAGE_KEY + "_teks") || "[]");
    riwayat.push(new Date().toISOString());
    teks.push((judul + " " + deskripsi).toLowerCase().trim());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(riwayat));
    localStorage.setItem(STORAGE_KEY + "_teks", JSON.stringify(teks));
}

// === KIRIM IKLAN BARU ===
document.getElementById("adForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (editMode) return;
    if (!cekBatasIklan()) return;
    if (!cekKemiripan()) return;

    statusBox.style.display = "block";
    statusBox.style.background = "#FFF3CD";
    statusBox.style.color = "#856404";
    statusBox.textContent = "⏳ Mengirim iklan...";

    const payload = {
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
            body: JSON.stringify(payload)
        });
        const hasil = await res.json();
        if (hasil.success) {
            statusBox.style.background = "#D1FAE5";
            statusBox.style.color = "#065F46";
            statusBox.innerHTML = `✅ IKLAN BERHASIL DIPASANG!<br>ID: ${hasil.id}<br>Kode Kelola: ${hasil.secret_code}`;
            simpanKeRiwayat(payload.title, payload.description);
            setTimeout(() => { tutupFormIklan(); ambilDataIklan(); }, 3000);
        } else {
            statusBox.style.background = "#FEE2E2";
            statusBox.style.color = "#991B1B";
            statusBox.textContent = "❌ " + hasil.error;
        }
    } catch {
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "❌ Gagal terhubung ke server";
    }
});

// === SIMPAN PERUBAHAN ===
document.getElementById("btnEdit").addEventListener("click", async () => {
    const kode = document.getElementById("secretCode").value.trim();
    if (!kode) {
        statusBox.style.display = "block";
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "⚠️ Masukkan Kode Kelola!";
        return;
    }
    statusBox.style.display = "block";
    statusBox.style.background = "#EFF6FF";
    statusBox.style.color = "#1E40AF";
    statusBox.textContent = "⏳ Memverifikasi & menyimpan...";
    try {
        const cekRes = await fetch(`${API_URL}?action=getAd&id=${encodeURIComponent(activeAd.id)}&secret_code=${encodeURIComponent(kode)}`);
        const cekData = await cekRes.json();
        if (!cekData.success) throw new Error(cekData.error || "Kode kelola tidak cocok!");

        const payload = {
            id: activeAd.id,
            secret_code: kode,
            title: document.getElementById("title").value.trim(),
            category: document.getElementById("category").value,
            location: document.getElementById("location").value.trim(),
            whatsapp: document.getElementById("whatsapp").value.trim(),
            description: document.getElementById("description").value.trim(),
            image: imageBase64 || activeAd.image
        };

        const res = await fetch(`${API_URL}?action=updateAd`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const hasil = await res.json();
        if (hasil.success) {
            statusBox.style.background = "#D1FAE5";
            statusBox.style.color = "#065F46";
            statusBox.textContent = "✅ Perubahan tersimpan!";
            setTimeout(() => { tutupFormIklan(); ambilDataIklan(); }, 2000);
        } else {
            statusBox.style.background = "#FEE2E2";
            statusBox.style.color = "#991B1B";
            statusBox.textContent = "❌ " + (hasil.error || "Gagal menyimpan!");
        }
    } catch (err) {
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "❌ " + err.message;
    }
});

// === HAPUS IKLAN ===
document.getElementById("btnHapus").addEventListener("click", async () => {
    const kode = document.getElementById("secretCode").value.trim();
    if (!kode) {
        statusBox.style.display = "block";
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "⚠️ Masukkan Kode Kelola!";
        return;
    }
    if (!confirm("⚠️ Hapus permanen? Tidak bisa dikembalikan!")) return;
    statusBox.style.display = "block";
    statusBox.style.background = "#EFF6FF";
    statusBox.style.color = "#1E40AF";
    statusBox.textContent = "⏳ Menghapus iklan...";
    try {
        const cekRes = await fetch(`${API_URL}?action=getAd&id=${encodeURIComponent(activeAd.id)}&secret_code=${encodeURIComponent(kode)}`);
        const cekData = await cekRes.json();
        if (!cekData.success) throw new Error(cekData.error || "Kode kelola tidak cocok!");

        const res = await fetch(`${API_URL}?action=deleteAd&id=${encodeURIComponent(activeAd.id)}&secret_code=${encodeURIComponent(kode)}`);
        const hasil = await res.json();
        if (hasil.success) {
            statusBox.style.background = "#D1FAE5";
            statusBox.style.color = "#065F46";
            statusBox.textContent = "✅ Iklan berhasil dihapus!";
            setTimeout(() => { tutupFormIklan(); ambilDataIklan(); }, 2000);
        } else {
            statusBox.style.background = "#FEE2E2";
            statusBox.style.color = "#991B1B";
            statusBox.textContent = "❌ " + (hasil.error || "Gagal menghapus!");
        }
    } catch (err) {
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "❌ " + err.message;
    }
});

// === PENCARIAN & NAVIGASI ===
navSearch.addEventListener("click", () => {
    searchBar.classList.toggle("show");
    if (searchBar.classList.contains("show")) setTimeout(() => searchInput.focus(), 100);
    else { searchInput.value = ""; tampilkanAwal(); }
});

searchInput.addEventListener("input", () => {
    const kata = searchInput.value.trim().toLowerCase();
    searchClear.classList.toggle("show", kata !== "");
    if (!kata) { displayAds = [...allAds]; tampilkanAwal(); return; }
    displayAds = allAds.filter(iklan => {
        return (iklan.title || "").toLowerCase().includes(kata)
            || (iklan.category || "").toLowerCase().includes(kata)
            || (iklan.location || "").toLowerCase().includes(kata)
            || (iklan.description || "").toLowerCase().includes(kata);
    });
    tampilkanAwal();
    if (displayAds.length === 0) {
        feedContainer.innerHTML = `<div class="empty-state"><i data-lucide="search-x"></i><p>Tidak ditemukan iklan untuk "${kata}"</p></div>`;
        lucide.createIcons({ context: feedContainer });
    }
});

searchClear.addEventListener("click", () => { searchInput.value = ""; tampilkanAwal(); });
navTop.addEventListener("click", () => { feedContainer.scrollTo({ top: 0, behavior: "smooth" }); });

// === BAGIKAN ===
async function bagikanIklan(id) {
    if (!activeAd) return;
    const tautan = `https://rewangiklan.my.id/iklan.html?id=${id}`;
    const data = {
        title: activeAd.title || "Iklan Rewang Iklan",
        text: `Lihat iklan: ${activeAd.title}`,
        url: tautan
    };
    try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(tautan); alert("Tautan disalin!"); }
    } catch {
        try { await navigator.clipboard.writeText(tautan); alert("Tautan disalin!"); }
        catch { alert("Perangkat tidak mendukung berbagi"); }
    }
}

// Ubah Link di Deskripsi
        const rawDesc = ad.description || "";
        const formattedDesc = rawDesc.replace(/(https?:\/\/[^\s]+)/g, url => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#00a2ff; text-decoration:none;">${url}</a>`;
        });
        document.getElementById("adDescription").innerHTML = formattedDesc;


// === MULAI ===
document.addEventListener("DOMContentLoaded", ambilDataIklan);
