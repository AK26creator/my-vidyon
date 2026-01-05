import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  Plus,
  ArrowRight,
  Shield,
  BarChart3,
  Loader2
} from 'lucide-react';

const recentActivities = [
  { id: 1, action: 'New Institution Registered', target: 'St. Mary\'s High School', time: '2 hours ago', type: 'success' },
  { id: 2, action: 'Subscription Payment', target: 'Green Valley School', time: '5 hours ago', type: 'info' },
  { id: 3, action: 'User Report', target: 'Access Issue (Ticket #402)', time: '1 day ago', type: 'warning' },
  { id: 4, action: 'Institution Audit', target: 'Complience Check', time: '2 days ago', type: 'default' },
  { id: 5, action: 'License Expiring', target: 'City Public School', time: '3 days ago', type: 'destructive' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await adminAPI.getDashboard();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activityColumns = [
    { key: 'action', header: 'Activity' },
    { key: 'target', header: 'Entity' },
    { key: 'time', header: 'Time' },
    {
      key: 'type',
      header: 'Status',
      render: (item: typeof recentActivities[0]) => {
        const variants: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'default'> = {
          success: 'success',
          info: 'info',
          warning: 'warning',
          destructive: 'destructive',
          default: 'default',
        };
        return <Badge variant={variants[item.type]}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Badge>;
      },
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Overview of all institutions and platform metrics"
        actions={
          <Button className="btn-primary flex items-center gap-2" onClick={() => navigate('/admin/institutions')}>
            <Building2 className="w-4 h-4" />
            <span>Manage Institutions</span>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="stats-grid mb-6 sm:mb-8">
        <StatCard
          title="Total Institutions"
          value={data?.totalInstitutions || '0'}
          icon={Building2}
          iconColor="text-primary"
          change={`${data?.activeSubscriptions || 0} Active`}
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={data?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          iconColor="text-success"
          change={`${data?.totalStudents?.toLocaleString() || 0} Students`}
          changeType="positive"
        />
        <StatCard
          title="Platform Revenue"
          value={`₹${(parseFloat(data?.totalRevenue || 0) / 100000).toFixed(1)}L`}
          icon={CreditCard}
          iconColor="text-warning"
          change="Real-time collection"
          changeType="positive"
        />
        <StatCard
          title="System Health"
          value="99.9%"
          icon={Activity}
          iconColor="text-info"
          change="All systems operational"
          changeType="positive"
        />
      </div>

      {/* Quick Actions Grid */}
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate('/admin/add-institution')}>
          <Building2 className="w-8 h-8 text-primary" />
          <span>Add Institution</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate('/admin/users')}>
          <Users className="w-8 h-8 text-success" />
          <span>User Management</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate('/admin/reports')}>
          <BarChart3 className="w-8 h-8 text-info" />
          <span>View Analytics</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate('/admin/settings')}>
          <Shield className="w-8 h-8 text-warning" />
          <span>Platform Settings</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 dashboard-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base">Recent Platform Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary">View All Logs</Button>
          </div>
          <DataTable columns={activityColumns} data={recentActivities} mobileCardView />
        </div>

        {/* System Alerts / Pending Approvals */}
        <div className="space-y-6">
          <div className="dashboard-card p-4 sm:p-6">
            <h3 className="font-semibold text-base mb-4">Pending Requests</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">New Institution Request</p>
                  <p className="text-xs text-muted-foreground">Sunrise Academy</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">License Renewal</p>
                  <p className="text-xs text-muted-foreground">RPC School (Expires in 2d)</p>
                </div>
                <Button size="sm" variant="outline">Action</Button>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-4 sm:p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-base mb-2 text-primary">System Note</h3>
            <p className="text-sm text-muted-foreground">
              Scheduled maintenance on Saturday 12:00 AM - 02:00 AM IST. Please notify all institution admins.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
