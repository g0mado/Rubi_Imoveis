import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Logo from "./logo";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <h1 className="text-2xl font-serif font-bold text-black">RUBI IMÓVEIS PRIME</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`font-medium transition-colors ${
                location === '/' ? 'text-ruby-700' : 'text-gray-700 hover:text-ruby-700'
              }`}
            >
              Início
            </Link>
            <a href="#properties" className="text-gray-700 hover:text-ruby-700 font-medium transition-colors">
              Imóveis
            </a>
            <a href="#about" className="text-gray-700 hover:text-ruby-700 font-medium transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-gray-700 hover:text-ruby-700 font-medium transition-colors">
              Contato
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/admin/login">
              <Button className="ruby-gradient text-white hover:opacity-90 transition-opacity font-medium">
                Admin Login
              </Button>
            </Link>
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              <Link href="/" className="block py-2 text-gray-700 hover:text-ruby-700">Início</Link>
              <a href="#properties" className="block py-2 text-gray-700 hover:text-ruby-700">Imóveis</a>
              <a href="#about" className="block py-2 text-gray-700 hover:text-ruby-700">Sobre</a>
              <a href="#contact" className="block py-2 text-gray-700 hover:text-ruby-700">Contato</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
