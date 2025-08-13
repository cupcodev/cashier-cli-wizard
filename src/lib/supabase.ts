import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xnlwdrgrnnpqvmzzpmml.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubHdkcmdybm5wcXZtenpwbW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1Mzk4MDUsImV4cCI6MjA1MDExNTgwNX0.MfNkFMcEm6AZqW4kpSKv-mNzl47yZdGgMWj9BXCm-kE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)