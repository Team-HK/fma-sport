import { HeroSlideForm } from "../HeroSlideForm";

export default function NewHeroSlidePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvelle diapositive</h1>
      <div className="mt-6">
        <HeroSlideForm />
      </div>
    </div>
  );
}
