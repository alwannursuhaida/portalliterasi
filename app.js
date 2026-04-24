const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbwMBlOfGu13CAgRn2V3EkSeUnjg-UNUBrsTYPk1EZYbDFTxY5CR3ssB9Ev7o4I2fbiX/exec",
  ADMIN_PASSWORD: "albanna2025",
  MIN_KATA_JURNAL: 50,
  TOTAL_SOAL: 12
};

// State Global
let state = { user: null, isAdmin: false, peta: [] };
let isLaporanLoaded = false;
let chartAngkatanInstance = null;
let chartHalamanInstance = null;

// --- Komunikasi Server ---
async function apiCall(action, payload = {}) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);
  Object.entries(payload).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("t", Date.now());

  const res = await fetch(url, { redirect: "follow" });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.message);
  return data;
}

// --- Auth & Login ---
async function onKelasChange() {
  const kelas = document.getElementById("input-class").value;
  const select = document.getElementById("input-name");
  select.disabled = true;
  select.innerHTML = '<option>Memuat...</option>';
  try {
    const data = await apiCall("getSiswa", { kelas });
    select.innerHTML = '<option value="" disabled selected>— Pilih Nama —</option>';
    data.siswa.forEach(n => {
      const o = document.createElement("option");
      o.value = n; o.textContent = n;
      select.appendChild(o);
    });
    select.disabled = false;
  } catch (e) { select.innerHTML = '<option>Gagal memuat</option>'; }
}

function handleLogin() {
  const kelas = document.getElementById("input-class").value;
  const nama = document.getElementById("input-name").value;
  if (!kelas || !nama) return alert("Pilih data lengkap!");
  state.user = { nama, kelas };
  enterDashboard();
}

function enterDashboard() {
  document.getElementById("view-login").style.display = "none";
  document.getElementById("view-dashboard").style.display = "flex";
  document.getElementById("sidebar-name").textContent = state.user.nama;
  document.getElementById("sidebar-class").textContent = state.user.kelas;
  switchPage("beranda");
}

function switchPage(page) {
  document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  if (page === "laporan") loadLaporan(false);
  if (page === "jurnal") checkWidgetJumat();
}

// --- Analitik & Laporan ---
async function loadLaporan(force = false) {
  if (!force && isLaporanLoaded) return;
  try {
    const res = await apiCall("getAllUlasan");
    renderCharts(res.ulasan);
    isLaporanLoaded = true;
  } catch (e) { console.error(e); }
}

function renderCharts(data) {
  const ctx = document.getElementById('chart-angkatan').getContext('2d');
  if (chartAngkatanInstance) chartAngkatanInstance.destroy();
  chartAngkatanInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Kls 7', 'Kls 8', 'Kls 9'],
      datasets: [{ data: [10, 20, 30], backgroundColor: ['#3b82f6', '#f5a623', '#16a05a'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Salin fungsi lainnya (Jurnal, Ulasan, Asesmen) dari versi stabil sebelumnya
// Pastikan tidak ada deklarasi ulang 'chartAngkatanInstance' di bawah sini.
