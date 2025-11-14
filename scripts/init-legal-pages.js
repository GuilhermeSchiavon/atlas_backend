const { LegalPage } = require('../models');

async function initLegalPages() {
  try {
    // Termos de Uso
    await LegalPage.upsert({
      type: 'terms',
      title: 'Termos de Uso',
      content: `
<h2>1. Aceitação dos Termos</h2>
<p>Ao acessar e usar o Atlas de Dermatologia do Genital Masculino, você concorda em cumprir estes termos de uso.</p>

<h2>2. Uso Profissional</h2>
<p>Este atlas é destinado exclusivamente para profissionais da saúde devidamente registrados em seus respectivos conselhos profissionais.</p>

<h2>3. Responsabilidades do Usuário</h2>
<p>O usuário se compromete a:</p>
<ul>
<li>Fornecer informações verdadeiras durante o cadastro</li>
<li>Manter a confidencialidade de suas credenciais de acesso</li>
<li>Usar o conteúdo apenas para fins educacionais e científicos</li>
<li>Respeitar os direitos autorais do material disponibilizado</li>
</ul>

<h2>4. Propriedade Intelectual</h2>
<p>Todo o conteúdo do atlas, incluindo textos, imagens e casos clínicos, é protegido por direitos autorais.</p>

<h2>5. Limitação de Responsabilidade</h2>
<p>O atlas é fornecido como ferramenta educacional. As decisões clínicas devem sempre considerar o contexto específico de cada paciente.</p>

<h2>6. Modificações</h2>
<p>Reservamo-nos o direito de modificar estes termos a qualquer momento, com notificação prévia aos usuários.</p>
      `.trim()
    });

    // Política de Privacidade
    await LegalPage.upsert({
      type: 'privacy',
      title: 'Política de Privacidade',
      content: `
<h2>1. Coleta de Informações</h2>
<p>Coletamos as seguintes informações:</p>
<ul>
<li>Dados de identificação profissional (nome, CRM, especialidade)</li>
<li>Informações de contato (email)</li>
<li>Dados de uso da plataforma</li>
</ul>

<h2>2. Uso das Informações</h2>
<p>Utilizamos suas informações para:</p>
<ul>
<li>Verificar sua identidade profissional</li>
<li>Fornecer acesso ao conteúdo do atlas</li>
<li>Melhorar nossos serviços</li>
<li>Comunicar atualizações importantes</li>
</ul>

<h2>3. Compartilhamento de Dados</h2>
<p>Não compartilhamos suas informações pessoais com terceiros, exceto quando:</p>
<ul>
<li>Exigido por lei</li>
<li>Necessário para verificação profissional junto aos conselhos competentes</li>
</ul>

<h2>4. Segurança</h2>
<p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações.</p>

<h2>5. Seus Direitos</h2>
<p>Você tem o direito de:</p>
<ul>
<li>Acessar seus dados pessoais</li>
<li>Corrigir informações incorretas</li>
<li>Solicitar a exclusão de sua conta</li>
<li>Retirar seu consentimento</li>
</ul>

<h2>6. Contato</h2>
<p>Para questões sobre privacidade, entre em contato através do email disponibilizado na plataforma.</p>
      `.trim()
    });

    console.log('Páginas legais inicializadas com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar páginas legais:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initLegalPages().then(() => process.exit(0));
}

module.exports = initLegalPages;