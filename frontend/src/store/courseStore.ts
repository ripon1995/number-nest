import { create } from 'zustand'
import * as api from '../lib/api'
import type { Course, CourseInput } from '../types/course'

interface CourseState {
  courses: Course[]
  isLoading: boolean
  fetchCourses: () => Promise<void>
  createCourse: (input: CourseInput) => Promise<Course>
  updateCourse: (id: string, input: CourseInput) => Promise<Course>
  deleteCourse: (id: string) => Promise<void>
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: false,

  async fetchCourses() {
    set({ isLoading: true })
    try {
      const courses = await api.getCourses()
      set({ courses, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createCourse(input) {
    const created = await api.createCourse(input)
    set({ courses: [...get().courses, created] })
    return created
  },

  async updateCourse(id, input) {
    const updated = await api.updateCourse(id, input)
    set({ courses: get().courses.map((course) => (course.id === updated.id ? updated : course)) })
    return updated
  },

  async deleteCourse(id) {
    await api.deleteCourse(id)
    set({ courses: get().courses.filter((course) => course.id !== id) })
  },
}))
