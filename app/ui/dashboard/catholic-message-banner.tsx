'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CatholicMessageBannerProps {
    isLoggedIn?: boolean;
}

const CATHOLIC_MESSAGES = [
    'Deus não nos dá desafios que não possamos superar com Sua graça.',
    'A oração é a chave que abre o coração de Deus.',
    'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.',
    'A fé move montanhas, mas a esperança as mantém em movimento.',
    'Deus está sempre ao nosso lado, mesmo quando não O sentimos.',
    'A caridade é o amor em ação, não apenas em palavras.',
    'Perdoe como Cristo perdoou, com amor e misericórdia infinita.',
    'A humildade é a base de todas as virtudes cristãs.',
    'Em momentos de dificuldade, lembre-se: Deus escreve certo por linhas tortas.',
    'A paz que vem de Deus ultrapassa todo entendimento.',
    'Seja luz no mundo, refletindo o amor de Cristo.',
    'A gratidão transforma o que temos em suficiente.',
    'Deus tem um plano para você, mesmo quando não consegue ver.',
    'A paciência é uma virtude que nos aproxima de Deus.',
    'O amor de Deus é incondicional e eterno.',
    'Confie no tempo de Deus, Ele sabe o melhor momento.',
    'A esperança é a âncora da alma em tempos difíceis.',
    'Seja instrumento da paz e do amor de Deus.',
    'A oração constante fortalece nossa relação com o Pai.',
    'Deus nos ama tanto que enviou Seu Filho para nos salvar.',
];

export default function CatholicMessageBanner({ isLoggedIn = true }: CatholicMessageBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % CATHOLIC_MESSAGES.length);
                setFade(true);
            }, 300); // Tempo para fade out antes de mudar a mensagem
        }, 12000); // Muda a cada 12 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`w-full bg-gradient-to-r from-[#6d7749] to-[#5d6541] rounded-lg shadow-md p-6 md:p-8 ${!isLoggedIn ? 'fixed bottom-0 left-0 right-0 z-50 rounded-none md:relative md:rounded-lg' : ''}`}>
            <div className="flex items-center justify-center gap-4 md:gap-6">
                {/* Logo à esquerda - mobile (56px com 50% opacity) */}
                <div className="flex-shrink-0 md:hidden">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={56}
                        height={56}
                        className="rounded-full object-cover border-2 border-white/30 shadow-lg opacity-50"
                    />
                </div>
                
                {/* Logo à esquerda - desktop (80px com 100% opacity) */}
                <div className="flex-shrink-0 hidden md:block">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="rounded-full object-cover border-2 border-white/30 shadow-lg"
                    />
                </div>
                
                {/* Mensagem */}
                <div className="flex-1 max-w-4xl text-center">
                    <p 
                        className={`text-white text-lg md:text-xl font-medium leading-relaxed transition-opacity duration-300 ${
                            fade ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        "{CATHOLIC_MESSAGES[currentIndex]}"
                    </p>
                </div>
                
                {/* Logo (duplicado à direita para simetria) - apenas desktop */}
                <div className="flex-shrink-0 hidden md:block">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="rounded-full object-cover border-2 border-white/30 shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}

