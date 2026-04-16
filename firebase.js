/**
 * firebase.js
 * Inisialisasi Firebase dengan konfigurasi manual.
 */

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously }           from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc,
         setDoc, getDoc, onSnapshot, query }    from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// =========================================================================
// LENGKAPI BAGIAN YANG MASIH BERISI "PASTE_..._DI_SINI"
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyADXT-6JH1eu6lcbnitFVla6ba5I6A37ds",
  authDomain: "literasismpalbanna.firebaseapp.com",
  projectId: "literasismpalbanna",
  storageBucket: "literasismpalbanna.appspot.com",
  messagingSenderId: "902222243000",
  appId: "1:902222243000:web:bb01744327e05e44a5804d"
};

// ID unik untuk memisahkan data aplikasi Anda di database
const appId = "literasismpalbanna"; 

async function initFirebase() {
  try {
    const app  = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db   = getFirestore(app);

    // Kita gunakan login anonim di latar belakang agar aman mengakses Firestore
    await signInAnonymously(auth);

    // Ekspos API terbatas ke app.js
    window.FB = {
      db, appId,
      collection, doc,
      setDoc, getDoc,
      onSnapshot, query,
    };

    // Beritahu app.js bahwa Firebase sudah siap
    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: { ok: true } }));
    console.log("[Firebase] Berhasil terhubung ke Cloud Database.");

  } catch (err) {
    console.error("[Firebase] Gagal inisialisasi:", err);
    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: { ok: false } }));
  }
}

initFirebase();
