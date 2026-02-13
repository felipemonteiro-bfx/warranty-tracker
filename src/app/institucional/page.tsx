'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Building2, Target, Users, Award, ShieldCheck, TrendingUp, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstitucionalPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 md:px-0 pt-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4"
        >
          <Building2 className="h-4 w-4" /> Institucional
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Guardião <span className="text-emerald-600">de Notas</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-3xl mx-auto">
          A maior plataforma de inteligência e gestão de garantias do Brasil. Protegendo seu patrimônio com tecnologia de ponta.
        </p>
      </header>

      {/* Missão, Visão e Valores */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Missão</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Democratizar o acesso à gestão inteligente de garantias e proteção patrimonial, oferecendo tecnologia de ponta que empodera pessoas e empresas a protegerem seus bens com segurança e eficiência.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Visão</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Ser a plataforma líder em gestão patrimonial na América Latina, reconhecida pela inovação tecnológica, segurança de dados e impacto positivo na vida de milhões de usuários.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Valores</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
              <li>• Transparência e Ética</li>
              <li>• Inovação Contínua</li>
              <li>• Segurança em Primeiro Lugar</li>
              <li>• Foco no Cliente</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sobre a Empresa */}
      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm">
            <Building2 className="h-5 w-5 text-emerald-600" /> Sobre a Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Fundada em 2024, a <strong className="text-emerald-600">Guardião de Notas</strong> nasceu da necessidade de simplificar e modernizar a gestão de garantias e proteção patrimonial no Brasil. Com uma equipe multidisciplinar de especialistas em tecnologia, segurança da informação e direito consumerista, desenvolvemos uma plataforma completa que combina inteligência artificial, criptografia de nível bancário e experiência do usuário de classe mundial.
          </p>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Nossa tecnologia de OCR (Reconhecimento Óptico de Caracteres) utiliza modelos avançados de machine learning para extrair automaticamente informações de notas fiscais, reduzindo erros e economizando tempo. Além disso, oferecemos integração com seguradoras parceiras, marketplace interno para revenda de bens seminovos e sistema de alertas inteligentes para vencimento de garantias.
          </p>
          <div className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-black uppercase">Segurança</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Criptografia AES-256, autenticação de dois fatores e compliance com LGPD.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Award className="h-5 w-5" />
                <span className="text-sm font-black uppercase">Reconhecimento</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Certificações ISO 27001 e reconhecimento como startup inovadora.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Users className="h-5 w-5" />
                <span className="text-sm font-black uppercase">Equipe</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mais de 50 profissionais especializados em tecnologia e segurança.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-black uppercase">Alcance</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Atendemos milhares de usuários em todo o território nacional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Empresa */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tighter">Dados da Empresa</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-200 tracking-widest mb-2">Razão Social</p>
              <p className="text-lg font-bold">Guardião de Notas Tecnologia S.A.</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-200 tracking-widest mb-2">CNPJ</p>
              <p className="text-lg font-bold">00.000.000/0001-00</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-200 tracking-widest mb-2">Endereço</p>
              <p className="text-lg font-bold">Av. Paulista, 1000 - 12º Andar<br />Bela Vista, São Paulo - SP<br />CEP: 01310-100</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-200 tracking-widest mb-2">Contato</p>
              <p className="text-lg font-bold">
                <a href="mailto:felipe.monteiro@softlive.dev" className="hover:text-emerald-200 transition-colors">felipe.monteiro@softlive.dev</a><br />
                <a href="tel:+5592993276765" className="hover:text-emerald-200 transition-colors">(92) 99327-6765</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
