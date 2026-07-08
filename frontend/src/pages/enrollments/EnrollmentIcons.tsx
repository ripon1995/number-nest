function iconProps(width = 16, height = 16) {
  return { viewBox: '0 0 24 24', width, height, fill: 'none', 'aria-hidden': true } as const
}

export function TrashIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m-7 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
