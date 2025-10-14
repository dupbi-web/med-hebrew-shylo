import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <>
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>

      <div className="container mx-auto max-w-3xl py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Privacy Policy explains how personal data is collected, used, and protected, including compliance with the General Data Protection Regulation (GDPR) where applicable. 
            </p>

            <h3 className="text-lg font-medium">Who we are</h3>
            <p>
              This service helps healthcare professionals learn medical terminology and related content; data is processed to operate the app, provide support, and improve features. 
            </p>

            <h3 className="text-lg font-medium">Data we collect</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Account data: email, user ID, authentication timestamps. 
              </li>
              <li>
                Profile data: full_name, specialization, hospital, medical_field, how_found_us, description. 
              </li>
              <li>
                Consent records: terms/privacy/data processing acceptance and marketing preference. 
              </li>
              <li>
                Technical data: user agent for consent tracking, basic device/browser metadata, and minimal logs. 
              </li>
              <li>
                Contact messages: name, reply email, and message content submitted via the contact form. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">How we use data</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Provide and secure core features, authentication, and personalization. 
              </li>
              <li>
                Respond to support requests, bug reports, translation fixes, and collaboration inquiries. 
              </li>
              <li>
                Improve content quality and user experience, including optional communications with consent. 
              </li>
              <li>
                Meet legal, security, and fraud prevention obligations. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">Legal bases (GDPR)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Contract: necessary to provide the service and manage your account. 
              </li>
              <li>
                Legitimate interests: service improvement, security, and support, balanced against your rights. 
              </li>
              <li>
                Consent: marketing communications and non-essential preferences; you can withdraw at any time. 
              </li>
              <li>
                Legal obligation: compliance with applicable laws and requests from authorities. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">Sharing and processors</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Supabase: managed database, authentication, storage of profiles and consent, and related services. 
              </li>
              <li>
                Netlify: hosting, build, and edge/CDN delivery for the frontend. 
              </li>
              <li>
                Telegram bot endpoint: delivers contact or deletion-request notifications to administrators. 
              </li>
              <li>
                Additional subprocessors may be used for email or support; they are bound by appropriate data protection terms. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">International transfers</h3>
            <p>
              Where data is transferred outside the EEA, appropriate safeguards such as standard contractual clauses or equivalent protections are applied. 
            </p>

            <h3 className="text-lg font-medium">Security</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Encryption in transit and at rest for managed services where available. 
              </li>
              <li>
                Role-based access controls and Row Level Security (RLS) policies to restrict data access to the account owner where applicable. 
              </li>
              <li>
                Least-privilege operational access and periodic reviews. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">Retention</h3>
            <p>
              Data is retained while the account is active and as necessary for legitimate purposes; upon a verified deletion request, personal data is removed or anonymized within a reasonable period, subject to legal retention obligations and backup cycles. 
            </p>

            <h3 className="text-lg font-medium">Your rights</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Access, correction, and export of your data. 
              </li>
              <li>
                Deletion request: submit from your Profile page to initiate administrator review. 
              </li>
              <li>
                Objection/restriction where applicable and withdrawal of consent for marketing. 
              </li>
            </ul>
            <p>
              Rights can be exercised through Profile settings and the contact page; identification may be required for security. 
            </p>

            <h3 className="text-lg font-medium">Children</h3>
            <p>
              The service is not intended for individuals under 16 years of age; do not register if under this age threshold. 
            </p>

            <h3 className="text-lg font-medium">Changes</h3>
            <p>
              This policy may be updated; material changes will be communicated via in-app notice or email where appropriate. 
            </p>

            <h3 className="text-lg font-medium">Contact</h3>
            <p>
              For questions or rights requests, use the Contact page or the in-app options provided in your Profile. 
            </p>

            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Privacy;
