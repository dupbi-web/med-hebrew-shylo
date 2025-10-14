import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <>
      <Helmet>
        <title>Terms & Conditions</title>
      </Helmet>

      <div className="container mx-auto max-w-3xl py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By using this service, you agree to these Terms; if you do not agree, do not access or use the service. 
            </p>

            <h3 className="text-lg font-medium">Eligibility</h3>
            <p>
              You must be at least 16 years old and capable of forming a binding agreement to use the service. 
            </p>

            <h3 className="text-lg font-medium">Account and security</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Keep your credentials confidential and promptly notify support of any suspected compromise. 
              </li>
              <li>
                Information provided in profiles must be accurate and kept up to date. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">License and acceptable use</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                A personal, non-transferable, revocable license is granted to access the service for learning and professional development. 
              </li>
              <li>
                Do not misuse the service, attempt to bypass security, scrape without permission, or interfere with normal operation. 
              </li>
              <li>
                Do not upload unlawful, harmful, or infringing content, or violate others’ privacy or intellectual property rights. 
              </li>
            </ul>

            <h3 className="text-lg font-medium">User content</h3>
            <p>
              You retain rights to your content; by submitting content, you grant a limited license to host, display, and use it to operate and improve the service. 
            </p>

            <h3 className="text-lg font-medium">Medical disclaimer</h3>
            <p>
              Educational content is provided for learning only and is not a substitute for professional medical advice, diagnosis, or treatment; verify critical information with authoritative sources. 
            </p>

            <h3 className="text-lg font-medium">Third-party services</h3>
            <p>
              The service integrates third-party providers for authentication, hosting, and messaging; use of such services is subject to their terms and policies. 
            </p>

            <h3 className="text-lg font-medium">Changes and availability</h3>
            <p>
              Features may change, be suspended, or discontinued at any time; reasonable efforts are made to maintain availability but outages may occur. 
            </p>

            <h3 className="text-lg font-medium">Termination</h3>
            <p>
              Accounts may be suspended or terminated for violations of these Terms or to protect users, the service, or third parties; you may request deletion from your Profile. 
            </p>

            <h3 className="text-lg font-medium">Disclaimers</h3>
            <p>
              The service is provided as is without warranties of any kind; no guarantee is made that it will be error-free, secure, or uninterrupted. 
            </p>

            <h3 className="text-lg font-medium">Limitation of liability</h3>
            <p>
              To the maximum extent permitted by law, liability for indirect, incidental, special, consequential, or punitive damages is disclaimed. 
            </p>

            <h3 className="text-lg font-medium">Indemnity</h3>
            <p>
              You agree to indemnify and hold harmless the service from claims arising from your use or violation of these Terms, to the extent permitted by law. 
            </p>

            <h3 className="text-lg font-medium">Governing law</h3>
            <p>
              These Terms are governed by applicable law, with venue in the operator’s principal jurisdiction unless otherwise required by consumer protection law. 
            </p>

            <h3 className="text-lg font-medium">Changes to Terms</h3>
            <p>
              Terms may be updated; material changes will be communicated by in-app notice or email where appropriate, and continued use constitutes acceptance. 
            </p>

            <h3 className="text-lg font-medium">Contact</h3>
            <p>
              Questions about these Terms can be sent via the Contact page; administrative requests such as account deletion must be submitted from your Profile. 
            </p>

            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Terms;
