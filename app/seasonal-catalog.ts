// Date/title facts from public calendars; movable dates are calculated separately.
export const generalCalendarSource='https://www.sebraego.com.br/calendario-empreendedor/';
export const municipalCalendarSource='https://www.sjp.pr.gov.br/secretarias/secretaria-industria-comercio-e-servicos/datas-comemorativas/';
const calendarText = `
01
01|Confraternização Universal~Dia Mundial da Paz
04|Dia Mundial do Braille
06|Dia de Reis~Dia da Gratidão
07|Dia do Leitor
08|Dia do Fotógrafo
11|Dia Internacional do Obrigado
12|Dia do Empresário Contábil
15|Dia Mundial do Compositor
17|Dia dos Tribunais de Contas do Brasil
20|Dia do Farmacêutico
25|Dia do Carteiro
30|Dia da Saudade
02
01|Dia do Publicitário
03|Dia Estadual da Pamonha Goiana
04|Dia Mundial de Combate ao Câncer~Aniversário do Facebook
06|Dia do Agente de Defesa Ambiental
07|Dia do Profissional Gráfico
10|Dia do Atleta Profissional
11|Dia do Zelador
13|Dia Mundial do Rádio
15|Dia Internacional de Luta contra o Câncer Infantil
16|Dia do Repórter
18|Dia Nacional de Combate ao Alcoolismo
20|Dia Mundial da Justiça Social
22|Dia do Auxiliar de Serviços Gerais
26|Dia do Comediante
03
08|Dia Internacional da Mulher
10|Dia do Telefone
12|Dia do Bibliotecário
14|Dia Nacional dos Animais
15|Dia do Consumidor
21|Dia Internacional contra a Discriminação Racial
22|Dia Mundial da Água
25|Dia Nacional do Oficial de Justiça~Dia da Constituição
27|Dia Mundial do Teatro
28|Dia do Diagramador
31|Dia da Saúde e Nutrição
04
07|Dia do Jornalista~Dia Mundial da Saúde
08|Dia Nacional da Natação
10|Dia da Engenharia
11|Dia do Infectologista
12|Dia do Obstetra
15|Dia da Conservação do Solo
19|Dia dos Povos Indígenas
20|Dia do Diplomata
21|Tiradentes
22|Descobrimento do Brasil~Dia Nacional do Agente de Viagem
24|Dia Internacional do Jovem Trabalhador
25|Dia da Contabilidade
27|Dia da Trabalhadora Doméstica
28|Dia Internacional da Educação
30|Dia Nacional da Mulher
05
03|Dia Mundial da Liberdade de Imprensa
04|Dia de Star Wars
05|Dia da Língua Portuguesa
07|Dia do Oftalmologista
08|Dia do Profissional de Marketing~Dia do Artista Plástico
12|Dia Internacional da Enfermagem
13|Abolição da Escravatura
15|Dia do Assistente Social
16|Dia do Gari
17|Dia Internacional contra a Homofobia
18|Dia Internacional dos Museus
21|Dia da Língua Nacional
22|Dia Internacional da Biodiversidade
25|Dia da Indústria~Dia do Massagista~Dia do Trabalhador Rural
27|Dia do Profissional Liberal
28|Dia Mundial do Hambúrguer
06
01|Dia da Imprensa
05|Dia Mundial do Meio Ambiente
08|Dia Mundial dos Oceanos
09|Dia Mundial da Imunização~Dia do Porteiro
12|Dia dos Namorados
13|Dia do Turista
14|Dia Mundial do Doador de Sangue
18|Dia do Químico
19|Dia do Cinema Brasileiro
20|Dia do Revendedor~Dia do Vigilante
21|Dia da Mídia
24|São João~Dia das Empresas Gráficas
25|Dia do Imigrante
28|Dia Internacional do Orgulho LGBTQIA+
29|Dia do Telefonista~Dia do Pescador
07
02|Dia Nacional do Bombeiro
04|Dia do Operador de Telemarketing
07|Dia Mundial do Chocolate
08|Dia do Panificador
10|Dia da Pizza
12|Dia do Engenheiro Florestal
13|Dia do Cantor~Dia Mundial do Rock
16|Dia do Comerciante
17|Dia da Proteção às Florestas
19|Dia da Caridade
20|Dia do Amigo
22|Dia Internacional do Trabalho Doméstico
25|Dia do Escritor~Dia do Motorista
26|Dia dos Avós~Aniversário da Cidade de Goiás
27|Dia do Motociclista
28|Dia do Agricultor
30|Dia Internacional da Amizade
08
03|Dia do Tintureiro
05|Dia Nacional da Saúde
11|Dia do Advogado~Dia do Garçom
12|Dia Internacional da Juventude~Dia Nacional das Artes
13|Dia do Economista
14|Dia do Cardiologista
15|Dia da Informática
17|Dia do Patrimônio Histórico Nacional
18|Dia do Estagiário
19|Dia Mundial da Fotografia~Dia Nacional do Ciclista~Dia Nacional do Historiador
21|Dia Nacional da Habitação
24|Dia dos Artistas
25|Dia do Feirante~Dia do Soldado
26|Dia Internacional da Igualdade da Mulher~Dia dos Bancários
27|Dia do Corretor de Imóveis~Dia do Psicólogo
29|Dia Nacional de Combate ao Fumo
30|Dia do Vendedor Lojista
31|Dia do Nutricionista
09
01|Início da Semana da Pátria~Dia do Profissional de Educação Física
02|Dia do Repórter Fotográfico
03|Dia do Biólogo
05|Dia da Amazônia~Dia Oficial da Farmácia~Dia Internacional da Caridade
07|Independência do Brasil
09|Dia do Médico Veterinário~Dia do Cachorro-quente~Dia do Administrador
15|Dia do Cliente
18|Dia dos Símbolos Nacionais
19|Dia do Ortopedista~Dia Nacional do Teatro
21|Dia da Árvore~Dia do Fazendeiro
22|Dia do Contador
23|Dia do Sorvete~Dia do Técnico em Edificações~Dia do Soldador
24|Dia do Mototaxista
25|Dia Nacional do Trânsito~Dia Nacional do Rádio
27|Dia Mundial do Turismo~Dia do Encanador
29|Dia do Anunciante~Dia Mundial do Petróleo
30|Dia Mundial do Tradutor~Dia da Secretária~Dia Nacional do Jornaleiro
10
01|Dia do Vendedor~Dia Internacional da Pessoa Idosa
02|Dia Internacional da Não Violência
03|Dia Mundial do Dentista~Dia do Profissional de Organização
04|Dia da Natureza~Dia do Barman~Dia Mundial dos Animais
05|Dia do Pequeno Negócio~Dia do Tecnólogo
07|Dia do Compositor
09|Dia do Açougueiro~Dia do Atletismo
11|Dia Nacional da Pessoa com Deficiência Física
12|Dia das Crianças~Nossa Senhora Aparecida
13|Dia do Fisioterapeuta
14|Dia Nacional da Pecuária
15|Dia do Professor
16|Dia do Anestesiologista~Dia da Ciência e Tecnologia~Dia Mundial da Alimentação
17|Dia do Eletricista~Dia do Profissional da Propaganda
18|Dia do Médico~Dia do Pintor~Dia do Estivador
19|Dia do Profissional de Informática~Dia Nacional da Inovação
20|Dia Internacional do Controlador de Tráfego Aéreo
22|Dia do Paraquedista
23|Dia da Força Aérea Brasileira~Dia do Aviador
24|Aniversário de Goiânia
30|Dia do Balconista~Dia do Comerciário
31|Halloween
11
04|Dia do Inventor
05|Dia da Ciência e Cultura
06|Dia Nacional do Riso
07|Dia do Radialista
08|Dia do Radiologista~Dia Mundial do Urbanismo
09|Dia do Hoteleiro
10|Dia do Trigo
12|Dia do Supermercado
13|Dia Mundial da Gentileza
14|Dia Nacional da Alfabetização
15|Proclamação da República
17|Dia da Criatividade
19|Dia da Bandeira
20|Dia do Biomédico~Dia da Consciência Negra
21|Dia Mundial da Televisão
22|Dia do Músico
23|Dia do Engenheiro Eletricista
25|Dia Nacional do Doador de Sangue
27|Dia do Técnico de Segurança do Trabalho
30|Dia do Síndico
12
01|Dia Mundial de Luta contra a Aids
02|Dia da Astronomia~Dia Nacional do Samba~Dia Nacional das Relações Públicas
03|Dia Internacional das Pessoas com Deficiência
04|Dia do Orientador Educacional~Dia da Propaganda
08|Dia Nacional da Família~Dia da Justiça
09|Dia do Fonoaudiólogo
10|Dia do Sociólogo
11|Dia do Engenheiro
13|Dia do Ótico
14|Dia Nacional do Ministério Público
15|Dia do Arquiteto~Dia do Jardineiro
20|Dia do Mecânico
21|Dia do Atleta
23|Dia do Vizinho
25|Natal
31|Réveillon
`;
const extraText = `
01
20|Dia Nacional do Fusca
24|Dia Nacional do Aposentado
28|Dia do Comércio Exterior
31|Dia Mundial do Mágico
02
21|Dia Internacional do Guia de Turismo
03
02|Dia da Educação e da Cultura
19|Dia do Artesão~Dia do Carpinteiro
21|Dia Mundial da Infância
26|Dia do Cacau~Dia do Mercosul
04
01|Dia da Mentira
13|Dia do Hino Nacional Brasileiro
21|Dia da Latinidade
22|Dia da Comunidade Luso-Brasileira
23|Dia Mundial do Escoteiro
05
01|Dia da Literatura Brasileira
03|Dia do Sertanejo~Dia do Sol~Dia do Parlamento
08|Dia da Cruz Vermelha Internacional
10|Dia Nacional do Guia de Turismo~Dia do Campo
13|Dia do Automóvel~Dia da Estrada de Rodagem
17|Dia Internacional das Telecomunicações
22|Dia do Apicultor
28|Dia do Ceramista
30|Dia da Decoração
06
02|Dia da Comunidade Italiana
06|Dia do Fazendeiro
12|Dia do Correio Aéreo Nacional
18|Dia do Imigrante Japonês
21|Dia do Mel
22|Dia do Orquidófilo
23|Dia do Migrante
24|Dia do Caboclo
26|Dia Internacional de Combate às Drogas
29|Dia do Tenista
07
09|Dia da Juventude
14|Dia Universal da Liberdade
23|Dia do Guarda Rodoviário
25|Dia do Colono
27|Dia Nacional de Prevenção de Acidentes de Trabalho
08
01|Dia Nacional do Selo
04|Dia do Padre
11|Dia Nacional do Estudante
18|Dia do Artista de Teatro
22|Dia do Folclore
27|Dia do Peão de Boiadeiro
09
02|Dia do Florista
06|Dia do Alfaiate~Dia do Cabeleireiro
08|Dia Internacional da Alfabetização
10|Dia da Seresta
12|Dia Nacional da Recreação
14|Dia do Frevo
16|Dia Internacional de Preservação da Camada de Ozônio
20|Dia do Gaúcho
22|Dia da Banana
10
05|Dia da Ave
08|Dia do Nordestino
12|Dia das Américas~Dia do Basquete
24|Dia Mundial do Desenvolvimento
27|Dia Mundial de Oração pela Paz
28|Dia do Servidor Público
29|Dia Nacional do Livro
11
10|Dia da Indústria Automobilística
17|Dia Internacional do Estudante
19|Dia Internacional do Xadrez
21|Dia da Homeopatia
28|Dia do Soldado Desconhecido
30|Dia do Estatuto da Terra~Dia do Taxista
12
02|Dia do Casal
10|Dia dos Direitos Humanos
11|Dia do Tango
19|Emancipação Política do Paraná
28|Dia do Salva-Vidas
31|Dia da Esperança
`;
function parse(text:string,source:string):[string,string,string][]{let month='';const entries:[string,string,string][]=[];for(const line of text.trim().split('\n')){if(/^\d{2}$/.test(line)){month=line;continue}const [day,titles]=line.split('|');for(const title of titles.split('~'))entries.push([month+'-'+day,title,source])}return entries}
export const generalSeasonalCatalog=parse(calendarText,generalCalendarSource);
export const additionalSeasonalCatalog=parse(extraText,municipalCalendarSource);
export function seasonalCategory(title:string){if(/aniversário|estadual|paraná|cidade de goiás|goiânia/i.test(title))return 'Regional';if(/black friday|cyber monday|cliente|consumidor|namorados|mães|pais|natal|réveillon|ano novo/i.test(title))return 'Comercial e relacionamento';if(/profissional|trabalhador|engenheir|médico|artesan|carpinteiro|mecânico|pedreiro|vendedor|balconista|comerciário|bibliotecário|jornalista|advogado|contador|arquiteto|nutricionista|farmacêutico|pintor|eletricista/i.test(title))return 'Profissões';return 'Cultura, sociedade e conscientização'}
