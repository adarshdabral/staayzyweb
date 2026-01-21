import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-2xl font-bold">Staayzy</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted platform for finding the perfect student accommodation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Tenants</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/tenant" className="hover:text-white transition">
                  Find Rooms
                </Link>
              </li>
              <li>
                <Link href="/tenant/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=tenant" className="hover:text-white transition">
                  Sign Up as Tenant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/owner" className="hover:text-white transition">
                  List Property
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=owner" className="hover:text-white transition">
                  Sign Up as Owner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Staayzy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


