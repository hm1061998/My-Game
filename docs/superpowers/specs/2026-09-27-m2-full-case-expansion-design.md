# Thiết kế M2: Mở rộng trọn vụ án The Swapped Report

- **Trạng thái:** bản thiết kế tiếng Việt, chờ chủ dự án duyệt
- **Ngày:** 2026-09-27
- **Giai đoạn:** thiết kế; chưa lập kế hoạch triển khai
- **Sản phẩm:** Office Case Files, game điều tra trên trình duyệt để học tiếng Anh

## Mục tiêu và bằng chứng hiện có

Chủ dự án muốn tiếp tục M2 nhưng cho rằng lát cắt M1 dài 3–5 phút chưa đủ để mời người học thật. Trước khi thử với người thật, game cần có cuộc điều tra rộng hơn và đủ nội dung tiếng Anh trong ngữ cảnh. Các tác tử AI sẽ đảm nhận phần lớn việc soạn nội dung, phản biện và triển khai để quy trình của chủ dự án gọn hơn. Phần thu phí/kiếm tiền vẫn tạm dừng đến khi chủ dự án chủ động yêu cầu mở lại.

Bằng chứng hiện có: vụ án `swapped-report` có JSON v1 và v2, mỗi phiên bản gồm sáu hồ sơ, ba câu hỏi, ba NPC, bảng từ vựng, kết luận và năm câu ôn tập. Luồng M1 được duyệt là E01 → E02 → né máy quét → E03 → lời khai Nora E06 và được cố ý giữ ngắn. `OfficeScene` của Phaser đã có camera bám theo nhân vật trong thế giới 1600×1000, nhưng ranh giới bản đồ, sàn, hình ảnh phòng và vật cản đang được hard-code. Tọa độ tương tác trong vụ án hiện là tọa độ phẳng; server giữ đáp án và lời giải riêng.

## Các phần thiết kế đã được duyệt

Chủ dự án đã duyệt từng phần bằng lựa chọn ngày 2026-09-27:

1. Mở rộng **The Swapped Report** trước khi tạo vụ án thứ hai; giữ kiến trúc React/Phaser/API hiện tại.
2. Mục tiêu là vụ án ba hồi, chơi khoảng 25–35 phút trong ba khu vực nối tiếp; có 8–10 hồ sơ, hai đoạn né ngắn, khoảng 16 cụm tiếng Anh công sở hữu ích, phần kết luận và ôn tập. Bản dịch tiếng Việt tùy chọn, đặt cạnh tiếng Anh và ẩn mặc định.
3. Dùng một bản đồ Phaser cuộn với các khu vực nối liền, không tạo Phaser scene riêng cho từng khu. React quản lý giao diện/nội dung dễ đọc; Phaser quản lý gameplay theo frame; API/domain quản lý tiến độ/điểm số đáng tin cậy; JSON phía server chứa nội dung vụ án.
4. Dùng quy trình AI gọn: tác tử biên kịch soạn vụ án; các tác tử độc lập phản biện logic suy luận và chất lượng A2–B1/bản dịch; tác tử triển khai làm theo lát cắt có phạm vi; AI mô phỏng vai người chơi và kiểm tra trên trình duyệt có hiển thị giúp tìm, sửa lỗi. Mô phỏng AI là giả thuyết, không phải kiểm chứng với người thật.
5. Cổng hoàn thành M2 gồm: ba khu vực đi lại được; 8–10 hồ sơ; ít nhất 16 cụm ngôn ngữ trong ngữ cảnh; hai đoạn né công bằng; kết luận dựa trên chứng cứ được viện dẫn; bản dịch ẩn mặc định; không còn lỗi nghiêm trọng từ vòng phản biện AI; hành trình kiểm thử trên trình duyệt có hiển thị hoàn tất trên bản cuối.

## Trải nghiệm người chơi

Người chơi theo một vụ việc công sở xuyên suốt từ chỉ dẫn đầu tiên đến kết luận có chứng cứ:

1. **Hồi I — Chỉ dẫn:** nắm mục tiêu, xem yêu cầu dùng báo cáo, email/chat và phản ứng ban đầu. Người chơi nhận ra điểm mơ hồ trong “previous version” và có thể hỏi để xác nhận.
2. **Hồi II — Dòng thời gian:** đi qua khu vực họp/làm việc có nhận diện riêng, thu thập hồ sơ và so sánh lời khai. Một đoạn né ngắn bảo vệ lối vào kho lưu trữ; nếu thất bại, người chơi quay về checkpoint công bằng mà không mất hồ sơ hoặc điểm tiếng Anh.
3. **Hồi III — Kho lưu trữ và lời giải:** kiểm tra lịch sử phiên bản cùng ngữ cảnh bổ sung, vượt qua đoạn né thứ hai, nghe lời khai liên quan, chọn kết luận, trích chứng cứ hỗ trợ và ôn lại ngôn ngữ hữu ích trong vụ án.

Lời thoại, ID hồ sơ/đồ thị mở khóa, khu vực, từ vựng, câu hỏi và đáp án sẽ được chốt trong kế hoạch triển khai/tài liệu nội dung sau khi bản thiết kế này được duyệt. Giữ nguyên dữ kiện đã xác lập: Nora thay v3 bằng v2 do hiểu nhầm chỉ dẫn “previous version” của Maya; log tài khoản/thời điểm không tự chứng minh ý định. Không thêm động cơ phá hoại nếu chứng cứ không hỗ trợ.

## Thiết kế học tiếng Anh

- Giữ A2–B1 là mục tiêu biên tập, không tuyên bố chứng nhận trình độ. Dạy ít nhất 16 cụm từ/cách nói công sở thực tế trong ngữ cảnh: chỉ dẫn, hỏi xác nhận, phiên bản/tệp, trình tự thời gian và cách nói thận trọng về chứng cứ.
- Dùng lại các cụm quan trọng ít nhất hai lần trong hồ sơ, thoại NPC, mục tiêu hoặc phần ôn tập để người chơi suy nghĩa qua ngữ cảnh thay vì học thuộc danh sách.
- Tiếng Anh là nội dung chính; bản dịch Việt tùy chọn hiển thị sát đoạn tiếng Anh tương ứng. Bản dịch ban đầu ẩn và không ảnh hưởng điểm, số lần gợi ý, tiến độ, quyền trả lời hoặc quyền mở hồ sơ.
- Tránh buộc người chơi đọc nhiều khi đang gặp nguy hiểm. Khi mở thoại, manh mối hoặc câu hỏi thì gameplay tạm dừng; khi tắt/không có âm thanh vẫn có transcript và dấu hiệu hình ảnh tương đương.
- Giữ phần ôn tập gọn với năm câu ghi nhớ/vận dụng; kế hoạch triển khai chỉ đề xuất đổi số lượng nếu hợp đồng hiện tại cản trở nội dung và ghi rõ ảnh hưởng đến migration/kiểm thử.

## Bản đồ và ranh giới hệ thống

- Giữ một Phaser scene và bản đồ camera cuộn với ba khu vực nối liền, có hình ảnh nhận diện khác nhau. Ưu tiên dùng bản đồ 1600×1000 hiện tại, trừ khi kiểm thử bố cục cho thấy không đủ chỗ. Mặc định không tạo hệ thống chuyển scene/phòng.
- Giữ đúng phân chia trách nhiệm: React quản lý DOM, overlay, dịch, focus và trạng thái UI; Phaser quản lý di chuyển, va chạm, camera, hoạt ảnh và nhịp né; API/application/domain quản lý tiến độ/điểm số; Infrastructure tải JSON vụ án phía server.
- Giữ ID vụ án hiện tại và thêm nội dung dưới dạng phiên bản bất biến mới. Không sửa nội dung đã gắn với phiên chơi v1/v2. Không chuyển đáp án, lựa chọn đúng hoặc khóa chấm điểm sang frontend.
- Chỉ mở rộng cấu trúc dữ liệu vụ án phía server nếu thiết kế chứng minh tọa độ JSON hiện tại không thể biểu đạt khu vực/checkpoint/hành động cần thiết. Mọi mở rộng phải được kiểm tra và tương thích phiên bản; không xây công cụ biên tập màn chơi hoặc framework tạo nội dung tổng quát.
- Tái sử dụng ambience đã có license, âm thanh cục bộ/procedural và quy trình SVG trong repo. Không liên hệ bên ngoài, mua asset, thuê sản xuất, xin báo giá, làm checkout/thuê bao, quảng cáo trả phí hoặc thực hiện công việc kiếm tiền.

## Quy trình sản xuất và phản biện bằng AI

Giữ phần chủ dự án cần tham gia ở mức duyệt mốc và duyệt kết quả, không phải duyệt từng câu thoại:

1. Tác tử AI biên kịch đề xuất dàn ý các hồi, đồ thị chứng cứ, thoại ngắn, cặp Anh–Việt, cách dùng lại từ vựng và câu ôn tập theo bản thiết kế.
2. Các tác tử độc lập rà (a) dòng thời gian, độ đủ của manh mối, giả thuyết thay thế và rò đáp án; (b) độ dễ đọc A2–B1, độ sát nghĩa của bản dịch, điểm mơ hồ và việc lặp lại ngôn ngữ hữu ích. Người điều phối giải quyết nhận xét và ghi rõ mọi quyết định làm thay đổi dữ kiện đã duyệt.
3. Các tác tử triển khai theo kế hoạch ghi rõ phạm vi tệp, từng lát cắt độc lập. Mỗi lát cắt được phản biện tập trung trước khi tích hợp; không giao nhiều tác tử sửa đồng thời cùng tệp nếu chưa phân quyền sở hữu cụ thể.
4. Năm tác tử AI độc lập mô phỏng vai người chơi để phản biện bản dựng cuối. Chỉ báo cáo kết quả như giả thuyết. Người điều phối chạy hành trình trong trình duyệt có hiển thị, quan sát gameplay và bộ script kiểm tra, sửa lỗi rồi chạy lại.

Kết quả của tác tử AI không phải bằng chứng người chơi thật. Hoàn thành M2 chỉ đưa dự án đến trạng thái đủ điều kiện để chủ dự án quyết định riêng việc thử với người học; không tự cho phép liên hệ người tham gia. Phần thu phí vẫn tạm dừng.

## Phạm vi M2 và phần loại trừ

**Trong phạm vi:** mở rộng một vụ án hiện có thành trải nghiệm ba hồi dài 25–35 phút; ba khu vực nối trên bản đồ cuộn; thêm hồ sơ/thoại và nội dung tiếng Anh; hai đoạn né ngắn công bằng; kết luận có dẫn chứng và ôn tập; chỉ sửa tối thiểu giao diện, cấu trúc dữ liệu, lưu trữ hoặc hình ảnh khi cần; AI soạn/phản biện/mô phỏng; kiểm tra trình duyệt có hiển thị và chạy bộ script.

**Ngoài phạm vi:** vụ án thứ hai, thanh toán/checkout/thuê bao, quảng cáo trả phí, định giá/báo giá thương mại, hình ảnh mới trả phí hoặc thuê sản xuất, người tham gia bên ngoài, cổng quản trị đầy đủ, hệ thống tài khoản, analytics bên ngoài, đổi engine/renderer, phát hành/deploy và tuyên bố đã chứng minh hiệu quả học tập/thị trường.

## Rủi ro và cách xử lý

- **Nội dung nhiều nhưng loãng:** mỗi hồ sơ mới phải phục vụ mục đích điều tra và mục tiêu học tập; dùng lại ngôn ngữ trong ngữ cảnh; nhờ tác tử AI phản biện phát hiện phần lặp thừa.
- **Vụ án thiếu công bằng hoặc giải thích quá sớm:** giữ độ bất định trong hồ sơ đầu, phân biệt hành động với ý định, kiểm tra ít nhất một giả thuyết thay thế hợp lý và chỉ mở lời giải ở payoff đã định.
- **AI sinh sai dữ kiện hoặc bản dịch:** tác tử độc lập đối chiếu từng câu với bảng dữ kiện gốc; người điều phối quyết định cuối; đáp án vẫn phía server.
- **Bản đồ lớn làm rối va chạm/hình ảnh:** giữ một scene, dùng mốc nhận diện rõ cho từng khu, bảo đảm điểm tương tác có thể tiếp cận; kiểm tra camera/depth/collider bằng trình duyệt hiển thị.
- **Đọc nhiều làm đứt nhịp chơi:** mở hồ sơ thì tạm dừng hành động; giữ mỗi hồ sơ trong giới hạn kiểm tra nội dung hiện tại trừ khi có lý do rõ để đổi cấu trúc dữ liệu.
- **Giảm hiệu năng hoặc tăng kích thước tải:** giữ hỗ trợ giảm chuyển động và hình ảnh dự phòng; đo hành trình trên trình duyệt và dung lượng asset bản cuối, so với baseline M1; báo cáo giới hạn thực tế, không tự đặt trần tải ban đầu.

## Tiêu chí nghiệm thu và mốc kế tiếp

M2 đủ điều kiện bàn giao khi qua cổng số lượng/trải nghiệm đã duyệt ở phần “Các phần thiết kế đã được duyệt” và:

- phiên chơi v1/v2 hiện tại vẫn dùng đúng nội dung đã ghim;
- mỗi đoạn tiếng Anh mới có bản dịch Việt tùy chọn đã được phản biện, hoặc có quyết định rõ rằng không cần dịch;
- kết luận viện dẫn chứng cứ được server kiểm tra, không rò đáp án;
- di chuyển, camera cuộn, va chạm/depth, hai đoạn né, pause/focus, dịch, checkpoint/retry, kết luận và ôn tập đều chạy qua hành trình trình duyệt có hiển thị;
- kiểm tra web/API, nội dung/đáp án riêng tư, bản dựng và tài liệu agent đạt theo phạm vi thay đổi; chạy kiểm tra toàn bộ nếu kế hoạch triển khai yêu cầu;
- task M2 và memory ghi nhận kết quả/giới hạn cuối; thay đổi có phạm vi được commit/push theo chỉ dẫn thường trực của repo.

**Giai đoạn kế tiếp sau khi chủ dự án duyệt bản thiết kế này:** lập kế hoạch triển khai M2 bằng tiếng Việt, chia phạm vi theo tệp/tác tử, chốt dữ kiện/ID nội dung, kiểm thử, kịch bản trình duyệt và đường phục hồi khi lỗi. Chỉ bắt đầu triển khai sau khi chủ dự án duyệt riêng kế hoạch triển khai bằng văn bản và chọn cách thực hiện.
