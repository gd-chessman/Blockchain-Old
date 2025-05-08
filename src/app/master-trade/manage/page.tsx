"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";
import { Copy, Crown } from "lucide-react";
import { useLang } from "@/lang/useLang";
import { MasterTradingService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { getMyConnects, getMyGroups } from "@/services/api/MasterTradingService";
import { getInforWallet } from "@/services/api/TelegramWalletService";
import { useRouter } from "next/navigation";
import { ToastNotification } from "@/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import LogWarring from "@/ui/log-warring";
import CreateGroup from "@/components/master-trade/manage/CreateGroup";
import GroupManagement from "@/components/master-trade/manage/GroupManagement";
import ConnectionManagement from "@/components/master-trade/manage/ConnectionManagement";
import ChatMaster from "@/components/chat/ChatMaster";

type Group = {
  mg_id: number;
  mg_name: string;
  mg_master_wallet: number;
  mg_option: string;
  mg_fixed_price: string;
  mg_fixed_ratio: number;
  mg_status: "on" | "off" | "delete";
  created_at: string;
};

type Connection = {
  connection_id: number;
  member_id: number;
  member_address: string;
  status: "connect" | "pending" | "pause" | "block";
  option_limit: string;
  price_limit: string;
  ratio_limit: number;
  joined_groups: {
    group_id: number;
    group_name: string;
  }[];
};

type WalletInfo = {
  role: string;
  // Add other wallet info properties if needed
};

export default function ManageMasterTrade() {
  const { isAuthenticated } = useAuth();
  const { data: myGroups = [] , refetch: refetchMyGroups} = useQuery<Group[]>({
    queryKey: ["my-groups-manage"],
    queryFn: async () => {
      const response = await getMyGroups();
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || [];
    },
  });

  const { data: myConnects = [], refetch: refetchMyConnects } = useQuery<Connection[]>({
    queryKey: ["my-connects-manage"],
    queryFn: getMyConnects,
  });

  const { data: walletInfor, isLoading } = useQuery<WalletInfo>({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
  });

  const router = useRouter();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("connected");
  const [groupName, setGroupName] = useState("");
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [activeGroupTab, setActiveGroupTab] = useState<"on" | "off" | "delete">("on");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && walletInfor?.role !== "master") {
      router.push("/master-trade");
    }
  }, [walletInfor, isLoading, router]);

  // Lọc kết nối dựa trên tab đang active
  const filteredConnections = myConnects.filter((connection) => {
    switch (activeTab) {
      case "pending":
        return connection.status === "pending";
      case "connected":
        return connection.status === "connect";
      case "paused":
        return connection.status === "pause";
      case "blocked":
        return connection.status === "block";
      default:
        return true;
    }
  });

  // Lọc nhóm dựa trên tab đang active
  const filteredGroups = myGroups.filter((group) => {
    switch (activeGroupTab) {
      case "on":
        return group.mg_status === "on";
      case "off":
        return group.mg_status === "off";
      case "delete":
        return group.mg_status === "delete";
      default:
        return true;
    }
  });

  // Xử lý tạo nhóm mới
  const handleCreateGroup = async () => {
    if (groupName.trim()) {
      try {
        await MasterTradingService.masterCreateGroup({ mg_name: groupName });
        setGroupName("");
        setToastMessage(t("masterTrade.manage.createNewGroup.success"));
        setShowToast(true);
        refetchMyGroups();
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        setToastMessage(t("masterTrade.manage.createNewGroup.error"));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  // Xử lý chọn/bỏ chọn tất cả kết nối
  const handleSelectAllConnections = (checked: boolean) => {
    if (checked) {
      setSelectedConnections(filteredConnections.map((c) => c.connection_id.toString()));
    } else {
      setSelectedConnections([]);
    }
  };

  // Xử lý chọn/bỏ chọn một kết nối
  const handleSelectConnection = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedConnections(prev => [...prev, id]);
    } else {
      setSelectedConnections(prev => prev.filter(item => item !== id));
    }
  };

  // Xử lý chọn/bỏ chọn một nhóm
  const handleSelectGroup = (groupId: number, checked: boolean) => {
    if (checked) {
      setSelectedGroup(groupId);
    } else {
      setSelectedGroup(null);
    }
  };

  // Xử lý bật/tắt nhóm
  const handleToggleGroup = async (id: number, newStatus: string) => {
    console.log(`Changing group ${id} status to ${newStatus}`);
    await MasterTradingService.changeStatusGroup(id, newStatus);
    refetchMyGroups();
    // Xử lý thay đổi trạng thái nhóm ở đây
  };

  // Xử lý xóa nhóm
  const handleDeleteGroup = async (id: number) => {
    await MasterTradingService.changeStatusGroup(id, "delete");
    refetchMyGroups();

    // Xử lý xóa nhóm ở đây
  };

  // Xử lý kết nối/ngắt kết nối
  const handleToggleConnection = async (id: number, action: string) => {
    try {
      if (action === "connect") {
        await MasterTradingService.masterSetConnect({ mc_id: id, status: "connect" });
      } else if (action === "block") {
        await MasterTradingService.masterSetConnect({ mc_id: id, status: "block" });
        refetchMyConnects()
      }
      refetchMyConnects();
    } catch (error) {
      console.error("Error toggling connection:", error);
      setToastMessage(t("masterTrade.manage.connectionManagement.error"));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Xử lý chặn/bỏ chặn kết nối
  const handleBlockConnection = async (id: number, block: boolean) => {
    try {
      await MasterTradingService.masterSetConnect({ 
        mc_id: id, 
        status: block ? "block" : "pause" 
      });
      
      // Refresh connections data
      refetchMyConnects();

      if (block) {
        setToastMessage(t("masterTrade.manage.connectionManagement.blockSuccess"));
      } else {
        setToastMessage(t("masterTrade.manage.connectionManagement.unblockSuccess"));
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error blocking connection:", error);
      setToastMessage(t("masterTrade.manage.connectionManagement.blockError"));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Xử lý sao chép địa chỉ
  const handleCopyAddress = (address: any) => {
    navigator.clipboard.writeText(address);
    setToastMessage(t("notifications.addressCopied"));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOpenJoinDialog = () => {
    if (selectedConnections.length > 0) {
      setIsJoinDialogOpen(true);
    } else {
      setToastMessage(t("masterTrade.manage.connectionManagement.selectConnection"));
      setShowToast(true);
    }
  };

  const handleJoin = async () => {
    if (selectedGroup && selectedConnections.length > 0) {
      try {
        // Lấy tất cả member_ids từ các kết nối đã chọn
        const memberIds = selectedConnections.map(connId => {
          const selectedConnection = myConnects.find(
            conn => conn.connection_id.toString() === connId
          );
          return selectedConnection?.member_id;
        }).filter(Boolean);

        if (memberIds.length > 0) {
          await MasterTradingService.masterSetGroup({
            mg_id: selectedGroup,
            member_ids: memberIds
          });
          setToastMessage(t("masterTrade.manage.connectionManagement.joinSuccess"));
          setShowToast(true);
          // Fetch lại dữ liệu sau khi join thành công
          refetchMyGroups();
          refetchMyConnects();
          setIsJoinDialogOpen(false);
          setSelectedGroup(null);
          setSelectedConnections([]);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch (error) {
        setToastMessage(t("masterTrade.manage.connectionManagement.joinError"));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  if (!isAuthenticated) return <LogWarring />;

  return (
    <div className="container mx-auto p-6">
      {showToast && <ToastNotification message={toastMessage} />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br bg-[#d8e8f7] text-black rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-800/20 animate-float">
          <Crown className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold font-comic bg-clip-text text-transparent bg-gradient-to-r bg-[#d8e8f7] uppercase">
            {t("masterTrade.manage.title")}
          </h1>
        </div>
        <Button className="mt-4 md:mt-0 bg-[#d8e8f7] text-black" onClick={() => router.push("/master-trade")}>
          {t("masterTrade.manage.connectWithOtherMaster")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
        {/* Create New Group */}
        <CreateGroup
          groupName={groupName}
          setGroupName={setGroupName}
          handleCreateGroup={handleCreateGroup}
        />

        {/* Group Management */}
        <GroupManagement
          activeGroupTab={activeGroupTab}
          setActiveGroupTab={setActiveGroupTab}
          myGroups={myGroups}
          filteredGroups={filteredGroups}
          selectedGroup={selectedGroup}
          handleSelectGroup={handleSelectGroup}
          handleToggleGroup={handleToggleGroup}
          handleDeleteGroup={handleDeleteGroup}
          className="lg:col-span-2"
        />
        <ChatMaster className="order-last lg:order-none lg:row-span-2" groups={myGroups} />
        

        {/* Connection Management */}
        <ConnectionManagement
          myConnects={myConnects}
          selectedGroup={selectedGroup}
          filteredConnections={filteredConnections}
          selectedConnections={selectedConnections}
          setActiveTab={setActiveTab}
          handleOpenJoinDialog={handleOpenJoinDialog}
          handleSelectAllConnections={handleSelectAllConnections}
          handleSelectConnection={handleSelectConnection}
          handleToggleConnection={handleToggleConnection}
          handleBlockConnection={handleBlockConnection}
          handleCopyAddress={handleCopyAddress}
          className="lg:col-span-3"
        />
      </div>

      {/* Join Group Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("masterTrade.manage.connectionManagement.joinGroup")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              {myGroups
                .filter(group => group.mg_id === selectedGroup)
                .map(group => (
                  <div key={group.mg_id} className="flex-1">
                    <p className="font-medium">{group.mg_name}</p>
                  </div>
                ))}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsJoinDialogOpen(false);
                    setSelectedGroup(null);
                  }}
                >
                  {t("masterTrade.manage.connectionManagement.cancel")}
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleJoin}
                >
                  {t("masterTrade.manage.connectionManagement.join")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
