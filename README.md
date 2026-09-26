# Office Case Files

Web game nhập vai hành động trinh thám 2.5D kết hợp học tiếng Anh A2-B1. React quản lý UI, Phaser quản lý gameplay theo frame, và ASP.NET Core quản lý tiến độ đáng tin cậy.

Repository hiện có bản đồ văn phòng trong Phaser, sổ tay/câu hỏi/kết luận/ôn tập trong React, cùng API lưu lượt chơi, manh mối, câu trả lời, điểm số và kết quả bằng SQLite. Docker và cấu hình GitHub chỉ được bổ sung sau mốc `code_complete` trong `PROJECT_PLAN.md`.

## Công cụ cần cài

| Công cụ | Phiên bản | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Git | Bản đang được hỗ trợ | Có | Clone và quản lý source |
| PowerShell | 7 trở lên | Có trên Windows | Chạy `scripts/verify.ps1` |
| Node.js | 24.x; máy hiện tại đã kiểm tra với 24.15.0 | Có | Bao gồm npm; chạy Vite, React, Phaser và frontend tests |
| npm | 11.12.1 | Có | Package manager duy nhất của dự án, được khóa trong `apps/web/package.json` |
| .NET SDK | 10.0.401 hoặc patch tương thích theo `global.json` | Có | SDK đã bao gồm ASP.NET Core runtime; không cần cài runtime riêng |
| Trình duyệt hiện đại | Chrome, Edge hoặc Firefox | Có | Chạy và kiểm tra game |

Không cần cài chương trình SQLite riêng: provider được khôi phục qua NuGet. Visual Studio/VS Code là tùy chọn. Docker chưa cần cho local development hiện tại.

## Kiểm tra môi trường

Chạy tại PowerShell:

```powershell
git --version
node --version
npm --version
dotnet --version
```

Kết quả mong đợi là Node `v24.x`, npm `11.12.1`, và `dotnet --version` không báo lỗi khi đứng tại thư mục repository. `global.json` sẽ tự kiểm tra SDK .NET phù hợp.

Nếu `node --version` ra phiên bản khác (ví dụ `v22.x` khi dùng nvm-windows), chuyển sang Node 24 trước khi cài dependencies: `nvm use 24.15.0` (lệnh này đổi Node cho toàn máy), hoặc chỉ cho terminal hiện tại: `$env:PATH = "$env:NVM_HOME24.15.0;$env:PATH"`. Không có `pwsh` cũng được: `npm --prefix apps/web run e2e` tự dùng Windows PowerShell 5.1.

## Cài đặt trên Windows

### 1. Git và PowerShell

Nếu máy chưa có hai công cụ này và có Windows Package Manager:

```powershell
winget install --exact --id Git.Git
winget install --exact --id Microsoft.PowerShell
```

Sau khi cài, mở một cửa sổ PowerShell mới. Có thể tải thủ công từ [Git for Windows](https://git-scm.com/download/win) và [PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows).

### 2. Node.js 24 và npm

Cài Node.js 24 LTS từ [trang tải chính thức](https://nodejs.org/en/download/archive/v24). npm được cài cùng Node.js, không cần cài pnpm hoặc Yarn:

```powershell
node --version
npm --version
```

Nếu đang dùng trình quản lý phiên bản Node, chọn một bản Node 24.x thay vì bản `latest` không cố định. Dự án dùng `package-lock.json`; không chạy pnpm hoặc Yarn vì chúng sẽ tạo lockfile khác.

### 3. .NET SDK 10

Cách cài toàn máy, phù hợp cho môi trường phát triển thông thường:

```powershell
winget install --exact --id Microsoft.DotNet.SDK.10
dotnet --version
```

Nếu `dotnet --version` vẫn không dùng được với `global.json`, hoặc không có quyền admin/WinGet, cài chính xác SDK vào thư mục local đã được Git ignore:

```powershell
Invoke-WebRequest 'https://dot.net/v1/dotnet-install.ps1' -OutFile '.dotnet-install.ps1'
powershell -NoProfile -ExecutionPolicy Bypass -File ./.dotnet-install.ps1 `
  -Version 10.0.401 `
  -InstallDir ./.tools/dotnet

$env:DOTNET_ROOT = (Resolve-Path './.tools/dotnet').Path
$env:PATH = "$env:DOTNET_ROOT;$env:PATH"
dotnet --version
```

Hai biến môi trường trên chỉ áp dụng cho terminal hiện tại; chạy lại hai dòng đó khi mở terminal mới. Đây là cách cài không cần quyền admin theo [hướng dẫn `dotnet-install`](https://learn.microsoft.com/dotnet/core/tools/dotnet-install-script). Với cài đặt toàn máy, xem thêm [hướng dẫn .NET trên Windows](https://learn.microsoft.com/dotnet/core/install/windows).

## Khôi phục dependencies

Từ thư mục gốc repository:

```powershell
npm --prefix apps/web ci
dotnet restore OfficeCaseFiles.slnx --locked-mode --configfile NuGet.Config
dotnet tool restore --configfile NuGet.Config
```

Lần chạy đầu cần kết nối tới npm registry và NuGet. Dependencies frontend nằm trong `apps/web/node_modules`; NuGet packages được đặt tại `.packages/nuget`. Công cụ `dotnet-ef` được pin bởi `.config/dotnet-tools.json`. Các thư mục cài đặt/cache đều đã được Git ignore.

## Chạy local

Mở hai terminal tại thư mục gốc repository. Trước lần chạy API đầu tiên hoặc sau khi pull một migration mới, áp dụng migration riêng:

```powershell
dotnet run --project services/api --no-launch-profile -- --migrate
```

Lệnh này tạo/cập nhật file SQLite `services/api/office-case-files.db` (đường dẫn tương đối được tính từ thư mục project API); file được Git ignore. API không tự sửa schema khi khởi động, và sẽ báo rõ nếu còn migration chưa áp dụng. Không xóa file database để “sửa lỗi” vì nó chứa tiến độ local của bạn. Có thể đổi vị trí database bằng biến môi trường `ConnectionStrings__Game`; đường dẫn mới phải nằm trên ổ lưu bền vững.

Terminal 1 — API:

```powershell
dotnet run --project services/api --launch-profile http
```

API chạy tại `http://127.0.0.1:5062`; có thể kiểm tra `http://127.0.0.1:5062/api/v1/health`.

Terminal 2 — web:

```powershell
npm --prefix apps/web run dev
```

Mở `http://127.0.0.1:5173`. Vite chuyển tiếp `/api` tới API tại cổng 5062. Bấm “Bắt đầu lượt điều tra”, đi tới email trên bàn, thiết bị chat hoặc biên bản họp; khi thấy gợi ý thì nhấn `E` để thu thập. Mở “Sổ tay điều tra” để đọc nội dung tiếng Anh, từ vựng tiếng Việt và câu hỏi đọc hiểu vừa mở. Trả lời sai có thể thử lại; trả lời đúng Q01 rồi quay lại Maya để lấy lời khai E05. Sau khi hoàn thành Q01–Q03 và thu thập E03/E06, mở “Kết luận vụ án”, chọn một đồng nghiệp, một lý do và đúng hai bằng chứng. Kết luận là bất biến; server tính riêng điểm đọc hiểu và điều tra, sau đó mở năm câu ôn tập. “Chơi lại vụ án” tạo session mới và giữ nguyên kết quả cũ trong SQLite. Tải lại trang vẫn giữ toàn bộ tiến độ, kết luận và review. Dừng mỗi tiến trình bằng `Ctrl+C`.

Sao lưu/khôi phục tiến độ (`--export` / `--import`), reset và kiểm tra bàn giao: xem [docs/runbooks/local.md](docs/runbooks/local.md). Chạy bằng Docker (`docker compose up -d`, mở `http://127.0.0.1:8080`): xem mục 7 của runbook.

Trong bản đồ, dùng `WASD` hoặc phím mũi tên để di chuyển, giữ `Shift` để chạy, nhấn `E` khi đứng gần một điểm để tương tác và `Esc` để tạm dừng/tiếp tục. Chạm vòng “MỐC AN TOÀN” tại khu họp trước khi vào kho; máy quét sẽ đưa nhân vật về mốc này khi phát hiện. Nhấn `Space` để né trong một khoảng ngắn. Sau hai lần bị phát hiện có thể bật chế độ máy quét chậm; hỗ trợ này được lưu nhưng không ảnh hưởng điểm tiếng Anh. Vượt máy quét rồi nhấn `E` tại terminal để lấy E03 và mở Q03. Có thể nói chuyện với Maya, Leo và Nora; E05 mở sau Q01 đúng, còn E06 cần Q02 và Q03 đúng cùng các chứng cứ nguồn. Mở overlay sẽ dừng di chuyển và đóng sẽ trả focus về canvas. Khi cửa sổ hoặc tab mất focus, game tự tạm dừng; nhấn `Esc` để tiếp tục sau khi quay lại. Bàn và tủ là vật cản, còn camera theo nhân vật trong giới hạn bản đồ. Đáp án đúng, bộ bằng chứng được chấp nhận và lời giải chỉ nằm trong JSON phía server; API chỉ công bố lời giải ở đúng thời điểm sau câu trả lời hoặc kết luận.

HUD phía trên canvas luôn hiển thị mục tiêu hiện tại, mốc an toàn, trạng thái máy quét, hỗ trợ và thao tác `E` gần nhất bằng DOM có thể đọc được. Nhân vật, NPC và chứng cứ dùng bộ hình khối/màu code-authored thống nhất; không cần tải font, ảnh hay âm thanh bên ngoài. Ở màn hình hẹp, nội dung hồ sơ và kết quả vẫn đọc được nhưng ứng dụng sẽ nêu rõ gameplay cần bàn phím desktop. Danh mục nguồn hình ảnh hiện tại nằm tại `docs/assets/manifest.md`.

API Development công bố OpenAPI tại `http://127.0.0.1:5062/openapi/v1.json`. Nội dung nguồn vụ án nằm trong `services/api/Content/Cases/swapped-report.v1.json` và được kiểm tra khi API khởi động. Frontend kiểm tra response session/map/notebook tại runtime; cơ chế sinh TypeScript types từ OpenAPI chưa được thêm vì các công cụ đã thử chưa đồng thời tương thích TypeScript 6 và đạt npm audit sạch.

## Chạy toàn bộ kiểm tra

```powershell
./scripts/verify.ps1
```

Script cài dependencies theo lockfile, rồi chạy frontend lint/typecheck/test/build và backend restore/build/test. Nếu dùng SDK .NET local nhưng không thêm vào `PATH`:

```powershell
./scripts/verify.ps1 -DotnetCommand "./.tools/dotnet/dotnet.exe"
```

### Chạy browser E2E

Sau `npm ci`, cài Chromium đúng phiên bản Playwright một lần cho máy hiện tại:

```powershell
npm --prefix apps/web exec -- playwright install chromium
```

Chạy hành trình tích hợp bằng cửa sổ Chromium hiển thị, API thật và SQLite tạm cô lập:

```powershell
./scripts/e2e.ps1
```

Nếu dùng SDK .NET local của repository:

```powershell
./scripts/e2e.ps1 -DotnetCommand "./.tools/dotnet/dotnet.exe"
```

Runner dùng cổng test 5063/5174, dừng nếu cổng đã bị chiếm, migrate database riêng dưới `.tools/e2e`, rồi chỉ dừng các process do chính nó tạo. Database tạm luôn được xóa; log của lần lỗi được giữ trong thư mục run tương ứng để chẩn đoán. Browser luôn chạy headed theo quy tắc kiểm thử của dự án. `verify.ps1` không tự mở browser; E2E là gate riêng để việc chạy verification thông thường không bất ngờ chiếm focus.

## Xử lý lỗi thường gặp

- `dotnet` không được nhận diện: mở terminal mới sau khi cài toàn máy, hoặc thiết lập lại `DOTNET_ROOT`/`PATH` cho SDK local như trên.
- `A compatible .NET SDK was not found`: chạy `dotnet --list-sdks`; cài SDK 10.0.401 hoặc patch tương thích với `global.json`.
- npm sai phiên bản: dùng Node 24.x với npm 11.12.1 như `packageManager` trong `apps/web/package.json`; không cài pnpm hoặc Yarn cho repository này.
- Cổng 5062 hoặc 5173 đang bận: dừng tiến trình đang dùng cổng đó; cấu hình Vite hiện giả định API ở đúng cổng 5062.
- API báo pending migrations: chạy lệnh `--migrate` ở trên trước khi mở web. Không chạy migration đồng thời từ nhiều tiến trình.
- Lượt chơi biến mất: kiểm tra cookie còn tồn tại, thời hạn 30 ngày không hoạt động và `ConnectionStrings__Game` có trỏ về cùng file SQLite. Không có khôi phục đa thiết bị trong MVP.
- PowerShell chặn script cài .NET: chỉ dùng `-ExecutionPolicy Bypass` cho lệnh cài local được ghi ở trên; không cần đổi policy toàn máy.
- Máy không có `pwsh`: `npm --prefix apps/web run e2e` tự dùng Windows PowerShell 5.1 qua `scripts/run-e2e.mjs`; truyền SDK local bằng `npm --prefix apps/web run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe`.
- `npm ci` báo `EPERM` hoặc build API báo `MSB3027 ... locked`: một Vite dev server đang giữ `node_modules` hoặc một API đang chạy giữ `services/api/bin`. Dừng các preview/dev server trước khi chạy `verify.ps1` hoặc E2E.
- API trả 403 khi mở `http://localhost:5173`: API chỉ chấp nhận origin `http://127.0.0.1:5173`; mở đúng địa chỉ này.

Trước khi dùng AI agent, đọc `AGENTS.md`, `docs/agent/protocol.md`, `docs/memory/current.md` và task hiện tại. Docker và GitHub được cấu hình sau mốc `code_complete` theo `PROJECT_PLAN.md`.

## Vòng đời làm việc của agents

Agents có thể thực hiện discovery, yêu cầu, thiết kế, kiến trúc, coding, nội dung, kiểm thử, tài liệu, đóng gói và release readiness. Deploy/publish hoặc thay đổi production chưa thuộc phạm vi được phép. Commit các thay đổi đã kiểm chứng và push nhánh hiện tại lên `origin` đã cấu hình sau mỗi phiên hoàn tất là chỉ thị thường trực của người dùng (xem `AGENTS.md`).

Mỗi task phải kết thúc bằng `Improvement review`: ghi `none` nếu không có bài học bền vững, hoặc đưa bài học qua candidate → verified → promoted/retired theo `docs/agent/improvement.md`. `./scripts/verify.ps1` chạy structural check để bảo đảm task và agent foundation không bỏ qua bước này.
