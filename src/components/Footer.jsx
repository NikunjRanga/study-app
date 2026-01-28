import React from 'react';
import { Command, ArrowRight } from 'lucide-react';
import DATA from '../data/data';
import Logo from './Logo';

const Footer = () => (
  <footer className="bg-zinc-50 border-t border-zinc-100 pt-24 pb-12 mt-24">
    <div className="max-w-[1400px] mx-auto px-6 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-bold text-xl text-zinc-900">Study-App</span>
          </div>
          <p className="text-zinc-500 font-light leading-relaxed max-w-sm">
            Redefining how developers learn. High-fidelity content for the modern web engineering stack.
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-zinc-900 mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            {['Courses', 'Workshops', 'Pricing', 'Teams'].map(item => (
              <li key={item}>
                <a href="#" className="hover:text-indigo-600 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-zinc-900 mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            {DATA.footer.links.map(link => (
              <li key={link.name}>
                <a href={link.url} className="hover:text-indigo-600 transition-colors">{link.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold text-zinc-900 mb-6">Newsletter</h4>
          <p className="text-zinc-500 text-sm mb-4">Latest tech trends, weekly.</p>
          <div className="flex gap-2">
            <input className="bg-white border border-zinc-200 rounded-lg px-4 py-2.5 w-full text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="email@domain.com" />
            <button className="bg-zinc-900 text-white rounded-lg px-4 hover:bg-zinc-800 transition-colors">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-zinc-200 text-xs text-zinc-400 font-medium tracking-wide uppercase">
        <p>{DATA.footer.copyright}</p>
        <div className="flex gap-8">
          {['Terms', 'Privacy', 'Cookies'].map(item => (
            <a key={item} href="#" className="hover:text-zinc-900 transition-colors">{item}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
