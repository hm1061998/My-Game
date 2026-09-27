# T39 — M2: Mở rộng trọn vụ án The Swapped Report

- **Trạng thái:** bản thiết kế v1.1 đã cập nhật theo lựa chọn mới; chờ chủ dự án rà soát và chọn tình huống cho vụ án thứ hai
- **Chủ trì:** Codex/điều phối tích hợp
- **Phụ thuộc:** T36, T37, T38
- **Phiên bản kế hoạch:** thiết kế 1.1
- **Giai đoạn sản phẩm:** thiết kế
- **Bằng chứng đầu vào:** chủ dự án cho biết lát cắt M1 dài 3–5 phút chưa đủ cho người học thật; muốn game rộng hơn và có đủ nội dung tiếng Anh trước; đồng thời cho phép các tác tử AI hỗ trợ triển khai. Ngày 2026-09-27, chủ dự án duyệt quy mô/kiến trúc/quy trình/cổng cho The Swapped Report, sau đó mở rộng thiết kế sang hai vụ án hoàn chỉnh, tùy chọn nhân vật, độ khó riêng trình độ Anh ngữ, phong cách giấy ngà–mực/than và HUD có minimap. Wireframe minimap được duyệt ngày 2026-09-27.

## Bước hiện tại và việc tiếp theo

Bản thiết kế v1.1 ở [Thiết kế mở rộng M2](../superpowers/specs/2026-09-27-m2-full-case-expansion-design.md) đã bổ sung các lựa chọn vừa duyệt. Bước hiện tại: chủ dự án rà soát bản viết và chọn tình huống trung tâm cho vụ án thứ hai. Chưa lập kế hoạch triển khai hoặc sửa code sản phẩm trước khi đặc tả được duyệt; sau đó sẽ lập kế hoạch theo phạm vi từng tệp và xin duyệt riêng trước khi triển khai.

## Định hướng đã thống nhất

M2 hướng tới hai vụ án hoàn chỉnh có thể lựa chọn; The Swapped Report dài hơn và giữ mục tiêu 25–35 phút, ba hồi, ba khu vực, 8–10 hồ sơ, hai đoạn né và ít nhất 16 cụm tiếng Anh trong ngữ cảnh. Người chơi chọn ngoại hình, độ khó và trình độ Anh ngữ A2/B1 riêng biệt. Tình huống trung tâm của vụ hai chưa được duyệt. Giữ phân chia React/Phaser/API, đáp án phía server. Thu phí vẫn hoãn; chưa liên hệ người học thật.

Quy trình AI: tác tử biên kịch; các tác tử độc lập phản biện logic suy luận và trình độ A2–B1/bản dịch; tác tử triển khai theo lát cắt có phạm vi, có phản biện; năm tác tử AI mô phỏng vai người chơi; người điều phối chạy QA trình duyệt có hiển thị và bộ script kiểm tra. Mô phỏng AI chỉ là giả thuyết.

## Phạm vi và phần loại trừ

Trong phạm vi thiết kế: hai vụ án hoàn chỉnh, The Swapped Report là vụ dài hơn; màn chọn vụ án; hai mẫu ngoại hình; gợi ý trình độ A2/B1; bốn mức độ khó; HUD trong game có minimap; nội dung, kết luận, ôn tập và kiểm thử trình duyệt có hiển thị. Kế hoạch triển khai phải chốt cổng riêng cho vụ hai sau khi chủ dự án chọn ý tưởng. Ngoài phạm vi: cổng quản trị, asset trả phí/báo giá vendor, checkout/thuê bao, liên hệ người tham gia, quảng cáo trả phí, phát hành hoặc deploy.

## Ghi nhận phê duyệt

- Các lựa chọn sản phẩm được ghi ở đặc tả đã duyệt qua câu trả lời ngày 2026-09-27; HUD/minimap được duyệt sau khi xem wireframe. Phê duyệt này cho phép cập nhật bản thiết kế.
- Phê duyệt toàn văn đặc tả v1.1: đang chờ chủ dự án rà soát; tình huống vụ hai còn mở.
- Phê duyệt kế hoạch triển khai và cách thực hiện: đang chờ; chưa có thay đổi code.

## Kiểm chứng

- Kiểm thử ứng dụng/trình duyệt: không áp dụng ở mốc này vì chỉ chuẩn bị tài liệu thiết kế và bàn giao, không đổi hành vi ứng dụng.
- Tự rà bản thiết kế: tách lựa chọn đã duyệt khỏi tình huống vụ hai và chi tiết sản xuất sẽ chốt sau; giữ nguyên phiên bản vụ án cũ; không làm lộ đáp án; xem phản hồi AI là giả thuyết; loại trừ rõ phần thu phí, liên hệ người tham gia và phát hành. Phát hiện gap: bản đầu chỉ bao quát vụ một và loại trừ vụ hai; kế hoạch phải bổ sung cổng nghiệm thu/ước tính riêng trước khi code. Các liên kết tương đối trỏ đúng.
- `scripts/check-agent-docs.ps1` đạt cho 40 task files; `git diff --check` đạt.

## Improvement review

- Kết quả: `candidate` (L015).
- Quan sát/bằng chứng: wireframe HTML không hiển thị với chủ dự án; ảnh wireframe được gửi trực tiếp sau đó mới xem và duyệt được (diễn tiến hội thoại 2026-09-27).
- Cơ chế: chưa sửa skill/script sau một lần; ở lần trực quan hóa tiếp theo, nếu preview không hiện thì xác nhận và chuyển ngay sang định dạng hiển thị trực tiếp.
- Kiểm chứng: wireframe cập nhật có minimap đã hiển thị trực tiếp và được chủ dự án duyệt; đặc tả và phạm vi được rà soát. Chạy agent docs check và `git diff --check` ở checkpoint này.
- Chủ trì/kích hoạt tiếp: Codex theo dõi nếu wireframe/preview tiếp tục lỗi.
