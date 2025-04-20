import { useState } from "react";
import { useLocation } from "wouter";
import { Home, BarChart2, Wallet, User } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
    path: "/",
  },
  {
    id: "activity",
    label: "Activity",
    icon: <BarChart2 className="h-5 w-5" />,
    path: "/activity",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: <Wallet className="h-5 w-5" />,
    path: "/wallet",
  },
  {
    id: "account",
    label: "Account",
    icon: <User className="h-5 w-5" />,
    path: "/account",
  },
];

export function NavigationBar() {
  const [location] = useLocation();
  const [, navigate] = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary py-3 px-2">
      <div className="container mx-auto">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`text-center ${
                location === item.path
                  ? "text-white font-semibold relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[3px] after:bg-white after:rounded-md"
                  : "text-white/80 font-normal"
              }`}
            >
              <button
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center"
              >
                {item.icon}
                <span className="text-sm mt-1">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
