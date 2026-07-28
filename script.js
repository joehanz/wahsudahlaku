// === BAGIAN 1: TAMPILAN DAFTAR IKLAN ===
const API_URL = "https://script.google.com/macros/s/AKfycbx-BaNk5IxrhHHp6wSJlBM9OI4t2y1uAjwUlLFAW8whVcI2xtvlj3D8zx3SkN52Fc15Eg/exec";

const BATAS_AWAL = 7;
const TAMBAHAN_PER_KLIK = 7;
let semuaDataIklan = [];
let jumlahYangDitampilkan = 0;

window.addEventListener('load', async () => {
    const wadah = document.getElementById("daftar-iklan");
    try {
        const res = await fetch(API_URL);
        semuaDataIklan = await res.json();
        
        semuaDataIklan.sort((a, b) => new Date(b.date) - new Date(a.date));
        tampilkanSebagianIklan();
    } catch (err) {
        wadah.innerHTML = `<p style="color:red; text-align:center; padding:30px;">❌ Gagal memuat iklan. Silakan segarkan halaman.</p>`;
        console.error("Error:", err);
    }
});

function tampilkanSebagianIklan() {
    const wadah = document.getElementById("daftar-iklan");
    
    if (jumlahYangDitampilkan === 0) wadah.innerHTML = "";
    
    const potongan = semuaDataIklan.slice(jumlahYangDitampilkan, jumlahYangDitampilkan + TAMBAHAN_PER_KLIK);
    
    if (potongan.length === 0 && jumlahYangDitampilkan === 0) {
        wadah.innerHTML = `<p style="text-align:center; padding:30px;">📭 Belum ada iklan. Jadilah yang pertama!</p>`;
        return;
    }

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

    if (jumlahYangDitampilkan < semuaDataIklan.length) {
        htmlIklan += `<div class="tombol-navigasi"><button class="btn-muat" onclick="tambahLagi()">📂 Muat Lebih Banyak Iklan</button></div>`;
    } else if (semuaDataIklan.length > BATAS_AWAL) {
        htmlIklan += `<div class="tombol-navigasi"><p style="color:#666;">✅ Semua iklan sudah ditampilkan</p></div>`;
    }

    wadah.innerHTML += htmlIklan;
}

function tambahLagi() {
    const tombolLama = document.querySelector('.tombol-navigasi');
    if (tombolLama) tombolLama.remove();
    tampilkanSebagianIklan();
}

function cariIklan() {
    const kataKunci = document.getElementById("cari").value.toLowerCase().trim();
    const wadah = document.getElementById("daftar-iklan");

    if (!kataKunci) {
        jumlahYangDitampilkan = 0;
        tampilkanSebagianIklan();
        return;
    }

    let hasil = semuaDataIklan.filter(iklan => {
        const teksGabungan = ((iklan.title||"") + " " + (iklan.description||"") + " " + (iklan.location||"") + " " + (iklan.category||"")).toLowerCase();
        return teksGabungan.includes(kataKunci);
    });

    hasil.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (hasil.length === 0) {
        wadah.innerHTML = `<p style="text-align:center; padding:30px;">❌ Tidak ditemukan iklan: <strong>${kataKunci}</strong></p>`;
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
}

// === IKLAN AMAN SAJA ===
const adScript = document.createElement('script');
adScript.dataset.zone = '11439517';
adScript.src = 'https://n6wxm.com/vignette.min.js';
adScript.async = true;
document.body.appendChild(adScript);
