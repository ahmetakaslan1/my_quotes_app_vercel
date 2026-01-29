'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
    const [spec, setSpec] = useState(null);

    useEffect(() => {
        fetch('/api/swagger')
            .then((res) => res.json())
            .then((data) => setSpec(data));
    }, []);

    if (!spec) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>API Dokümantasyonu yükleniyor...</p>
            </div>
        );
    }

    return (
        <div>
            <SwaggerUI spec={spec} />
        </div>
    );
}
