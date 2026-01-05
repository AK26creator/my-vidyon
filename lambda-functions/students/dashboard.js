/**
 * Lambda function: Get Student Dashboard Data
 * Endpoint: GET /students/dashboard
 */

const { query } = require('./common/db'); // Path adjusted for Lambda root

exports.handler = async (event) => {
    try {
        // Extract user info from Cognito authorizer context
        const userId = event.requestContext.authorizer.claims.sub;
        const userEmail = event.requestContext.authorizer.claims.email;
        const institutionId = event.requestContext.authorizer.claims['custom:institutionId'];

        console.log(`Dashboard request for user: ${userEmail}`);

        // Fetch student data from database
        const userResult = await query(
            'SELECT id, name, role, institution_id FROM users WHERE cognito_user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers: corsHeaders(),
                body: JSON.stringify({ error: 'User not found' }),
            };
        }

        const user = userResult.rows[0];

        // Get dashboard metrics
        const metricsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM enrollments WHERE student_id = $1) as total_subjects,
        (SELECT ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END)) 
         FROM attendance WHERE student_id = $1) as attendance_rate,
        (SELECT ROUND(AVG(percentage)) 
         FROM grades WHERE student_id = $1) as overall_percentage,
        (SELECT COUNT(*) FROM assignment_submissions 
         WHERE student_id = $1 AND status = 'pending') as pending_assignments
    `;

        const metricsResult = await query(metricsQuery, [user.id]);
        const metrics = metricsResult.rows[0];

        // Get enrolled courses
        const coursesQuery = `
      SELECT s.id, s.name, s.code, c.name as class_name, c.section
      FROM subjects s
      JOIN enrollments e ON s.id = e.subject_id
      JOIN classes c ON e.class_id = c.id
      WHERE e.student_id = $1
      LIMIT 5
    `;

        const coursesResult = await query(coursesQuery, [user.id]);

        // Get recent attendance
        const attendanceQuery = `
      SELECT a.attendance_date, a.status, s.name as subject_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = $1
      ORDER BY a.attendance_date DESC
      LIMIT 10
    `;

        const attendanceResult = await query(attendanceQuery, [user.id]);

        // Get recent notifications
        const notificationsQuery = `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;

        const notificationsResult = await query(notificationsQuery, [user.id]);

        // Return dashboard data
        return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify({
                user: {
                    name: user.name,
                    role: user.role,
                },
                metrics: {
                    totalSubjects: parseInt(metrics.total_subjects) || 0,
                    attendanceRate: parseInt(metrics.attendance_rate) || 0,
                    overallPercentage: parseInt(metrics.overall_percentage) || 0,
                    pendingAssignments: parseInt(metrics.pending_assignments) || 0,
                },
                courses: coursesResult.rows,
                recentAttendance: attendanceResult.rows,
                notifications: notificationsResult.rows,
            }),
        };
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return {
            statusCode: 500,
            headers: corsHeaders(),
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
        };
    }
};

function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    };
}
