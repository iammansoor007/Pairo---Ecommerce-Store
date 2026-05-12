"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Redo, 
  Undo,
  Heading1,
  Heading2,
  Code
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-[#c3c4c7] bg-[#f0f0f1] px-2 py-1 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('bold') ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('italic') ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('bulletList') ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('orderedList') ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all ${editor.isActive('blockquote') ? 'bg-white border-[#c3c4c7]' : ''}`}
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
      <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 px-3 rounded-[2px] border border-transparent hover:border-[#c3c4c7] hover:bg-white transition-all"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-4 text-[15px] leading-relaxed max-w-none font-serif',
      },
    },
  });

  return (
    <div className="bg-white border border-[#c3c4c7]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
