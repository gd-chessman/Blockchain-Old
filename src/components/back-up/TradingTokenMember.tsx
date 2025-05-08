// "use client";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
// import { Button } from "@/ui/button";
// import { Input } from "@/ui/input";
// import {
//   Pencil,
//   TrendingUp,
//   Check,
//   X,
//   Loader2,
//   Search,
//   Star,
//   BarChart4,
// } from "lucide-react";
// import { useEffect, useState, useRef, Suspense } from "react";
// import { useLang } from "@/lang";
// import { Copy } from "lucide-react";
// import { toast } from "react-toastify";
// import usePercent from "@/hooks/usePercent";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   getMyWishlist,
//   getTokenInforByAddress,
//   getTokenPrice,
// } from "@/services/api/SolonaTokenService";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useWsSubscribeTokens } from "@/hooks/useWsSubscribeTokens";
// import Link from "next/link";
// import {
//   getOrders,
//   getTokenAmount,
//   createTrading,
// } from "@/services/api/TradingService";
// import {
//   getInforWallet,
//   getMyTokens,
// } from "@/services/api/TelegramWalletService";
// import { useWsGetOrders } from "@/hooks/useWsGetOrders";
// import {
//   getMyConnects,
//   getMyGroups,
// } from "@/services/api/MasterTradingService";
// import { Checkbox } from "@/ui/checkbox";
// import { useDebounce } from "@/hooks/useDebounce";
// import { SolonaTokenService } from "@/services/api";
// import Select from "react-select";
// import LogWarring from "@/ui/log-warring";
// import { useAuth } from "@/hooks/useAuth";
// import { ToastNotification } from "@/ui/toast";
// import { getPriceSolona } from "@/services/api/SolonaTokenService";
// import { getWalletBalanceByAddress } from "@/services/api/TelegramWalletService";
// import MyCoins from "@/components/trading/token/MyCoins";
// import OtherCoins from "@/components/trading/token/OtherCoins";
// import HistoryTransactions from "@/components/trading/token/HistoryTransactions";
// import TradingChart from "@/components/trading/token/TradingChart";
// import TokenInforDetail from "@/components/trading/token/ui/TokenInforDetail";
// import { getOrderHistories, getTopCoins } from "@/services/api/OnChainService";
// import ChatBubble from "@/components/chat/ChatToken";

// interface Order {
//   created_at: string;
//   trade_type: "buy" | "sell";
//   price: number;
//   quantity: number;
//   status: "pending" | "completed" | "cancelled";
// }

// interface Connect {
//   connection_id: number;
//   member_id: number;
//   member_address: string;
//   status: string;
//   option_limit: string;
//   price_limit: string;
//   ratio_limit: number;
//   joined_groups: Array<{
//     group_id: number;
//     group_name: string;
//   }>;
// }

// function TradingContent() {
//   const { t } = useLang();
//   const { isAuthenticated } = useAuth();
//   const { tokens: wsTokens } = useWsSubscribeTokens({ limit: 30 });
//   const queryClient = useQueryClient();
//   const [tokens, setTokens] = useState<
//     {
//       id: number;
//       name: string;
//       address: string;
//       symbol: string;
//       decimals: number;
//       isVerified: boolean;
//       logoUrl: string;
//       program: string;
//     }[]
//   >([]);
//   const [value, setValue] = useState(0);
//   const [amount, setAmount] = useState<string>("");
//   const [isMounted, setIsMounted] = useState(false);

//   const searchParams = useSearchParams();
//   const address = searchParams?.get("address");
//   const { data: tokenInfor, refetch } = useQuery({
//     queryKey: ["token-infor", address],
//     queryFn: () => getTokenInforByAddress(address),
//   });
//   const { data: tokenPrice } = useQuery({
//     queryKey: ["token-price", address],
//     queryFn: () => getTokenPrice(address),
//   });
//   const { data: solPrice } = useQuery({
//     queryKey: ["sol-price"],
//     queryFn: () => getPriceSolona(),
//   });
//   const { data: memeCoins = [] } = useQuery({
//     queryKey: ["my-tokens"],
//     queryFn: getMyTokens,
//   });
//   const { data: topCoins, isLoading: isLoadingTopCoins } = useQuery({
//     queryKey: ["topCoins_market_cap"],
//     queryFn: () =>
//       getTopCoins({
//         sort_by: "market_cap",
//         sort_type: "desc",
//         offset: 0,
//         limit: 18,
//       }),
//   });
//   const { data: walletInfor, refetch: refetchWalletInfor } = useQuery({
//     queryKey: ["wallet-infor"],
//     queryFn: getInforWallet,
//     refetchInterval: 30000,
//     refetchIntervalInBackground: true,
//   });
//   const { data: orderHistories, isLoading: isLoadingOrderHistories } = useQuery(
//     {
//       queryKey: ["orderHistories", address],
//       queryFn: () =>
//         getOrderHistories({
//           address: address || "",
//           offset: 0,
//           limit: 50,
//           sort_by: "block_unix_time",
//           sort_type: "desc",
//           tx_type: "swap",
//           owner: walletInfor.solana_address,
//         }),
//       enabled: !!address && !!walletInfor?.solana_address,
//     }
//   );
//   const { data: orders, refetch: refetchOrders } = useQuery({
//     queryKey: ["orders"],
//     queryFn: () => getOrders(address),
//   });
//   const { data: connects = [] } = useQuery({
//     queryKey: ["connects"],
//     queryFn: getMyConnects,
//   });
//   const { data: groupsResponse } = useQuery({
//     queryKey: ["groups"],
//     queryFn: getMyGroups,
//   });
//   const { data: myWishlist, refetch: refetchMyWishlist } = useQuery({
//     queryKey: ["myWishlist"],
//     queryFn: getMyWishlist,
//     refetchOnMount: true,
//   });

//   const [activeTab, setActiveTab] = useState("buy");
//   const [selectedAction, setSelectedAction] = useState<"buy" | "sell">("buy");
//   const { data: tokenAmount, refetch: refetchTokenAmount } = useQuery({
//     queryKey: ["tokenAmount", address, activeTab, selectedAction],
//     queryFn: () => getTokenAmount(address),
//   });
//   const [checkedConnections, setCheckedConnections] = useState<
//     Record<number, boolean>
//   >({});
//   const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

//   // console.log("orderMessages", orderMessages);
//   const marks = [0, 25, 50, 75, 100];
//   const [searchQuery, setSearchQuery] = useState("");
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchResults, setSearchResults] = useState<
//     {
//       id: number;
//       name: string;
//       symbol: string;
//       address: string;
//       decimals: number;
//       logoUrl: string;
//       coingeckoId: string | null;
//       tradingviewSymbol: string | null;
//       isVerified: boolean;
//       marketCap: number;
//       program: string;
//       price?: number;
//     }[]
//   >([]);

//   // Effect to handle search when debounced value changes
//   useEffect(() => {
//     const searchData = async () => {
//       if (!debouncedSearchQuery.trim()) {
//         setSearchResults([]);
//         setIsSearching(false);
//         return;
//       }
//       setIsSearching(true);
//       try {
//         const res = await SolonaTokenService.getSearchTokenInfor(
//           debouncedSearchQuery
//         );
//         setSearchResults(res.tokens || []);
//       } catch (error) {
//         console.error("Error searching tokens:", error);
//         setSearchResults([]);
//       } finally {
//         setIsSearching(false);
//       }
//     };

//     searchData();
//   }, [debouncedSearchQuery]);

//   // Update tokens when topCoins data changes
//   useEffect(() => {
//     if (topCoins && topCoins.length > 0) {
//       setTokens(topCoins);
//     }
//   }, [topCoins]);

//   const handleTimeframeChange = (timeframe: string) => {
//     console.log(`Timeframe changed to: ${timeframe}`);
//     // Trong ứng dụng thực tế, bạn sẽ tải dữ liệu mới dựa trên khung thời gian
//   };
//   const { percentages, setPercentage } = usePercent();
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [tempValue, setTempValue] = useState<string>("");
//   const [solAmounts, setSolAmounts] = useState<string[]>([
//     "0.1",
//     "0.5",
//     "1",
//     "2",
//   ]);

//   useEffect(() => {
//     const savedAmounts = localStorage.getItem("solAmounts");
//     if (savedAmounts) {
//       setSolAmounts(JSON.parse(savedAmounts));
//     }
//   }, []);

//   const [editingSolIndex, setEditingSolIndex] = useState<number | null>(null);
//   const [tempSolValue, setTempSolValue] = useState<string>("");

//   const handleEditClick = (index: number) => {
//     setEditingIndex(index);
//     setTempValue(percentages[index]);
//   };

//   const handleSave = (index: number) => {
//     if (tempValue.trim()) {
//       setPercentage(index, tempValue);
//     }
//     setEditingIndex(null);
//   };

//   const handleSolEditClick = (index: number) => {
//     setEditingSolIndex(index);
//     setTempSolValue(solAmounts[index]);
//   };

//   const handleSolSave = (index: number) => {
//     if (tempSolValue.trim()) {
//       const newSolAmounts = [...solAmounts];
//       newSolAmounts[index] = tempSolValue;
//       setSolAmounts(newSolAmounts);
//       localStorage.setItem("solAmounts", JSON.stringify(newSolAmounts));
//     }
//     setEditingSolIndex(null);
//   };

//   const [showToast, setShowToast] = useState(false);

//   useEffect(() => {
//     refetchTokenAmount();
//   }, [activeTab, selectedAction, refetchTokenAmount]);

//   const handleActionClick = (action: "buy" | "sell") => {
//     if (selectedAction !== action) {
//       setSelectedAction(action);
//       setValue(0); // Reset percentage when switching actions
//       setAmount(""); // Reset amount when switching actions
//       // Reset all checkboxes to false using the same pattern as initialization
//       const resetCheckedState = connects.reduce(
//         (acc: Record<number, boolean>, connect: Connect) => {
//           acc[connect.connection_id] = false;
//           return acc;
//         },
//         {}
//       );
//       setCheckedConnections(resetCheckedState);
//       setSelectedMembers([]); // Reset selected members list
//     }
//   };

//   useEffect(() => {
//     // Initialize checked state to false for all connections
//     const initialCheckedState = connects.reduce(
//       (acc: Record<number, boolean>, connect: Connect) => {
//         acc[connect.connection_id] = false;
//         return acc;
//       },
//       {}
//     );
//     setCheckedConnections(initialCheckedState);
//   }, [connects]);

//   const handleCheckboxChange = (connectionId: number, memberId: number) => {
//     setCheckedConnections((prev) => ({
//       ...prev,
//       [connectionId]: !prev[connectionId],
//     }));

//     setSelectedMembers((prev) => {
//       if (prev.includes(memberId)) {
//         return prev.filter((id) => id !== memberId);
//       } else {
//         return [...prev, memberId];
//       }
//     });
//   };

//   const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setAmount(newValue);

//     // Tính toán phần trăm dựa trên số lượng nhập vào
//     if (selectedAction === "buy" && tokenAmount?.data?.sol_balance) {
//       const percentage =
//         (Number(newValue) / tokenAmount.data.sol_balance) * 100;
//       setValue(Math.min(100, Math.max(0, percentage)));
//     } else if (selectedAction === "sell" && tokenAmount?.data?.token_balance) {
//       let percentage =
//         (Number(newValue) / tokenAmount.data.token_balance) * 100;
//       // Nếu là bán và đang ở 100%, giữ lại 0.1% làm phí
//       if (percentage >= 100) {
//         percentage = 100;
//         setAmount((tokenAmount.data.token_balance * 0.99999).toFixed(5));
//       }
//       setValue(Math.min(100, Math.max(0, percentage)));
//     }
//   };

//   const handleValueChange = (newValue: number) => {
//     setValue(newValue);
//     // Tính toán số lượng dựa trên phần trăm và action hiện tại
//     if (selectedAction === "buy" && tokenAmount?.data?.sol_balance) {
//       const calculatedAmount = (tokenAmount.data.sol_balance * newValue) / 100;
//       setAmount(calculatedAmount.toFixed(5));
//     } else if (selectedAction === "sell" && tokenAmount?.data?.token_balance) {
//       let calculatedAmount = (tokenAmount.data.token_balance * newValue) / 100;
//       // Nếu là bán và đang ở 100%, giữ lại 0.1% làm phí
//       if (newValue >= 100) {
//         calculatedAmount = tokenAmount.data.token_balance * 0.99999;
//         setValue(100);
//       }
//       setAmount(calculatedAmount.toFixed(5));
//     }
//   };

//   const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
//   const currentPendingOrderRef = useRef<Order | null>(null);

//   const [balance, setBalance] = useState<number>(0);

//   useEffect(() => {
//     if (tokenAmount?.data) {
//       setBalance(
//         selectedAction === "buy"
//           ? tokenAmount.data.sol_balance
//           : tokenAmount.data.token_balance
//       );
//     }
//   }, [tokenAmount, selectedAction]);

//   const handleTrading = async () => {
//     try {
//       // Reset form and member list immediately when button is clicked
//       setSelectedMembers([]);
//       // Reset all checkboxes to false using the same pattern as initialization
//       const resetCheckedState = connects.reduce(
//         (acc: Record<number, boolean>, connect: Connect) => {
//           acc[connect.connection_id] = false;
//           return acc;
//         },
//         {}
//       );
//       setCheckedConnections(resetCheckedState);
//       setValue(0);
//       setAmount("");
//       setSelectedGroups([]); // Reset selected groups

//       // Add pending order to local state
//       const newPendingOrder: Order = {
//         created_at: new Date().toISOString(),
//         trade_type: selectedAction,
//         price:
//           selectedAction === "sell"
//             ? Number(amount) * (tokenPrice?.priceUSD || 0)
//             : Number(amount) * (solPrice?.priceUSD || 0),
//         quantity: Number(amount),
//         status: "pending",
//       };
//       currentPendingOrderRef.current = newPendingOrder;
//       setPendingOrders((prev) => [...prev, newPendingOrder]);

//       const response = await createTrading({
//         order_trade_type: selectedAction,
//         order_type: "market",
//         order_token_name: tokenInfor?.name || "No name",
//         order_token_address: address || "",
//         order_price:
//           selectedAction === "sell"
//             ? Number(amount) * (tokenPrice?.priceUSD || 0)
//             : Number(amount) * (solPrice?.priceUSD || 0),
//         order_qlty: Number(amount),
//         member_list: selectedMembers,
//       });

//       if (response.status === 201) {
//         // Fetch lại tất cả dữ liệu
//         const [
//           ordersResult,
//           tokenAmountResult,
//           tokenInforResult,
//           walletResult,
//         ] = await Promise.all([
//           refetchOrders(), // Cập nhật lịch sử giao dịch
//           refetchTokenAmount(), // Cập nhật số dư
//           refetch(), // Cập nhật thông tin token
//           refetchWalletInfor(), // Cập nhật số dư SOL ở header
//         ]);

//         // Force update UI with new data
//         if (tokenAmountResult.data?.data) {
//           queryClient.setQueryData(
//             ["tokenAmount", address, activeTab, selectedAction],
//             tokenAmountResult.data
//           );

//           // Lưu balance hiện tại để so sánh
//           const currentBalance =
//             selectedAction === "buy"
//               ? tokenAmountResult.data.data.sol_balance
//               : tokenAmountResult.data.data.token_balance;

//           // Delay 3s trước khi bắt đầu polling
//           setTimeout(() => {
//             let pollingInterval: NodeJS.Timeout;

//             const pollBalance = async () => {
//               try {
//                 const newTokenAmountResult = await refetchTokenAmount();

//                 if (newTokenAmountResult.data) {
//                   const newBalance =
//                     selectedAction === "buy"
//                       ? newTokenAmountResult.data.data.sol_balance
//                       : newTokenAmountResult.data.data.token_balance;

//                   // Nếu balance thay đổi, cập nhật và dừng polling
//                   if (newBalance !== currentBalance) {
//                     setBalance(newBalance);
//                     clearInterval(pollingInterval);
//                   }
//                 }
//               } catch (error) {
//                 console.error("Error during polling:", error);
//               }
//             };

//             // Thực hiện polling ngay lập tức
//             pollBalance();

//             // Sau đó set interval để polling mỗi 2 giây
//             pollingInterval = setInterval(pollBalance, 2000);

//             // Cleanup interval on component unmount
//             return () => {
//               if (pollingInterval) {
//                 clearInterval(pollingInterval);
//               }
//             };
//           }, 3000);
//         }

//         if (walletResult.data?.data) {
//           queryClient.setQueryData(["wallet-infor"], walletResult.data);
//         }

//         // Remove pending order after successful API call
//         if (currentPendingOrderRef.current) {
//           setPendingOrders((prev) =>
//             prev.filter(
//               (order) =>
//                 order.created_at !== currentPendingOrderRef.current?.created_at
//             )
//           );
//           currentPendingOrderRef.current = null;
//         }

//         // Delay 10 seconds before refetching member balances
//         setTimeout(async () => {
//           const newBalances: Record<
//             string,
//             { sol_balance: number; solana_balance_usd: number }
//           > = {};
//           for (const connect of connects) {
//             if (connect.status === "connect") {
//               try {
//                 const balance = await getWalletBalanceByAddress(
//                   connect.member_address
//                 );
//                 if (balance) {
//                   newBalances[connect.member_address] = {
//                     sol_balance: balance.sol_balance,
//                     solana_balance_usd: balance.solana_balance_usd,
//                   };
//                 }
//               } catch (error) {
//                 console.error(
//                   `Error fetching balance for ${connect.member_address}:`,
//                   error
//                 );
//               }
//             }
//           }
//           setMemberBalances(newBalances);
//         }, 10000);
//       } else {
//         toast.error("Failed to create trading order");
//         // Remove pending order on error
//         if (currentPendingOrderRef.current) {
//           setPendingOrders((prev) =>
//             prev.filter(
//               (order) =>
//                 order.created_at !== currentPendingOrderRef.current?.created_at
//             )
//           );
//           currentPendingOrderRef.current = null;
//         }
//       }
//     } catch (error) {
//       console.error("Trading error:", error);
//       toast.error("An error occurred while creating the trading order");
//       // Remove pending order on error
//       if (currentPendingOrderRef.current) {
//         setPendingOrders((prev) =>
//           prev.filter(
//             (order) =>
//               order.created_at !== currentPendingOrderRef.current?.created_at
//           )
//         );
//         currentPendingOrderRef.current = null;
//       }
//     }
//   };

//   // Add useEffect to refetch data when address changes
//   useEffect(() => {
//     if (address) {
//       refetch();
//       refetchOrders();
//       refetchTokenAmount();
//     }
//   }, [address, refetch, refetchOrders, refetchTokenAmount]);

//   const [selectedGroups, setSelectedGroups] = useState<
//     { value: number; label: string }[]
//   >([]);

//   const groupOptions = ((groupsResponse as any)?.data || [])
//     .filter((group: any) => group.mg_status === "on")
//     .map((group: any) => ({
//       value: group.mg_id,
//       label: group.mg_name,
//     }));

//   const handleGroupChange = (selectedOptions: any) => {
//     setSelectedGroups(selectedOptions);

//     // Get all member IDs from selected groups
//     const newSelectedMembers: number[] = [];
//     const newCheckedConnections: Record<number, boolean> = {
//       ...checkedConnections,
//     };

//     // Reset all checkboxes to false
//     Object.keys(newCheckedConnections).forEach((key) => {
//       newCheckedConnections[Number(key)] = false;
//     });

//     // For each selected group, find and select its members
//     selectedOptions.forEach((option: any) => {
//       const group = ((groupsResponse as any)?.data || []).find(
//         (g: any) => g.mg_id === option.value
//       );
//       if (group) {
//         // Find all connects that belong to this group
//         const groupConnects = connects.filter((connect: Connect) =>
//           connect.joined_groups.some((g) => g.group_id === group.mg_id)
//         );

//         // Add these members to selected members and check their checkboxes
//         groupConnects.forEach((connect: Connect) => {
//           newSelectedMembers.push(connect.member_id);
//           newCheckedConnections[connect.connection_id] = true;
//         });
//       }
//     });

//     setSelectedMembers(newSelectedMembers);
//     setCheckedConnections(newCheckedConnections);
//   };

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   const [memberBalances, setMemberBalances] = useState<
//     Record<string, { sol_balance: number; solana_balance_usd: number }>
//   >({});

//   // Add this useEffect to fetch balances for connected members
//   useEffect(() => {
//     const fetchBalances = async () => {
//       const newBalances: Record<
//         string,
//         { sol_balance: number; solana_balance_usd: number }
//       > = {};

//       for (const connect of connects) {
//         if (connect.status === "connect") {
//           try {
//             const balance = await getWalletBalanceByAddress(
//               connect.member_address
//             );
//             if (balance) {
//               newBalances[connect.member_address] = {
//                 sol_balance: balance.sol_balance,
//                 solana_balance_usd: balance.solana_balance_usd,
//               };
//             }
//           } catch (error) {
//             console.error(
//               `Error fetching balance for ${connect.member_address}:`,
//               error
//             );
//           }
//         }
//       }

//       setMemberBalances(newBalances);
//     };

//     fetchBalances();
//   }, [connects]);

//   const historyTransactionsRef = useRef<HTMLDivElement>(null);
//   const [historyTransactionsHeight, setHistoryTransactionsHeight] =
//     useState<number>(0);

//   useEffect(() => {
//     if (historyTransactionsRef.current) {
//       const height = historyTransactionsRef.current.offsetHeight;
//       setHistoryTransactionsHeight(height);
//     }
//   }, [orders, pendingOrders]);

//   const handleStarClick = async (token: any) => {
//     console.log("token", token);
//     try {
//       const isFavorite = myWishlist?.tokens?.some(
//         (t: any) => t.id === token.id
//       );
//       const data = {
//         token_address: token.address,
//         status: isFavorite ? "off" : "on",
//       };
//       const response = await SolonaTokenService.toggleWishlist(data);
//       refetchMyWishlist();
//     } catch (error) {
//       console.error("Error toggling wishlist:", error);
//     }
//   };

//   if (!isMounted) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[80vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) return <LogWarring />;

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <div className="flex items-center">
//           <div className="w-12 h-12 bg-gradient-to-br bg-[#d8e8f7] text-black rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/20 dark:shadow-purple-800/20 animate-bounce">
//             <BarChart4 className="h-7 w-7" />
//           </div>
//           <h1 className="tracking-tight text-3xl font-bold font-comic bg-clip-text text-transparent bg-gradient-to-r bg-[#d8e8f7] text-black uppercase">
//             {t("trading.title")}
//           </h1>
//         </div>
//         <div className="text-sm text-muted-foreground mt-2 md:mt-0">
//           {/* {t("trading.marketIsOpen")} • 24h */}
//           <Button
//             className="ml-2 inline-flex h-7 rounded-full items-center justify-center gap-2 whitespace-nowrap font-medium bg-[#d8e8f7] text-black"
//             onClick={() => handleStarClick(tokenInfor)}
//           >
//             {myWishlist?.tokens?.some((t: any) => t.id === tokenInfor?.id)
//               ? t("trading.removeFromFavorite")
//               : t("trading.addToFavorite")}
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//         <div className="flex flex-col gap-6 order-3 lg:order-1">
//           <OtherCoins />
//         </div>

//         <div className="lg:col-span-3 order-1">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <TradingChart tokenInfor={tokenInfor} address={address} />
//             <div className="order-2 lg:order-none row-span-2">
//               {/* <ChatBubble /> */}
//               <HistoryTransactions
//                 pendingOrders={pendingOrders}
//                 orders={orderHistories}
//                 historyTransactionsRef={historyTransactionsRef}
//                 tokenAddress={address}
//                 className="max-h-[31.25rem] lg:max-h-[69.5rem]"
//               />
//             </div>
//             <div className="lg:col-span-2">
//               <Card className="shadow-md dark:shadow-blue-900/5 border">
//                 <CardHeader>
//                   {/* <CardTitle>{t("trading.placeOrder")}</CardTitle> */}
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <Button
//                         className={`${
//                           selectedAction === "buy"
//                             ? "bg-green-100 text-green-600 hover:bg-green-200 border border-green-500 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:border-green-500 dark:hover:shadow-lg dark:hover:shadow-green-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
//                             : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
//                         }`}
//                         onClick={() => handleActionClick("buy")}
//                       >
//                         {t("trading.buy")}
//                       </Button>
//                       <Button
//                         className={`${
//                           selectedAction === "sell"
//                             ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:border-red-500 dark:hover:shadow-lg dark:hover:shadow-red-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
//                             : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
//                         }`}
//                         onClick={() => handleActionClick("sell")}
//                       >
//                         {t("trading.sell")}
//                       </Button>
//                     </div>

//                     <div>
//                       <div className="flex justify-between items-center">
//                         <label className="text-sm font-medium">
//                           {t("trading.amount")}
//                         </label>
//                         <div className="flex flex-col items-end">
//                           <span className="text-sm text-muted-foreground">
//                             Balance: {balance.toFixed(5)}{" "}
//                             {selectedAction === "buy"
//                               ? "SOL"
//                               : tokenInfor?.symbol}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex mt-1">
//                         <Input
//                           type="number"
//                           placeholder="0.00"
//                           className="rounded-r-none"
//                           value={amount}
//                           onChange={handleAmountChange}
//                           min={0}
//                           max={tokenAmount?.data?.token_balance}
//                         />
//                         <div className="bg-muted px-3 py-2 text-sm rounded-r-md border border-l-0 border-input min-w-28 flex items-center gap-2">
//                           {selectedAction === "buy" && (
//                             <span className="text-xs text-muted-foreground">
//                               $
//                               {(
//                                 Number(amount) * (solPrice?.priceUSD || 0)
//                               ).toFixed(2)}
//                             </span>
//                           )}
//                           <span>{value.toFixed(2)}%</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium">
//                         {t("trading.percentage")}
//                       </label>
//                       <div className="relative mt-2">
//                         <input
//                           type="range"
//                           min="0"
//                           max="100"
//                           step="1"
//                           value={value}
//                           onChange={(e) =>
//                             handleValueChange(Number(e.target.value))
//                           }
//                           className="w-full h-2 cursor-pointer accent-blue-500 bg-transparent appearance-none"
//                           style={{
//                             WebkitAppearance: "none",
//                             borderRadius: "8px",
//                             background: `linear-gradient(to right, #3b82f6 ${value}%, #e5e7eb ${value}%)`,
//                           }}
//                         />

//                         <div className="relative flex justify-between text-xs text-muted-foreground mt-2 px-1">
//                           {marks.map((mark) => (
//                             <div
//                               key={mark}
//                               className="relative flex flex-col items-center w-0"
//                             >
//                               <span>{mark}</span>
//                               <span className="absolute top-[-6px] w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="text-center text-sm mt-2 font-semibold text-blue-600">
//                         {value.toFixed(2)}%
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-4 gap-2">
//                       {percentages.map((percent, index) => (
//                         <div
//                           key={index}
//                           className="relative flex items-center gap-1 border rounded-md hover:bg-muted/50 transition-colors p-0.5"
//                         >
//                           {editingIndex === index ? (
//                             <div className="flex items-center gap-1.5 w-full">
//                               <Input
//                                 value={tempValue}
//                                 onChange={(e) => setTempValue(e.target.value)}
//                                 onKeyDown={(e) =>
//                                   e.key === "Enter" && handleSave(index)
//                                 }
//                                 autoFocus
//                                 type="number"
//                                 min={0}
//                                 max={100}
//                                 className="flex-1 h-7 text-sm"
//                               />
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0"
//                                 onClick={() => handleSave(index)}
//                               >
//                                 <Check className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           ) : (
//                             <div className="flex items-center justify-between w-full">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-8 flex-1 justify-start text-xs md:text-sm px-1 md:px-3"
//                                 onClick={() =>
//                                   handleValueChange(Number(percent))
//                                 }
//                               >
//                                 <span className="text-xs md:text-sm">
//                                   {percent}%
//                                 </span>
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0 hover:bg-muted bg-muted/50"
//                                 onClick={() => handleEditClick(index)}
//                               >
//                                 <Pencil className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>

//                     <div className="grid grid-cols-4 gap-2">
//                       {selectedAction === "buy" &&
//                         solAmounts.map((solAmount, index) => (
//                           <div
//                             key={index}
//                             className="relative flex items-center gap-1 border rounded-md hover:bg-muted/50 transition-colors p-0.5"
//                           >
//                             {editingSolIndex === index ? (
//                               <div className="flex items-center gap-1.5 w-full">
//                                 <Input
//                                   value={tempSolValue}
//                                   onChange={(e) =>
//                                     setTempSolValue(e.target.value)
//                                   }
//                                   onKeyDown={(e) =>
//                                     e.key === "Enter" && handleSolSave(index)
//                                   }
//                                   autoFocus
//                                   type="number"
//                                   min={0}
//                                   step="0.1"
//                                   className="flex-1 h-7 text-sm"
//                                 />
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-6 w-6 p-0"
//                                   onClick={() => handleSolSave(index)}
//                                 >
//                                   <Check className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                             ) : (
//                               <div className="flex items-center justify-between w-full">
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-8 flex-1 justify-start text-xs md:text-sm px-1 md:px-3"
//                                   onClick={() => {
//                                     if (selectedAction === "buy") {
//                                       setAmount(solAmount);
//                                       if (tokenAmount?.data?.sol_balance) {
//                                         const percentage =
//                                           (Number(solAmount) /
//                                             tokenAmount.data.sol_balance) *
//                                           100;
//                                         setValue(
//                                           Math.min(100, Math.max(0, percentage))
//                                         );
//                                       }
//                                     }
//                                   }}
//                                 >
//                                   <span className="text-xs md:text-sm">
//                                     {solAmount} SOL
//                                   </span>
//                                 </Button>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-6 w-6 p-0 hover:bg-muted bg-muted/50"
//                                   onClick={() => handleSolEditClick(index)}
//                                 >
//                                   <Pencil className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                     </div>

//                     <div className="space-y-2">
//                       <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50">
//                         <h3 className="text-sm font-medium mb-2">
//                           {t("trading.selectGroups")}
//                         </h3>
//                         <Select
//                           isMulti
//                           options={groupOptions}
//                           value={selectedGroups}
//                           onChange={handleGroupChange}
//                           className="react-select-container"
//                           classNamePrefix="react-select"
//                           placeholder={t("trading.selectGroupsPlaceholder")}
//                           noOptionsMessage={() =>
//                             t("trading.noGroupsAvailable")
//                           }
//                           styles={{
//                             control: (base) => ({
//                               ...base,
//                               backgroundColor: "hsl(var(--background))",
//                               borderColor: "hsl(var(--input))",
//                               color: "hsl(var(--foreground))",
//                               "&:hover": {
//                                 borderColor: "hsl(var(--input))",
//                               },
//                             }),
//                             menu: (base) => ({
//                               ...base,
//                               backgroundColor: "hsl(var(--background))",
//                               color: "hsl(var(--foreground))",
//                             }),
//                             option: (base, state) => ({
//                               ...base,
//                               backgroundColor: state.isSelected
//                                 ? "hsl(var(--primary))"
//                                 : state.isFocused
//                                 ? "hsl(var(--accent))"
//                                 : "transparent",
//                               color: state.isSelected
//                                 ? document.documentElement.classList.contains(
//                                     "dark"
//                                   )
//                                   ? "#fff"
//                                   : "#000"
//                                 : "hsl(var(--foreground))",
//                               "&:hover": {
//                                 backgroundColor: "hsl(var(--accent))",
//                                 color: "hsl(var(--foreground))",
//                               },
//                             }),
//                             multiValue: (base) => ({
//                               ...base,
//                               backgroundColor: "hsl(var(--primary))",
//                               color:
//                                 document.documentElement.classList.contains(
//                                   "dark"
//                                 )
//                                   ? "#fff"
//                                   : "#000",
//                               borderRadius: "0.375rem",
//                               padding: "0.125rem 0.25rem",
//                             }),
//                             multiValueLabel: (base) => ({
//                               ...base,
//                               color:
//                                 document.documentElement.classList.contains(
//                                   "dark"
//                                 )
//                                   ? "#fff"
//                                   : "#000",
//                               fontWeight: "500",
//                               fontSize: "0.875rem",
//                               padding: "0.125rem 0.25rem",
//                             }),
//                             multiValueRemove: (base) => ({
//                               ...base,
//                               color:
//                                 document.documentElement.classList.contains(
//                                   "dark"
//                                 )
//                                   ? "#fff"
//                                   : "#000",
//                               padding: "0.125rem 0.25rem",
//                               ":hover": {
//                                 backgroundColor: "hsl(var(--destructive))",
//                                 color: "white",
//                               },
//                             }),
//                             singleValue: (base) => ({
//                               ...base,
//                               color: "hsl(var(--foreground))",
//                               fontSize: "0.875rem",
//                             }),
//                             input: (base) => ({
//                               ...base,
//                               color: "hsl(var(--foreground))",
//                               fontSize: "0.875rem",
//                             }),
//                             placeholder: (base) => ({
//                               ...base,
//                               color: "hsl(var(--muted-foreground))",
//                               fontSize: "0.875rem",
//                             }),
//                             menuList: (base) => ({
//                               ...base,
//                               color: "hsl(var(--foreground))",
//                             }),
//                             noOptionsMessage: (base) => ({
//                               ...base,
//                               color: "hsl(var(--muted-foreground))",
//                             }),
//                           }}
//                         />
//                       </div>

//                       <Button
//                         className={`w-full ${
//                           selectedAction === "buy"
//                             ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:hover:shadow-lg dark:hover:shadow-green-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
//                             : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:hover:shadow-lg dark:hover:shadow-red-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
//                         }`}
//                         onClick={handleTrading}
//                         disabled={!amount || Number(amount) <= 0}
//                       >
//                         {selectedAction === "buy"
//                           ? t("trading.buyNow")
//                           : t("trading.sellNow")}
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showToast && (
//         <ToastNotification
//           message={t("notifications.addressCopied")}
//           duration={3000}
//           onClose={() => setShowToast(false)}
//         />
//       )}
//     </div>
//   );
// }

// export default function Trading() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex flex-col items-center justify-center h-[80vh]">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//         </div>
//       }
//     >
//       <TradingContent />
//     </Suspense>
//   );
// }
