import { create } from 'zustand'
import * as api from '../lib/api'
import type { AttendanceRecord, AttendanceBulkInput } from '../types/attendance'

interface AttendanceState {
  records: AttendanceRecord[]
  isLoading: boolean
  fetchAttendance: (courseId: string, sessionDate?: string) => Promise<void>
  submitAttendance: (input: AttendanceBulkInput) => Promise<AttendanceRecord[]>
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  isLoading: false,

  async fetchAttendance(courseId, sessionDate) {
    set({ isLoading: true })
    try {
      const records = await api.getAttendance(courseId, sessionDate)
      set({ records, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async submitAttendance(input) {
    const records = await api.submitAttendance(input)
    set({ records })
    return records
  },
}))
