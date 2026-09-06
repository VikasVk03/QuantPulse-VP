import { Header } from "../components/layout/Header";
import { MarketDashboard } from "../components/market/MarketDashboard";

export default function App() {
  return (
    <div className="app">
      <Header />

      <MarketDashboard />
    </div>
  );
}
