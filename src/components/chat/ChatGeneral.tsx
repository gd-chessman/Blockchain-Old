"use client";
import { useLang } from "@/lang";
import { Card } from "@/ui/card";
import React, { useState, useEffect, useRef } from "react";
import { Copy, MessageSquare, Smile } from "lucide-react";
import { ToastNotification } from "@/ui/toast";
import { getChatAllHistories } from "@/services/api/ChatService";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime, truncateString } from "@/utils/format";
import { getInforWallet } from "@/services/api/TelegramWalletService";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import { ChatService } from "@/services/api";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { langList } from "@/common";

export default function ChatGeneral({ className }: { className?: string }) {
  const {t,  lang } = useLang();
  const { data: chatAllHistories } = useQuery({
    queryKey: ["chatAllHistories", lang],
    queryFn: () => getChatAllHistories(lang),
  });
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { message: wsMessage,  } = useWsChatMessage({
    chatType: 'all'
  });

  const [position, setPosition] = useState({ left: 0, right: 0, bottom: 0, top: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragOperation, setIsDragOperation] = useState(false);

  const isInAllowedArea = (clientX: number, clientY: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonSize = 48;

    // Allow dragging anywhere within the window bounds, with a small margin
    const isXInBounds = clientX >= 0 && clientX <= windowWidth;
    const isYInBounds = clientY >= 0 && clientY <= windowHeight;

    return isXInBounds && isYInBounds;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsDragOperation(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragOperation(true);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const buttonSize = 48;

      // Calculate new position based on mouse movement
      let newLeft = e.clientX - dragOffset.x;
      let newTop = e.clientY - dragOffset.y;

      // Check if we're on the left or right side
      const isLeftSide = position.left < windowWidth / 2;

      // Switch sides if dragged past the middle
      if (isLeftSide && e.clientX > windowWidth / 2) {
        newLeft = e.clientX - dragOffset.x;
      } else if (!isLeftSide && e.clientX < windowWidth / 2) {
        newLeft = e.clientX - dragOffset.x;
      }

      // Ensure horizontal bounds
      newLeft = Math.max(0, Math.min(newLeft, windowWidth - buttonSize));

      // Ensure vertical bounds
      newTop = Math.max(0, Math.min(newTop, windowHeight - buttonSize));

      // Calculate right and bottom positions
      const newRight = windowWidth - newLeft - buttonSize;
      const newBottom = windowHeight - newTop - buttonSize;

      // Only update if in allowed area
      if (isInAllowedArea(e.clientX, e.clientY)) {
        const newPosition = {
          left: newLeft,
          right: newRight,
          top: newTop,
          bottom: newBottom
        };
        
        setPosition(newPosition);
        localStorage.setItem('chatButtonPosition', JSON.stringify(newPosition));
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Reset isDragOperation sau 100ms
      setTimeout(() => {
        setIsDragOperation(false);
      }, 100);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (chatAllHistories) {
      const combinedMessages = [...chatAllHistories.data];
      setMessages(combinedMessages);
      
      // Count unread messages by comparing last_read with message timestamps
      const lastReadTime = new Date(chatAllHistories.last_read).getTime();
      const unreadCount = combinedMessages.filter(message => 
        new Date(message.createdAt).getTime() > lastReadTime
      ).length;
      
      setUnreadCount(unreadCount);
    }
  }, [chatAllHistories]);

  useEffect(() => {
    if (isChatVisible && messages.length > 0 && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 100);
    }
  }, [isChatVisible, messages.length]);

  useEffect(() => {
    if (wsMessage) {
      const messageExists = messages.some(msg => 
        msg.ch_wallet_address === wsMessage.ch_wallet_address && 
        msg.ch_content === wsMessage.ch_content && 
        msg.createdAt === wsMessage.createdAt
      );
      
      if (!messageExists) {
        setMessages(prevMessages => [...prevMessages, wsMessage]);
        if (!isChatVisible) {
          setUnreadCount(prev => prev + 1);
        } else {
          // Call readAllMessage when chat is visible and new message arrives
          ChatService.readAllMessage();
        }
      }
    }
  }, [wsMessage, isChatVisible, messages]);

  useEffect(() => {
    if (isChatVisible) {
      setUnreadCount(0);
    }
  }, [isChatVisible]);

  useEffect(() => {
    const savedPosition = localStorage.getItem('chatButtonPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      setPosition({ 
        left: windowWidth - 50,
        right: 50,
        top: windowHeight - 50,
        bottom: 50
      });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      await ChatService.sendAllMessage(inputMessage, lang);
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
    setInputMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleChatButtonClick = async () => {
    // Nếu đang trong quá trình kéo thả thì không mở chat
    if (isDragOperation) return;
    
    try {
      setIsChatVisible(!isChatVisible);   
      await ChatService.readAllMessage();
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const getChatWindowPosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = 448; // 28rem = 448px
    const chatHeight = windowHeight - 160; // 10rem = 160px

    // Xác định vị trí của khung chat dựa trên vị trí của nút chat
    let left, top;

    // Nếu nút chat nằm ở nửa trên màn hình
    if (position.top < windowHeight / 2) {
      top = position.top + 60; // Hiển thị khung chat bên dưới nút chat
    } else {
      top = position.top - chatHeight - 30; // Hiển thị khung chat bên trên nút chat
    }

    // Nếu nút chat nằm ở nửa phải màn hình
    if (position.left > windowWidth / 2) {
      left = position.left - chatWidth - 30; // Hiển thị khung chat bên trái nút chat
    } else {
      left = position.left + 60; // Hiển thị khung chat bên phải nút chat
    }

    // Đảm bảo khung chat không bị tràn ra ngoài màn hình
    left = Math.max(20, Math.min(left, windowWidth - chatWidth - 20));
    top = Math.max(20, Math.min(top, windowHeight - chatHeight - 20));

    return { left, top };
  };

  return (
    <>
      {walletInfor?.solana_address && (
        <>
          <button
            ref={chatButtonRef}
            onClick={handleChatButtonClick}
            onMouseDown={handleMouseDown}
            style={{
              position: 'fixed',
              left: position.left > window.innerWidth / 2 ? 'auto' : `${position.left}px`,
              right: position.left > window.innerWidth / 2 ? `${position.right}px` : 'auto',
              top: position.top > window.innerHeight / 2 ? 'auto' : `${position.top}px`,
              bottom: position.top > window.innerHeight / 2 ? `${position.bottom}px` : 'auto',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="bg-[#d8e8f7] text-black p-3 rounded-full shadow-lg hover:bg-[#c8d8e7] transition-colors z-[999]"
          >
            {isChatVisible ? (
              <MessageSquare size={24} />
            ) : (
              <MessageSquare size={24} />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-2 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isChatVisible && (
            <div
              ref={chatWindowRef}
              style={{
                position: 'fixed',
                left: position.left > window.innerWidth / 2 ? 'auto' : `${position.left + 56}px`,
                right: position.left > window.innerWidth / 2 ? `${position.right + 56}px` : 'auto',
                top: position.top > window.innerHeight / 2 ? 'auto' : `${Math.min(position.top + 60, window.innerHeight - (window.innerHeight - 160) - 20)}px`,
                bottom: position.top > window.innerHeight / 2 ? `${Math.min(position.bottom + 60, window.innerHeight - (window.innerHeight - 160) - 20)}px` : 'auto',
                zIndex: 998
              }}
              className={`md:w-[28rem] h-[calc(100vh-10rem)] ${className}`}
            >
              <Card className="rounded-lg shadow-lg p-4 w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setIsChatVisible(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
                {showToast && (
                  <ToastNotification message={t("createCoin.copySuccess")} />
                )}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-300"
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
                            src={langList.find(lang => lang.code === message.country)?.flag || langList[0].flag} 
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
          )}
        </>
      )}
    </>
  );
}