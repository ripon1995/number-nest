export interface Payment {
  id: string
  enrollment_id: string
  month: string
  payment_date: string
  amount: string
  created_at: string
}

export interface PaymentInput {
  enrollment_id: string
  month: string
  payment_date: string
  amount: string
}
