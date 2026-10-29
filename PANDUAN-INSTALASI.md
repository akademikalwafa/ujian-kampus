# Panduan Instalasi — Ujian Kampus
## A. Backend (Google Apps Script)
1. script.google.com → Proyek baru → paste `Kode.gs`.
2. Buat OAuth Client ID (jenis *Web application*) di Google Cloud Console → *Authorized JavaScript origins*: `https://USERNAME.github.io`. Salin Client ID.
3. Tempel Client ID ke `CLIENT_ID` di `Kode.gs` **dan** di `js/config.js`.
4. Jalankan fungsi `setup()` **sekali** (izinkan akses Drive/Sheets). Email Anda otomatis menjadi Admin.
5. Deploy → Aplikasi web → Execute as: **Me**, Access: **Anyone** → salin URL `/exec` ke `GAS_URL` di `js/config.js`.
## B. Frontend (GitHub Pages)
1. Ekstrak ZIP. **Folder hasil ekstrak itulah folder yang di-`git init`** (di dalamnya langsung ada `index.html`). Cek dengan `dir`/`ls`.
2. Isi `js/config.js`, lalu: `git init` → `git add .` → `git commit -m "Upload pertama"` → `git branch -M main` → `git remote add origin https://github.com/USERNAME/REPO.git` → `git push -u origin main` (password = Personal Access Token, scope *repo*).
3. Repo → Settings → Pages → Deploy from branch → main / root → Enforce HTTPS.
4. Update: `git add . && git commit -m "update" && git push` lalu Ctrl+Shift+R.
## C. Pemakaian awal
Pengaturan → unggah kop & daftarkan email dosen → Data Jadwal → Impor CSV → Buat Soal.
