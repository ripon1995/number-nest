import { create } from 'zustand'
import * as api from '../lib/api'
import type { Enrollment, EnrollmentInput } from '../types/enrollment'

interface EnrollmentState {
  enrollments: Enrollment[]
  isLoading: boolean
  fetchEnrollments: () => Promise<void>
  createEnrollment: (input: EnrollmentInput) => Promise<Enrollment>
  deleteEnrollment: (id: string) => Promise<void>
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrollments: [],
  isLoading: false,

  async fetchEnrollments() {
    set({ isLoading: true })
    try {
      const enrollments = await api.getEnrollments()
      set({ enrollments, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createEnrollment(input) {
    const created = await api.createEnrollment(input)
    set({ enrollments: [...get().enrollments, created] })
    return created
  },

  async deleteEnrollment(id) {
    await api.deleteEnrollment(id)
    set({ enrollments: get().enrollments.filter((enrollment) => enrollment.id !== id) })
  },
}))
