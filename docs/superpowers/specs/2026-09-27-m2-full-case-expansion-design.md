# Thiết kế M2: Hai vụ án và hành trình game mới

- **Trạng thái:** định hướng v1.1 được duyệt; đang lập kế hoạch triển khai theo yêu cầu chủ dự án
- **Ngày:** 2026-09-27
- **Giai đoạn:** định hướng thiết kế đã duyệt; kế hoạch triển khai T40 đang chờ duyệt
- **Sản phẩm:** Office Case Files, game điều tra trên trình duyệt để học tiếng Anh

## Mục tiêu và bằng chứng hiện có

Chủ dự án muốn tiếp tục M2 nhưng cho rằng lát cắt M1 dài 3–5 phút chưa đủ để mời người học thật. Trước khi thử với người thật, game cần có cuộc điều tra rộng hơn và đủ nội dung tiếng Anh trong ngữ cảnh. Các tác tử AI sẽ đảm nhận phần lớn việc soạn nội dung, phản biện và triển khai để quy trình của chủ dự án gọn hơn. Phần thu phí/kiếm tiền vẫn tạm dừng đến khi chủ dự án chủ động yêu cầu mở lại.

Bằng chứng hiện có: vụ án `swapped-report` có JSON v1 và v2, mỗi phiên bản gồm sáu hồ sơ, ba câu hỏi, ba NPC, bảng từ vựng, kết luận và năm câu ôn tập. Luồng M1 được duyệt là E01 → E02 → né máy quét → E03 → lời khai Nora E06 và được cố ý giữ ngắn. `OfficeScene` của Phaser đã có camera bám theo nhân vật trong thế giới 1600×1000, nhưng ranh giới bản đồ, sàn, hình ảnh phòng và vật cản đang được hard-code. Tọa độ tương tác trong vụ án hiện là tọa độ phẳng; server giữ đáp án và lời giải riêng. JSON catalog và `GET /api/v1/cases` đã hỗ trợ liệt kê metadata; `POST /api/v1/sessions` nhận `caseId`, và phiên được ghim vào `(caseId, caseVersion)`. Tuy vậy, web vẫn khởi tạo `swapped-report` cố định; API/gameplay chỉ tạo một map/checkpoint topology và một trạng thái né tổng quát. Case JSON chỉ là hai phiên bản của cùng vụ; code chưa có chọn độ khó, khảo sát A2/B1, chọn ngoại hình hay minimap. Case validator hiện yêu cầu mỗi hồ sơ dài 25–60 từ và đúng năm câu ôn tập; cần kiểm tra các giới hạn này với hai vụ án trước khi thay đổi schema.

## Các phần thiết kế đã được duyệt

Chủ dự án đã duyệt từng phần bằng lựa chọn ngày 2026-09-27:

1. M2 có **hai vụ án hoàn chỉnh để lựa chọn**; vụ đầu tiên là **The Swapped Report** và có thời lượng dài hơn. Giữ kiến trúc React/Phaser/API hiện tại. Chủ dự án đã duyệt số lượng hai vụ, nhưng chưa chọn sự việc trung tâm cho vụ thứ hai (xem “Quyết định còn mở”).
2. Mục tiêu là vụ án ba hồi, chơi khoảng 25–35 phút trong ba khu vực nối tiếp; có 8–10 hồ sơ, hai đoạn né ngắn, khoảng 16 cụm tiếng Anh công sở hữu ích, phần kết luận và ôn tập. Bản dịch tiếng Việt tùy chọn, đặt cạnh tiếng Anh và ẩn mặc định.
3. Dùng một bản đồ Phaser cuộn với các khu vực nối liền, không tạo Phaser scene riêng cho từng khu. React quản lý giao diện/nội dung dễ đọc; Phaser quản lý gameplay theo frame; API/domain quản lý tiến độ/điểm số đáng tin cậy; JSON phía server chứa nội dung vụ án.
4. Dùng quy trình AI gọn: tác tử biên kịch soạn vụ án; các tác tử độc lập phản biện logic suy luận và chất lượng A2–B1/bản dịch; tác tử triển khai làm theo lát cắt có phạm vi; AI mô phỏng vai người chơi và kiểm tra trên trình duyệt có hiển thị giúp tìm, sửa lỗi. Mô phỏng AI là giả thuyết, không phải kiểm chứng với người thật.
5. Cổng nội dung cho **The Swapped Report** gồm: ba khu vực đi lại được; 8–10 hồ sơ; ít nhất 16 cụm ngôn ngữ trong ngữ cảnh; hai đoạn né công bằng; kết luận dựa trên chứng cứ được viện dẫn; bản dịch ẩn mặc định; không còn lỗi nghiêm trọng từ vòng phản biện AI; hành trình kiểm thử trên trình duyệt có hiển thị hoàn tất trên bản cuối. M2 còn phải có vụ án thứ hai hoàn chỉnh; quy mô và cổng riêng cho vụ này cần được chốt trong kế hoạch sau khi xác định ý tưởng.
6. Định hướng đồ họa: giấy ngà, nét mực/than chì và điểm nhấn màu có chọn lọc, tham khảo tinh thần bản phác họa nhân vật của chủ dự án. Ảnh là tham khảo phong cách, không phải asset/nội dung để sao chép.
7. Tạo nhân vật bằng hai mẫu ngoại hình nam/nữ có sẵn; lựa chọn chỉ đổi diện mạo, cùng hoạt ảnh và chỉ số, và người chơi có thể đổi lại.
8. Độ khó chơi có bốn mức Dễ/Trung bình/Khó/Chuyên gia. Độ khó chỉ điều chỉnh áp lực thử thách và mức trợ giúp; không thay nội dung học, dữ kiện, đáp án hay quyền tiếp cận chứng cứ.
9. Người chơi chọn trình độ học A2 hoặc B1. Khảo sát ngắn gợi ý mức phù hợp; người chơi tự chọn khác hoặc đổi về sau. Trình độ học tách biệt độ khó chơi.
10. HUD trong lúc chơi bỏ thanh bên phải: mục tiêu gọn ở góc trên trái; tiến độ vụ án và minimap ở góc trên phải; minimap chỉ rõ vị trí người chơi và dấu hiệu manh mối; lời nhắc tương tác theo ngữ cảnh gần mục tiêu; thanh thao tác phím gọn ở cạnh dưới. Sổ tay, bản đồ đầy đủ và tạm dừng mở thành lớp phủ trên màn chơi; lớp phủ dừng mô phỏng gameplay. Wireframe minimap được chủ dự án duyệt trong hội thoại ngày 2026-09-27.

## Trải nghiệm người chơi

Người chơi theo một vụ việc công sở xuyên suốt từ chỉ dẫn đầu tiên đến kết luận có chứng cứ:

1. **Hồi I — Chỉ dẫn:** nắm mục tiêu, xem yêu cầu dùng báo cáo, email/chat và phản ứng ban đầu. Người chơi nhận ra điểm mơ hồ trong “previous version” và có thể hỏi để xác nhận.
2. **Hồi II — Dòng thời gian:** đi qua khu vực họp/làm việc có nhận diện riêng, thu thập hồ sơ và so sánh lời khai. Một đoạn né ngắn bảo vệ lối vào kho lưu trữ; nếu thất bại, người chơi quay về checkpoint công bằng mà không mất hồ sơ hoặc điểm tiếng Anh.
3. **Hồi III — Kho lưu trữ và lời giải:** kiểm tra lịch sử phiên bản cùng ngữ cảnh bổ sung, vượt qua đoạn né thứ hai, nghe lời khai liên quan, chọn kết luận, trích chứng cứ hỗ trợ và ôn lại ngôn ngữ hữu ích trong vụ án.

### Hành trình ngoài màn chơi

1. **Chọn hồ sơ vụ án:** màn hình chọn từ catalog vụ án hiện có (`GET /api/v1/cases`); hai vụ án đều hoàn chỉnh, The Swapped Report là vụ dài hơn. Không đặt giá, paywall hoặc luồng mua trong M2.
2. **Tạo nhân vật:** chọn một trong hai mẫu ngoại hình; lựa chọn có thể đổi lại và không ảnh hưởng gameplay.
3. **Chọn thiết lập học:** khảo sát tự đánh giá ngắn đề xuất A2 hoặc B1; người chơi xác nhận hoặc tự đổi. Chọn Dễ/Trung bình/Khó/Chuyên gia ở một điều khiển riêng.
4. **Vào màn chơi:** thế giới game chiếm phần lớn khung nhìn; HUD gắn trực tiếp trên màn chơi theo bố cục đã duyệt. Các cửa sổ đọc/nhiệm vụ tạm dừng nhịp gameplay để người chơi đọc rõ.

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

## Đồ họa, giao diện và thiết lập người chơi

- Dùng giấy ngà làm nền, nét mực/than chì làm đường nét chính và màu nhấn tiết chế để phân biệt mục tiêu/manh mối. Kết hợp với bản đồ 2.5D và nhân vật biểu cảm; đây là ngôn ngữ hình ảnh mục tiêu, không đòi hỏi toàn bộ màn hình game phải trông như tờ giấy phẳng.
- Dùng hai mẫu nhân vật có silhouette/diện mạo phân biệt. Trước kế hoạch triển khai phải kiểm tra asset hiện có và quyết định liệu hai mẫu có thể dùng chung bộ chuyển động hiện tại; không tạo khác biệt chỉ số.
- HUD được duyệt: mục tiêu trên trái; tiến độ hồ sơ và minimap phía trên phải; tương tác hiện gần mục tiêu; thanh thao tác dưới cùng; không có right bar. Minimap hiển thị bố cục khu vực hiện tại, người chơi và dấu mốc cần chú ý. Tương tác phím M mở bản đồ đầy đủ; J mở sổ tay. Cửa sổ phủ cần quản lý focus bàn phím và tạm dừng Phaser cho tới khi đóng.
- Bố cục desktop là mục tiêu đầu tiên. Giữ các nhãn thiết yếu đọc được ở độ phân giải nhỏ hơn, không để minimap che mục tiêu hoặc lời nhắc tương tác; kiểm thử responsive trong kế hoạch triển khai.
- Khảo sát A2/B1 chỉ là gợi ý học tập, không phải bài thi hay chứng nhận. Không dùng kết quả khảo sát để thay đổi độ khó chơi tự động sau khi người chơi đã lựa chọn.
- Các mức độ khó dùng cùng bản đồ, chứng cứ, cốt truyện, lựa chọn và đáp án. Cách cụ thể để tăng/giảm áp lực và trợ giúp còn cần thiết kế; mọi cơ chế đề xuất trong kế hoạch sau phải giữ nguyên sự thật vụ án, nội dung học và quyền tiếp cận chứng cứ, rồi được chủ dự án duyệt cùng kế hoạch triển khai.

## Quy trình sản xuất và phản biện bằng AI

Giữ phần chủ dự án cần tham gia ở mức duyệt mốc và duyệt kết quả, không phải duyệt từng câu thoại:

1. Tác tử AI biên kịch đề xuất dàn ý các hồi, đồ thị chứng cứ, thoại ngắn, cặp Anh–Việt, cách dùng lại từ vựng và câu ôn tập theo bản thiết kế.
2. Các tác tử độc lập rà (a) dòng thời gian, độ đủ của manh mối, giả thuyết thay thế và rò đáp án; (b) độ dễ đọc A2–B1, độ sát nghĩa của bản dịch, điểm mơ hồ và việc lặp lại ngôn ngữ hữu ích. Người điều phối giải quyết nhận xét và ghi rõ mọi quyết định làm thay đổi dữ kiện đã duyệt.
3. Các tác tử triển khai theo kế hoạch ghi rõ phạm vi tệp, từng lát cắt độc lập. Mỗi lát cắt được phản biện tập trung trước khi tích hợp; không giao nhiều tác tử sửa đồng thời cùng tệp nếu chưa phân quyền sở hữu cụ thể.
4. Năm tác tử AI độc lập mô phỏng vai người chơi để phản biện bản dựng cuối. Chỉ báo cáo kết quả như giả thuyết. Người điều phối chạy hành trình trong trình duyệt có hiển thị, quan sát gameplay và bộ script kiểm tra, sửa lỗi rồi chạy lại.

Kết quả của tác tử AI không phải bằng chứng người chơi thật. Hoàn thành M2 chỉ đưa dự án đến trạng thái đủ điều kiện để chủ dự án quyết định riêng việc thử với người học; không tự cho phép liên hệ người tham gia. Phần thu phí vẫn tạm dừng.

## Phạm vi M2 và phần loại trừ

**Trong phạm vi thiết kế M2:** có hai vụ án hoàn chỉnh để chọn, The Swapped Report dài hơn và giữ mục tiêu 25–35 phút/ba hồi/ba khu vực/8–10 hồ sơ/hai đoạn né/16 cụm tiếng Anh đã duyệt; vụ án thứ hai ngắn hơn nhưng cũng phải có mở đầu, điều tra, kết luận và ôn tập. Có lựa chọn ngoại hình, khảo sát gợi ý A2/B1, bốn mức độ khó độc lập, màn chọn vụ án, HUD tích hợp minimap, kết luận có dẫn chứng và ôn tập. Giữ sửa đổi code ở mức cần thiết cho hành trình này; AI soạn/phản biện/mô phỏng và kiểm thử browser có hiển thị.

**Ngoài phạm vi:** thanh toán/checkout/thuê bao, quảng cáo trả phí, định giá/báo giá thương mại, hình ảnh mới trả phí hoặc thuê sản xuất, người tham gia bên ngoài, cổng quản trị đầy đủ, hệ thống tài khoản, analytics bên ngoài, đổi engine/renderer, phát hành/deploy và tuyên bố đã chứng minh hiệu quả học tập/thị trường.

## Rủi ro và cách xử lý

- **Nội dung nhiều nhưng loãng:** mỗi hồ sơ mới phải phục vụ mục đích điều tra và mục tiêu học tập; dùng lại ngôn ngữ trong ngữ cảnh; nhờ tác tử AI phản biện phát hiện phần lặp thừa.
- **Vụ án thiếu công bằng hoặc giải thích quá sớm:** giữ độ bất định trong hồ sơ đầu, phân biệt hành động với ý định, kiểm tra ít nhất một giả thuyết thay thế hợp lý và chỉ mở lời giải ở payoff đã định.
- **AI sinh sai dữ kiện hoặc bản dịch:** tác tử độc lập đối chiếu từng câu với bảng dữ kiện gốc; người điều phối quyết định cuối; đáp án vẫn phía server.
- **Chọn vụ được nhưng phiên vẫn dùng sai tiến độ thế giới:** API đã nhận `caseId` và ghim phiên bản, nhưng map/checkpoint và encounter trong domain đang cố định một màn/đoạn né. Mỗi vụ cần topology và trạng thái encounter riêng; kiểm tra reload/retry để không mất tiến độ hồi trước.
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

Các tiêu chí trên trước đây chỉ áp dụng cho The Swapped Report. Sau khi duyệt đặc tả và chốt ý tưởng vụ hai, kế hoạch triển khai phải thêm cổng nghiệm thu riêng cho vụ thứ hai, lựa chọn vụ án, thiết lập nhân vật/ngôn ngữ/độ khó và HUD/minimap. Không được tuyên bố M2 hoàn thành chỉ dựa trên việc tăng số hồ sơ của vụ đầu.

## Quyết định còn mở

1. Chọn tình huống trung tâm và mục tiêu thời lượng của vụ án thứ hai. Đề xuất sẽ được trình riêng để chủ dự án lựa chọn; chưa viết cốt truyện chi tiết hay thêm dữ kiện vụ án trước khi duyệt.
2. Chốt thiết kế cụ thể của khảo sát A2/B1 và cấu hình hành vi cho từng mức độ khó trong kế hoạch triển khai; đây là chi tiết sản xuất, không đổi các ranh giới đã duyệt ở trên.
3. Chọn thiết bị/trình duyệt mục tiêu và cỡ màn hình để đặt cổng hiệu năng/tải trước khi triển khai.

**Giai đoạn kế tiếp:** hoàn tất kế hoạch M2 bằng tiếng Việt theo chỉ đạo ngày 2026-09-27. Kế hoạch đặt việc chọn premise vụ hai và chốt khảo sát/độ khó/biến thể A2–B1 làm cổng trước nhánh nội dung. Chỉ bắt đầu code sau khi chủ dự án duyệt kế hoạch triển khai bằng văn bản.
