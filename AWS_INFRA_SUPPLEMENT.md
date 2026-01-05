# AWS Infrastructure Supplement: Beyond Lambda & API Gateway 🌐

While Lambda and API Gateway are the "engines," these other services act as the "security," "storage," and "identity" for your ERP system.

---

## 🔐 1. AWS Cognito (Identity)
Your app uses Cognito for login. To make the dashboards work, Cognito must store the **Institution ID** and **Role**.

### Custom Attributes Checklist:
Go to **Cognito User Pool** -> **User Pool Attributes**:
- [ ] **`custom:role`**: (String) Stores if the user is `admin`, `faculty`, `student`, etc.
- [ ] **`custom:institutionId`**: (String) Crucial for fetching the correct data for each campus.
- **Why?**: The dashboards use these attributes to filter data. Without them, the API won't know which school the user belongs to!

---

## 📦 2. AWS S3 (Storage)
Used for Study Materials, Student Assignments, and Institution Logos.

### Setup Checklist:
1.  **Create Bucket**: Name it something like `my-vidyon-erp-files`.
2.  **Enable CORS**: (IMPORTANT) In the S3 Console -> Permissions -> CORS, paste:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposedHeaders": ["ETag"]
    }
]
```
3.  **Folder Structure**:
    - `institutions/logos/`
    - `faculty/materials/`
    - `students/assignments/`

---

## 🛡️ 3. AWS IAM (Security)
Your Lambda functions need "permission" to talk to other services.

### Policy Checklist for `my-vidyon-lambda-role`:
Ensure your Lambda role has these permissions attached:
- [ ] **RDS Access**: To query the database.
- [ ] **S3 Access**: `s3:PutObject` and `s3:GetObject` for the file-upload function.
- [ ] **CloudWatch Logs**: `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` (to see errors).
- [ ] **Cognito Access**: `cognito-idp:AdminCreateUser` (required for the `admin-create-user` function).

---

## 📊 4. AWS CloudWatch (Monitoring)
If a page doesn't load or shows an error, CloudWatch is where you find the secret answer.

### How to use it:
1.  Go to **CloudWatch** -> **Logs** -> **Log Groups**.
2.  Search for the Lambda name (e.g., `/aws/lambda/student-dashboard`).
3.  Click the latest **Log Stream**.
4.  Look for any text in **RED** or starting with `ERROR`. This will tell you if you have a database connection problem or a coding error.

---

> [!IMPORTANT]
> **Production Tip**: For Cognito, ensure **Self-Signup** is **DISABLED**. Users should only be created by Admins via the `admin-create-user` Lambda to keep your ERP secure! village
