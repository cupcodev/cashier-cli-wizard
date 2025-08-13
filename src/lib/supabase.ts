import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xnlwdrgrnnpqvmzzpmml.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubHdkcmdybm5wcXZtenpwbW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjUyMTQsImV4cCI6MjA3MDYwMTIxNH0.G-tdavl9fE951XiDEj01aN6PSO0Kj0tFpviVWQz9SUA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)