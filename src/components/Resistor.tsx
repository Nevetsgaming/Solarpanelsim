type ResistorProps = {
  resistance: number
  selected: boolean
  onSelect: () => void
}

export default function Resistor({ resistance, selected, onSelect }: ResistorProps) {
  return (
    <button type="button" className="load-resistor" aria-label="Adjust load resistance" aria-pressed={selected} onClick={onSelect}>
      <svg viewBox="0 0 260 50" aria-hidden="true">
        <path d="M 10 25 H 75 L 85 10 L 100 40 L 115 10 L 130 40 L 145 10 L 160 40 L 175 25 H 250" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="25" r="3" fill="currentColor" />
        <circle cx="250" cy="25" r="3" fill="currentColor" />
      </svg>
      <span>Load: {resistance} Ω</span>
    </button>
  )
}
