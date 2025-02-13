"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenubar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TagInput from "./tag-input";
import { Input } from "@/components/ui/input";
import { s } from "node_modules/framer-motion/dist/types.d-6pKw1mTI";
import AiComposeButton from "./ai-compose-button";
import { generate } from "@/lib/action";
import { readStreamableValue } from "ai/rsc";
import { set } from "date-fns";

type Props = {
  subject: string;
  setSubject: (value: string) => void;

  toValues: { label: string; value: string }[];
  setToValues: (value: { label: string; value: string }[]) => void;

  ccValues: { label: string; value: string }[];
  setCcValues: (value: { label: string; value: string }[]) => void;

  to: string[];

  handleSend: (value: string) => void;
  isSending: boolean;

  defaultToolbarExpanded?: boolean;
};

const EmailEditor = ({
  subject,
  setSubject,
  toValues,
  setToValues,
  ccValues,
  setCcValues,
  to,
  handleSend,
  isSending,
  defaultToolbarExpanded,
}: Props) => {
  const [value, setValue] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<boolean>(
    defaultToolbarExpanded ?? false,
  );
  const [token, setToken] = React.useState("");

  const onGenerate = (token: string) => {
    editor?.commands.insertContent(token);
  };

  const aiGenerate = async () => {
    const { output } = await generate(value);

    for await (const token of readStreamableValue(output)) {
      if (token) {
        setToken(token);
      }
    }
  };

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          aiGenerate();
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, customText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
    editorProps: {
      attributes: {
        placeholder: "Write your email here...",
      },
    },
  });

  React.useEffect(() => {
    if (!token || !editor) return;
    editor.commands.insertContent(token);
  }, [editor, token]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        editor &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        editor.commands.focus();
      }
      if (event.key === "Escape" && editor) {
        editor.commands.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenubar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To"
              onChange={setToValues}
              placeholder="Add recipients"
              value={toValues}
            ></TagInput>
            <TagInput
              label="Cc"
              onChange={setCcValues}
              placeholder="Add recipients"
              value={ccValues}
            ></TagInput>
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="font-medium text-green-600">Draft {""}</span>
            {/* <span>to {to.join(", ")}</span> */}
          </div>
          <AiComposeButton
            isComposing={defaultToolbarExpanded ?? false}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent
          value={value}
          editor={editor}
          placeholder="Write your email here..."
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            await handleSend(value);
            editor.commands.clearContent();
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
