"use client";

import { useEffect, useState } from "react";
import { Button } from "@/ui/button";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  Circle,
  Plus,
  Download,
  Shield,
  ShieldOff,
  Trash,
  X,
} from "lucide-react";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { useLang } from "@/lang";
import { useQuery } from "@tanstack/react-query";
import {
  getInforWallet,
  getMyWallets,
  getPrivate,
  changeName,
  getListBuyToken,
} from "@/services/api/TelegramWalletService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Label } from "@/ui/label";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { TelegramWalletService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { ToastNotification } from "@/ui/toast";
import LogWarring from "@/ui/log-warring";
import { useRouter } from "next/navigation";
import WalletCards from "@/components/wallet/WalletCards";
import SolanaWalletSection from "@/components/wallet/SolanaWalletSection";
import AssetsSection from "@/components/wallet/AssetsSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { langList } from "@/common";

interface Wallet {
  wallet_id: string;
  wallet_name: string;
  wallet_type: string;
  solana_address: string;
  eth_address: string;
  wallet_auth: string;
  wallet_nick_name: string;
  wallet_country: string;
}

export default function Wallet() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const { payloadToken, updateToken } = useAuth();
  const [isDerivingAddress, setIsDerivingAddress] = useState(false);
  const [walletName, setWalletName] = useState("-");
  const [isEditingWalletName, setIsEditingWalletName] = useState(false);
  const [editingWalletName, setEditingWalletName] = useState("");
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editingNickname, setEditingNickname] = useState("");
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [editingCountry, setEditingCountry] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isImportWalletOpen, setIsImportWalletOpen] = useState(false);
  const [importWalletName, setImportWalletName] = useState("");
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importWalletNickname, setImportWalletNickname] = useState("");
  const [importWalletCountry, setImportWalletCountry] = useState("");
  const [isNicknameDisabled, setIsNicknameDisabled] = useState(false);
  const [isCountryDisabled, setIsCountryDisabled] = useState(false);
  const [derivedSolanaAddress, setDerivedSolanaAddress] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: walletInfor, refetch: refecthWalletInfor } = useQuery({
    queryKey: ["wallet-infor"],
    queryFn: getInforWallet,
    enabled: mounted && isAuthenticated,
  });

  const { data: myWallets, refetch: refetchInforWallets } = useQuery({
    queryKey: ["my-wallets"],
    queryFn: getMyWallets,
    enabled: mounted && isAuthenticated,
  });

  const { data: privateKeys } = useQuery({
    queryKey: ["private-keys"],
    queryFn: getPrivate,
    enabled: mounted && isAuthenticated,
  });

  const { data: tokenList, refetch: refetchTokenList } = useQuery({
    queryKey: ["token-buy-list"],
    queryFn: getListBuyToken,
    enabled: mounted && isAuthenticated,
  });

  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  // Thêm state để quản lý popup
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletNickname, setNewWalletNickname] = useState("");
  const [newWalletCountry, setNewWalletCountry] = useState("");
  const [isPrivateKeyOpen, setIsPrivateKeyOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Hàm xử lý sao chép địa chỉ
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(t("notifications.addressCopied"));
    setShowToast(true);
  };

  // Thêm handlers
  const handleAddWallet = async () => {
    // Xử lý logic thêm ví ở đây
    const walletData = {
      name: newWalletName,
      nick_name: newWalletNickname,
      country: newWalletCountry,
      type: "other",
    };
    const res = await TelegramWalletService.addWallet(walletData);
    setIsAddWalletOpen(false);
    setNewWalletName("");
    setNewWalletNickname("");
    setNewWalletCountry("");
    refetchInforWallets();
    setToastMessage(t("wallet.addedSuccess"));
    setShowToast(true);
  };

  const handleImportWallet = async () => {
    const walletData = {
      name: importWalletName,
      nick_name: importWalletNickname,
      country: importWalletCountry,
      private_key: importPrivateKey,
      type: "import",
    };

    try {
      const res = await TelegramWalletService.addWallet(walletData);
      setIsImportWalletOpen(false);
      setImportWalletName("");
      setImportPrivateKey("");
      setImportWalletNickname("");
      setImportWalletCountry("");
      setDerivedSolanaAddress(null);
      refetchInforWallets();
      setToastMessage(t("wallet.walletImportedSuccess"));
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        "Failed to import wallet. Please check your private key."
      );
      setShowToast(true);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    const walletData = { wallet_id: id };
    const res = await TelegramWalletService.deleteWallet(walletData);
    refetchInforWallets();
    setToastMessage(t("wallet.deletedSuccess"));
    setShowToast(true);
  };

  const handleImportPrivateKeyChange = async (value: string) => {
    setImportPrivateKey(value);

    // Reset derived address if input is empty
    if (!value.trim()) {
      setDerivedSolanaAddress(null);
      return;
    }

    // Only process if key looks like it could be valid
    if (value.length >= 32) {
      setIsDerivingAddress(true);

      try {
        // Slight delay to avoid UI freezing during processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Convert the private key string to a Uint8Array
        const privateKeyBytes = bs58.decode(value);

        // Create a keypair from the private key
        const keypair = Keypair.fromSecretKey(privateKeyBytes);

        // Get the public key (Solana address)
        const publicKey = keypair.publicKey.toString();

        // Update the state with the derived address
        setDerivedSolanaAddress(publicKey);

        // Call getWalletInfoByPrivateKey API
        const walletInfo =
          await TelegramWalletService.getWalletInfoByPrivateKey(value);
        if (walletInfo && walletInfo.solana_address) {
          // Set wallet name
          setImportWalletName(walletInfo.wallet_name || "");

          // Handle nickname
          if (walletInfo.wallet_nick_name) {
            setImportWalletNickname(walletInfo.wallet_nick_name);
            setIsNicknameDisabled(true);
          } else {
            setImportWalletNickname("");
            setIsNicknameDisabled(false);
          }

          // Handle country
          if (walletInfo.wallet_country) {
            setImportWalletCountry(walletInfo.wallet_country);
            setIsCountryDisabled(true);
          } else {
            setImportWalletCountry("");
            setIsCountryDisabled(false);
          }
        }
      } catch (error) {
        console.error("Error deriving Solana address:", error);
        setDerivedSolanaAddress(null);
      } finally {
        setIsDerivingAddress(false);
      }
    } else {
      setDerivedSolanaAddress(null);
    }
  };

  const handleChangeWallet = async (id: string) => {
    const res = await TelegramWalletService.useWallet({ wallet_id: id });
    updateToken(res.token);
    refecthWalletInfor();
    refetchTokenList();
    window.location.reload();
  };

  const handleUpdateWallet = async () => {
    try {
      // Find the current wallet to get old values
      const currentWallet = myWallets?.find(
        (w: Wallet) => w.wallet_id === editingWalletId
      );

      // Check for duplicate nickname if editing nickname
      if (isEditingNickname && editingNickname) {
        const isDuplicate = myWallets?.some(
          (w: Wallet) =>
            w.wallet_id !== editingWalletId &&
            w.wallet_nick_name === editingNickname
        );

        if (isDuplicate) {
          setToastMessage(t("wallet.nicknameDuplicate"));
          setShowToast(true);
          return;
        }
      }

      const res = await TelegramWalletService.changeName({
        wallet_id: editingWalletId,
        name: isEditingWalletName
          ? editingWalletName || "-"
          : currentWallet?.wallet_name || "-",
        nick_name: isEditingNickname
          ? editingNickname || "-"
          : currentWallet?.wallet_nick_name || "-",
        country: isEditingCountry
          ? editingCountry || "-"
          : currentWallet?.wallet_country || "-",
      });
      setIsEditingWalletName(false);
      setIsEditingNickname(false);
      setIsEditingCountry(false);
      setEditingWalletId(null);
      refecthWalletInfor();
      refetchInforWallets();
      setToastMessage(t("wallet.updateSuccess"));
      setShowToast(true);
    } catch (error) {
      setToastMessage(t("wallet.updateFailed"));
      setShowToast(true);
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1) {
      return balance.toFixed(5);
    } else {
      const str = balance.toString();
      const decimalIndex = str.indexOf(".");
      if (decimalIndex === -1) return str;

      let firstNonZeroIndex = decimalIndex + 1;
      while (firstNonZeroIndex < str.length && str[firstNonZeroIndex] === "0") {
        firstNonZeroIndex++;
      }

      if (firstNonZeroIndex >= str.length) return str;

      // Ensure minimum of 5 decimal places
      const decimalPlaces = Math.max(firstNonZeroIndex - decimalIndex + 1, 5);
      return balance.toFixed(decimalPlaces);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LogWarring />;
  }

  return (
    <div className="container mx-auto p-6">
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      {/* Wallet Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br bg-[#d8e8f7] text-black rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-orange-500/20 dark:shadow-orange-800/20 animate-float">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-wallet h-7 w-7"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-comic bg-clip-text text-transparent bg-gradient-to-r bg-[#d8e8f7] uppercase">
            {t("wallet.title")}
          </h1>
        </div>

        <div className="mt-4 md:mt-0 flex items-center bg-white dark:bg-[#081e1b] px-3 py-1 shadow-sm border-2 border-dashed border-green-600 rounded-full">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              SOL Balance:
            </span>
            <Badge
              variant="outline"
              className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
            >
              {walletInfor?.solana_balance?.toFixed(5)} SOL
            </Badge>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <WalletCards payloadToken={payloadToken} />

      {/* Get Private Key Button */}
      <div className="flex justify-center mb-8">
        <Button
          className="bg-[#d8e8f7] hover:bg-[#d3eaff] text-black font-medium"
          onClick={() => setIsPrivateKeyOpen(true)}
        >
          <Shield className="mr-2 h-5 w-5" />
          {t("wallet.getPrivateKey")}
        </Button>
      </div>

      {/* My Wallets Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold">{t("wallet.solanaWallet")}</h2>
          <div className="flex gap-2">
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setIsAddWalletOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("wallet.addWallet")}
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => setIsImportWalletOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("wallet.importWallet")}
            </Button>
          </div>
        </div>

        <SolanaWalletSection
          myWallets={myWallets}
          walletInfor={walletInfor}
          isEditingWalletName={isEditingWalletName}
          editingWalletId={editingWalletId}
          editingWalletName={editingWalletName}
          setIsEditingWalletName={setIsEditingWalletName}
          setEditingWalletId={setEditingWalletId}
          setEditingWalletName={setEditingWalletName}
          isEditingNickname={isEditingNickname}
          editingNickname={editingNickname}
          setIsEditingNickname={setIsEditingNickname}
          setEditingNickname={setEditingNickname}
          isEditingCountry={isEditingCountry}
          editingCountry={editingCountry}
          setIsEditingCountry={setIsEditingCountry}
          setEditingCountry={setEditingCountry}
          handleUpdateWallet={handleUpdateWallet}
          handleCopy={handleCopy}
          handleChangeWallet={handleChangeWallet}
          handleDeleteWallet={handleDeleteWallet}
        />
      </div>

      {/* Dialog for adding new wallet */}
      <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {t("wallet.dialog.addNewWallet")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet-name">
                {t("wallet.dialog.walletName")}
              </Label>
              <Input
                id="wallet-name"
                placeholder={t("wallet.dialog.enterWalletName")}
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wallet-nickname">
                {t("wallet.dialog.walletNickname")}
              </Label>
              <Input
                id="wallet-nickname"
                placeholder={t("wallet.dialog.enterWalletNickname")}
                value={newWalletNickname}
                onChange={(e) => setNewWalletNickname(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wallet-country">
                {t("wallet.dialog.walletCountry")}
              </Label>
              <Select
                value={newWalletCountry || langList[0].code}
                onValueChange={setNewWalletCountry}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50">
                  <SelectValue
                    placeholder={t("wallet.dialog.enterWalletCountry")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {langList.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                      <img
                        src={
                          langList.find((lang) => lang.code === country.code)
                            ?.flag || "/placeholder.png"
                        }
                        alt={country.code}
                        className="w-5 h-3 object-cover"
                      />
                      {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWalletOpen(false);
                setNewWalletName("");
                setNewWalletNickname("");
                setNewWalletCountry("");
              }}
            >
              {t("wallet.dialog.cancel")}
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddWallet}
              disabled={!newWalletName.trim() || !newWalletNickname.trim()}
            >
              {t("wallet.dialog.addWallet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isImportWalletOpen}
        onOpenChange={(isOpen) => {
          setIsImportWalletOpen(isOpen);
          if (!isOpen) {
            setImportWalletName("");
            setImportPrivateKey("");
            setImportWalletNickname("");
            setImportWalletCountry("");
            setDerivedSolanaAddress(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {t("wallet.dialog.importWallet")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="import-wallet-name">
                {t("wallet.dialog.walletName")}
              </Label>
              <Input
                id="import-wallet-name"
                placeholder={t("wallet.dialog.enterWalletName")}
                value={importWalletName}
                onChange={(e) => setImportWalletName(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="solana-private-key">
                {t("wallet.dialog.solanaPrivateKey")}
              </Label>
              <div className="relative">
                <Input
                  id="solana-private-key"
                  placeholder={t("wallet.dialog.enterSolanaPrivateKey")}
                  value={importPrivateKey}
                  onChange={(e) => handleImportPrivateKeyChange(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900/50 pr-20"
                  type={showPrivateKey ? "text" : "password"}
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(importPrivateKey);
                    }}
                    disabled={!importPrivateKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <ShieldOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {t("wallet.dialog.privateKeySecurity")}
              </p>
              {derivedSolanaAddress && (
                <div className="mt-2">
                  <Label htmlFor="derived-solana-address">
                    {t("wallet.dialog.derivedSolanaAddress")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="derived-solana-address"
                      value={derivedSolanaAddress}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-900/50 pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(derivedSolanaAddress);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("wallet.dialog.derivedAddressInfo")}
                  </p>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="import-wallet-nickname">
                {t("wallet.dialog.walletNickname")}
              </Label>
              <Input
                id="import-wallet-nickname"
                placeholder={t("wallet.dialog.enterWalletNickname")}
                value={importWalletNickname}
                onChange={(e) => setImportWalletNickname(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50"
                disabled={isNicknameDisabled}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="import-wallet-country">
                {t("wallet.dialog.walletCountry")}
              </Label>
              <Select
                value={importWalletCountry || langList[0].code}
                onValueChange={setImportWalletCountry}
                disabled={isCountryDisabled}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50">
                  <SelectValue
                    placeholder={t("wallet.dialog.enterWalletCountry")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {langList.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                      <img
                        src={
                          langList.find((lang) => lang.code === country.code)
                            ?.flag || "/placeholder.png"
                        }
                        alt={country.code}
                        className="w-5 h-3 object-cover"
                      />
                      {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportWalletOpen(false);
                setImportWalletName("");
                setImportPrivateKey("");
                setImportWalletNickname("");
                setImportWalletCountry("");
              }}
            >
              {t("wallet.dialog.cancel")}
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleImportWallet}
              disabled={
                !importWalletName.trim() ||
                !importPrivateKey.trim() ||
                !importWalletNickname.trim()
              }
            >
              {t("wallet.dialog.importWallet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Private Keys Modal */}
      <Dialog open={isPrivateKeyOpen} onOpenChange={setIsPrivateKeyOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {t("wallet.dialog.privateKeys")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-sm"
              >
                {showPrivateKey
                  ? t("wallet.dialog.hideKeys")
                  : t("wallet.dialog.showKeys")}
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="solana-key">
                {t("wallet.dialog.solanaPrivateKey")}
              </Label>
              <div className="relative">
                <Input
                  id="solana-key"
                  value={
                    showPrivateKey
                      ? privateKeys?.sol_private_key
                      : "••••••••••••••••••••••••••••••••"
                  }
                  readOnly
                  className="pr-10 bg-gray-50 dark:bg-gray-900/50 truncate"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(privateKeys?.sol_private_key);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eth-key">
                {t("wallet.dialog.ethereumPrivateKey")}
              </Label>
              <div className="relative">
                <Input
                  id="eth-key"
                  value={
                    showPrivateKey
                      ? privateKeys?.eth_private_key
                      : "••••••••••••••••••••••••••••••••"
                  }
                  readOnly
                  className="pr-10 bg-gray-50 dark:bg-gray-900/50 truncate"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(privateKeys?.eth_private_key);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bnb-key">
                {t("wallet.dialog.bnbPrivateKey")}
              </Label>
              <div className="relative">
                <Input
                  id="bnb-key"
                  value={
                    showPrivateKey
                      ? privateKeys?.bnb_private_key
                      : "••••••••••••••••••••••••••••••••"
                  }
                  readOnly
                  className="pr-10 bg-gray-50 dark:bg-gray-900/50 truncate"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(privateKeys?.bnb_private_key);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPrivateKeyOpen(false);
                setShowPrivateKey(false);
              }}
            >
              {t("wallet.dialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assets Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("wallet.asset")}</h2>
      </div>

      <AssetsSection tokens={tokenList?.tokens} />
    </div>
  );
}
