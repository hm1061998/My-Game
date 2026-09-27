type BilingualTextProps = {
  english: string
  vietnamese?: string | null
  showTranslation: boolean
  onToggle: () => void
}

export function BilingualText({ english, vietnamese, showTranslation, onToggle }: BilingualTextProps) {
  return <div className="bilingual-text">
    <p lang="en">{english}</p>
    {showTranslation && vietnamese && <p className="bilingual-translation" lang="vi">{vietnamese}</p>}
    {vietnamese && <button type="button" className="translation-toggle" aria-pressed={showTranslation}
      onClick={onToggle}>{showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}</button>}
  </div>
}
