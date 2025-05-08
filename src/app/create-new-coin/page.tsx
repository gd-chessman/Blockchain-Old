"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Coins, Copy, DogIcon, ExternalLink } from "lucide-react";
import { Avatar } from "@/ui/avatar";
import { useForm } from "react-hook-form";
import { TelegramWalletService } from "@/services/api";
import {
  getMyTokens,
  getTokenCategorys,
} from "@/services/api/TelegramWalletService";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lang";
import { useRouter } from "next/navigation";
import { truncateString } from "@/utils/format";
import { ToastNotification } from "@/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import LogWarring from "@/ui/log-warring";
import Select from "react-select";

// Define types
type Category = {
  id: string;
  name: string;
};

type Token = {
  token_id: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logo_url: string;
};

// Dữ liệu mẫu cho danh sách coin

// Define form data type
type FormData = {
  name: string;
  symbol: string;
  amount: string;
  description: string;
  image: File | null;
  telegram?: string;
  website?: string;
  twitter?: string;
  showName: boolean;
  category_list: string[];
};

export default function CreateCoin() {
  const { isAuthenticated } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [isAmountEnabled, setIsAmountEnabled] = useState(false);
  const [amountValue, setAmountValue] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const { data: memeCoins = [], refetch } = useQuery<Token[]>({
    queryKey: ["my-tokens"],
    queryFn: getMyTokens,
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["token-categories"],
    queryFn: getTokenCategorys,
  });
  const { t } = useLang();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      symbol: "",
      amount: "",
      description: "",
      showName: true,
    },
  });

  // Watch form values for preview
  const watchedValues = watch();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      data.image = fileImage;
      console.log(data);
      const res = await TelegramWalletService.createToken(data);
      reset();
      setFileImage(null);
      setLogoPreview(null);
      setToastMessage(t("createCoin.success"));
      setShowToast(true);
      refetch();
    } catch (error) {
      console.error("Error creating meme coin:", error);
      setToastMessage(t("createCoin.error"));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setToastMessage(t("createCoin.copySuccess"));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileImage(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) return <LogWarring />;

  return (
    <div className="container mx-auto p-6">
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br bg-[#d8e8f7] text-black rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-[#b752e1]/20 dark:shadow-[#b752e1]/20 animate-wiggle">
          <Coins className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold font-comic bg-clip-text text-transparent bg-gradient-to-r bg-[#d8e8f7] uppercase">
          {t("createCoin.title")}
        </h1>
      </div>
      <div className="text-sm text-muted-foreground my-2 md:mt-0 ml-auto">
        {/* {t("createCoin.subtitle")} */}
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-6">
          <TabsTrigger value="create">
            {t("createCoin.tabs.create")}
          </TabsTrigger>
          <TabsTrigger value="my-coins" className="relative">
            {t("createCoin.tabs.myCoins")}
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {memeCoins?.length || 0}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className="shadow-md dark:shadow-blue-900/5 ">
              <CardHeader>
                <CardTitle>{t("createCoin.tabs.create")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("createCoin.form.name")}
                    </label>
                    <Input
                      id="name"
                      {...register("name", {
                        required: t("createCoin.form.nameRequired"),
                      })}
                      placeholder={t("createCoin.form.namePlaceholder")}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="symbol"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("createCoin.form.symbol")}
                    </label>
                    <Input
                      id="symbol"
                      {...register("symbol", {
                        required: t("createCoin.form.symbolRequired"),
                      })}
                      placeholder={t("createCoin.form.symbolPlaceholder")}
                    />
                    {errors.symbol && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.symbol.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("createCoin.form.amount")}
                    </label>
                    <div className="relative">
                      <Input
                        id="amount"
                        {...register("amount", {
                          required: t("createCoin.form.amountRequired"),
                          disabled: !isAmountEnabled,
                        })}
                        type="number"
                        placeholder={t("createCoin.form.amountPlaceholder")}
                        value={!isAmountEnabled ? "0" : amountValue}
                        onChange={(e) => {
                          setAmountValue(e.target.value);
                          register("amount").onChange(e);
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setIsAmountEnabled(!isAmountEnabled);
                            if (!isAmountEnabled) {
                              setAmountValue("");
                            } else {
                              setAmountValue("0");
                            }
                          }}
                        >
                          {isAmountEnabled ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                            </svg>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          (SOL)
                        </span>
                      </div>
                    </div>
                    {errors.amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="category_list"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("createCoin.form.categories")}
                    </label>
                    <Select
                      id="category_list"
                      isMulti
                      options={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                      }))}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder={t("createCoin.form.categories")}
                      onChange={(newValue) => {
                        const selectedIds = newValue.map((item) => item.value);
                        const event = {
                          target: {
                            value: selectedIds,
                            name: "category_list",
                          },
                        };
                        register("category_list").onChange(event);
                      }}
                      value={categories
                        .filter((category) =>
                          watch("category_list")?.includes(category.id)
                        )
                        .map((category) => ({
                          value: category.id,
                          label: category.name,
                        }))}
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--input))",
                          color: "hsl(var(--foreground))",
                          "&:hover": {
                            borderColor: "hsl(var(--input))",
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: "hsl(var(--background))",
                          color: "hsl(var(--foreground))",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "hsl(var(--primary))"
                            : state.isFocused
                            ? "hsl(var(--accent))"
                            : "transparent",
                          color: state.isSelected
                            ? document.documentElement.classList.contains(
                                "dark"
                              )
                              ? "#fff"
                              : "#000"
                            : "hsl(var(--foreground))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--accent))",
                            color: "hsl(var(--foreground))",
                          },
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: "hsl(var(--primary))",
                          color: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#fff"
                            : "#000",
                          borderRadius: "0.375rem",
                          padding: "0.125rem 0.25rem",
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#fff"
                            : "#000",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          padding: "0.125rem 0.25rem",
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#fff"
                            : "#000",
                          padding: "0.125rem 0.25rem",
                          ":hover": {
                            backgroundColor: "hsl(var(--destructive))",
                            color: "white",
                          },
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "hsl(var(--foreground))",
                          fontSize: "0.875rem",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "hsl(var(--foreground))",
                          fontSize: "0.875rem",
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "hsl(var(--muted-foreground))",
                          fontSize: "0.875rem",
                        }),
                        menuList: (base) => ({
                          ...base,
                          color: "hsl(var(--foreground))",
                        }),
                        noOptionsMessage: (base) => ({
                          ...base,
                          color: "hsl(var(--muted-foreground))",
                        }),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium mb-1"
                      >
                        {t("createCoin.form.description")}
                      </label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder={t(
                          "createCoin.form.descriptionPlaceholder"
                        )}
                        className="h-[200px]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium mb-1 whitespace-nowrap"
                      >
                        {t("createCoin.form.logo")}{" "}
                        <span className="text-muted-foreground whitespace-nowrap">
                          * ({t("createCoin.form.logoDes")})
                        </span>
                      </label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-[200px]">
                        {logoPreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={logoPreview || ""}
                              alt="Logo preview"
                              className="w-full h-full object-contain rounded"
                            />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                              onClick={() => {
                                setLogoPreview(null);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <DogIcon className="size-12 text-primary" />
                            <span className="text-xs text-muted-foreground mt-2">
                              {t("createCoin.form.logoUpload")}
                            </span>
                            <Input
                              id="logo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              {...register("image", {
                                required: t("createCoin.form.logoRequired"),
                              })}
                              onChange={handleLogoChange}
                            />
                          </label>
                        )}
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-500"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced
                        ? t("createCoin.form.hideOptions")
                        : t("createCoin.form.showOptions")}
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label
                          htmlFor="telegram"
                          className="block text-sm font-medium mb-1"
                        >
                          {t("createCoin.form.telegram")}
                        </label>
                        <Input
                          id="telegram"
                          {...register("telegram")}
                          placeholder={t("createCoin.form.telegramPlaceholder")}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium mb-1"
                        >
                          {t("createCoin.form.website")}
                        </label>
                        <Input
                          id="website"
                          {...register("website")}
                          placeholder={t("createCoin.form.websitePlaceholder")}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="twitter"
                          className="block text-sm font-medium mb-1"
                        >
                          {t("createCoin.form.twitter")}
                        </label>
                        <Input
                          id="twitter"
                          {...register("twitter")}
                          placeholder={t("createCoin.form.twitterPlaceholder")}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#d8e8f7] hover:bg-[#cfe8ff] text-black mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t("createCoin.form.creating")}
                      </div>
                    ) : (
                      t("createCoin.form.createButton")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="hidden md:block space-y-4 h-full">
              <Card className="shadow-md dark:shadow-blue-900/5 ">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {t("createCoin.latestTokens.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 h-[15.4rem] overflow-y-auto flex flex-col-reverse">
                  <div className="grid grid-cols-3 gap-4">
                    {memeCoins?.slice(0, 3).map((coin: any) => (
                      <div
                        key={coin.token_id}
                        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar
                          className="h-10 w-10"
                          src={coin.logo_url}
                          alt={coin.name}
                        />
                        <div className="text-center">
                          <h4 className="font-medium text-sm truncate w-full">
                            {coin.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {coin.symbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {truncateString(coin.address, 10)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-3 w-6"
                            onClick={() => handleCopyAddress(coin.address)}
                          >
                            <Copy className="h-2 w-2" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#d8e8f7] text-black h-7 text-xs w-full"
                          onClick={() =>
                            router.push(
                              `/trading/token?address=${coin.address}`
                            )
                          }
                        >
                          {t("createCoin.myCoins.tradeButton")}
                        </Button>
                      </div>
                    ))}
                    {(!memeCoins || memeCoins.length === 0) && (
                      <div className="text-center text-muted-foreground py-2 text-sm w-full col-span-3">
                        {t("createCoin.latestTokens.noTokens")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md dark:shadow-blue-900/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {t("createCoin.preview.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 h-[22rem]">
                  <div className="text-center text-muted-foreground">
                    {logoPreview ? (
                      <div className="mb-2">
                        <img
                          src={logoPreview || ""}
                          alt="Logo preview"
                          className="size-48 object-contain mx-auto rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="size-48 rounded-full bg-muted flex items-center justify-center mb-2 mx-auto">
                        <DogIcon className="size-16 text-primary" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold">
                      {watchedValues.name ||
                        t("createCoin.preview.defaultName")}
                    </h3>
                    <p className="text-xs mt-0.5">
                      {watchedValues.symbol
                        ? watchedValues.symbol.toUpperCase()
                        : t("createCoin.preview.defaultSymbol")}
                    </p>
                    <p className="mt-2 text-xs">
                      {watchedValues.description ||
                        t("createCoin.preview.defaultDescription")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-coins">
          <div className="flex flex-row items-center justify-between !px-0 space-y-1.5 p-6">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">{t("createCoin.myCoins.title")}</h1>
            <div className="text-sm text-muted-foreground text-zinc-400">
              {memeCoins?.length || 0} {t("createCoin.myCoins.count")}
            </div>
          </div>
          <Card className="border-none shadow-none ">
            <CardContent className="!px-0 border rounded-lg">
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>
                        {t("createCoin.myCoins.columns.coin")}
                      </TableHead>
                      <TableHead>
                        {t("createCoin.myCoins.columns.symbol")}
                      </TableHead>
                      <TableHead>
                        {t("createCoin.myCoins.columns.address")}
                      </TableHead>
                      <TableHead>
                        {t("createCoin.myCoins.columns.decimals")}
                      </TableHead>
                      <TableHead>
                        {t("createCoin.myCoins.columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(memeCoins) &&
                      memeCoins?.map((coin: any) => (
                        <TableRow
                          key={coin.token_id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar
                                className="h-8 w-8 mr-2"
                                src={coin.logo_url}
                                alt={coin.name}
                              >
                                <p>
                                  {coin.symbol.substring(0, 2).toUpperCase()}
                                </p>
                              </Avatar>
                              <span>{coin.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{coin.symbol}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]">
                                {truncateString(coin.address, 14)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-2 w-2"
                                onClick={() => handleCopyAddress(coin.address)}
                              >
                                <Copy className="h-1.5 w-1.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{coin.decimals}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/trading/token?address=${coin.address}`
                                )
                              }
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border-purple-300 dark:border-purple-700 rounded-full"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              {t("trading.trade")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
