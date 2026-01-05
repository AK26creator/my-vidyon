# Lambda Deployment: The Ultra-Granular Step-by-Step Handbook 🧠

This guide provides an ultra-detailed, 7-step "click-by-click" procedure for every single Lambda function in your ERP. Follow this pattern for **EVERY** function listed below.

---

## 🛠️ Phase 1: The Master 7-Step Procedure
For **EVERY** row in the tables below, follow these exact 7 steps in the [AWS Lambda Console](https://console.aws.amazon.com/lambda):

### 1. Create the Function
- Click **"Create function"**.
- Select **"Author from scratch"**.
- **Function name**: (See Table)
- **Runtime**: `Node.js 20.x`
- **Architecture**: `x86_64`
- **Permissions**: Click "Change default execution role" -> **"Use an existing role"**.
- **Existing role**: `my-vidyon-lambda-role`.
- Click **"Create function"**.

### 2. Attach the Database Layer
- Scroll down to the **"Layers"** section.
- Click **"Add a layer"**.
- Choose **"Custom layers"**.
- Select **`my-vidyon-db-layer`** from the dropdown.
- Click **"Add"**.

### 3. Upload the Code
- In the "Code" tab, find the **"Code source"** editor.
- Open the local file (See Table) and **Copy All Content**.
- Paste it into the `index.mjs` file in the AWS editor.
- Click the **"Deploy"** button above the editor.

### 4. Configure Connections (Env Vars)
- Click the **"Configuration"** tab.
- Click **"Environment variables"** in the left sidebar.
- Click **"Edit"** -> **"Add environment variable"** (Repeat 4 times):
    - `DB_HOST` = [Your RDS endpoint]
    - `DB_NAME` = `myvidyon_erp`
    - `DB_USER` = `postgres`
    - `DB_PASSWORD` = [Your RDS password]
- Click **"Save"**.

### 5. Adjust Timeout
- In the **"Configuration"** tab, click **"General configuration"**.
- Click **"Edit"**. Set **Timeout** to `15 seconds`.
- Click **"Save"**.

### 6. Set Up the Test Event
- Click the **"Test"** tab next to "Code".
- **Event name**: `test`
- **Event JSON**: (See Table for the specific JSON to paste here).
- Click **"Save"**.

### 7. Run the Test
- Click the big orange **"Test"** button.
- Check the **"Execution result"**. You should see a green success message!

---

## 📜 Phase 2: Complete Function Deployment Map

### 🔐 1. Auth & Profile
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `auth-profile` | `lambda-functions/auth/profile.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "test-id" } } } }` |

### 🎓 2. Student Module
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `student-dashboard` | `lambda-functions/students/dashboard.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |
| `student-attendance`| `lambda-functions/students/attendance.js`| `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |
| `student-grades` | `lambda-functions/students/grades.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |
| `student-timetable` | `lambda-functions/students/timetable.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |
| `student-materials` | `lambda-functions/students/materials.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |
| `student-assignments`| `lambda-functions/students/assignments.js`| `{ "requestContext": { "authorizer": { "claims": { "sub": "student-uuid" } } } }` |

### 👨‍🏫 3. Faculty Module
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `faculty-dashboard` | `lambda-functions/faculty/dashboard.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "faculty-uuid" } } } }` |
| `faculty-attendance`| `lambda-functions/faculty/attendance.js`| `{ "body": "{\"classId\": \"1\", \"date\": \"2026-01-04\", \"students\": []}" }` |
| `faculty-marks` | `lambda-functions/faculty/marks.js` | `{ "body": "{\"examId\": \"1\", \"results\": []}" }` |
| `faculty-assignments`| `lambda-functions/faculty/assignments.js`| `{ "body": "{\"title\": \"HW1\"}" }` |
| `faculty-exams` | `lambda-functions/faculty/exams.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "faculty-uuid" } } } }` |
| `faculty-leave` | `lambda-functions/faculty/leave.js` | `{ "body": "{\"reason\": \"Medical\"}" }` |

### 🏫 4. Institution Module
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `inst-dashboard` | `lambda-functions/institution/dashboard.js`| `{ "requestContext": { "authorizer": { "claims": { "custom:institutionId": "id-123" } } } }` |
| `inst-users` | `lambda-functions/institution/users.js` | `{ "queryStringParameters": { "role": "faculty" }, "requestContext": { "authorizer": { "claims": { "custom:institutionId": "id-123" } } } }` |
| `inst-academics` | `lambda-functions/institution/academics.js`| `{ "requestContext": { "authorizer": { "claims": { "custom:institutionId": "id-123" } } } }` |
| `inst-fees` | `lambda-functions/institution/fees.js` | `{ "requestContext": { "authorizer": { "claims": { "custom:institutionId": "id-123" } } } }` |

### 🏢 5. Admin Module
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `admin-dashboard` | `lambda-functions/admin/dashboard.js` | `{ "requestContext": { "authorizer": { "claims": { "role": "admin" } } } }` |
| `admin-create-inst` | `lambda-functions/admin/create-institution.js`| `{ "body": "{\"name\": \"Demo\", \"plan\": \"gold\"}" }` |
| `admin-create-user` | `lambda-functions/admin/create-user.js` | `{ "body": "{\"email\": \"test@erp.com\", \"role\": \"admin\"}" }` |

### 👨‍👩‍👧 6. Parent Module
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `parent-dashboard` | `lambda-functions/parents/dashboard.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "parent-uuid" } } } }` |
| `parent-fees` | `lambda-functions/parents/fees.js` | `{ "requestContext": { "authorizer": { "claims": { "sub": "parent-uuid" } } } }` |
| `parent-child-info` | `lambda-functions/parents/child-info.js` | `{ "pathParameters": { "id": "child-uuid" } }` |

### 📦 7. Common Services
| Function Name | Local File Path | Test JSON (Paste in Step 6) |
| :--- | :--- | :--- |
| `common-upload-url` | `lambda-functions/common/file-upload.js` | `{ "body": "{\"fileName\": \"test.jpg\"}" }` |

---

> [!TIP]
> **Pro Tip**: Name your functions exactly as shown in the tables. This makes it trivial to connect them to the API Gateway in the next phase! village
