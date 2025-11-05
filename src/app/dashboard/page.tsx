import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  console.log('🔵 DASHBOARD: Loading for user:', session.user.id, session.user.email);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  console.log('🔵 DASHBOARD: Profile query result:', { 
    hasProfile: !!profile, 
    error: profileError?.message 
  });

  if (profileError) {
    console.error('❌ DASHBOARD: Profile error:', profileError);
    
    // If profile doesn't exist, create it
    if (profileError.code === 'PGRST116') {
      console.log('⚠️ DASHBOARD: Profile missing, creating...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.first_name || 'User',
          last_name: session.user.user_metadata?.last_name || '',
          phone_number: session.user.user_metadata?.phone_number || session.user.phone || null,
          username: session.user.user_metadata?.username || null,
          role: 'employee',
          university_id: null,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ DASHBOARD: Failed to create profile:', createError);
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h1>
              <p className="text-gray-700 mb-4">Failed to load your profile. Error: {createError.message}</p>
              <p className="text-sm text-gray-500">User ID: {session.user.id}</p>
              <p className="text-sm text-gray-500">Email: {session.user.email}</p>
            </div>
          </div>
        );
      }
      
      console.log('✅ DASHBOARD: Profile created:', newProfile);
      return (
        <div className="min-h-screen bg-gray-50">
          <DashboardContent profile={newProfile} employee={null} />
        </div>
      );
    }
  }

  if (!profile) {
    console.error('❌ DASHBOARD: Profile is null');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
          <p className="text-gray-700 mb-4">Your user profile could not be found.</p>
          <p className="text-sm text-gray-500">User ID: {session.user.id}</p>
          <p className="text-sm text-gray-500">Email: {session.user.email}</p>
        </div>
      </div>
    );
  }

  console.log('✅ DASHBOARD: Profile loaded:', profile.email);

  // Get employee data if exists
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select(`
      *,
      department:departments(*),
      university:universities(*)
    `)
    .eq('user_id', session.user.id)
    .single();

  if (employeeError && employeeError.code !== 'PGRST116') {
    console.error('⚠️ DASHBOARD: Employee error:', employeeError);
  }

  console.log('🔵 DASHBOARD: Employee data:', { hasEmployee: !!employee });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardContent profile={profile} employee={employee} />
    </div>
  );
}



