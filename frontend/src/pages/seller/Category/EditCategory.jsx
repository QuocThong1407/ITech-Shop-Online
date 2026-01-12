import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Flex, Form, Image, Input, Space, Typography, Upload, message } from 'antd'
import {
    SaveOutlined,
    PictureTwoTone
} from '@ant-design/icons'
import categoryService from '../../../services/categoryService.js'
import uploadService from '../../../services/uploadService.js'

const EditCategory = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [fileList, setFileList] = useState([])
    const [originalImageUrl, setOriginalImageUrl] = useState(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [messageApi, contextHolder] = message.useMessage()
    const [form] = Form.useForm()

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await categoryService.getCategoryById(id)

                console.log("Category data:", res)

                form.setFieldsValue({
                    name: res.data.name,
                    description: res.data.description,
                })

                if (res.data.image) {
                    setFileList([
                        {
                            uid: '-1',
                            name: 'image.png',
                            status: 'done',
                            url: res.data.image
                        }
                    ])
                    setPreviewImage(res.data.image)
                    setOriginalImageUrl(res.data.image)
                }
            } catch (error) {
                messageApi.error("Failed to load category!")
            } finally {
                setLoading(false)
            }
        }

        fetchCategory()
    }, [id])

    const handleChange = async ({ fileList: newList }) => {
        // Handle file removal from storage (only for newly uploaded files)
        if (newList.length < fileList.length) {
            const removedFile = fileList.find(f => !newList.some(nf => nf.uid === f.uid));
            const urlToDelete = removedFile?.response?.data?.url;
            // Only delete if it's a newly uploaded file (has response)
            // If it's the original file, we handle it during onFinish
            if (urlToDelete) {
                try {
                    await uploadService.deleteFile(urlToDelete);
                } catch (error) {
                    console.error("Failed to delete file from storage:", error);
                }
            }
        }
        setFileList(newList)
    }

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await new Promise((resolve) => {
                getBase64(file.originFileObj, resolve)
            })
        }
        setPreviewImage(file.url || file.preview)
        setPreviewOpen(true)
    }

    const beforeUpload = (file) => {
        getBase64(file, (url) => setImageUrl(url))
        return false
    }

    const onFinish = async (values) => {
        setSubmitting(true)
        try {
            const currentImageUrl = fileList[0]?.response?.data?.url || fileList[0]?.url || null;

            const updatedCategory = {
                image: currentImageUrl,
                name: values.name,
                description: values.description,
            }

            await categoryService.updateCategory(id, updatedCategory)

            // Cleanup old image if it was replaced or removed
            if (originalImageUrl && originalImageUrl !== currentImageUrl) {
                try {
                    await uploadService.deleteFile(originalImageUrl);
                } catch (error) {
                    console.error("Failed to delete old image:", error);
                }
            }

            messageApi.open({
                type: 'success',
                content: 'Category updated successfully',
                duration: 0.5,
                onClose: () => navigate('/seller/categories')
            })
        } catch (error) {
            messageApi.error(error.message || "Failed to update category!")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            {contextHolder}
            <div className="title">
                <Flex justify='space-between' align='center'>
                    <Typography.Title>Edit Category</Typography.Title>
                    <Space className="actions">
                        <Button onClick={() => navigate('/seller/categories')}>Cancel</Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                            loading={submitting}
                        >Save Category</Button>
                    </Space>
                </Flex>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Flex className="adding-section" gap={16}>
                    <div style={{ flex: 0.5 }}>
                        <Card title="Thumbnail">
                            <Typography.Text>Photo</Typography.Text>
                            <Form.Item label="category image">
                                <div
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        fileList={fileList}
                                        onChange={handleChange}
                                        customRequest={async ({ file, onSuccess, onError }) => {
                                            try {
                                                const response = await uploadService.uploadFile(file);
                                                onSuccess(response);
                                            } catch (err) {
                                                onError(err);
                                            }
                                        }}
                                        onPreview={handlePreview}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>

                                    <Image
                                        preview={{
                                            visible: previewOpen,
                                            onVisibleChange: (v) => setPreviewOpen(v),
                                        }}
                                        src={previewImage}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </Form.Item>
                        </Card>
                    </div>
                    <Card title="General Information" style={{ flex: 2 }}>
                        <Form.Item
                            label="Category Name"
                            name="name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input placeholder="Enter category name" />
                        </Form.Item>

                        <Form.Item label="Description" name="description" rules={[{ required: true, message: "Description is required" }]}>
                            <Input.TextArea rows={4} placeholder="Enter category description" />
                        </Form.Item>
                    </Card>
                </Flex>
            </Form>
        </div>
    )
}

export default EditCategory

const getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
}

const uploadButton = (
    <Flex
        vertical
        justify='center'
        align="center"
        gap={8}
        style={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            border: '1px dashed #d9d9d9',
        }}
    >
        <Avatar>
            <PictureTwoTone />
        </Avatar>
        <Typography.Text align='center'>Drop or drag image here, or click add image</Typography.Text>
        <Button>Add image</Button>
    </Flex>
)