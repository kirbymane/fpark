"use-client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/action";
import { readStreamableValue } from "ai/rsc";
import UseThreads from "../hooks/use-threads";
import { turndown } from "@/lib/turndown";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AiComposeButton = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const { threads, threadId, account } = UseThreads();
  const thread = threads?.find((t) => t.id === threadId);

  const aiGenerate = async (prompt: string) => {
    let context = "";

    if (!props.isComposing) {
      for (const email of thread?.emails ?? []) {
        const content = `
            Subject: ${email.subject}
            From: ${email.from}
            Sent: ${new Date(email.sentAt).toLocaleString()}
            Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
          `;

        context += content;
      }
    }

    context += `My name is ${account?.name} and my email is ${account?.emailAddress}`;

    const { output } = await generateEmail(context, prompt);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        props.onGenerate(delta);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} size="icon" variant={"outline"}>
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            AI will help you compose your email.
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt."
          />
          <div className="h-2"></div>
          <Button
            onClick={() => {
              aiGenerate(prompt);
              setOpen(false);
              setPrompt("");
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AiComposeButton;
