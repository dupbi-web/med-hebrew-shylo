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
              service. You must be at least 13 years old (or 16 years old if you are in the European Union) 
              to use this service.
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
              <li>Use the materials for commercial purposes without written permission</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person or entity</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Educational Purpose and Content Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This platform is designed for educational purposes to help healthcare professionals and
              students learn medical terminology. The content should not be used as a substitute for
              professional medical advice, diagnosis, or treatment.
            </p>
            <p className="font-semibold">
              IMPORTANT: Translation and AI-Generated Content Disclaimer
            </p>
            <p>
              We provide medical terminology translations in Hebrew, Russian, and English, as well as 
              AI-generated example sentences. While we strive for accuracy, we make NO WARRANTIES 
              regarding the accuracy, completeness, or reliability of any translations or AI-generated 
              content on this platform. Translations may contain errors, and AI-generated sentences may 
              be inaccurate, misleading, or contextually inappropriate.
            </p>
            <p>
              YOU ASSUME ALL RESPONSIBILITY for verifying the accuracy of any translations or AI-generated 
              content before using them in any medical, clinical, educational, or professional setting. 
              We expressly disclaim all liability for any errors, omissions, or damages arising from the 
              use of translations or AI-generated content on this platform. Always consult authoritative 
              medical dictionaries, professional translators, and qualified medical professionals to verify 
              critical information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. User Accounts and Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We offer two methods for creating an account and accessing our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google OAuth Authentication:</strong> By creating an account through Google, you 
                authorize us to access and store your Google account information (name, email, profile 
                picture) as provided through Google's authentication service. You must comply with Google's 
                Terms of Service and policies when using this method.
              </li>
              <li>
                <strong>Email and Password Registration:</strong> You may also create an account directly 
                with us using your email address and a password. This account is managed through our 
                authentication provider, Supabase.
              </li>
            </ul>
            <p>When you create an account with us through either method, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Be responsible for all activities that occur under your account</li>
              <li>Not share your account credentials with others</li>
            </ul>
            <p>
              You have the right to request account deletion at any time through your profile settings. 
              Upon receiving your deletion request, we will process it within 30 days as required by 
              applicable data protection laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any systems, accounts, or networks</li>
              <li>Interfere with, disrupt, or compromise the service or its infrastructure</li>
              <li>Upload malicious code, viruses, or harmful software</li>
              <li>Harass, abuse, threaten, or harm other users</li>
              <li>Collect or store user information without explicit consent</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Use automated systems (bots, scrapers) without written permission</li>
              <li>Distribute, republish, or commercially exploit our content without permission</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              All content on this website, including text, graphics, logos, word databases, translations, 
              software code, and AI-generated content, is the property of the website owner or its content 
              suppliers and is protected by international copyright laws and intellectual property rights.
            </p>
            <p>
              <strong>User-Generated Content:</strong> Any data you create or input (such as marking words 
              as mastered or learning progress) remains your property. By using our service, you grant us 
              a limited, non-exclusive license to store and process this data solely for the purpose of 
              providing the service to you.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE MAKE NO WARRANTIES, 
              EXPRESSED OR IMPLIED, AND HEREBY DISCLAIM ALL OTHER WARRANTIES INCLUDING, WITHOUT LIMITATION:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Implied warranties of merchantability or fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Accuracy, completeness, or reliability of content, translations, or AI-generated text</li>
              <li>Uninterrupted, secure, or error-free operation of the service</li>
              <li>Correction of defects or errors</li>
            </ul>
            <p>
              We do not warrant that the service will meet your requirements or that any results obtained 
              from using the service will be accurate or reliable.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE, OUR OFFICERS, 
              DIRECTORS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Service interruptions or data loss</li>
              <li>Errors in translations or AI-generated content</li>
              <li>Reliance on inaccurate information provided through the service</li>
              <li>Damages arising from use or inability to use the service</li>
              <li>Unauthorized access to or alteration of your data</li>
            </ul>
            <p>
              This limitation applies whether the alleged liability is based on contract, tort, negligence, 
              strict liability, or any other basis, even if we have been advised of the possibility of such 
              damage.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Accuracy of Materials and Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While we strive to provide accurate medical terminology, translations, and AI-generated 
              examples, we do not warrant that the materials are completely accurate, reliable, or 
              error-free. Medical terminology is complex and context-dependent, and translations between 
              languages may not capture all nuances.
            </p>
            <p>
              <strong>You are solely responsible for verifying all critical information with authoritative 
              medical sources, professional translators, and qualified medical professionals.</strong> Never 
              use this platform as the sole source for medical terminology in clinical or professional 
              settings.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our service relies on third-party providers for essential functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google OAuth:</strong> For user authentication and account management (optional login method)</li>
              <li><strong>Supabase:</strong> For database hosting, data storage, and authentication services (US East region)</li>
              <li><strong>Netlify:</strong> For website hosting and serverless functions</li>
            </ul>
            <p>
              Your use of these third-party services is subject to their respective terms of service and 
              privacy policies. We are not responsible for the practices, policies, or actions of these 
              third-party providers. Service availability may be affected by these providers' uptime, 
              maintenance, or technical issues.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Modifications to Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify, suspend, or discontinue the service (or any part thereof) at 
              any time with or without notice. We may add, remove, or modify features, content, or 
              functionality. We shall not be liable to you or any third party for any modification, 
              suspension, or discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior 
              notice or liability, for conduct that we believe:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates these Terms and Conditions</li>
              <li>Is harmful to other users, us, or third parties</li>
              <li>Violates applicable laws or regulations</li>
              <li>Involves fraudulent or suspicious activity</li>
            </ul>
            <p>
              You may terminate your account at any time by submitting a deletion request through your 
              profile settings. Upon termination, your right to use the service will immediately cease, 
              and we will delete your personal data in accordance with our Privacy Policy and applicable 
              data protection laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>13. Governing Law and Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of 
              the State of Israel, without regard to its conflict of law provisions. You irrevocably submit 
              to the exclusive jurisdiction of the courts located in Israel for the resolution of any 
              disputes arising from or related to these terms or your use of the service.
            </p>
            <p>
              For users in the European Union, nothing in this clause affects your rights under mandatory 
              consumer protection laws, including your right to bring proceedings in your country of 
              residence.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>14. Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You agree to indemnify, defend, and hold harmless the website owner, its officers, directors, 
              employees, and agents from any claims, liabilities, damages, losses, costs, or expenses 
              (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use or misuse of the service</li>
              <li>Your violation of these Terms and Conditions</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Any reliance on inaccurate translations or AI-generated content</li>
              <li>Your breach of any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>15. Severability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If any provision of these Terms and Conditions is found to be invalid, illegal, or 
              unenforceable by a court of competent jurisdiction, such provision shall be modified to the 
              minimum extent necessary to make it valid and enforceable, or if such modification is not 
              possible, the provision shall be severed from these terms. The remaining provisions shall 
              continue in full force and effect.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>16. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to revise these Terms and Conditions at any time. When we make material 
              changes, we will notify you by updating the "Last Updated" date and, where appropriate, 
              provide additional notice (such as via email or a prominent notice on our website). By 
              continuing to use the service after revisions become effective, you agree to be bound by the 
              revised terms.
            </p>
            <p>
              We encourage you to review these terms periodically to stay informed of any updates.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Terms;