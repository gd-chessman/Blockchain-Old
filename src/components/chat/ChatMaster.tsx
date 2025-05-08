import { useLang } from "@/lang";
import { Card } from "@/ui/card";
import React, { useState, useEffect, useRef } from "react";
import { Copy, Crown, Smile } from "lucide-react";
import { ToastNotification } from "@/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  getChatAllHistories,
  getGroupHistories,
} from "@/services/api/ChatService";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime, truncateString } from "@/utils/format";
import { getInforWallet } from "@/services/api/TelegramWalletService";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import { ChatService } from "@/services/api";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { langList } from "@/common";

interface ChatMasterProps {
  className?: string;
  groups: any[];
  defaultGroupId?: string;
}

export default function ChatMaster({
  className,
  groups,
  defaultGroupId,
}: ChatMasterProps) {
  const { t, lang } = useLang();
  const [showToast, setShowToast] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<string>(
    defaultGroupId || ""
  );
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { data: chatGroupHistories, refetch: refetchChatGroupHistories } =
    useQuery({
      queryKey: ["chatGroupHistories", selectedGroup, lang],
      queryFn: () => getGroupHistories(selectedGroup, lang),
      enabled: !!selectedGroup,
    });

  const { data: walletInfor } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });

  const { message: wsMessage } = useWsChatMessage({
    chatType: "group",
    groupId: selectedGroup,
  });

  useEffect(() => {
    if (chatGroupHistories) {
      const combinedMessages = [...chatGroupHistories.data];
      setMessages(combinedMessages);
    }
  }, [chatGroupHistories]);

  useEffect(() => {
    if (selectedGroup) {
      refetchChatGroupHistories();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop =
          chatContainerRef.current!.scrollHeight;
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    if (wsMessage) {
      setMessages((prevMessages) => [...prevMessages, wsMessage]);
    }
  }, [wsMessage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await ChatService.sendGroupMessage(inputMessage, selectedGroup, lang);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setInputMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`w-full mb-16 md:mb-0 ${className}`}>
      <Card className="rounded-lg shadow-lg p-4 w-full h-full flex flex-col max-h-[64rem] min-h-[25rem]">
        {showToast && (
          <ToastNotification message={t("createCoin.copySuccess")} />
        )}
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("chat.selectGroup")} />
            </SelectTrigger>
            <SelectContent>
              {groups
                ?.filter((group) => group.mg_status === "on")
                .map((group) => (
                  <SelectItem key={group.mg_id} value={group.mg_id}>
                    {group.mg_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-300"
        >
          {!selectedGroup ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {t("chat.pleaseSelectGroup")}
            </div>
          ) : (
            messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`mb-2 p-1 rounded-lg ${
                  walletInfor?.solana_address === message.ch_wallet_address
                    ? "bg-[#d8e8f7] text-black ml-auto max-w-[80%]"
                    : "bg-gray-100 text-black mr-auto max-w-[80%]"
                }`}
              >
                <div className="w-full">
                  <div className="text-sm break-words whitespace-pre-wrap flex items-center gap-2">
                    {message.ch_is_master && (
                      <Crown
                        size={12}
                        className="inline-block mr-1 text-yellow-500"
                      />
                    )}
                    <img
                      src={
                        langList.find((lang) => lang.code === message.country)
                          ?.flag || langList[0].flag
                      }
                      alt={message.country}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="text-xs text-gray-600">
                      {truncateString(message.nick_name, 20)}
                    </span>
                    <span>:</span> {message.ch_content}
                  </div>
                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {selectedGroup && (
          <div className="flex gap-2">
            <div className="relative flex items-center">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-[#d8e8f7] text-black p-1.5 rounded-lg hover:bg-[#c8d8e7] transition-colors flex items-center justify-center"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    previewPosition="none"
                    searchPosition="none"
                    skinTonePosition="none"
                    navPosition="none"
                    maxFrequentRows={0}
                  />
                </div>
              )}
            </div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.placeholder")}
              className="flex-1 border rounded-lg px-3 py-1.5 outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#d8e8f7] text-black px-4 py-1.5 rounded-lg hover:bg-[#c8d8e7] transition-colors"
            >
              {t("chat.send")}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
