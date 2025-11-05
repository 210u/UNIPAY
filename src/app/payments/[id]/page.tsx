import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import PayslipViewer from '@/components/payments/PayslipViewer';

export default async function PayslipPage({ params }: { params: { id: string } }) {
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

  if (!profile) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PayslipViewer paymentId={params.id} profile={profile} />
    </div>
  );
}



