import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import EmailEditor from "./email-editor";

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

  const handleSend = async (value: string) => {
    console.log("Sending email", value);
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
              isSending={false}
              defaultToolbarExpanded={true}
              handleSend={() => {
                handleSend;
              }}
            />
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ComposeButton;
