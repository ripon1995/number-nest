import { HashLoader } from 'react-spinners'
import { useThemeStore } from '../store/themeStore'
import './Loader.css'

interface LoaderProps {
  label?: string
}

// HashLoader parses `color` as a real hex/rgb value in JS (to derive a translucent
// variant) — a var(--accent) reference silently breaks half its dots. Mirrors index.css's
// --accent tokens; keep in sync if those change.
const ACCENT_BY_THEME = {
  light: '#3454d1',
  dark: '#5c7cfa',
}

function Loader({ label = 'Loading' }: LoaderProps) {
  const theme = useThemeStore((state) => state.theme)

  return (
    <div className="app-loader">
      <HashLoader size={80} color={ACCENT_BY_THEME[theme]} aria-label={label} loading />
    </div>
  )
}

export default Loader
