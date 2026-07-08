export interface Student {
  id: string
  name: string
  college: string | null
  contact: string
  email: string | null
  whatsapp_number: string
}

export interface StudentInput {
  name: string
  college: string | null
  contact: string
  email: string | null
  whatsapp_number: string
}
