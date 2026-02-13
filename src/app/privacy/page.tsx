'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Lock, Eye, Database, UserCheck, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0 pt-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4"
        >
          <Shield className="h-4 w-4" /> Privacidade
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Política de <span className="text-emerald-600">Privacidade</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Última atualização: 12 de fevereiro de 2026
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-600" /> 1. Introdução
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              A <strong className="text-emerald-600">Guardião de Notas Tecnologia S.A.</strong> ("nós", "nosso", "empresa") está comprometida com a proteção da privacidade e dos dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política. Recomendamos a leitura atenta deste documento.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Database className="h-6 w-6 text-emerald-600" /> 2. Dados Coletados
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Coletamos os seguintes tipos de dados pessoais:
            </p>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">2.1. Dados de Cadastro</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Telefone</li>
                  <li>CPF (opcional, para verificação de identidade)</li>
                  <li>Data de nascimento</li>
                  <li>Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">2.2. Dados de Uso</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Informações sobre garantias e produtos cadastrados</li>
                  <li>Documentos fiscais e notas fiscais enviadas</li>
                  <li>Histórico de transações no marketplace</li>
                  <li>Preferências e configurações da conta</li>
                  <li>Logs de acesso e atividade na plataforma</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">2.3. Dados Técnicos</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e versão</li>
                  <li>Sistema operacional</li>
                  <li>Dispositivo utilizado</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Eye className="h-6 w-6 text-emerald-600" /> 3. Como Utilizamos Seus Dados
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>Prestação de serviços:</strong> Fornecer e melhorar nossos serviços de gestão de garantias e proteção patrimonial</li>
              <li><strong>Processamento de documentos:</strong> Análise automática de notas fiscais via OCR e inteligência artificial</li>
              <li><strong>Comunicação:</strong> Enviar alertas de vencimento de garantias, notificações importantes e respostas ao suporte</li>
              <li><strong>Segurança:</strong> Prevenir fraudes, detectar atividades suspeitas e proteger a segurança da plataforma</li>
              <li><strong>Melhorias:</strong> Analisar padrões de uso para melhorar nossos serviços e desenvolver novas funcionalidades</li>
              <li><strong>Integrações:</strong> Conectar com seguradoras parceiras e facilitar cotações de seguro</li>
              <li><strong>Marketplace:</strong> Facilitar transações entre usuários e processar pagamentos</li>
              <li><strong>Compliance:</strong> Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-600" /> 4. Segurança dos Dados
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Implementamos medidas técnicas e organizacionais robustas para proteger seus dados pessoais:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <p className="text-sm font-black text-emerald-600 uppercase mb-2">Criptografia</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">AES-256 para dados em repouso e TLS 1.3 para dados em trânsito</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <p className="text-sm font-black text-emerald-600 uppercase mb-2">Autenticação</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">Autenticação de dois fatores (2FA) disponível</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <p className="text-sm font-black text-emerald-600 uppercase mb-2">Acesso Restrito</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">Acesso aos dados apenas por pessoal autorizado</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <p className="text-sm font-black text-emerald-600 uppercase mb-2">Monitoramento</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">Monitoramento contínuo de segurança e auditorias regulares</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-emerald-600" /> 5. Seus Direitos (LGPD)
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar a remoção de dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e interoperável</li>
              <li><strong>Eliminação:</strong> Solicitar a exclusão de dados tratados com seu consentimento</li>
              <li><strong>Informação:</strong> Obter informações sobre entidades públicas e privadas com as quais compartilhamos dados</li>
              <li><strong>Revogação do consentimento:</strong> Revogar seu consentimento a qualquer momento</li>
            </ul>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Para exercer seus direitos, entre em contato conosco através do e-mail: <a href="mailto:felipe.monteiro@softlive.dev" className="text-emerald-600 hover:underline font-bold">felipe.monteiro@softlive.dev</a>
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">6. Compartilhamento de Dados</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Não vendemos seus dados pessoais. Podemos compartilhar seus dados apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>Seguradoras parceiras:</strong> Para facilitar cotações de seguro (apenas com seu consentimento explícito)</li>
              <li><strong>Prestadores de serviço:</strong> Empresas que nos auxiliam na operação da plataforma (sob contratos de confidencialidade)</li>
              <li><strong>Obrigações legais:</strong> Quando exigido por lei, ordem judicial ou autoridades competentes</li>
              <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança, ou de nossos usuários</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-emerald-600" /> 7. Cookies e Tecnologias Similares
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. Tipos de cookies utilizados:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>Essenciais:</strong> Necessários para o funcionamento básico da plataforma</li>
              <li><strong>Funcionais:</strong> Permitem funcionalidades aprimoradas e personalização</li>
              <li><strong>Analíticos:</strong> Ajudam a entender como os usuários interagem com a plataforma</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">8. Retenção de Dados</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, salvo quando a retenção for exigida ou permitida por lei. Quando seus dados não forem mais necessários, serão eliminados de forma segura ou anonimizados.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">9. Alterações nesta Política</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas através de e-mail ou aviso na plataforma. A data da última atualização está indicada no topo desta página.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">10. Contato</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Para questões sobre privacidade ou para exercer seus direitos, entre em contato:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Encarregado de Proteção de Dados (DPO)</p>
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
