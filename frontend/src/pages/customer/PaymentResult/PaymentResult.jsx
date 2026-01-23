import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './PaymentResult.css';

const PaymentResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Derive state from URL parameters (no useEffect needed)
    const { status, resultMessage, orderId } = useMemo(() => {
        const success = searchParams.get('success');
        const orderIdParam = searchParams.get('orderId');
        const message = searchParams.get('message');

        if (success === 'true') {
            return {
                status: 'success',
                resultMessage: message || 'Payment completed successfully!',
                orderId: orderIdParam
            };
        } else {
            return {
                status: 'failed',
                resultMessage: message || 'Payment failed. Please try again.',
                orderId: orderIdParam
            };
        }
    }, [searchParams]);

    const handleViewOrders = () => {
        navigate('/orders');
    };

    const handleRetryPayment = () => {
        if (orderId) {
            navigate(`/orders/${orderId}`);
        } else {
            navigate('/orders');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="payment-result-container">
            <Card className="payment-result-card">
                {status === 'success' ? (
                    <Result
                        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        status="success"
                        title="Payment Successful!"
                        subTitle={resultMessage}
                        extra={[
                            <Button type="primary" key="orders" onClick={handleViewOrders}>
                                View My Orders
                            </Button>,
                            <Button key="home" onClick={handleGoHome}>
                                Continue Shopping
                            </Button>,
                        ]}
                    />
                ) : (
                    <Result
                        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                        status="error"
                        title="Payment Failed"
                        subTitle={resultMessage}
                        extra={[
                            <Button type="primary" key="retry" onClick={handleRetryPayment}>
                                Retry Payment
                            </Button>,
                            <Button key="orders" onClick={handleViewOrders}>
                                View My Orders
                            </Button>,
                            <Button key="home" onClick={handleGoHome}>
                                Go Home
                            </Button>,
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default PaymentResult;
