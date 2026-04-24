/* ============================================================
   SiLit — Sistem Literasi SMP Albanna
   app.js — Logika Aplikasi Utama (Versi Stabil & Anti-Error)
   ============================================================ */

// ─────────────────────────────────────────────
// 1. KONFIGURASI 
// ─────────────────────────────────────────────
const CONFIG = {
  // PASTIKAN URL INI ADALAH URL DEPLOYMENT TERBARU ANDA
  API_URL: "https://script.google.com/macros/s/AKfycbwMBlOfGu13CAgRn2V3EkSeUnjg-UNUBrsTYPk1EZYbDFTxY5CR3ssB9Ev7o4I2fbiX/exec",
  ADMIN_PASSWORD: "albanna2025",
  MIN_KATA_JURNAL: 50,
  TOTAL_SOAL: 12,
};

// ─────────────────────────────────────────────
// 2. STATE & VARIABEL GLOBAL (DIJAGA AGAR TIDAK GANDA)
// ─────────────────────────────────────────────
let state = {
  user: null,        
  isAdmin: false,
  quiz: { soalAcak: [], currentIdx: 0, jawaban: [], selesai: false },
  peta: [],          
};

// Variabel Laporan & Grafik (Dideklarasikan SEKALI saja)
let isLaporanLoaded = false;
let chartAngkatanInstance = null;
let chartHalamanInstance = null;

// ─────────────────────────────────────────────
// 3. DATABASE LOKAL (SOAL & BUKU)
// ─────────────────────────────────────────────
const BANK_SOAL = [
  { soal: "Ketika membaca sebuah paragraf, apa yang pertama kali kamu perhatikan untuk memahami isinya?", opsi: ["Jumlah kalimat dalam paragraf", "Kata kunci dan ide pokok", "Panjang atau pendeknya paragraf", "Jenis huruf yang digunakan"], jawaban: 1 },
  { soal: "Apa yang dimaksud dengan 'inferensi' dalam membaca?", opsi: ["Membaca ulang teks berkali-kali", "Menyimpulkan makna yang tidak tertulis langsung", "Mencatat semua kata sulit", "Membaca dengan suara keras"], jawaban: 1 },
  { soal: "Seorang penulis menggunakan kata 'namun' di awal kalimat. Fungsi kata tersebut adalah...", opsi: ["Menambahkan informasi baru", "Menunjukkan pertentangan atau kontras", "Menyimpulkan isi paragraf", "Memberikan contoh"], jawaban: 1 },
  { soal: "Kamu membaca berita tentang banjir. Manakah pertanyaan kritis yang paling tepat untuk diajukan?", opsi: ["Berapa banyak foto yang ada di artikel?", "Apakah penyebab yang disebutkan didukung oleh data?", "Siapa yang menulis artikel ini?", "Kapan artikel ini diterbitkan?"], jawaban: 1 },
  { soal: "Teks eksposisi bertujuan untuk...", opsi: ["Menghibur pembaca dengan cerita menarik", "Meyakinkan pembaca untuk melakukan sesuatu", "Menjelaskan suatu topik secara faktual dan objektif", "Mengungkapkan perasaan penulis"], jawaban: 2 },
  { soal: "Apa perbedaan utama antara fakta dan opini dalam sebuah teks?", opsi: ["Fakta selalu lebih panjang dari opini", "Fakta dapat diverifikasi, opini bersifat subjektif", "Opini selalu salah, fakta selalu benar", "Tidak ada perbedaan antara keduanya"], jawaban: 1 },
  { soal: "Ketika menemukan kata yang tidak kamu ketahui artinya, strategi terbaik adalah...", opsi: ["Langsung melewati kata tersebut", "Menutup buku dan berhenti membaca", "Menggunakan konteks kalimat untuk memperkirakan maknanya", "Mengganti kata tersebut dengan kata lain"], jawaban: 2 },
  { soal: "Sebuah paragraf yang baik biasanya dimulai dengan...", opsi: ["Kalimat penjelas yang panjang", "Contoh konkret", "Kalimat topik yang menyatakan ide utama", "Kutipan dari tokoh terkenal"], jawaban: 2 },
  { soal: "Teks argumentasi yang kuat harus memiliki...", opsi: ["Banyak kata-kata emosional", "Klaim yang didukung oleh bukti dan logika", "Kalimat yang sangat panjang", "Hanya pendapat penulis tanpa data"], jawaban: 1 },
  { soal: "Membaca memindai (scanning) paling tepat digunakan untuk...", opsi: ["Memahami seluruh isi novel", "Menemukan informasi spesifik dengan cepat", "Menikmati alur cerita fiksi", "Menganalisis gaya bahasa penulis"], jawaban: 1 },
  { soal: "Apa yang dimaksud dengan 'kohesi' dalam sebuah teks?", opsi: ["Keindahan tampilan visual teks", "Keterkaitan antar kalimat dan paragraf secara gramatikal", "Jumlah halaman sebuah buku", "Kemampuan penulis menghibur pembaca"], jawaban: 1 },
  { soal: "Setelah membaca sebuah artikel, langkah refleksi yang paling baik adalah...", opsi: ["Langsung membaca artikel lain", "Merangkum isi, mengevaluasi argumen, dan menghubungkan dengan pengetahuan yang sudah ada", "Mengingat semua kalimat yang ada", "Menceritakan ulang artikel kata per kata"], jawaban: 1 }
];

const KATEGORI_INFO = {
  "Pembaca Dini":      { min: 0,  max: 2,  desc: "Kamu baru memulai perjalanan membaca. Terus berlatih dan jangan menyerah!" },
  "Pembaca Awal":      { min: 3,  max: 5,  desc: "Kamu sudah mulai memahami teks sederhana. Tingkatkan frekuensi membacamu!" },
  "Pembaca Semenjana": { min: 6,  max: 8,  desc: "Kemampuan membacamu cukup baik. Tantang dirimu dengan teks yang lebih kompleks." },
  "Pembaca Madya":     { min: 9,  max: 10, desc: "Kamu sudah mampu membaca secara kritis. Pertahankan dan terus tingkatkan!" },
  "Pembaca Mahir":     { min: 11, max: 12, desc: "Luar biasa! Kamu adalah pembaca mahir yang mampu menganalisis teks secara mendalam." }
};

const KOLEKSI_BUKU = [
  { emoji: "📚", judul: "iPusnas", desc: "Perpustakaan digital nasional gratis. Ribuan buku tersedia.", url: "https://ipusnas.id" },
  { emoji: "🌐", judul: "Buku Sekolah Elektronik", desc: "Buku pelajaran resmi Kemendikbud bisa diakses gratis.", url: "https://buku.kemdikbud.go.id" },
  { emoji: "📖", judul: "Lumen Learning", desc: "Materi pelajaran berbahasa Inggris dengan penjelasan interaktif.", url: "https://lumenlearning.com" },
  { emoji: "🔬", judul: "Khan Academy", desc: "Belajar sains, matematika, dan humaniora secara gratis.", url: "https://id.khanacademy.org" },
  { emoji: "🗞️", judul: "Kompas.id — Junior", desc: "Berita dan artikel pilihan yang sesuai untuk pelajar.", url: "https://www.kompas.id" },
  { emoji: "📰", judul: "Cerpen Indonesia", desc: "Kumpulan cerpen dan karya sastra Indonesia pilihan.", url: "https://cerpen-sastra.com" }
];

const KOLEKSI_MEME = [
  { title: "Luar Biasa! 🧠✨", desc: "Kapasitas otakmu baru saja bertambah berat hari ini.", img: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif" },
  { title: "Analisis Tajam! 🪒", desc: "Kritikmu sangat tajam. Filsuf pasti menangis haru melihat tulisanmu.", img: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif" },
  { title: "Terima Kasih! 🔬", desc: "Pemahamanmu tentang buku ini sangat mendalam.", img: "https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif" },
  { title: "Tugas Selesai! ☕", desc: "Sekarang kamu boleh istirahat dan membanggakan dirimu.", img: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" }
];

// ─────────────────────────────────────────────
// 4. UTILITAS & KOMUNIKASI API
// ─────────────────────────────────────────────
function showToast(msg, isError = false) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast" + (isError ? " error" : "");
  t.innerHTML = `<i class="fas fa-${isError ? "circle-exclamation" : "circle-check"}"></i> <span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatTanggal(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
  for (const [k, v] of Object.entries(payload)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("t", new Date().getTime()); // Anti-cache

  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error("Koneksi ditolak oleh server.");
  const data = await res.json();
  if (data.status === "error") throw new Error(data.message);
  return data;
}

async function apiPost(action, payload = {}) {
  return await apiCall(action, payload);
}

// ─────────────────────────────────────────────
// 5. LOGIN & AUTH
// ─────────────────────────────────────────────
async function onKelasChange() {
  const kelas = document.getElementById("input-class").value;
  const nameSelect = document.getElementById("input-name");
  nameSelect.disabled = true;
  nameSelect.innerHTML = '<option value="" disabled selected>Memuat data...</option>';

  try {
    const data = await apiCall("getSiswa", { kelas });
    nameSelect.innerHTML = '<option value="" disabled selected>— Pilih Nama Siswa —</option>';
    if (!data.siswa || data.siswa.length === 0) {
      nameSelect.innerHTML = '<option value="" disabled selected>Belum ada siswa</option>';
      return;
    }
    data.siswa.forEach(nama => {
      const opt = document.createElement("option");
      opt.value = nama; opt.textContent = nama;
      nameSelect.appendChild(opt);
    });
    nameSelect.disabled = false;
  } catch (e) {
    nameSelect.innerHTML = '<option value="" disabled selected>Gagal memuat</option>';
    showToast("Gagal terhubung ke database.", true);
  }
}

function handleLogin() {
  const kelas = document.getElementById("input-class").value;
  const nama  = document.getElementById("input-name").value;
  if (!kelas || !nama) {
    showToast("Pilih kelas dan nama terlebih dahulu.", true);
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
  }
}

function handleLogout() {
  state.user = null; state.isAdmin = false;
  document.getElementById("view-dashboard").classList.remove("active");
  document.getElementById("view-login").classList.add("active");
  resetAsesmen();
}

function enterDashboard() {
  document.getElementById("view-login").classList.remove("active");
  document.getElementById("view-dashboard").classList.add("active");

  const inisial = state.user.nama.charAt(0).toUpperCase();
  document.getElementById("sidebar-avatar").textContent = inisial;
  document.getElementById("sidebar-name").textContent = state.user.nama;
  document.getElementById("sidebar-class").textContent = "Kelas " + state.user.kelas;
  
  if(!state.isAdmin){
    document.getElementById("profile-avatar").textContent = inisial;
    document.getElementById("profile-name").textContent = state.user.nama;
    document.getElementById("profile-class").textContent = "Kelas " + state.user.kelas;
    document.getElementById("profile-card-wrap").setAttribute("data-initial", inisial);
  }

  document.getElementById("nav-admin-wrap").style.display = state.isAdmin ? "block" : "none";

  loadBerandaStats();
  renderKoleksi();
  initAsesmen();
  if(!state.isAdmin) switchPage("beranda");
}

// ─────────────────────────────────────────────
// 6. NAVIGASI
// ─────────────────────────────────────────────
function switchPage(page) {
  document.querySelectorAll(".page-section").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  
  document.getElementById("page-" + page).classList.add("active");
  const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add("active");

  // Pemicu Tarik Data
  if (page === "beranda") loadLeaderboard();
  if (page === "ulasan") loadUlasanHistory();
  if (page === "laporan") loadLaporan(false);
  if (page === "peta") loadPeta();
  if (page === "jurnal") {
    loadJurnalHistory();
    checkWidgetJumat();
  }
  if (page === "admin") {
    loadAdminAsesmen();
    loadAdminJurnal();
  }
}

// ─────────────────────────────────────────────
// 7. BERANDA & LEADERBOARD
// ─────────────────────────────────────────────
async function loadBerandaStats() {
  if (state.isAdmin) return;
  try {
    const data = await apiCall("getStatsSiswa", { nama: state.user.nama, kelas: state.user.kelas });
    document.getElementById("stat-skor").textContent = data.skorTerakhir !== null ? data.skorTerakhir : "—";
    document.getElementById("stat-jurnal").textContent = data.jumlahJurnal || 0;
    document.getElementById("stat-kategori").textContent = data.kategori || "—";
    document.getElementById("profile-badge-text").textContent = data.kategori || "Belum asesmen";
  } catch (e) {}
}

async function loadLeaderboard() {
  try {
    const data = await apiCall("getLeaderboard");
    // Backup plan jika GAS versi sederhana yang aktif
    if (data && data.leaderboard) {
      const lb = data.leaderboard;
      document.getElementById("lb-siswa-putra").textContent = lb.siswaPutra.nama || "-";
      document.getElementById("lb-siswa-putra-desc").textContent = `Kelas ${lb.siswaPutra.kelas || "-"} | ${lb.siswaPutra.count || 0} Ulasan`;
      document.getElementById("lb-siswa-putri").textContent = lb.siswaPutri.nama || "-";
      document.getElementById("lb-siswa-putri-desc").textContent = `Kelas ${lb.siswaPutri.kelas || "-"} | ${lb.siswaPutri.count || 0} Ulasan`;
      document.getElementById("lb-kelas-putra").textContent = lb.kelasPutra.kelas || "-";
      document.getElementById("lb-kelas-putra-desc").textContent = `Total ${lb.kelasPutra.count || 0} Ulasan`;
      document.getElementById("lb-kelas-putri").textContent = lb.kelasPutri.kelas || "-";
      document.getElementById("lb-kelas-putri-desc").textContent = `Total ${lb.kelasPutri.count || 0} Ulasan`;
    }
  } catch (e) {
    console.warn("Gagal memuat leaderboard");
  }
}

// ─────────────────────────────────────────────
// 8. ASESMEN
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

function resetAsesmen() { initAsesmen(); }

function renderSoal() {
  const idx = state.quiz.currentIdx;
  const total = CONFIG.TOTAL_SOAL;
  const soal = state.quiz.soalAcak[idx];
  
  document.getElementById("quiz-progress-fill").style.width = ((idx / total) * 100) + "%";
  document.getElementById("quiz-count").textContent = `${idx + 1} / ${total}`;
  document.getElementById("question-text").textContent = soal.soal;

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
  
  document.getElementById("btn-next").disabled = state.quiz.jawaban[idx] === null;
  document.getElementById("btn-next").innerHTML = idx === total - 1 ? "Selesai" : "Lanjut <i class='fas fa-arrow-right' style='margin-left:6px'></i>";
}

function pilihJawaban(idx) {
  state.quiz.jawaban[state.quiz.currentIdx] = idx;
  renderSoal();
}

async function nextQuestion() {
  if (state.quiz.jawaban[state.quiz.currentIdx] === null) return;
  if (state.quiz.currentIdx < CONFIG.TOTAL_SOAL - 1) {
    state.quiz.currentIdx++; renderSoal();
  } else {
    await selesaikanAsesmen();
  }
}

async function selesaikanAsesmen() {
  let skor = 0;
  state.quiz.soalAcak.forEach((soal, i) => { if (state.quiz.jawaban[i] === soal.jawaban) skor++; });
  const kategori = getKategori(skor);
  
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result-container").style.display = "block";
  document.getElementById("result-score").textContent = skor;
  document.getElementById("result-label").textContent = kategori;
  document.getElementById("result-desc").textContent = KATEGORI_INFO[kategori].desc;

  try {
    await apiPost("simpanAsesmen", { nama: state.user.nama, kelas: state.user.kelas, skor, kategori });
    showToast("Hasil asesmen disimpan!");
    loadBerandaStats();
  } catch (e) {
    showToast("Gagal menyimpan hasil ke database.", true);
  }
}

// ─────────────────────────────────────────────
// 9. PETA LITERASI
// ─────────────────────────────────────────────
async function loadPeta() {
  const filter = document.getElementById("peta-filter-kelas").value;
  ["dini","awal","semenjana","madya","mahir"].forEach(k => {
    document.getElementById("list-" + k).innerHTML = '<p class="peta-empty"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</p>';
    document.getElementById("count-" + k).textContent = "0";
  });

  try {
    const data = await apiCall("getAsesmen", filter ? { kelas: filter } : {});
    state.peta = data.asesmen || [];
    renderPeta();
  } catch (e) {
    showToast("Gagal memuat peta.", true);
  }
}

function renderPeta() {
  const filter = document.getElementById("peta-filter-kelas").value;
  const data = filter ? state.peta.filter(r => String(r.kelas) === filter) : state.peta;
  const groups = { "Pembaca Dini": "dini", "Pembaca Awal": "awal", "Pembaca Semenjana": "semenjana", "Pembaca Madya": "madya", "Pembaca Mahir": "mahir" };
  const items = { dini:[], awal:[], semenjana:[], madya:[], mahir:[] };

  const terbaru = {};
  data.forEach(r => {
    const uid = r.kelas + "|" + r.nama;
    if (!terbaru[uid] || r.timestamp > terbaru[uid].timestamp) terbaru[uid] = r;
  });

  Object.values(terbaru).forEach(r => { 
    const key = groups[r.kategori || r.Kategori]; // toleransi huruf besar/kecil
    if (key) items[key].push(r); 
  });

  Object.entries(items).forEach(([key, arr]) => {
    document.getElementById("count-" + key).textContent = arr.length;
    document.getElementById("list-" + key).innerHTML = arr.length ? 
      arr.map(r => `<div class="peta-item" title="${r.kelas} - Skor ${r.skor || r.Skor}">${r.nama || r.Nama}</div>`).join("") : 
      '<p class="peta-empty">Kosong</p>';
  });
}

// ─────────────────────────────────────────────
// 10. KOLEKSI BUKU
// ─────────────────────────────────────────────
function renderKoleksi() {
  document.getElementById("book-grid").innerHTML = KOLEKSI_BUKU.map(b => `
    <div class="book-card">
      <div class="book-icon">${b.emoji}</div>
      <h3>${b.judul}</h3><p>${b.desc}</p>
      <a href="${b.url}" target="_blank">Kunjungi <i class="fas fa-arrow-up-right-from-square" style="font-size:11px"></i></a>
    </div>
  `).join("");
}

// ─────────────────────────────────────────────
// 11. JURNAL & WIDGET JUMAT
// ─────────────────────────────────────────────
function countWords() {
  const text = document.getElementById("jurnal-ringkasan").value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const counter = document.getElementById("word-counter");
  counter.textContent = `${words} / ${CONFIG.MIN_KATA_JURNAL} kata`;
  counter.className = "word-counter " + (words >= CONFIG.MIN_KATA_JURNAL ? "ok" : "warn");
}

async function submitJurnal() {
  const judul = document.getElementById("jurnal-judul").value.trim();
  const penulis = document.getElementById("jurnal-penulis").value.trim();
  const halAwal = document.getElementById("jurnal-hal-awal").value;
  const halAkhir = document.getElementById("jurnal-hal-akhir").value;
  const ringkasan = document.getElementById("jurnal-ringkasan").value.trim();
  const words = ringkasan ? ringkasan.split(/\s+/).length : 0;

  if (!judul || !penulis || !halAwal || !halAkhir || !ringkasan) { showToast("Lengkapi form!", true); return; }
  if (parseInt(halAkhir) < parseInt(halAwal)) { showToast("Halaman akhir salah.", true); return; }
  if (words < CONFIG.MIN_KATA_JURNAL) { showToast(`Minimal ${CONFIG.MIN_KATA_JURNAL} kata.`, true); return; }

  const btn = document.querySelector("#page-jurnal .btn-primary");
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  try {
    await apiPost("simpanJurnal", { 
      nama: state.user.nama, kelas: state.user.kelas, 
      judul, penulis, halAwal, halAkhir, ringkasan 
    });
    showToast("Jurnal disimpan!");
    ["jurnal-judul","jurnal-penulis","jurnal-hal-awal","jurnal-hal-akhir","jurnal-ringkasan"].forEach(id => document.getElementById(id).value = "");
    countWords(); loadJurnalHistory(); loadBerandaStats(); checkWidgetJumat();
  } catch (e) { showToast("Gagal menyimpan.", true); } 
  finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px"></i>Kirim Jurnal'; }
}

async function loadJurnalHistory() {
  const container = document.getElementById("jurnal-history-list");
  container.innerHTML = '<p style="color:#bbb;font-size:13px"><i class="fas fa-circle-notch fa-spin"></i> Menarik riwayat...</p>';
  try {
    const data = await apiCall("getJurnal", { nama: state.user.nama, kelas: state.user.kelas });
    const items = data.jurnal || [];
    if (items.length === 0) { container.innerHTML = '<p style="color:#bbb;font-size:13px">Belum ada jurnal.</p>'; return; }
    
    container.innerHTML = items.reverse().map(j => {
      // PENCARIAN GANDA: Tangani huruf besar / kecil dari GAS
      const jdl = j.judul || j.Judul || "-";
      const pnl = j.penulis || j.Penulis || "-";
      const hwl = j.halAwal || j.halawal || j.HalAwal || "?";
      const hak = j.halAkhir || j.halakhir || j.HalAkhir || "?";
      const rks = j.ringkasan || j.Ringkasan || "";

      return `
      <div class="journal-item">
        <div class="journal-item-title">📖 ${jdl} <span style="font-weight:400;color:var(--ink-soft)">– ${pnl}</span></div>
        <div class="journal-item-meta">Halaman ${hwl}–${hak} &nbsp;·&nbsp; ${formatTanggal(j.timestamp || j.Timestamp)}</div>
        <div class="journal-item-body">${rks}</div>
      </div>`;
    }).join("");
  } catch (e) { container.innerHTML = '<p style="color:#ef4444;font-size:13px">Gagal memuat riwayat.</p>'; }
}

async function checkWidgetJumat() {
  const widget = document.getElementById("widget-jumat");
  const container = document.getElementById("jumat-list-container");
  if (!widget || !container) return;

  const today = new Date();
  if (today.getDay() !== 5) { widget.style.display = "none"; return; }
  
  widget.style.display = "block";
  container.innerHTML = '<p style="color:#bbb;font-size:13px"><i class="fas fa-circle-notch fa-spin"></i> Memindai data...</p>';

  try {
    const [resSiswa, resJurnal] = await Promise.all([apiCall("getAllSiswa"), apiCall("getAllJurnal")]);
    const semuaSiswa = resSiswa.siswa || [];
    const semuaJurnal = resJurnal.jurnal || [];
    const sudahSet = new Set();
    const todayStr = today.toDateString();

    semuaJurnal.forEach(j => {
      const ts = j.timestamp || j.Timestamp;
      const kls = j.kelas || j.Kelas;
      const nm = j.nama || j.Nama;
      if (!ts || !kls || !nm) return;
      if (new Date(ts).toDateString() === todayStr) {
        sudahSet.add(String(kls).trim().toUpperCase() + "|" + String(nm).trim().toLowerCase());
      }
    });

    const belumData = {};
    semuaSiswa.forEach(s => {
      const kls = s.kelas || s.Kelas;
      const nm = s.nama || s.Nama;
      if (!kls || !nm) return;
      const k = String(kls).trim().toUpperCase();
      const id = k + "|" + String(nm).trim().toLowerCase();
      if (!sudahSet.has(id)) {
        if (!belumData[k]) belumData[k] = [];
        belumData[k].push(nm);
      }
    });

    const keys = Object.keys(belumData).sort();
    if (keys.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:20px 0"><i class="fas fa-shield-check" style="font-size:32px;color:var(--green-main)"></i><p style="font-weight:700;margin-top:8px">Kepatuhan 100%</p></div>`;
    } else {
      container.innerHTML = keys.map(k => `
        <div style="margin-bottom:12px;border:1px solid #fecaca;border-radius:10px;overflow:hidden">
          <div style="background:#fef2f2;padding:8px;font-size:12px;font-weight:800;color:#991b1b;display:flex;justify-content:space-between">
            Kelas ${k} <span style="background:#ef4444;color:#fff;padding:2px 6px;border-radius:6px">${belumData[k].length}</span>
          </div>
          <div style="padding:8px">
            ${belumData[k].sort().map(n => `<div style="font-size:11px;padding:4px 0;border-bottom:1px dashed #f1f5f9"><i class="fas fa-xmark" style="color:#ef4444"></i> ${n}</div>`).join("")}
          </div>
        </div>
      `).join("");
    }
  } catch (e) { container.innerHTML = '<p style="color:#ef4444;font-size:12px">Gagal memuat widget.</p>'; }
}

// ─────────────────────────────────────────────
// 12. ULASAN BUKU (KETAT)
// ─────────────────────────────────────────────
function hitungKataUlasan(inId, outId, min) {
  const t = document.getElementById(inId).value.trim();
  const w = t ? t.split(/\s+/).length : 0;
  const c = document.getElementById(outId);
  c.textContent = `${w} / ${min} kata`;
  c.className = "word-counter " + (w >= min ? "ok" : "warn");
  return w;
}

async function submitUlasanBaru() {
  const judul = document.getElementById("ulasan-judul").value.trim();
  const penulis = document.getElementById("ulasan-penulis").value.trim();
  const rating = document.getElementById("ulasan-rating").value;
  const kesan = document.getElementById("ulasan-kesan").value.trim();
  const wKan = hitungKataUlasan('ulasan-kandungan', 'count-kandungan', 25);
  const wKek = hitungKataUlasan('ulasan-kekuatan', 'count-kekuatan', 25);
  const wKel = hitungKataUlasan('ulasan-kelemahan', 'count-kelemahan', 25);

  if (!judul || !penulis) { showToast("Judul dan Penulis wajib diisi.", true); return; }
  if (wKan < 25 || wKek < 25 || wKel < 25) { showToast("Penuhi batas minimal 25 kata.", true); return; }

  const btn = document.getElementById("btn-submit-ulasan");
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

  try {
    await apiPost("simpanUlasan", {
      nama: state.user.nama, kelas: state.user.kelas, judulBuku: judul, penulisBuku: penulis, rating,
      ulasanKandungan: document.getElementById("ulasan-kandungan").value.trim(),
      kekuatanBuku: document.getElementById("ulasan-kekuatan").value.trim(),
      kelemahanBuku: document.getElementById("ulasan-kelemahan").value.trim(),
      kesanBuku: kesan
    });

    ["judul","penulis","kandungan","kekuatan","kelemahan","kesan"].forEach(id => document.getElementById(`ulasan-${id}`).value = "");
    document.getElementById("ulasan-rating").value = "5";
    hitungKataUlasan('ulasan-kandungan', 'count-kandungan', 25);
    hitungKataUlasan('ulasan-kekuatan', 'count-kekuatan', 25);
    hitungKataUlasan('ulasan-kelemahan', 'count-kelemahan', 25);

    loadUlasanHistory();
    const meme = KOLEKSI_MEME[Math.floor(Math.random() * KOLEKSI_MEME.length)];
    document.getElementById("meme-title").textContent = meme.title;
    document.getElementById("meme-desc").textContent = meme.desc;
    document.getElementById("meme-img").src = meme.img;
    document.getElementById("meme-modal").style.display = "flex";
  } catch(e) { showToast("Gagal menyimpan ulasan.", true); }
  finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px"></i>Kirim Evaluasi Kritis'; }
}

async function loadUlasanHistory() {
  const container = document.getElementById("ulasan-history-list");
  container.innerHTML = '<p style="color:#bbb;font-size:13px"><i class="fas fa-circle-notch fa-spin"></i> Menarik arsip...</p>';
  try {
    const data = await apiCall("getUlasan", { nama: state.user.nama, kelas: state.user.kelas });
    const items = data.ulasan || [];
    if (items.length === 0) { container.innerHTML = '<p style="color:#bbb;font-size:13px">Belum ada evaluasi.</p>'; return; }
    
    container.innerHTML = items.reverse().map(u => {
      // PENCARIAN GANDA TAHAN BANTING
      const jb = u.judulBuku || u.judulbuku || u.JudulBuku || "-";
      const pb = u.penulisBuku || u.penulisbuku || u.PenulisBuku || "-";
      const rt = parseInt(u.rating || u.Rating) || 5;
      const uk = u.ulasanKandungan || u.ulasankandungan || u.UlasanKandungan || "-";
      const kb = u.kekuatanBuku || u.kekuatanbuku || u.KekuatanBuku || "-";
      const kl = u.kelemahanBuku || u.kelemahanbuku || u.KelemahanBuku || "-";
      const ks = u.kesanBuku || u.kesanbuku || u.KesanBuku || "-";
      const ts = u.timestamp || u.Timestamp;

      return `
      <div class="journal-item" style="border-left: 4px solid var(--green-main)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div><div class="journal-item-title" style="font-size:15px">📖 ${jb}</div><div style="font-size:11px;color:var(--ink-soft);font-weight:700">Oleh: ${pb}</div></div>
          <div style="color:var(--gold);font-size:12px;background:#fef3c7;padding:4px 8px;border-radius:8px">${"★".repeat(rt)}${"☆".repeat(5-rt)}</div>
        </div>
        <div class="journal-item-meta" style="margin-bottom:12px">${formatTanggal(ts)}</div>
        <div style="font-size:12px; color:var(--ink); line-height:1.5; margin-bottom:6px"><strong style="color:var(--green-deep)">Kandungan:</strong> ${uk}</div>
        <div style="font-size:12px; color:var(--ink); line-height:1.5; margin-bottom:6px"><strong style="color:#2563eb">Kekuatan:</strong> ${kb}</div>
        <div style="font-size:12px; color:var(--ink); line-height:1.5; margin-bottom:6px"><strong style="color:#dc2626">Kelemahan:</strong> ${kl}</div>
        <div style="font-size:12px; color:var(--ink-soft); font-style:italic; border-top:1px dashed #eef2ef; padding-top:6px">" ${ks} "</div>
      </div>`;
    }).join("");
  } catch (e) { container.innerHTML = '<p style="color:#ef4444;font-size:13px">Gagal memuat arsip.</p>'; }
}

// ─────────────────────────────────────────────
// 13. LAPORAN & CHART.JS (DENGAN CACHE)
// ─────────────────────────────────────────────
async function loadLaporan(forceReload = false) {
  if (!forceReload && isLaporanLoaded) return;
  const tbody = document.getElementById("tabel-rekap-bulanan");
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Menarik data...</td></tr>';

  try {
    const [resUlasan, resJurnal] = await Promise.all([apiCall("getAllUlasan"), apiCall("getAllJurnal")]);
    const ulasan = resUlasan.ulasan || [];
    const jurnal = resJurnal.jurnal || [];

    // --- CHART ANGKATAN ---
    let c7 = 0, c8 = 0, c9 = 0;
    ulasan.forEach(u => {
      const k = String(u.kelas || u.Kelas || "").trim();
      if (k.startsWith("7")) c7++; else if (k.startsWith("8")) c8++; else if (k.startsWith("9")) c9++;
    });

    const canvasPie = document.getElementById('chart-angkatan');
    if (canvasPie) {
      if (chartAngkatanInstance) chartAngkatanInstance.destroy(); 
      chartAngkatanInstance = new Chart(canvasPie.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Kls 7', 'Kls 8', 'Kls 9'], datasets: [{ data: [c7, c8, c9], backgroundColor: ['#3b82f6', '#f5a623', '#16a05a'], borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, cutout: '65%' }
      });
    }

    // --- CHART HALAMAN ---
    const halMap = {};
    jurnal.forEach(j => {
      const k = String(j.kelas || j.Kelas || "").trim().toUpperCase();
      if (!k) return;
      const hwl = parseInt(j.halAwal || j.halawal || j.HalAwal) || 0;
      const hak = parseInt(j.halAkhir || j.halakhir || j.HalAkhir) || 0;
      let baca = Math.abs(hak - hwl);
      if (baca === 0 && hak > 0) baca = 1;
      halMap[k] = (halMap[k] || 0) + baca;
    });

    const lKls = Object.keys(halMap).sort();
    const canvasBar = document.getElementById('chart-halaman');
    if (canvasBar) {
      if (chartHalamanInstance) chartHalamanInstance.destroy();
      chartHalamanInstance = new Chart(canvasBar.getContext('2d'), {
        type: 'bar',
        data: { labels: lKls, datasets: [{ label: 'Halaman', data: lKls.map(k=>halMap[k]), backgroundColor: '#16a05a', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
      });
    }

    // --- BUKU TERPOPULER ---
    const pop = {};
    ulasan.forEach(u => {
      const jb = String(u.judulBuku || u.judulbuku || u.JudulBuku || "").trim().toUpperCase();
      if (jb) pop[jb] = (pop[jb] || 0) + 1;
    });
    const lBuku = Object.entries(pop).sort((a, b) => b[1] - a[1]);
    
    if (document.getElementById("total-buku-terulas")) document.getElementById("total-buku-terulas").textContent = lBuku.length;
    if (lBuku.length > 0) {
      if (document.getElementById("top-book-1")) document.getElementById("top-book-1").textContent = lBuku[0][0];
      if (document.getElementById("top-book-1-count")) document.getElementById("top-book-1-count").textContent = `${lBuku[0][1]} kali diulas`;
    }

    // --- TABEL BULANAN ---
    const isPa = (k) => /A|B|C/i.test(k);
    const isPi = (k) => /D|E|F/i.test(k);
    const blnGrp = {};

    ulasan.forEach(u => {
      const ts = u.timestamp || u.Timestamp;
      const k = String(u.kelas || u.Kelas || "").trim().toUpperCase().replace(/\s+/g, '');
      const n = String(u.nama || u.Nama || "").trim();
      if (!ts || !k || !n) return;
      
      const d = new Date(ts);
      if (isNaN(d.getTime())) return;
      
      const idB = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!blnGrp[idB]) blnGrp[idB] = { lbl: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }), d: [], t: 0 };
      blnGrp[idB].d.push({k, n}); blnGrp[idB].t++;
    });

    const htm = Object.keys(blnGrp).sort().reverse().map(idB => {
      const g = blnGrp[idB];
      const sC = {}, cC = {};
      g.d.forEach(x => { sC[`${x.k}|${x.n}`] = (sC[`${x.k}|${x.n}`] || 0) + 1; cC[x.k] = (cC[x.k] || 0) + 1; });

      let spA = {n:"-",c:0}, spI = {n:"-",c:0}, kpA = {k:"-",c:0}, kpI = {k:"-",c:0};
      for (const [key, c] of Object.entries(sC)) {
        const [k, n] = key.split("|");
        if (isPa(k) && c > spA.c) spA = {n:`${n} (${k})`, c};
        if (isPi(k) && c > spI.c) spI = {n:`${n} (${k})`, c};
      }
      for (const [k, c] of Object.entries(cC)) {
        if (isPa(k) && c > kpA.c) kpA = {k, c};
        if (isPi(k) && c > kpI.c) kpI = {k, c};
      }
      return `<tr><td><strong>${g.lbl}</strong></td><td>${spA.n}<br><span style="font-size:10px;color:#aaa">${spA.c} ulasan</span></td><td>${spI.n}<br><span style="font-size:10px;color:#aaa">${spI.c} ulasan</span></td><td>${kpA.k}<br><span style="font-size:10px;color:#aaa">${kpA.c} ulasan</span></td><td>${kpI.k}<br><span style="font-size:10px;color:#aaa">${kpI.c} ulasan</span></td><td><strong style="color:var(--green-main)">${g.t}</strong></td></tr>`;
    }).join("");

    if (tbody) tbody.innerHTML = htm || '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada rekam jejak.</td></tr>';
    isLaporanLoaded = true;
    if (forceReload) showToast("Data analitik diperbarui.");
  } catch (e) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat rekapitulasi.</td></tr>';
  }
}

// ─────────────────────────────────────────────
// 14. PANEL ADMIN
// ─────────────────────────────────────────────
function initAdminBulk() {
  const container = document.getElementById("bulk-inputs");
  if (container.children.length > 0) return;
  container.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const input = document.createElement("input");
    input.type = "text"; input.className = "bulk-input"; input.placeholder = `Siswa ${i}`; input.id = `bulk-${i}`;
    container.appendChild(input);
  }
}

async function addBulkStudents() {
  const kelas = document.getElementById("db-bulk-class").value;
  if (!kelas) { showToast("Pilih kelas target.", true); return; }
  const names = [];
  for (let i = 1; i <= 30; i++) { const val = document.getElementById(`bulk-${i}`).value.trim(); if (val) names.push(val); }
  if (names.length === 0) { showToast("Isi minimal satu nama.", true); return; }

  const btn = document.querySelector(".btn-save");
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
  try {
    await apiPost("simpanSiswa", { kelas, namaSiswa: JSON.stringify(names) });
    showToast(`${names.length} siswa berhasil disimpan!`);
    for (let i = 1; i <= 30; i++) document.getElementById(`bulk-${i}`).value = "";
  } catch (e) { showToast("Gagal menyimpan data.", true); } 
  finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Simpan ke Database'; }
}

function switchAdminTab(tab) {
  ["input","asesmen","jurnal"].forEach(t => document.getElementById("admin-tab-" + t).style.display = t === tab ? "block" : "none");
  document.querySelectorAll(".tab-btn").forEach((btn, i) => btn.classList.toggle("active", ["input","asesmen","jurnal"][i] === tab));
}

async function loadAdminAsesmen() {
  const tbody = document.getElementById("admin-asesmen-body");
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</td></tr>';
  try {
    const data = await apiCall("getAsesmen");
    const items = data.asesmen || [];
    if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada data</td></tr>'; return; }
    tbody.innerHTML = items.map((r, i) => `<tr><td>${i + 1}</td><td>${formatTanggal(r.timestamp || r.Timestamp)}</td><td><strong>${r.kelas || r.Kelas}</strong></td><td>${r.nama || r.Nama}</td><td><strong>${r.skor || r.Skor}/12</strong></td><td><strong style="color:var(--green-main)">${r.kategori || r.Kategori}</strong></td></tr>`).join("");
  } catch (e) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat</td></tr>'; }
}

async function loadAdminJurnal() {
  const tbody = document.getElementById("admin-jurnal-body");
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px"><i class="fas fa-circle-notch fa-spin"></i> Memuat...</td></tr>';
  try {
    const data = await apiCall("getAllJurnal");
    const items = data.jurnal || [];
    if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#bbb;padding:20px">Belum ada data</td></tr>'; return; }
    tbody.innerHTML = items.map((r, i) => `<tr><td>${i + 1}</td><td>${formatTanggal(r.timestamp || r.Timestamp)}</td><td><strong>${r.kelas || r.Kelas}</strong></td><td>${r.nama || r.Nama}</td><td>${r.judul || r.Judul}</td><td>${r.halAwal || r.halawal || r.HalAwal}–${r.halAkhir || r.halakhir || r.HalAkhir}</td></tr>`).join("");
  } catch (e) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:20px">Gagal memuat</td></tr>'; }
}
