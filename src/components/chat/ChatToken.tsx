import { useLang } from "@/lang";
import { Card } from "@/ui/card";
import React, { useState, useEffect, useRef } from "react";
import { Copy, Smile } from "lucide-react";
import { ToastNotification } from "@/ui/toast";
import {
  getTokenHistories,
  readTokenMessage,
} from "@/services/api/ChatService";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime, truncateString } from "@/utils/format";
import { getInforWallet } from "@/services/api/TelegramWalletService";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import { ChatService } from "@/services/api";
import { useSearchParams } from "next/navigation";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { langList } from "@/common";

interface ChatTokenProps {
  className?: string;
}

export default function ChatToken({ className }: ChatTokenProps) {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const tokenAddress = searchParams?.get("address");
  const { data: chatTokenHistories, refetch: refetchChatTokenHistories } =
    useQuery({
      queryKey: ["chatTokenHistories", tokenAddress, lang],
      queryFn: () => getTokenHistories(tokenAddress || "", lang),
      refetchOnMount: true,
      enabled: !!tokenAddress,
    });
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });

  const { data: tokenMessageData, refetch: refetchTokenMessage } = useQuery({
    queryKey: ["readTokenMessage", tokenAddress],
    queryFn: () => readTokenMessage(tokenAddress || ""),
    enabled: !!tokenAddress,
    refetchOnMount: true,
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { message: wsMessage } = useWsChatMessage({
    chatType: "token",
    tokenAddress: tokenAddress || "",
  });

  // Reset states when tokenAddress changes
  useEffect(() => {
    setMessages([]);
    setInputMessage("");
  }, [tokenAddress]);

  useEffect(() => {
    if (chatTokenHistories) {
      const combinedMessages = [...chatTokenHistories.data];
      setMessages(combinedMessages);
    }
  }, [chatTokenHistories]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      // chatContainerRef.current.style.scrollBehavior = 'smooth';
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.style.scrollBehavior = "auto";
        }
      }, 500);
    }
  }, [messages.length]);

  useEffect(() => {
    if (wsMessage) {
      setMessages((prevMessages) => [...prevMessages, wsMessage]);
    }
  }, [wsMessage]);

  useEffect(() => {
    return () => {
      refetchTokenMessage();
    };
  }, [refetchTokenMessage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await ChatService.sendTokenMessage(
        inputMessage,
        tokenAddress || "",
        lang
      );
      refetchTokenMessage();
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
    <div className={`w-full ${className}`}>
      <Card className="rounded-lg shadow-lg p-4 w-full">
        {showToast && (
          <ToastNotification message={t("createCoin.copySuccess")} />
        )}
        <div
          ref={chatContainerRef}
          className="h-[29.5rem] overflow-y-auto mb-4 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-300"
        >
          {messages.map((message: any, index: number) => (
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
          ))}
        </div>
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
      </Card>
    </div>
  );
}
