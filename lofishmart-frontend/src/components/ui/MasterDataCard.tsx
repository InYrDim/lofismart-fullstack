import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MasterDataCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    itemCount: number;
    isLoading: boolean;
    onManage: () => void;
}

export const MasterDataCard: React.FC<MasterDataCardProps> = ({
    title,
    description,
    icon: Icon,
    iconColor,
    itemCount,
    isLoading,
    onManage,
}) => {
    return (
        <Card className="group hover:shadow-md transition-all duration-200 border-gray-100">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                        {isLoading ? "..." : `${itemCount} item`}
                    </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 mt-3">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Button
                    onClick={onManage}
                    variant="outline"
                    className="w-full gap-2 h-10 font-semibold group-hover:bg-gray-50 transition-colors"
                >
                    <Settings2 className="w-4 h-4" />
                    Kelola {title}
                </Button>
            </CardContent>
        </Card>
    );
};
