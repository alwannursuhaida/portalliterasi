/* ============================================================
   SiLit — Sistem Literasi SMP Albanna
   app.js — Logika Aplikasi Utama
   Versi: 1.0 | Koneksi: Google Apps Script (REST API)
   ============================================================ */

// ─────────────────────────────────────────────
// KONFIGURASI — Ganti URL setelah deploy Apps Script
// ─────────────────────────────────────────────
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbwfstKF05KYxF54c1oGRSu3Q_OLjY0GD_hP5wicJKmcY9uG1rkVV9HIw7gcqeEkiQGg/exec",
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
// UTILITAS
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

async function apiCall(action, payload = {}) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(payload)) url.searchParams.set(k, v);

  // TRICK ANTI-CACHE: Memaksa browser mengunduh data terbaru
  url.searchParams.set("t", new Date().getTime());

  // Pastikan redirect: "follow" tetap ada untuk menghindari CORS
  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error("Gagal terhubung ke server");
  return res.json();
}

async function apiPost(action, payload = {}) {
  const body = new URLSearchParams({ action, ...payload });
  const res = await fetch(CONFIG.API_URL, { method: "POST", body });
  if (!res.ok) throw new Error("Gagal menyimpan data");
  return res.json();
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
  document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  document.getElementById("page-" + page).classList.add("active");
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add("active");

  // Trigger load saat masuk halaman
  if (page === "peta") loadPeta();
  if (page === "jurnal") loadJurnalHistory();
  if (page === "admin") initAdminBulk();
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
    showToast("Gagal menyimpan data siswa.", true);
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
