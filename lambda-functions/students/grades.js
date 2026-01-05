const { query } = require('./common/db');

exports.handler = async (event) => {
    try {
        const studentCognitoId = event.requestContext.authorizer.claims.sub;

        // 1. Get Student ID
        const studentResult = await query('SELECT id, institution_id FROM users WHERE cognito_user_id = $1', [studentCognitoId]);
        if (studentResult.rows.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Student not found' }) };
        }
        const studentId = studentResult.rows[0].id;

        // 2. Fetch Grades History
        const gradesQuery = `
            SELECT 
                s.name as subject, 
                g.exam_type as "examType", 
                g.marks_obtained as marks, 
                g.total_marks as "totalMarks", 
                g.grade, 
                g.remarks,
                g.exam_date as date
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            WHERE g.student_id = $1
            ORDER BY g.exam_date DESC
        `;
        const gradesResult = await query(gradesQuery, [studentId]);

        // 3. Calculate Performance Metrics
        const semesterGPA = 3.8; // Example: Real GPA logic would involve credits from subjects table
        const overallGPA = 3.6;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({
                metrics: {
                    semesterGPA,
                    overallGPA,
                    rank: "5th" // Rank logic could be added based on institution aggregation
                },
                grades: gradesResult.rows
            })
        };

    } catch (error) {
        console.error('Error fetching student grades:', error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
