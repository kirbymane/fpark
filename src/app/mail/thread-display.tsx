import React from "react";
import UseThreads from "../hooks/use-threads";
import {
  Archive,
  ArchiveXIcon,
  Clock,
  MoreVertical,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThreadDate } from "./thread-date";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";
import { useAtom } from "jotai";
import { isSearchingAtom } from "./search-bar";
import SearchDisplay from "./search-display";

const ThreadDisplay = () => {
  const { threadId, threads } = UseThreads();
  const thread = threads?.find((t) => t.id === threadId);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);

  return (
    <div className="h-hull flex flex-col">
      {/* { buttons row} */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={!thread}>
            <ArchiveXIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={!thread}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Button variant="ghost" size="icon" disabled={!thread}>
          <Clock className="size-4" />
        </Button>

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!thread}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {isSearching ? (
        <SearchDisplay />
      ) : (
        <>
          {" "}
          {thread ? (
            <>
              <div className="flex flex-1 flex-col overflow-scroll">
                <div className="flex items-center p-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Avatar>
                      <AvatarImage alt={"avatar"} />
                      <AvatarFallback>
                        {(
                          thread?.emails[0]?.from?.name ||
                          thread?.emails[0]?.from?.address
                        )
                          ?.split(" ")
                          .map((chunk) => chunk[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-semibold">
                        {thread.emails[0]?.from?.name ||
                          thread?.emails[0]?.from?.address}
                      </div>
                      <div className="line-clamp-1 text-xs">
                        {thread.emails[0]?.subject}
                      </div>
                      <div className="line-clamp-1 text-xs">
                        <span className="font-medium">Reply-To:</span>{" "}
                        {thread.emails[0]?.from?.address}
                      </div>
                    </div>
                  </div>
                  <ThreadDate sentAt={thread.emails[0]?.sentAt} />
                </div>
                <Separator />
                <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll">
                  <div className="flex flex-col gap-4 p-6">
                    {thread.emails.map((email) => {
                      return <EmailDisplay key={email.id} email={email} />;
                    })}
                  </div>
                </div>
                <div className="flex-1"></div>
                <Separator className="mt-auto" />
                <ReplyBox />
              </div>
            </>
          ) : (
            <>
              <div className="p-8 text-center text-muted-foreground">
                No message selected
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
