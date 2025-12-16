import React from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import { Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Audit Logs | University Payroll System',
  description: 'View system audit logs',
};

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row'] | null;
};

async function getAuditLogs(): Promise<AuditLog[]> {
  const cookieStore = cookies();
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

  const { data, error } = await supabase
    .from('audit_logs')
    .select(
      `
        *,
        user_profiles(first_name, last_name, email)
      `
    )
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data;
}

const auditLogColumns = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    render: (item: AuditLog) => <span className="text-textSecondary text-sm">{new Date(item.timestamp).toLocaleString()}</span>,
  },
  {
    key: 'user',
    header: 'User',
    render: (item: AuditLog) => (
      <span className="font-medium text-textPrimary">
        {item.user_profiles ? `${item.user_profiles.first_name} ${item.user_profiles.last_name}` : 'System'}
      </span>
    ),
  },
  {
    key: 'action',
    header: 'Action',
    render: (item: AuditLog) => <span className="text-textSecondary text-sm">{item.action}</span>,
  },
  {
    key: 'entity_type',
    header: 'Entity Type',
    render: (item: AuditLog) => <Badge variant="info">{item.entity_type}</Badge>,
  },
  {
    key: 'entity_id',
    header: 'Entity ID',
    render: (item: AuditLog) => <span className="text-textSubtle text-sm">{item.entity_id}</span>,
  },
  {
    key: 'old_value',
    header: 'Old Value',
    render: (item: AuditLog) => (
      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-textSubtle text-sm">
        {item.old_value ? JSON.stringify(item.old_value) : 'N/A'}
      </div>
    ),
  },
  {
    key: 'new_value',
    header: 'New Value',
    render: (item: AuditLog) => (
      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-textSubtle text-sm">
        {item.new_value ? JSON.stringify(item.new_value) : 'N/A'}
      </div>
    ),
  },
];

export default async function AuditLogsPage() {
  const auditLogs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">Audit Logs</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle" />
            <Input
              type="text"
              placeholder="Search logs..."
              className="w-48 py-2 pl-10 pr-3 rounded-md"
            />
          </div>
        </div>
        <DashboardTable data={auditLogs} columns={auditLogColumns} />
      </DashboardCard>
    </div>
  );
}

