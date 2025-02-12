import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ThreadDateProps {
  sentAt: Date | undefined;
}

export const ThreadDate = ({ sentAt }: ThreadDateProps) => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (sentAt) {
      setFormattedDate(format(new Date(sentAt), "PPpp"));
    }
  }, [sentAt]);

  return (
    <div className="ml-auto text-xs text-muted-foreground">{formattedDate}</div>
  );
};
