import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - Medical Terms Game</title>
        <meta name="description" content="Terms and conditions for using our medical terminology learning platform." />
      </Helmet>

      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these terms, please do not use this
              service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Permission is granted to temporarily use this website for personal, non-commercial learning
              purposes only. This is the grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Educational Purpose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This platform is designed for educational purposes to help healthcare professionals and
              students learn medical terminology. The content should not be used as a substitute for
              professional medical advice, diagnosis, or treatment.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>When you create an account with us, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Collect user information without consent</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              All content on this website, including text, graphics, logos, and software, is the
              property of the website owner or its content suppliers and is protected by international
              copyright laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The materials on this website are provided on an 'as is' basis. We make no warranties,
              expressed or implied, and hereby disclaim all other warranties including, without
              limitation, implied warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              In no event shall we or our suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit) arising out of the use or inability to use
              the materials on this website.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Accuracy of Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While we strive to provide accurate medical terminology, we do not warrant that the
              materials are completely accurate, reliable, or error-free. Always verify critical
              information with authoritative medical sources.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Modifications to Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify or discontinue the service at any time without notice. We
              shall not be liable to you or any third party for any modification, suspension, or
              discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may terminate or suspend your account and access to the service immediately, without
              prior notice, for conduct that we believe violates these Terms or is harmful to other users,
              us, or third parties, or for any other reason.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These terms shall be governed by and construed in accordance with applicable laws, and you
              irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to revise these terms at any time. By continuing to use the service
              after revisions become effective, you agree to be bound by the revised terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Terms;
