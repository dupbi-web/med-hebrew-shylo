import os
import time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gmail config
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


def get_users_without_terms():
    """
    Fetch users who did not accept terms + their emails
    """

    # 1️⃣ Get users who didn't accept terms
    consent_res = (
        supabase
        .table("user_consent")
        .select("user_id")
        .eq("terms_accepted", False)
        .execute()
    )

    if not consent_res.data:
        return []

    user_ids = {row["user_id"] for row in consent_res.data}

    # 2️⃣ Get all auth users (admin API)
    auth_users = supabase.auth.admin.list_users()

    # 3️⃣ Match IDs → emails
    users_without_terms = [
        {
            "user_id": user.id,
            "email": user.email
        }
        for user in auth_users
        if user.id in user_ids
    ]

    return users_without_terms



def build_email_html():
    return """
    <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:30px auto;background:#ffffff;
                  padding:30px;border-radius:8px;">

        <h2 style="color:#2b6777;">Finish Your Med-Ivrit Journey! 👋</h2>

        <p style="font-size:16px;color:#333;">
          Hi there! Thank you for joining <strong>Med-Ivrit</strong>.
        </p>

        <p style="font-size:16px;color:#333;">
          You’re just one step away from starting your Hebrew learning journey 🇮🇱📚.
          Complete your registration now to:
        </p>

        <ul style="font-size:16px;color:#333;line-height:1.6;">
          <li>Track your learning progress easily</li>
          <li>Access personalized lessons and resources</li>
          <li>Be part of our growing Med-Ivrit community</li>
        </ul>

        <p style="font-size:16px;color:#333;">
          Don’t miss out — finish your registration today and start learning Hebrew the fun way!
        </p>

        <div style="text-align:center;margin:30px 0;">
          <a href="https://med-ivrit.netlify.app"
             style="background:#2b6777;color:white;
                    padding:12px 22px;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:16px;">
            Finish Registration
          </a>
        </div>

        <p style="font-size:14px;color:#777;">
          If you did not mean to sign up, you can safely ignore this email.
        </p>

        <p style="font-size:14px;color:#777;">
          — The Med-Ivrit Team
        </p>

      </div>
    </body>
    </html>
    """

def send_email(to_email):
    msg = MIMEMultipart("alternative")
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = "Welcome to Med-Ivrit – Finish your registration 🇮🇱"

    msg.attach(MIMEText(build_email_html(), "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_PASSWORD)
        server.send_message(msg)

def send_email_test(to_email):
    msg = MIMEMultipart("alternative")
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = "Welcome to Med-Ivrit – Finish your registration 🇮🇱"

    msg.attach(MIMEText(build_email_html(), "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_PASSWORD)
        server.send_message(msg)

def main():
    users = get_users_without_terms()

    if not users:
        print("No users found.")
        return

    print(f"Sending emails to {len(users)} users...\n")

    for user in users:
        print(f"Sending email to: {user['email']}")
        send_email(user["email"])

        # Google-safe rate limit
        time.sleep(5)

    print("\nDone ✅")


if __name__ == "__main__":
    main()
