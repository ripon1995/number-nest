import { create } from 'zustand'
import * as api from '../lib/api'
import type { Payment, PaymentInput } from '../types/payment'

interface PaymentState {
  payments: Payment[]
  isLoading: boolean
  fetchPayments: () => Promise<void>
  createPayment: (input: PaymentInput) => Promise<Payment>
  deletePayment: (id: string) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  isLoading: false,

  async fetchPayments() {
    set({ isLoading: true })
    try {
      const payments = await api.getPayments()
      set({ payments, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createPayment(input) {
    const created = await api.createPayment(input)
    set({ payments: [...get().payments, created] })
    return created
  },

  async deletePayment(id) {
    await api.deletePayment(id)
    set({ payments: get().payments.filter((payment) => payment.id !== id) })
  },
}))
