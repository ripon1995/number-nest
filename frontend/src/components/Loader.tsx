import { DNA } from 'react-loader-spinner'
import './Loader.css'

interface LoaderProps {
  label?: string
}

function Loader({ label = 'Loading' }: LoaderProps) {
  return (
    <div className="app-loader">
      <DNA visible height="80" width="80" ariaLabel={label} />
    </div>
  )
}

export default Loader
