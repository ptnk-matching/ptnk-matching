"use client";

import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo và Heading */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              {/* Logo PTNK - Logo ngang */}
              <div className="relative h-12 flex-shrink-0" style={{ minWidth: '200px' }}>
                <Image
                  src="/ptnk-logo-full.png"
                  alt="Logo PTNK"
                  width={200}
                  height={48}
                  className="object-contain h-full w-auto"
                  priority
                  onError={(e) => {
                    // Fallback nếu không có logo
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="h-12 px-4 bg-gradient-to-r from-primary-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          PTNK
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <div className="flex flex-col border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Hệ thống matching
                </h1>
                <p className="text-sm text-gray-500">
                  Trường Phổ thông Năng khiếu ĐHQG-HCM
                </p>
              </div>
            </Link>
          </div>

          {/* Auth Button */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}

