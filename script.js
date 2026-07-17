const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
const PER_PAGE = 26;

let allAds = [];
let filteredAds = [];
let currentPage = 1;

/* =========================
LOAD & DROPDOWN LOGIC
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // Panggil pemuat data bawaan
  await loadAds();
  initSearch();
  initStickyBanner();

  // 1. KONTROL DROPDOWN (Hanya memicu sub-menu keluar, tidak memfilter hasil)
  const toggles = document.querySelectorAll(".dropdown-toggle");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault(); 
      e.stopPropagation(); // Stop bentrokan event bubbling
      
      const parent = toggle.parentElement;
      const menu = parent.querySelector(".dropdown-menu");
      
      // Tutup semua dropdown lain yang sedang terbuka
      document.querySelectorAll(".nav-item-dropdown").forEach(item => {
        if (item !== parent) item.classList.remove("show");
      });

      // Buka / Tutup dropdown saat ini
      parent.classList.toggle("show");

      // Hitung koordinat tombol secara realtime agar dropdown melayang bebas (Scroll Horizontal Friendly)
      if (parent.classList.contains("show") && menu) {
        const rect = toggle.getBoundingClientRect();
        menu.style.left = (rect.left + window.scrollX) + "px";
        menu.style.top = (rect.bottom + window.scrollY) + "px";
      }
    });
  });

  // 2. KONTROL KLIK SUB-KATEGORI (Ini yang memicu hasil pencarian iklan)
  document.querySelectorAll(".dropdown-menu a").forEach(subLink => {
    subLink.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Ambil nilai kategori dari data-category milik sub-menu yang diklik
      const value = this.dataset.category || this.innerText.trim();
      const select = document.getElementById("categoryFilter");
      
      if (select) {
        select.value = value;
        // Jalankan filter pencarian bawaan
        select.dispatchEvent(new Event("change"));
      }

      // Otomatis tutup kembali dropdown setelah sub-kategori dipilih
      document.querySelectorAll(".nav-item-dropdown").forEach(item => {
        item.classList.remove("show");
      });
    });
  });

  // Otomatis tutup dropdown jika pengguna mengklik area sembarang di luar menu
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-item-dropdown").forEach(item => {
      item.classList.remove("show");
    });
  });
});

/* =========================
LOAD DATA
========================= */
async function loadAds(){
  try{
    const res = await fetch(API_URL);
    const data = await res.json();

    allAds = Array.isArray(data)
      ? data.sort((a,b)=> new Date(b.date) - new Date(a.date))
      : [];

    filteredAds = [...allAds];

    renderHero();
    renderCategories();
    renderAds();
    renderLatest();
    renderPopular();
  }catch(err){
    console.error(err);
  }
}

/* =========================
HERO RANDOM
========================= */
function renderHero(){
  const hero = document.getElementById("hero");
  if(!hero || !allAds.length) return;

  const random = allAds[Math.floor(Math.random() * allAds.length)];
  if(random.image){
    hero.style.backgroundImage = `url(${random.image})`;
  }
}

/* =========================
SEARCH
========================= */
function initSearch(){
  const input = document.getElementById("searchInput");
  const select = document.getElementById("categoryFilter");

  if(input){
    input.addEventListener("input", filterAds);
  }
  if(select){
    select.addEventListener("change", filterAds);
  }
}

/* =========================
FILTER PROSES
========================= */
function filterAds(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  filteredAds = allAds.filter(ad=>{
    const text = `
      ${ad.title || ""}
      ${ad.description || ""}
    `.toLowerCase();

    const matchKeyword = text.includes(keyword);
    const matchCategory = !category || ad.category === category;

    return (matchKeyword && matchCategory);
  });

  currentPage = 1;
  renderAds();
}

/* =========================
KATEGORI
========================= */
function renderCategories(){
  const select = document.getElementById("categoryFilter");
  const sidebar = document.getElementById("sidebarCategories");

  if(!select) return;

  const categories = [...new Set(allAds.map(x=>x.category))].filter(Boolean);

  categories.forEach(cat=>{
    select.innerHTML += `
      <option value="${cat}">
        ${cat}
      </option>
    `;

    if(sidebar){
      sidebar.innerHTML += `
        <li>${cat}</li>
      `;
    }
  });
}

/* =========================
ADS
========================= */
function renderAds(){
  const wrap = document.getElementById("adsContainer");
  if(!wrap) return;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const items = filteredAds.slice(start, end);

  wrap.innerHTML = items.map(ad => {
    const phone = cleanWA(String(ad.whatsapp || ""));

    // selalu potong 250 karakter + link baca lagi
    let desc = ad.description || "";
    let shortDesc = makeLinks(desc.substring(0,250)) + '... <a href="iklan.html?id=' + ad.id + '">Baca lagi</a>';

    return `
      <div class="ad-card">
        <div class="ad-thumb">
          <img src="${ad.image || ''}" loading="lazy">
        </div>
        <div class="ad-content">
          <div class="ad-title">
            ${safe(ad.title)}
          </div>
          <div class="ad-desc">
            ${shortDesc}
          </div>
          <div class="ad-meta">
            <span>📍 ${safe(ad.location)}</span>
            <span>📅 ${formatDate(ad.date)}</span>
            <span>👁️ ${ad.views} Dilihat</span>
          </div>
          <div class="contact-buttons">
            <a class="call-btn" href="tel:${phone}">
              📞 <span>Telepon</span>
            </a>
            <a class="wa-btn" target="_blank" href="https://wa.me/${phone}?text=${encodeURIComponent(
              `Halo.\n\nSaya melihat iklan:\n${safe(ad.title)}\ndi situs:\nhttps://rewangiklan.my.id/\n\nSaya tertarik dan ingin mengetahui informasi lebih lanjut.\n\nTerima kasih.`
            )}">
              <img src="image/wa.svg" class="wa-icon" alt="WhatsApp">
              <span>WhatsApp</span>
            </a>
            <a class="manage-btn" href="iklan-saya.html">
              ⚙️ <span>Kelola</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  renderPagination();
}

/* =========================
PAGINATION
========================= */
function renderPagination(){
  const totalPages = Math.ceil(filteredAds.length / PER_PAGE);
  const pagination = document.getElementById("pagination");

  if(!pagination) return;

  if(totalPages <= 1){
    pagination.innerHTML = "";
    return;
  }

  let html = "";
  for(let i = 1; i <= totalPages; i++){
    html += `
      <button class="${i === currentPage ? "active" : ""}" onclick="goPage(${i})">
        ${i}
      </button>
    `;
  }
  pagination.innerHTML = html;
}

/* =========================
GO PAGE
========================= */
function goPage(page){
  currentPage = page;
  renderAds();
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

/* =========================
LATEST
========================= */
function renderLatest(){
  const box = document.getElementById("latestSidebar");
  if(!box) return;

  const latest = allAds.slice(0, 5);
  box.innerHTML = latest.map(ad=>`
    <div style="display:flex; gap:10px; margin-bottom:10px;">
      <img src="${ad.image}" style="width:60px; height:60px; object-fit:cover;">
      <div>
        ${ad.title}
      </div>
    </div>
  `).join("");
}

/* =========================
POPULAR
========================= */
function renderPopular(){
  const box = document.getElementById("popularSidebar");
  if(!box) return;

  const popular = allAds.slice(0, 5);
  box.innerHTML = popular.map(ad=>`
    <div style="display:flex; gap:10px; margin-bottom:10px;">
      <img src="${ad.image}" style="width:60px; height:60px; object-fit:cover;">
      <div>
        ${ad.title}
      </div>
    </div>
  `).join("");
}

/* =========================
DATE
========================= */
function formatDate(date){
  if(!date) return "";
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    dateStyle:"long",
    timeStyle:"short"
  });
}

/* =========================
WA
========================= */
function cleanWA(v){
  return String(v || "").replace(/\D/g,'');
}

/* =========================
SAFE
========================= */
function safe(v){
  return v || "";
}

/* =========================
STICKY BANNER
========================= */
function initStickyBanner(){
  const hero = document.getElementById("hero");
  const banner = document.getElementById("stickyBanner");

  if(!hero || !banner) return;

  window.addEventListener("scroll", ()=>{
    const rect = hero.getBoundingClientRect();
    if(rect.bottom < 0){
      banner.classList.add("show");
    }else{
      banner.classList.remove("show");
    }
  });
}

/* =========================
MOBILE ADS
========================= */
function initMobileAds(){
  if(window.innerWidth > 768) return;

  const mobileAds = document.getElementById("mobileAds");
  if(!mobileAds) return;

  const ads = document.querySelectorAll(".left-sidebar .ad300, .right-sidebar .ad300");
  ads.forEach(ad=>{
    mobileAds.appendChild(ad.cloneNode(true));
  });
}
window.addEventListener("load", initMobileAds);

/* =========================
AUTO LINK WEBSITE
========================= */
function makeLinks(text){
  return String(text || "").replace(
    /((https?:\/\/|www\.)[^\s]+)/gi,
    url=>{
      const href = url.startsWith("http") ? url : "https://" + url;
      return `<a href="${href}" target="_blank" rel="nofollow noopener">${url}</a>`;
    }
  );
}

// Isi lengkap panduan
const TEKS_PANDUAN = `
Banyak pedagang yang sudah beriklan berkali-kali di berbagai tempat tapi belum mendapatkan hasil yang diharapkan. Seringkali hal ini terjadi bukan karena barang atau jasanya kurang bagus, melainkan cara menyampaikan iklannya yang kurang tepat sasaran, kurang jelas, atau tidak membangun kepercayaan calon pembeli. Rewang Iklan hadir tidak hanya sebagai tempat memajang iklan, tapi juga sebagai teman belajar agar setiap iklan yang kamu pasang bisa membawa manfaat nyata bagi usahamu. Berikut adalah panduan mendalam yang kami susun khusus berdasarkan pengalaman ribuan iklan yang sudah tayang:

<h4>1. Cara Membuat Judul Iklan yang Mudah Ditemukan & Bikin Orang Ingin Baca</h4>
Judul adalah hal pertama yang dilihat orang saat menelusuri daftar iklan. Jika judulmu kurang jelas, terlalu panjang, atau tidak menyebutkan hal penting, besar kemungkinan orang akan langsung lewat begitu saja tanpa membaca deskripsinya. Buatlah judul yang singkat namun padat informasi: sebutkan nama barang atau jasa, keunggulan utama, dan lokasi jika penjualanmu bersifat lokal. Hindari kata-kata yang berlebihan atau tidak jujur seperti "paling murah sedunia" atau "pasti berhasil" tanpa bukti nyata. Contoh judul yang baik: "Jasa Servis AC Surabaya — Datang ke Lokasi & Bergaransi" — jauh lebih jelas dan menarik dibanding sekadar "Servis AC Murah". Gunakan juga kata kunci yang biasa dicari orang, misalnya jika kamu menjual makanan sehat, masukkan kata "sehat" atau "tanpa pengawet" di judul agar lebih mudah ditemukan lewat pencarian.

<h4>2. Isi Deskripsi Harus Jujur, Lengkap, dan Menjawab Semua Pertanyaan Pembeli</h4>
Saat menulis isi iklan, cobalah bayangkan dirimu adalah orang yang sedang mencari barang atau jasa seperti milikmu. Apa saja yang ingin kamu ketahui sebelum menghubungi penjual? Tuliskan semua hal tersebut secara terurut dan jelas. Sebutkan bahan atau komposisi barang, kondisi apakah baru atau bekas, ukuran, warna, cara pemakaian, keunggulan dibanding barang lain, serta alasan kenapa orang harus memilih barangmu. Jangan lupa jelaskan kapan barang tersedia, cara pengambilan atau pengiriman, serta cara pembayarannya. Yang paling penting adalah kejujuran: jika ada kekurangan, cacat kecil, atau syarat tertentu, sebutkan saja dengan terbuka. Hal ini justru akan membuat calon pembeli lebih percaya padamu, dan menghindari kesalahpahaman di kemudian hari.

<h4>3. Tips Memilih & Mengunggah Foto Produk yang Membangun Kepercayaan</h4>
Foto yang buram, terlalu gelap, atau hanya menyalin gambar dari internet tanpa izin adalah alasan utama orang ragu bertransaksi. Gunakanlah foto asli hasil jepretan sendiri di tempat yang cukup terang cahaya matahari, hindari menggunakan lampu kilat yang membuat bayangan keras. Tampilkan barang dari berbagai sisi: depan, samping, belakang, dan jika ada bagian yang istimewa, foto juga bagian tersebut. Jika kamu menjual makanan, pastikan tampilannya terlihat menggugah selera. Jika menjual jasa, tampilkan foto hasil pekerjaan yang sudah pernah kamu buat. Pastikan ukuran foto tidak terlalu besar agar halaman situs cepat terbuka di HP, tapi tetap terlihat jelas detailnya. Di Rewang Iklan, gambar otomatis disimpan dengan ukuran yang pas agar tidak membebani tampilan.

<h4>4. Aturan Beriklan yang Sopan, Aman, dan Tidak Melanggar Ketentuan</h4>
Rewang Iklan dibangun dengan semangat gotong royong dan saling membantu, jadi kita harus menjaga suasana yang baik bagi semua orang. Hindari penggunaan bahasa kasar, ujaran kebencian, persaingan yang tidak sehat dengan menjatuhkan pedagang lain, atau menjanjikan hal yang tidak mungkin dipenuhi. Dilarang juga beriklan barang atau jasa yang dilarang hukum, barang palsu, obat-obatan tanpa izin resmi, jasa penipuan, atau hal yang melanggar norma kesusilaan. Iklan yang baik adalah iklan yang tidak hanya menguntungkan penjual, tapi juga memberikan manfaat, keamanan, dan kepastian bagi calon pembeli. Iklan yang sopan dan jujur akan selalu lebih dihargai dan lebih cepat mendapatkan pelanggan.

<h4>5. Cara Memperbarui Iklan Agar Tetap Terlihat & Mendapat Lebih Banyak Pembeli</h4>
Jika dalam beberapa hari iklanmu belum banyak yang menghubungi, jangan langsung putus asa. Coba perbaiki sedikit bagian judul atau foto, lalu kirim ulang dengan deskripsi yang lebih menarik. Periksa juga apakah harga yang kamu tawarkan sudah sesuai dengan kualitas barang dan harga pasar di daerahmu. Jangan lupa untuk selalu membalas pesan calon pembeli dengan cepat, ramah, dan sabar — kesopananmu adalah iklan terbaik untuk usahamu sendiri. Jika kamu sudah menjual barangnya atau tidak lagi menerima pesanan, segera hapus iklan agar tidak menyesatkan orang lain. Dengan menjaga kualitas dan ketepatan informasi, iklanmu akan selalu dihargai oleh pengunjung Rewang Iklan.
`;

// Pengaturan potongan teks
const AWAL_KARAKTER = 500;
const TAMBAHAN_KARAKTER = 500;
let batasTampil = AWAL_KARAKTER;

// Tampilkan ringkasan saat halaman dibuka
window.addEventListener('load', () => {
  perbaruiTampilanPanduan();
});

function perbaruiTampilanPanduan() {
  const wadah = document.getElementById("isi-panduan");
  const tombolBaca = document.getElementById("btn-baca");
  const tombolSedikit = document.getElementById("btn-sedikit");

  if (batasTampil >= TEKS_PANDUAN.length) {
    wadah.innerHTML = TEKS_PANDUAN;
    tombolBaca.style.display = "none";
    tombolSedikit.style.display = "inline-block";
  } else {
    let potongan = TEKS_PANDUAN.substring(0, batasTampil);
    wadah.innerHTML = potongan + "...";
    tombolBaca.style.display = "inline-block";
    tombolSedikit.style.display = "none";
  }
}

function tambahPanduan() {
  batasTampil += TAMBAHAN_KARAKTER;
  perbaruiTampilanPanduan();
}

function kecilkanPanduan() {
  batasTampil = AWAL_KARAKTER;
  perbaruiTampilanPanduan();
  // Gulir ke atas bagian panduan
  document.getElementById("isi-panduan").scrollIntoView({behavior:"smooth"});
}
