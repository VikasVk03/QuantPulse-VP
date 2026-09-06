export function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">Q</div>

        <div>
          <div className="brand-name">
            QUANT<span>PULSE</span>
          </div>

          <div className="brand-subtitle">Market Terminal</div>
        </div>
      </div>

      <nav className="navigation">
        <a className="active" href="#">
          Dashboard
        </a>

        <a href="#">Analytics</a>

        <a href="#">Backtest</a>

        <a href="#">Research</a>
      </nav>
    </header>
  );
}
