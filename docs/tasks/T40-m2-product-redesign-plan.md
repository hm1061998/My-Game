# T40 — Lập kế hoạch triển khai M2 theo thiết kế mới

- **Trạng thái:** kế hoạch v1.0 sẵn sàng để chủ dự án rà soát; chưa code
- **Chủ trì:** Codex/điều phối tích hợp
- **Phụ thuộc:** T39
- **Kế hoạch:** [Kế hoạch triển khai M2](../superpowers/plans/2026-09-27-m2-product-redesign-implementation.md)
- **Phiên bản:** 1.0 · 2026-09-27
- **Giai đoạn sản phẩm:** xác định → thiết kế → lập kế hoạch; chờ duyệt kế hoạch
- **Bằng chứng đầu vào:** chủ dự án yêu cầu “triển khai kế hoạch theo thiết kế mới” ngày 2026-09-27. Đây là ủy quyền chuẩn bị kế hoạch, không phải chấp thuận bắt đầu code. Định hướng M2 đã duyệt ở T39; ý tưởng vụ hai và một số chi tiết sản xuất được đặt thành cổng trước nhánh nội dung.

## Kết quả cần đạt

Tạo một kế hoạch tiếng Việt đủ cụ thể để đội AI chia lát cắt React/API/Phaser/nội dung, rồi triển khai M2 theo hướng hai vụ án, tùy chọn người chơi và HUD mới mà không làm rò đáp án, mất phiên cũ hoặc bỏ quên hành trình/tiến độ.

## Phạm vi và quyết định

- Bao gồm: rà kiến trúc hiện trạng, file-level tasks, interfaces, migration, content pipeline, survey/độ khó, character presets, world/encounter/minimap, art/audio, QA người chơi AI và cổng browser/scripts.
- Loại trừ: sửa code game ở task này, liên hệ người học thật, thu phí/thanh toán, mua asset, deploy hoặc phát hành.
- Chủ dự án đã duyệt: The Swapped Report dài hơn và có mục tiêu 25–35 phút/3 hồi/3 vùng/8–10 hồ sơ/2 đoạn né/≥16 cụm tiếng Anh; hai case hoàn chỉnh; mẫu ngoại hình nam/nữ dùng chung gameplay; bốn độ khó tách A2/B1; survey gợi ý nhưng cho tự chọn; giấy ngà–mực/than có màu nhấn; bỏ right bar và có minimap.
- Còn mở: premise/thời lượng cụ thể của case hai; độ chi tiết của biến thể ngôn ngữ A2/B1; câu hỏi/quy tắc survey; giá trị từng mức difficulty; thiết bị mục tiêu cho performance acceptance. Kế hoạch có Task 0 đề xuất cụ thể và cổng lựa chọn trước khi tạo nội dung case hai.
- Kỹ thuật: catalog endpoint và case catalog đã hỗ trợ nhiều case/version; API `POST /sessions` nhận `caseId` và pin `(caseId, caseVersion)`. Web vẫn khởi tạo `swapped-report`; world/checkpoint/encounter state còn theo một bản đồ/đoạn né. Case JSON validator giữ giới hạn 25–60 từ/hồ sơ và đúng 5 review items. Chi tiết kiểm tra nằm trong spec và kế hoạch.

## Handoff và kiểm chứng

- Baseline: `codex/m1-version-two` tại commit `4593069`; branch tracking `origin/codex/m1-version-two` sạch trước khi soạn kế hoạch.
- Ba agent rà React, API và Phaser ở chế độ chỉ đọc; đều không sửa file hoặc chạy app. Các phát hiện được tích hợp vào kế hoạch, trong đó sửa mô tả API nhiều case cho đúng hiện trạng.
- `scripts/check-agent-docs.ps1` đạt sau khi thêm T40 (41 task files); `git diff --check` đạt trên toàn bộ diff tài liệu hiện tại.
- Browser/app scripts: không chạy vì đây là kế hoạch/tài liệu, không đổi hành vi game. Không có thay đổi code sản phẩm.
- Push: repo yêu cầu commit/push scoped work khi bàn giao; quyền push đã được chủ dự án cho phép trước đó. Chỉ đẩy kế hoạch/task/memory sau khi kiểm tra cuối.

## Cổng tiếp theo

Chờ chủ dự án duyệt kế hoạch. Sau khi duyệt, bắt đầu Task 0; mở các agent implement theo đường `subagent-driven-development`, không cho nhiều agent sửa cùng tệp. Chỉ code sau khi kế hoạch được duyệt; nhánh nội dung case hai phải chờ chủ dự án chọn premise.

## Improvement review

- **Kết quả:** `none`.
- **Quan sát/bằng chứng:** ba audit độc lập xác nhận các ranh giới React, API và Phaser; không có lỗi lặp lại mới ngoài candidate L015 đã ghi tại T39.
- **Cơ chế:** không đổi rule/skill/script; kế hoạch phân quyền theo lát cắt/tệp và yêu cầu agent chỉ đọc khi khảo sát.
- **Kiểm chứng:** kế hoạch tự rà theo đặc tả, checklist của `writing-plans`, agent docs check và `git diff --check`; N/A browser vì tài liệu-only.
- **Kích hoạt tiếp:** Codex sau khi chủ dự án duyệt T40.
