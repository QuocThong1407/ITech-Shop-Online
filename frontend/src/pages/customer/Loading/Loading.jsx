import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Spin, Button, Card } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import paymentService from '../../../services/paymentService';
import './Loading.css';

const Loading = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, failed
    const [message, setMessage] = useState('Processing your payment...');
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        const nextUrl = searchParams.get('nextUrl');

        // If no orderId, this is a regular loading page
        if (!orderId) {
            // Redirect after a short delay
            setTimeout(() => {
                navigate(nextUrl ? `/${nextUrl}` : '/');
            }, 2000);
            return;
        }

        // Update payment status with backend
        const updatePayment = async () => {
            try {
                const result = await paymentService.updatePaymentStatus(orderId);
                
                if (result.success) {
                    setStatus('success');
                    setMessage(result.message);
                    setOrderId(result.orderId);
                    
                    // Redirect to orders page after 3 seconds
                    setTimeout(() => {
                        navigate('/orders');
                    }, 3000);
                } else {
                    setStatus('failed');
                    setMessage(result.message);
                    
                    // Redirect to cart after 5 seconds
                    setTimeout(() => {
                        navigate('/cart');
                    }, 5000);
                }
            } catch (error) {
                console.error('Payment update error:', error);
                setStatus('failed');
                setMessage('Error processing payment. Please check your orders or contact support.');
                
                // Redirect to orders page after 5 seconds to check manually
                setTimeout(() => {
                    navigate('/orders');
                }, 5000);
            }
        };

        updatePayment();
    }, [searchParams, navigate]);

    const renderIcon = () => {
        switch (status) {
            case 'loading':
                return <LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />;
            case 'success':
                return <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />;
            case 'failed':
                return <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />;
            default:
                return <LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />;
        }
    };

    const renderResult = () => {
        switch (status) {
            case 'success':
                return (
                    <Result
                        icon={renderIcon()}
                        status="success"
                        title="Payment Successful!"
                        subTitle={
                            <>
                                <p>{message}</p>
                                {orderId && <p>Order ID: <strong>{orderId}</strong></p>}
                                <p>You will be redirected to your orders page shortly...</p>
                            </>
                        }
                        extra={[
                            <Button type="primary" key="orders" onClick={() => navigate('/orders')}>
                                View Orders
                            </Button>,
                            <Button key="home" onClick={() => navigate('/')}>
                                Back to Home
                            </Button>,
                        ]}
                    />
                );
            case 'failed':
                return (
                    <Result
                        icon={renderIcon()}
                        status="error"
                        title="Payment Failed"
                        subTitle={
                            <>
                                <p>{message}</p>
                                <p>You will be redirected shortly...</p>
                            </>
                        }
                        extra={[
                            <Button type="primary" key="cart" onClick={() => navigate('/cart')}>
                                Back to Cart
                            </Button>,
                            <Button key="orders" onClick={() => navigate('/orders')}>
                                View Orders
                            </Button>,
                        ]}
                    />
                );
            default:
                return (
                    <div className="loading-container">
                        {renderIcon()}
                        <h2 style={{ marginTop: 24 }}>{message}</h2>
                        <p style={{ color: '#666' }}>Please wait while we verify your payment...</p>
                    </div>
                );
        }
    };

    return (
        <div className="loading-page">
            <Card className="loading-card">
                {renderResult()}
            </Card>
        </div>
    );
};

export default Loading;
