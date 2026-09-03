# Ana sayfa görsel karşılaştırma sistemi

Bu araç canlı Trionn ana sayfasını ve yerel clone'u aynı semantik bölüm ilerlemesinde yakalar. Her checkpoint için üç dosya üretir:

- `reference.png`: canlı Trionn
- `clone.png`: yerel uygulama
- `diff.png`: piksel farkı

Her çalışmanın kökünde ayrıca makine tarafından okunabilir `summary.json` ve hızlı inceleme için `summary.md` bulunur.

## Tam karşılaştırma

```bash
pnpm visual:compare
```

Yerel uygulama `http://localhost:3000` üzerinde çalışmıyorsa araç `pnpm dev` ile başlatır ve test sonunda kapatır. Canlı ve clone için fontların, preloader'ın, hero varlıklarının ve stabil document yüksekliğinin hazır olması beklenir. Canlı preloader ağ koşulları nedeniyle kapanmazsa referans en fazla iki temiz tarayıcı oturumunda yeniden denenir. Canlı sayfanın lazy içerikleri yüklenmeden belge yüksekliği kısa kalırsa araç hedef scroll'u sessizce son noktaya sıkıştırmaz; ilgili bölümün beklenen alt sınırını doğrular ve çalışmayı hatayla durdurur. Böylece footer veya eksik sayfa görüntüsü başka bir bölümün diff sonucu olarak rapora giremez.

Varsayılan çalışma şunları kapsar:

- `390×844`
- `768×1024`
- `1280×720`
- `1440×900`
- Hero, About, Vision, Key Facts/Partners, Selected Work, Services, Client Stories, Design in Motion ve Footer
- Her bölümde `%0`, `%25`, `%50`, `%75`, `%100`

Tam çalışma `4 × 9 × 5 = 180` karşılaştırma üretir ve birkaç dakika sürebilir.

## Hızlı veya hedefli çalışma

```bash
pnpm visual:compare -- --viewports mobile --sections hero,services --checkpoints 0,0.5,1
```

Diğer seçenekler:

```bash
pnpm visual:compare -- --clone http://127.0.0.1:3001
pnpm visual:compare -- --output .visual-comparison/manual-check
pnpm visual:compare -- --headed
```

Chrome/Chromium standart konumda değilse:

```bash
VISUAL_BROWSER_PATH=/absolute/path/to/chrome pnpm visual:compare
```

## Dinamik alan maskeleri

Magenta bölgeler karşılaştırma dışında bırakılması amaçlanan dinamik içeriktir:

- Hero'daki aktif/dönen kelime
- Saat
- İzin verilen farklı 3B geometrinin iç bölgesi

3B maske viewport merkezindeki dar bir geometri iç bölgesini kapatır. Canvas/model alanının dış sınırı, kadrajı, dış silüeti ve ekrandaki kapladığı alan görünür bırakılır; dolayısıyla yanlış ölçek veya konum diff'te kaybolmaz. Cookie banner'ları her iki hedefte de consent verilmiş durumuna getirilir; banner kapatılamazsa yalnız karşılaştırma oturumunun DOM'undan kaldırılır. Böylece tarayıcının önceki consent geçmişi sonucu değiştirmez.

Maske adayları önce canlı referans ve clone üzerinde ayrı ayrı ölçülür. Araç daha sonra aynı maske adı için iki taraftaki sınırların birleşimini hesaplar ve bu ortak dikdörtgenleri her iki ekran görüntüsüne de uygular. Böylece örneğin canlı Hero için kullanılan metin fallback'i clone'daki daha dar selector'dan farklı olsa bile magenta alanın kendi geometrisi piksel farkı üretmez; maskenin dışında kalan tipografi, yerleşim ve 3B kadraj karşılaştırılmaya devam eder.

## Video senkronizasyonu

Video içeren bölümler `visual.config.mjs` içindeki `videoSyncProgress` değeriyle kararlı hale getirilebilir. Araç ilgili sayfadaki videoların metadata bilgisini bekler, her videoyu süresinin aynı normalize edilmiş noktasına taşır ve ekran görüntüsünden önce durdurur. Son kare sınırındaki tarayıcı davranışını önlemek için seek hedefi video süresinin 50 ms önünde sınırlandırılır.

Bu işlem video alanını maskelemez. Medya kadrajı, kart sınırı, video üzerindeki metinler ve video içeriği karşılaştırmada kalır; yalnız referans ve clone'un farklı saatlerde oynuyor olmasından doğan faz farkı azaltılır. Kaynak videolar farklı kurgu veya süreye sahipse aynı normalize edilmiş zamanın aynı görsel kareyi garanti etmediği unutulmamalıdır.

## Bölüm normalizasyonu

Canlı referans aralıkları Task 24'te yapılan son belge kalibrasyonundan gelir. Tamamlanmış clone, Trionn ile aynı global ve birbiriyle örtüşen pinned timeline'ı kullandığı için iki tarafta da bu ortak semantik aralıklar esas alınır. Clone selector'ları yine her çalışmada bulunup ölçülür; böylece eksik/gizli bölüm hatası yakalanır ve ham DOM aralığı rapora tanı verisi olarak yazılır. Scroll noktası şu şekilde hesaplanır:

```text
sectionStart + (sectionLength - viewportHeight) × progress
```

Bu nedenle `%50 Services`, DOM kutusu pinned bölümün gerçek süresini temsil etmese bile iki tarafta da Services akışının aynı global fazını hedefler. Bu mod, clone document yüksekliği canlı referansla kalibre edildikten sonra kullanılır; geliştirme sırasında `cloneRangeMode` kaldırılırsa araç tekrar selector tabanlı aralığa dönebilir.

Hedef scroll değerine tek karede sıçranmaz. Clone, viewport yüksekliğinin `%70`inden küçük programatik adımlarla ilerler. Canlı Trionn ise bazı Lenis/ScrollTrigger timeline'ları `scrollTo` ile güncellemediği için geri beslemeli gerçek tekerlek girdisi kullanır; her adım mevcut `window.scrollY` değerine göre yeniden hesaplanır. Böylece doğrudan derin noktaya gidildiğinde önceki bölümün sahnesinin ekranda kalması önlenir.

## Yapılandırma

Viewport, ortak section sınırları, clone selector'ları, aralık modu, video senkronizasyon noktaları ve maskeler [visual.config.mjs](../visual.config.mjs) dosyasındadır. Bölüm yapısı veya pin süresi değişirse canlı ve clone document kalibrasyonu yeniden ölçülmeli; yalnızca component DOM yüksekliğine güvenilmemelidir.

## Araç doğrulaması

```bash
pnpm test:visual-compare
```

Bu test CLI argümanlarını, scroll normalizasyonunu, güvenli video seek hesabını, checkpoint isimlerini, ortak maske birleşimini ve gerçek PNG piksel farkı üretimini doğrular.
