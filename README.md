# Usta Teknik · Ortak Web Paneli

Telefon ve bilgisayarlar **aynı veriyi** görür. Servis, parça, müşteri, kasa ve teklif ortak kayıttadır.

## Kurulum (bilgisayarda)

1. Bu klasörü aç.
2. Terminalde:

```bash
node server.js
```

3. Tarayıcıda aç: `http://localhost:3080`
4. PIN: `usta2026`

## Telefondan ortak kullanım

1. Panelin çalıştığı bilgisayar ile telefon **aynı Wi‑Fi**’de olsun.
2. Bilgisayarın yerel IP adresini öğren (ör. `192.168.1.20`).
3. Telefonda tarayıcıya yaz: `http://192.168.1.20:3080`
4. Aynı PIN ile giriş yap.

## PIN değiştirme

Sunucuyu şöyle başlat:

```bash
SHOP_PIN=sifren node server.js
```

## Notlar

- Veriler `data/store.json` dosyasında durur.
- Bir cihaz kayıt girince diğerleri yaklaşık 5 saniye içinde görür.
- İnternete açık kalıcı site için bu klasörü Railway, Render veya bir VPS’e yükleyebilirsin (`node server.js`, PORT ortam değişkeni).
