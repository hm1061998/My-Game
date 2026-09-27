type WorkingTheoryProps = {
  open: boolean
  known: string
  uncertain: string
  onKnownChange: (value: string) => void
  onUncertainChange: (value: string) => void
  onOpen: () => void
  onSkip: () => void
}

export function WorkingTheory({ open, known, uncertain, onKnownChange, onUncertainChange, onOpen, onSkip }: WorkingTheoryProps) {
  return <section className="working-theory" aria-labelledby="working-theory-title">
    <div className="working-theory-heading">
      <div>
        <h4 id="working-theory-title">Ghi chú suy luận</h4>
        <p>Ghi chú riêng cho bạn, không tính điểm và không ảnh hưởng tiến độ.</p>
      </div>
      {!open && <button type="button" onClick={onOpen}>
        {known || uncertain ? 'Sửa ghi chú' : 'Ghi lại suy luận'}
      </button>}
    </div>
    {open && <>
      <label htmlFor="known-theory">Điều đã biết</label>
      <textarea id="known-theory" rows={2} maxLength={160} value={known}
        placeholder="Ví dụ: Nora hỏi về phiên bản trước đó."
        onChange={event => onKnownChange(event.currentTarget.value)} />
      <label htmlFor="uncertain-theory">Điều còn chưa rõ</label>
      <textarea id="uncertain-theory" rows={2} maxLength={160} value={uncertain}
        placeholder="Ví dụ: Cô ấy đã gửi tệp nào?"
        onChange={event => onUncertainChange(event.currentTarget.value)} />
      <button type="button" className="working-theory-skip" onClick={onSkip}>Bỏ qua, tiếp tục</button>
    </>}
  </section>
}
