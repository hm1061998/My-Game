# GitHub CI và bảo vệ nhánh

Áp dụng cho repository `origin` hiện tại. Agent **không** tự đổi cài đặt repository, chế độ công khai, secrets hay branch protection; các bước dưới đây do chủ repository tự làm trên GitHub.

## Workflow CI (`.github/workflows/ci.yml`)

Chạy khi push/PR vào `main` và khi bấm "Run workflow". Quyền mặc định `contents: read`; action được ghim theo commit SHA; không dùng secret, không push image.

| Job | Runner | Nội dung |
| --- | --- | --- |
| `verify` | windows-latest | `scripts/verify.ps1`: npm ci, lint, typecheck, unit test, build, restore khóa, build + test .NET, kiểm tra tài liệu agent |
| `e2e` | windows-latest | Playwright Chromium có giao diện, database tạm riêng; lỗi thì tải report/ảnh/trace (giữ 7 ngày) |
| `docker` | ubuntu-latest | `scripts/docker-smoke.sh`: build image, compose up, chờ healthy, kiểm tra route công khai và 404 cho file riêng |

Chạy lại cục bộ đúng các bước đó: `scripts/verify.ps1`, `npm --prefix apps/web run e2e`, `bash scripts/docker-smoke.sh` (cần Docker Desktop).

Trên Windows PowerShell, nếu `bash` gọi WSL shim và báo `/bin/bash: not found`, hãy gọi Git Bash for Windows trực tiếp (điều chỉnh đường dẫn nếu Git cài ở vị trí khác):

```powershell
& "C:\Program Files\Git\bin\bash.exe" scripts/docker-smoke.sh
```

Hoặc chạy `bash scripts/docker-smoke.sh` trong Git Bash.

## Bảo vệ nhánh `main` (khuyến nghị)

GitHub → **Settings → Rules → Rulesets** (hoặc **Branches → Branch protection rules**) cho `main`:

1. Bật **Require status checks to pass**, chọn các check: `verify (lint, typecheck, unit, build, .NET tests)`, `e2e (headed Chromium journey)`, `docker (build and container smoke)`. Các tên này chỉ hiện sau khi workflow đã chạy ít nhất một lần.
2. Bật **Block force pushes** và **Restrict deletions**.
3. Với một người bảo trì: **không** bật "Require approvals" bắt buộc người review khác, nếu không sẽ không merge được. Có thể dùng PR để CI chạy trước khi merge.
4. Nếu bật "Require a pull request before merging", agent vẫn chỉ push lên nhánh hiện tại như chỉ thị thường trực; khi push thẳng vào `main` bị chặn, agent sẽ dừng và báo lại thay vì đổi cài đặt.

Tính năng rulesets/branch protection cho repository riêng tư phụ thuộc gói tài khoản GitHub; kiểm tra trên trang Settings.

## Chi phí và xem kết quả

Runner Windows tiêu phút Actions nhiều hơn Linux. Kết quả xem ở tab **Actions** của repository. Máy local chưa cài GitHub CLI (`gh`); với repository riêng tư, agent không tự đọc được kết quả chạy — gửi link run cho agent nếu cần phân tích.
