import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ModernShop</h3>
            <p className="text-gray-400">
              Your trusted destination for quality products and exceptional shopping experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products?category=electronics">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Electronics
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Clothing
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products?category=home">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Home & Garden
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products?category=sports">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Sports
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Newsletter</h4>
            <p className="text-gray-400">Subscribe for updates and special offers</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary hover:bg-primary-600 px-4 py-2 rounded-r-lg transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ModernShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
