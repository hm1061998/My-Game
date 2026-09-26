# Runbook chạy local, sao lưu và khôi phục

Áp dụng cho môi trường local một người dùng với SQLite. Chưa áp dụng cho hosting/production (chưa được duyệt). Mọi lệnh chạy từ thư mục gốc repository trong PowerShell.

Nếu `dotnet` chưa có trên PATH, thay `dotnet` bằng `./.tools/dotnet/dotnet.exe` (SDK local của repository).

## 1. Cài đặt lần đầu

1. Cài công cụ theo mục "Công cụ cần cài" và "Cài đặt trên Windows" trong `README.md`.
2. Khôi phục dependencies: `npm --prefix apps/web ci` và `dotnet restore OfficeCaseFiles.slnx --locked-mode`.
3. Tạo/cập nhật database: `dotnet run --project services/api --no-launch-profile -- --migrate`.

Database mặc định là `services/api/office-case-files.db` (Git ignore). Đổi vị trí bằng biến `ConnectionStrings__Game`, ví dụ:

```powershell
$env:ConnectionStrings__Game = "Data Source=D:\OfficeCaseFiles\game.db"
```

## 2. Chạy game

```powershell
dotnet run --project services/api --launch-profile http
npm --prefix apps/web run dev
```

Mở `http://127.0.0.1:5173` (không dùng `localhost`, API chỉ nhận origin `127.0.0.1`). Kiểm tra API tại `http://127.0.0.1:5062/api/v1/health`. Dừng bằng `Ctrl+C`.

## 3. Sao lưu tiến độ (export)

1. **Dừng API** để có ảnh chụp nhất quán.
2. Chạy, với cùng `ConnectionStrings__Game` như lúc chơi:

```powershell
dotnet run --project services/api --no-launch-profile -- --export D:\OfficeCaseFiles\backup-2026-09-26.export.json
```

Lệnh chỉ đọc database, từ chối ghi đè file đã tồn tại và in số dòng của từng bảng. File gồm manifest (`exportVersion`, `schemaVersion`, `sourceProvider`, thời điểm UTC, case versions, số dòng và SHA-256 từng bảng) và toàn bộ tiến độ: session, revision, chứng cứ, câu trả lời đầu tiên, số lần thử, máy quét, kết luận, điểm, ôn tập và idempotency receipts.

**Bảo mật:** file export chứa token hash (đủ để tiếp tục session) và câu trả lời của người học. Không chứa raw cookie, connection string hay đường dẫn máy. Giữ như dữ liệu riêng tư; `*.export.json` và `exports/` đã được Git ignore — không commit hay chia sẻ công khai.

## 4. Khôi phục vào database sạch (import)

Import chỉ chạy vào database **rỗng và đã migrate**; không bao giờ ghi đè hay trộn dữ liệu.

```powershell
$env:ConnectionStrings__Game = "Data Source=D:\OfficeCaseFiles\restored.db"
dotnet run --project services/api --no-launch-profile -- --migrate
dotnet run --project services/api --no-launch-profile -- --import D:\OfficeCaseFiles\backup-2026-09-26.export.json
```

Trước khi ghi, lệnh kiểm tra `exportVersion`, `schemaVersion` khớp migration hiện tại và checksum từng bảng. Toàn bộ ghi trong một transaction; sau khi ghi đọc lại và so checksum, sai lệch thì rollback. Thành công in "Import verified and committed" cùng số dòng.

Sau đó chạy API với cùng `ConnectionStrings__Game` và mở lại trình duyệt cũ: cookie hiện có tiếp tục đúng session, revision, mốc và điểm. Gửi lại request cũ không cộng thêm lượt hay điểm.

Lỗi thường gặp (exit code 1, không thay đổi dữ liệu):

| Thông báo | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `Export refused: ... already exists` | File đích đã tồn tại | Chọn tên file mới |
| `Import refused (TargetNotEmpty)` | Database đích đã có dữ liệu | Tạo database mới, migrate rồi import |
| `Import refused (SchemaMismatch)` | Đích chưa migrate hoặc export từ phiên bản schema khác | Chạy `--migrate`; nếu vẫn lệch, dùng build cùng phiên bản với file export |
| `Import refused (Invalid): Checksum mismatch ...` | File bị sửa hoặc hỏng | Dùng bản sao lưu khác; không sửa tay file export |
| `Unsupported exportVersion` | File từ định dạng mới hơn | Dùng build hỗ trợ định dạng đó |

## 5. Bắt đầu lại từ đầu (reset)

Không xóa database đang dùng để "sửa lỗi". Muốn chơi từ đầu, trỏ `ConnectionStrings__Game` tới một file mới rồi `--migrate`; giữ file cũ làm bản lưu. Trong game, "Chơi lại vụ án" tạo session mới mà vẫn giữ kết quả cũ.

## 6. Kiểm tra trước khi bàn giao

Dừng mọi dev server (API giữ `services/api/bin`, Vite giữ `node_modules`), rồi:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe
npm --prefix apps/web run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe
```

E2E chạy trình duyệt hiển thị với database tạm riêng, không chạm vào database của bạn.
