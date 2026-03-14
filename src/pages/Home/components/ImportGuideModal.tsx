import { Typography, Button, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Text, Paragraph } = Typography

interface ImportGuideModalProps {
  onClose: () => void
}

function ImportGuideModal({ onClose }: ImportGuideModalProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#d4cfc8'
  const uploadBg = isDark ? '#1a1612' : '#f5f3f0'

  return (
    <div
      style={{
        padding: 8,
      }}
    >
      <Paragraph style={{ color: secondaryTextColor, marginBottom: 24 }}>
        由于书籍格式五花八门，暂不支持一键导入。请先创建书籍的基本信息，
        然后点开工作台，对应导入书籍章节和大纲即可。
      </Paragraph>

      <Text strong style={{ display: 'block', marginBottom: 12, color: textColor }}>
        导入章节要求：
      </Text>

      <ul style={{ paddingLeft: 20, lineHeight: 2, marginBottom: 24 }}>
        <li>
          <Text style={{ color: textColor }}>文件内容需按"第X章 章节名"格式分章，如：第一章、第1章</Text>
        </li>
        <li>
          <Text style={{ color: textColor }}>支持阿拉伯数字和中文数字的章节标记</Text>
        </li>
        <li>
          <Text style={{ color: textColor }}>每章节间应有明显分隔，建议使用空行分隔</Text>
        </li>
        <li>
          <Text style={{ color: textColor }}>txt文件支持自动检测编码，如有乱码可手动选择编码</Text>
        </li>
      </ul>

      <div
        style={{
          padding: 24,
          border: `2px dashed ${borderColor}`,
          borderRadius: 8,
          background: uploadBg,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size={8}>
          <Button icon={<UploadOutlined />}>
            上传文件（可选）
          </Button>
          <Text type="secondary" style={{ fontSize: 12, color: secondaryTextColor }}>
            支持 txt, doc, docx 格式
          </Text>
        </Space>
      </div>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={onClose}
            className="btn-gradient"
          >
            知道了
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default ImportGuideModal
