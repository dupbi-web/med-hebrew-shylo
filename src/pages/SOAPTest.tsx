import React from 'react';
import { SOAPExerciseTest } from '@/components/soap/SOAPExerciseTest';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';

const SOAPTestPage: React.FC = () => {
    return (
        <PageContainer>
            <PageHeader
                title="SOAP Exercise Test"
                subtitle="Complete the exercises and test your medical documentation skills"
            />
            <SOAPExerciseTest />
        </PageContainer>
    );
};

export default SOAPTestPage;
