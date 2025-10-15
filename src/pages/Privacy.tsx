import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Medical Terms Game</title>
        <meta name="description" content="Our privacy policy and GDPR compliance information." />
      </Helmet>

      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Privacy Policy explains how we collect, use, and protect your personal data in
              compliance with the General Data Protection Regulation (GDPR) and other applicable
              privacy laws.
            </p>
            <p>
              We are committed to protecting your privacy and ensuring you have a positive experience
              on our website.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">2.1 Account Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address (for authentication)</li>
                <li>User ID (automatically generated)</li>
                <li>Account creation date</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2.2 Learning Progress Data</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Words marked as mastered</li>
                <li>Learning statistics and progress</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2.3 Consent Records</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your consent preferences</li>
                <li>Consent timestamps</li>
                <li>User agent (optional, for consent verification)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use your personal data only for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Provision:</strong> To provide and maintain our medical terminology learning platform</li>
              <li><strong>Authentication:</strong> To verify your identity and secure your account</li>
              <li><strong>Progress Tracking:</strong> To save and display your learning progress</li>
              <li><strong>Communication:</strong> To send you important service updates (only with your consent for marketing)</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Legal Basis for Processing (GDPR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We process your personal data based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consent:</strong> You have given explicit consent for specific processing activities</li>
              <li><strong>Contract:</strong> Processing is necessary to provide our service</li>
              <li><strong>Legal Obligation:</strong> We must process data to comply with the law</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data at rest and in transit (TLS/SSL)</li>
              <li>Secure authentication via Supabase</li>
              <li>Regular security updates and monitoring</li>
              <li>Access controls and authentication</li>
              <li>Row-level security (RLS) on database tables</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Your GDPR Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              <li><strong>Right to Object:</strong> Object to certain types of processing</li>
            </ul>
            <p className="mt-4">
              You can exercise these rights from your <a href="/profile" className="text-primary hover:underline">Profile Settings</a> page.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We retain your personal data only as long as necessary for the purposes outlined in this
              policy or as required by law. When you request account deletion, we will delete your data
              within 30 days, except where we have a legal obligation to retain it.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication (GDPR compliant)</li>
            </ul>
            <p>These services have their own privacy policies and are GDPR compliant.</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your data may be transferred to and processed in countries outside the European Economic
              Area (EEA). We ensure appropriate safeguards are in place for such transfers in accordance
              with GDPR requirements.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant
              changes via email or through a notice on our website.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your GDPR rights,
              please contact us through the <a href="/ContactUs" className="text-primary hover:underline">Contact Us</a> page.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Privacy;
