import { create } from 'zustand'
import * as api from '../api'
import type { MarkRecord, MarkBulkInput } from '../types/mark'

interface MarkState {
  records: MarkRecord[]
  isLoading: boolean
  fetchMarks: (examId: string) => Promise<void>
  submitMarks: (input: MarkBulkInput) => Promise<MarkRecord[]>
}

export const useMarkStore = create<MarkState>((set) => ({
  records: [],
  isLoading: false,

  async fetchMarks(examId) {
    set({ isLoading: true })
    try {
      const records = await api.getMarks(examId)
      set({ records, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async submitMarks(input) {
    const records = await api.submitMarks(input)
    set({ records })
    return records
  },
}))
