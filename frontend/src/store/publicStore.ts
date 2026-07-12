import { create } from 'zustand'
import * as api from '../api'
import type { Course } from '../types/course'
import type { Notice } from '../types/notice'

interface PublicState {
  courses: Course[]
  notices: Notice[]
  isLoadingCourses: boolean
  isLoadingNotices: boolean
  fetchPublicCourses: () => Promise<void>
  fetchPublicNotices: () => Promise<void>
}

export const usePublicStore = create<PublicState>((set) => ({
  courses: [],
  notices: [],
  isLoadingCourses: false,
  isLoadingNotices: false,

  async fetchPublicCourses() {
    set({ isLoadingCourses: true })
    try {
      const courses = await api.getPublicCourses()
      set({ courses, isLoadingCourses: false })
    } catch (err) {
      set({ isLoadingCourses: false })
      throw err
    }
  },

  async fetchPublicNotices() {
    set({ isLoadingNotices: true })
    try {
      const notices = await api.getPublicNotices()
      set({ notices, isLoadingNotices: false })
    } catch (err) {
      set({ isLoadingNotices: false })
      throw err
    }
  },
}))
