"use client";
import React from "react";
import EmailEditor from "./email-editor";
import { api, RouterOutputs } from "@/trpc/react";
import UseThreads from "../hooks/use-threads";
import { toast } from "sonner";

const ReplyBox = () => {
  const { threadId, accountId } = UseThreads();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId,
  });

  if (!replyDetails) {
    return null;
  }

  return <Component replyDetails={replyDetails} />;
};

const Component = ({
  replyDetails,
}: {
  replyDetails: RouterOutputs["account"]["getReplyDetails"];
}) => {
  const { threadId, accountId } = UseThreads();

  const [subject, setSubject] = React.useState(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );

  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.to.map((to) => ({
      label: to.address ?? to.name,
      value: to.address,
    })) || [],
  );
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.cc.map((cc) => ({
      label: cc.address ?? cc.name,
      value: cc.address,
    })) || [],
  );

  React.useEffect(() => {
    if (!replyDetails || !threadId) return;

    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }
    setToValues(
      replyDetails.to.map((to) => ({
        label: to.address ?? to.name,
        value: to.address,
      })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({
        label: cc.address ?? cc.name,
        value: cc.address,
      })),
    );
  }, [replyDetails, threadId]);

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    if (!replyDetails) return;

    sendEmail.mutate(
      {
        accountId,
        threadId: threadId ?? undefined,
        body: value,
        subject,
        from: replyDetails.from,
        to: replyDetails.to.map((to) => ({
          name: to.name ?? to.address,
          address: to.address,
        })),
        cc: replyDetails.cc.map((cc) => ({
          name: cc.name ?? cc.address,
          address: cc.address,
        })),
        replyTo: replyDetails.from,
        inReplyTo: replyDetails.id,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
        },
        onError: () => {
          toast.error("Email sending failed");
        },
      },
    );
  };
  return (
    <EmailEditor
      subject={subject}
      setSubject={setSubject}
      toValues={toValues}
      setToValues={(
        values: React.SetStateAction<{ label: string; value: string }[]>,
      ) => {
        return setToValues(values);
      }}
      ccValues={ccValues}
      setCcValues={(
        values: React.SetStateAction<{ label: string; value: string }[]>,
      ) => {
        setCcValues(values);
      }}
      to={toValues.map((to) => to.value)}
      handleSend={handleSend}
      isSending={sendEmail.isPending}
    />
  );
};

export default ReplyBox;
