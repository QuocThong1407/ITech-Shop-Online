import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

const AccessRestricted = () => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        Back Home
                    </Button>
                }
            />
        </div>
    );
};

export default AccessRestricted;
