import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ThemeCardSkeleton = () => {
  return (
    <Card className="relative rounded-2xl overflow-hidden">
      <CardContent className="relative h-[160px] w-full p-5 flex flex-col justify-between bg-muted/50 rounded-none border-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-12 rounded-lg self-start" />
      </CardContent>
      <CardFooter className="px-4 py-3 border-t rounded-b-2xl">
        <Skeleton className="h-4 w-28 rounded-lg" />
      </CardFooter>
    </Card>
  );
};

const ThemeManagerSkeleton = () => {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
        {[...Array(6)].map((_, i) => (
          <ThemeCardSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ThemeManagerSkeleton;

