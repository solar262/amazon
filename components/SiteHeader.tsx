import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">Product Guides</Link>
      <nav>
        <Link href="/products">Products</Link>
        <Link href="/deals">Deals</Link>
        <Link href="/blog">Guides</Link>
      </nav>
    </header>
  );
}
