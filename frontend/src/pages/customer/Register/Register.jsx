import {Col, Form, Input, message, Row} from "antd";
import {Link} from "react-router-dom";
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";
import RegisterImage from "../../../assets/LoginImage.png"
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton.jsx";
import "./Register.css"

const Register = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = () => {
        console.log("Registering...");
    }

    const breadcrumbItems = [{ title: 'Register' }];

    return (
        <div className="register-page-wrapper">
            {contextHolder}

            <div className="container">
                <BreadscrumbMenu items={breadcrumbItems}/>
            </div>

            <div className="register-container">
                <div className="register-card">
                    <Row gutter={0} style={{width: '100%'}}>
                        <Col xs={0} md={12} className="register-image-col">
                            <img src={RegisterImage} alt="Register Illustration" className="register-image"/>
                        </Col>

                        <Col xs={24} md={12} className="register-form-col">
                            <div className="form-content">
                                <h2 className="welcome-title">REGISTER NOW!</h2>
                                <p className="welcome-subtitle">JOIN TO US</p>
                            </div>

                            <Form className="register-form"
                                  name="register_form"
                                  layout="vertical"
                                  onSubmit={onFinish}>

                                <Form.Item
                                    label="Your Name"
                                    name="username"
                                    rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}>
                                    <Input placeholder="New User" className="custom-input" />
                                </Form.Item>

                                <Form.Item name="email"
                                           label="Email"
                                           rules={[
                                               {required: true, message: 'Please input your email'},
                                               {type: 'email', message: 'Invalid email address!'}
                                           ]}>
                                    <Input placeholder={"username@example.com"} className="custom-input"/>
                                </Form.Item>

                                <Form.Item name="password"
                                           label="Password"
                                           rules={[
                                               {required: true, message: 'Please input your password'},
                                               {type: 'password', message: 'Invalid password'},
                                           ]}>
                                    <Input.Password placeholder="••••••••" className="custom-input"/>
                                </Form.Item>

                                <Form.Item name="confirm_password"
                                           label="Confirm Password"
                                           rules={[
                                               {required: true, message: 'Please input your confirm password'},
                                               {type: 'password', message: 'Invalid confirm password'},
                                           ]}>
                                    <Input.Password placeholder="••••••••" className="custom-input"/>
                                </Form.Item>

                                <Form.Item>
                                    <PrimaryButton htmlType="submit" block loading={false} style={{marginTop: 12}}>
                                        SIGN UP
                                    </PrimaryButton>
                                </Form.Item>

                                <div className="login-redirect">
                                    <span>ALREADY USER? </span>
                                    <Link to="/login" className="highlight-link">SIGN IN NOW!</Link>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default Register;