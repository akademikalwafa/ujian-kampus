# Panduan Instalasi — Ujian Kampus (login Email + PIN, tanpa OAuth)
## A. Backend (Google Apps Script)
1. Buka proyek Apps Script Anda → **ganti seluruh isi** `Kode.gs` dengan versi baru.
2. Di baris paling atas ubah `PIN_ADMIN` menjadi PIN pilihan Anda (min 6 karakter).
3. Pilih fungsi **`aturPinAdmin`** → ▶ Run (izinkan bila diminta). Log akan menampilkan email Admin. **Jangan jalankan `setup()` lagi** bila sudah pernah (membuat folder dobel). Instalasi baru: jalankan `setup()` sekali saja, PIN Admin ikut tersimpan.
4. Deploy → Manage deployments → ikon pensil → Version: **New version** → Deploy (Execute as: Me, Access: Anyone). URL `/exec` tidak berubah.
## B. Frontend (GitHub → Vercel/GitHub Pages)
1. Salin semua isi ZIP ke folder proyek **kecuali `js/config.js`** bila sudah terisi (hanya butuh `GAS_URL`). Instalasi baru: isi `GAS_URL` di `js/config.js`.
2. Dari folder yang langsung berisi `index.html`: `git add .` → `git commit -m "login email pin"` → `git push`.
3. Buka situs, Ctrl+Shift+R.
## C. Pemakaian
- Admin: login dengan email Admin + PIN_ADMIN.
- Dosen: Pengaturan → Daftar Email Dosen → isi email, nama, PIN → Tambah. Beri tahu dosen email dan PIN-nya. PIN bisa diganti lewat tombol Ubah PIN; akses dicabut lewat Nonaktifkan.
- Sesi berlaku ±6 jam, lalu login ulang. Setelah 5 kali salah, login dikunci 15 menit.
