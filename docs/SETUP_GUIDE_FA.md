# آموزش جامع صفر تا صد نصب، راه‌اندازی — Antigravity Remote Control v6.0 (فارسی)

> 🇬🇧 **English Version:** [Complete A-to-Z Setup & GitHub Guide (English)](./SETUP_GUIDE_EN.md)

این راهنما به‌صورت قدم‌به‌قدم و از صفر تا صد، تمام مراحل نصب پیش‌نیازها، پیکربندی فایل `.env`، اتصال روی وای‌فای خانگی، اتصال از هر جای دنیا روی اینترنت همراه با تونل‌های امن، نصب یا کامپایل اپلیکیشن اندروید، اجرای تست‌های خودکار را آموزش می‌دهد.

---

## فهرست مطالب
- [الف) آشنایی کلی و معماری سیستم](#الف-آشنایی-کلی-و-معماری-سیستم)
- [ب) پیش‌نیازها و نصب ابزارهای مورد نیاز](#ب-پیش-نیازها-و-نصب-ابزارهای-مورد-نیاز)
- [پ) دانلود، نصب وابستگی‌ها و تنظیم فایل `.env`](#پ-دانلود-نصب-وابستگی‌ها-و-تنظیم-فایل-env)
- [ت) اجرا در حالت وای‌فای محلی (خانه / محل کار)](#ت-اجرا-در-حالت-وای‌فای-محلی-خانه--محل-کار)
- [ث) اجرا در حالت اینترنت جهانی و تونل امن (خارج از خانه)](#ث-اجرا-در-حالت-اینترنت-جهانی-و-تونل-امن-خارج-از-خانه)
- [ج) نصب اپلیکیشن اندروید، امکانات و ساخت APK از سورس](#ج-نصب-اپلیکیشن-اندروید-امکانات-و-ساخت-apk-از-سورس)
- [چ) تست و اطمینان از سلامت پروژه](#چ-تست-و-اطمینان-از-سلامت-پروژه)
- [خ) عیب‌یابی و سؤالات متداول](#خ-عیب‌یابی-و-سؤالات-متداول)

---

## الف) آشنایی کلی و معماری سیستم

پروژه **Antigravity Remote Control v6.0** به شما اجازه می‌دهد زمانی که پشت سیستم نیستید، از طریق مرورگر گوشی یا اپلیکیشن بومی اندروید، کنترل کامل **Antigravity 2.33+ Agentic Hub** را در دست داشته باشید:

1. **اتصال خودکار به Hub بدون فلگ اضافی (`hub_bridge.js`):**
   - سرویس در حال اجرای Antigravity 2.33+ را به‌صورت خودکار از طریق فایل‌های `~/.gemini/antigravity/daemon/hub_*.json` روی لوپ‌بک (`127.0.0.1`) با توکن امنیتی `x-codeium-csrf-token` پیدا می‌کند.
   - **دیگر نیازی به `--remote-debugging-port=9000` نیست** (البته پشتیبانی از CDP روی پورت‌های `9000–9003`، `9222–9223` و `9229` همچنان به‌عنوان پشتیبان خودکار وجود دارد).
2. **سرور دوگانه HTTP + HTTPS روی یک پورت (`server.js`):**
   - روی یک پورت واحد (`PORT=3000`) هر دو پروتکل `http://` / `ws://` و در صورت وجود گواهی SSL در `certs/` پروتکل `https://` / `wss://` را هم‌زمان ارائه می‌دهد.
3. **مدل امنیتی Zero-Trust:**
   - **در شبکه محلی (همان Wi-Fi):** درخواست‌های مستقیم شبکه خصوصی (RFC-1918) بدون هدر پروکسی برای راحتی کار در خانه مجاز هستند.
   - **در تونل اینترنتی عمومی:** هر درخواستی که از طریق تونل یا اینترنت برسد (دارای هدرهایی مثل `x-forwarded-for` یا `cf-connecting-ip`) برای تمام مسیرهای HTTP و WebSocket ملزم به احراز هویت با `APP_PASSWORD`، لینک Magic QR (`/?key=...`)، کوکی `httpOnly` یا هدر `x-ag-key` است.
4. **اپلیکیشن اندروید (`android/`) و رابط وب موبایل (`public/`):**
   - هر دو از فایل‌های وب یکسان (`public/` و آینه بایت‌به‌بایت آن در `android/app/src/main/assets/www/`) استفاده می‌کنند و نسخه اندروید امکانات بومی مانند جستجوی خودکار وای‌فای، ویبره لمسی، کلیپ‌بورد، آپلود فایل/تصویر، کنترل صدا، باز کردن لینک‌های خارجی در مرورگر سیستم و حالت پیش‌نمایش آفلاین را اضافه می‌کند.

---

## ب) پیش‌نیازها و نصب ابزارهای مورد نیاز

پیش از اجرا، ابزارهای زیر را روی کامپیوتر میزبان Antigravity نصب کنید:

### ۱. برنامه Antigravity نسخه 2.33 یا بالاتر
- برنامه **Antigravity** را به‌طور عادی روی سیستم خود باز کنید تا هسته Hub فعال باشد.

### ۲. Node.js نسخه 18 LTS یا جدیدتر (به همراه `npm`)
برای اجرای `server.js` و اسکریپت تست `tests/verify_remote_control.mjs` ضروری است.
- **ویندوز (PowerShell):**
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
  *(یا فایل نصاب LTS را از سایت رسمی [nodejs.org](https://nodejs.org/) دانلود و نصب کنید.)*
- **مک (Homebrew):**
  ```bash
  brew install node@20
  ```
- **لینوکس (Ubuntu / Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **تأیید نصب:**
  ```bash
  node --version
  npm --version
  ```

### ۳. Python نسخه 3.9 یا جدیدتر (با `venv` و `pip`)
برای اجرای لانچر (`launcher.py`)، ساخت کد QR در ترمینال، نصب خودکار کتابخانه‌های تونل و بررسی سلامت اتصال لازم است.
- **ویندوز:**
  ```powershell
  winget install Python.Python.3.12
  ```
  *(اگر از [python.org](https://www.python.org/downloads/) نصب می‌کنید، حتماً تیک **"Add python.exe to PATH"** را بزنید.)*
- **مک:**
  ```bash
  brew install python
  ```
- **لینوکس (Ubuntu / Debian):**
  ```bash
  sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip
  ```
- **تأیید نصب:**
  ```bash
  python --version   # در مک و لینوکس از python3 --version استفاده کنید
  ```

### ۴. Git
- **ویندوز:** `winget install Git.Git`
- **مک:** `xcode-select --install` (یا `brew install git`)
- **لینوکس:** `sudo apt-get install -y git`

### ۵. ابزارهای اختیاری برای تونل اینترنت (دسترسی خارج از خانه)
اسکریپت `launcher.py` به‌صورت خودکار محیط مجازی `venv/` ساخته و پکیج‌های `requirements.txt` (`pyngrok`، `python-dotenv`، `qrcode` و `pinggy`) را نصب می‌کند؛ بنابراین **Pinggy** بدون نصب هیچ ابزار اضافی آماده کار است.
- **Cloudflare (`cloudflared`):**
  - **ویندوز:** `winget install Cloudflare.cloudflared` (یا فایل `cloudflared.exe` را کنار فایل‌های پروژه قرار دهید)
  - **مک:** `brew install cloudflared`
  - **لینوکس:** بسته مناسب توزیع خود را از صفحه دانلود کلودفلر نصب کنید تا دستور `cloudflared` در `PATH` باشد.
- **Serveo (`ssh`):** از کلاینت داخلی OpenSSH ویندوز ۱۰/۱۱، مک یا لینوکس استفاده می‌کند.
- **ngrok:** برای استفاده از `ngrok` یک توکن رایگان از [dashboard.ngrok.com](https://dashboard.ngrok.com) بگیرید.

### ۶. ابزار ساخت APK اندروید *(فقط در صورت نیاز به کامپایل سورس اندروید)*
اگر فقط می‌خواهید از اپ استفاده کنید، نیازی به این بخش ندارید و می‌توانید فایل آماده `Antigravity-Remote-Control-v6.0.apk` را از بخش **Releases** گیت‌هاب نصب کنید. برای کامپایل سورس (`android/`):
- **JDK 17** (`winget install EclipseAdoptium.Temurin.17.JDK` در ویندوز)
- **Android Studio** یا ابزار خط فرمان **Android SDK** با پلتفرم SDK 36 (`compileSdk = 36`)، Build-Tools و `adb`.

---

## پ) دانلود، نصب وابستگی‌ها و تنظیم فایل `.env`

### ۱. دریافت کد پروژه
```bash
git clone https://github.com/<your-username>/antigravity-remote-control.git
cd antigravity-remote-control
```

### ۲. نصب وابستگی‌های Node.js و Python
```bash
npm install
```
*(یا برای نصب دقیق طبق قفل نسخه‌ها: `npm ci`)*

برای پایتون (لانچرهای `.bat` / `.sh` این مرحله را خودکار انجام می‌دهند، اما به‌صورت دستی هم می‌توانید انجام دهید):
```bash
# ویندوز (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# مک و لینوکس
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### ۳. ساخت و ویرایش فایل `.env`
فایل نمونه `.env.example` را با نام `.env` کپی کنید:
```bash
# در CMD ویندوز
copy .env.example .env

# در PowerShell / مک / لینوکس
cp .env.example .env
```

حالا فایل `.env` را باز کرده و متغیرهای زیر را مطابق نیاز خود تنظیم کنید:

| متغیر | مقدار پیش‌فرض / نمونه | توضیح کاربرد |
| :--- | :--- | :--- |
| `APP_PASSWORD` | `change-me-strong-password` | **رمز عبور دسترسی از اینترنت**، لینک Magic QR (`?key=`) و هدر `x-ag-key` اپ اندروید. پیش از اجرای حالت Web حتماً یک رمز قوی قرار دهید. اگر خالی بماند، لانچر یک کد ۶ رقمی تصادفی موقت می‌سازد. |
| `TUNNEL_PROVIDER` | `cloudflare` | ارائه‌دهنده اصلی تونل: `cloudflare`، `pinggy`، `serveo` یا `ngrok`. در صورت اختلال یا مسدود شدن ارائه‌دهنده اول، لانچر به‌ترتیب روی `pinggy -> serveo -> localtunnel` سوئیچ خودکار انجام می‌دهد. |
| `PORT` | `3000` | پورت سرور (مشترک برای HTTP/WS و HTTPS/WSS). |
| `HOST_IP` | *(تشخیص خودکار)* | تنظیم دستی IP شبکه محلی (مثلاً `192.168.1.50`) برای کد QR حالت وای‌فای. وقتی آداپتور مجازی VPN فعال باشد بسیار کاربردی است. |
| `PINGGY_TOKEN` | *(خالی)* | توکن اختیاری Pinggy برای داشتن آدرس ثابت‌تر از [dashboard.pinggy.io](https://dashboard.pinggy.io). |
| `PINGGY_SERVER` | `a.pinggy.io:443` | سرور Pinggy روی پورت `443`. |
| `NGROK_AUTHTOKEN` | *(خالی)* | فقط وقتی `TUNNEL_PROVIDER=ngrok` باشد الزامی است. |
| `CLOUDFLARE_TUNNEL_NAME` | *(خالی)* | نام تونل دائمی Cloudflare (اختیاری). |
| `CLOUDFLARE_TUNNEL_URL` | *(خالی)* | دامنه اختصاصی متصل به تونل دائمی Cloudflare (اختیاری). |
| `SESSION_SECRET` | *(کلید پیش‌فرض توسعه)* | رشته دلخواه تصادفی برای امضای کوکی نشست‌ها در محیط واقعی. |
| `AUTH_SALT` | *(نمک پیش‌فرض توسعه)* | تغییر آن تمام نشست‌های قبلی را باطل می‌کند. |

> **نکته امنیتی مهم:** فایل `.env` حاوی رمز شماست و هرگز نباید در گیت‌هاب آپلود شود. فایل `.gitignore` از قبل `.env`، پوشه `certs/`، محتویات `uploads/` و فایل‌های لاگ را نادیده می‌گیرد.

### ۴. اختیاری: فعال‌سازی HTTPS محلی (`certs/`)
در وای‌فای خانگی، حالت عادی HTTP به‌خوبی کار می‌کند. اگر به گواهی SSL خودامضا برای HTTPS محلی نیاز دارید:
```bash
node generate_ssl.js
```
با اجرای این دستور، کلید و گواهی در پوشه `certs/` ساخته شده و سرور از اجرای بعدی به‌طور هم‌زمان HTTPS/WSS را هم فعال می‌کند.

---

## ت) اجرا در حالت وای‌فای محلی (خانه / محل کار)

### گام ۱: باز کردن Antigravity
برنامه **Antigravity 2.33+** را به‌شکل معمولی روی کامپیوتر باز کنید.

### گام ۲: باز کردن دسترسی پورت `3000` در فایروال ویندوز (فقط بار اول)
برای اینکه گوشی روی همان وای‌فای بتواند به کامپیوتر وصل شود:
- **روش گرافیکی:** هنگام اولین اجرا در پنجره **Windows Defender Firewall** تیک **Private networks** را بزنید و **Allow access** را انتخاب کنید؛ یا در بخش **Windows Security -> Firewall & network protection -> Allow an app through firewall** دسترسی **Node.js JavaScript Runtime** را در شبکه **Private** مجاز کنید.
- **روش سریع PowerShell (با دسترسی Administrator):**
  ```powershell
  New-NetFirewallRule -DisplayName "Antigravity Remote Control (Port 3000)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Profile Private -Action Allow
  ```
- **لینوکس (`ufw`):** `sudo ufw allow 3000/tcp`

### گام ۳: اجرای سرور در حالت محلی
- **ویندوز:** روی فایل `start_ag_phone_connect.bat` (یا `shortcuts\Phone Connect (Home).bat`) دابل‌کلیک کنید.
- **مک / لینوکس:**
  ```bash
  chmod +x start_ag_phone_connect.sh   # فقط بار اول
  ./start_ag_phone_connect.sh
  ```
- **اجرای مستقیم با Node.js:**
  ```bash
  npm start
  ```

### گام ۴: اتصال از روی گوشی
- **با اپلیکیشن اندروید (پیشنهادی):**
  1. گوشی را به **همان مودم/وای‌فای** کامپیوتر وصل کنید.
  2. برنامه **Antigravity Remote** را باز کنید؛ در بخش **Wi-Fi Auto-Discovery** کارت کامپیوتر شما (`● Live · Hub v2.33.0`) نمایش داده می‌شود. روی آن بزنید تا بلافاصله متصل شود.
  3. *(در صورت نیاز می‌توانید آدرس `http://<IP_کامپیوتر>:3000` را دستی وارد کنید و **Connect to Antigravity Hub** را بزنید.)*
- **با مرورگر گوشی (اندروید / آیفون):**
  - کد QR چاپ‌شده در ترمینال را اسکن کنید یا آدرس IP محلی (مثلاً `http://192.168.1.20:3000`) را در مرورگر وارد کنید.

---

## ث) اجرا در حالت اینترنت جهانی و تونل امن (خارج از خانه)

در حالت Web Mode، نشست شما از طریق یک آدرس رمزنگاری‌شده `https://` در دسترس گوشی قرار می‌گیرد تا حتی با اینترنت سیم‌کارت (4G/5G) هم کنترل کامل داشته باشید.

### ۱. انتخاب ارائه‌دهنده مناسب تونل (بسیار مهم برای اینترنت ایران و VPN)
- **`TUNNEL_PROVIDER=cloudflare` (پیش‌فرض):**
  - بدون نیاز به اکانت، لینک موقت `https://*.trycloudflare.com` می‌سازد و دارای کشف لبه با DoH، عبور خودکار از آداپتور VPN و **تست انتقال داده واقعی (`/css/style.css`)** است تا قطعی‌های پورت `7844` و خطای `Error 1033` را سریعاً تشخیص داده و به صورت خودکار به `pinggy -> serveo -> localtunnel` منتقل شود.
- **`TUNNEL_PROVIDER=pinggy` (سریع‌ترین گزینه هنگام استفاده از VPN یا اختلال پورت `7844`):**
  - اتصال را منحصراً از طریق پورت استاندارد **TCP 443** برقرار می‌کند و از داخل بسیاری از VPNها و شبکه‌های محدود بدون تأخیر و در حدود ۱ تا ۳ ثانیه بالا می‌آید.
  - لانچر به‌صورت خودکار گزینه `xff` را برای تفکیک دقیق امنیت محلی/خارجی فعال کرده و رابط وب نیز هدر `X-Pinggy-No-Screen: 1` را ارسال می‌کند.
  - **توصیه عملی:** اگر در ایران هستید یا از VPN استفاده می‌کنید و می‌خواهید معطلی تست اولیه کلودفلر هم حذف شود، داخل فایل `.env` بنویسید:
    ```env
    TUNNEL_PROVIDER=pinggy
    ```
- **`TUNNEL_PROVIDER=serveo` / `TUNNEL_PROVIDER=ngrok`:**
  - `serveo` با SSH روی پورت `443` کار می‌کند و `ngrok` نیازمند `NGROK_AUTHTOKEN` در `.env` است.

### ۲. راه‌اندازی حالت Web Mode
- **ویندوز:** روی `start_ag_phone_connect_web.bat` (یا `shortcuts\Phone Connect (Outside).bat`) دابل‌کلیک کنید.
- **مک / لینوکس:**
  ```bash
  chmod +x start_ag_phone_connect_web.sh   # فقط بار اول
  ./start_ag_phone_connect_web.sh
  ```

### ۳. ورود و احراز هویت روی گوشی
در ترمینال این موارد نمایش داده می‌شود:
- آدرس عمومی HTTPS (مثلاً `https://xxxx.trycloudflare.com` یا `https://xxxx.run.pinggy-free.link`)
- رمز عبور (`APP_PASSWORD`)
- **کد Magic QR** شامل `?key=...`

برای اتصال:
- کافیست **Magic QR** را اسکن کنید یا لینک کامل را در **Antigravity Remote (اپ اندروید)** Paste کنید؛ اپ به‌طور خودکار کلید را در هدر امن `x-ag-key` ذخیره کرده و شما را وارد محیط کنترل می‌کند.

---

## ج) نصب اپلیکیشن اندروید، امکانات و ساخت APK از سورس

### روش ۱: نصب فایل آماده APK
1. فایل `Antigravity-Remote-Control-v6.0.apk` را از صفحه **GitHub Releases** دانلود و روی گوشی منتقل کنید.
2. فایل APK را باز کنید و در صورت درخواست سیستم‌عامل، مجوز **Install unknown apps** را برای مرورگر یا فایل‌منیجر فعال کنید.
3. *(اختیاری)* اگر فایل `Antigravity-Remote-Control-v6.0.apk` را در پوشه اصلی پروژه کنار `server.js` قرار دهید، دکمه **Install Android APK** در منوی کناری رابط وب (`/download/apk`) به‌طور خودکار فعال می‌شود.

### روش ۲: ساخت (کامپایل) فایل APK از سورس
1. مطمئن شوید **JDK 17** (`JAVA_HOME`) و **Android SDK** نصب هستند.
2. در پوشه `android/` یک فایل به نام `local.properties` *(نادیده‌گرفته‌شده در گیت)* بسازید و مسیر SDK را در آن بنویسید:
   ```properties
   # نمونه ویندوز (بک‌اسلش و دونقطه باید با \ فرار داده شوند):
   sdk.dir=C\:\\Users\\<YourName>\\AppData\\Local\\Android\\Sdk

   # نمونه مک:
   # sdk.dir=/Users/<YourName>/Library/Android/sdk

   # نمونه لینوکس:
   # sdk.dir=/home/<YourName>/Android/Sdk
   ```
3. *(نکته مهم)* اگر فایلی در پوشه `public/` تغییر دادید، آن را دقیقاً به `android/app/src/main/assets/www/` کپی کنید تا بایت‌به‌بایت همگام بمانند.
4. اجرای تست واحد اندروید و ساخت نسخه Release:
   ```bash
   cd android

   # ویندوز
   .\gradlew.bat testDebugUnitTest assembleRelease

   # مک و لینوکس
   ./gradlew testDebugUnitTest assembleRelease
   ```
5. فایل خروجی در مسیر زیر ساخته می‌شود:
   `android/app/build/outputs/apk/release/app-release.apk`
6. نصب مستقیم با کابل USB و ADB (اختیاری):
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

### مرور سریع امکانات نسخه v6.0
- **سوئیچر ۳بخشی بالا (`[✦ Antigravity | 🐝 Swarm | </> IDE]`):**
  - **✦ Antigravity:** چت زنده، نمایش دقیق تغییرات کد (`diff`)، تأیید یا رد دستورات ترمینال و فایل‌ها، پاسخ به سؤالات چندگزینه‌ای (`ask_question`) و ورود به ساب‌ایجنت‌های تودرتو (`Inspect Live Subagent ->`).
  - **🐝 Swarm (`/swarm-ui`):** پنل کامل ۵ تب زنبورهای Swarm (**Overview**، **Shared Board** با `#channel` و `@mention`، **Members** با فعالیت لحظه‌ای ابزارها، **@Mention Graph + Replay** و **Raw** + دکمه ارسال پیام سریع به Coordinator).
  - **`</>` IDE (`/ide`):** مرورگر فایل‌های پروژه، مشاهده و ویرایش کد با شماره خط، انتخاب بازه خطوط برای Quote مستقیم (`fileLineRange`)، مشاهده `git status`، سوئیچ بین فضای کاری‌ها و باز کردن فایل روی سیستم (`↗ Open on PC`).
- **مدل‌ها و سهمیه (`/quota`):** انتخاب از بین ۲۴ پیکربندی مدل و سطح پردازش Antigravity 2.33، تغییر حالت‌های `Agent` / `Autonomous` / `Planning` / `Fast` و رصد مصرف هفتگی و ۵ ساعته.
- **اکشن‌های `/` و نقل‌قول دقیق:** اجرای `/boost`، `/swarm`، `/btw`، `/plan`، `/compact`، `/find`، `/export`؛ انتخاب و پاسخ مجزا به هر بخش پاسخ هوش مصنوعی با **`❝ Quote & Reply`**، **`☷ Quote Parts`** یا انتخاب متن مستقیم در اندروید؛ ارسال عکس، PDF، ویدیو و فایل کد با دکمه `+` یا Paste.

---

## چ) تست و اطمینان از سلامت پروژه

پیش از انتشار یا پس از هر تغییر، تست‌های زیر را اجرا کنید:

```bash
# بررسی خطاهای نحوی (Syntax)
node --check server.js
node --check hub_bridge.js
node --check public/js/app.js
python -m py_compile launcher.py

# اجرای مجموعه تست کامل سرور، باینری‌ها، امنیت تونل و Chrome Headless
npm test
```

تست‌های واحد اندروید:
```bash
cd android
.\gradlew.bat testDebugUnitTest   # در مک/لینوکس: ./gradlew testDebugUnitTest
```

بررسی وضعیت سلامت سرور هنگام اجرا:
```bash
curl http://127.0.0.1:3000/health
```

---

## خ) عیب‌یابی و سؤالات متداول

| مشکل | علت احتمالی | راه‌حل |
| :--- | :--- | :--- |
| **خطای `Error 1033` کلودفلر یا قطع شدن صفحه** | مسدود بودن یا محدودیت DPI روی پورت `7844` توسط اینترنت یا VPN (مانند حالت Fake-IP DNS). | در فایل `.env` مقدار `TUNNEL_PROVIDER=pinggy` را بگذارید تا تونل منحصراً از پورت `443` استفاده کند (یا اجازه دهید `launcher.py` خودکار به Pinggy/Serveo سوئیچ کند). |
| **نمایش پیام هشدار Pinggy روی درخواست‌ها** | صفحه میانی نسخه رایگان Pinggy برای مرورگرها. | به‌صورت خودکار حل شده است (`public/js/app.js` هدر `X-Pinggy-No-Screen: 1` را می‌فرستد). همیشه با لینک کامل Magic QR یا رمز `APP_PASSWORD` وارد شوید. |
| **شناسایی نشدن Hub (`hubConnected: false`)** | برنامه Antigravity 2.33+ هنوز باز نشده یا نسخه قدیمی‌تر است. | برنامه Antigravity را باز کنید و ۵ ثانیه صبر کنید، یا برای نسخه‌های قدیمی‌تر از `shortcuts\Launch Antigravity.bat` (`--remote-debugging-port=9000`) استفاده کنید. |
| **عدم اتصال گوشی در وای‌فای (`ERR_CONNECTION_TIMED_OUT`)** | مسدود بودن پورت `3000` در فایروال ویندوز، فعال بودن AP Isolation مودم، یا انتخاب IP مجازی VPN به‌جای وای‌فای. | قانون پورت `3000` را در فایروال برای پروفایل **Private** اضافه کنید و در صورت استفاده از VPN، در `.env` مقدار `HOST_IP=<IP_وای‌فای_واقعی>` را ثبت کنید. |
| **خطای اشغال بودن پورت `3000` (`EADDRINUSE`)** | اجرای قبلی `node server.js` هنوز باز مانده است. | پنجره‌های قبلی را ببندید، `start_ag_phone_connect_web.bat` را اجرا کنید (پورت `3000` را خودکار پاک‌سازی می‌کند)، یا `PORT=3001` را در `.env` تنظیم کنید. |
| **بهم‌ریختگی کاراکترهای کد QR در CMD ویندوز** | صفحه کد قدیمی کنسول ویندوز به‌جای UTF-8. | از فایل‌های جدید `start_ag_phone_connect.bat` / `start_ag_phone_connect_web.bat` استفاده کنید که دستور `chcp 65001 >nul` را اجرا می‌کنند. |
| **خطای `npm test` روی هماهنگی فایل‌های اندروید** | ویرایش فایل‌های `public/` بدون کپی در پوشه assets اندروید. | فایل‌های تغییریافته در `public/` را دقیقاً داخل `android/app/src/main/assets/www/` کپی کنید. |
| **عدم نصب APK روی گوشی (`App not installed / conflicts`)** | نسخه قبلی روی گوشی با کلید Debug دیگری امضا شده است. | ابتدا اپ قبلی را از گوشی حذف کنید (`Uninstall`) و سپس APK جدید را نصب نمایید. |
| **خطای کامپایل اندروید (پیدا نکردن JDK یا SDK)** | تنظیم نبودن JDK 17 در `JAVA_HOME` یا نبود فایل `android/local.properties`. | JDK 17 را نصب و در `JAVA_HOME` تنظیم کنید و مسیر `sdk.dir` را در `android/local.properties` قرار دهید. |
