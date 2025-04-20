import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export function UserAccount() {
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;

  // Generate a random color for the avatar fallback
  const getRandomColor = () => {
    const colors = [
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", 
      "bg-blue-500", "bg-violet-500", "bg-fuchsia-500"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get initials from username
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Format balance with 2 decimal places
  const formattedBalance = parseFloat(user.balance.toString()).toFixed(2);

  return (
    <Card className="w-full border-2 border-purple-600/20 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-purple-600">
            <AvatarImage src={""} alt={user.username} />
            <AvatarFallback className={`${getRandomColor()} text-xl font-bold`}>
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
          
          <div className="flex items-center justify-center gap-1 mb-1 text-purple-200">
            <span className="text-sm">UID:</span>
            <span className="font-mono font-bold">{user.uid}</span>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-full px-4 py-1 mb-6">
            <span className="text-white font-bold">₹ {formattedBalance}</span>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-purple-600 text-purple-100 hover:bg-purple-900 hover:text-white"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4 animate-pulse" />
                Logging out...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}