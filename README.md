# turbo.az tracker

turbo.az-da seçdiyin marka/model üzrə axtarışda **"Əvvəlcə ucuz"** sırasına görə ilk 10-luğa düşən
elanlardan **son 3 gündə** əlavə olunanları tapıb Telegram-a göndərir.

Hər 20 dəqiqədən bir GitHub Actions üzərində avtomatik işləyir (pulsuz, kompüter açıq olmasa da işləyir).

## Filtr necə əlavə/dəyişdirilir (telefondan)

`config.json` faylını GitHub app-dan (və ya github.com saytından telefon brauzerində) aç, qələm
(edit) düyməsinə bas, `subscriptions` siyahısına yeni obyekt əlavə et, "Commit changes" bas.
Actions avtomatik yeni faylla işə düşəcək.

Sahələr:

- `id` — unikal ad (istənilən mətn, məs. `nihat-kia-sportage`)
- `chat_id` — Telegram chat id-n (aşağıda necə tapmaq izah olunub)
- `make` — marka: Hyundai, Kia, Toyota, Mercedes, BMW, Changan, BYD (`src/lib/meta.js`-də `MAKES`-ə yeni marka əlavə edilə bilər)
- `model` — model adı (məs. `Accent`, `Sportage`) — **istəyə bağlı**, boş saxlasan bütün marka üzrə axtarır
- `market` — massiv, məs. `["Avropa"]` — dəyərlər: Amerika, Avropa, Çin, Digər, Dubay, Koreya, "Rəsmi diler", Rusiya, Yaponiya
- `fuel_type` — massiv, məs. `["Benzin"]` — dəyərlər: Benzin, Dizel, Qaz, Hidrogen, Elektro, Hibrid, "Plug-in Hibrid", "Dizel-Hibrid"
- `category` — ban növü massiv, məs. `["Sedan"]`
- `region` — şəhər (turbo.az-ın öz region id-ləri, hələ mətn adı ilə deyil)
- `color` — rəng (turbo.az-ın öz color id-ləri)
- `year_from`, `year_to` — il aralığı (rəqəm)
- `price_from`, `price_to` — qiymət aralığı (rəqəm, AZN)

Nümunə:

```json
{
  "id": "nihat-kia-sportage",
  "chat_id": "806704135",
  "make": "Kia",
  "model": "Sportage",
  "fuel_type": ["Benzin"],
  "year_from": 2015
}
```

## Öz chat_id-ni tapmaq

1. Telegram-da **t.me/turboaz_tracker_bot** aç, `/start` yaz
2. Bu repoda lokal olaraq: `TG_BOT_TOKEN=<token> node src/whoami.js`

## Quraşdırma (bir dəfəlik)

1. GitHub-da bu repo-nu yarat və push et
2. Repo → Settings → Secrets and variables → Actions → **New repository secret**
   - Name: `TG_BOT_TOKEN`
   - Value: bot token-i (BotFather-dən aldığın)
3. Repo → Settings → Actions → General → "Workflow permissions" → **Read and write permissions** seç (data/ qovluğuna commit üçün lazımdır)
4. Actions tab-ından `turbo.az yoxla` workflow-nu bir dəfə əl ilə işə sal (Run workflow) — test üçün

Bundan sonra hər şey avtomatikdir.
