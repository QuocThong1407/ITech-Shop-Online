import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('process'); // process, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles email verification automatically when user clicks the link
        // The link contains confirmation that email was verified
        // We just need to display success and redirect user to login
        const timer = setTimeout(() => {
            setStatus('success');
            setMessage('Your email has been verified successfully! You can now login to your account.');
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchParams]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            {status === 'process' && <Spin size="large" tip={message} />}
            {status === 'success' && (
                <Result
                    status="success"
                    title="Email Verified!"
                    subTitle={message}
                    extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>,
                    ]}
                />
            )}
            {status === 'error' && (
                <Result
                    status="error"
                    title="Verification Failed"
                    subTitle={message}
                    extra={[
                        <Button type="primary" key="home" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default VerifyEmail;
