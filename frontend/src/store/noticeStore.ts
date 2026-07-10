import { create } from 'zustand'
import * as api from '../api'
import type { Notice, NoticeInput } from '../types/notice'

interface NoticeState {
  notices: Notice[]
  isLoading: boolean
  fetchNotices: () => Promise<void>
  createNotice: (input: NoticeInput) => Promise<Notice>
  deleteNotice: (id: string) => Promise<void>
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  isLoading: false,

  async fetchNotices() {
    set({ isLoading: true })
    try {
      const notices = await api.getNotices()
      set({ notices, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createNotice(input) {
    const created = await api.createNotice(input)
    set({ notices: [...get().notices, created] })
    return created
  },

  async deleteNotice(id) {
    await api.deleteNotice(id)
    set({ notices: get().notices.filter((notice) => notice.id !== id) })
  },
}))
