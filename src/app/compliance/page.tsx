'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, CheckCircle2, FileCheck, Award, Lock, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompliancePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0 pt-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4"
        >
          <ShieldCheck className="h-4 w-4" /> Compliance
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Compliance e <span className="text-emerald-600">Conformidade</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nossos compromissos com regulamentações e melhores práticas
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-emerald-600" /> 1. Compromisso com Compliance
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              A <strong className="text-emerald-600">Guardião de Notas Tecnologia S.A.</strong> está comprometida com a conformidade legal e regulatória em todas as suas operações. Mantemos um programa robusto de compliance que garante o cumprimento de todas as leis e regulamentações aplicáveis, bem como as melhores práticas do setor.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> 2. Legislações e Regulamentações
            </h2>
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Lei Geral de Proteção de Dados (LGPD)
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  Totalmente em conformidade com a Lei nº 13.709/2018. Implementamos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Política de Privacidade transparente e acessível</li>
                  <li>Encarregado de Proteção de Dados (DPO) designado</li>
                  <li>Mecanismos para exercício dos direitos dos titulares</li>
                  <li>Registro de operações de tratamento de dados pessoais</li>
                  <li>Medidas de segurança técnicas e administrativas adequadas</li>
                  <li>Notificação de incidentes de segurança à ANPD quando aplicável</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Código de Defesa do Consumidor (CDC)
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  Respeitamos integralmente a Lei nº 8.078/1990:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Transparência em contratos e condições de uso</li>
                  <li>Direito de arrependimento em transações online</li>
                  <li>Garantia de qualidade dos serviços prestados</li>
                  <li>Canais de atendimento ao consumidor</li>
                  <li>Resolução de conflitos de forma ágil e justa</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Marco Civil da Internet
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  Conformidade com a Lei nº 12.965/2014:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Neutralidade da rede</li>
                  <li>Proteção de dados e privacidade</li>
                  <li>Liberdade de expressão e manifestação do pensamento</li>
                  <li>Transparência na gestão de dados</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Award className="h-6 w-6 text-emerald-600" /> 3. Certificações e Padrões
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl">
                <h3 className="text-sm font-black text-emerald-600 uppercase mb-2">ISO 27001</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">Sistema de Gestão de Segurança da Informação certificado</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl">
                <h3 className="text-sm font-black text-emerald-600 uppercase mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">Auditoria anual de controles de segurança</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl">
                <h3 className="text-sm font-black text-emerald-600 uppercase mb-2">PCI DSS</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">Conformidade para processamento de pagamentos</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl">
                <h3 className="text-sm font-black text-emerald-600 uppercase mb-2">LGPD Compliance</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">Certificação de conformidade com proteção de dados</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-600" /> 4. Segurança da Informação
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Implementamos controles rigorosos de segurança da informação:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>Criptografia:</strong> AES-256 para dados em repouso, TLS 1.3 para dados em trânsito</li>
              <li><strong>Controles de acesso:</strong> Autenticação multifator, princípio do menor privilégio</li>
              <li><strong>Monitoramento:</strong> Sistemas de detecção de intrusão e análise de comportamento</li>
              <li><strong>Backup e recuperação:</strong> Backups automatizados e testes regulares de recuperação</li>
              <li><strong>Gestão de vulnerabilidades:</strong> Varreduras regulares e correção proativa</li>
              <li><strong>Treinamento:</strong> Programas contínuos de conscientização em segurança</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-600" /> 5. Código de Conduta e Ética
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Mantemos um Código de Conduta e Ética que orienta todas as nossas ações:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Integridade e honestidade em todas as relações</li>
              <li>Respeito aos direitos humanos e diversidade</li>
              <li>Transparência nas comunicações</li>
              <li>Responsabilidade social e ambiental</li>
              <li>Combate à corrupção e práticas antiéticas</li>
              <li>Canais de denúncia e whistleblowing</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-emerald-600" /> 6. Gestão de Riscos
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Mantemos um programa estruturado de gestão de riscos que inclui:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Identificação e avaliação periódica de riscos</li>
              <li>Implementação de controles mitigadores</li>
              <li>Monitoramento contínuo e revisão de riscos</li>
              <li>Plano de continuidade de negócios</li>
              <li>Resposta a incidentes documentada e testada</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">7. Auditoria e Monitoramento</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Realizamos auditorias regulares internas e externas para garantir a conformidade contínua:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Auditorias internas trimestrais</li>
              <li>Auditorias externas anuais por empresas certificadas</li>
              <li>Revisões de compliance mensais</li>
              <li>Monitoramento de mudanças regulatórias</li>
              <li>Treinamento contínuo da equipe</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">8. Relatórios de Compliance</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Publicamos relatórios anuais de compliance e transparência, disponíveis para stakeholders interessados. Para solicitar cópias ou mais informações sobre nossos programas de compliance, entre em contato através do e-mail: <a href="mailto:felipe.monteiro@softlive.dev" className="text-emerald-600 hover:underline font-bold">felipe.monteiro@softlive.dev</a>
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">9. Contato</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Área de Compliance</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Email: <a href="mailto:felipe.monteiro@softlive.dev" className="text-emerald-600 hover:underline font-bold">felipe.monteiro@softlive.dev</a>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Telefone: <a href="tel:+5592993276765" className="text-emerald-600 hover:underline font-bold">(92) 99327-6765</a>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Guardião de Notas Tecnologia S.A.</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Av. Paulista, 1000 - 12º Andar, Bela Vista, São Paulo - SP</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
