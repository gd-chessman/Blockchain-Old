import { useLang } from "@/lang";
import React, { useState, useEffect, useRef } from "react";
import { Copy, Smile, Crown } from "lucide-react";
import { ToastNotification } from "@/ui/toast";
import { getChatAllHistories, getGroupHistories } from "@/services/api/ChatService";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime, truncateString } from "@/utils/format";
import { getInforWallet } from "@/services/api/TelegramWalletService";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import { ChatService } from "@/services/api";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { checkMaster } from "@/services/api/MasterTradingService";
import { useRouter } from "next/navigation";
import { langList } from "@/common";

interface ChatMemberProps {
  className?: string;
  walletAddress?: any;
}

export default function ChatMember({
  className,
  walletAddress,
}: ChatMemberProps) {
  const { t, lang } = useLang();
  const router = useRouter();

  const { data: checkMasterData } = useQuery({
    queryKey: ["checkMaster"],
    queryFn: () => checkMaster(walletAddress),
  });


  const { data: chatGroupHistoriesMember } = useQuery({
    queryKey: ["chatGroupHistoriesMember", checkMasterData?.groupConnect],
    queryFn: () => getGroupHistories(checkMasterData?.groupConnect, lang),
    enabled: Boolean(checkMasterData?.groupConnect),
  });
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const { message: wsMessage } = useWsChatMessage({
    chatType: "group",
    groupId: checkMasterData?.groupConnect,
  });

  useEffect(() => {
    if (chatGroupHistoriesMember) {
      const combinedMessages = [...chatGroupHistoriesMember.data];
      setMessages(combinedMessages);
    }
  }, [chatGroupHistoriesMember]);

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

  useEffect(() => {
    if (checkMasterData) {
      if (!checkMasterData.is_master) {
        router.push('/master-trade');
      } else if (!checkMasterData.isConnect) {
        setNotificationMessage(t("chat.walletNotJoinedGroup"));
      }
    }
  }, [checkMasterData, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await ChatService.sendGroupMessage(inputMessage, checkMasterData?.groupConnect, lang);
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
    <div className="flex items-center justify-center min-h-[90vh]">
      <div
        className={`max-w-4xl w-full flex flex-col p-6 border border-[#d8e8f7] rounded-lg shadow-sm ${className}`}
      >
        {showToast && (
          <ToastNotification message={t("createCoin.copySuccess")} />
        )}
        {notificationMessage && (
          <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded-lg mb-4">
            {notificationMessage}
          </div>
        )}
        <div
          ref={chatContainerRef}
          className="h-[35rem] overflow-y-auto mb-6 rounded-lg p-6 shadow-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-300"
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
          ))}
        </div>
        {!notificationMessage && (
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
              className="flex-1 border rounded-lg px-4 py-2 text-base outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#d8e8f7] text-black px-2 md:px-6 py-2 rounded-lg hover:bg-[#c8d8e7] transition-colors text-base"
            >
              {t("chat.send")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
