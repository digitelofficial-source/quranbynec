import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    testNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <BellOff className="h-5 w-5" />
            <div>
              <p className="font-medium text-foreground">Notifications Not Supported</p>
              <p className="text-sm">Your browser doesn't support push notifications.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isSubscribed 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                : 'bg-muted'
            }`}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : isSubscribed ? (
                <BellRing className="h-5 w-5 text-white" />
              ) : (
                <Bell className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">Daily Streak Reminders</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Get reminded to maintain your streak' 
                  : 'Enable notifications for daily reminders'}
              </p>
            </div>
          </div>
          
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) {
                subscribe();
              } else {
                unsubscribe();
              }
            }}
            disabled={isLoading}
          />
        </div>

        {isSubscribed && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testNotification}
              className="w-full gap-2"
            >
              <BellRing className="h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
