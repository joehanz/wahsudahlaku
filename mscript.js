lucide.createIcons();

const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const ITEM_PER_PAGE = 26;
let allAds = [], displayAds = [], currentDisplayCount = 0, activeAd = null, editMode = false, deferredPrompt;

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
const installIcon = navInstall?.querySelector("i");
const installText = navInstall?.querySelector("span");

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

// === FUNGSI HITUNG PENGUNJUNG (SESUAI SKRIP .GS) ===
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

    // Tambah pengunjung otomatis
    await tambahPengunjung(activeAd.id);

    // Ambil data terbaru biar angka tidak macet
    try {
        const res = await fetch(`${API_URL}?action=detail&id=${encodeURIComponent(activeAd.id)}`);
        const hasil = await res.json();
        if (hasil.success) activeAd.views = hasil.ad.views;
    } catch {}

    // Tampilkan data
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

// === FORM EDIT & PASANG ===
async function bukaEditIklan() {
    tutupDetailIklan();
    if (!activeAd) return;
    editMode = true;
    formTitle.textContent = "Edit Iklan";
    btnKirim.style.display = "none";
    btnEdit.classList.add("show");
    btnHapus.classList.add("show");
    secretGroup.style.display = "flex";
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
    formTitle.textContent = "Pasang Iklan Baru";
    btnKirim.style.display = "block";
    btnEdit.classList.remove("show");
    btnHapus.classList.remove("show");
    secretGroup.style.display = "none";
    document.getElementById("adForm").reset();
    charCount.textContent = "0 / 3000";
    previewImage.src = "";
    previewImage.style.display = "none";
    adFormOverlay.classList.add("show");
}

function tutupFormIklan() {
    adFormOverlay.classList.remove("show");
}

document.getElementById("description").addEventListener("input", function () {
    charCount.textContent = `${this.value.length} / 3000`;
});

// === SIMPAN PERUBAHAN ===
document.getElementById("btnEdit").addEventListener("click", async () => {
    const kode = document.getElementById("secretCode").value.trim();
    const statusBox = document.getElementById("statusBox");
    if (!kode) {
        statusBox.style.display = "block";
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "Masukkan Kode Kelola!";
        return;
    }
    statusBox.style.display = "block";
    statusBox.style.background = "#EFF6FF";
    statusBox.style.color = "#1E40AF";
    statusBox.textContent = "Menyimpan...";
    try {
        const data = new URLSearchParams();
        data.append("action", "updateAd");
        data.append("id", activeAd.id);
        data.append("secret_code", kode);
        data.append("title", document.getElementById("title").value.trim());
        data.append("category", document.getElementById("category").value);
        data.append("location", document.getElementById("location").value.trim());
        data.append("whatsapp", document.getElementById("whatsapp").value.trim());
        data.append("description", document.getElementById("description").value.trim());

        const res = await fetch(`${API_URL}?${data.toString()}`);
        const hasil = await res.json();
        if (hasil.success) {
            statusBox.style.background = "#D1FAE5";
            statusBox.style.color = "#065F46";
            statusBox.textContent = "✅ Tersimpan!";
            setTimeout(() => { tutupFormIklan(); ambilDataIklan(); }, 2000);
        } else {
            statusBox.style.background = "#FEE2E2";
            statusBox.style.color = "#991B1B";
            statusBox.textContent = "❌ Kode tidak cocok!";
        }
    } catch {
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "❌ Gagal hubung server";
    }
});

// === HAPUS IKLAN ===
document.getElementById("btnHapus").addEventListener("click", async () => {
    const kode = document.getElementById("secretCode").value.trim();
    const statusBox = document.getElementById("statusBox");
    if (!kode) {
        statusBox.style.display = "block";
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "Masukkan Kode Kelola!";
        return;
    }
    if (!confirm("⚠️ Hapus permanen? Tidak bisa dikembalikan!")) return;
    statusBox.style.display = "block";
    statusBox.style.background = "#EFF6FF";
    statusBox.style.color = "#1E40AF";
    statusBox.textContent = "Menghapus...";
    try {
        const data = new URLSearchParams();
        data.append("action", "deleteAd");
        data.append("id", activeAd.id);
        data.append("secret_code", kode);

        const res = await fetch(`${API_URL}?${data.toString()}`);
        const hasil = await res.json();
        if (hasil.success) {
            statusBox.style.background = "#D1FAE5";
            statusBox.style.color = "#065F46";
            statusBox.textContent = "✅ Terhapus!";
            setTimeout(() => { tutupFormIklan(); ambilDataIklan(); }, 2000);
        } else {
            statusBox.style.background = "#FEE2E2";
            statusBox.style.color = "#991B1B";
            statusBox.textContent = "❌ Kode tidak cocok!";
        }
    } catch {
        statusBox.style.background = "#FEE2E2";
        statusBox.style.color = "#991B1B";
        statusBox.textContent = "❌ Gagal hubung server";
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
    const tautan = `https://rewangiklan.my.id/iklan-saya.html?id=${id}`;
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

// === MULAI ===
document.addEventListener("DOMContentLoaded", ambilDataIklan);
