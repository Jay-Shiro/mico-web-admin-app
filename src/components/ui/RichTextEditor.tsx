"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
  className?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  height = 400,
  placeholder = "Write something...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className={className}>
      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        init={{
          height,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | " +
            "bold italic backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          placeholder,
        }}
      />
    </div>
  );
}
