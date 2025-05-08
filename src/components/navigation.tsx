"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/libs/utils";
import { Button } from "@/ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  Copy,
  Users,
  Wallet,
  Menu,
  Coins,
  LogOut,
  Wallet2,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";
import { useLang } from "@/lang";
import { LangToggle } from "./lang-toggle";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getInforWallet, getMyWallets, useWallet } from "@/services/api/TelegramWalletService";
import { truncateString } from "@/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import dynamic from 'next/dynamic';

const BalanceDisplay = dynamic(() => Promise.resolve(({ balance, usdBalance }: { balance: string, usdBalance: string }) => (
  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-[#1d8e50] dark:text-white border-blue-200">
    {balance} SOL (${usdBalance})
  </div>
)), { ssr: false });

export default function Navigation() {
  const router = useRouter();
  const { data: walletInfor, refetch } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
    refetchInterval: 30000,
    staleTime: 30000,
  });
  const { data: myWallets } = useQuery({
    queryKey: ["my-wallets"],
    queryFn: getMyWallets,
    staleTime: 30000,
  });
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, updateToken } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { t } = useLang();
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  const handleChangeWallet = async (walletId: string) => {
    try {
      const res = await useWallet({ wallet_id: walletId });
      updateToken(res.token);
      await refetch();
      window.location.reload();
    } catch (error) {
      console.error('Error changing wallet:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if(walletInfor?.status === 403){
      router.push("/complete-profile");
    }
    if(walletInfor?.status === 401){
      logout();
    }
  }, [ walletInfor, router]);


  const navItems = [
    // {
    //   name: "newcoin-other",
    //   href: "/create-coin-other",
    //   icon: <Coins className="mr-2 h-5 w-5" />,
    // },
    {
      name: "newcoin",
      href: "/create-new-coin",
      icon: <Coins className="mr-2 h-5 w-5" />,
    },
    {
      name: "dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    },
    {
      name: "trading",
      href: "/trading",
      icon: <TrendingUp className="mr-2 h-5 w-5" />,
    },

    {
      name: "mastertrade",
      href: "/master-trade",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: "wallet",
      href: "/wallet",
      icon: <Wallet className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <nav className="bg-gradient-to-r bg-primary text-black dark:text-white sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border-b">
      <div className="container mx-auto flex items-center justify-between py-3 !px-0 lg:!px-4">
        {/* Logo bên trái */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Tabs ở giữa */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-3 xl:px-4">
          <div className="flex items-center justify-center gap-1 xl:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 xl:px-3 py-2 rounded-lg transition-all hover:bg-white/10 text-xs xl:text-sm font-semibold text-black dark:text-white",
                  pathname?.startsWith(item.href)
                    ? "bg-zinc-300 dark:bg-white/20 shadow-sm"
                    : "bg-transparent"
                )}
              >
                {item.icon}
                {t(`navigation.${item.name}`)}
              </Link>
            ))}
          </div>
        </div>

        {/* Các nút chức năng bên phải */}
        <div className="flex items-center justify-end gap-1 lg:gap-2 xl:gap-3 flex-1 lg:flex-none lg:justify-center">
          {isAuthenticated && mounted && walletInfor && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] md:text-xs font-bold text-black dark:text-white border-white">
              {walletInfor.solana_balance?.toFixed(5) || '0.00000'} SOL (${walletInfor.solana_balance_usd?.toFixed(2) || '0.00'})
            </div>
          )}
          <ThemeToggle />
          <LangToggle />
          {mounted && (
            <>
              {!isAuthenticated && (
                <Button
                  className="bg-[#d8e8f7] text-black font-semibold h-max"
                  onClick={() =>
                    window.open(
                      process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL,
                      "_blank"
                    )
                  }
                >
                  Connect Telegram
                </Button>
              )}
              {isAuthenticated && walletInfor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="p-2 bg-[#d8e8f7] text-black font-bold h-max">
                      <Wallet2 className="sm:hidden h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{truncateString(walletInfor.solana_address, 12)}</span>
                      <ChevronDown size={16} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsWalletDialogOpen(true)}>
                      <Wallet2 className="mr-2 h-4 w-4" />
                      <span>{t('navigation.selectWallet.selectWalletButton')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('navigation.selectWallet.disconnectButton')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Menu mobile */}
        <div className="lg:hidden flex mx-2">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu />
          </button>
        </div>
      </div>

      {/* Wallet Selection Dialog */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {t('navigation.selectWallet.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {myWallets?.map((wallet: { wallet_id: string; wallet_name: string; solana_address: string; wallet_type: string; wallet_auth: string }) => (
              <div
                key={wallet.wallet_id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  handleChangeWallet(wallet.wallet_id);
                  setIsWalletDialogOpen(false);
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Wallet2 className="h-4 w-4" />
                    <span className="font-semibold">{wallet.wallet_name}</span>
                    <Badge variant="outline" className="ml-2">
                      {t(`navigation.selectWallet.walletType.${wallet.wallet_type?.toLowerCase() || 'primary'}`)}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      {t(`navigation.selectWallet.walletAuth.${wallet.wallet_auth?.toLowerCase() || 'owner'}`)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {truncateString(wallet.solana_address, 20)}
                  </div>
                </div>
                {walletInfor?.solana_address === wallet.solana_address && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lớp phủ */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu mobile hiển thị khi click vào nút menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden lg:hidden fixed top-16 left-0 w-full bg-primary z-50 shadow-lg"
      >
        <div className="flex flex-col gap-1 px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-all hover:bg-white/10 text-sm font-semibold text-black dark:text-white",
                pathname?.startsWith(item.href)
                  ? "bg-zinc-300 dark:bg-white/20 shadow-sm"
                  : "bg-transparent"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {t(`navigation.${item.name}`)}
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
