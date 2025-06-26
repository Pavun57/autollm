"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface DateCounts {
  [key: string]: number;
}

interface UsageDataPoint {
  date: string;
  count: number;
}

export default function UsagePage() {
  const [user, setUser] = useState<any>(null);
  const [usageHistory, setUsageHistory] = useState<UsageDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Load user data and usage history
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth?.currentUser;
      if (!currentUser || !db) return;
      
      setIsLoading(true);
      
      try {
        // Get user data
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          setUser({
            ...currentUser,
            ...userDoc.data(),
          });
        } else {
          setUser(currentUser);
        }
        
        // Get recent prompts data for chart
        const promptsQuery = query(
          collection(db, "conversations", "messages"),
          where("userId", "==", currentUser.uid),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        
        // This is simplified - in a real app, you'd process this data into daily/weekly usage
        // For demo purposes, we'll group by date and count prompts
        const promptsSnapshot = await getDocs(promptsQuery);
        const promptsByDate = promptsSnapshot.docs.reduce<DateCounts>((acc, doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp?.toDate()).toISOString().split('T')[0];
          
          if (!acc[date]) {
            acc[date] = 0;
          }
          
          acc[date]++;
          return acc;
        }, {});
        
        // Convert to array for chart
        const usageData = Object.entries(promptsByDate).map(([date, count]) => ({
          date,
          count,
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        setUsageHistory(usageData);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        toast({
          title: "Error",
          description: "Failed to load usage data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate usage percentage
  const calculatePercentage = () => {
    if (!user || !user.usage) return 0;
    return Math.min(100, Math.round((user.usage.promptsUsed / user.usage.promptsLimit) * 100));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Track your AI prompt usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="py-6 text-center animate-pulse">Loading usage statistics...</div>
          ) : (
            <>
              {/* Current Usage */}
              <div>
                <h3 className="font-medium mb-2">Current Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {user?.usage?.promptsUsed || 0} / {user?.usage?.promptsLimit || 0} prompts
                    </span>
                    <span>{calculatePercentage()}%</span>
                  </div>
                  <Progress value={calculatePercentage()} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {user?.plan === "free" 
                    ? "Resets daily. Upgrade to Pro for more prompts."
                    : "Resets monthly based on your billing cycle."}
                </p>
              </div>
              
              {/* Usage History Chart */}
              {usageHistory.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Usage History</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.split('-').slice(1).join('/')}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} prompts`, 'Usage']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Prompts" 
                          fill="var(--primary)" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        {user?.plan === "free" && (
          <CardFooter>
            <Button
              onClick={() => router.push("/settings/subscription")}
              variant="outline"
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 