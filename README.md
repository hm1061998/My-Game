# Office Case Files

Web game nhập vai hành động trinh thám 2.5D kết hợp học tiếng Anh A2-B1. React quản lý UI, Phaser quản lý gameplay theo frame, và ASP.NET Core quản lý tiến độ đáng tin cậy.

## Yêu cầu

- Node 24 và pnpm 11.19.
- .NET SDK 10.0.401 theo `global.json`.

## Chạy local

Terminal 1:

```powershell
dotnet restore OfficeCaseFiles.slnx --locked-mode --configfile NuGet.Config
dotnet run --project services/api --launch-profile http
```

Terminal 2:

```powershell
pnpm --dir apps/web install --frozen-lockfile
pnpm --dir apps/web dev
```

Mở `http://127.0.0.1:5173`. Vite chuyển tiếp `/api` tới API tại `http://127.0.0.1:5062`.

## Kiểm tra

```powershell
./scripts/verify.ps1
```

Nếu `dotnet` chưa có trong PATH nhưng SDK nằm ở vị trí khác:

```powershell
./scripts/verify.ps1 -DotnetCommand "C:/path/to/dotnet.exe"
```

Đọc `AGENTS.md`, `docs/agent/protocol.md`, `docs/memory/current.md` và task hiện tại trước khi dùng AI agent. Docker và GitHub được cấu hình sau mốc `code_complete` theo `PROJECT_PLAN.md`.
