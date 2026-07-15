        lucide.createIcons();

        const API_URL = "https://script.google.com/macros/s/AKfycbzwXBjQbOoHjb5btAFrja7llCgXT1KahBrI2-OyrfERGYy2XXkeXJxNNhdKyupqI6TK7w/exec";
        let allAds = [];
        const ITEM_PER_PAGE = 26;
        let currentDisplayCount = 0;

        async function fetchAds() {
            try {
                const res = await fetch(API_URL);
                allAds = await res.json();
                allAds = allAds.reverse();
                renderAllSections();
                startBannerRotation();
            } catch (err) {
                console.error("Gagal ambil data:", err);
                showEmptyState();
            }
        }

        function scrollSection(wrapperId, amount) {
            const el = document.getElementById(wrapperId);
            el.scrollBy({ left: amount, behavior: 'smooth' });
        }

        function openModal() {
            const modal = document.getElementById('modal-all');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            currentDisplayCount = 0;
            renderModalGrid();
        }
        function closeModal() {
            document.getElementById('modal-all').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        function createAdsenseBox() {
            const box = document.createElement('div');
            box.className = 'card flex items-center justify-center bg-gray-50 p-3 rounded-xl';
            box.innerHTML = `
                <div class="adsense-wrapper">
                    <ins class="adsbygoogle"
                         style="display:inline-block;width:250px;height:250px"
                         data-ad-client="ca-pub-6458870303612779"
                         data-ad-slot="9441731668"></ins>
                </div>
            `;
            setTimeout(() => { if (window.adsbygoogle) adsbygoogle.push({}); }, 150);
            return box;
        }

        function createAdCard(ad) {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.open(`https://rewangiklan.my.id/iklan-saya.html?id=${ad.id}`, '_blank');
            card.innerHTML = `
                <img src="${ad.image || 'https://picsum.photos/id/1040/400/250'}" alt="${ad.title || 'Iklan'}" class="card-image" loading="lazy">
                <div class="p-5">
                    <h3 class="text-lg font-semibold line-clamp-2 mb-2.5">${ad.title || 'Tanpa Judul'}</h3>
                    <p class="text-base text-gray-600 line-clamp-2 mb-4">${ad.description?.substring(0,70) || 'Klik untuk lihat detail lengkap'}...</p>
                    <div class="flex items-center justify-between text-base">
                        <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4"></i> ${ad.location || 'Lokasi tidak diketahui'}</span>
                        <span class="text-blue-600 font-semibold">${ad.category || 'Lainnya'}</span>
                    </div>
                </div>
            `;
            lucide.createIcons({context: card});
            return card;
        }

        function renderAllSections() {
            const properti = allAds.filter(a => a.category === 'Properti');
            const jasa = allAds.filter(a => a.category === 'Jasa');
            const lainnya = allAds.filter(a => !['Properti','Jasa'].includes(a.category));

            const renderList = (id, data, label) => {
                const cont = document.getElementById(id);
                cont.innerHTML = '';
                if (data.length) data.forEach(a => cont.appendChild(createAdCard(a)));
                else cont.innerHTML = `<div class="card-empty"><i data-lucide="inbox" class="w-10 h-10 text-gray-400 mb-3"></i><p class="text-base text-gray-500">Belum ada iklan ${label}</p></div>`;
            };

            renderList('properti-container', properti, 'Properti');
            renderList('jasa-container', jasa, 'Jasa & Layanan');
            renderList('lainnya-container', lainnya, 'Lainnya');
        }

        function renderModalGrid() {
            const grid = document.getElementById('modal-grid');
            grid.innerHTML = '';
            if (!allAds.length) {
                grid.innerHTML = `<div class="col-span-full text-center py-16"><i data-lucide="inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i><p class="text-gray-500 text-base">Belum ada iklan tersedia</p></div>`;
                return;
            }
            currentDisplayCount = ITEM_PER_PAGE;
            appendAdsToGrid(0, currentDisplayCount);
            addLoadMoreAndArrow();
        }

        function appendAdsToGrid(start, end) {
            const grid = document.getElementById('modal-grid');
            let hitung = 0;
            for (let i = start; i < end && i < allAds.length; i++) {
                grid.appendChild(createAdCard(allAds[i]));
                hitung++;
                if (hitung % 5 === 0) grid.appendChild(createAdsenseBox());
            }
        }

        function addLoadMoreAndArrow() {
            const grid = document.getElementById('modal-grid');
            const oldWrap = document.getElementById('btn-arrow-wrapper');
            if (oldWrap) oldWrap.remove();

            const wrapper = document.createElement('div');
            wrapper.id = 'btn-arrow-wrapper';
            wrapper.className = 'col-span-full flex items-center justify-center mt-10 mb-6 relative';

            if (currentDisplayCount < allAds.length) {
                const loadBtn = document.createElement('button');
                loadBtn.type = 'button';
                loadBtn.className = 'bg-blue-600 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md cursor-pointer z-30';
                loadBtn.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4"></i> Muat Lebih Banyak Iklan`;
                loadBtn.setAttribute('onclick', 'tambahIklanLagi()');
                wrapper.appendChild(loadBtn);
            }

            const upArrow = document.createElement('button');
            upArrow.type = 'button';
            upArrow.id = 'scroll-top-arrow';
            upArrow.className = 'absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all cursor-pointer z-40';
            upArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>`;
            
            upArrow.onclick = () => {
                const modal = document.getElementById('modal-all');
                const calonWadah = [
                    modal.querySelector('.modal-content'),
                    modal.querySelector('.modal-body'),
                    modal.querySelector('.modal-inner'),
                    modal.querySelector('.scroll-area'),
                    modal.querySelector('.scrollable'),
                    modal.querySelector('main'),
                    modal.querySelector('section'),
                    modal
                ];

                for (const wadah of calonWadah) {
                    if (wadah && wadah.scrollHeight > wadah.clientHeight) {
                        // Efek meluncur mulus
                        wadah.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                        break;
                    }
                }
            };

            wrapper.appendChild(upArrow);
            grid.appendChild(wrapper);
            lucide.createIcons({context: wrapper});
        }

        window.tambahIklanLagi = function() {
            const posisiAwal = currentDisplayCount;
            currentDisplayCount += ITEM_PER_PAGE;
            appendAdsToGrid(posisiAwal, currentDisplayCount);
            addLoadMoreAndArrow();
        }

        function startBannerRotation() {
            if (!allAds.length) return;
            const updateBanner = () => {
                const ad = allAds[Math.floor(Math.random() * allAds.length)];
                document.getElementById('banner-image').src = ad.image || 'https://picsum.photos/id/1040/1200/600';
                document.getElementById('banner-title').textContent = ad.title || 'Iklan Terbaru';
                document.getElementById('banner-desc').textContent = ad.description?.substring(0,130) + '...' || 'Klik untuk lihat detail lengkap';
            };
            updateBanner();
            setInterval(updateBanner, 10000);
        }

        function showEmptyState() {
            ['properti-container','jasa-container','lainnya-container'].forEach(id => {
                document.getElementById(id).innerHTML = `<div class="card-empty"><i data-lucide="alert-triangle" class="w-10 h-10 text-gray-400 mb-3"></i><p class="text-base text-gray-500">Gagal memuat iklan</p></div>`;
            });
            lucide.createIcons();
        }

        document.addEventListener('DOMContentLoaded', fetchAds);

// === CEK DAN BERITAHU PEMBARUAN VERSI ===
let versiBaruTersedia = false;

// Cek Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registrasi = await navigator.serviceWorker.register('/sw.js');
            
            // Cek kalau ada versi baru ditemukan
            registrasi.addEventListener('updatefound', () => {
                const pekerjaBaru = registrasi.installing;
                
                pekerjaBaru.addEventListener('statechange', () => {
                    // Kalau versi baru sudah siap dipakai
                    if (pekerjaBaru.state === 'installed' && navigator.serviceWorker.controller) {
                        versiBaruTersedia = true;
                        tampilkanNotifikasiPembaruan();
                    }
                });
            });

            // Cek pembaruan secara berkala tiap 1 jam
            setInterval(() => {
                registrasi.update();
            }, 60 * 60 * 1000);

        } catch (err) {
            console.log('Service Worker tidak aktif:', err);
        }
    });
}

// === TAMPILKAN NOTIFIKASI KE PENGGUNA ===
function tampilkanNotifikasiPembaruan() {
    const kotak = document.createElement('div');
    kotak.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(17,24,39,0.95);
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(255,255,255,0.2);
        z-index: 99999;
        max-width: 90%;
        text-align: center;
        font-size: 14px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.15);
    `;

    kotak.innerHTML = `
        <div style="margin-bottom: 10px;">✅ Ada pembaruan aplikasi tersedia!</div>
        <div style="display:flex; gap:10px; justify-content:center;">
            <button onclick="window.lokasiUlang()" style="padding:8px 16px; border:none; border-radius:8px; background:#2563EB; color:white; font-weight:500;">Muat Versi Baru</button>
            <button onclick="this.parentElement.parentElement.remove()" style="padding:8px 16px; border:none; border-radius:8px; background:rgba(255,255,255,0.1); color:white;">Nanti Saja</button>
        </div>
    `;

    document.body.appendChild(kotak);
}

// === FUNGSI UNTUK LANGSUNG GUNAKAN VERSI BARU ===
window.lokasiUlang = () => {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload(true); // true = ambil langsung dari server, bukan simpanan lama
};
