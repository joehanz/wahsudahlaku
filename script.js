// Link API App Script kamu
const API_URL = "https://script.google.com/macros/s/AKfycbx-BaNk5IxrhHHp6wSJlBM9OI4t2y1uAjwUlLFAW8whVcI2xtvlj3D8zx3SkN52Fc15Eg/exec";

// Pengaturan tampilan
const BATAS_AWAL = 7;
const TAMBAHAN_PER_KLIK = 7;
let semuaDataIklan = [];
let jumlahYangDitampilkan = 0;

// Buka tutup menu di HP
const menuToggle = document.getElementById('mobileMenu');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
    }
});

// Ambil data iklan dari API saat halaman dibuka
window.addEventListener('load', async () => {
    try {
        const res = await fetch(API_URL);
        semuaDataIklan = await res.json();
        
        // Urutkan: Iklan TERBARU paling atas
        semuaDataIklan.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tampilkanSebagianIklan();
    } catch (err) {
        // Ganti pesan memuat dengan pesan error
        document.getElementById("daftar-iklan").innerHTML = `<p style="color:red; grid-column:1/-1;">Gagal memuat iklan. Silakan coba lagi nanti.</p>`;
        console.error(err);
    }
});

// Tampilkan iklan bertahap
function tampilkanSebagianIklan() {
    const wadah = document.getElementById("daftar-iklan");
    
    // HAPUS PESAN "MEMUAT" SEKALI PERTAMA
    if (jumlahYangDitampilkan === 0) {
        wadah.innerHTML = ""; // Kosongkan dulu wadah
    }
    
    // Ambil potongan data yang akan ditampilkan
    const potongan = semuaDataIklan.slice(jumlahYangDitampilkan, jumlahYangDitampilkan + TAMBAHAN_PER_KLIK);
    
    if (potongan.length === 0 && jumlahYangDitampilkan === 0) {
        wadah.innerHTML = `<p style="grid-column:1/-1;">Belum ada iklan yang tayang. Jadilah yang pertama memasang iklan!</p>`;
        return;
    }

    // Susun HTML iklan
    let htmlIklan = potongan.map(iklan => `
        <div class="card-iklan">
            <img src="${iklan.image || 'https://rewangiklan.my.id/image/no-image.webp'}" alt="${iklan.title}" loading="lazy">
            <h4>${iklan.title}</h4>
            <p>${(iklan.description || "").substring(0, 90)}...</p>
            <span class="lokasi">📍 ${iklan.location || "Lokasi tidak disebutkan"}</span>
            <span class="kategori">📂 ${iklan.category || "Lainnya"}</span>
            <a href="https://rewangiklan.my.id/iklan.html?id=${iklan.id}" class="btn-detail" >Lihat Detail & Hubungi</a>
        </div>
    `).join("");

    jumlahYangDitampilkan += potongan.length;

    // Tambahkan tombol navigasi
    if (jumlahYangDitampilkan < semuaDataIklan.length) {
        htmlIklan += `
        <div class="tombol-navigasi">
            <button class="btn-muat" onclick="tambahLagi()">📂 Muat Lebih Banyak Iklan</button>
        </div>`;
    } else if (semuaDataIklan.length > BATAS_AWAL) {
        htmlIklan += `
        <div class="tombol-navigasi">
            <p style="color:#666;">Semua iklan sudah ditampilkan (Total: ${semuaDataIklan.length})</p>
        </div>`;
    }

    wadah.innerHTML += htmlIklan;
}

// Fungsi tambah iklan saat tombol diklik
function tambahLagi() {
    // Hapus tombol lama dulu
    const tombolLama = document.querySelector('.tombol-navigasi');
    if (tombolLama) tombolLama.remove();
    
    tampilkanSebagianIklan();
}

// Fungsi pencarian iklan
async function cariIklan() {
    const kataKunci = document.getElementById("cari").value.toLowerCase().trim();
    const katPilih = document.getElementById("kategori").value;

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Filter dulu
        let hasil = data.filter(iklan => {
            const cocokKata = kataKunci === "" 
                || (iklan.title || "").toLowerCase().includes(kataKunci) 
                || (iklan.description || "").toLowerCase().includes(kataKunci)
                || (iklan.location || "").toLowerCase().includes(kataKunci);
            
            const cocokKategori = katPilih === "" || (iklan.category || "") === katPilih;
            return cocokKata && cocokKategori;
        });

        // Urutkan hasil pencarian juga dari terbaru
        hasil.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Tampilkan hasil pencarian — langsung ganti isi wadah
        const wadah = document.getElementById("daftar-iklan");
        if (hasil.length === 0) {
            wadah.innerHTML = `<p style="grid-column:1/-1;">Tidak ditemukan iklan yang sesuai kata kunci kamu.</p>`;
            return;
        }

        wadah.innerHTML = hasil.map(iklan => `
            <div class="card-iklan">
                <img src="${iklan.image || 'https://rewangiklan.my.id/image/no-image.webp'}" alt="${iklan.title}" loading="lazy">
                <h4>${iklan.title}</h4>
                <p>${(iklan.description || "").substring(0, 90)}...</p>
                <span class="lokasi">📍 ${iklan.location || "Lokasi tidak disebutkan"}</span>
                <span class="kategori">📂 ${iklan.category || "Lainnya"}</span>
                <a href="https://rewangiklan.my.id/iklan.html?id=${iklan.id}" class="btn-detail" target="_blank">Lihat Detail & Hubungi</a>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
    }
}


