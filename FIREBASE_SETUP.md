# Firebase Setup Instructions

## 🔐 Setting up Firebase Credentials

### Step 1: Create Firebase Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### Step 2: Setup Credentials in Your Project

1. **Copy the downloaded JSON file** to `project/backend/firebase_key.json`
2. **Use the template** provided in `project/backend/firebase_key.json.template` as a reference
3. **Never commit** the actual `firebase_key.json` file to Git (it's already in .gitignore)

### Step 3: Verify Setup

The backend will automatically detect the Firebase credentials file and use it for:
- User authentication
- Database operations
- File storage

### 🚨 Security Notes

- ✅ The actual `firebase_key.json` is excluded from Git via `.gitignore`
- ✅ GitHub push protection will block any accidental commits of credentials
- ✅ Use environment variables in production instead of JSON files
- ✅ Rotate your service account keys regularly

### Environment Variables (Production)

For production deployment, use these environment variables instead:

```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com
```

### Troubleshooting

If you see the warning "⚠️ AI/ML OCR service not available", it means:
- The Firebase credentials are not properly configured
- The system is using mock OCR for testing
- This is normal for development without Firebase setup
