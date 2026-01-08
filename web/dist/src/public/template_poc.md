# Laporan Temuan Kerentanan (PoC)

## 1. Informasi Kerentanan
**Nama Kerentanan:** (Contoh: SQL Injection pada Form Login)
**Lokasi / URL:** (Contoh: http://target.com/login)
**Parameter Terdampak:** (Contoh: username)

## 2. Deskripsi Singkat
Jelaskan apa kerentanannya dan bagaimana dampaknya.
(Contoh: Penyerang dapat menyisipkan perintah SQL berbahaya melalui input username, yang memungkinkan bypass autentikasi tanpa password yang valid.)

## 3. Langkah Reproduksi (Proof of Concept)
1. Buka halaman URL...
2. Masukkan payload berikut: `' OR 1=1 --`
3. Klik Login...
4. Amati bahwa login berhasil...

## 4. Dampak (Impact)
Jelaskan dampak terhadap kerahasiaan, integritas, dan ketersediaan data.
