require('dotenv').config();
const { Adm, User, Category } = require('../models');

const adms = [
  {
    firstName: "Unimagem",
    lastName: "Produções Audiovisuais",
    email: "unimagem@unimagem.com.br",
    password: "$2b$10$zN51hOTqTFOqG/dyXWyUTufwegD2.7xFb1bq3kerFd.zLkn/ipU26",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVuaW1hZ2VtQHVuaW1hZ2VtLmNvbS5iciIsInR5cGUiOiJwYXNzd29yZC1yZXNldCIsImlhdCI6MTcxMTk4Mjc2NCwiZXhwIjoxNzExOTg2MzY0fQ.QKJUY3jT7Lg67G5-W_-JAtMlSPyFr4FRseiSGyZzwC8",
    status: "ativo"
  }
];

const users = [
  {
    firstName: "Guilherme", 
    lastName: "Schiavon", 
    email: "guilherme.schiavon@outlook.com", 
    cpf: null, 
    phone_wa: null, 
    nacionalidade: null, 
    date_nascimento: null, 
    sexo: null, 
    consent_wa: null, 
    acceptMessage_wa: null, 
    check_pesquisa: null, 
    password: "$2b$10$3azVb0uEc5EdnsRB4Yxn.e88cdqXgcqOXvTZ6CYoLHUTtAadQUSMq", 
    token: null, 
    image: null, 
    date_aprovacao: null, 
    accounType: "associado", 
    status: "ativo", 
    externalId: null
  }
];

const categories = [
  { number: 1 , title: "Exame físico do genital masculino", description: "Exame físico do genital masculino", slug: "exame-fisico-do-genital-masculino" },
  { number: 2 , title: "Propedêutica dermatológica e urológica", description: "Propedêutica dermatológica e urológica", slug: "propedeutica-dermatologica-e-urologica" },
  { number: 3 , title: "Biópsia cutânea do genital masculino", description: "Biópsia cutânea do genital masculino", slug: "biopsia-cutanea-do-genital-masculino" },
  { number: 4 , title: "Interpretação do exame histológico ", description: "Interpretação do exame histológico ", slug: "interpretacao-do-exame-histologico" },
  { number: 5 , title: "Formulações magistraispara área genital masculina", description: "Formulações magistraispara área genital masculina", slug: "formulacoes-magistraispara-area-genital-masculina" },
  { number: 6 , title: "Pápulas perláceas do pênis (Tyson)", description: "Pápulas perláceas do pênis (Tyson)", slug: "papulas-perlaceas-do-penis-tyson" },
  { number: 7 , title: "Glândulas sebáceas ectópicas (Fordyce)", description: "Glândulas sebáceas ectópicas (Fordyce)", slug: "glandulas-sebaceas-ectopicas-fordyce" },
  { number: 8 , title: "Angioqueratoma de Fordyce", description: "Angioqueratoma de Fordyce", slug: "angioqueratoma-de-fordyce" },
  { number: 9 , title: "Variações de pigmentação", description: "Variações de pigmentação", slug: "variacoes-de-pigmentacao" },
  { number: 10, title: "Nevos e melanoses", description: "Nevos e melanoses", slug: "nevos-e-melanoses" },
  { number: 11, title: "Queratose seborreica", description: "Queratose seborreica", slug: "queratose-seborreica" },
  { number: 12, title: "Cistos epidérmicos escrotais (lúpias)", description: "Cistos epidérmicos escrotais (lúpias)", slug: "cistos-epidermicos-escrotais-lupias" },
  { number: 13, title: "Neuroma traumático", description: "Neuroma traumático", slug: "neuroma-traumatico" },
  { number: 14, title: "Acrocórdon (fibroma mole)", description: "Acrocórdon (fibroma mole)", slug: "acrocordon-fibroma-mole" },
  { number: 15, title: "Linfangioma", description: "Linfangioma", slug: "linfangioma" },
  { number: 16, title: "Fimose e pseudofimose", description: "Fimose e pseudofimose", slug: "fimose-e-pseudofimose" },
  { number: 17, title: "Balanites e balanopostites", description: "Balanites e balanopostites", slug: "balanites-e-balanopostites" },
  { number: 18, title: "Dermatoses intertriginosas ", description: "Dermatoses intertriginosas ", slug: "dermatoses-intertriginosas" },
  { number: 19, title: "Psoríase e Dermatite Seborreica", description: "Psoríase e Dermatite Seborreica", slug: "psoriase-e-dermatite-seborreica" },
  { number: 20, title: "Dermatites Dermatites Eczematosas", description: "Dermatites Dermatites Eczematosas", slug: "dermatites-dermatites-eczematosas" },
  { number: 21, title: "Balanite de Zoon", description: "Balanite de Zoon", slug: "balanite-de-zoon" },
  { number: 22, title: "Liquen Escleroso e Atrófico", description: "Liquen Escleroso e Atrófico", slug: "liquen-escleroso-e-atrofico" },
  { number: 23, title: "Liquen Plano", description: "Liquen Plano", slug: "liquen-plano" },
  { number: 24, title: "Farmacodermias", description: "Farmacodermias", slug: "farmacodermias" },
  { number: 25, title: "Candidíase", description: "Candidíase", slug: "candidiase" },
  { number: 26, title: "Dermatofitoses", description: "Dermatofitoses", slug: "dermatofitoses" },
  { number: 27, title: "Ptiríase versicolor", description: "Ptiríase versicolor", slug: "ptiriase-versicolor" },
  { number: 28, title: "Molusco Contagioso", description: "Molusco Contagioso", slug: "molusco-contagioso" },
  { number: 29, title: "Mpox", description: "Mpox", slug: "mpo" },
  { number: 30, title: "Piodermites (Impetigo, ectima, carbúnculo) e Foliculites", description: "Piodermites (Impetigo, ectima, carbúnculo) e Foliculites", slug: "piodermites-impetigo-ectima-carbunculo-e-foliculites" },
  { number: 31, title: "Gangrena de Fournier", description: "Gangrena de Fournier", slug: "gangrena-de-fournier" },
  { number: 32, title: "Eritrasma", description: "Eritrasma", slug: "eritrasma" },
  { number: 33, title: "Escabiose", description: "Escabiose", slug: "escabiose" },
  { number: 34, title: "Pediculose pubiana (Fitiríase)", description: "Pediculose pubiana (Fitiríase)", slug: "pediculose-pubiana-fitiriase" },
  { number: 35, title: "Abordagem sindrômica das IST", description: "Abordagem sindrômica das IST", slug: "abordagem-sindromica-das-ist" },
  { number: 36, title: "Condiloma acuminado", description: "Condiloma acuminado", slug: "condiloma-acuminado" },
  { number: 37, title: "Herpes Simples", description: "Herpes Simples", slug: "herpes-simples" },
  { number: 38, title: "Sífilis Adquirida", description: "Sífilis Adquirida", slug: "sifilis-adquirida" },
  { number: 39, title: "Cancro mole", description: "Cancro mole", slug: "cancro-mole" },
  { number: 40, title: "Donovanose", description: "Donovanose", slug: "donovanose" },
  { number: 41, title: "Linfogranuloma venéreo", description: "Linfogranuloma venéreo", slug: "linfogranuloma-venereo" },
  { number: 42, title: "Corrimento gonocócico", description: "Corrimento gonocócico", slug: "corrimento-gonococico" },
  { number: 43, title: "Corrimento não gonocócico", description: "Corrimento não gonocócico", slug: "corrimento-nao-gonococico" },
  { number: 44, title: "Doença de Darier", description: "Doença de Darier", slug: "doenca-de-darier" },
  { number: 45, title: "Disqueratose papular acantolítica", description: "Disqueratose papular acantolítica", slug: "disqueratose-papular-acantolitica" },
  { number: 46, title: "Doença de Hailey-Hailey", description: "Doença de Hailey-Hailey", slug: "doenca-de-hailey-hailey" },
  { number: 47, title: "Hidradenite supurativa", description: "Hidradenite supurativa", slug: "hidradenite-supurativa" },
  { number: 48, title: "Pênfigos e penfigóide bolhoso", description: "Pênfigos e penfigóide bolhoso", slug: "penfigos-e-penfigoide-bolhoso" },
  { number: 49, title: "Doença de Behçet", description: "Doença de Behçet", slug: "doenca-de-behcet" },
  { number: 50, title: "Vitiligo", description: "Vitiligo", slug: "vitiligo" },
  { number: 51, title: "Carcinomas (Bowen, Queyrat, Papulose bowenóide, CEC)", description: "Carcinomas (Bowen, Queyrat, Papulose bowenóide, CEC)", slug: "carcinomas-bowen-queyrat-papulose-bowenoide-cec" },
  { number: 52, title: "Melanomas", description: "Melanomas", slug: "melanomas" },
  { number: 53, title: "Sarcomas e Linfomas", description: "Sarcomas e Linfomas", slug: "sarcomas-e-linfomas" },
  { number: 54, title: "Doença de Paget (adenocarcinoma)", description: "Doença de Paget (adenocarcinoma)", slug: "doenca-de-paget-adenocarcinoma" },
  { number: 55, title: "Trauma e doenças artefatas", description: "Trauma e doenças artefatas", slug: "trauma-e-doencas-artefatas" },
  { number: 56, title: "Preenchimentos e procedimentos estéticos", description: "Preenchimentos e procedimentos estéticos", slug: "preenchimentos-e-procedimentos-esteticos" },
  { number: 57, title: "Higiene Genital Masculina: Fundamentos, Práticas e Implicações Clínicas", description: "Higiene Genital Masculina: Fundamentos, Práticas e Implicações Clínicas", slug: "higiene-genital-masculina-fundamentos-praticas-e-implicacoes-clinicas" },
  { number: 58, title: "Linfedema peno-escrotal", description: "Linfedema peno-escrotal", slug: "linfedema-peno-escrotal" }
];

(async () => {
  try {
    await Adm.bulkCreate(adms, { ignoreDuplicates: true });
    console.log('✅ Adms inseridos com sucesso!');
    await User.bulkCreate(users, { ignoreDuplicates: true });
    console.log('✅ Usuários inseridos com sucesso!');
    await Category.bulkCreate(categories, { ignoreDuplicates: true });
    console.log('✅ Categorias inseridos com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao inserir capítulos:', err);
    process.exit(1);
  }
})();