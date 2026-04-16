/**
 * app.js — Portal Literasi SMP Albanna
 *
 * Struktur:
 * 1. KONSTANTA & DATA STATIS
 * 2. STATE
 * 3. STORAGE HELPERS
 * 4. AUTH / LOGIN / LOGOUT
 * 5. NAVIGASI (switchTab)
 * 6. ASESMEN
 * 7. JURNAL
 * 8. DATABASE ADMIN
 * 9. RENDER HELPERS (buku, sidebar)
 * 10. FIREBASE REALTIME LISTENERS
 * 11. INIT & GLOBAL EXPORTS
 */

// ─────────────────────────────────────────────
// 1. KONSTANTA & DATA STATIS
// ─────────────────────────────────────────────

const BOOKS = [
  { id: 1, title: "SIBI",         author: "Kemendikdasmen", category: "Portal Buku",   color: "bg-blue-100",  link: "https://buku.kemendikdasmen.go.id/" },
  { id: 2, title: "Badan Bahasa", author: "Kemendikdasmen", category: "Portal Bahasa", color: "bg-green-100", link: "https://badanbahasa.kemendikdasmen.go.id/" },
];

const ASSESSMENT_DATA = [
  {
    textTitle: "Kerupuk, Pelengkap Makanan yang Mendunia",
    textContent: "Kerupuk merupakan makanan yang sangat populer di Indonesia. Konon, kerupuk sudah ada di Nusantara sejak abad ke-9 dan ke-10, terbukti dari prasasti kuno. Kerupuk kini bukan hanya makanan rakyat, tetapi juga komoditas ekspor yang mendunia, dikirim hingga puluhan ribu kilogram ke luar negeri.",
    questions: [
      { id: 1, q: "Berdasarkan informasi umum, manakah fakta yang paling tepat mengenai keberadaan kerupuk?", options: ["Kerupuk sudah ada di Nusantara sejak abad ke-9 dan ke-10.", "Kerupuk baru diperkenalkan oleh pedagang Eropa abad ke-18.", "Kerupuk hanya boleh dikonsumsi raja.", "Kerupuk ditemukan masa kemerdekaan."], correct: 0 },
      { id: 2, q: "Apa fungsi utama gambar bermacam-macam kerupuk dalam infografik?", options: ["Memberikan gambaran visual ragam jenis kerupuk.", "Memenuhi ruang kosong.", "Panduan resep masak.", "Membuktikan kerupuk mahal."], correct: 0 },
    ],
  },
  {
    textTitle: "Air Putih atau Air Mineral?",
    textContent: "Walaupun wujud, warna, dan rasanya cenderung mirip, air mineral dan air putih tidaklah sama. Menurut segi sumber, proses pengolahan, maupun kandungan, keduanya memiliki perbedaan yang jelas.",
    questions: [
      { id: 3, q: "Manakah pernyataan yang paling tepat mengenai perbedaan keduanya?", options: ["Keduanya berbeda dari segi sumber, proses pengolahan, dan kandungan.", "Istilah yang sama persis.", "Bedanya hanya di kemasan.", "Air mineral tidak boleh dimasak."], correct: 0 },
    ],
  },
  {
    textTitle: "Antre, Dong!",
    textContent: "Tia dan Devi sedang mengantre di kasir. Tiba-tiba seorang pemuda menyerobot. Ibu di belakangnya menegur, tapi pemuda itu beralasan buru-buru. Tia ikut menegur dengan sopan namun tegas. Akhirnya Pak Satpam datang menyelesaikan keributan.",
    questions: [
      { id: 4, q: "Siapakah tokoh yang akhirnya turun tangan menyelesaikan keributan?", options: ["Pak Satpam", "Kasir", "Ibu pengantre", "Tia"], correct: 0 },
      { id: 5, q: "Bagaimana perbedaan watak antara Tia dan pemuda tersebut?", options: ["Tia berani mengingatkan aturan, pemuda itu egois.", "Tia pemalu, pemuda disiplin.", "Tia acuh, pemuda darurat.", "Tia pemarah, pemuda sabar."], correct: 0 },
    ],
  },
  {
    textTitle: "Aduh, Panas!",
    textContent: "Ani terkena setrika panas. Kak Dita segera mengambil pelepah lidah buaya dan mengoleskan getahnya. Kak Dita menjelaskan bahwa getah lidah buaya mengandung glukomanan yang mendorong regenerasi sel dan kolagen.",
    questions: [
      { id: 6, q: "Mengapa Kak Dita menggunakan getah lidah buaya?", options: ["Mengandung senyawa penyembuh luka dan sensasi dingin.", "Satu-satunya tanaman di kebun.", "Tidak punya kotak P3K.", "Ani meminta herbal."], correct: 0 },
      { id: 7, q: "Apa kandungan lidah buaya yang merangsang pertumbuhan kulit baru?", options: ["Senyawa glukomanan dan kolagen", "Vitamin C dan Zat Besi", "Kalsium dan Protein", "Air dan Mineral"], correct: 0 },
    ],
  },
  {
    textTitle: "Melihat Orang Kejang? Jangan Panik",
    textContent: "Saat menolong orang kejang, hal terpenting adalah jangan panik. Kepanikan bisa membuat kita melakukan tindakan gegabah yang membahayakan korban.",
    questions: [
      { id: 8, q: "Mengapa kepanikan harus dihindari saat menolong?", options: ["Agar dapat berpikir jernih dan tidak membahayakan korban.", "Karena panik itu menular.", "Supaya tidak jadi tontonan.", "Karena akan didenda."], correct: 0 },
    ],
  },
  {
    textTitle: "Salah Kira",
    textContent: "Rania bangun pukul 6 pagi dan panik karena mengira terlambat sekolah. Ia buru-buru bersiap, melupakan buku gambar. Sampai di sekolah, gerbang tutup. Pak Gino memberitahu ini hari Minggu.",
    questions: [
      { id: 9,  q: "Peristiwa apa yang membuat Rania terkejut di sekolah?", options: ["Gerbang tutup karena hari Minggu.", "Lupa buku gambar.", "Terlambat.", "Tas tertinggal."], correct: 0 },
      { id: 10, q: "Mengapa Rania terburu-buru bangun?", options: ["Melihat jam pukul 6 dan mengira terlambat.", "Disuruh Ibu.", "Jam mati.", "Dijemput teman."], correct: 0 },
      { id: 11, q: "Barang apa yang dilihat Rania tapi TIDAK dibawa?", options: ["Buku gambar", "Kotak pensil", "Buku pelajaran", "Seragam"], correct: 0 },
      { id: 12, q: "Apa pelajaran dari cerita ini?", options: ["Pentingnya memeriksa jadwal/hari sebelum terburu-buru.", "Harus bangun jam 5.", "Jangan dengar orang tua.", "Sekolah harus buka tiap hari."], correct: 0 },
    ],
  },
];

// Hitung total soal sekali saja
const TOTAL_QUESTIONS = ASSESSMENT_DATA.reduce((sum, s) => sum + s.questions.length, 0);

// Kategori berdasarkan skor
const SCORE_CATEGORIES = [
  { min: 11, label: "Pembaca Mahir" },
  { min: 9,  label: "Pembaca Madya" },
  { min: 6,  label: "Pembaca Semenjana" },
  { min: 4,  label: "Pembaca Awal" },
  { min: 0,  label: "Pembaca Dini" },
];

// ─────────────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────────────

const state = {
  user:                 null,   // { name, kelas }
  currentTab:           'beranda',
  studentData:          {},     // { "7A": ["Nama1", "Nama2", ...], ... }
  userAssessmentResult: null,   // { score, total, category, ... }
};

// ─────────────────────────────────────────────
// 3. STORAGE HELPERS
// ─────────────────────────────────────────────

function userStorageKey(prefix) {
  if (!state.user) return prefix;
  const { name, kelas } = state.user;
  return `${prefix}__${kelas}__${encodeURIComponent(name)}`;
}

function saveUser(user)       { localStorage.setItem('albannaUser',     JSON.stringify(user)); }
function loadUser()           { return JSON.parse(localStorage.getItem('albannaUser') || 'null'); }
function clearUser()          { localStorage.removeItem('albannaUser'); }

function saveStudents(data)   { localStorage.setItem('albannaStudents', JSON.stringify(data)); }
function loadStudents()       { return JSON.parse(localStorage.getItem('albannaStudents') || '{}'); }

function saveAssessment(r)    { localStorage.setItem(userStorageKey('asesmen'), JSON.stringify(r)); }
function loadAssessment()     { return JSON.parse(localStorage.getItem(userStorageKey('asesmen')) || 'null'); }

// ─────────────────────────────────────────────
// 4. AUTH / LOGIN / LOGOUT
// ─────────────────────────────────────────────

function handleLogin() {
  const kelas = document.getElementById('input-class').value;
  const name  = document.getElementById('input-name').value;
  if (!kelas || !name) return;

  state.user = { name, kelas };
  saveUser(state.user);
  showDashboard();
}

function handleLogout() {
  if (!confirm('Keluar dari Portal Literasi?')) return;
  clearUser();
  state.user                 = null;
  state.userAssessmentResult = null;

  document.getElementById('dashboard-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('flex');
  document.getElementById('login-view').classList.remove('hidden');

  // Reset form login
  document.getElementById('input-class').value = '';
  const nameSelect = document.getElementById('input-name');
  nameSelect.innerHTML = '<option value="" disabled selected>-- Pilih Kelas Terlebih Dahulu --</option>';
  nameSelect.disabled  = true;
}

function showDashboard() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  document.getElementById('dashboard-view').classList.add('flex');

  const firstName = state.user.name.split(' ')[0];
  document.getElementById('display-name').textContent  = state.user.name;
  document.getElementById('display-class').textContent = state.user.kelas;
  document.getElementById('welcome-name').textContent  = firstName;
  document.getElementById('user-avatar').textContent   = state.user.name.substring(0, 2).toUpperCase();

  // Muat hasil asesmen dari localStorage jika ada
  state.userAssessmentResult = loadAssessment();
  updateDashboardGreeting();
  switchTab('beranda');
}

function populateStudentNames() {
  const kelas      = document.getElementById('input-class').value;
  const nameSelect = document.getElementById('input-name');

  nameSelect.innerHTML = '<option value="" disabled selected>-- Pilih Nama --</option>';

  const students = state.studentData[kelas] || [];

  if (students.length === 0) {
    nameSelect.disabled = true;
    nameSelect.classList.replace('bg-white', 'bg-gray-100');
    return;
  }

  students.forEach(name => {
    const opt     = document.createElement('option');
    opt.value     = name;
    opt.textContent = name;
    nameSelect.appendChild(opt);
  });

  nameSelect.disabled = false;
  nameSelect.classList.replace('bg-gray-100', 'bg-white');
  nameSelect.classList.remove('cursor-not-allowed');
}

// ─────────────────────────────────────────────
// 5. NAVIGASI
// ─────────────────────────────────────────────

const ALL_TABS = ['beranda', 'asesmen', 'kategori', 'koleksi', 'jurnal', 'database'];

function switchTab(tab) {
  state.currentTab = tab;

  ALL_TABS.forEach(t => {
    document.getElementById(`view-${t}`)?.classList.add('hidden');
    const nav = document.getElementById(`nav-${t}`);
    if (nav) {
      nav.classList.remove('active');
    }
  });

  document.getElementById(`view-${tab}`)?.classList.remove('hidden');
  document.getElementById(`nav-${tab}`)?.classList.add('active');

  // Side-effects saat buka tab tertentu
  if (tab === 'asesmen') checkAssessmentStatus();
}

// ─────────────────────────────────────────────
// 6. ASESMEN
// ─────────────────────────────────────────────

function renderAssessmentForm() {
  const container = document.getElementById('assessment-questions-container');

  const sectionsHTML = ASSESSMENT_DATA.map(section => `
    <div class="border-b border-gray-200 pb-6 mb-6">
      <h3 class="font-bold text-lg text-green-700 mb-2">${section.textTitle}</h3>
      <p class="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg mb-4 italic leading-relaxed">"${section.textContent}"</p>
      <div class="space-y-4">
        ${section.questions.map(q => `
          <div>
            <p class="font-medium text-gray-800 mb-2 text-sm">${q.id}. ${q.q}</p>
            <div class="grid grid-cols-1 gap-2">
              ${q.options.map((opt, i) => `
                <label class="assessment-option flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50 cursor-pointer transition">
                  <input type="radio" name="q${q.id}" value="${i}" required class="text-green-600 focus:ring-green-500">
                  <span class="text-sm text-gray-700">${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <form id="assessment-form" class="space-y-8">
      ${sectionsHTML}
      <button type="button" onclick="submitAssessment()"
        class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg">
        <i class="fas fa-paper-plane mr-2"></i> Kirim Jawaban & Lihat Hasil
      </button>
    </form>
  `;
}

function getCategoryFromScore(score) {
  return SCORE_CATEGORIES.find(c => score >= c.min)?.label ?? "Pembaca Dini";
}

async function submitAssessment() {
  const form = document.getElementById('assessment-form');
  if (!form) return;

  // Validasi: semua soal harus dijawab
  for (const section of ASSESSMENT_DATA) {
    for (const q of section.questions) {
      if (!form.querySelector(`input[name="q${q.id}"]:checked`)) {
        alert(`Soal nomor ${q.id} belum dijawab.`);
        return;
      }
    }
  }

  // Hitung skor
  let score = 0;
  ASSESSMENT_DATA.forEach(section => {
    section.questions.forEach(q => {
      const answer = form.querySelector(`input[name="q${q.id}"]:checked`)?.value;
      if (parseInt(answer) === q.correct) score++;
    });
  });

  const category = getCategoryFromScore(score);
  const result   = {
    name:      state.user.name,
    class:     state.user.kelas,
    category,
    score,
    total:     TOTAL_QUESTIONS,
    timestamp: new Date().toISOString(),
  };

  state.userAssessmentResult = result;
  saveAssessment(result);
  checkAssessmentStatus();       
  updateDashboardGreeting();

  // Simpan ke cloud
  if (window.FB) {
    const key    = `${state.user.kelas}_${encodeURIComponent(state.user.name)}`;
    const docRef = window.FB.doc(window.FB.db, 'artifacts', window.FB.appId, 'public', 'data', 'assessments', key);
    try {
      await window.FB.setDoc(docRef, result);
    } catch (err) {
      console.warn("[Asesmen] Gagal simpan cloud, data tersimpan lokal:", err);
    }
  }
}

function checkAssessmentStatus() {
  const questionsEl = document.getElementById('assessment-questions-container');
  const resultEl    = document.getElementById('assessment-result');

  const result = state.userAssessmentResult;

  if (result) {
    questionsEl.classList.add('hidden');
    document.getElementById('result-score').textContent    = `${result.score}/${result.total}`;
    document.getElementById('result-category').textContent = result.category;
    resultEl.classList.remove('hidden');
  } else {
    questionsEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    renderAssessmentForm();
  }
}

function updateDashboardGreeting() {
  const el       = document.getElementById('assessment-greeting');
  const category = state.userAssessmentResult?.category;

  el.innerHTML = category
    ? `Halo, kamu adalah <b>${category}</b>! <br><span class="text-sm opacity-90">Teruslah membaca untuk meningkatkan levelmu.</span>`
    : `Kamu belum melakukan asesmen. Yuk cek level membaca kamu sekarang!`;
}

// ─────────────────────────────────────────────
// 7. JURNAL
// ─────────────────────────────────────────────

function countWords() {
  const text = document.getElementById('jurnal-ringkasan').value.trim();
  const wordCount = text === "" ? 0 : text.split(/\s+/).length;
  const counterEl = document.getElementById('word-counter');
  
  counterEl.textContent = `${wordCount} kata`;
  if (wordCount < 50) {
    counterEl.className = "text-xs font-bold text-red-500";
  } else {
    counterEl.className = "text-xs font-bold text-green-600";
  }
}

function submitJournal() {
  const judul = document.getElementById('jurnal-judul').value.trim();
  const penulis = document.getElementById('jurnal-penulis').value.trim();
  const halAwal = document.getElementById('jurnal-hal-awal').value.trim();
  const halAkhir = document.getElementById('jurnal-hal-akhir').value.trim();
  const ringkasan = document.getElementById('jurnal-ringkasan').value.trim();

  if (!judul || !penulis || !halAwal || !halAkhir || !ringkasan) {
    alert("Semua kolom jurnal harus diisi, termasuk halaman.");
    return;
  }

  const wordCount = ringkasan === "" ? 0 : ringkasan.split(/\s+/).length;
  if (wordCount < 50) {
    alert(`Pemahaman Anda baru ${wordCount} kata. Minimal 50 kata.`);
    return;
  }

  // Optional: Simpan ke Firebase bisa ditambahkan di sini nantinya
  alert("Jurnal berhasil dikirim!");
  
  // Reset Form
  document.getElementById('jurnal-judul').value = '';
  document.getElementById('jurnal-penulis').value = '';
  document.getElementById('jurnal-hal-awal').value = '';
  document.getElementById('jurnal-hal-akhir').value = '';
  document.getElementById('jurnal-ringkasan').value = '';
  countWords(); // Reset counter
  switchTab('beranda');
}

// ─────────────────────────────────────────────
// 8. DATABASE ADMIN
// ─────────────────────────────────────────────

function accessDatabase() {
  const input = prompt("Masukkan Password Admin:");
  if (!input) return;

  // Validasi password admin
  if (input === "tumbler albanna") {
    // Tampilkan dashboard
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('flex');
    
    // Set identitas sebagai admin
    document.getElementById('display-name').textContent = "Administrator";
    document.getElementById('display-class').textContent = "Sistem Kontrol";
    document.getElementById('user-avatar').textContent = "AD";

    // Arahkan langsung ke tab database
    switchTab('database');
  } else {
    alert("Akses ditolak. Password tidak valid.");
  }
}

function generateBulkInputs() {
  const container = document.getElementById('bulk-inputs');
  const fragment  = document.createDocumentFragment();

  for (let i = 1; i <= 30; i++) {
    const input         = document.createElement('input');
    input.type          = 'text';
    input.name          = `student_${i}`;
    input.placeholder   = `Siswa ${i}`;
    input.className     = 'border border-gray-300 rounded p-2 text-sm focus:border-green-500 focus:outline-none';
    fragment.appendChild(input);
  }

  container.appendChild(fragment);
}

async function addBulkStudents() {
  const targetClass = document.getElementById('db-bulk-class').value;
  if (!targetClass) { alert("Pilih kelas terlebih dahulu!"); return; }

  const inputs = document.querySelectorAll('#bulk-inputs input[type="text"]');
  const names  = Array.from(inputs)
    .map(i => i.value.trim())
    .filter(Boolean);

  if (names.length === 0) { alert("Tidak ada nama yang dimasukkan."); return; }

  // Update state
  if (!state.studentData[targetClass]) state.studentData[targetClass] = [];
  state.studentData[targetClass].push(...names);

  // Bersihkan input
  inputs.forEach(i => i.value = '');

  // Simpan lokal dulu (optimistic)
  saveStudents(state.studentData);

  // Simpan ke cloud
  if (window.FB) {
    try {
      const docRef = window.FB.doc(window.FB.db, 'artifacts', window.FB.appId, 'public', 'data', 'students', 'master');
      await window.FB.setDoc(docRef, state.studentData, { merge: true });
      alert(`Berhasil menyimpan ${names.length} siswa ke Cloud (${targetClass}).`);
    } catch (err) {
      console.error("[DB] Gagal simpan cloud:", err);
      alert(`Tersimpan lokal (${names.length} siswa). Gagal sinkronisasi cloud.`);
    }
  } else {
    alert(`Tersimpan lokal (${names.length} siswa). Firebase tidak aktif.`);
  }
}

// ─────────────────────────────────────────────
// 9. RENDER HELPERS
// ─────────────────────────────────────────────

function renderBooks() {
  document.getElementById('book-grid').innerHTML = BOOKS.map(b => `
    <a href="${b.link}" target="_blank" rel="noopener noreferrer"
       class="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-4 group">
      <div class="${b.color} w-16 h-16 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
        <i class="fas fa-external-link-alt"></i>
      </div>
      <div>
        <h4 class="font-bold text-gray-800">${b.title}</h4>
        <p class="text-xs text-gray-500">${b.category}</p>
      </div>
    </a>
  `).join('');
}

// ─────────────────────────────────────────────
// 10. FIREBASE REALTIME LISTENERS
// ─────────────────────────────────────────────

function setupRealtimeListeners() {
  if (!window.FB) return;

  // --- Listener 1: Data Asesmen ---
  const assessmentsQuery = window.FB.query(
    window.FB.collection(window.FB.db, 'artifacts', window.FB.appId, 'public', 'data', 'assessments')
  );

  window.FB.onSnapshot(assessmentsQuery, (snapshot) => {
    // Siapkan object untuk menghitung jumlah tiap kategori
    const counters = { dini: 0, awal: 0, semenjana: 0, madya: 0, mahir: 0 };

    // Reset daftar kategori
    ['dini', 'awal', 'semenjana', 'madya', 'mahir'].forEach(c => {
      const el = document.getElementById(`list-${c}`);
      if (el) el.innerHTML = '';
    });

    let activeStudents = 0;
    const classCounts  = {};

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      activeStudents++;
      classCounts[data.class] = (classCounts[data.class] || 0) + 1;

      const catKey = data.category?.toLowerCase().replace('pembaca ', '');
      
      // Tambah counter
      if (counters[catKey] !== undefined) {
        counters[catKey]++;
      }

      // Masukkan ke list kategori
      const listEl = document.getElementById(`list-${catKey}`);
      if (listEl) {
        listEl.insertAdjacentHTML('beforeend', `
          <li class="border-b border-gray-100 pb-1 flex justify-between items-center">
            <span class="truncate w-24" title="${data.name}">${data.name}</span>
            <span class="text-[10px] bg-gray-100 rounded px-1 text-gray-500 font-mono">${data.class}</span>
          </li>
        `);
      }

      // Sinkronisasi cloud ke state user yang sedang login
      if (state.user && data.name === state.user.name && data.class === state.user.kelas) {
        state.userAssessmentResult = { score: data.score ?? 0, total: data.total ?? TOTAL_QUESTIONS, category: data.category };
        saveAssessment(state.userAssessmentResult);
        if (state.currentTab === 'asesmen') checkAssessmentStatus();
        updateDashboardGreeting();
      }
    });

    // Update UI Counter di Peta Literasi
    ['dini', 'awal', 'semenjana', 'madya', 'mahir'].forEach(c => {
      const countEl = document.getElementById(`count-${c}`);
      if (countEl) countEl.textContent = counters[c];
    });

    // Update dashboard stats
    document.getElementById('dashboard-active-students').innerHTML =
      `<span class="text-3xl font-bold text-gray-800">${activeStudents}</span> Siswa`;

    const topClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('dashboard-active-classes').innerHTML = topClass
      ? `<span class="text-3xl font-bold text-gray-800">${topClass[0]}</span> (${topClass[1]} Siswa)`
      : 'Belum ada data';
  });

  // --- Listener 2: Data Siswa ---
  const studentsRef = window.FB.doc(
    window.FB.db, 'artifacts', window.FB.appId, 'public', 'data', 'students', 'master'
  );

  window.FB.onSnapshot(studentsRef, (docSnap) => {
    if (!docSnap.exists()) return;
    state.studentData = docSnap.data();
    saveStudents(state.studentData);

    // Refresh dropdown nama jika sedang di halaman login
    if (!state.user) {
      const kelas = document.getElementById('input-class').value;
      if (kelas) populateStudentNames();
    }
  });
}

// ─────────────────────────────────────────────
// 11. INIT & GLOBAL EXPORTS
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  state.studentData = loadStudents();

  const savedUser = loadUser();
  if (savedUser) {
    state.user = savedUser;
    showDashboard();
  }

  renderBooks();
  generateBulkInputs();

  window.addEventListener('firebase-ready', (e) => {
    if (e.detail?.ok) setupRealtimeListeners();
  });
});

// Mengekspos fungsi-fungsi agar bisa dipanggil dari inline HTML
window.populateStudentNames = populateStudentNames;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.switchTab = switchTab;
window.submitAssessment = submitAssessment;
window.submitJournal = submitJournal;
window.accessDatabase = accessDatabase;
window.addBulkStudents = addBulkStudents;
window.countWords = countWords;
