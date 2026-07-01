import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <input id="mode" className="mode-box" type="checkbox" />
        <header className="site-header">
          <a className="brand" href="/">Product Guides</a>
          <nav>
            <a href="/products">Products</a>
            <a href="/deals">Deals</a>
            <a href="/blog">Guides</a>
            <a href="/admin">Admin</a>
            <label className="theme-toggle" htmlFor="mode">Dark mode</label>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">Editorial storefront starter.</footer>
      </body>
    </html>
  );
}
