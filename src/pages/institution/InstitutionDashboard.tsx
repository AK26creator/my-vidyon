import { useState, useEffect } from 'react';
import { InstitutionLayout } from '@/layouts/InstitutionLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';
import { AreaChart } from '@/components/charts/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { useAuth } from '@/context/AuthContext';
import { institutionAPI } from '@/services/api';
import {
  GraduationCap,
  Users,
  Building,
  TrendingUp,
  IndianRupee,
  UserPlus,
  Loader2
} from 'lucide-react';

const enrollmentTrend = [
  { name: 'Jan', value: 850 },
  { name: 'Feb', value: 920 },
  { name: 'Mar', value: 1050 },
  { name: 'Apr', value: 1180 },
  { name: 'May', value: 1250 },
  { name: 'Jun', value: 1320 },
];

const classDistribution = [
  { name: 'Grade 10', value: 250 },
  { name: 'Grade 9', value: 280 },
  { name: 'Grade 8', value: 220 },
  { name: 'Grade 11', value: 180 },
  { name: 'Grade 12', value: 150 },
];

const feeCollection = [
  { name: 'Jan', value: 1.2 },
  { name: 'Feb', value: 1.5 },
  { name: 'Mar', value: 1.8 },
  { name: 'Apr', value: 2.1 },
];

const recentAdmissions = [
  { id: 1, name: 'James Wilson', program: 'Grade 10-A', date: 'Dec 15, 2025', status: 'confirmed' },
  { id: 2, name: 'Olivia Martinez', program: 'Grade 9-B', date: 'Dec 14, 2025', status: 'pending' },
  { id: 3, name: 'William Anderson', program: 'Grade 8-C', date: 'Dec 14, 2025', status: 'confirmed' },
  { id: 4, name: 'Sophia Thomas', program: 'Grade 11-A', date: 'Dec 13, 2025', status: 'documents' },
  { id: 5, name: 'Benjamin Jackson', program: 'Grade 12-B', date: 'Dec 12, 2025', status: 'confirmed' },
];

const topPerformingDepts = [
  { department: 'Science Stream', students: 420, faculty: 28, avgGPA: '88%', placement: '92%' },
  { department: 'Mathematics', students: 380, faculty: 24, avgGPA: '85%', placement: '88%' },
  { department: 'Commerce', students: 340, faculty: 22, avgGPA: '82%', placement: '85%' },
  { department: 'Humanities', students: 310, faculty: 20, avgGPA: '84%', placement: '82%' },
];

export function InstitutionDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await institutionAPI.getDashboard();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch institution dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const admissionColumns = [
    { key: 'name', header: 'Student Name' },
    { key: 'program', header: 'Program' },
    { key: 'date', header: 'Application Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item: typeof recentAdmissions[0]) => {
        const variants: Record<string, 'success' | 'warning' | 'info'> = {
          confirmed: 'success',
          pending: 'warning',
          documents: 'info',
        };
        return <Badge variant={variants[item.status]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>;
      },
    },
  ];

  const deptColumns = [
    { key: 'department', header: 'Subject/Stream' },
    { key: 'students', header: 'Students' },
    { key: 'faculty', header: 'Teachers' },
    { key: 'avgGPA', header: 'Avg. Score' },
    { key: 'placement', header: 'Pass Rate' },
  ];

  if (loading) {
    return (
      <InstitutionLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageHeader
        title="Institution Overview"
        subtitle={`${user?.name} • Academic Year 2025-26`}
      />

      {/* Stats Grid */}
      <div className="stats-grid mb-6 sm:mb-8">
        <StatCard
          title="Total Students"
          value={data?.totalStudents?.toLocaleString() || '0'}
          icon={GraduationCap}
          iconColor="text-institution"
          change="Real-time count"
          changeType="positive"
        />
        <StatCard
          title="Total Teachers"
          value={data?.totalFaculty || '0'}
          icon={Users}
          iconColor="text-faculty"
          change={`${data?.totalDepartments || 0} Departments`}
        />
        <StatCard
          title="Total Classes"
          value="45"
          icon={Building}
          iconColor="text-institution"
          change="Across all grades"
        />
        <StatCard
          title="Revenue (YTD)"
          value={`₹${(parseFloat(data?.totalRevenue || 0) / 1000000).toFixed(1)}M`}
          icon={IndianRupee}
          iconColor="text-success"
          change="Total collection"
          changeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2 dashboard-card p-4 sm:p-6">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Enrollment Trend</h3>
          <div className="chart-container-responsive">
            <AreaChart data={enrollmentTrend} color="hsl(var(--institution))" height={250} />
          </div>
        </div>
        <div className="dashboard-card p-4 sm:p-6">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Class Enrollment Distribution</h3>
          <div className="h-[250px]">
            <DonutChart data={classDistribution} height={250} />
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Recent Admissions */}
        <div className="dashboard-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">Recent Admissions</h3>
            </div>
            <a href="/institution/admissions" className="text-xs sm:text-sm text-primary hover:underline">View All</a>
          </div>
          <DataTable columns={admissionColumns} data={recentAdmissions} mobileCardView />
        </div>

        {/* Fee Collection */}
        <div className="dashboard-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              <h3 className="font-semibold text-sm sm:text-base">Fee Collection (in ₹M)</h3>
            </div>
          </div>
          <div className="chart-container-responsive">
            <BarChart data={feeCollection} color="hsl(var(--success))" height={250} />
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="dashboard-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-sm sm:text-base">Department Performance</h3>
          <a href="/institution/departments" className="text-xs sm:text-sm text-primary hover:underline">Manage Departments</a>
        </div>
        <DataTable columns={deptColumns} data={topPerformingDepts} mobileCardView />
      </div>
    </InstitutionLayout>
  );
}
