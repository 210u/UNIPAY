export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          created_at: string
          department_id: string | null
          employee_number: string
          employee_type: string // USER-DEFINED
          employment_status: string // USER-DEFINED
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          hire_date: string
          id: string
          notes: string | null
          student_id: string | null
          tax_id: string | null
          tax_withholding_rate: number | null
          termination_date: string | null
          university_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          employee_number: string
          employee_type: string // USER-DEFINED
          employment_status?: string // USER-DEFINED
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          hire_date: string
          id?: string
          notes?: string | null
          student_id?: string | null
          tax_id?: string | null
          tax_withholding_rate?: number | null
          termination_date?: string | null
          university_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          employee_number?: string
          employee_type?: string // USER-DEFINED
          employment_status?: string // USER-DEFINED
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          hire_date?: string
          id?: string
          notes?: string | null
          student_id?: string | null
          tax_id?: string | null
          tax_withholding_rate?: number | null
          termination_date?: string | null
          university_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          middle_name: string | null
          phone_number: string | null
          postal_code: string | null
          profile_image_url: string | null
          role: string // USER-DEFINED
          state_province: string | null
          university_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          middle_name?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          role?: string // USER-DEFINED
          state_province?: string | null
          university_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          middle_name?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          role?: string // USER-DEFINED
          state_province?: string | null
          university_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          budget_code: string | null
          code: string
          cost_center_code: string | null
          created_at: string
          description: string | null
          head_user_id: string | null
          id: string
          is_active: boolean
          name: string
          university_id: string
          updated_at: string
        }
        Insert: {
          budget_code?: string | null
          code: string
          cost_center_code?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          university_id: string
          updated_at?: string
        }
        Update: {
          budget_code?: string | null
          code?: string
          cost_center_code?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_head_user_id"
            columns: ["head_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      [_ in string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [_ in string]: string
    }
    CompositeTypes: {
      [_ in string]: Record<string, unknown>
    }
  }
}