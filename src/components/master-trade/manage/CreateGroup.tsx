import { useLang } from '@/lang'
import { Button } from '@/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Card } from '@/ui/card'
import { Input } from '@/ui/input'
import React from 'react'

export default function CreateGroup({ 
  groupName, 
  setGroupName, 
  handleCreateGroup 
}: { 
  groupName: string; 
  setGroupName: (value: string) => void; 
  handleCreateGroup: () => void; 
}) {
  const { t } = useLang();
  return (
    <Card className="shadow-md dark:shadow-blue-900/5 flex flex-col justify-center gap-8">
    <CardHeader>
      <CardTitle>
        {t("masterTrade.manage.createNewGroup.title")}
      </CardTitle>
    </CardHeader>
    <CardContent className="">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="groupName"
            className="block text-sm font-medium mb-1"
          >
            {t("masterTrade.manage.createNewGroup.groupName")}
          </label>
          <Input
            id="groupName"
            placeholder={t(
              "masterTrade.manage.createNewGroup.groupNamePlaceholder"
            )}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <Button
          className="w-full bg-gray-500 hover:bg-gray-600"
          onClick={handleCreateGroup}
          disabled={!groupName.trim()}
        >
          {t("masterTrade.manage.createNewGroup.createButton")}
        </Button>
      </div>
    </CardContent>
  </Card>
  )
}
