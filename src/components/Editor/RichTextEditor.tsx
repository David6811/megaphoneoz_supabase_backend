import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Box,
  Paper,
  IconButton,
  Toolbar,
  Divider,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatQuote,
  FormatListBulleted,
  FormatListNumbered,
  Image as ImageIcon,
  Undo,
  Redo,
  Title,
  Code,
  Link as LinkIcon
} from '@mui/icons-material'
import { StorageService } from '../../services/storageService'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write your news article...',
  className
}) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
          style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;'
        }
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: `
          padding: 24px;
          min-height: 400px;
          font-family: ${theme.typography.fontFamily};
          font-size: 16px;
          line-height: 1.7;
        `,
        spellcheck: 'true'
      },
    },
  })

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && editor) {
        try {
          // Show loading state
          const loadingNode = editor.chain().focus().insertContent({
            type: 'paragraph',
            content: [{ type: 'text', text: '📷 Uploading image...' }]
          }).run()

          // Compress and upload
          const compressedFile = await StorageService.compressImage(file)
          const result = await StorageService.uploadImage(compressedFile, 'news-images')

          // Replace loading text with image
          editor.chain().focus().deleteRange({
            from: editor.state.selection.from - 20,
            to: editor.state.selection.from
          }).setImage({ src: result.url, alt: file.name }).run()

        } catch (error) {
          console.error('Failed to upload image:', error)
          // Remove loading text
          editor.chain().focus().deleteRange({
            from: editor.state.selection.from - 20,
            to: editor.state.selection.from
          }).insertContent('❌ Failed to upload image').run()
        }
      }
    }

    input.click()
  }, [editor])

  const handleHeadingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleHeadingClose = () => {
    setAnchorEl(null)
  }

  const setHeading = (level: number) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run()
    } else {
      editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()
    }
    handleHeadingClose()
  }

  if (!editor) {
    return null
  }

  return (
    <Paper
      className={className}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            gap: 0.5,
            minHeight: '48px !important',
            px: 2,
            flexWrap: 'wrap'
          }}
        >
          {/* History */}
          <Tooltip title="Undo">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Headings */}
          <Tooltip title="Headings">
            <IconButton
              size="small"
              onClick={handleHeadingClick}
              color={editor.isActive('heading') ? 'primary' : 'default'}
            >
              <Title fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleHeadingClose}
          >
            <MenuItem onClick={() => setHeading(0)}>Normal Text</MenuItem>
            <MenuItem onClick={() => setHeading(1)}>Heading 1</MenuItem>
            <MenuItem onClick={() => setHeading(2)}>Heading 2</MenuItem>
            <MenuItem onClick={() => setHeading(3)}>Heading 3</MenuItem>
          </Menu>

          {/* Text Formatting */}
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleCode().run()}
              color={editor.isActive('code') ? 'primary' : 'default'}
            >
              <Code fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Lists */}
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Quote */}
          <Tooltip title="Quote">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuote fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Image */}
          <Tooltip title="Insert Image">
            <IconButton
              size="small"
              onClick={handleImageUpload}
              color="default"
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          '& .ProseMirror': {
            outline: 'none',
            '& p': {
              margin: '0 0 16px 0',
            },
            '& h1': {
              fontSize: '2rem',
              fontWeight: 700,
              margin: '24px 0 16px 0',
              lineHeight: 1.2,
            },
            '& h2': {
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '20px 0 12px 0',
              lineHeight: 1.3,
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: '16px 0 8px 0',
              lineHeight: 1.4,
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              paddingLeft: '16px',
              margin: '16px 0',
              fontStyle: 'italic',
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              padding: '16px',
              borderRadius: '0 4px 4px 0',
            },
            '& ul, & ol': {
              paddingLeft: '24px',
              margin: '12px 0',
            },
            '& li': {
              margin: '4px 0',
              lineHeight: 1.6,
            },
            '& code': {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'Monaco, Consolas, "Liberation Mono", monospace',
            },
            '& .editor-image': {
              borderRadius: '8px',
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            },
          },
          '& .ProseMirror:empty::before': {
            content: `"${placeholder}"`,
            color: theme.palette.text.disabled,
            pointerEvents: 'none',
            fontStyle: 'italic',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  )
}