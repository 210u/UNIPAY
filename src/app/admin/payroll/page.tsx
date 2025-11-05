import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import PayrollProcessingContent from '@/components/admin/PayrollProcessingContent';

export default async function PayrollProcessingPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, university:universities(*)')
    .eq('id', session.user.id)
    .single();

  if (!profile || !['system_admin', 'university_admin', 'payroll_officer'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to process payroll.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PayrollProcessingContent profile={profile} />
    </div>
  );
}



