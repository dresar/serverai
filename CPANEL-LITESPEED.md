# cPanel / LiteSpeed Node.js — troubleshooting

Error yang sering muncul:

## 1. `Cannot find package 'dotenv'`

**Penyebab:** `node_modules` tidak ada di folder aplikasi (hanya upload `index.js` tanpa `npm install`).

**Perbaikan (SSH ke server):**

```bash
cd /home/USERNAME/public_html/airotation
npm install --omit=dev
```

Pastikan di folder yang sama ada `package.json` dan `package-lock.json` (jika ada). Tanpa ini, semua dependency (`dotenv`, `hono`, `pg`, dll.) tidak akan ditemukan.

---

## 2. `ERR_REQUIRE_ASYNC_MODULE` — `require()` cannot be used on an ESM graph with top-level await

**Penyebab:** LiteSpeed (`fcgi-bin/lsnode.js`) memuat entry file dengan `require()`. File ESM yang memakai **top-level await** tidak bisa di-`require()` seperti itu.

**Perbaikan:** `index.js` (dan `migrate.js`) sudah diubah agar **tidak** memakai top-level await — pakai `async` IIFE / `.catch()` saja. Upload ulang file tersebut lalu restart app Node di cPanel.

---

## Ringkas checklist deploy

1. Upload seluruh folder project backend (bukan hanya satu file), **atau** clone dari Git di server.
2. Jalankan `npm install --omit=dev` di direktori aplikasi.
3. Buat `.env` dari `.env.cpanel.example` dan isi `DATABASE_URL`, `JWT_SECRET`, dll.
4. Set di cPanel “Application startup file” ke `index.js` dan root directory ke folder yang berisi `package.json`.
5. Node **≥ 20** (lihat `package.json` → `engines`).

---

**Catatan:** Ini **bukan** error Vercel. Path seperti `/home/.../public_html/...` dan stack `lsnode.js` = hosting **cPanel + LiteSpeed**.
