import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import EmailEditor from "./email-editor";
import UseThreads from "../hooks/use-threads";
import { toast } from "sonner";

const ComposeButton = () => {
  const [open, setOpen] = React.useState(false);
  const [accountId] = useLocalStorage("accountId", "");
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [subject, setSubject] = React.useState<string>("");
  const data = null;

  const sendEmail = api.account.sendEmail.useMutation();
  const { account } = UseThreads();

  const handleSend = async (value: string) => {
    console.log("send", value);
    if (!account) return;
    sendEmail.mutate(
      {
        accountId,
        threadId: undefined,
        body: value,
        subject,
        from: {
          name: account?.name ?? "Me",
          address: account?.emailAddress ?? "me@example.com",
        },
        to: toValues.map((to) => ({ name: to.value, address: to.value })),
        cc: ccValues.map((cc) => ({ name: cc.value, address: cc.value })),
        replyTo: {
          name: account?.name ?? "Me",
          address: account?.emailAddress ?? "me@example.com",
        },
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
          setOpen(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>
            <Pencil className="mr-1 size-4" />
            Compose
          </Button>
        </DrawerTrigger>
        <DrawerContent className="">
          <DrawerHeader>
            <DrawerTitle className="pb-2 pl-4">Compose Email</DrawerTitle>
            <EmailEditor
              toValues={toValues}
              ccValues={ccValues}
              setToValues={(values) => {
                setToValues(values);
              }}
              setCcValues={(values) => {
                setCcValues(values);
              }}
              subject={subject}
              setSubject={setSubject}
              to={[]}
              isSending={sendEmail.isPending}
              defaultToolbarExpanded={true}
              handleSend={handleSend}
            />
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ComposeButton;
