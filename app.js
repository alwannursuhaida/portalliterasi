/* ============================================================
   SiLit — Sistem Literasi SMP Albanna
   app.js — Logika Aplikasi Utama
   Versi: 1.0 | Koneksi: Google Apps Script (REST API)
   ============================================================ */

// ─────────────────────────────────────────────
// KONFIGURASI — Ganti URL setelah deploy Apps Script
// ─────────────────────────────────────────────
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz0CcoAw0DpxtWcEE_-kQUMAbwnPo5tgGU4ahujOD9ju74Q5NsEsX3TM_6RNWVkfZMW/exec",
  ADMIN_PASSWORD: "albanna2025",   // Ganti sesuai kebutuhan
  MIN_KATA_JURNAL: 50,
  TOTAL_SOAL: 12,
};

// ─────────────────────────────────────────────
// BANK SOAL ASESMEN LITERASI
// Kategori berdasarkan skor:
//   0–2   → Pembaca Dini
//   3–5   → Pembaca Awal
//   6–8   → Pembaca Semenjana
//   9–10  → Pembaca Madya
//   11–12 → Pembaca Mahir
// ─────────────────────────────────────────────
const BANK_SOAL = [
  {
    soal: "Ketika membaca sebuah paragraf, apa yang pertama kali kamu perhatikan untuk memahami isinya?",
    opsi: ["Jumlah kalimat dalam paragraf", "Kata kunci dan ide pokok", "Panjang atau pendeknya paragraf", "Jenis huruf yang digunakan"],
    jawaban: 1
  },
  {
    soal: "Apa yang dimaksud dengan 'inferensi' dalam membaca?",
    opsi: ["Membaca ulang teks berkali-kali", "Menyimpulkan makna yang tidak tertulis langsung", "Mencatat semua kata sulit", "Membaca dengan suara keras"],
    jawaban: 1
  },
  {
    soal: "Seorang penulis menggunakan kata 'namun' di awal kalimat. Fungsi kata tersebut adalah...",
    opsi: ["Menambahkan informasi baru", "Menunjukkan pertentangan atau kontras", "Menyimpulkan isi paragraf", "Memberikan contoh"],
    jawaban: 1
  },
  {
    soal: "Kamu membaca berita tentang banjir. Manakah pertanyaan kritis yang paling tepat untuk diajukan?",
    opsi: ["Berapa banyak foto yang ada di artikel?", "Apakah penyebab yang disebutkan didukung oleh data?", "Siapa yang menulis artikel ini?", "Kapan artikel ini diterbitkan?"],
    jawaban: 1
  },
  {
    soal: "Teks eksposisi bertujuan untuk...",
    opsi: ["Menghibur pembaca dengan cerita menarik", "Meyakinkan pembaca untuk melakukan sesuatu", "Menjelaskan suatu topik secara faktual dan objektif", "Mengungkapkan perasaan penulis"],
    jawaban: 2
  },
  {
    soal: "Apa perbedaan utama antara fakta dan opini dalam sebuah teks?",
    opsi: ["Fakta selalu lebih panjang dari opini", "Fakta dapat diverifikasi, opini bersifat subjektif", "Opini selalu salah, fakta selalu benar", "Tidak ada perbedaan antara keduanya"],
    jawaban: 1
  },
  {
    soal: "Ketika menemukan kata yang tidak kamu ketahui artinya, strategi terbaik adalah...",
    opsi: ["Langsung melewati kata tersebut", "Menutup buku dan berhenti membaca", "Menggunakan konteks kalimat untuk memperkirakan maknanya", "Mengganti kata tersebut dengan kata lain"],
    jawaban: 2
  },
  {
    soal: "Sebuah paragraf yang baik biasanya dimulai dengan...",
    opsi: ["Kalimat penjelas yang panjang", "Contoh konkret", "Kalimat topik yang menyatakan ide utama", "Kutipan dari tokoh terkenal"],
    jawaban: 2
  },
  {
    soal: "Teks argumentasi yang kuat harus memiliki...",
    opsi: ["Banyak kata-kata emosional", "Klaim yang didukung oleh bukti dan logika", "Kalimat yang sangat panjang", "Hanya pendapat penulis tanpa data"],
    jawaban: 1
  },
  {
    soal: "Membaca memindai (scanning) paling tepat digunakan untuk...",
    opsi: ["Memahami seluruh isi novel", "Menemukan informasi spesifik dengan cepat", "Menikmati alur cerita fiksi", "Menganalisis gaya bahasa penulis"],
    jawaban: 1
  },
  {
    soal: "Apa yang dimaksud dengan 'kohesi' dalam sebuah teks?",
    opsi: ["Keindahan tampilan visual teks", "Keterkaitan antar kalimat dan paragraf secara gramatikal", "Jumlah halaman sebuah buku", "Kemampuan penulis menghibur pembaca"],
    jawaban: 1
  },
  {
    soal: "Setelah membaca sebuah artikel, langkah refleksi yang paling baik adalah...",
    opsi: ["Langsung membaca artikel lain", "Merangkum isi, mengevaluasi argumen, dan menghubungkan dengan pengetahuan yang sudah ada", "Mengingat semua kalimat yang ada", "Menceritakan ulang artikel kata per kata"],
    jawaban: 1
  },
];

const KATEGORI_INFO = {
  "Pembaca Dini":      { min: 0,  max: 2,  desc: "Kamu baru memulai perjalanan membaca. Terus berlatih dan jangan menyerah!" },
  "Pembaca Awal":      { min: 3,  max: 5,  desc: "Kamu sudah mulai memahami teks sederhana. Tingkatkan frekuensi membacamu!" },
  "Pembaca Semenjana": { min: 6,  max: 8,  desc: "Kemampuan membacamu cukup baik. Tantang dirimu dengan teks yang lebih kompleks." },
  "Pembaca Madya":     { min: 9,  max: 10, desc: "Kamu sudah mampu membaca secara kritis. Pertahankan dan terus tingkatkan!" },
  "Pembaca Mahir":     { min: 11, max: 12, desc: "Luar biasa! Kamu adalah pembaca mahir yang mampu menganalisis teks secara mendalam." },
};

const KOLEKSI_BUKU = [
  { emoji: "📚", judul: "iPusnas", desc: "Perpustakaan digital nasional gratis. Ribuan buku fiksi dan nonfiksi tersedia.", url: "https://ipusnas.id" },
  { emoji: "🌐", judul: "Buku Sekolah Elektronik (BSE)", desc: "Buku pelajaran resmi Kemendikbud bisa diakses dan diunduh gratis.", url: "https://buku.kemdikbud.go.id" },
  { emoji: "📖", judul: "Lumen Learning", desc: "Materi pelajaran berbahasa Inggris dengan penjelasan interaktif.", url: "https://lumenlearning.com" },
  { emoji: "🔬", judul: "Khan Academy", desc: "Belajar sains, matematika, dan humaniora secara gratis dan terstruktur.", url: "https://id.khanacademy.org" },
  { emoji: "🗞️", judul: "Kompas.id — Junior", desc: "Berita dan artikel pilihan yang sesuai untuk pelajar.", url: "https://www.kompas.id" },
  { emoji: "📰", judul: "Cerpen Indonesia", desc: "Kumpulan cerpen dan karya sastra Indonesia pilihan untuk dibaca.", url: "https://cerpen-sastra.com" },
];

// ─────────────────────────────────────────────
// STATE APLIKASI
// ─────────────────────────────────────────────
let state = {
  user: null,        // { nama, kelas }
  isAdmin: false,
  quiz: {
    soalAcak: [],
    currentIdx: 0,
    jawaban: [],     // index jawaban per soal
    selesai: false,
  },
  peta: [],          // data asesmen dari server
};

// ─────────────────────────────────────────────
// UTILITAS (Diperbarui)
// ─────────────────────────────────────────────
function showToast(msg, isError = false) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const t = document.createElement("div");
  t.className = "toast" + (isError ? " error" : "");
  t.innerHTML = `<i class="fas fa-${isError ? "circle-exclamation" : "circle-check"}"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatTanggal(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function acakArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getKategori(skor) {
  for (const [nama, info] of Object.entries(KATEGORI_INFO)) {
    if (skor >= info.min && skor <= info.max) return nama;
  }
  return "Pembaca Dini";
}

// FUNGSI KOMUNIKASI SERVER TERPADU
async function apiCall(action, payload = {}) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);
  
  for (const [k, v] of Object.entries(payload)) {
    url.searchParams.set(k, v);
  }
  
  // Cache Buster: Memastikan Google tidak memberikan data usang
  url.searchParams.set("t", new Date().getTime());

  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error("Koneksi ditolak oleh server.");
  
  const data = await res.json();
  
  // Jika server melempar error, aplikasikan penolakan langsung
  if (data.status === "error") {
    throw new Error(data.message);
  }
  
  return data;
}

// MENGALIHKAN FUNGSI POST KE DALAM JALUR GET
async function apiPost(action, payload = {}) {
  return await apiCall(action, payload);
}

// ─────────────────────────────────────────────
// LOGIN & AUTH
// ─────────────────────────────────────────────
async function onKelasChange() {
  const kelas = document.getElementById("input-class").value;
  const nameSelect = document.getElementById("input-name");

  nameSelect.disabled = true;
  nameSelect.innerHTML = '<option value="" disabled selected>Memuat...</option>';

  try {
    const data = await apiCall("getSiswa", { kelas });
    nameSelect.innerHTML = '<option value="" disabled selected>— Pilih Nama —</option>';

    if (!data.siswa || data.siswa.length === 0) {
      nameSelect.innerHTML = '<option value="" disabled selected>Belum ada siswa di kelas ini</option>';
      return;
    }

    data.siswa.forEach(nama => {
      const opt = document.createElement("option");
      opt.value = nama;
      opt.textContent = nama;
      nameSelect.appendChild(opt);
    });
    nameSelect.disabled = false;
  } catch (e) {
    nameSelect.innerHTML = '<option value="" disabled selected>Gagal memuat data</option>';
    showToast("Tidak dapat terhubung ke database.", true);
  }
}

function handleLogin() {
  const kelas = document.getElementById("input-class").value;
  const nama  = document.getElementById("input-name").value;

  if (!kelas || !nama) {
    showToast("Pilih kelas dan nama siswa terlebih dahulu.", true);
    return;
  }

  state.user = { nama, kelas };
  state.isAdmin = false;
  enterDashboard();
}

function openAdminModal() {
  document.getElementById("admin-pass").value = "";
  document.getElementById("admin-modal").style.display = "flex";
  setTimeout(() => document.getElementById("admin-pass").focus(), 100);
}

function checkAdminPass() {
  const pass = document.getElementById("admin-pass").value;
  if (pass === CONFIG.ADMIN_PASSWORD) {
    document.getElementById("admin-modal").style.display = "none";
    state.user = { nama: "Administrator", kelas: "Admin" };
    state.isAdmin = true;
    enterDashboard();
    switchPage("admin");
  } else {
    showToast("Kata sandi salah.", true);
    document.getElementById("admin-pass").value = "";
  }
}

function handleLogout() {
  state.user = null;
  state.isAdmin = false;
  document.getElementById("view-dashboard").classList.remove("active");
  document.getElementById("view-dashboard").style.display = "";
  document.getElementById("view-login").classList.add("active");
  document.getElementById("view-login").style.display = "flex";
  resetAsesmen();
}

function enterDashboard() {
  document.getElementById("view-login").classList.remove("active");
  document.getElementById("view-login").style.display = "none";
  document.getElementById("view-dashboard").classList.add("active");
  document.getElementById("view-dashboard").style.display = "flex";

  // Update UI user
  const inisial = state.user.nama.charAt(0).toUpperCase();
  document.getElementById("sidebar-avatar").textContent = inisial;
  document.getElementById("sidebar-name").textContent = state.user.nama;
  document.getElementById("sidebar-class").textContent = "Kelas " + state.user.kelas;
  document.getElementById("profile-avatar").textContent = inisial;
  document.getElementById("profile-name").textContent = state.user.nama;
  document.getElementById("profile-class").textContent = "Kelas " + state.user.kelas;
  document.getElementById("profile-card-wrap").setAttribute("data-initial", inisial);

  // Admin nav
  document.getElementById("nav-admin-wrap").style.display = state.isAdmin ? "block" : "none";

  // Load data beranda
  loadBerandaStats();
  renderKoleksi();
  initAsesmen();
}

// ─────────────────────────────────────────────
// NAVIGASI
// ─────────────────────────────────────────────
function switchPage(page) {
  document.querySelectorAll(".page-section").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  
  document.getElementById("page-" + page).classList.add("active");
  const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add("active");

  // Pemicu pemuatan data halaman secara dinamis
  if (page === "beranda") loadLeaderboard(); // <-- Tambahkan ini
  if (page === "ulasan") loadUlasanHistory();
  if (page === "admin") {
    loadAdminAsesmen();
    loadAdminJurnal();
  }
  if (page === "peta") loadPeta();
  if (page === "koleksi") renderBuku();
   if (page === "laporan") loadLaporan(); // <-- Pemicu baru
}

// ─────────────────────────────────────────────
// BERANDA — STATISTIK
// ─────────────────────────────────────────────
async function loadBerandaStats() {
  try {
    const data = await apiCall("getStatsSiswa", {
      nama: state.user.nama,
      kelas: state.user.kelas
    });

    document.getElementById("stat-skor").textContent = data.skorTerakhir !== null ? data.skorTerakhir : "—";
    document.getElementById("stat-jurnal").textContent = data.jumlahJurnal || 0;
    document.getElementById("stat-kategori").textContent = data.kategori || "—";
    document.getElementById("profile-badge-text").textContent = data.kategori || "Belum asesmen";
  } catch (e) {
    // Gagal load stats — tampilkan default, tidak perlu toast
  }
}

// ─────────────────────────────────────────────
// ASESMEN
// ─────────────────────────────────────────────
function initAsesmen() {
  state.quiz.soalAcak = acakArray(BANK_SOAL).slice(0, CONFIG.TOTAL_SOAL);
  state.quiz.currentIdx = 0;
  state.quiz.jawaban = new Array(CONFIG.TOTAL_SOAL).fill(null);
  state.quiz.selesai = false;

  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("result-container").style.display = "none";
  renderSoal();
}

function resetAsesmen() {
  initAsesmen();
}

function renderSoal() {
  const idx = state.quiz.currentIdx;
  const total = CONFIG.TOTAL_SOAL;
  const soal = state.quiz.soalAcak[idx];

  // Progress
  const pct = (idx / total) * 100;
  document.getElementById("quiz-progress-fill").style.width = pct + "%";
  document.getElementById("quiz-count").textContent = `${idx + 1} / ${total}`;

  // Soal
  document.getElementById("question-text").textContent = soal.soal;

  // Opsi
  const letters = ["A", "B", "C", "D"];
  const container = document.getElementById("options-container");
  container.innerHTML = "";

  soal.opsi.forEach((opsi, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn" + (state.quiz.jawaban[idx] === i ? " selected" : "");
    btn.innerHTML = `<span class="opt-letter">${letters[i]}</span> ${opsi}`;
    btn.onclick = () => pilihJawaban(i);
    container.appendChild(btn);
  });

  // Tombol lanjut
  document.getElementById("btn-next").disabled = state.quiz.jawaban[idx] === null;
  document.getElementById("btn-next").textContent =
    idx === total - 1 ? "Selesai" : "Lanjut →";
}

function pilihJawaban(idx) {
  state.quiz.jawaban[state.quiz.currentIdx] = idx;
  renderSoal();
}

async function nextQuestion() {
  const idx = state.quiz.currentIdx;
  if (state.quiz.jawaban[idx] === null) return;

  if (idx < CONFIG.TOTAL_SOAL - 1) {
    state.quiz.currentIdx++;
    renderSoal();
  } else {
    await selesaikanAsesmen();
  }
}

async function selesaikanAsesmen() {
  // Hitung skor
  let skor = 0;
  state.quiz.soalAcak.forEach((soal, i) => {
    if (state.quiz.jawaban[i] === soal.jawaban) skor++;
  });

  const kategori = getKategori(skor);
  const info = KATEGORI_INFO[kategori];

  // Tampilkan hasil
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result-container").style.display = "block";
  document.getElementById("result-score").textContent = skor;
  document.getElementById("result-label").textContent = kategori;
  document.getElementById("result-desc").textContent = info.desc;

  // Animasi skor
  animateNumber("result-score", 0, skor, 800);

  // Simpan ke database
  try {
    await apiPost("simpanAsesmen", {
      nama: state.user.nama,
      kelas: state.user.kelas,
      skor,
      kategori,
      timestamp: new Date().toISOString(),
    });
    showToast("Hasil asesmen berhasil disimpan!");
    loadBerandaStats();
  } catch (e) {
    showToast("Hasil dihitung, tapi gagal disimpan ke database.", true);
  }
}

function animateNumber(id, from, to, dur) {
  const el = document.getElementById(id);
  const step = (to - from) / (dur / 16);
  let cur = from;
  const timer = setInterval(() => {
    cur = Math.min(cur + step, to);
    el.textContent = Math.round(cur);
    if (cur >= to) clearInterval(timer);
  }, 16);
}

// ─────────────────────────────────────────────
// PETA LITERASI
// ─────────────────────────────────────────────
async function loadPeta() {
  const filter = document.getElementById("peta-filter-kelas").value;
  const lists = ["dini","awal","semenjana","madya","mahir"];
  lists.forEach(k => {
    document.getElementById("list-" + k).innerHTML = '<p class="peta-empty"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</p>';
    document.getElementById("count-" + k).textContent = "0";
  });

  try {
    const params = filter ? { kelas: filter } : {};
    const data = await apiCall("getAsesmen", params);
    state.peta = data.asesmen || [];
    renderPeta();
  } catch (e) {
    lists.forEach(k => {
      document.getElementById("list-" + k).innerHTML = '<p class="peta-empty" style="color:#ef4444">Gagal memuat</p>';
    });
    showToast("Gagal memuat peta literasi.", true);
  }
}

function renderPeta() {
  const filter = document.getElementById("peta-filter-kelas").value;
  const data = filter ? state.peta.filter(r => r.kelas === filter) : state.peta;

  const kelompok = {
    "Pembaca Dini":      { key: "dini",      items: [] },
    "Pembaca Awal":      { key: "awal",      items: [] },
    "Pembaca Semenjana": { key: "semenjana", items: [] },
    "Pembaca Madya":     { key: "madya",     items: [] },
    "Pembaca Mahir":     { key: "mahir",     items: [] },
  };

  // Ambil data terbaru per siswa
  const terbaru = {};
  data.forEach(r => {
    const uid = r.kelas + "|" + r.nama;
    if (!terbaru[uid] || r.timestamp > terbaru[uid].timestamp) {
      terbaru[uid] = r;
    }
  });

  Object.values(terbaru).forEach(r => {
    if (kelompok[r.kategori]) kelompok[r.kategori].items.push(r);
  });

  Object.entries(kelompok).forEach(([kat, obj]) => {
    const listEl = document.getElementById("list-" + obj.key);
    const countEl = document.getElementById("count-" + obj.key);
    countEl.textContent = obj.items.length;

    if (obj.items.length === 0) {
      listEl.innerHTML = '<p class="peta-empty">Kosong</p>';
    } else {
      listEl.innerHTML = obj.items.map(r =>
        `<div class="peta-item" title="${r.kelas} — Skor: ${r.skor}">${r.nama}</div>`
      ).join("");
    }
  });
}

// ─────────────────────────────────────────────
// KOLEKSI BUKU
// ─────────────────────────────────────────────
function renderKoleksi() {
  const grid = document.getElementById("book-grid");
  grid.innerHTML = KOLEKSI_BUKU.map(b => `
    <div class="book-card">
      <div class="book-icon">${b.emoji}</div>
      <h3>${b.judul}</h3>
      <p>${b.desc}</p>
      <a href="${b.url}" target="_blank" rel="noopener">
        Kunjungi <i class="fas fa-arrow-up-right-from-square" style="font-size:11px"></i>
      </a>
    </div>
  `).join("");
}

// ─────────────────────────────────────────────
// JURNAL
// ─────────────────────────────────────────────
function countWords() {
  const text = document.getElementById("jurnal-ringkasan").value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const counter = document.getElementById("word-counter");
  counter.textContent = `${words} / ${CONFIG.MIN_KATA_JURNAL} kata`;
  counter.className = "word-counter " + (words >= CONFIG.MIN_KATA_JURNAL ? "ok" : "warn");
}

async function submitJurnal() {
  const judul    = document.getElementById("jurnal-judul").value.trim();
  const penulis  = document.getElementById("jurnal-penulis").value.trim();
  const halAwal  = document.getElementById("jurnal-hal-awal").value;
  const halAkhir = document.getElementById("jurnal-hal-akhir").value;
  const ringkasan = document.getElementById("jurnal-ringkasan").value.trim();
  const words    = ringkasan ? ringkasan.split(/\s+/).length : 0;

  if (!judul || !penulis || !halAwal || !halAkhir || !ringkasan) {
    showToast("Lengkapi semua kolom jurnal terlebih dahulu.", true); return;
  }
  if (parseInt(halAkhir) < parseInt(halAwal)) {
    showToast("Halaman akhir tidak boleh kurang dari halaman awal.", true); return;
  }
  if (words < CONFIG.MIN_KATA_JURNAL) {
    showToast(`Ringkasan minimal ${CONFIG.MIN_KATA_JURNAL} kata. Saat ini: ${words} kata.`, true); return;
  }

  const btn = document.querySelector("#page-jurnal .btn-primary");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Menyimpan...';

  try {
    await apiPost("simpanJurnal", {
      nama: state.user.nama,
      kelas: state.user.kelas,
      judul, penulis,
      halAwal, halAkhir,
      ringkasan,
      timestamp: new Date().toISOString(),
    });

    showToast("Jurnal berhasil disimpan!");

    // Reset form
    ["jurnal-judul","jurnal-penulis","jurnal-hal-awal","jurnal-hal-akhir","jurnal-ringkasan"]
      .forEach(id => document.getElementById(id).value = "");
    countWords();
    loadJurnalHistory();
    loadBerandaStats();
  } catch (e) {
    showToast("Gagal menyimpan jurnal. Coba lagi.", true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px"></i>Kirim Jurnal';
  }
}

async function loadJurnalHistory() {
  const container = document.getElementById("jurnal-history-list");
  container.innerHTML = '<p style="color:#bbb;font-size:13px"><i class="fas fa-circle-notch fa-spin"></i> Memuat riwayat...</p>';

  try {
    const data = await apiCall("getJurnal", {
      nama: state.user.nama,
      kelas: state.user.kelas
    });

    const items = data.jurnal || [];
    if (items.length === 0) {
      container.innerHTML = '<p style="color:#bbb;font-size:13px">Belum ada jurnal yang ditulis.</p>';
      return;
    }

    container.innerHTML = items.reverse().map(j => `
      <div class="journal-item">
        <div class="journal-item-title">📖 ${j.judul} <span style="font-weight:400;color:var(--ink-soft)">– ${j.penulis}</span></div>
        <div class="journal-item-meta">Halaman ${j.halAwal}–${j.halAkhir} &nbsp;·&nbsp; ${formatTanggal(j.timestamp)}</div>
        <div class="journal-item-body">${j.ringkasan}</div>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<p style="color:#ef4444;font-size:13px">Gagal memuat riwayat jurnal.</p>';
  }
}

// ─────────────────────────────────────────────
// ADMIN — INPUT MASSAL SISWA
// ─────────────────────────────────────────────
function initAdminBulk() {
  const container = document.getElementById("bulk-inputs");
  if (container.children.length > 0) return;
  container.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "bulk-input";
    input.placeholder = `Siswa ${i}`;
    input.id = `bulk-${i}`;
    container.appendChild(input);
  }
}

async function addBulkStudents() {
  const kelas = document.getElementById("db-bulk-class").value;
  if (!kelas) { showToast("Pilih kelas target terlebih dahulu.", true); return; }

  const names = [];
  for (let i = 1; i <= 30; i++) {
    const val = document.getElementById(`bulk-${i}`).value.trim();
    if (val) names.push(val);
  }

  if (names.length === 0) { showToast("Isi minimal satu nama siswa.", true); return; }

  const btn = document.querySelector(".btn-save");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Menyimpan...';

  try {
    await apiPost("simpanSiswa", {
      kelas,
      namaSiswa: JSON.stringify(names),
    });
    showToast(`${names.length} siswa berhasil disimpan ke kelas ${kelas}!`);
    // Reset inputs
    for (let i = 1; i <= 30; i++) document.getElementById(`bulk-${i}`).value = "";
  } catch (e) {
    // Memunculkan pesan error jujur dari server
    showToast(e.message || "Gagal menyimpan data siswa.", true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Simpan ke Database';
  }
}

// ─────────────────────────────────────────────
// ADMIN — TABS
// ─────────────────────────────────────────────
function switchAdminTab(tab) {
  ["input","asesmen","jurnal"].forEach(t => {
    document.getElementById("admin-tab-" + t).style.display = t === tab ? "block" : "none";
  });
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", ["input","asesmen","jurnal"][i] === tab);
  });
}

async function loadAdminAsesmen() {
  const tbody = document.getElementById("admin-asesmen-body");
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</td></tr>';

  try {
    const data = await apiCall("getAsesmen");
    const items = data.asesmen || [];

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada data asesmen</td></tr>';
      return;
    }

    tbody.innerHTML = items.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${formatTanggal(r.timestamp)}</td>
        <td><strong>${r.kelas}</strong></td>
        <td>${r.nama}</td>
        <td><strong>${r.skor}/12</strong></td>
        <td><span style="font-weight:700;color:var(--green-deep)">${r.kategori}</span></td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat data</td></tr>';
    showToast("Gagal memuat data asesmen.", true);
  }
}

async function loadAdminJurnal() {
  const tbody = document.getElementById("admin-jurnal-body");
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</td></tr>';

  try {
    const data = await apiCall("getAllJurnal");
    const items = data.jurnal || [];

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada data jurnal</td></tr>';
      return;
    }

    tbody.innerHTML = items.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${formatTanggal(r.timestamp)}</td>
        <td><strong>${r.kelas}</strong></td>
        <td>${r.nama}</td>
        <td>${r.judul}</td>
        <td>${r.halAwal}–${r.halAkhir}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat data</td></tr>';
    showToast("Gagal memuat data jurnal.", true);
  }
}
// ─────────────────────────────────────────────
// ULASAN BUKU
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ULASAN BUKU (VERSI ANALISIS KETAT)
// ─────────────────────────────────────────────

// Koleksi Meme Acak (Sopan & Lucu)
const KOLEKSI_MEME = [
  { 
    title: "Luar Biasa! 🧠✨", 
    desc: "Membaca ulasanmu membuktikan satu hal: kapasitas otakmu baru saja bertambah berat 10 gram hari ini.", 
    img: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif" 
  },
  { 
    title: "Analisis Tajam! 🪒", 
    desc: "Kritikmu lebih tajam dari silet cukur. Para filsuf dan kritikus sastra pasti menangis haru melihat tulisanmu.", 
    img: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif" 
  },
  { 
    title: "Terima Kasih, Ilmuwan! 🔬", 
    desc: "Pemahamanmu tentang buku ini sangat mendalam. Kami curiga kamu sebenarnya penulis bayangannya.", 
    img: "https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif" 
  },
  { 
    title: "Selesai Dieksekusi! ☕", 
    desc: "Tugas selesai. Sekarang kamu boleh istirahat, minum teh, dan membanggakan dirimu selama 5 menit.", 
    img: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" 
  }
];

// Helper: Menghitung kata secara real-time
function hitungKataUlasan(inputId, counterId, minWords) {
  const text = document.getElementById(inputId).value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const counter = document.getElementById(counterId);
  counter.textContent = `${words} / ${minWords} kata`;
  counter.className = "word-counter " + (words >= minWords ? "ok" : "warn");
  return words;
}

async function submitUlasanBaru() {
  // Ambil data
  const judul = document.getElementById("ulasan-judul").value.trim();
  const penulis = document.getElementById("ulasan-penulis").value.trim();
  const rating = document.getElementById("ulasan-rating").value;
  const kesan = document.getElementById("ulasan-kesan").value.trim();

  // Validasi Ketat Minimal 25 Kata
  const wKandungan = hitungKataUlasan('ulasan-kandungan', 'count-kandungan', 25);
  const wKekuatan = hitungKataUlasan('ulasan-kekuatan', 'count-kekuatan', 25);
  const wKelemahan = hitungKataUlasan('ulasan-kelemahan', 'count-kelemahan', 25);

  if (!judul || !penulis) {
    showToast("Identitas buku (Judul & Penulis) tidak boleh kosong.", true); return;
  }
  
  if (wKandungan < 25 || wKekuatan < 25 || wKelemahan < 25) {
    showToast("Sikap skeptis membutuhkan analisis mendalam! Penuhi batas minimal 25 kata di setiap kotak evaluasi.", true); 
    return;
  }

  const btn = document.getElementById("btn-submit-ulasan");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Menyerahkan Bukti...';

  try {
    await apiPost("simpanUlasan", {
      nama: state.user.nama,
      kelas: state.user.kelas,
      judulBuku: judul,
      penulisBuku: penulis,
      rating: rating,
      ulasanKandungan: document.getElementById("ulasan-kandungan").value.trim(),
      kekuatanBuku: document.getElementById("ulasan-kekuatan").value.trim(),
      kelemahanBuku: document.getElementById("ulasan-kelemahan").value.trim(),
      kesanBuku: kesan,
      timestamp: new Date().toISOString(),
    });

    // Reset Form
    ["judul", "penulis", "kandungan", "kekuatan", "kelemahan", "kesan"].forEach(id => {
      document.getElementById(`ulasan-${id}`).value = "";
    });
    document.getElementById("ulasan-rating").value = "5";
    
    // Reset Counter UI
    hitungKataUlasan('ulasan-kandungan', 'count-kandungan', 25);
    hitungKataUlasan('ulasan-kekuatan', 'count-kekuatan', 25);
    hitungKataUlasan('ulasan-kelemahan', 'count-kelemahan', 25);

    loadUlasanHistory(); // Refresh riwayat

    // PANGGIL KEJUTAN MEME
    const randomMeme = KOLEKSI_MEME[Math.floor(Math.random() * KOLEKSI_MEME.length)];
    document.getElementById("meme-title").textContent = randomMeme.title;
    document.getElementById("meme-desc").textContent = randomMeme.desc;
    document.getElementById("meme-img").src = randomMeme.img;
    document.getElementById("meme-modal").style.display = "flex";

  } catch (e) {
    showToast("Gagal menyimpan ulasan. Pastikan koneksi stabil. " + e.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px"></i>Kirim Evaluasi Kritis';
  }
}

async function loadUlasanHistory() {
  const container = document.getElementById("ulasan-history-list");
  container.innerHTML = '<p style="color:#bbb;font-size:13px"><i class="fas fa-circle-notch fa-spin"></i> Menarik data arsip...</p>';

  try {
    const data = await apiCall("getUlasan", {
      nama: state.user.nama,
      kelas: state.user.kelas
    });

    const items = data.ulasan || [];
    if (items.length === 0) {
      container.innerHTML = '<p style="color:#bbb;font-size:13px">Belum ada jejak evaluasi yang ditemukan.</p>';
      return;
    }

    container.innerHTML = items.reverse().map(u => `
      <div class="journal-item" style="border-left: 4px solid var(--green-main)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <div class="journal-item-title" style="font-size:15px">📖 ${u.judulbuku || "-"}</div>
            <div style="font-size:12px;color:var(--ink-soft);font-weight:600">Oleh: ${u.penulisbuku || "-"}</div>
          </div>
          <div style="color:var(--gold);font-size:14px;background:#fef3c7;padding:4px 8px;border-radius:8px">
            ${"★".repeat(u.rating || 5)}${"☆".repeat(5-(u.rating || 5))}
          </div>
        </div>
        <div class="journal-item-meta" style="margin-bottom:12px">${formatTanggal(u.timestamp)}</div>
        
        <div style="font-size:13px; color:var(--ink); line-height:1.6; margin-bottom:8px">
          <strong style="color:var(--green-deep)">Kandungan:</strong> ${u.ulasankandungan || "-"}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.6; margin-bottom:8px">
          <strong style="color:#2563eb">Kekuatan:</strong> ${u.kekuatanbuku || "-"}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.6; margin-bottom:8px">
          <strong style="color:#dc2626">Kelemahan:</strong> ${u.kelemahanbuku || "-"}
        </div>
        <div style="font-size:13px; color:var(--ink-soft); font-style:italic; border-top:1px dashed #e2e8f0; padding-top:8px">
          " ${u.kesanbuku || "-"} "
        </div>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<p style="color:#ef4444;font-size:13px">Gagal memuat arsip ulasan.</p>';
  }
}
// ─────────────────────────────────────────────
// LEADERBOARD (BINTANG LITERASI)
// ─────────────────────────────────────────────
async function loadLeaderboard() {
  try {
    const data = await apiCall("getLeaderboard");
    if (data && data.leaderboard) {
      const lb = data.leaderboard;

      // Update Siswa Putra
      document.getElementById("lb-siswa-putra").textContent = lb.siswaPutra.nama;
      document.getElementById("lb-siswa-putra-desc").textContent = `Kelas ${lb.siswaPutra.kelas} | ${lb.siswaPutra.count} Ulasan`;

      // Update Siswi Putri
      document.getElementById("lb-siswa-putri").textContent = lb.siswaPutri.nama;
      document.getElementById("lb-siswa-putri-desc").textContent = `Kelas ${lb.siswaPutri.kelas} | ${lb.siswaPutri.count} Ulasan`;

      // Update Kelas Putra
      document.getElementById("lb-kelas-putra").textContent = lb.kelasPutra.kelas;
      document.getElementById("lb-kelas-putra-desc").textContent = `Total ${lb.kelasPutra.count} Ulasan Buku`;

      // Update Kelas Putri
      document.getElementById("lb-kelas-putri").textContent = lb.kelasPutri.kelas;
      document.getElementById("lb-kelas-putri-desc").textContent = `Total ${lb.kelasPutri.count} Ulasan Buku`;
    }
  } catch (e) {
    console.error("Gagal memuat leaderboard:", e.message);
    document.getElementById("lb-siswa-putra").textContent = "Gagal memuat";
    document.getElementById("lb-siswa-putri").textContent = "Gagal memuat";
  }
}
// ─────────────────────────────────────────────
// LAPORAN & ANALITIK DATA (CHARTS & REKAP BULANAN)
// ─────────────────────────────────────────────
let chartAngkatanInstance = null;
let chartHalamanInstance = null;

// ─────────────────────────────────────────────
// LAPORAN & ANALITIK DATA (CHART.JS DENGAN CACHE)
// ─────────────────────────────────────────────

let isLaporanLoaded = false;
let chartAngkatanInstance = null;
let chartHalamanInstance = null;

async function loadLaporan(forceReload = false) {
  // Sistem Pengunci Cache: Tidak akan memuat ulang jika tidak ditekan Refresh
  if (!forceReload && isLaporanLoaded) return;

  const tbody = document.getElementById("tabel-rekap-bulanan");
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Menarik data server...</td></tr>';

  try {
    const [resUlasan, resJurnal] = await Promise.all([
      apiCall("getAllUlasan"),
      apiCall("getAllJurnal")
    ]);

    const ulasan = resUlasan.ulasan || [];
    const jurnal = resJurnal.jurnal || [];

    // --- 1. PIE CHART CHART.JS: Ulasan per Angkatan ---
    let count7 = 0, count8 = 0, count9 = 0;
    ulasan.forEach(u => {
      if (!u.kelas) return;
      const k = String(u.kelas).trim();
      if (k.startsWith("7")) count7++;
      else if (k.startsWith("8")) count8++;
      else if (k.startsWith("9")) count9++;
    });

    const ctxPie = document.getElementById('chart-angkatan').getContext('2d');
    if (chartAngkatanInstance) chartAngkatanInstance.destroy(); // Hancurkan kanvas lama sebelum menggambar baru
    
    chartAngkatanInstance = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Angkatan 7', 'Angkatan 8', 'Angkatan 9'],
        datasets: [{
          data: [count7, count8, count9],
          backgroundColor: ['#3b82f6', '#f5a623', '#16a05a'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, // Wajib agar mematuhi tinggi 220px dari div pembungkus
        plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } } },
          tooltip: { bodyFont: { family: "'Plus Jakarta Sans', sans-serif" } }
        },
        cutout: '65%' // Membuat donat lebih tipis dan elegan
      }
    });

    // --- 2. BAR CHART CHART.JS: Volume Halaman Jurnal ---
    const halamanPerKelas = {};
    jurnal.forEach(j => {
      if (!j.kelas) return;
      const k = String(j.kelas).trim().toUpperCase();
      const awal = parseInt(j.halawal) || 0;
      const akhir = parseInt(j.halakhir) || 0;
      let baca = Math.abs(akhir - awal);
      if (baca === 0 && akhir > 0) baca = 1; 
      halamanPerKelas[k] = (halamanPerKelas[k] || 0) + baca;
    });

    const labelKelas = Object.keys(halamanPerKelas).sort();
    const dataHalaman = labelKelas.map(k => halamanPerKelas[k]);

    const ctxBar = document.getElementById('chart-halaman').getContext('2d');
    if (chartHalamanInstance) chartHalamanInstance.destroy();

    chartHalamanInstance = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: labelKelas,
        datasets: [{
          label: 'Total Halaman Dibaca',
          data: dataHalaman,
          backgroundColor: '#16a05a',
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { display: false },
          tooltip: { bodyFont: { family: "'Plus Jakarta Sans', sans-serif" } }
        },
        scales: { 
          y: { beginAtZero: true, grid: { color: '#eef2ef' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });

    // --- 3. BUKU TERPOPULER (Sama seperti sebelumnya) ---
    const bukuPopuler = {};
    ulasan.forEach(u => {
      if (!u.judulbuku) return;
      const j = String(u.judulbuku).trim().toUpperCase();
      bukuPopuler[j] = (bukuPopuler[j] || 0) + 1;
    });

    const listBuku = Object.entries(bukuPopuler).sort((a, b) => b[1] - a[1]);
    document.getElementById("total-buku-terulas").textContent = listBuku.length;
    
    if (listBuku.length > 0) {
      document.getElementById("top-book-1").textContent = listBuku[0][0];
      document.getElementById("top-book-1-count").textContent = `${listBuku[0][1]} kali diulas`;
    } else {
      document.getElementById("top-book-1").textContent = "Belum ada data";
    }

    // --- 4. TABEL REKAPITULASI BULANAN ---
    const isPutra = (k) => /A|B|C/i.test(k);
    const isPutri = (k) => /D|E|F/i.test(k);
    const grupBulan = {};

    ulasan.forEach(u => {
      if (!u.timestamp || !u.kelas || !u.nama) return;
      const d = new Date(u.timestamp);
      if (isNaN(d.getTime())) return;

      const namaBulan = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      const idBulan = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!grupBulan[idBulan]) grupBulan[idBulan] = { label: namaBulan, data: [], tUlasan: 0 };
      grupBulan[idBulan].data.push(u);
      grupBulan[idBulan].tUlasan++;
    });

    const rekapBulananHtml = Object.keys(grupBulan).sort().reverse().map(idBulan => {
      const g = grupBulan[idBulan];
      const sCounts = {}, cCounts = {};

      g.data.forEach(u => {
        const k = String(u.kelas).trim().toUpperCase().replace(/\s+/g, '');
        const n = String(u.nama).trim();
        sCounts[`${k}|${n}`] = (sCounts[`${k}|${n}`] || 0) + 1;
        cCounts[k] = (cCounts[k] || 0) + 1;
      });

      let topSPutra = { n: "-", c: 0 }, topSPutri = { n: "-", c: 0 };
      for (const [key, c] of Object.entries(sCounts)) {
        const [kls, nm] = key.split("|");
        if (isPutra(kls) && c > topSPutra.c) topSPutra = { n: `${nm} (${kls})`, c };
        if (isPutri(kls) && c > topSPutri.c) topSPutri = { n: `${nm} (${kls})`, c };
      }

      let topKPutra = { k: "-", c: 0 }, topKPutri = { k: "-", c: 0 };
      for (const [kls, c] of Object.entries(cCounts)) {
        if (isPutra(kls) && c > topKPutra.c) topKPutra = { k: kls, c };
        if (isPutri(kls) && c > topKPutri.c) topKPutri = { k: kls, c };
      }

      return `
        <tr>
          <td><strong>${g.label}</strong></td>
          <td>${topSPutra.n} <br><span style="font-size:10px;color:#aaa">${topSPutra.c} ulasan</span></td>
          <td>${topSPutri.n} <br><span style="font-size:10px;color:#aaa">${topSPutri.c} ulasan</span></td>
          <td>${topKPutra.k} <br><span style="font-size:10px;color:#aaa">${topKPutra.c} ulasan</span></td>
          <td>${topKPutri.k} <br><span style="font-size:10px;color:#aaa">${topKPutri.c} ulasan</span></td>
          <td><strong style="color:var(--green-deep)">${g.tUlasan}</strong></td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rekapBulananHtml || '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada rekam jejak.</td></tr>';

    isLaporanLoaded = true;
    if (forceReload) showToast("Data analitik diperbarui.");

  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat rekapitulasi analitik.</td></tr>';
  }
}
