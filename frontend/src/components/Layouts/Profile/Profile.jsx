import React, { useEffect, useState, useRef } from 'react'
import "./Profile.scss"
import { Avatar, Col, Menu, Row, message, Spin } from "antd";
import { UserOutlined, RightOutlined, ShoppingOutlined, HomeOutlined, LockOutlined, CameraOutlined, CrownOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import userService from "../../../services/userService";

const Profile = () => {
    const [pfp, setPfp] = useState(null);
    const [tempPfp, setTempPfp] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const location = useLocation();

    // Determine selected menu key based on current URL
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/profile' || path === '/profile/') {
            return 'account-info';
        }
        if (path.includes('/profile/membership')) {
            return 'membership';
        }
        if (path.includes('/profile/my-address')) {
            return 'my-address';
        }
        if (path.includes('/profile/change-password')) {
            return 'change-password';
        }
        return 'account-info';
    };

    const menuItems = [
        {
            key: "account-info",
            label: (
                <Link to="/profile">
                    <div className={"profile__menu-item"}>
                        <div className="profile__menu-item-left">
                            <UserOutlined />
                            <span>Account info</span>
                        </div>

                        <RightOutlined className="profile__menu-item-right" />
                    </div>
                </Link>
            ),
        },
        {
            key: "membership",
            label: (
                <Link to="/profile/membership">
                    <div className={"profile__menu-item"}>
                        <div className="profile__menu-item-left">
                            <CrownOutlined />
                            <span>Membership</span>
                        </div>
                        <RightOutlined className="profile__menu-item-right" />
                    </div>
                </Link>
            ),
        },
        {
            key: "my-address",
            label: (
                <Link to="/profile/my-address">
                    <div className={"profile__menu-item"}>
                        <div className="profile__menu-item-left">
                            <HomeOutlined />
                            <span>My address</span>
                        </div>
                        <RightOutlined className="profile__menu-item-right" />
                    </div>
                </Link>
            ),
        },
        {
            key: "change-password",
            label: (
                <Link to="/profile/change-password">
                    <div className={"profile__menu-item"}>
                        <div className="profile__menu-item-left">
                            <LockOutlined />
                            <span>Change password</span>
                        </div>
                        <RightOutlined className="profile__menu-item-right" />
                    </div>
                </Link>
            ),
        },
    ];

    useEffect(() => {
        fetchPfp();
        return () => {
            if (tempPfp) URL.revokeObjectURL(tempPfp);
        };
    }, []);

    const fetchPfp = async () => {
        try {
            const res = await userService.getPfp();
            if (res && res.data && res.data.image) {
                setPfp(res.data.image);
            }
        } catch (error) {
            console.error("Failed to fetch PFP", error);
        }
    };

    const handlePfpClick = () => {
        if (!selectedFile) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setTempPfp(objectUrl);
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        setLoading(true);
        try {
            const res = await userService.uploadPfp(formData);
            if (res && res.data && res.data.image) {
                // Append timestamp to force reload
                const newPfpUrl = `${res.data.image}?t=${new Date().getTime()}`;
                setPfp(newPfpUrl);
                setTempPfp(null);
                setSelectedFile(null);
                message.success("Profile picture updated successfully");
            }
        } catch (error) {
            console.error("Failed to upload PFP", error);
            message.error("Failed to upload profile picture");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (tempPfp) URL.revokeObjectURL(tempPfp); // Revoke the object URL
        setTempPfp(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    return (
        <>
            <div className="profile">
                <Row gutter={48}>
                    <Col span={6}>
                        <div className="profile__info">
                            <div
                                className="profile__pfp-container"
                                onClick={handlePfpClick}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                style={{ position: 'relative', cursor: selectedFile ? 'default' : 'pointer', width: '180px', height: '180px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden' }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                                {loading ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                                        <Spin />
                                    </div>
                                ) : (
                                    <>
                                        <Avatar
                                            className="profile__info-image"
                                            size={180}
                                            icon={<UserOutlined />}
                                            src={tempPfp || pfp}
                                            style={{ display: 'block' }}
                                        />
                                        {!selectedFile && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                                opacity: isHovering ? 1 : 0,
                                                transition: 'opacity 0.3s',
                                                pointerEvents: 'none'
                                            }}>
                                                <CameraOutlined style={{ fontSize: '24px' }} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {selectedFile && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <button
                                        onClick={handleSubmit}
                                        style={{
                                            padding: '5px 15px',
                                            backgroundColor: '#008ecc',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        style={{
                                            padding: '5px 15px',
                                            backgroundColor: '#f5f5f5',
                                            color: 'rgba(0, 0, 0, 0.85)',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            <Menu
                                items={menuItems}
                                mode="vertical"
                                selectedKeys={[getSelectedKey()]}
                                style={{
                                    border: 'none',
                                }}
                                className="profile__menu"
                            />
                        </div>
                    </Col>
                    <Col span={18}>
                        <Outlet />
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Profile;