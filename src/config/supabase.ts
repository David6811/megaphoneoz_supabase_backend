import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftwnxeaovmvrjowvkbwp.supabase.co'
const supabaseAnonKey = 'sb_publishable_EyM_-N5n9ksU3oXmd9FyYQ_SStSy1d1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)