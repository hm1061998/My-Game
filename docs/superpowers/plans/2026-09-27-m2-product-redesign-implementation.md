# Kế hoạch triển khai M2 — Hai vụ án và thiết kế game mới

**Phiên bản:** 1.1 · 2026-09-27. Bản 1.1 ghi chính xác các neo wireframe đã được chủ dự án duyệt làm điều kiện nghiệm thu.

> **Dành cho tác tử thực thi:** BẮT BUỘC dùng `superpowers:subagent-driven-development`. Mỗi agent nhận một lát cắt và danh sách tệp riêng; người điều phối tích hợp và rà soát. Chủ dự án đã duyệt kế hoạch; Task 0 bắt đầu trước các lát cắt code.

**Mục tiêu:** Biến Office Case Files thành game trình duyệt có hai vụ án hoàn chỉnh để chọn, lựa chọn nhân vật và thiết lập học tập, phong cách giấy ngà–mực/than, HUD có minimap, cùng hành trình điều tra và học tiếng Anh đủ dài cho phản biện AI.

**Kiến trúc:** React sở hữu menu, thiết lập người chơi, nội dung đọc và HUD DOM; Phaser sở hữu bản đồ cuộn, nhân vật, va chạm, encounter và trạng thái minimap; API/.NET giữ catalog, phiên bản vụ án, tiến độ và đáp án riêng. Mỗi phiên ghim đúng `caseId`/`caseVersion`; JSON phía server tiếp tục là nguồn nội dung.

**Công nghệ:** React + TypeScript + Phaser hiện có; ASP.NET Core/C#; SQLite qua storage port; nội dung JSON; Playwright headed cho kiểm thử trình duyệt.

**Đặc tả:** [Thiết kế M2 v1.1](../specs/2026-09-27-m2-full-case-expansion-design.md) và [hợp đồng bố cục HUD theo wireframe](../../design/M2-hud-layout-contract.md). Thiết kế nội dung vụ án thứ hai vẫn cần chủ dự án chọn trước khi viết nội dung đó.

## Ràng buộc chung

- The Swapped Report dài khoảng 25–35 phút, có 3 hồi/3 khu vực, 8–10 hồ sơ, 2 đoạn né, ít nhất 16 cụm tiếng Anh công sở, kết luận viện dẫn chứng cứ và phần ôn tập.
- M2 có hai vụ án hoàn chỉnh; The Swapped Report dài hơn. Ý tưởng trung tâm của vụ hai phải được chủ dự án chọn trước khi tác tử biên kịch tạo nội dung cuối.
- Đồ họa dùng giấy ngà, nét mực/than chì và màu nhấn có chọn lọc. Hai mẫu ngoại hình chỉ khác diện mạo, dùng chung hoạt ảnh và chỉ số, đổi được.
- Bốn mức độ khó và trình độ Anh ngữ A2/B1 độc lập. Độ khó chỉ đổi áp lực/trợ giúp; mức Anh ngữ có khảo sát gợi ý và luôn cho phép người chơi tự đổi. Không thay dữ kiện, câu trả lời, quyền xem chứng cứ hoặc điểm học.
- Tiếng Việt đặt cạnh tiếng Anh, ẩn mặc định, dùng được bằng bàn phím và không ảnh hưởng điểm/số gợi ý.
- HUD phải tuân theo các neo và thứ bậc trong wireframe đã duyệt: header mảnh phía trên; thế giới Phaser chiếm phần lớn vùng chơi; thẻ mục tiêu nổi ở trên trái; tiến độ ở trên phải với minimap ngay dưới; prompt tương tác gần giữa phía dưới; action bar chạy ngang đáy. Không có thanh bên phải hoặc chuyển các nhóm này sang vị trí khác. Tỷ lệ/pixel trong sketch chỉ tham khảo; responsive được phép co giãn nhưng phải giữ nguyên thứ bậc và neo. Minimap không làm lộ chứng cứ bị khóa. Mở sổ tay/bản đồ/tạm dừng thì Phaser dừng và focus được quản lý.
- Giữ v1/v2 hiện có bất biến; không gửi đáp án/lời giải tới client. Không thanh toán, liên hệ người học, chi tiền, phát hành hoặc deploy.
- Không thêm dependency nếu chưa chứng minh là cần. Dùng asset hiện có hoặc tạo SVG cục bộ; không tự mua/thuê asset.

## Trọng tâm rà soát

1. Một phiên mới có đúng vụ người chơi chọn; phiên cũ vẫn ghim đúng nội dung và phiên bản sau khi có vụ mới.
2. Cả hai đoạn né có ID/checkpoint riêng; lỗi hoặc retry đoạn sau không xóa tiến độ đoạn trước.
3. Dễ/Trung bình/Khó/Chuyên gia và A2/B1 tách biệt; đổi một thiết lập không đổi thiết lập kia, đáp án hay scoring.
4. Minimap bám vị trí người chơi đúng nhưng không phát trạng thái cho React mỗi frame và không hé lộ chứng cứ bị khóa.
5. Bỏ drawer không làm mất đường vào sổ tay, kết luận, cài đặt âm thanh, replay, tạm dừng, hướng dẫn hoặc focus bàn phím.

---

### Task 0: Chốt những quyết định nội dung còn mở trước khi bắt đầu nhánh nội dung

**Tệp:**
- Sửa: `docs/superpowers/specs/2026-09-27-m2-full-case-expansion-design.md`
- Sửa: `docs/tasks/T39-m2-full-case-expansion.md`
- Tạo: `docs/research/M2-case-two-options.md`

**Giao diện:**
- Tạo 3 logline cho vụ hai; mỗi logline nêu bí ẩn, loại chứng cứ, từ vựng công sở và khác biệt so với The Swapped Report.
- Đề xuất khảo sát 3 câu tự đánh giá A2/B1, quy tắc gợi ý có thể giải thích và quyền ghi đè. Bản nháp: “Tôi theo được chỉ dẫn công việc ngắn bằng tiếng Anh”; “Tôi hiểu ý chính của email/chat ngắn”; “Tôi đoán được từ lạ từ ngữ cảnh”. Câu trả lời `Thường / Đôi khi / Chưa`; gợi ý A2 nếu có ít nhất 2 câu `Chưa`, ngược lại gợi ý B1. Luôn cho chọn lại.
- Đề xuất ma trận độ khó: Dễ = tốc độ hazard 0.8× và cửa sổ né 1.25×, hướng dẫn rõ; Trung bình = 1.0×/1.0×, gợi ý theo yêu cầu; Khó = 1.2×/0.85×, chỉ còn cảnh báo chuẩn và gợi ý theo yêu cầu; Chuyên gia = 1.35×/0.7×, không hiện gợi ý chủ động. Không giảm độ rõ cảnh báo hình ảnh/âm thanh thiết yếu và không đổi sự thật/câu trả lời/quyền chứng cứ.
- Đề xuất thời lượng vụ hai 12–18 phút (đủ mở đầu/điều tra/kết luận/ôn tập nhưng ngắn hơn vụ đầu).
- Đề xuất cách A2/B1 ảnh hưởng ngôn ngữ. Khuyến nghị hai bản diễn đạt trên cùng facts, câu hỏi/đáp án và bản dịch Việt tương ứng; xác nhận với chủ dự án vì điều này làm tăng đáng kể khối lượng nội dung.
- Ghi rõ lựa chọn của chủ dự án, hoặc để nhánh nội dung vụ hai chờ lựa chọn. Không viết truyện cuối trong bước này.
- Đo lại baseline bằng visible browser trước khi đổi art: ghi revision, FPS/p95 và asset transfer. So sánh với T38 (60 fps/p95 17 ms; 991,549 byte `/assets/`, chưa gồm MP3). Chủ dự án cho biết các lần giật trước trùng với lúc máy chạy nhiều tác vụ; không quy lỗi cho game nếu không tái hiện trong điều kiện được ghi rõ.

- [ ] Tác tử biên kịch tạo 3 logline theo phạm vi đã duyệt; không sửa case JSON.
- [ ] Tác tử phản biện độc lập kiểm tra độ khác biệt, độ phù hợp người học 18–35 và khả năng kể qua chứng cứ.
- [ ] Chủ dự án chọn logline vụ hai và duyệt đề xuất khảo sát/ma trận độ khó cùng bản đặc tả cập nhật.

**Cổng:** Nếu chưa có lựa chọn, tiếp tục các lát cắt nền tảng dùng fixture nhưng không tạo case JSON vụ hai hoặc khẳng định M2 có hai vụ chơi được.

### Task 1: Tổng quát hóa metadata vụ án, thế giới và tiến độ phiên

**Tệp:**
- Sửa: `services/api/Domain/CaseDefinition.cs`, `PlaySession.cs`
- Sửa: `services/api/Application/ICaseCatalog.cs`, `SessionService.cs`
- Sửa: `services/api/Contracts/CaseContracts.cs`, `SessionContracts.cs`
- Sửa: `services/api/Contracts/InvestigationContracts.cs`, `QuestionContracts.cs`, `ConclusionContracts.cs`
- Sửa: `services/api/Application/InteractionService.cs`, `QuestionService.cs`, `ConclusionService.cs`
- Sửa: `services/api/Features/Cases/CaseEndpoints.cs`, `Sessions/SessionEndpoints.cs`
- Sửa: `services/api/Infrastructure/Content/JsonCaseCatalog.cs`, `CaseValidator.cs`
- Sửa: `services/api/Infrastructure/Sqlite/GameDbContext.cs`, `SqlitePlaySessionStore.cs`
- Tạo migration SQLite; sửa: tests API liên quan và `ProgressPortabilityTests.cs`

**Giao diện đề xuất:**
- `ICaseCatalog.ListCurrent() -> IReadOnlyList<CaseDefinition>` trả một phiên bản hiện tại cho mỗi `caseId`; các phiên lịch sử vẫn truy cập được bằng `Get(caseId, version)`.
- Dùng `GET /api/v1/cases` hiện có cho thông tin chọn vụ; chỉ thêm metadata công khai nếu UI thực sự cần. Không trả `Solution`, lựa chọn đúng hoặc quy tắc chấm.
- `StartSessionRequest` nhận `caseId`, `learningLevel` và `difficulty`; `SessionResponse` trả lại cùng thiết lập để resume ổn định. `playerPreset` là sở thích trình bày phía client và không vào scoring/API.
- Nếu chủ dự án duyệt hai bản diễn đạt A2/B1, case JSON có cùng facts/IDs nhưng cặp text cho evidence, NPC, câu hỏi và ôn tập. Application chọn text theo `PlaySession.LearningLevel`; case v1/v2 thiếu biến thể dùng text hiện có ở cả hai mức. `CorrectChoiceId`, `Solution` và accepted evidence sets không đổi.
- Phiên bản current được chọn bằng quy ước phiên bản số đã validate (kiểm thử v10 > v2); phiên lịch sử tiếp tục được phục vụ theo ID/version đã ghim.
- Case JSON thêm `world: { mapId, entryCheckpointId, checkpoints[], encounters[] }`; mỗi encounter có `id`, checkpoint, thứ tự và tham số né đã duyệt. `CaseMapResponse` trả `mapId`, kích thước, vùng có nhãn, checkpoint/encounter IDs và public interactions; không trả graph chứng cứ riêng hoặc đáp án.
- Phaser giữ art/collision geometry trong `GameWorldDefinition` theo `mapId`; API giữ nguồn chuẩn cho case/version/checkpoint/encounter. Test xác nhận IDs khớp nhau, tránh lặp tọa độ tương tác giữa hai tầng.
- Thêm bảng con `EncounterProgress(sessionId, encounterId, cleared, failures, assistanceUsed)`; `EncounterRequest` mang `encounterId`, service xác nhận encounter thuộc case ghim và đúng thứ tự/checkpoint. Ghi tiến độ encounter/checkpoint atomically để retry không xóa beat đã qua.
- Phiên DB cũ được backfill về `medium` và trạng thái encounter/checkpoint tương đương hiện tại. Có migration up/down và kiểm tra export/import.

- [ ] Thêm `CaseCatalog_ReturnsOnlyCurrentVersion_AndDoesNotExposePrivateAnswers`: mỗi case ID trả đúng một metadata mới nhất, không có solution/correct choice; thêm `GetCurrent_SelectsNumericVersionTenOverTwo`.
- [ ] Mở rộng `Session_Checkpoint_ReloadAndRestart_UseSqliteWithoutExposingToken`: start request chọn case/level/difficulty, unknown ID trả 404, resume giữ case/version/level/difficulty.
- [ ] Thêm `EncounterProgress_IsIsolatedByEncounterAndCheckpoint`: case1 có hai encounter; clear/fail/retry từng ID, không skip order, beat đầu còn clear sau khi vào beat sau.
- [ ] Thêm `Validator_RejectsInvalidWorldAndEncounterReferences`: world IDs duy nhất, refs tồn tại, tọa độ trong bounds; v1/v2 cũ vẫn nạp.
- [ ] Tạo migration/backfill và kiểm tra session/export-import giữ `learningLevel` + `difficulty` sau lưu/khởi động lại.
- [ ] Chạy `dotnet test tests/OfficeCaseFiles.Api.Tests/OfficeCaseFiles.Api.Tests.csproj`.

### Task 2: Màn chọn vụ án và thiết lập người chơi

**Tệp:**
- Sửa: `apps/web/src/App.tsx`, `App.css`, `api/session.ts`, `api/investigation.ts`
- Tạo: `apps/web/src/CasePicker.tsx`, `PlayerSetup.tsx`, `playerPreferences.ts` và tests tương ứng
- Sửa: `apps/web/src/game/characterArt.ts`, asset manifest và asset checks nếu cần thêm mẫu nhân vật
- Sửa: `services/api/Contracts/CaseContracts.cs` hoặc endpoint metadata chỉ khi test chứng minh trường công khai còn thiếu

**Giao diện đề xuất:**
- Luồng trước màn chơi: chọn vụ từ catalog hiện tại → chọn mẫu ngoại hình → khảo sát gợi ý A2/B1 và cho phép đổi → chọn độ khó → bắt đầu.
- Hai lựa chọn ngoại hình dùng chung chuyển động/collider; giữ preset trong local preferences. Lưu `learningLevel` và `difficulty` trong phiên để khôi phục đúng trải nghiệm sau reload.
- Khảo sát là tự đánh giá ngắn, không chứng nhận trình độ. Bảng câu hỏi/quy tắc gợi ý dùng nội dung Task 0.
- `startSession(input: { caseId: string; learningLevel: 'A2' | 'B1'; difficulty: 'easy' | 'medium' | 'hard' | 'expert' })` gửi lựa chọn tới API. Validate response bằng runtime validator hiện có.
- Màn hình chọn vụ dùng metadata public hiện có, nhóm đúng một version hiện hành cho mỗi case; xử lý tải, rỗng, lỗi mạng và case unavailable.

- [ ] Thêm `survey recommends but does not lock A2 or B1`: kiểm tra quy tắc Task 0, override, difficulty độc lập và không tự bắt đầu game.
- [ ] Thêm `case picker handles loading empty error and selection`: sau khi có JSON thì có đúng hai card hiện hành; request chọn đúng ID; không render dữ liệu đáp án.
- [ ] Thêm `startSession sends selected case and study settings`: request có đủ trường, response/resume khôi phục level/difficulty.
- [ ] Tạo hai player presets dùng cùng animation API và kích thước collider; test asset thiếu vẫn có fallback.

### Task 3: Bản đồ cuộn theo vụ, vùng điều tra và encounter riêng

**Tệp:**
- Sửa: `apps/web/src/game/scenes/OfficeScene.ts`, `game/encounter.ts`, `game/runtime.ts`, `game/createGame.ts`, `game/GameHost.tsx`, `game/bridge/events.ts`
- Tạo: `apps/web/src/game/worlds.ts` và tests nếu topology được đặt phía client
- Sửa: `apps/web/src/game/officeArt.ts`, `movement.ts` và tests tương ứng
- Sửa map/checkpoint/encounter DTO và tests API đã định ở Task 1

**Giao diện đề xuất:**
- `GameWorldDefinition` trong `game/worlds.ts` có kích thước, vùng đi lại, collider, landmark và checkpoint coordinates keyed theo `mapId`; `GameHost` nhận `world`, `avatarPreset`, `difficulty` đã validate.
- Mỗi encounter là `EncounterDefinition { id, checkpointId, order, warningLeadMs, activeWindowMs, assistAllowed }`; cấu hình chính xác được duyệt ở Task 0.
- Phaser phát `world-snapshot { x, y, regionId }` tối đa 10 lần/giây; không gửi tọa độ mỗi frame qua React. Bridge có listener cleanup và snapshot chỉ được dùng cho HUD/minimap.
- Scene single-scroll dùng cả 3 vùng nối liền của The Swapped Report; bản đồ vụ hai có `mapId` riêng và bộ collider riêng, nhưng tái sử dụng movement/animation/pause.
- Player preset chỉ thay art/portrait; movement speed, collision body, interaction radius và dodge không đổi.
- Chỉnh sprite sang nét phác thảo mực/than chì, silhouette dễ đọc cho idle/walk/turn/dodge/talk; tạo hai protagonist sheets dùng chung frame timing. Ảnh tham khảo chỉ định hướng, không tái sử dụng nhân vật trong ảnh làm asset.
- Thêm SFX cục bộ ngắn cho clue, warning/dodge, checkpoint và payoff; giữ transcript/visual cue tương đương, mute/fallback hoạt động và tái sử dụng ambience được cấp phép. Ghi provenance vào `docs/assets/manifest.md`.

- [ ] Thêm `WorldMap_TraversesAllThreeRegionsAndBlocksOutsideFloor`: xác nhận camera/depth/collider, player không xuyên vật thể và các interaction reachable.
- [ ] Thêm `EncounterSequence_RetryRestoresOnlyItsCheckpoint`: failure beat 2 giữ beat 1 clear; các modifier difficulty khớp bảng Task 0.
- [ ] Thêm `worldSnapshotIsThrottledAndDisposed`: cập nhật ≤10 Hz và không phát sau destroy/unmount.
- [ ] Kiểm tra StrictMode/remount còn đúng một canvas; đổi avatar không giữ input hoặc listener cũ.
- [ ] Test gameAudio cue mapping, mute/fallback và không phát trước gesture; kiểm tra manifest/license cho mọi file mới.

### Task 4: HUD mới, minimap và bảng phủ

**Tệp:**
- Sửa: `apps/web/src/SceneHud.tsx`, `SceneHud.test.tsx`, `App.tsx`, `App.css`
- Tạo: `apps/web/src/MiniMap.tsx`, `FullMapOverlay.tsx` và tests tương ứng
- Sửa: `apps/web/src/theme/tokens.ts`, `index.css`, art palette nơi cần
- Sửa: `apps/web/src/audio/gameAudio.ts`, tests và `docs/assets/manifest.md` khi có cue âm thanh UI/case
- Sửa: `apps/web/src/game/bridge/events.ts` hoặc runtime command API chỉ khi Task 3 chốt contract

**Giao diện đề xuất:**
- Loại drawer bám cạnh phải khỏi workspace. Chuyển chức năng của nó thành HUD gọn, menu tạm dừng/cài đặt và lớp phủ Sổ tay/Bản đồ/Kết luận; không mất audio, replay, hướng dẫn hay diagnostic controls.
- Màu nền giấy ngà; nét mực/than; màu nhấn dành cho mục tiêu, clue đang được phép theo dõi và cảnh báo. English content vẫn là DOM text.
- Minimap hiển thị vùng hiện tại, vị trí player và chỉ marker của objective/clue đã mở hoặc được difficulty cho phép; không phát marker bị khóa hoặc private answer.
- Phím J mở notebook, M mở full map, Esc mở/đóng pause; overlay gọi cơ chế `setOverlayPaused` sẵn có và quản lý focus/return focus.
- Responsive: desktop ưu tiên; tại 1100×720 và 800×600, thu nhỏ minimap hoặc chuyển sang nút mở bản đồ thay vì che objective/prompt.

- [ ] Thêm `MiniMap projects player and allowed objectives`: marker đúng scale/region; clue khóa/private không xuất hiện; snapshot mới cập nhật vị trí.
- [ ] Thêm `HUD overlays pause and restore focus`: Esc/J/M, pause/resume, focus/keyboard isolation; right drawer không còn trong DOM.
- [ ] Chụp/soát visible screenshots ở 1280×800, 1100×720, 800×600, 390×800 và 360×800; kiểm tra zoom 200%, grayscale và reduced motion. Xác nhận đúng thứ tự/neo của wireframe và không chồng quest/progress/minimap/prompt/actionbar; không sao nguyên các số pixel desktop vào màn hẹp.
- [ ] Thêm assertion bố cục dùng bounding boxes ở desktop và màn hẹp: mục tiêu ở vùng trên trái; progress/minimap thành một cụm trên phải; prompt ở giữa phía dưới nhưng nằm trên actionbar; actionbar nằm ngang sát đáy; không có rail phải hoặc tràn/cuộn ngang. Xác nhận prompt chỉ hiện khi có tương tác hợp lệ.

### Task 5: Hoàn chỉnh The Swapped Report — phiên bản nội dung mới

**Tệp:**
- Tạo: `services/api/Content/Cases/swapped-report.v3.json`
- Sửa: `services/api/Infrastructure/Content/CaseValidator.cs` và `tests/OfficeCaseFiles.Api.Tests/CaseContentTests.cs` chỉ khi giới hạn hiện tại cản nội dung đã duyệt
- Sửa tests: `InvestigationFlowTests.cs`, `QuestionFlowTests.cs`, `EncounterFlowTests.cs`, `ConclusionFlowTests.cs`
- Tạo/sửa nguồn kịch bản và ma trận logic trong `docs/design/` trước khi nhập JSON cuối

- [ ] Agent biên kịch tạo đồ thị chứng cứ 8–10 hồ sơ, 3 hồi, 3 vùng, hai đoạn né, 16+ cụm công sở và kết luận có các bộ chứng cứ hỗ trợ.
- [ ] Hai agent độc lập rà logic/suy luận/giả thuyết thay thế và A2/B1/bản dịch; đối chiếu từng sự thật với case gốc; không tiết lộ động cơ ngoài chứng cứ.
- [ ] Tạo cách diễn đạt A2/B1 cho evidence/dialogue/questions/review; giữ nguyên facts, graph và đáp án. Dịch Việt cạnh từng câu, ban đầu ẩn; Application chọn bản theo trình độ đã ghim trong `PlaySession.LearningLevel`.
- [ ] Nhập vào `swapped-report.v3.json`, giữ v1/v2 không đổi; chạy validator và kiểm thử luồng API từ evidence đến conclusion/review.
- [ ] So sánh asset transfer, p95 frame time và FPS với baseline Task 0; giữ p95 ≤33 ms trên thiết bị test đã ghi.

### Task 6: Tạo vụ án thứ hai sau khi chủ dự án chọn premise

**Tệp:**
- Tạo: `services/api/Content/Cases/case-two.v1.json` (đặt `id` theo premise đã duyệt ở Task 0)
- Tạo: nguồn kịch bản/đồ thị chứng cứ trong `docs/design/`
- Sửa API/content tests chỉ khi schema hoặc public metadata cần thay đổi

- [ ] Dùng đúng premise và mục tiêu thời lượng do chủ dự án chọn ở Task 0; tạo mở đầu, điều tra, kết luận, bộ chứng cứ, từ vựng và phần ôn tập hoàn chỉnh.
- [ ] Tạo cách diễn đạt A2/B1 với cùng facts/graph/answers và bản dịch Việt tùy chọn.
- [ ] Viết map layout/interactive IDs cho case riêng, tái sử dụng thế giới/encounter framework thay vì copy game logic.
- [ ] Hai reviewer độc lập kiểm tra tính công bằng, A2/B1, dịch Việt và private-answer boundary; sửa blocker trước tích hợp.
- [ ] Test `GET /api/v1/cases` liệt kê đúng hai case hiện hành; session, resume, map, notebook, conclude và review đều ghim đúng case/version.

### Task 7: Năm mô phỏng người chơi và tích hợp cuối

**Tệp:**
- Tạo: `docs/research/M2-ai-playtest/` (năm báo cáo persona và bản tổng hợp)
- Sửa: `apps/web/e2e/critical-journey.spec.ts`, `m1-segment.spec.ts`; tạo `m2-cases.spec.ts`
- Sửa task/memory/QA docs sau khi có bằng chứng cuối

- [ ] Năm agent đóng vai người chơi khác nhau (A2 đi làm; A2 sắp đi làm; B1 đi làm; B1 thích mystery nhưng ít chơi game; người chơi ưu tiên accessibility), mỗi agent chỉ dùng build/content public và ghi hành động + bằng chứng màn hình.
- [ ] Agent phản biện nội dung phân biệt blocker/major/minor, không xem đáp án riêng; người điều phối kiểm tra lại mọi lỗi được báo trước khi sửa.
- [ ] Chạy visible headed browser: chọn cả hai case; tạo/resume/replay; hai avatar; override A2/B1; bốn độ khó; ba vùng của vụ một; encounter đã cấu hình cho mỗi vụ; retry đúng checkpoint; minimap/full map; sổ tay/dịch; kết luận có chứng cứ; reload.
- [ ] Quan sát console/network và xác nhận JSON private solution/correct choices không xuất hiện ở client payload.
- [ ] Chạy `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`, `e2e:list`; chạy headed E2E theo `docs/memory/current.md`; chạy `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`; chạy `scripts/check-agent-docs.ps1` và `git diff --check`.
- [ ] Sau sửa lỗi, reload bản cuối trong browser có hiển thị và lặp lại hành trình chính trên đúng revision cuối.

## Trình tự thực hiện và cổng

1. **Kế hoạch đã được chủ dự án duyệt ngày 2026-09-27**, kèm ràng buộc mới: HUD phải bám các neo/thứ bậc của wireframe đã duyệt. Các chỉnh sửa v1.1 chỉ ghi lại ràng buộc này, không đổi bố cục đã chọn.
2. Task 0 chốt tình huống case hai, survey, độ khó, mức nội dung A2/B1, target viewport/profile; cập nhật T39/spec và xin duyệt thay đổi sản phẩm nếu khác định hướng đã chốt.
3. Tasks 1–4 xây nền tảng case/session/world/setup/HUD với fixture; giữ một đường chơi v1/v2 hoạt động.
4. Task 5 tích hợp The Swapped Report v3; chạy một vertical slice hoàn chỉnh trước khi làm vụ hai.
5. Task 6 tạo vụ hai bằng cùng pipeline biên kịch → phản biện độc lập → tích hợp.
6. Task 7 mô phỏng năm người chơi AI, visible-browser QA, scripts, improvement review và handoff.

Các nhiệm vụ sản phẩm không chạy đồng thời trên cùng tệp. Sau khi interfaces của Task 1 được hợp nhất, có thể chạy agent React, Phaser và từng case content song song với danh sách tệp sở hữu rõ ràng; người điều phối xử lý integration cuối.

## Tiêu chí hoàn thành M2

- Có hai vụ án hoàn chỉnh, chọn được từ catalog; phiên cũ không đổi case/version.
- The Swapped Report đạt đầy đủ cổng 25–35 phút, 3 hồi/3 vùng, 8–10 hồ sơ, 2 né công bằng, 16+ cụm ngôn ngữ, kết luận có trích chứng cứ và ôn tập.
- Vụ hai có premise được duyệt, mở đầu/điều tra/kết luận/ôn tập và QA riêng; thời lượng ngắn hơn vụ một.
- Chọn/đổi được ngoại hình và A2/B1; survey chỉ khuyến nghị; 4 mức độ khó độc lập, resume giữ đúng lựa chọn.
- HUD/minimap theo wireframe, không có right bar, overlay dừng gameplay, map clue không rò nội dung bị khóa.
- Nhân vật có idle/walk/turn/dodge/talk đọc được; hai preset dùng cùng animation; SFX có mute/fallback và provenance.
- AI content review không còn blocker; năm mô phỏng và visible headed browser flow hoàn tất, nhưng được báo cáo là giả thuyết, không thay thử người thật.
- Gates API/web/content/privacy/storage/build và docs đạt; task/memory ghi rõ các thiết bị hoặc điều kiện chưa xác nhận.

**Execution:** Dùng `superpowers:subagent-driven-development` theo yêu cầu đã duyệt cho M2. Người điều phối giữ quyền tích hợp, chỉ giao quyền sửa theo tệp/lát cắt và chạy toàn bộ kiểm tra trên bản cuối.
