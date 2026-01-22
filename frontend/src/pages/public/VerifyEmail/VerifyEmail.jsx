import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [status, setStatus] = useState('process'); // process, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Parse hash fragment (Supabase sends tokens in hash: #access_token=xxx&type=signup...)
                const hash = location.hash;
                if (hash) {
                    const hashParams = new URLSearchParams(hash.substring(1));
                    
                    // Check for errors in the hash
                    const error = hashParams.get('error');
                    const errorDescription = hashParams.get('error_description');
                    if (error) {
                        setStatus('error');
                        setMessage(errorDescription?.replace(/\+/g, ' ') || 'Email verification failed');
                        return;
                    }

                    // Check for access_token with type=signup or type=email
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    const type = hashParams.get('type');

                    if (accessToken && (type === 'signup' || type === 'email')) {
                        // Set the session to confirm the email verification
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || accessToken,
                        });

                        if (sessionError) {
                            setStatus('error');
                            setMessage(sessionError.message || 'Failed to verify email');
                            return;
                        }

                        // Email is verified - Supabase updates email_confirmed_at automatically
                        setStatus('success');
                        setMessage('Your email has been verified successfully! You can now login to your account.');
                        
                        // Sign out to clear the session (user should login fresh)
                        await supabase.auth.signOut();
                        return;
                    }
                }

                // If we reach here without proper tokens, show error
                setStatus('error');
                setMessage('Invalid or expired verification link. Please request a new verification email.');
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during email verification. Please try again.');
            }
        };

        verifyEmail();
    }, [location.hash, searchParams]);

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
