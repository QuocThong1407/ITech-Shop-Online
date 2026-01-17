import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Flex, Form, Input, Space, Typography, message } from 'antd'
// import { Avatar, Image, Upload } from 'antd'
import {
    SaveOutlined,
    // PictureTwoTone
} from '@ant-design/icons'
import categoryService from '../../../services/categoryService.js'
// import uploadService from '../../../services/uploadService.js'

const AddCategory = () => {
    const navigate = useNavigate()
    // const [imageUrl, setImageUrl] = useState()
    // const [previewOpen, setPreviewOpen] = useState(false)
    // const [previewImage, setPreviewImage] = useState('')
    // const [fileList, setFileList] = useState([])

    const [submitting, setSubmitting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()
    const [form] = Form.useForm()

    // const handleChange = async ({ fileList: newList }) => {
    //     // Handle file removal from storage
    //     if (newList.length < fileList.length) {
    //         const removedFile = fileList.find(f => !newList.some(nf => nf.uid === f.uid));
    //         const urlToDelete = removedFile?.response?.data?.url || removedFile?.url;
    //         if (urlToDelete) {
    //             try {
    //                 await uploadService.deleteFile(urlToDelete);
    //             } catch (error) {
    //                 console.error("Failed to delete file from storage:", error);
    //             }
    //         }
    //     }
    //     setFileList(newList)
    // }

    // const handlePreview = async (file) => {
    //     if (!file.url && !file.preview) {
    //         file.preview = await new Promise((resolve) => {
    //             getBase64(file.originFileObj, resolve)
    //         })
    //     }
    //     setPreviewImage(file.url || file.preview)
    //     setPreviewOpen(true)
    // }

    // const beforeUpload = (file) => {
    //     getBase64(file, (url) => setImageUrl(url))
    //     return false
    // }

    const onFinish = async (values) => {
        setSubmitting(true)
        try {
            const newCategory = {
                // image: fileList[0]?.response?.data?.url || null,
                name: values.name,
                description: values.description,
            }

            await categoryService.createCategory(newCategory)

            messageApi.open({
                type: 'success',
                content: 'Category created successfully',
                duration: 0.5,
                onClose: () => { navigate('/seller/categories') }
            })
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error.message || 'Failed to create category!'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            {contextHolder}
            <div className="title">
                <Flex justify='space-between' align='center'>
                    <Typography.Title>Add Category</Typography.Title>
                    <Space className="actions">
                        <Button onClick={() => navigate('/seller/categories')}>Cancel</Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                            htmlType='submit'
                        >Save Category</Button>
                    </Space>
                </Flex>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Flex className="adding-section" gap={16}>
                    {/* <div style={{ flex: 0.5 }}>
                        <Card title="Thumbnail">
                            <Typography.Text>Photo</Typography.Text>
                            <Form.Item name="thumbnail" valuePropName="fileList">
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
                    </div> */}
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

export default AddCategory

// const getBase64 = (img, callback) => {
//     const reader = new FileReader()
//     reader.addEventListener('load', () => callback(reader.result))
//     reader.readAsDataURL(img)
// }

// const uploadButton = (
//     <Flex
//         vertical
//         justify='center'
//         align="center"
//         gap={8}
//         style={{
//             width: '100%',
//             aspectRatio: '1 / 1',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderRadius: '5px',
//             border: '1px dashed #d9d9d9',
//         }}
//     >
//         <Avatar>
//             <PictureTwoTone />
//         </Avatar>
//         <Typography.Text align='center'>Drop or drag image here, or click add image</Typography.Text>
//         <Button>Add image</Button>
//     </Flex>
// )