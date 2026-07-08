import { useState, type FormEvent } from 'react'
import Modal from '../../components/Modal'
import { useStudentStore } from '../../store/studentStore'
import { ApiError } from '../../errors/api'
import type { Student, StudentInput } from '../../types/student'
import './students.css'

interface StudentFormDialogProps {
  student: Student | null
  onClose: () => void
  onError: (err: ApiError) => void
}

interface FormState {
  name: string
  college: string
  contact: string
  email: string
  whatsapp_number: string
}

const emptyForm: FormState = {
  name: '',
  college: '',
  contact: '',
  email: '',
  whatsapp_number: '',
}

function toFormState(student: Student): FormState {
  return {
    name: student.name,
    college: student.college ?? '',
    contact: student.contact,
    email: student.email ?? '',
    whatsapp_number: student.whatsapp_number,
  }
}

function StudentFormDialog({ student, onClose, onError }: StudentFormDialogProps) {
  const createStudent = useStudentStore((state) => state.createStudent)
  const updateStudent = useStudentStore((state) => state.updateStudent)

  const [form, setForm] = useState<FormState>(student ? toFormState(student) : emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const payload: StudentInput = {
      name: form.name.trim(),
      college: form.college.trim() || null,
      contact: form.contact.trim(),
      email: form.email.trim() || null,
      whatsapp_number: form.whatsapp_number.trim(),
    }

    setIsSubmitting(true)
    try {
      if (student) {
        await updateStudent(student.id, payload)
      } else {
        await createStudent(payload)
      }
      onClose()
    } catch (err) {
      onError(
        err instanceof ApiError
          ? err
          : new ApiError(0, 'Something went wrong', 'Something went wrong'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal labelledBy="student-dialog-title" onClose={onClose}>
      <form className="student-form" onSubmit={handleSubmit}>
        <h2 id="student-dialog-title">{student ? 'Edit student' : 'New student'}</h2>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          College (optional)
          <input
            type="text"
            value={form.college}
            onChange={(e) => setForm({ ...form, college: e.target.value })}
          />
        </label>
        <label>
          Contact
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            required
          />
        </label>
        <label>
          Email (optional)
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          WhatsApp number
          <input
            type="text"
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            required
          />
        </label>
        <div className="student-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : student ? 'Save changes' : 'Add student'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default StudentFormDialog
