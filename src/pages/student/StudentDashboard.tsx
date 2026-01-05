import { useState, useEffect } from 'react';
import { StudentLayout } from '@/layouts/StudentLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { AssignmentCard } from '@/components/cards/AssignmentCard';
import { NotificationCard } from '@/components/cards/NotificationCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationContext';
import { studentAPI } from '@/services/api';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';

const enrolledSubjects = [
  { title: 'Mathematics', code: 'Grade 10', instructor: 'Dr. Smith', progress: 75, students: 45, schedule: 'Mon, Wed 10:00 AM' },
  { title: 'Chemistry', code: 'Grade 10', instructor: 'Mrs. Sharma', progress: 60, students: 52, schedule: 'Tue, Thu 2:00 PM' },
  { title: 'English', code: 'Grade 10', instructor: 'Ms. Davis', progress: 85, students: 38, schedule: 'Mon, Fri 11:00 AM' },
];

const upcomingAssignments = [
  { title: 'Algebra Homework', course: 'Mathematics', dueDate: 'Dec 22, 2025', status: 'pending' as const },
  { title: 'Periodic Table Project', course: 'Chemistry', dueDate: 'Dec 20, 2025', status: 'submitted' as const },
  { title: 'Poetry Analysis', course: 'English', dueDate: 'Dec 18, 2025', status: 'graded' as const, grade: '95', maxGrade: '100' },
];

const notifications = [
  { title: 'Assignment Graded', message: 'Your Shakespeare Essay has been graded. You scored 95/100.', type: 'success' as const, time: '2 hours ago' },
  { title: 'New Material Uploaded', message: 'New study material for Mathematics have been uploaded.', type: 'info' as const, time: '5 hours ago' },
  { title: 'Exam Reminder', message: 'Your Unit Test - II for Mathematics is scheduled for next Monday.', type: 'warning' as const, time: '1 day ago' },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await studentAPI.getDashboard();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  // Format attendance data for chart
  const attendanceChartData = data?.attendanceHistory?.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: item.status === 'present' ? 100 : 0
  })) || [];

  return (
    <StudentLayout>
      <PageHeader
        title={`${t.common.welcome}, ${user?.name.split(' ')[0]}!`}
        subtitle={t.dashboard.overview}
      />

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="stats-grid mb-6 sm:mb-8">
        <StatCard
          title="Subjects"
          value={data?.activeCourses || 0}
          icon={BookOpen}
          iconColor="text-student"
          change="Academic Year 2025"
        />
        <StatCard
          title="Attendance Rate"
          value={`${data?.totalAttendance || 0}%`}
          icon={CheckCircle}
          iconColor="text-success"
          change="Real-time tracking"
          changeType="positive"
        />
        <StatCard
          title="Upcoming Exams"
          value={data?.examsCount || 0}
          icon={TrendingUp}
          iconColor="text-primary"
          change="Next 30 days"
          changeType="positive"
        />
        <StatCard
          title="Pending Tasks"
          value={data?.pendingAssignments || 0}
          icon={Clock}
          iconColor="text-warning"
          change="Assignments due"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2 dashboard-card p-4 sm:p-6">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Recent Attendance</h3>
          <div className="chart-container-responsive">
            <AreaChart data={attendanceChartData.length > 0 ? attendanceChartData : []} color="hsl(var(--student))" height={220} />
          </div>
        </div>
        <div className="dashboard-card p-4 sm:p-6">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Recent Grades</h3>
          <div className="space-y-4">
            {data?.recentGrades?.length > 0 ? (
              data.recentGrades.map((grade: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{grade.subject}</p>
                    <p className="text-xs text-muted-foreground">{grade.exam_type}</p>
                  </div>
                  <Badge variant={grade.marks_obtained / grade.total_marks >= 0.7 ? 'success' : 'warning'}>
                    {grade.marks_obtained}/{grade.total_marks}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent grades</p>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Courses */}
        <div className="mb-6 sm:mb-8 xl:col-span-2 xl:mb-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base">My Subjects</h3>
            <a href="/student/courses" className="text-xs sm:text-sm text-primary hover:underline">View All</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
            {enrolledSubjects.map((course) => (
              <CourseCard key={course.code} {...course} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Events */}
          <div className="dashboard-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">Upcoming Events</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-center flex-shrink-0">
                  <div className="text-base sm:text-lg font-bold text-primary">22</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Dec</div>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Unit Test: Mathematics</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Class 10-A • 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                <div className="text-center flex-shrink-0">
                  <div className="text-base sm:text-lg font-bold text-primary">25</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Dec</div>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Science Fair</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Auditorium • 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Assignments</h3>
              <a href="/student/assignments" className="text-xs sm:text-sm text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {upcomingAssignments.map((assignment, index) => (
                <AssignmentCard key={index} {...assignment} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 sm:mt-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-sm sm:text-base">Recent Notifications</h3>
          <a href="/student/notifications" className="text-xs sm:text-sm text-primary hover:underline">View All</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {notifications.map((notification, index) => (
            <NotificationCard key={index} {...notification} />
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
