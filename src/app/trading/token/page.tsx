"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Button } from "@/ui/button";
import {
  BarChart4,
} from "lucide-react";
import { useEffect, useState, useRef, Suspense } from "react";
import { useLang } from "@/lang";
import { toast } from "react-toastify";
import usePercent from "@/hooks/usePercent";
import { useSearchParams } from "next/navigation";
import {
  getMyWishlist,
  getTokenInforByAddress,
  getTokenPrice,
} from "@/services/api/SolonaTokenService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWsSubscribeTokens } from "@/hooks/useWsSubscribeTokens";
import {
  getOrders,
  getTokenAmount,
  createTrading,
} from "@/services/api/TradingService";
import {
  getInforWallet,
  getMyTokens,
} from "@/services/api/TelegramWalletService";
import {
  getMyConnects,
  getMyGroups,
} from "@/services/api/MasterTradingService";
import { Checkbox } from "@/ui/checkbox";
import { useDebounce } from "@/hooks/useDebounce";
import { SolonaTokenService } from "@/services/api";
import Select from "react-select";
import LogWarring from "@/ui/log-warring";
import { useAuth } from "@/hooks/useAuth";
import { ToastNotification } from "@/ui/toast";
import { getPriceSolona } from "@/services/api/SolonaTokenService";
import { getWalletBalanceByAddress } from "@/services/api/TelegramWalletService";
import MyCoins from "@/components/trading/token/MyCoins";
import OtherCoins from "@/components/trading/token/OtherCoins";
import HistoryTransactions from "@/components/trading/token/HistoryTransactions";
import dynamic from 'next/dynamic'
import TokenInforDetail from "@/components/trading/token/ui/TokenInforDetail";
import { getOrderHistories, getOrderHistoriesByOwner, getTopCoins } from "@/services/api/OnChainService";
import ChatToken from "@/components/chat/ChatToken";
import ConnectedMembers from "@/components/trading/token/ConnectedMembers";
import PlaceOrder from "@/components/trading/token/PlaceOrder";
import { getTokenHistories } from "@/services/api/ChatService";
import { useWsChatMessage } from "@/hooks/useWsChatMessage";
import HistoryMyTransactions from "@/components/trading/token/HistoryMyTransactions";

interface Order {
  created_at: string;
  trade_type: "buy" | "sell";
  price: number;
  quantity: number;
  status: "pending" | "completed" | "cancelled";
}

interface Connect {
  connection_id: number;
  member_id: number;
  member_address: string;
  status: string;
  option_limit: string;
  price_limit: string;
  ratio_limit: number;
  joined_groups: Array<{
    group_id: number;
    group_name: string;
  }>;
}

const TradingChart = dynamic(() => import('@/components/trading/token/TradingChart'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  )
})

function TradingContent() {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [tokens, setTokens] = useState<
    {
      id: number;
      name: string;
      address: string;
      symbol: string;
      decimals: number;
      isVerified: boolean;
      logoUrl: string;
      program: string;
    }[]
  >([]);
  const [value, setValue] = useState(0);
  const [amount, setAmount] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const { data: tokenInfor, refetch } = useQuery({
    queryKey: ["token-infor", address],
    queryFn: () => getTokenInforByAddress(address),
  });
  const { data: tokenPrice } = useQuery({
    queryKey: ["token-price", address],
    queryFn: () => getTokenPrice(address),
  });
  const { data: solPrice } = useQuery({
    queryKey: ["sol-price"],
    queryFn: () => getPriceSolona(),
  });
  const { data: memeCoins = [] } = useQuery({
    queryKey: ["my-tokens"],
    queryFn: getMyTokens,
  });
  const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
    queryKey: ["topCoins_market_cap"],
    queryFn: () =>
      getTopCoins({
        sort_by: "market_cap",
        sort_type: "desc",
        offset: 0,
        limit: 18,
      }),
  });
  const { data: walletInfor, refetch: refetchWalletInfor } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
  const { data: orderHistories, isLoading: isLoadingOrderHistories , refetch: refetchOrderHistories} = useQuery(
    {
      queryKey: ["orderHistories", address],
      queryFn: () =>
        getOrderHistories({
          address: address || "",
          offset: 0,
          limit: 100,
          sort_by: "block_unix_time",
          sort_type: "desc",
          tx_type: "swap",
        }),
      enabled: !!address && !!walletInfor?.solana_address,
    }
  );

  const { data: orderHistoriesMy, isLoading: isLoadingOrderHistoriesMy , refetch: refetchOrderHistoriesMy} = useQuery(
    {
      queryKey: ["orderHistoriesMy", address],
      queryFn: () =>
        getOrderHistoriesByOwner({
          address: address || "",
          offset: 0,
          limit: 100,
          sort_by: "block_unix_time",
          sort_type: "desc",
          tx_type: "swap",
          owner: walletInfor?.solana_address || "",
        }),
      enabled: !!address && !!walletInfor?.solana_address,
    }
  );

  const { data: orders, refetch: refetchOrders } = useQuery({
    queryKey: ["orders-old"],
    queryFn: () => getOrders(address),
  });
  const { data: connects = [] } = useQuery({
    queryKey: ["connects"],
    queryFn: getMyConnects,
    refetchOnWindowFocus: false
  });
  const { data: groupsResponse } = useQuery({
    queryKey: ["groups"],
    queryFn: getMyGroups,
  });
  const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
    queryKey: ["myWishlist"],
    queryFn: getMyWishlist,
    refetchOnMount: true,
  });

  const { data: chatTokenHistories , refetch: refetchChatTokenHistories } = useQuery({
    queryKey: ["chatTokenHistories", address, lang],
    queryFn: () => getTokenHistories(address || "", lang),
    enabled: !!address,
    refetchOnMount: true,
  });

  const [messageCount, setMessageCount] = useState(0);
  const [realtimeUnreadCount, setRealtimeUnreadCount] = useState(0);
  const { message: wsMessage } = useWsChatMessage({
    chatType: "token",
    tokenAddress: address || "",
  });

  // Count unread messages by comparing last_read with createdAt
  useEffect(() => {
    if (chatTokenHistories?.last_read && chatTokenHistories?.data) {
      const lastReadDate = new Date(chatTokenHistories.last_read);
      const unreadCount = chatTokenHistories.data.filter(
        (message: { createdAt: string }) => new Date(message.createdAt) > lastReadDate
      ).length;
      setMessageCount(unreadCount);
    }
  }, [chatTokenHistories]);

  // Handle real-time unread messages from WebSocket
  useEffect(() => {
    if (wsMessage && chatTokenHistories?.last_read) {
      const lastReadDate = new Date(chatTokenHistories.last_read);
      if (new Date(wsMessage.createdAt) > lastReadDate) {
        setRealtimeUnreadCount(prev => prev + 1);
      }
    }
  }, [wsMessage, chatTokenHistories?.last_read]);

  const [activeTab, setActiveTab] = useState("buy");
  const [selectedAction, setSelectedAction] = useState<"buy" | "sell">("buy");
  const [activeInfoTab, setActiveInfoTab] = useState("placeorder");
  const { data: tokenAmount, refetch: refetchTokenAmount } = useQuery({
    queryKey: ["tokenAmount", address, activeTab, selectedAction],
    queryFn: () => getTokenAmount(address),
  });
  const [checkedConnections, setCheckedConnections] = useState<
    Record<number, boolean>
  >({});
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // console.log("orderMessages", orderMessages);
  const marks = [0, 25, 50, 75, 100];
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      logoUrl: string;
      coingeckoId: string | null;
      tradingviewSymbol: string | null;
      isVerified: boolean;
      marketCap: number;
      program: string;
      price?: number;
    }[]
  >([]);

  // Effect to handle search when debounced value changes
  useEffect(() => {
    const searchData = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await SolonaTokenService.getSearchTokenInfor(
          debouncedSearchQuery
        );
        setSearchResults(res.tokens || []);
      } catch (error) {
        console.error("Error searching tokens:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchData();
  }, [debouncedSearchQuery]);

  // Update tokens when topCoins data changes
  useEffect(() => {
    if (topCoins && topCoins.length > 0) {
      setTokens(topCoins);
    }
  }, [topCoins]);

  const handleTimeframeChange = (timeframe: string) => {
    console.log(`Timeframe changed to: ${timeframe}`);
    // Trong ứng dụng thực tế, bạn sẽ tải dữ liệu mới dựa trên khung thời gian
  };
  const { percentages, setPercentage } = usePercent();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [solAmounts, setSolAmounts] = useState<string[]>([
    "0.1",
    "0.5",
    "1",
    "2",
  ]);

  useEffect(() => {
    const savedAmounts = localStorage.getItem("solAmounts");
    if (savedAmounts) {
      setSolAmounts(JSON.parse(savedAmounts));
    }
  }, []);

  const [editingSolIndex, setEditingSolIndex] = useState<number | null>(null);
  const [tempSolValue, setTempSolValue] = useState<string>("");

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setTempValue(percentages[index]);
  };

  const handleSave = (index: number) => {
    if (tempValue.trim()) {
      setPercentage(index, tempValue);
    }
    setEditingIndex(null);
  };

  const handleSolEditClick = (index: number) => {
    setEditingSolIndex(index);
    setTempSolValue(solAmounts[index]);
  };

  const handleSolSave = (index: number) => {
    if (tempSolValue.trim()) {
      const newSolAmounts = [...solAmounts];
      newSolAmounts[index] = tempSolValue;
      setSolAmounts(newSolAmounts);
      localStorage.setItem("solAmounts", JSON.stringify(newSolAmounts));
    }
    setEditingSolIndex(null);
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"info" | "success" | "error">("info");

  useEffect(() => {
    refetchTokenAmount();
  }, [activeTab, selectedAction, refetchTokenAmount]);

  const handleActionClick = (action: "buy" | "sell") => {
    if (selectedAction !== action) {
      setSelectedAction(action);
      setValue(0); // Reset percentage when switching actions
      setAmount(""); // Reset amount when switching actions
      // Reset all checkboxes to false using the same pattern as initialization
      const resetCheckedState = connects.reduce(
        (acc: Record<number, boolean>, connect: Connect) => {
          acc[connect.connection_id] = false;
          return acc;
        },
        {}
      );
      setCheckedConnections(resetCheckedState);
      setSelectedMembers([]); // Reset selected members list
    }
  };

  useEffect(() => {
    // Initialize checked state to false for all connections
    const initialCheckedState = connects.reduce(
      (acc: Record<number, boolean>, connect: Connect) => {
        acc[connect.connection_id] = false;
        return acc;
      },
      {}
    );
    setCheckedConnections(initialCheckedState);
  }, [connects]);

  const handleCheckboxChange = (connectionId: number, memberId: number) => {
    setCheckedConnections((prev) => ({
      ...prev,
      [connectionId]: !prev[connectionId],
    }));

    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAmount(newValue);

    // Tính toán phần trăm dựa trên số lượng nhập vào
    if (selectedAction === "buy" && tokenAmount?.data?.sol_balance) {
      const percentage =
        (Number(newValue) / tokenAmount.data.sol_balance) * 100;
      setValue(Math.min(100, Math.max(0, percentage)));
    } else if (selectedAction === "sell" && tokenAmount?.data?.token_balance) {
      let percentage =
        (Number(newValue) / tokenAmount.data.token_balance) * 100;
      // Nếu là bán và đang ở 100%, giữ lại 0.1% làm phí
      if (percentage >= 100) {
        percentage = 100;
        setAmount((tokenAmount.data.token_balance * 0.99999).toFixed(5));
      }
      setValue(Math.min(100, Math.max(0, percentage)));
    }
  };

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    // Tính toán số lượng dựa trên phần trăm và action hiện tại
    if (selectedAction === "buy" && tokenAmount?.data?.sol_balance) {
      const calculatedAmount = (tokenAmount.data.sol_balance * newValue) / 100;
      setAmount(calculatedAmount.toFixed(5));
    } else if (selectedAction === "sell" && tokenAmount?.data?.token_balance) {
      let calculatedAmount = (tokenAmount.data.token_balance * newValue) / 100;
      // Nếu là bán và đang ở 100%, giữ lại 0.1% làm phí
      if (newValue >= 100) {
        calculatedAmount = tokenAmount.data.token_balance * 0.99999;
        setValue(100);
      }
      setAmount(calculatedAmount.toFixed(5));
    }
  };

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const currentPendingOrderRef = useRef<Order | null>(null);

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (tokenAmount?.data) {
      setBalance(
        selectedAction === "buy"
          ? tokenAmount.data.sol_balance
          : tokenAmount.data.token_balance
      );
    }
  }, [tokenAmount, selectedAction]);

  const handleTrading = async () => {
    try {
      // Reset form and member list immediately when button is clicked
      setSelectedMembers([]);
      // Reset all checkboxes to false using the same pattern as initialization
      const resetCheckedState = connects.reduce(
        (acc: Record<number, boolean>, connect: Connect) => {
          acc[connect.connection_id] = false;
          return acc;
        },
        {}
      );
      setCheckedConnections(resetCheckedState);
      setValue(0);
      const oldAmount = amount; // Lưu lại amount cũ
      setAmount(""); // Reset về rỗng ban đầu
      setSelectedGroups([]); // Reset selected groups

      // Show processing notification
      // setToastMessage(t("notifications.tradingProcessing"));
      // setToastType("info");
      // setShowToast(true);

      // Add pending order to local state
      const newPendingOrder: Order = {
        created_at: new Date().toISOString(),
        trade_type: selectedAction,
        price:
          selectedAction === "sell"
            ? Number(oldAmount) * (tokenPrice?.priceUSD || 0)
            : Number(oldAmount) * (solPrice?.priceUSD || 0),
        quantity: Number(oldAmount),
        status: "pending",
      };
      currentPendingOrderRef.current = newPendingOrder;
      setPendingOrders((prev) => [...prev, newPendingOrder]);

      const response = await createTrading({
        order_trade_type: selectedAction,
        order_type: "market",
        order_token_name: tokenInfor?.name || "No name",
        order_token_address: address || "",
        order_price:
          selectedAction === "sell"
            ? Number(oldAmount) * (tokenPrice?.priceUSD || 0)
            : Number(oldAmount) * (solPrice?.priceUSD || 0),
        order_qlty: Number(oldAmount),
        member_list: selectedMembers,
      });

      if (response.status === 201) {
        // Show success notification
        setToastMessage(t("notifications.tradingSuccess"));
        setToastType("success");
        setShowToast(true);

        // Fetch lại tất cả dữ liệu
        const [
          ordersResult,
          tokenAmountResult,
          tokenInforResult,
          walletResult,
        ] = await Promise.all([
          refetchOrders(), // Cập nhật lịch sử giao dịch
          refetchTokenAmount(), // Cập nhật số dư
          refetch(), // Cập nhật thông tin token
          refetchWalletInfor(), // Cập nhật số dư SOL ở header
        ]);

        // Force update UI with new data
        if (tokenAmountResult.data?.data) {
          queryClient.setQueryData(
            ["tokenAmount", address, activeTab, selectedAction],
            tokenAmountResult.data
          );

          // Lưu balance hiện tại để so sánh
          const currentBalance =
            selectedAction === "buy"
              ? tokenAmountResult.data.data.sol_balance
              : tokenAmountResult.data.data.token_balance;

          // Cập nhật amount dựa trên so sánh với amount cũ
          if (Number(oldAmount) > currentBalance) {
            setAmount(currentBalance.toFixed(5));
            // Cập nhật lại phần trăm dựa trên amount mới
            const newPercentage = (currentBalance / (selectedAction === "buy" ? tokenAmountResult.data.data.sol_balance : tokenAmountResult.data.data.token_balance)) * 100;
            setValue(Math.min(100, Math.max(0, newPercentage)));
          } else {
            setAmount(oldAmount);
            // Cập nhật lại phần trăm dựa trên amount cũ
            const newPercentage = (Number(oldAmount) / (selectedAction === "buy" ? tokenAmountResult.data.data.sol_balance : tokenAmountResult.data.data.token_balance)) * 100;
            setValue(Math.min(100, Math.max(0, newPercentage)));
          }

          // Delay 3s trước khi bắt đầu polling
          setTimeout(() => {
            let pollingInterval: NodeJS.Timeout;

            const pollBalance = async () => {
              try {
                const newTokenAmountResult = await refetchTokenAmount();

                if (newTokenAmountResult.data) {
                  const newBalance =
                    selectedAction === "buy"
                      ? newTokenAmountResult.data.data.sol_balance
                      : newTokenAmountResult.data.data.token_balance;

                  // Nếu balance thay đổi, cập nhật và dừng polling
                  if (newBalance !== currentBalance) {
                    setBalance(newBalance);
                    clearInterval(pollingInterval);
                  }
                }
              } catch (error) {
                console.error("Error during polling:", error);
              }
            };

            // Thực hiện polling ngay lập tức
            pollBalance();

            // Sau đó set interval để polling mỗi 2 giây
            pollingInterval = setInterval(pollBalance, 2000);

            // Cleanup interval on component unmount
            return () => {
              if (pollingInterval) {
                clearInterval(pollingInterval);
              }
            };
          }, 3000);
        }

        if (walletResult.data?.data) {
          queryClient.setQueryData(["wallet-infor"], walletResult.data);
        }

        // Remove pending order after successful API call
        if (currentPendingOrderRef.current) {
          setPendingOrders((prev) =>
            prev.filter(
              (order) =>
                order.created_at !== currentPendingOrderRef.current?.created_at
            )
          );
          currentPendingOrderRef.current = null;
        }

        // Delay 10 seconds before refetching member balances
        setTimeout(async () => {
          const newBalances: Record<
            string,
            { sol_balance: number; solana_balance_usd: number }
          > = {};
          for (const connect of connects) {
            if (connect.status === "connect") {
              try {
                const balance = await getWalletBalanceByAddress(
                  connect.member_address
                );
                if (balance) {
                  newBalances[connect.member_address] = {
                    sol_balance: balance.sol_balance,
                    solana_balance_usd: balance.solana_balance_usd,
                  };
                }
              } catch (error) {
                console.error(
                  `Error fetching balance for ${connect.member_address}:`,
                  error
                );
              }
            }
          }
          setMemberBalances(newBalances);
        }, 10000);
      } else {
        setToastMessage(t("notifications.tradingFailed"));
        setToastType("error");
        setShowToast(true);
        setAmount(""); // Reset về rỗng nếu giao dịch thất bại
        // Remove pending order on error
        if (currentPendingOrderRef.current) {
          setPendingOrders((prev) =>
            prev.filter(
              (order) =>
                order.created_at !== currentPendingOrderRef.current?.created_at
            )
          );
          currentPendingOrderRef.current = null;
        }
      }
    } catch (error) {
      console.error("Trading error:", error);
      setToastMessage(t("notifications.tradingError"));
      setToastType("error");
      setShowToast(true);
      // Remove pending order on error
      if (currentPendingOrderRef.current) {
        setPendingOrders((prev) =>
          prev.filter(
            (order) =>
              order.created_at !== currentPendingOrderRef.current?.created_at
          )
        );
        currentPendingOrderRef.current = null;
      }
    }
  };

  // Add useEffect to refetch data when address changes
  useEffect(() => {
    if (address) {
      refetch();
      refetchOrders();
      refetchTokenAmount();
      refetchOrderHistories();
    }
  }, [address, refetch, refetchOrders, refetchTokenAmount, refetchOrderHistories]);

  const [selectedGroups, setSelectedGroups] = useState<
    { value: number; label: string }[]
  >([]);

  const groupOptions = ((groupsResponse as any)?.data || [])
    .filter((group: any) => group.mg_status === "on")
    .map((group: any) => ({
      value: group.mg_id,
      label: group.mg_name,
    }));

  const handleGroupChange = (selectedOptions: any) => {
    setSelectedGroups(selectedOptions);

    // Get all member IDs from selected groups
    const newSelectedMembers: number[] = [];
    const newCheckedConnections: Record<number, boolean> = {
      ...checkedConnections,
    };

    // Reset all checkboxes to false
    Object.keys(newCheckedConnections).forEach((key) => {
      newCheckedConnections[Number(key)] = false;
    });

    // For each selected group, find and select its members
    selectedOptions.forEach((option: any) => {
      const group = ((groupsResponse as any)?.data || []).find(
        (g: any) => g.mg_id === option.value
      );
      if (group) {
        // Find all connects that belong to this group
        const groupConnects = connects.filter((connect: Connect) =>
          connect.joined_groups.some((g) => g.group_id === group.mg_id)
        );

        // Add these members to selected members and check their checkboxes
        groupConnects.forEach((connect: Connect) => {
          newSelectedMembers.push(connect.member_id);
          newCheckedConnections[connect.connection_id] = true;
        });
      }
    });

    setSelectedMembers(newSelectedMembers);
    setCheckedConnections(newCheckedConnections);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [memberBalances, setMemberBalances] = useState<
    Record<string, { sol_balance: number; solana_balance_usd: number }>
  >({});

  // Add this useEffect to fetch balances for connected members
  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances: Record<
        string,
        { sol_balance: number; solana_balance_usd: number }
      > = {};

      for (const connect of connects) {
        if (connect.status === "connect") {
          try {
            const balance = await getWalletBalanceByAddress(
              connect.member_address
            );
            if (balance) {
              newBalances[connect.member_address] = {
                sol_balance: balance.sol_balance,
                solana_balance_usd: balance.sol_balance_usd,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching balance for ${connect.member_address}:`,
              error
            );
          }
        }
      }

      setMemberBalances(newBalances);
    };

    fetchBalances();
  }, [connects]);

  const historyTransactionsRef = useRef<HTMLDivElement>(null);
  const [historyTransactionsHeight, setHistoryTransactionsHeight] =
    useState<number>(0);

  useEffect(() => {
    if (historyTransactionsRef.current) {
      const height = historyTransactionsRef.current.offsetHeight;
      setHistoryTransactionsHeight(height);
    }
  }, [orders, pendingOrders]);

  const handleStarClick = async (token: any) => {
    console.log("token", token);
    try {
      const isFavorite = myWishlist?.tokens?.some(
        (t: any) => t.id === token.id
      );
      const data = {
        token_address: token.address,
        status: isFavorite ? "off" : "on",
      };
      const response = await SolonaTokenService.toggleWishlist(data);
      refetchMyWishlist();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Reset unread count when clicking chat tab
  const handleTabChange = (value: string) => {
    refetchChatTokenHistories();
    setActiveInfoTab(value);
    if (value === "chat") {
      setRealtimeUnreadCount(0);
    } else if (value === "history") {
      setRealtimeUnreadCount(0);
      setMessageCount(0);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <LogWarring />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br bg-[#d8e8f7] text-black rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/20 dark:shadow-purple-800/20 animate-bounce">
            <BarChart4 className="h-7 w-7" />
          </div>
          <h1 className="tracking-tight text-3xl font-bold font-comic bg-clip-text text-transparent bg-gradient-to-r bg-[#d8e8f7] text-black uppercase">
            {t("trading.title")}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground mt-2 md:mt-0">
          <Button
            className="ml-2 inline-flex h-7 rounded-full items-center justify-center gap-2 whitespace-nowrap font-medium bg-[#d8e8f7] text-black"
            onClick={() => handleStarClick(tokenInfor)}
          >
            {myWishlist?.tokens?.some((t: any) => t.id === tokenInfor?.id)
              ? t("trading.removeFromFavorite")
              : t("trading.addToFavorite")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-min">
        {/* Cột 1 (mobile order 5) */}
        <OtherCoins className="order-5 lg:order-none lg:col-span-1 lg:row-span-2" />

        {/* TradingChart (mobile order 1) */}
        <TradingChart
          tokenInfor={tokenInfor}
          address={address}
          className="order-1 lg:order-none lg:col-span-2 lg:col-start-2 lg:row-start-1 h-max"
        />

        <div
          className={`order-2 lg:order-none lg:col-span-1 lg:col-start-4 lg:row-start-1 
          }`}
        >
          <Tabs value={activeInfoTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="placeorder">{t("trading.placeOrder")}</TabsTrigger>
              <TabsTrigger value="chat">
                {t("trading.chat")} {activeInfoTab !== "chat" && (messageCount + realtimeUnreadCount) > 0 && `(${messageCount + realtimeUnreadCount > 99 ? '99+' : messageCount + realtimeUnreadCount})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="placeorder">
              <PlaceOrder
                selectedAction={selectedAction}
                handleActionClick={handleActionClick}
                balance={balance}
                amount={amount}
                handleAmountChange={handleAmountChange}
                value={value}
                handleValueChange={handleValueChange}
                handleEditClick={handleEditClick}
                handleSave={handleSave}
                handleSolEditClick={handleSolEditClick}
                handleSolSave={handleSolSave}
                groupOptions={groupOptions}
                selectedGroups={selectedGroups}
                handleGroupChange={handleGroupChange}
                handleTrading={handleTrading}
                tokenInfor={tokenInfor}
                solPrice={solPrice}
                tokenAmount={tokenAmount}
                marks={marks}
                percentages={percentages}
                editingIndex={editingIndex}
                tempValue={tempValue}
                setTempValue={setTempValue}
                solAmounts={solAmounts}
                editingSolIndex={editingSolIndex}
                tempSolValue={tempSolValue}
                setTempSolValue={setTempSolValue}
                setAmount={setAmount}
                setValue={setValue}
              />
            </TabsContent>
            <TabsContent value="chat">
              <ChatToken  />
            </TabsContent>
          </Tabs>
        </div>

        <div className={`order-4 lg:order-none lg:col-span-2 lg:col-start-2 lg:row-start-2 ${
            walletInfor?.role === "member" ? "lg:col-span-3" : ""
          }`}>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">{t("trading.allTransactions")}</TabsTrigger>
              <TabsTrigger value="my">{t("trading.myTransactions")}</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <HistoryTransactions
                orders={orderHistories}
                historyTransactionsRef={historyTransactionsRef}
                tokenAddress={address}
                maxHeight="max-h-[28.25rem]"
              />
            </TabsContent>
            <TabsContent value="my">
              <HistoryMyTransactions
                orders={orderHistoriesMy}
                historyTransactionsRef={historyTransactionsRef}
                tokenAddress={address}
                maxHeight="max-h-[28.25rem]"
                walletAddress={walletInfor?.solana_address}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ConnectedMembers (mobile order 3) */}
        <ConnectedMembers
          connects={connects}
          memberBalances={memberBalances}
          checkedConnections={checkedConnections}
          handleCheckboxChange={handleCheckboxChange}
          setShowToast={setShowToast}
          className={`order-3 lg:order-none lg:col-span-1 lg:col-start-4 lg:row-start-2 ${
            walletInfor?.role === "member" ? "hidden" : ""
          }`}
        />
      </div>

      {showToast && (
        <ToastNotification
          message={toastMessage}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default function Trading() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      }
    >
      <TradingContent />
    </Suspense>
  );
}
