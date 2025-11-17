"use client";

import React, { useMemo, useState } from 'react';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardTable from '@/components/common/DashboardTable';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { Search, Filter, BriefcaseBusiness, Target, Activity, Shield } from 'lucide-react';
import SimpleBarChart from '@/components/analytics/SimpleBarChart';
import DonutChart from '@/components/analytics/DonutChart';
import TrendLineChart from '@/components/analytics/TrendLineChart';

interface Task {
  id: number;
  name: string;
  assignedTo: { name: string; avatar?: string }[];
  category: 'feature' | 'bug' | 'review' | 'testing';
  dueDate: string;
  status: 'high' | 'medium' | 'low'; // Using priority variants for status colors
  progress: number;
}

const payrollTasks: Task[] = [
  {
    id: 1,
    name: "Process Monthly Salaries",
    assignedTo: [{ name: "Alice Brown", avatar: "/avatars/alice.jpg" }, { name: "John Doe", avatar: "/avatars/john.jpg" }],
    category: "feature",
    dueDate: "2024-11-25",
    status: "high",
    progress: 70,
  },
  {
    id: 2,
    name: "Review Q4 Bonus Calculations",
    assignedTo: [{ name: "Jane Smith", avatar: "/avatars/jane.jpg" }],
    category: "review",
    dueDate: "2024-12-10",
    status: "medium",
    progress: 40,
  },
  {
    id: 3,
    name: "Update Tax Deduction Tables",
    assignedTo: [{ name: "Bob Johnson", avatar: "/avatars/bob.jpg" }],
    category: "bug",
    dueDate: "2024-11-30",
    status: "high",
    progress: 90,
  },
  {
    id: 4,
    name: "Onboard New HR Staff",
    assignedTo: [{ name: "Charlie Green", avatar: "/avatars/charlie.jpg" }],
    category: "testing",
    dueDate: "2024-11-20",
    status: "low",
    progress: 20,
  },
];

const approvalTasks: Task[] = [
  {
    id: 5,
    name: "Approve Overtime for November",
    assignedTo: [{ name: "David Lee", avatar: "/avatars/david.jpg" }],
    category: "review",
    dueDate: "2024-11-22",
    status: "high",
    progress: 60,
  },
  {
    id: 6,
    name: "Finalize Annual Leave Requests",
    assignedTo: [{ name: "Eva White", avatar: "/avatars/eva.jpg" }],
    category: "feature",
    dueDate: "2024-11-28",
    status: "medium",
    progress: 80,
  },
];

const columns = [
  {
    key: "name",
    header: "Task name",
    render: (item: Task) => <span className="font-medium text-textPrimary">{item.name}</span>,
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (item: Task) => (
      <div className="flex -space-x-2">
        {item.assignedTo.map((person, idx) => (
          <Avatar key={idx} alt={person.name} src={person.avatar} className="w-6 h-6" />
        ))}
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (item: Task) => <Badge variant={item.category}>{item.category}</Badge>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (item: Task) => <span className="text-textSecondary text-sm">{item.dueDate}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Task) => <Badge variant={item.status}>{item.status}</Badge>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (item: Task) => <ProgressBar progress={item.progress} className="w-24" />,
  },
];

interface DepartmentRecord {
  id: number;
  name: string;
  dean: string;
  headcount: number;
  openRoles: number;
  health: 'excellent' | 'stable' | 'at-risk';
}

interface TeamSnapshot {
  id: number;
  team: string;
  sprint: string;
  completion: number;
  risks: 'low' | 'medium' | 'high';
  blockers: number;
}

const departmentRows: DepartmentRecord[] = [
  { id: 1, name: "Faculty of Science", dean: "Dr. A. Mendes", headcount: 820, openRoles: 12, health: "excellent" },
  { id: 2, name: "School of Business", dean: "Dr. S. Gupta", headcount: 640, openRoles: 9, health: "stable" },
  { id: 3, name: "College of Arts", dean: "Prof. H. Willis", headcount: 540, openRoles: 6, health: "stable" },
  { id: 4, name: "Faculty of Engineering", dean: "Dr. R. Chen", headcount: 710, openRoles: 15, health: "at-risk" },
];

const teamSnapshots: TeamSnapshot[] = [
  { id: 1, team: "Payroll Ops", sprint: "Sprint 28", completion: 92, risks: "low", blockers: 1 },
  { id: 2, team: "Benefits Admin", sprint: "Sprint 12", completion: 78, risks: "medium", blockers: 3 },
  { id: 3, team: "Compliance", sprint: "Sprint 07", completion: 64, risks: "medium", blockers: 4 },
  { id: 4, team: "HR Automation", sprint: "Sprint 19", completion: 58, risks: "high", blockers: 6 },
];

const departmentColumns = [
  {
    key: "name",
    header: "Department",
    render: (item: DepartmentRecord) => (
      <div>
        <p className="font-medium text-textPrimary">{item.name}</p>
        <p className="text-xs text-textSecondary">Dean: {item.dean}</p>
      </div>
    ),
  },
  {
    key: "headcount",
    header: "Headcount",
    render: (item: DepartmentRecord) => <span className="text-textPrimary font-semibold">{item.headcount.toLocaleString()}</span>,
  },
  {
    key: "openRoles",
    header: "Open Roles",
    render: (item: DepartmentRecord) => <span className="text-textSecondary">{item.openRoles}</span>,
  },
  {
    key: "health",
    header: "Health",
    render: (item: DepartmentRecord) => {
      const variant = item.health === 'excellent' ? 'low' : item.health === 'stable' ? 'feature' : 'high';
      return (
        <Badge variant={variant}>
          {item.health}
        </Badge>
      );
    },
  },
];

const teamColumns = [
  {
    key: "team",
    header: "Team",
    render: (item: TeamSnapshot) => (
      <div>
        <p className="font-medium text-textPrimary">{item.team}</p>
        <p className="text-xs text-textSecondary">{item.sprint}</p>
      </div>
    ),
  },
  {
    key: "completion",
    header: "Completion",
    render: (item: TeamSnapshot) => (
      <div className="flex items-center gap-3">
        <ProgressBar progress={item.completion} className="w-32" />
        <span className="text-sm font-semibold text-textPrimary">{item.completion}%</span>
      </div>
    ),
  },
  {
    key: "blockers",
    header: "Blockers",
    render: (item: TeamSnapshot) => <span className="text-textSecondary">{item.blockers}</span>,
  },
  {
    key: "risks",
    header: "Risk",
    render: (item: TeamSnapshot) => (
      <Badge variant={item.risks === 'high' ? 'high' : item.risks === 'medium' ? 'medium' : 'low'}>
        {item.risks}
      </Badge>
    ),
  },
];

const departmentHeadcountData = [
  { label: 'Science', value: 820, hint: '+4% QoQ' },
  { label: 'Business', value: 640, hint: '+2% QoQ' },
  { label: 'Engineering', value: 710, hint: '+6% QoQ' },
  { label: 'Arts', value: 540, hint: '+1% QoQ' },
];

const workforceTrend = [
  { label: 'May', value: 4800 },
  { label: 'Jun', value: 4900 },
  { label: 'Jul', value: 5000 },
  { label: 'Aug', value: 5050 },
  { label: 'Sep', value: 5100 },
  { label: 'Oct', value: 5220 },
];

const allocationBreakdown = [
  { label: 'Academic', value: 52, color: '#7c3aed' },
  { label: 'Admin', value: 28, color: '#c084fc' },
  { label: 'Research', value: 12, color: '#a855f7' },
  { label: 'Operations', value: 8, color: '#d8b4fe' },
];

const teamVelocityTrend = [
  { label: 'Sprint 20', value: 68 },
  { label: '21', value: 72 },
  { label: '22', value: 74 },
  { label: '23', value: 70 },
  { label: '24', value: 78 },
  { label: '25', value: 82 },
  { label: '26', value: 80 },
  { label: '27', value: 85 },
];

const DepartmentBoardView = () => {
  const [search, setSearch] = useState('');

  const filteredDepartments = useMemo(
    () =>
      departmentRows.filter(
        (department) =>
          department.name.toLowerCase().includes(search.toLowerCase()) ||
          department.dean.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-textSecondary">Active departments</p>
            <p className="text-3xl font-bold text-textPrimary">24 faculties</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-sidebarItemHoverBg px-4 py-2 rounded-lg text-sm">
              <span className="text-textSecondary">Avg. health</span>
              <p className="text-xl font-semibold text-textPrimary">92%</p>
            </div>
            <div className="bg-sidebarItemHoverBg px-4 py-2 rounded-lg text-sm">
              <span className="text-textSecondary">Open requisitions</span>
              <p className="text-xl font-semibold text-textPrimary">48</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-textAccent" />
                Headcount by faculty
              </h3>
              <span className="text-xs uppercase tracking-wide text-textSecondary">Updated 2h ago</span>
            </div>
            <SimpleBarChart data={departmentHeadcountData} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
                <Activity className="h-5 w-5 text-textAccent" />
                Workforce trend
              </h3>
              <span className="text-xs uppercase tracking-wide text-textSecondary">Rolling 6 months</span>
            </div>
            <TrendLineChart data={workforceTrend} />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Department health board</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle z-10" />
              <Input
                type="text"
                placeholder="Search faculty..."
                className="w-56 pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>
        <DashboardTable data={filteredDepartments} columns={departmentColumns} />
      </DashboardCard>
    </div>
  );
};

const TeamOverviewView = () => {
  const [search, setSearch] = useState('');
  const [atRiskOnly, setAtRiskOnly] = useState(false);

  const filteredTeams = useMemo(
    () =>
      teamSnapshots.filter((team) => {
        const matchesSearch = team.team.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = atRiskOnly ? team.risks !== 'low' : true;
        return matchesSearch && matchesRisk;
      }),
    [search, atRiskOnly]
  );

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary flex items-center gap-2 mb-4">
              <DonutChart data={allocationBreakdown} totalLabel="Allocation" />
            </h3>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
                <Target className="h-5 w-5 text-textAccent" />
                Sprint velocity
              </h3>
              <span className="text-xs uppercase tracking-wide text-textSecondary">Avg. 79 pts</span>
            </div>
            <TrendLineChart data={teamVelocityTrend} />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team delivery pulse</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle z-10" />
              <Input
                type="text"
                placeholder="Search team..."
                className="w-48 pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              className="flex items-center space-x-2 text-sm"
              onClick={() => setAtRiskOnly((prev) => !prev)}
              aria-pressed={atRiskOnly}
            >
              <Shield className="h-4 w-4" />
              <span>{atRiskOnly ? 'Show all' : 'Highlight risks'}</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={filteredTeams} columns={teamColumns} />
      </DashboardCard>
    </div>
  );
};

const AllTasksView = () => {
  const [payrollSearch, setPayrollSearch] = useState('');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [payrollHighOnly, setPayrollHighOnly] = useState(false);
  const [approvalHighOnly, setApprovalHighOnly] = useState(false);

  const filteredPayrollTasks = useMemo(() => {
    return payrollTasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(payrollSearch.toLowerCase()) ||
        task.assignedTo.some((member) => member.name.toLowerCase().includes(payrollSearch.toLowerCase()));
      const matchesPriority = payrollHighOnly ? task.status === 'high' : true;
      return matchesSearch && matchesPriority;
    });
  }, [payrollSearch, payrollHighOnly]);

  const filteredApprovalTasks = useMemo(() => {
    return approvalTasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(approvalSearch.toLowerCase()) ||
        task.assignedTo.some((member) => member.name.toLowerCase().includes(approvalSearch.toLowerCase()));
      const matchesPriority = approvalHighOnly ? task.status === 'high' : true;
      return matchesSearch && matchesPriority;
    });
  }, [approvalSearch, approvalHighOnly]);

  return (
    <div className="space-y-8">
      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Payroll Tasks Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle z-10" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-48 pl-10"
                value={payrollSearch}
                onChange={(event) => setPayrollSearch(event.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              className="flex items-center space-x-2 text-sm"
              onClick={() => setPayrollHighOnly((prev) => !prev)}
              aria-pressed={payrollHighOnly}
            >
              <Filter className="h-4 w-4" />
              <span>{payrollHighOnly ? 'High Priority' : 'All Priority'}</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={filteredPayrollTasks} columns={columns} />
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Approvals</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSubtle z-10" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-48 pl-10"
                value={approvalSearch}
                onChange={(event) => setApprovalSearch(event.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              className="flex items-center space-x-2 text-sm"
              onClick={() => setApprovalHighOnly((prev) => !prev)}
              aria-pressed={approvalHighOnly}
            >
              <Filter className="h-4 w-4" />
              <span>{approvalHighOnly ? 'High Priority' : 'All Priority'}</span>
            </Button>
          </div>
        </div>
        <DashboardTable data={filteredApprovalTasks} columns={columns} />
      </DashboardCard>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("All tasks");

  return (
    <div className="min-h-screen bg-background text-textPrimary p-4">
      <h1 className="text-3xl font-bold text-textPrimary mb-6">Teams</h1>

      <div className="flex flex-wrap gap-3 mb-6 bg-cardBg rounded-full px-4 py-2 neumorphic-raised">
        <button
          onClick={() => setActiveTab("Department Board")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors neumorphic-subtle
            ${activeTab === "Department Board"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
          aria-pressed={activeTab === "Department Board"}
        >
          Department Board
        </button>
        <button
          onClick={() => setActiveTab("Team Overview")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors neumorphic-subtle
            ${activeTab === "Team Overview"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
          aria-pressed={activeTab === "Team Overview"}
        >
          Team Overview
        </button>
        <button
          onClick={() => setActiveTab("All tasks")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors neumorphic-subtle
            ${activeTab === "All tasks"
              ? 'bg-sidebarItemActiveBg text-sidebarItemActiveText'
              : 'text-textSecondary hover:text-textPrimary hover:bg-sidebarItemHoverBg'
            }`}
          aria-pressed={activeTab === "All tasks"}
        >
          All tasks
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === "Department Board" && <DepartmentBoardView />}
        {activeTab === "Team Overview" && <TeamOverviewView />}
        {activeTab === "All tasks" && <AllTasksView />}
      </div>
    </div>
  );
}

