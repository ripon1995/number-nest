import { create } from 'zustand'
import * as api from '../api'
import type { Exam, ExamInput, ExamUpdateInput } from '../types/exam'

interface ExamState {
  exams: Exam[]
  isLoading: boolean
  fetchExams: () => Promise<void>
  createExam: (input: ExamInput) => Promise<Exam>
  updateExam: (id: string, input: ExamUpdateInput) => Promise<Exam>
  deleteExam: (id: string) => Promise<void>
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  isLoading: false,

  async fetchExams() {
    set({ isLoading: true })
    try {
      const exams = await api.getExams()
      set({ exams, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createExam(input) {
    const created = await api.createExam(input)
    set({ exams: [...get().exams, created] })
    return created
  },

  async updateExam(id, input) {
    const updated = await api.updateExam(id, input)
    set({ exams: get().exams.map((exam) => (exam.id === id ? updated : exam)) })
    return updated
  },

  async deleteExam(id) {
    await api.deleteExam(id)
    set({ exams: get().exams.filter((exam) => exam.id !== id) })
  },
}))
