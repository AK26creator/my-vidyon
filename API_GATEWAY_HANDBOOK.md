# API Gateway: The Ultra-Granular Step-by-Step Guide 🚪

This Point-and-Click guide ensures your frontend can talk to the backend. The endpoints are ordered to match your project's main structure.

---

## 🏗️ Phase 1: Core Architecture Folders
In the API Gateway Console, select your API and create these top-level "Folders" (Resources):

1.  Select the **Root (/)**.
2.  Click **"Create Resource"**.
3.  Create each of these names: `auth`, `students`, `faculty`, `institution`, `admin`, `parents`, `common`.
    - *These will hold all your endpoints.*

---

## 🛠️ Phase 2: Adding an Endpoint (The 6-Step Click)
Apply these 6 steps for **EVERY** row in the tables below:

1. **Path**: Select the "Parent Folder" and click **"Create Resource"** to add the specific path.
2. **Method**: Select the new path, click **"Create Method"**, and connect to the Lambda.
3. **CORS**: Select the path, click **"Enable CORS"**, and click **"Save"**.
4. **Auth**: Click the Method (GET/POST) -> **Method Request** -> Select your **CognitoAuthorizer**.
5. **Proxy**: Ensure **"Lambda Proxy Integration"** is Checked.
6. **Live**: Click **"Deploy API"** -> Stage: `prod`.

---

## 📜 Phase 3: The Complete Endpoint Map

### 🔐 1. Auth API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `auth` | `me` | `GET` | `auth-profile` |

### 🎓 2. Student API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `students` | `dashboard` | `GET` | `student-dashboard` |
| `students` | `attendance` | `GET` | `student-attendance` |
| `students` | `grades` | `GET` | `student-grades` |
| `students` | `timetable` | `GET` | `student-timetable` |
| `students` | `materials` | `GET` | `student-materials` |
| `students` | `assignments` | `GET` | `student-assignments` |

### 👨‍🏫 3. Faculty API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | : :--- | :--- |
| `faculty` | `dashboard` | `GET` | `faculty-dashboard` |
| `faculty` | `attendance` | `POST` | `faculty-attendance` |
| `faculty` | `marks` | `POST` | `faculty-marks` |
| `faculty` | `assignments` | `POST` | `faculty-assignments` |
| `faculty` | `exams` | `GET` | `faculty-exams` |
| `faculty` | `leave` | `POST` | `faculty-leave` |

### 🏫 4. Institution API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `institution` | `dashboard` | `GET` | `inst-dashboard` |
| `institution` | `users` | `GET` | `inst-users` |
| `institution` | `acad` | `GET` | `inst-academics` |
| `institution` | `fees` | `GET` | `inst-fees` |

### 🏢 5. Admin API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `admin` | `dashboard` | `GET` | `admin-dashboard` |
| `admin` | `institutions` | `POST` | `admin-create-institution` |
| `admin` | `users` | `POST` | `admin-create-user` |

### 👨‍👩‍👧 6. Parent API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `parents` | `dashboard` | `GET` | `parent-dashboard` |
| `parents` | `fees` | `GET` | `parent-fees` |
| `parents` | `child` | *Create Folder* | *Next step below* |
| `parents/child`| `{id}` | `GET` | `parent-child-info` |

### 📦 7. Common API
| Parent Folder | New Resource | Method | Connect to Lambda |
| :--- | :--- | :--- | :--- |
| `common` | `upload-url` | `POST` | `common-upload-url` |

---

> [!IMPORTANT]
> **Deployment Reminder**: Your changes are NOT live until you click **"Deploy API"**. If the frontend gets an error, try deploying the API one more time! village
