# T39 — M2: Mở rộng trọn vụ án The Swapped Report

- **Trạng thái:** đã soạn bản thiết kế; chờ chủ dự án duyệt
- **Chủ trì:** Codex/điều phối tích hợp
- **Phụ thuộc:** T36, T37, T38
- **Phiên bản kế hoạch:** thiết kế 1.0
- **Giai đoạn sản phẩm:** thiết kế
- **Bằng chứng đầu vào:** chủ dự án cho biết lát cắt M1 dài 3–5 phút chưa đủ cho người học thật; muốn game rộng hơn và có đủ nội dung tiếng Anh trước; đồng thời cho phép các tác tử AI hỗ trợ triển khai. Ngày 2026-09-27, chủ dự án chọn mở rộng The Swapped Report, duyệt vụ án ba hồi ở nhiều khu vực, duyệt mục tiêu thời lượng/nội dung, chọn một bản đồ Phaser cuộn nối liền, duyệt quy trình AI bốn lượt và duyệt cổng hoàn thành M2.

## Bước hiện tại và việc tiếp theo

Bản thiết kế đã soạn tại [Thiết kế mở rộng trọn vụ án M2](../superpowers/specs/2026-09-27-m2-full-case-expansion-design.md). Bước hiện tại: chờ chủ dự án đọc và duyệt bản thiết kế. Chưa lập kế hoạch triển khai hoặc sửa code sản phẩm trước khi bản thiết kế được duyệt. Sau đó sẽ lập kế hoạch theo phạm vi từng tệp và xin duyệt riêng trước khi triển khai.

## Định hướng đã thống nhất

Mở rộng một vụ án hiện có thành cuộc điều tra ba hồi, dài khoảng 25–35 phút, đi qua ba khu vực nhận diện riêng trên cùng bản đồ Phaser cuộn. Mục tiêu gồm 8–10 hồ sơ, hai đoạn né ngắn công bằng, ít nhất 16 cụm tiếng Anh công sở được đặt trong ngữ cảnh, bản dịch Việt tùy chọn ẩn mặc định, kết luận có dẫn chứng và phần ôn tập. Giữ phân chia trách nhiệm React/Phaser/API hiện tại, đáp án vẫn ở server. Phần kiếm tiền và liên hệ người học thật nằm ngoài phạm vi.

Quy trình AI: tác tử biên kịch; các tác tử độc lập phản biện logic suy luận và trình độ A2–B1/bản dịch; tác tử triển khai theo lát cắt có phạm vi, có phản biện; năm tác tử AI mô phỏng vai người chơi; người điều phối chạy QA trình duyệt có hiển thị và bộ script kiểm tra. Mô phỏng AI chỉ là giả thuyết.

## Phạm vi và phần loại trừ

Trong phạm vi: mở rộng một vụ án trọn vẹn, chỉnh bản đồ/nội dung ở mức tối thiểu cần thiết, bổ sung học liệu và logic chứng cứ, hai đoạn né, kết luận/ôn tập, và kiểm tra game trên trình duyệt thật. Không làm vụ án thứ hai, cổng quản trị, asset trả phí/báo giá vendor, checkout/thuê bao, liên hệ người tham gia, quảng cáo trả phí, phát hành hoặc deploy.

## Ghi nhận phê duyệt

- Các phần định hướng/thiết kế được chủ dự án duyệt qua các câu trả lời ngày 2026-09-27. Phê duyệt này cho phép viết bản thiết kế.
- Phê duyệt bản thiết kế: đang chờ.
- Phê duyệt kế hoạch triển khai và cách thực hiện: đang chờ; chưa có thay đổi code.

## Kiểm chứng

- Kiểm thử ứng dụng/trình duyệt: không áp dụng ở mốc này vì chỉ chuẩn bị tài liệu thiết kế và bàn giao, không đổi hành vi ứng dụng.
- Tự rà bản thiết kế: tách quyết định đã duyệt khỏi nội dung/ID sẽ chốt sau; giữ nguyên phiên bản vụ án cũ; không làm lộ đáp án; xem phản hồi AI là giả thuyết; loại trừ rõ phần thu phí, liên hệ người tham gia và phát hành. Các liên kết tương đối trỏ đúng trong repo.
- `scripts/check-agent-docs.ps1` đạt cho 40 task files; `git diff --check` đạt.

## Improvement review

- Kết quả: `none`.
- Quan sát/bằng chứng: đây là mốc đầu tiên mở rộng phạm vi M2; chưa có lỗi lặp lại hay khoảng trống quy trình đã kiểm chứng để thay đổi cơ chế dùng chung.
- Cơ chế: không đề xuất sửa skill, rule, script hoặc template. Đánh giá lại sau khi chạy quy trình AI soạn/phản biện nội dung.
- Kiểm chứng: tự rà tài liệu, agent-doc foundation check và `git diff --check` đều đạt.
- Chủ trì/kích hoạt tiếp: Codex điều phối tích hợp sau khi thực hiện kế hoạch triển khai và quy trình nội dung AI.
