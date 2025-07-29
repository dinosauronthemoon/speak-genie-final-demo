import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { SessionStats } from "@shared/schema";

interface SessionStatsProps {
  conversationId: string;
}

export default function SessionStats({ conversationId }: SessionStatsProps) {
  const { data: stats, isLoading } = useQuery<SessionStats>({
    queryKey: ['/api/conversations', conversationId, 'stats'],
    enabled: !!conversationId,
    refetchInterval: 5000, // Update every 5 seconds
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Session Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span>Session Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Messages Exchanged</span>
          <span className="font-semibold text-gray-900">{stats.messageCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Voice Messages</span>
          <span className="font-semibold text-gray-900">{stats.voiceMessageCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Session Duration</span>
          <span className="font-semibold text-gray-900">
            {formatDuration(stats.duration || 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Language</span>
          <span className="font-semibold text-gray-900">{stats.language}</span>
        </div>

        {/* Progress indicators */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Progress</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Engagement</span>
                <span>{Math.min(100, Math.floor(((stats.messageCount || 0) / 20) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.floor(((stats.messageCount || 0) / 20) * 100))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Voice Practice</span>
                <span>{Math.min(100, Math.floor(((stats.voiceMessageCount || 0) / 10) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.floor(((stats.voiceMessageCount || 0) / 10) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
