"use client";
import { useLang } from '@/lang';
import React from 'react'

export default function CreateCoinPumpfun() {
    const { t } = useLang();
  return (
    <div className='container mx-auto min-h-screen flex items-center justify-center'>
      <h1 className='text-2xl font-bold'>{t("createCoinOther.developer")}</h1>
    </div>
  )
}
