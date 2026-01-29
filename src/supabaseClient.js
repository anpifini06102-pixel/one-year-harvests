
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://foyswlcsrqcvfdqiqrqs.supabase.co'
const supabaseKey = 'sb_publishable_loa0X8o8syfiBSnA49M5hQ_g98Kdc8N'

export const supabase = createClient(supabaseUrl, supabaseKey)
