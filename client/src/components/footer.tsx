import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <Logo className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-serif font-bold">RUBI IMÓVEIS PRIME</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Encontre o imóvel dos seus sonhos com a elegância e sofisticação que você merece.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-ruby-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-ruby-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-ruby-500 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-ruby-500 transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ruby-500">Imóveis</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Apartamentos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Casas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sítios</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lançamentos</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ruby-500">Empresa</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Equipe</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreira</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ruby-500">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <MessageCircle size={16} className="mr-2" />
                (11) 99999-9999
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 mr-2">@</span>
                contato@rubiimoveis.com
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 mr-2">📍</span>
                São Paulo, SP
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-800 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; 2024 RUBI IMÓVEIS PRIME. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
