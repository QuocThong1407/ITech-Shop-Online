import {Button, Card, Col, Divider, Form, Input, Row} from "antd";
import LoginImage from "../../../assets/LoginImage.png";
import {Link} from "react-router";
import React from "react";
import "./Confirmation.scss"
import BreadscrumbMenu from "../../../components/BreadscrumbMenu/BreadscrumbMenu.jsx";

const Confirmation = () => {
    const onFinish = () => {

    }

    const breadcrumbItems = [
        {
            title: <Link to={"/register"}>Register</Link>
        },
        {
            title: 'Confirmation Email'
        }
    ];

    return (
        <>
            <BreadscrumbMenu items={breadcrumbItems}/>

            <div className={"confirmation"}>
                <Row gutter={24} align="middle">
                    <Col span={12}>
                        <div className="confirmation__image">
                            <img src={LoginImage} alt="Confirmation Image"/>
                        </div>
                    </Col>
                    <Col span={12}>
                        <Form layout="vertical" name={"confirmation_form"} className="confirmation_form"
                              onFinish={onFinish}>
                            <h2 className={"confirmation__form-title"}>Confirmation Email</h2>
                            <p className={"confirmation__form-subtitle"}>CHECK YOUR EMAIL AND ENTER CONFIRMATION
                                CODE</p>

                            <Form.Item
                                label="Confirmation Code"
                                name="confirmation_code"
                                rules={[
                                    {required: true, message: 'Please input confirmation code!'},
                                    {len: 6, message: 'Code must be exactly 6 digits!'}
                                ]}
                            >
                                <Input.OTP
                                    length={6}
                                    size="large"
                                    formatter={(str) => str.replace(/\D/g, '')}
                                    style={{width: '80%', display: 'flex', justifyContent: 'space-between', margin: "24px auto 16px auto"}}
                                />
                            </Form.Item>

                            <Form.Item style={{marginBottom: '16px'}}>
                                <Button type="primary" htmlType="submit" size="large"
                                        className="btn-confirm">
                                    CONFIRM CODE
                                </Button>
                            </Form.Item>

                            <Form.Item>
                                <Divider style={{margin: "0", paddingTop: '0'}}/>
                            </Form.Item>

                            <Form.Item style={{marginBottom: '16px', marginTop: '-24px'}}>
                                <span style={{display: "flex", justifyContent: "center"}}>Haven't received your code?</span>
                            </Form.Item>

                            <Form.Item>
                                <Button htmlType="submit" color={"default"} size="large" variant={"outlined"}
                                        style={{width:'100%'}}>
                                    <span style={{color: "#008ECC", borderRadius: "8px"}}>RESEND CODE</span>
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Confirmation;