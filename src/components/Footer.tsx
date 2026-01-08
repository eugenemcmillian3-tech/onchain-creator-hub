import Link from 'next/link'
import { Github, Twitter, Globe, Shield } from 'lucide-react'

export function Footer() {
  const footerLinks = {
    product: [
      { label: 'Bounties', href: '/bounties' },
      { label: 'Passes', href: '/passes' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Pricing', href: '/pricing' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs/api' },
      { label: 'Smart Contracts', href: '/docs/contracts' },
      { label: 'Frame Guide', href: '/docs/frames' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  }

  const socialLinks = [
    { icon: Github, href: 'https://github.com/onchain-hub', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/onchainhub', label: 'Twitter' },
    { icon: Globe, href: 'https://onchainhub.xyz', label: 'Website' },
  ]

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <div className="w-8 h-8 rounded-lg bg-base flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>Onchain Hub</span>
            </Link>
            <p className="text-text-muted text-sm mb-4">
              The premier platform for creators and hunters on Base + Farcaster.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-muted hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Onchain Creator Hub. All rights reserved.
          </p>
          <p className="text-text-muted text-sm">
            Built on Base • Powered by Farcaster
          </p>
        </div>
      </div>
    </footer>
  )
}
