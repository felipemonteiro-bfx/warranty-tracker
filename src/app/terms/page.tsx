'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, AlertCircle, ShieldCheck, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0 pt-8">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4"
        >
          <FileText className="h-4 w-4" /> Termos de Uso
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
          Termos e <span className="text-emerald-600">Condições</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Última atualização: 12 de fevereiro de 2026
        </p>
      </header>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <Scale className="h-6 w-6 text-emerald-600" /> 1. Aceitação dos Termos
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Ao acessar e utilizar a plataforma <strong className="text-emerald-600">Guardião de Notas</strong>, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar nossos serviços.
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Estes termos constituem um acordo legal entre você e a Guardião de Notas Tecnologia S.A. ("nós", "nosso", "empresa"). Reservamo-nos o direito de modificar estes termos a qualquer momento, e tais modificações entrarão em vigor imediatamente após sua publicação na plataforma.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> 2. Descrição do Serviço
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              A plataforma Guardião de Notas oferece serviços de gestão de garantias, proteção patrimonial, análise inteligente de documentos fiscais, integração com seguradoras, marketplace interno e ferramentas de análise patrimonial. Nossos serviços incluem:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Armazenamento seguro de documentos fiscais e garantias</li>
              <li>Análise automática de notas fiscais via OCR e inteligência artificial</li>
              <li>Alertas de vencimento de garantias</li>
              <li>Integração com seguradoras parceiras para cotação de seguros</li>
              <li>Marketplace interno para revenda de bens seminovos</li>
              <li>Ferramentas de análise e relatórios patrimoniais</li>
              <li>Sistema de compartilhamento seguro com familiares</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-emerald-600" /> 3. Cadastro e Conta de Usuário
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas, completas e atualizadas. Você é responsável por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Ser responsável por todas as atividades que ocorram sob sua conta</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
            </ul>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou que sejam utilizadas de forma fraudulenta ou inadequada.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">4. Uso Aceitável</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Você concorda em NÃO utilizar a plataforma para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>Atividades ilegais ou não autorizadas</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Transmitir vírus, malware ou código malicioso</li>
              <li>Tentar acessar áreas restritas da plataforma</li>
              <li>Interferir no funcionamento normal da plataforma</li>
              <li>Fazer engenharia reversa ou tentar extrair código-fonte</li>
              <li>Usar a plataforma para spam ou comunicação não solicitada</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">5. Propriedade Intelectual</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Todo o conteúdo da plataforma, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, compilações de dados, software e código-fonte, é propriedade da Guardião de Notas ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual.
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Você recebe uma licença limitada, não exclusiva e não transferível para acessar e usar a plataforma exclusivamente para fins pessoais ou comerciais legítimos, de acordo com estes termos.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">6. Privacidade e Proteção de Dados</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              O tratamento de seus dados pessoais é regido por nossa <a href="/privacy" className="text-emerald-600 hover:underline font-bold">Política de Privacidade</a>, que está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Ao utilizar nossos serviços, você concorda com a coleta, uso e armazenamento de suas informações conforme descrito em nossa política de privacidade.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">7. Limitação de Responsabilidade</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              A plataforma é fornecida "como está" e "conforme disponível". Não garantimos que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 dark:text-slate-300 ml-4">
              <li>A plataforma estará sempre disponível ou livre de erros</li>
              <li>Os resultados obtidos serão precisos ou confiáveis</li>
              <li>Defeitos serão corrigidos</li>
            </ul>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Em nenhuma circunstância seremos responsáveis por danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar a plataforma.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">8. Taxas e Pagamentos</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Alguns recursos da plataforma podem estar disponíveis mediante assinatura paga. Os valores, condições de pagamento e políticas de reembolso serão claramente informados antes da contratação. Reservamo-nos o direito de modificar nossos planos e preços, com aviso prévio de 30 dias.
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              No marketplace interno, aplica-se uma taxa de plataforma de 5% sobre o valor de cada transação concluída.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">9. Rescisão</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Você pode encerrar sua conta a qualquer momento através das configurações da plataforma. Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se você violar estes termos ou se detectarmos atividades fraudulentas.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">10. Lei Aplicável e Foro</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa relacionada a estes termos será resolvida no foro da Comarca de São Paulo - SP, renunciando as partes a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">11. Contato</h2>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Para questões sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Guardião de Notas Tecnologia S.A.</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Email: <a href="mailto:felipe.monteiro@softlive.dev" className="text-emerald-600 hover:underline font-bold">felipe.monteiro@softlive.dev</a>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Telefone: <a href="tel:+5592993276765" className="text-emerald-600 hover:underline font-bold">(92) 99327-6765</a>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Av. Paulista, 1000 - 12º Andar, Bela Vista, São Paulo - SP</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
