import { create } from 'zustand'
import * as api from '../api'
import type { Student, StudentInput } from '../types/student'

interface StudentState {
  students: Student[]
  isLoading: boolean
  fetchStudents: () => Promise<void>
  createStudent: (input: StudentInput) => Promise<Student>
  updateStudent: (id: string, input: StudentInput) => Promise<Student>
  deleteStudent: (id: string) => Promise<void>
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  isLoading: false,

  async fetchStudents() {
    set({ isLoading: true })
    try {
      const students = await api.getStudents()
      set({ students, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createStudent(input) {
    const created = await api.createStudent(input)
    set({ students: [...get().students, created] })
    return created
  },

  async updateStudent(id, input) {
    const updated = await api.updateStudent(id, input)
    set({ students: get().students.map((student) => (student.id === updated.id ? updated : student)) })
    return updated
  },

  async deleteStudent(id) {
    await api.deleteStudent(id)
    set({ students: get().students.filter((student) => student.id !== id) })
  },
}))
