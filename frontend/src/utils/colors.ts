// App color palette
export const colors = {
  // Primary gradient colors (used in header and buttons)
  primary: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    start: '#667eea',
    end: '#764ba2',
  },

  // Accent colors
  accent: {
    blue: '#4a90e2',
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
  },

  // Card colors
  card: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    backgroundAlt: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    hover: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
} as const;