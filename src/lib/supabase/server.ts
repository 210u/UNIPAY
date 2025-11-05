import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './types.generated';

export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

