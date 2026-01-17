import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spin, Result, Button } from 'antd';
import authService from '../../../services/authService';
import { setLoginSuccess } from '../../../redux/actions/authAction';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('process'); // process, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                const response = await authService.verify(token);
                // Based on util/response.ts, success returns { ok: true, message: ..., data: ... }
                // request.js returns the JSON body directly.
                if (response && response.ok) {
                    setStatus('success');
                    setMessage(response.message || 'Email verified successfully!');
                    dispatch(setLoginSuccess(response.data));
                } else {
                    setStatus('error');
                    setMessage(response?.message || 'Verification failed. Please try again.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'An error occurred during verification.');
            }
        };

        verifyToken();
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
                        <Button type="primary" key="home" onClick={() => navigate('/')}>
                            Go to Home
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
