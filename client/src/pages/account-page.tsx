import { UserAccount } from "@/components/user-account";
import { NavigationBar } from "@/components/navigation-bar";

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary to-black">
      {/* Header section */}
      <header className="px-4 pt-10 pb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
          My Account
        </h1>
        <p className="text-lg text-white/90">
          Manage your BC99 gaming profile
        </p>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 pb-24 flex-grow">
        {/* User Account Section */}
        <div className="max-w-md mx-auto my-8">
          <UserAccount />
        </div>
      </main>

      {/* Bottom navigation */}
      <NavigationBar />
    </div>
  );
}