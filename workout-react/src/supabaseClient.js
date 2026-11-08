import { createClient } from '@supabase/supabase-js'

// Project URL (его нужно взять на главной странице проекта в Supabase, выглядит как https://xxxx.supabase.co)
const SUPABASE_URL = 'https://otciihanqlsuarulkxil.supabase.co'

const SUPABASE_ANON_KEY = 'sb_publishable_br4N9CNiMBtqxNYXy3FStQ_KY_zFrCs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)