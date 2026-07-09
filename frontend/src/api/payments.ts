import { request, authHeaders } from './client'
import type { Payment, PaymentInput } from '../types/payment'

export function getPayments(): Promise<Payment[]> {
  return request<Payment[]>('/payments', { headers: authHeaders() })
}

export function createPayment(input: PaymentInput): Promise<Payment> {
  return request<Payment>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: authHeaders(),
  })
}

export function deletePayment(id: string): Promise<void> {
  return request<void>(`/payments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
