import React from 'react';
import { SOAPTestResults } from '@/components/soap/SOAPTestResults';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';

const SOAPResultsPage: React.FC = () => {
    return (
        <PageContainer>
            <PageHeader
                title="SOAP Test Results"
                subtitle="View your test history and performance statistics"
            />
            <SOAPTestResults />
        </PageContainer>
    );
};

export default SOAPResultsPage;
