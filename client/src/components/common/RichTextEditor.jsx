import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  RemoveFormatting,
  Undo,
  Redo
} from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Nhập mô tả / tóm tắt chi tiết ở đây...' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCmd = (command, valueArg = null) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-stone-300 rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all font-sans">
      
      {/* Word-like Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 text-stone-700">
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h1>')}
          title="Tiêu đề 1"
          className="p-1.5 hover:bg-stone-200 rounded-lg text-xs font-black transition-colors"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h2>')}
          title="Tiêu đề 2"
          className="p-1.5 hover:bg-stone-200 rounded-lg text-xs font-black transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<p>')}
          title="Đoạn văn"
          className="px-2 py-1 hover:bg-stone-200 rounded-lg text-xs font-bold transition-colors"
        >
          P
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-1" />

        {/* Text Styles */}
        <button
          type="button"
          onClick={() => execCmd('bold')}
          title="In đậm (Ctrl+B)"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('italic')}
          title="In nghiêng (Ctrl+I)"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('underline')}
          title="Gạch chân (Ctrl+U)"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Underline className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('strikeThrough')}
          title="Gạch ngang"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          title="Danh sách dấu chấm"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          title="Danh sách số"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => execCmd('justifyLeft')}
          title="Căn trái"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('justifyCenter')}
          title="Căn giữa"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('justifyRight')}
          title="Căn phải"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-stone-300 mx-1" />

        {/* Clear & History */}
        <button
          type="button"
          onClick={() => execCmd('removeFormat')}
          title="Xóa định dạng"
          className="p-1.5 hover:bg-stone-200 rounded-lg text-red-600 transition-colors"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('undo')}
          title="Hoàn tác (Ctrl+Z)"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors ml-auto"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCmd('redo')}
          title="Làm lại (Ctrl+Y)"
          className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Redo className="w-4 h-4" />
        </button>

      </div>

      {/* WYSIWYG Content Editable Container */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        placeholder={placeholder}
        className="min-h-[140px] max-h-[260px] overflow-y-auto p-3 text-xs leading-relaxed text-stone-800 outline-none focus:outline-none prose prose-stone max-w-none"
        style={{ minHeight: '130px' }}
      />

    </div>
  );
}
