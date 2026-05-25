# PDF Merger

Aplikasi web statis untuk menggabungkan PDF dan gambar menjadi satu file PDF langsung di browser menggunakan `pdf-lib`.

## Struktur Folder

```text
MergePDF/
├─ index.html
├─ styles.css
├─ app.js
└─ README.md
```

## Fitur

- Upload banyak file sekaligus
- Drag and drop file ke area upload
- Preview daftar file
- Tampilkan nama, ukuran, dan tipe file
- Gambar tampil sebagai thumbnail
- PDF tampil sebagai ikon
- Ubah urutan file dengan drag and drop atau tombol naik/turun
- Hapus file dari daftar
- Konversi gambar menjadi halaman PDF secara otomatis
- Gabungkan semua file sesuai urutan
- Download hasil sebagai `merged-document.pdf`
- Semua proses berjalan di browser tanpa backend

## Format yang Didukung

- PDF
- JPG
- JPEG
- PNG
- WEBP

File selain format di atas akan ditolak dengan pesan error.

## Cara Menjalankan

Karena aplikasi memakai ES module dan CDN untuk `pdf-lib`, jalankan lewat static server, bukan dengan membuka file HTML langsung.

### Opsi 1: Python

```bash
python -m http.server 5500
```

Lalu buka `http://localhost:5500`.

### Opsi 2: VS Code Live Server

1. Install ekstensi Live Server.
2. Klik kanan pada `index.html`.
3. Pilih Open with Live Server.

## Catatan Implementasi

- PDF digabung dengan `PDFDocument.copyPages()`.
- Gambar dimuat di browser, dikonversi ke PNG lewat canvas, lalu dimasukkan sebagai halaman PDF.
- Urutan file adalah urutan daftar pada UI.