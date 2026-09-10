export interface ErrorLog {
  id: string
  user_id: string | null
  message: string
  route: string
  digest: string | null
  created_at: string
}

export interface ErrorLogInput {
  message: string
  route: string
  digest?: string
}
