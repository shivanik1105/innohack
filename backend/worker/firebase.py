import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("C:/Users/shivani/OneDrive/Desktop/innohack_card/project/backend/worker-2261e-firebase-adminsdk-fbsvc-868ba499bf.json")
firebase_admin.initialize_app(cred)