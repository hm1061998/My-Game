# Rà soát skill nội bộ sau khi thêm 16 skill

Trạng thái: đã chỉnh điểm xung đột; chờ kiểm tra và handoff cuối phiên 27-09-2026.

| Skill cũ | Kết quả rà soát | Xử lý |
|---|---|---|
| `project-handoff` | Cung cấp quy trình ghi trạng thái task và memory riêng của Office Case Files; Superpowers không thay thế nội dung dự án này | Giữ |
| `product-lifecycle` | Cung cấp các cổng từ discovery đến handoff. Câu “Never infer permission to push” chưa nói rõ lệnh push thường trực trong `AGENTS.md` | Giữ và sửa đúng câu đó: chỉ push khi chỉ dẫn hiện hành bao phủ nhánh/đích đã xác minh; dừng nếu mơ hồ hoặc auto-review từ chối |
| `implement-vertical-slice` | Cung cấp ranh giới React, Phaser, API, domain, storage riêng của dự án; trùng một phần quy trình test/review với Superpowers | Giữ; dùng cho ranh giới dự án, còn skill Superpowers áp dụng cho quy trình khi phù hợp |

Không xóa skill chỉ vì tên hoặc quy trình tương tự: cả ba chứa tri thức riêng của dự án. Khi hai skill bất đồng, yêu cầu hiện tại của người dùng và `AGENTS.md` quyết định phạm vi, phê duyệt, kiểm chứng và Git. Skill không cấp quyền mới. Phản hồi từ auto-review từ chối một hành động phải được tôn trọng.

Ba skill gốc và index đã được đọc lại. `product-lifecycle` được sửa trong phần thân; tên và description không đổi, nên pointer Claude không cần thay. Việc còn lại: chạy validator/tài liệu, xem `git diff`, commit thay đổi liên quan. Push đến `origin` vẫn bị chặn bởi auto-review trong task trước; không thử đường vòng.
