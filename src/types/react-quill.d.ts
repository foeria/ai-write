declare module 'react-quill' {
  import { ComponentType } from 'react'

  interface ReactQuillProps {
    value?: string
    defaultValue?: string
    readOnly?: boolean
    modules?: Record<string, unknown>
    formats?: string[]
    theme?: string
    placeholder?: string
    bounds?: string | HTMLElement
    onChange?: (content: string) => void
    onChangeSelection?: (range: unknown, source: string) => void
    style?: React.CSSProperties
    className?: string
  }

  const ReactQuill: ComponentType<ReactQuillProps>
  export default ReactQuill
}

declare module 'react-quill/dist/quill.snow.css' {
  const content: string
  export default content
}
