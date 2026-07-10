import { create } from 'zustand'
import * as api from '../api'
import type { Exam, ExamInput } from '../types/exam'

interface ExamState {
  exams: Exam[]
  isLoading: boolean
  fetchExams: () => Promise<void>
  createExam: (input: ExamInput) => Promise<Exam>
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

  async deleteExam(id) {
    await api.deleteExam(id)
    set({ exams: get().exams.filter((exam) => exam.id !== id) })
  },
}))
