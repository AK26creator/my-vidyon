/**
 * API Service Layer
 * 
 * Centralized API client for all backend calls using AWS Amplify
 */

import { get, post, put, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_NAME = import.meta.env.VITE_API_NAME || 'MyVidyonERP';

/**
 * Generic API request function
 */
async function apiRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
): Promise<T> {
    try {
        // Get auth token
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        const options = {
            apiName: API_NAME,
            path,
            options: {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                ...(data && { body: data }),
            },
        };

        let response;
        switch (method) {
            case 'GET':
                response = await get(options);
                break;
            case 'POST':
                response = await post(options);
                break;
            case 'PUT':
                response = await put(options);
                break;
            case 'DELETE':
                response = await del(options);
                break;
        }

        const result = await response.response;
        return (await result.body.json()) as T;
    } catch (error: any) {
        console.error(`API Error [${method} ${path}]:`, error);
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
    }
}

// =====================================================
// AUTHENTICATION API
// =====================================================
export const authAPI = {
    getMe: () => apiRequest('GET', '/auth/me'),
    updateProfile: (data: any) => apiRequest('PUT', '/auth/me', data),
};

// =====================================================
// STUDENT API
// =====================================================
export const studentAPI = {
    getDashboard: () => apiRequest('GET', '/students/dashboard'),
    getCourses: () => apiRequest('GET', '/students/courses'),
    getAttendance: (params?: any) => apiRequest('GET', `/students/attendance${params ? `?${new URLSearchParams(params)}` : ''}`),
    getAssignments: () => apiRequest('GET', '/students/assignments'),
    getAssignment: (id: string) => apiRequest('GET', `/students/assignments/${id}`),
    submitAssignment: (id: string, data: any) => apiRequest('POST', `/students/assignments/${id}/submit`, data),
    getGrades: () => apiRequest('GET', '/students/grades'),
    getTimetable: () => apiRequest('GET', '/students/timetable'),
    getMaterials: () => apiRequest('GET', '/students/materials'),
    getCertificates: () => apiRequest('GET', '/students/certificates'),
    getNotifications: () => apiRequest('GET', '/students/notifications'),
    markNotificationRead: (id: string) => apiRequest('PUT', `/students/notifications/${id}/read`),
};

// =====================================================
// FACULTY API
// =====================================================
export const facultyAPI = {
    getDashboard: () => apiRequest('GET', '/faculty/dashboard'),
    getCourses: () => apiRequest('GET', '/faculty/courses'),
    getStudents: () => apiRequest('GET', '/faculty/students'),
    markAttendance: (data: any) => apiRequest('POST', '/faculty/attendance', data),
    getAttendance: (params?: any) => apiRequest('GET', `/faculty/attendance${params ? `?${new URLSearchParams(params)}` : ''}`),
    createAssignment: (data: any) => apiRequest('POST', '/faculty/assignments', data),
    getAssignments: () => apiRequest('GET', '/faculty/assignments'),
    updateAssignment: (id: string, data: any) => apiRequest('PUT', `/faculty/assignments/${id}`, data),
    deleteAssignment: (id: string) => apiRequest('DELETE', `/faculty/assignments/${id}`),
    getSubmissions: (assignmentId: string) => apiRequest('GET', `/faculty/assignments/${assignmentId}/submissions`),
    gradeSubmission: (assignmentId: string, data: any) => apiRequest('POST', `/faculty/assignments/${assignmentId}/grade`, data),
    addMarks: (data: any) => apiRequest('POST', '/faculty/marks', data),
    getMarks: (params?: any) => apiRequest('GET', `/faculty/marks${params ? `?${new URLSearchParams(params)}` : ''}`),
    getExams: () => apiRequest('GET', '/faculty/exams'),
    createExam: (data: any) => apiRequest('POST', '/faculty/exams', data),
    getLeaves: () => apiRequest('GET', '/faculty/leave'),
    requestLeave: (data: any) => apiRequest('POST', '/faculty/leave', data),
    createAnnouncement: (data: any) => apiRequest('POST', '/faculty/announcements', data),
    getAnnouncements: () => apiRequest('GET', '/faculty/announcements'),
    uploadMaterial: (data: any) => apiRequest('POST', '/faculty/materials', data),
    getMaterials: () => apiRequest('GET', '/faculty/materials'),
};

// =====================================================
// INSTITUTION API
// =====================================================
export const institutionAPI = {
    getDashboard: () => apiRequest('GET', '/institution/dashboard'),
    getAcademics: () => apiRequest('GET', '/institution/acad'),
    createAcademicEntity: (data: any) => apiRequest('POST', '/institution/acad', data),
    getUsers: (role?: string) => apiRequest('GET', `/institution/users${role ? `?role=${role}` : ''}`),
    addUser: (data: any) => apiRequest('POST', '/institution/users', data),
    getFees: () => apiRequest('GET', '/institution/fees'),
    createFeeStructure: (data: any) => apiRequest('POST', '/institution/fees', data),
    getAnalytics: () => apiRequest('GET', '/institution/analytics'),
    getReports: (params?: any) => apiRequest('GET', `/institution/reports${params ? `?${new URLSearchParams(params)}` : ''}`),
    createAnnouncement: (data: any) => apiRequest('POST', '/institution/announcements', data),
};

// =====================================================
// ADMIN API
// =====================================================
export const adminAPI = {
    getDashboard: () => apiRequest('GET', '/admin/dashboard'),
    getInstitutions: () => apiRequest('GET', '/admin/institutions'),
    createInstitution: (data: any) => apiRequest('POST', '/admin/institutions', data),
    getInstitution: (id: string) => apiRequest('GET', `/admin/institutions/${id}`),
    updateInstitution: (id: string, data: any) => apiRequest('PUT', `/admin/institutions/${id}`, data),
    deleteInstitution: (id: string) => apiRequest('DELETE', `/admin/institutions/${id}`),
    getUsers: (params?: any) => apiRequest('GET', `/admin/users${params ? `?${new URLSearchParams(params)}` : ''}`),
    getAnalytics: () => apiRequest('GET', '/admin/analytics'),
};

// =====================================================
// PARENT API
// =====================================================
export const parentAPI = {
    getDashboard: () => apiRequest('GET', '/parents/dashboard'),
    getChildren: () => apiRequest('GET', '/parents/children'),
    getChildInfo: (studentId: string) => apiRequest('GET', `/parents/child-info/${studentId}`),
    getFees: () => apiRequest('GET', '/parents/fees'),
    payFee: (data: any) => apiRequest('POST', '/parents/fees', data),
    requestLeave: (data: any) => apiRequest('POST', '/parents/leave-requests', data),
    getNotifications: () => apiRequest('GET', '/parents/notifications'),
};

// =====================================================
// FILE UPLOAD API
// =====================================================
export const uploadAPI = {
    getPresignedUrl: (data: { fileName: string; fileType: string; folder: string }) =>
        apiRequest<{ uploadUrl: string; fileKey: string }>('POST', '/upload/presigned-url', data),
};

export default {
    auth: authAPI,
    student: studentAPI,
    faculty: facultyAPI,
    institution: institutionAPI,
    admin: adminAPI,
    parent: parentAPI,
    upload: uploadAPI,
};
