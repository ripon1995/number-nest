import { useEffect, type ReactNode } from 'react'
import Loader from './Loader'
import './Modal.css'

interface ModalProps {
  labelledBy: string
  onClose: () => void
  children: ReactNode
  className?: string
  isSubmitting?: boolean
}

function Modal({ labelledBy, onClose, children, className, isSubmitting = false }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isSubmitting])

  return (
    <div className="modal-backdrop" onClick={isSubmitting ? undefined : onClose}>
      <div
        className={className ? `modal ${className}` : 'modal'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-scroll">{children}</div>
        {isSubmitting && (
          <div className="modal-submitting-overlay">
            <Loader label="Saving…" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
