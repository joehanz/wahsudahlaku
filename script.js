// Link API App Script kamu
const API_URL = "https://script.google.com/macros/s/AKfycbx-BaNk5IxrhHHp6wSJlBM9OI4t2y1uAjwUlLFAW8whVcI2xtvlj3D8zx3SkN52Fc15Eg/exec";

// Pengaturan tampilan
const BATAS_AWAL = 7;
const TAMBAHAN_PER_KLIK = 7;
let semuaDataIklan = [];
let jumlahYangDitampilkan = 0;

// ✅ SEMUA KODE FITUR MENU MOBILE DIHAPUS TOTAL

// Ambil data iklan dari API saat halaman dibuka
window.addEventListener('load', async () => {
    const wadah = document.getElementById("daftar-iklan");
    try {
        const res = await fetch(API_URL);
        semuaDataIklan = await res.json();
        
        // Urutkan: Iklan TERBARU paling atas
        semuaDataIklan.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tampilkanSebagianIklan();
    } catch (err) {
        // Tampilkan pesan error jika gagal ambil data
        wadah.innerHTML = `<p style="color:red; text-align:center; padding:30px;">❌ Gagal memuat iklan. Silakan segarkan halaman nanti.</p>`;
        console.error("Error ambil data:", err);
    }
});

// Tampilkan iklan bertahap
function tampilkanSebagianIklan() {
    const wadah = document.getElementById("daftar-iklan");
    
    // Hapus pesan memuat & bersihkan wadah
    if (jumlahYangDitampilkan === 0) {
        wadah.innerHTML = "";
    }
    
    // Ambil potongan data yang akan ditampilkan
    const potongan = semuaDataIklan.slice(jumlahYangDitampilkan, jumlahYangDitampilkan + TAMBAHAN_PER_KLIK);
    
    if (potongan.length === 0 && jumlahYangDitampilkan === 0) {
        wadah.innerHTML = `<p style="text-align:center; padding:30px;">📭 Belum ada iklan yang tayang. Jadilah yang pertama memasang iklan!</p>`;
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
            <a href="https://rewangiklan.my.id/iklan.html?id=${iklan.id}" class="btn-detail">Lihat Detail & Hubungi</a>
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
            <p style="color:#666;">✅ Semua iklan sudah ditampilkan (Total: ${semuaDataIklan.length})</p>
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
    const wadah = document.getElementById("daftar-iklan");

    // Jika kolom pencarian kosong, tampilkan semua iklan terbaru
    if (!kataKunci) {
        jumlahYangDitampilkan = 0;
        tampilkanSebagianIklan();
        return;
    }

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Filter: BACA JUDUL, DESKRIPSI, LOKASI, DAN KATEGORI
        let hasil = data.filter(iklan => {
            const teksGabungan = (
                (iklan.title || "") + " " +
                (iklan.description || "") + " " +
                (iklan.location || "") + " " +
                (iklan.category || "")
            ).toLowerCase();
            
            return teksGabungan.includes(kataKunci);
        });

        // Urutkan hasil pencarian juga dari terbaru
        hasil.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Tampilkan hasil pencarian
        if (hasil.length === 0) {
            wadah.innerHTML = `<p style="text-align:center; padding:30px;">❌ Tidak ditemukan iklan dengan kata kunci: <strong>${kataKunci}</strong></p>`;
            return;
        }

        wadah.innerHTML = hasil.map(iklan => `
            <div class="card-iklan">
                <img src="${iklan.image || 'https://rewangiklan.my.id/image/no-image.webp'}" alt="${iklan.title}" loading="lazy">
                <h4>${iklan.title}</h4>
                <p>${(iklan.description || "").substring(0, 90)}...</p>
                <span class="lokasi">📍 ${iklan.location || "Lokasi tidak disebutkan"}</span>
                <span class="kategori">📂 ${iklan.category || "Lainnya"}</span>
                <a href="https://rewangiklan.my.id/iklan.html?id=${iklan.id}" class="btn-detail">Lihat Detail & Hubungi</a>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        wadah.innerHTML = `<p style="color:red; text-align:center; padding:30px;">❌ Gagal mencari iklan. Coba lagi nanti.</p>`;
    }
}
