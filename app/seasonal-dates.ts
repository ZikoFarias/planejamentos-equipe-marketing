import {companies,companyById} from './workflow';
import {blank} from './model';
import {withParticipants} from './participants';
import {assignStatusOwner} from './permissions';
import {validDate} from './weekly-plan';
export type SeasonalDate={id:string,title:string,date:string,companies:string[],context:string,source:string};
const all=companies.map(c=>c.id),construction=['materiais-ps','materiais-smo','concreto'],roads=['fibroplast','posto-ps','posto-rv','posto-brr'],mate=['ervateira'];
const calendar='https://www.sebraego.com.br/calendario-empreendedor/';
const industry='https://goias.gov.br/industriaecomercio/calendario-de-datas-comemorativas/';
type Entry=[string,string,string[],string,string?];
const fixed:Entry[]=[
 ['01-01','Ano Novo',all,'Mensagem institucional e planejamento do novo ano.'],
 ['03-08','Dia Internacional da Mulher',all,'Valorização das mulheres da equipe e da comunidade.'],
 ['03-15','Dia do Consumidor',all,'Relacionamento, atendimento e campanhas comerciais.',industry],
 ['03-22','Dia Mundial da Água',[...construction,...mate],'Uso responsável da água e sustentabilidade.','https://www.gov.br/mma/pt-br/canais_atendimento/atendimento-a-imprensa/datas-comemorativas/datas-comemorativas'],
 ['04-21','Tiradentes',all,'Comunicar horários e serviços no feriado.'],
 ['04-24','Dia do Chimarrão',mate,'Cultura do chimarrão; data estadual do Rio Grande do Sul.','https://www.gov.br/turismo/pt-br/assuntos/ultimas-noticia/chimarrao-e-celebrado-como-simbolo-da-cultura-gaucha/'],
 ['05-01','Dia do Trabalhador',all,'Homenagem às equipes e aos profissionais parceiros.'],
 ['05-25','Dia da Indústria',['fibroplast','ervateira','concreto','luke group'],'Produção, qualidade e contribuição da indústria.',industry],
 ['05-25','Dia do Trabalhador Rural',mate,'Valorizar produtores e o trabalho no campo.','https://goias.gov.br/agricultura/datas-comemorativas-do-setor-agropecuario/'],
 ['06-05','Dia Mundial do Meio Ambiente',all,'Sustentabilidade e práticas ambientais das empresas.','https://www.gov.br/mma/pt-br/canais_atendimento/atendimento-a-imprensa/datas-comemorativas/datas-comemorativas'],
 ['06-12','Dia dos Namorados',['posto-ps','posto-rv','posto-brr','ervateira','materiais-ps','materiais-smo'],'Campanhas de relacionamento e presentes.'],
 ['06-24','São João',['posto-ps','posto-rv','posto-brr','ervateira','luke group'],'Cultura e ações de festas juninas.'],
 ['06-30','Dia do Caminhoneiro · tradição de 30 de junho',roads,'Homenagem tradicional; distinguir do Dia Nacional em setembro.','https://www.gov.br/transportes/pt-br/assuntos/conteudo/caminhoneiros'],
 ['07-16','Dia do Comerciante',['posto-ps','posto-rv','posto-brr','materiais-ps','materiais-smo','luke group'],'Valorizar o comércio local e seus profissionais.'],
 ['07-20','Dia do Amigo',all,'Comunidade, parceria e proximidade com os clientes.'],
 ['07-25','Dia do Motorista',roads,'Segurança, respeito e valorização de quem vive na estrada.','https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10002023.pdf'],
 ['07-26','Dia dos Avós',all,'Família e relacionamento com a comunidade.'],
 ['07-27','Dia do Motociclista',['posto-ps','posto-rv','posto-brr'],'Segurança e cuidados nas viagens de moto.'],
 ['07-28','Dia do Agricultor',mate,'Origem da erva-mate e valorização de produtores.'],
 ['07-30','Dia Internacional da Amizade',all,'Relacionamento com clientes, parceiros e equipes.'],
 ['09-07','Independência do Brasil',all,'Mensagem institucional e horários do feriado.'],
 ['09-15','Dia do Cliente',all,'Agradecimento e relacionamento com clientes.'],
 ['09-16','Dia Nacional do Caminhoneiro',roads,'Homenagem nacional aos profissionais do transporte.','https://www.gov.br/transportes/pt-br/assuntos/conteudo/caminhoneiros'],
 ['09-22','Dia Mundial sem Carro',['posto-ps','posto-rv','posto-brr','luke group'],'Mobilidade e uso consciente dos meios de transporte.','https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10002023.pdf'],
 ['09-25','Dia Nacional do Trânsito',roads,'Educação, responsabilidade e segurança viária.','https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10002023.pdf'],
 ['10-12','Dia das Crianças',all,'Família, comunidade e ações para as crianças.'],
 ['10-12','Nossa Senhora Aparecida',all,'Comunicar horários e serviços no feriado.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['10-25','Dia do Engenheiro Civil',construction,'Valorizar os profissionais parceiros da construção.','https://www.confea.org.br/midias/anexo_0053.pdf'],
 ['10-26','Dia do Trabalhador da Construção Civil',construction,'Homenagem a quem constrói e transforma projetos.','https://www.agenciapara.com.br/noticia/23017/trabalhadores-da-construcao-civil-garantem-desenvolvimento-e-qualidade-de-vida-para-a-populacao'],
 ['11-02','Finados',all,'Comunicação respeitosa e horários de atendimento.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['11-05','Dia do Designer Gráfico',['luke group','fibroplast'],'Valorizar a equipe de criação.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['11-15','Proclamação da República',all,'Mensagem institucional e horários do feriado.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['11-19','Dia do Empreendedorismo Feminino',all,'Valorizar mulheres empreendedoras e parceiras.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['11-20','Dia da Consciência Negra',all,'Respeito, diversidade e valorização das pessoas.','https://www.turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas'],
 ['12-11','Dia do Engenheiro',construction,'Engenharia, qualidade e segurança nas obras.','https://ufg.br/n/60676-dezembro?locale=pt_BR'],
 ['12-13','Dia do Pedreiro',construction,'Homenagem aos profissionais parceiros das obras.','https://camararussas.ce.gov.br/detalhe-noticia/196'],
 ['12-20','Dia do Mecânico',roads,'Valorizar manutenção e segurança dos veículos.','https://ufg.br/n/60676-dezembro?locale=pt_BR'],
 ['12-25','Natal',all,'Mensagem institucional e relacionamento com a comunidade.'],
 ['12-31','Réveillon',all,'Mensagem de fim de ano e horários especiais.'],
];
const iso=(date:Date)=>date.toISOString().slice(0,10);
const sunday=(year:number,month:number)=>{const first=new Date(Date.UTC(year,month-1,1));return new Date(Date.UTC(year,month-1,1+(7-first.getUTCDay())%7+7))};
function easter(year:number){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return new Date(Date.UTC(year,month-1,day))}
export function seasonalDates(day:string,company=''):SeasonalDate[]{
 if(!validDate(day))return [];const year=Number(day.slice(0,4));if(year<1900||year>2199)return [];
 const entries:SeasonalDate[]=fixed.filter(([date])=>date===day.slice(5)).map(([date,title,companies,context,source],i)=>({id:date+'-'+i,title,date:day,companies,context,source:source||calendar}));
 const movable=(id:string,title:string,date:Date,context:string,source=calendar)=>{if(iso(date)===day)entries.push({id,title,date:day,companies:all,context,source})};
 movable('maes','Dia das Mães',sunday(year,5),'Família, homenagem e campanhas de relacionamento.');
 movable('pais','Dia dos Pais',sunday(year,8),'Família, homenagem e campanhas de relacionamento.');
 const pascoa=easter(year);movable('pascoa','Páscoa',pascoa,'Mensagem de Páscoa e relacionamento com a comunidade.');
 const carnaval=new Date(pascoa);carnaval.setUTCDate(carnaval.getUTCDate()-47);movable('carnaval','Carnaval',carnaval,'Horários de funcionamento e segurança nas viagens.');
 const santa=new Date(pascoa);santa.setUTCDate(santa.getUTCDate()-2);movable('paixao','Sexta-feira Santa',santa,'Comunicação de horários durante a Semana Santa.');
 const first=new Date(Date.UTC(year,10,1)),friday=new Date(Date.UTC(year,10,1+(4-first.getUTCDay()+7)%7+22));movable('black-friday','Black Friday',friday,'Campanhas comerciais e ofertas reais planejadas.','https://agenciasebrae.com.br/cultura-empreendedora/black-friday-6-dicas-para-aumentar-as-vendas-na-data-queridinha-do-consumidor/');
 return entries.filter(entry=>!company||entry.companies.includes(company)).sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
}
export function seasonalTask(event:SeasonalDate,company:string,designer:'luiz'|'farias'){
 if(!validDate(event.date))throw Error('Data sazonal inválida.');if(company&&(!companyById(company)||!event.companies.includes(company)))throw Error('Escolha uma empresa indicada para esta data.');
 const owner=company?(company.startsWith('posto-')||company==='ervateira'?'luiz':'farias'):designer;
 return withParticipants(assignStatusOwner({...blank('a fazer '+owner),title:event.title,start:event.date,due:event.date,tags:company?[company]:[],description:event.context+'\nFonte: '+event.source}));
}
