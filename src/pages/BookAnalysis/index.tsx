import { useEffect, useState, useCallback } from 'react'
import { Card, Typography, Empty, Button, Space, Row, Col, Progress, message, Input, Select, Dropdown, Modal, Form, Upload, Tag, Popconfirm, Tooltip } from 'antd'
import {
  PlusOutlined,
  BookOutlined,
  ReadOutlined,
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  DeleteOutlined,
  PushpinOutlined,
  EditOutlined,
  TagsOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { useBookStore } from '@/store/sqliteStore'
import type { MenuProps } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { generateId, createBookChapter, Book, BookCategory } from '@/api/sqlite'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Search } = Input

function BookAnalysis() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  // Book store
  const {
    books,
    categories,
    fetchBooks,
    addBook,
    modifyBook,
    removeBook,
    searchBooks,
    fetchCategories,
    addCategory,
    modifyCategory,
    removeCategory,
  } = useBookStore()

  // Local state
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [importing, setImporting] = useState(false)
  const [form] = Form.useForm()

  // Theme colors
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // Load data on mount
  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [fetchBooks, fetchCategories])

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
    if (value.trim()) {
      searchBooks(value, filterCategory || undefined)
    } else {
      fetchBooks()
    }
  }, [searchBooks, fetchBooks, filterCategory])

  // Handle category filter
  const handleCategoryFilter = useCallback((categoryId: string | null) => {
    setFilterCategory(categoryId)
    if (searchText.trim()) {
      searchBooks(searchText, categoryId || undefined)
    } else {
      // Fetch all books and filter locally
      fetchBooks().then(() => {
        // After fetching, we'll filter in the render based on filterCategory
      })
    }
  }, [searchText, searchBooks, fetchBooks])

  // Handle import book
  const handleImportBook = async (values: { title: string; author: string; file: UploadFile }) => {
    if (!values.file || !values.file.originFileObj) {
      messageApi.error('请选择要导入的文件')
      return
    }

    setImporting(true)
    try {
      // Read file content
      const file = values.file.originFileObj
      const content = await file.text()

      // Parse content into chapters (simple approach - split by double newlines)
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim())
      const chapters: { title: string; content: string }[] = []
      let currentChapter = { title: '前言', content: '' }

      paragraphs.forEach((para) => {
        // Check if paragraph looks like a chapter title
        if (para.length < 50 && (para.startsWith('第') || /^\d+[.、]/.test(para))) {
          if (currentChapter.content) {
            chapters.push({ ...currentChapter })
          }
          currentChapter = { title: para.trim(), content: '' }
        } else {
          currentChapter.content += para + '\n\n'
        }
      })
      if (currentChapter.content) {
        chapters.push({ ...currentChapter })
      }

      // Create book
      const newBook = await addBook({
        title: values.title,
        author: values.author || '未知作者',
        file_type: 'txt',
        total_chapters: chapters.length,
        current_chapter: 0,
        current_position: 0,
        word_count: content.length,
        is_pinned: 0,
      })

      // Create chapters
      for (let i = 0; i < chapters.length; i++) {
        await createBookChapter({
          id: generateId(),
          book_id: newBook.id,
          title: chapters[i].title,
          content: chapters[i].content,
          order_index: i,
          word_count: chapters[i].content.length,
        })
      }

      messageApi.success(`成功导入《${values.title}》，共${chapters.length}章`)
      setImportModalVisible(false)
      form.resetFields()
      fetchBooks()
    } catch (error) {
      console.error('Import failed:', error)
      messageApi.error('导入失败，请重试')
    } finally {
      setImporting(false)
    }
  }

  // Handle add/edit category
  const handleSaveCategory = async (values: { name: string; color: string }) => {
    try {
      if (editingCategory) {
        await modifyCategory({ ...editingCategory, name: values.name, color: values.color })
        messageApi.success('分类更新成功')
      } else {
        await addCategory({ name: values.name, color: values.color })
        messageApi.success('分类创建成功')
      }
      setCategoryModalVisible(false)
      setEditingCategory(null)
      form.resetFields()
      fetchCategories()
    } catch (error) {
      messageApi.error('操作失败，请重试')
    }
  }

  // Handle delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      await removeCategory(id)
      messageApi.success('分类删除成功')
      fetchCategories()
    } catch (error) {
      messageApi.error('删除失败，请重试')
    }
  }

  // Handle book menu actions
  const handleBookAction = async (action: string, book: Book) => {
    switch (action) {
      case 'pin':
        await modifyBook({ ...book, is_pinned: book.is_pinned ? 0 : 1 })
        messageApi.success(book.is_pinned ? '已取消置顶' : '已置顶')
        fetchBooks()
        break
      case 'category':
        // Show category selection modal
        const categoryId = await new Promise<string | null>((resolve) => {
          Modal.confirm({
            title: '选择分类',
            content: (
              <div style={{ padding: '10px 0' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      block
                      onClick={() => resolve(cat.id)}
                    >
                      <Tag color={cat.color}>{cat.name}</Tag>
                    </Button>
                  ))}
                  <Button block onClick={() => resolve(null)}>移除分类</Button>
                </Space>
              </div>
            ),
            onCancel: () => resolve(null),
            footer: null,
          })
        })
        if (categoryId !== null) {
          await modifyBook({ ...book, category_id: categoryId })
          messageApi.success('分类设置成功')
          fetchBooks()
        }
        break
      case 'delete':
        await removeBook(book.id)
        messageApi.success('书籍删除成功')
        fetchBooks()
        break
    }
  }

  // Get book menu items
  const getBookMenuItems = (book: Book): MenuProps['items'] => [
    {
      key: 'pin',
      icon: <PushpinOutlined />,
      label: book.is_pinned ? '取消置顶' : '置顶',
    },
    {
      key: 'category',
      icon: <TagsOutlined />,
      label: '分类',
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ]

  // Handle continue reading
  const handleContinueReading = (bookId: string) => {
    navigate(`/book-reader/${bookId}`)
  }

  // Filter books by category
  const filteredBooks = filterCategory
    ? books.filter(b => b.category_id === filterCategory)
    : books

  // Calculate stats
  const totalBooks = filteredBooks.length
  const readingBooks = filteredBooks.filter(b => b.current_chapter > 0 && b.current_chapter < b.total_chapters).length
  const completedBooks = filteredBooks.filter(b => b.current_chapter >= b.total_chapters - 1).length

  return (
    <>
      {contextHolder}
      <div style={{ padding: 8, background: bgColor, minHeight: '100%' }}>
        {/* 顶部栏 */}
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              <ReadOutlined style={{ marginRight: 8 }} />
              电子书库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              导入本地图书，随时随地阅读
            </Text>
          </div>
          <Space>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={() => setCategoryModalVisible(true)}
            >
              分类管理
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
              className="btn-gradient"
            >
              导入图书
            </Button>
          </Space>
        </div>

        {/* 搜索和筛选 */}
        <Card
          style={{
            marginBottom: 24,
            background: cardBgColor,
            borderColor: borderColor,
          }}
          variant="borderless"
        >
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder="搜索书名或作者..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined style={{ color: secondaryTextColor }} />}
              />
            </Col>
            <Col>
              <Select
                placeholder="全部分类"
                allowClear
                value={filterCategory}
                onChange={handleCategoryFilter}
                style={{ width: 150 }}
                options={[
                  { value: null, label: '全部分类' },
                  ...categories.map(c => ({ value: c.id, label: c.name })),
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* 阅读统计 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={8}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
                textAlign: 'center',
              }}
            >
              <BookOutlined style={{ fontSize: 32, color: '#c9a959', marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 24, color: textColor }}>{totalBooks}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12, color: secondaryTextColor }}>
                  本地图书
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={8}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
                textAlign: 'center',
              }}
            >
              <ReadOutlined style={{ fontSize: 32, color: '#8b6914', marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 24, color: textColor }}>{readingBooks}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12, color: secondaryTextColor }}>
                  在读
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={8}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
                textAlign: 'center',
              }}
            >
              <BookOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 24, color: textColor }}>{completedBooks}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12, color: secondaryTextColor }}>
                  已读完
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图书列表 */}
        <Title level={5} style={{ color: textColor, marginBottom: 16 }}>
          我的图书
        </Title>

        {filteredBooks.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredBooks.map((book) => {
              const progress = book.total_chapters > 0
                ? Math.round((book.current_chapter / book.total_chapters) * 100)
                : 0
              const category = categories.find(c => c.id === book.category_id)

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={book.id}>
                  <Card
                    hoverable
                    style={{
                      background: cardBgColor,
                      borderColor: book.is_pinned ? '#c9a959' : borderColor,
                      height: '100%',
                    }}
                    variant="borderless"
                    cover={
                      <div
                        style={{
                          height: 160,
                          background: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 64,
                          position: 'relative',
                        }}
                      >
                        <BookOutlined />
                        {book.is_pinned && (
                          <Tag
                            color="#c9a959"
                            style={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            置顶
                          </Tag>
                        )}
                        {category && (
                          <Tag
                            color={category.color}
                            style={{ position: 'absolute', top: 8, left: 8 }}
                          >
                            {category.name}
                          </Tag>
                        )}
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        key="continue"
                        onClick={() => handleContinueReading(book.id)}
                      >
                        {progress >= 100 ? '重读' : '继续阅读'}
                      </Button>,
                      <Dropdown
                        key="menu"
                        menu={{ items: getBookMenuItems(book), onClick: ({ key }) => handleBookAction(key, book) }}
                        trigger={['click']}
                      >
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <span style={{ color: textColor }}>{book.title}</span>
                      }
                      description={
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, color: secondaryTextColor, display: 'block', marginBottom: 8 }}
                          >
                            {book.author || '未知作者'}
                          </Text>
                          <div style={{ marginBottom: 4 }}>
                            <Text
                              type="secondary"
                              style={{ fontSize: 11, color: secondaryTextColor }}
                            >
                              {book.current_chapter}/{book.total_chapters} 章
                            </Text>
                          </div>
                          <Progress
                            percent={progress}
                            size="small"
                            showInfo={false}
                            strokeColor="#c9a959"
                            trailColor={isDark ? '#3a3530' : '#f0ede8'}
                          />
                        </div>
                      }
                    />
                  </Card>
                </Col>
              )
            })}
          </Row>
        ) : (
          <Card
            style={{
              background: cardBgColor,
              borderColor: borderColor,
              textAlign: 'center',
              padding: 40,
            }}
            variant="borderless"
          >
            <Empty
              description="还没有导入图书"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setImportModalVisible(true)}
              >
                导入第一本书
              </Button>
            </Empty>
          </Card>
        )}
      </div>

      {/* 分类管理 Modal */}
      <Modal
        title="分类管理"
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null)
              form.resetFields()
              form.setFieldsValue({ color: '#c9a959' })
              setCategoryModalVisible(true)
            }}
          >
            新建分类
          </Button>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Card
                key={cat.id}
                size="small"
                style={{
                  background: cardBgColor,
                  borderColor: borderColor,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={cat.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {cat.name}
                  </Tag>
                  <Space>
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingCategory(cat)
                          form.setFieldsValue({ name: cat.name, color: cat.color || '#c9a959' })
                          setCategoryModalVisible(true)
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="确定删除此分类吗？"
                      onConfirm={() => handleDeleteCategory(cat.id)}
                    >
                      <Tooltip title="删除">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            ))
          ) : (
            <Empty description="暂无分类" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Space>

        {/* Category form modal */}
        <Modal
          title={editingCategory ? '编辑分类' : '新建分类'}
          open={categoryModalVisible && !!editingCategory}
          onCancel={() => {
            setCategoryModalVisible(false)
            setEditingCategory(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText="保存"
        >
          <Form form={form} onFinish={handleSaveCategory} layout="vertical">
            <Form.Item
              name="name"
              label="分类名称"
              rules={[{ required: true, message: '请输入分类名称' }]}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item
              name="color"
              label="颜色"
            >
              <Select
                options={[
                  { value: '#c9a959', label: '金色' },
                  { value: '#1890ff', label: '蓝色' },
                  { value: '#52c41a', label: '绿色' },
                  { value: '#ff4d4f', label: '红色' },
                  { value: '#722ed1', label: '紫色' },
                  { value: '#faad14', label: '橙色' },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Modal>

      {/* Import book Modal */}
      <Modal
        title="导入图书"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} onFinish={handleImportBook} layout="vertical">
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item
            name="author"
            label="作者"
          >
            <Input placeholder="请输入作者（可选）" />
          </Form.Item>
          <Form.Item
            name="file"
            label="文件"
            rules={[{ required: true, message: '请选择要导入的TXT文件' }]}
            valuePropName="file"
          >
            <Upload.Dragger
              accept=".txt"
              maxCount={1}
              beforeUpload={(_file) => {
                // Prevent auto upload
                return false
              }}
            >
              <p className="ant-upload-drag-icon">
                <FolderOutlined style={{ fontSize: 48, color: '#c9a959' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
              <p className="ant-upload-hint">
                支持导入 TXT 格式的文本文件
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={importing}
              block
              className="btn-gradient"
            >
              {importing ? '导入中...' : '开始导入'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default BookAnalysis
