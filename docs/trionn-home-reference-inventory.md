# Trionn Ana Sayfa — Canlı Referans Ölçüm Envanteri

İlk ölçüm: 27 Ağustos 2026 · Son kalibrasyon: 29 Ağustos 2026  
Kaynak: `https://trionn.com/` ana sayfası  
Amaç: Clone ana sayfasının görsel ve davranışsal uygulamasında kullanılacak tek referans setini oluşturmak.

## Ölçüm yöntemi ve kapsam

- Ölçümler canlı sayfada fontlar, GSAP ve ScrollTrigger hazır olduktan sonra alındı.
- Tüm koordinatlar ve ölçüler CSS pikselidir; `top` değerleri belge başlangıcına göredir.
- Dört hedef görünüm ölçüldü: `390×844`, `768×1024`, `1280×720`, `1440×900`.
- Header, hero, CTA, About, Vision, Key Facts, Work/Services, Testimonials, Design & Motion ve footer kapsandı.
- ScrollTrigger'ın ürettiği pin spacer'lar ayrıca ölçüldü. Bazı bölümlerin belge aralıkları bilinçli olarak üst üste biner; bu hata değil, pinli sahne kurgusunun parçasıdır.
- SEO, URL yapısı ve Trionn'ın kendi 3D varlığı bu envanterin kapsamı dışındadır. Clone'da mevcut özel 3D şekil korunacaktır.

## Sayfa ölçeği ve ana bölüm sınırları

| Görünüm | Belge yüksekliği | Header | Hero/pin sonu | About | Vision sahnesi | Key Facts | Work + Services pin alanı | Testimonials | Design & Motion pin alanı | Footer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 390×844 | 18.642 | 63 | 0–4.220 | 844–1.688 | 1.688–2.532 | 3.376–4.220 | 5.064–13.145* | 13.145–14.001 | 13.999–18.641 | 17.799–18.643 |
| 768×1024 | 27.658 | 74 | 0–5.120 | 1.024–2.048 | 2.048–3.072 | 4.096–5.120 | 5.120–18.944 | 18.944–19.978 | 19.977–27.657 | 26.634–27.658 |
| 1280×720 | 20.001 | 91 | 0–3.655 | 720–1.495 | 1.495–2.215 | 2.935–3.895 | 3.895–13.615 | 13.615–14.489 | 14.487–19.887 | 19.169–20.001 |
| 1440×900 | 24.597 | 102 | 0–4.500 | 900–1.800 | 1.800–2.700 | 3.600–4.679 | 4.679–16.829 | 16.829–17.812 | 17.810–24.560 | 23.662–24.597 |

\* Mobilde Selected Work içeriği `5.064` noktasında başlıyor; Services sahnesi `6.393–7.237`, ortak uzun akış ise `13.989` noktasına kadar devam ediyor. `4.220–5.064` aralığı partners/selected-work giriş fazıdır.

### Pin ve overlap kuralları

| Kurgu | 390×844 | 768×1024 | 1280×720 | 1440×900 |
|---|---:|---:|---:|---:|
| Vision pin spacer | 2.532 (3 viewport) | 3.072 (3 viewport) | 2.160 (3 viewport) | 2.700 (3 viewport) |
| Work + Services ortak pin spacer | mobil bileşik akış | 13.824 (13,5 viewport) | 9.720 (13,5 viewport) | 12.150 (13,5 viewport) |
| Design & Motion pin spacer | 4.642 (≈5,5 viewport) | 7.680 (7,5 viewport) | 5.400 (7,5 viewport) | 6.750 (7,5 viewport) |
| Key Facts / Vision overlap | 844 | 1.024 | 720 | 900 |
| Footer / son pin overlap | 842 | 1.023 | 718 | ≈898 |

Desktop ve tablette Work ile Services ayrı normal-flow bölümleri değildir; aynı pin spacer içinde ilerleyen zaman çizelgesidir. Uygulamada bu iki kısmı arka arkaya iki bağımsız yüksek blok olarak kurmak toplam yüksekliği ve bütün sonraki zamanlamaları bozar.

## 390×844 — mobil referans

### Header ve hero

| Öğe | Konum / ölçü |
|---|---|
| Header | `top 0`, yükseklik `63` |
| Logo | `x 18, y 19, 91×24` |
| Ses kontrolü | `x 206, y 19, 24×24` |
| Let's Talk | `x 236, y 18, 91×26`, font `13,7109` |
| Menü düğmesi | yaklaşık `x 333, y 18, 39×26` |
| Hero görünür sahne | `0–844`; hero/pin kabı `0–4.220` |
| Ana başlık kutusu | `x 15, y 76, 353×85` |
| CTA satırı | `x 18, y 192, 353×79` |
| Interaction/Hold göstergesi | mobilde gizli; DOM'da mevcut |
| Tahmin/stat kutusu | `x 174, y 666, 198×61` |
| Açıklama metni | `x 174, y 746, 198×56` |

### İçerik tipografisi

| Öğe | Konum / ölçü | Tipografi |
|---|---|---|
| About başlığı | `x 18, y 1.057, 353×134` | `30,4688 / 26,8125`, tracking `-1,82812` |
| Key Facts başlığı | `x 145, y 3.452, 100×27` | `30,4688` |
| Key Facts özeti | `x 121, y 3.517, 148×37` | `15,2344` |
| Testimonials başlığı | `x 26, y 13.196, 351×47` | `30,4688` |
| Design & Motion başlığı | pin sahnesinde | `60,9375 / 48,75`, tracking `-4,875` |
| Footer başlığı | `x 15, y 17.901, 356×79` | `42,6562 / 39,6094`, tracking `-2,55938` |

## 768×1024 — tablet referans

### Header ve hero

| Öğe | Konum / ölçü |
|---|---|
| Header | yükseklik `74` |
| Logo | `x 26, y 27, 77×20` |
| Ses kontrolü | `x 569, y 27, 20×20` |
| Let's Talk | `x 595, y 26, 76×22`, font `11,52` |
| Hero görünür sahne | `0–1.024`; hero/pin kabı `0–5.120` |
| Ana başlık kutusu | `x 22, y 64, 717×91` |
| CTA satırı | `x 26, y 181, 338×26` |
| Interaction/Hold göstergesi | gizli; DOM'da mevcut |
| Tahmin/stat kutusu | `x 576, y 874, 166×52` |
| Açıklama metni | `x 576, y 942, 166×47` |

### İçerik tipografisi

| Öğe | Konum / ölçü | Tipografi |
|---|---|---|
| About başlığı | `x 87, y 1.339, 656×183` | `48,2534 / 45,7114`, tracking `-2,89521` |
| Key Facts başlığı | `x 305, y 4.160, 159×46` | `48,2534` |
| Key Facts özeti | `x 322, y 4.241, 124×31` | `12,8` |
| Testimonials başlığı | `x 26, y 18.995, 351×47` | `48,2534` |
| Testimonials özeti | `x 392, y 19.015, 351×47` | `12,8` |
| Design & Motion başlığı | pin sahnesinde | `70,3795 / 56,3036`, tracking `-5,63036` |
| Footer başlığı | `x 22, y 26.752, 347×89` | `48,7603 / 44,6976`, tracking `-2,92562` |

## 1280×720 — kısa masaüstü referansı

### Header ve hero

| Öğe | Konum / ölçü |
|---|---|
| Header | yükseklik `91` |
| Logo | `x 32, y 33, 96×26` |
| Ses kontrolü | `x 1.039, y 33, 26×26` |
| Let's Talk | `x 1.071, y 32, 91×27`, font `13,6064` |
| Hero görünür sahne | `0–720`; hero/pin kabı `0–3.655` |
| Ana başlık kutusu | `x 27, y 96, 804×144` |
| CTA satırı | `x 32, y 272, 422×32` |
| Interaction/Hold göstergesi | `x 448, y 539, 384×136` |
| Tahmin/stat kutusu | `x 1.040, y 539, 208×64` |
| Açıklama metni | `x 1.040, y 623, 208×53` |

### İçerik tipografisi

| Öğe | Konum / ölçü | Tipografi |
|---|---|---|
| About başlığı | `x 135, y 840, 1.113×288` | `76,0064 / 72`, tracking `-4,56038` |
| Key Facts başlığı | `x 515, y 3.015, 250×72` | `76,0064` |
| Key Facts özeti | `x 570, y 3.126, 140×35` | `14,4` |
| Testimonials başlığı | `x 135, y 13.735, 495×72` | `76,0064` |
| Testimonials özeti | `x 650, y 13.775, 495×53` | `14,4` |
| Design & Motion başlığı | pin sahnesinde | `117,299 / 93,8394`, tracking `-9,38394` |
| Footer başlığı | `x 27, y 19.315, 640×141` | `76,8 / 70,4`, tracking `-4,608` |

## 1440×900 — geniş masaüstü referansı

### Header ve hero

| Öğe | Konum / ölçü |
|---|---|
| Header | yükseklik `102` |
| Logo | `x 36, y 37, 108×29` |
| Ses kontrolü | `x 1.169, y 37, 29×29` |
| Let's Talk | `x 1.205, y 36, 103×30` |
| Hero görünür sahne | `0–900`; hero/pin kabı `0–4.500` |
| Ana başlık kutusu | `x 31, y 108, 905×162` |
| Hero H1 | iki satır; `90 / 81`, tracking `-5,4`; ilk satır genişliği `390` |
| CTA satırı | `x 36, y 306, 475×36` |
| Interaction/Hold göstergesi | `x 504, y 699, 432×151` |
| Tahmin/stat kutusu | `x 1.170, y 699, 234×72` |
| Açıklama metni | `x 1.170, y 793, 234×57` |

### İçerik tipografisi

| Öğe | Konum / ölçü | Tipografi |
|---|---|---|
| About başlığı | `x 152, y 1.050, 1.252×324` | `85,5072 / 81`, tracking `-5,13043` |
| Key Facts başlığı | `x 579, y 3.690, 282×81` | `85,5072 / 81`, tracking `-5,13043` |
| Key Facts özeti | `x 641, y 3.813, 157×38` | `16,2` |
| Testimonials başlığı | `x 152, y 16.964, 557×81` | `85,5072 / 81`, tracking `-5,13043` |
| Testimonials özeti | `x 731, y 17.008, 557×57` | `16,2` |
| Design & Motion başlığı | pin sahnesinde | `131,962 / 105,569`, tracking `-10,5569` |
| Footer başlığı | `x 31, y 23.826, 720×158` | `86,4 / 79,2`, tracking `-5,184` |

## Ortak görsel tokenlar

### Font aileleri

- Gövde ve arayüz: `Neue Haas`
- Büyük display başlıkları: `Familjen`
- CTA/header içindeki teknik küçük metinler: referanstaki mono/karma karakter korunmalı; yerine genel sistem monospace kullanılması görsel olarak yeterli değildir.

### Renkler

| Kullanım | Referans renk |
|---|---|
| Sayfa ana koyu zemin | `rgb(4, 5, 8)` / `#040508` |
| Hero koyu zemin | `rgb(12, 12, 12)` / `#0c0c0c` |
| Ana açık metin | `rgb(216, 216, 216)` / `#d8d8d8` |
| About başlangıç düşük-opaklık metni | `rgba(216, 216, 216, 0.1)` |
| Work açık sahne | `rgb(255, 255, 255)` |
| Design & Motion sahnesi | `rgb(195, 195, 195)` / `#c3c3c3` |
| Açık zemindeki ana koyu metin | `rgb(67, 67, 67)` / `#434343` |

Body font ölçeği görünüm bazında: `15,2344` (390), `12,8` (768), `12,8` (1280), `14,4` (1440).

## Work / Services animasyon fazları

Canlı sayfada masaüstü ve tablette iki bölüm tek bir 13,5 viewport pin zaman çizelgesi içinde ilerler. Aşağıdaki noktalar 1440×900 ölçümünde görsel kontrol için yaklaşık checkpoint'tir; DOM bölüm sınırı değildir:

- `≈5.687`: Selected Work sunumu görünür.
- `≈7.479`: Selected Work → Services beyaz wipe geçişi belirginleşir.
- `≈8.279`: saf beyaz Services tipografi fazı görünür.
- `≈9.370`: koyu kaya/typography fazı belirginleşir.
- `16.829`: pin akışı biter ve Testimonials başlar.

Animasyon uygulamasında bu checkpoint'ler yalnız başlangıç kalibrasyonudur. Task 2 ve ilgili bölüm tasklarında scrub ilerlemesi ekran görüntüsü karşılaştırmasıyla yeniden ayarlanmalıdır.

## Uygulama için bağlayıcı kabul kuralları

1. Her hedef görünümde toplam belge yüksekliği bu envanterle ±`2 px` içinde eşleşmeli.
2. Normal-flow bölüm başlangıç ve bitişleri ±`2 px`; font rasterizasyonundan etkilenen metin kutuları ±`3 px` toleransta olmalı.
3. Header, ana grid kenarları, CTA, stat kutusu ve bölüm başlıklarının x/y koordinatları ±`2 px` olmalı.
4. Font family, font-size, line-height ve tracking ayrı ayrı eşleşmeden yalnız kutu ölçüsünün tutması yeterli sayılmaz.
5. Mobilde Hold/interaction göstergesi gizli kalmalı; stat ve açıklama sağ kolonda korunmalı.
6. Work + Services masaüstünde/tablette tek pin zaman çizelgesi olarak kalmalı.
7. Footer son pin sahnesiyle bir viewport'a yakın örtüşmeli; normal akışta sonuna eklenmemeli.
8. Clone'un mevcut 3D şekli korunmalı; fakat şeklin kadrajı, ışığı, ölçeği ve scroll tepkisi Trionn sahne kompozisyonuna uymalı.
9. Her bölüm yalnız başlangıç konumunda değil, en az `%0`, `%25`, `%50`, `%75`, `%100` scroll ilerlemelerinde karşılaştırılmalı.
10. Ölçüm karşılaştırmaları fontlar ve tüm sahne runtime'ları hazırlandıktan sonra yapılmalı; ilk yükleme/preloader anı nihai görünüm olarak değerlendirilmemeli.

## Task 1 tamamlanma durumu

Task 1 tamamlandı. Dört hedef viewport için bölüm geometrisi, pin süreleri, ana grid koordinatları, temel tipografi, renkler ve kritik responsive farklar kaydedildi. Work/Services iç faz checkpoint'leri doğaları gereği yaklaşık olup ortak pin alanının kesin başlangıç/son sınırları ölçülmüştür; bu durum Task 2'yi başlatmayı engellemez.
