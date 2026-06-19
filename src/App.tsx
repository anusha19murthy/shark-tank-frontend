import CustomCursor from "./components/CustomCursor";
import Hero from "./components/Hero";
import StatCards from "./components/StatCards";
import PredictionForm from "./components/PredictionForm";

export default function App() {
  return (
    <>
      <CustomCursor />
      <main className="bg-white min-h-screen font-sans antialiased">
        <Hero />
        <StatCards />
        <PredictionForm />
      </main>
    </>
  );
}