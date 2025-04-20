import { GameCard } from "@/components/game-card";
import { NavigationBar } from "@/components/navigation-bar";
import wingoImg from "@assets/wingo.png";
import aviatorImg from "@assets/avaitor.png";
import slotsImg from "@assets/slots.png";

const games = [
  {
    id: "wingo",
    name: "BC99 Wingo",
    image: wingoImg,
  },
  {
    id: "aviator",
    name: "BC99 Aviator",
    image: aviatorImg,
  },
  {
    id: "slots",
    name: "BC99 Slots",
    image: slotsImg,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary to-black">
      {/* Header section */}
      <header className="px-4 pt-10 pb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
          Welcome to BC99
        </h1>
        <p className="text-lg text-white/90">
          Experience the thrill of our premium games
        </p>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 pb-24 flex-grow">
        {/* Games Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {games.map((game) => (
            <GameCard
              key={game.id}
              name={game.name}
              image={game.image}
              onPlay={() => console.log(`Play ${game.name}`)}
            />
          ))}
        </div>
      </main>

      {/* Bottom navigation */}
      <NavigationBar />
    </div>
  );
}
