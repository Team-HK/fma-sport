"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { Label } from "@/components/ui/Input";
import { ARTICLE_BODY_CLASSES } from "@/lib/article-body";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

const BLOCK_OPTIONS = [
  { value: "p", label: "Paragraphe" },
  { value: "2", label: "Titre 1" },
  { value: "3", label: "Titre 2" },
  { value: "4", label: "Titre 3" },
] as const;

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection: don't let the button steal focus from the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-primary text-on-primary hover:bg-primary"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;
}

/**
 * WYSIWYG article editor (paragraphs, headings, alignment, lists, quotes,
 * links, images, undo/redo). Submits clean HTML through a hidden field named
 * `name`, so it drops into any form that used a textarea.
 */
export function RichTextEditor({
  name,
  label,
  defaultValue = "",
  placeholder = "Rédigez votre article…",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Paste/drop handlers are created before `editor` exists; they read it from here.
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(editor: Editor, files: File[]) {
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const src = await uploadFile(file);
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        editor.chain().focus().setImage({ src, alt }).run();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    content: defaultValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: cn(ARTICLE_BODY_CLASSES, "min-h-[360px] px-5 py-4 focus:outline-none"),
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0 || !editorRef.current) return false;
        void insertImages(editorRef.current, files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0 || !editorRef.current) return false;
        event.preventDefault();
        void insertImages(editorRef.current, files);
        return true;
      },
    },
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? "" : e.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            alignLeft: e.isActive({ textAlign: "left" }),
            alignCenter: e.isActive({ textAlign: "center" }),
            alignRight: e.isActive({ textAlign: "right" }),
            alignJustify: e.isActive({ textAlign: "justify" }),
            block: e.isActive("heading", { level: 2 })
              ? "2"
              : e.isActive("heading", { level: 3 })
                ? "3"
                : e.isActive("heading", { level: 4 })
                  ? "4"
                  : "p",
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
            words: e.storage.characterCount?.words() ?? 0,
          }
        : null,
  });

  function setBlock(value: string) {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === "p") chain.setParagraph().run();
    else chain.setHeading({ level: Number(value) as 2 | 3 | 4 }).run();
  }

  function openLink() {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^(https?:|mailto:|tel:|\/)/i.test(url) ? url : `https://${url}` }).run();
    setLinkOpen(false);
  }

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={html} />

      <div className="overflow-hidden rounded-[10px] border border-border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/60 px-2 py-1.5">
          <ToolbarButton label="Annuler" disabled={!state?.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Rétablir" disabled={!state?.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <Divider />

          <select
            aria-label="Style du bloc"
            value={state?.block ?? "p"}
            onChange={(e) => setBlock(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border border-border bg-card px-2 text-sm text-foreground"
          >
            {BLOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Divider />

          <ToolbarButton label="Gras" active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Italique" active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Souligné" active={state?.underline} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Barré" active={state?.strike} onClick={() => editor?.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <Divider />

          <ToolbarButton label="Aligner à gauche" active={state?.alignLeft} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Centrer" active={state?.alignCenter} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Aligner à droite" active={state?.alignRight} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Justifier" active={state?.alignJustify} onClick={() => editor?.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <Divider />

          <ToolbarButton label="Liste à puces" active={state?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Liste numérotée" active={state?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Citation" active={state?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Séparateur" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <Divider />

          <ToolbarButton label="Lien" active={state?.link} onClick={openLink}>
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Insérer une image" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            )}
          </ToolbarButton>
          <ToolbarButton
            label="Effacer la mise en forme"
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (editor && files.length > 0) void insertImages(editor, files);
            }}
          />
        </div>

        {linkOpen && (
          <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") setLinkOpen(false);
              }}
              placeholder="https://… (vide = retirer le lien)"
              aria-label="Adresse du lien"
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={applyLink}
              className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Annuler
            </button>
          </div>
        )}

        <EditorContent editor={editor} />

        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
          <span>
            Astuce : collez ou glissez une image directement dans le texte.
          </span>
          <span>{state?.words ?? 0} mots</span>
        </div>
      </div>

      {error && <p role="alert" className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
