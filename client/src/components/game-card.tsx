import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GameCardProps {
  name: string;
  Logo: React.ComponentType;
  onPlay: () => void;
}

export function GameCard({ name, Logo, onPlay }: GameCardProps) {
  return (
    <Card className="bg-primary rounded-xl p-4 flex flex-col items-center border-none transform transition-transform hover:translate-y-[-5px]">
      <h2 className="text-xl font-bold mb-3 text-white">{name}</h2>
      <div className="bg-primary rounded-lg w-full aspect-square mb-4 overflow-hidden flex items-center justify-center">
        <div className="w-4/5 h-4/5 flex items-center justify-center">
          <Logo />
        </div>
      </div>
      <Button
        onClick={onPlay}
        className="bg-secondary hover:bg-secondary/90 text-white py-2 px-12 rounded-lg font-medium transition-all hover:scale-105"
      >
        Play
      </Button>
    </Card>
  );
}
