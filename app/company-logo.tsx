// Render the original PNGs through a viewBox, keeping the supplied marks intact.
const marks:Record<string,{file:string,viewBox:string,name:string}>={
 fibroplast:{file:'fibroplast',viewBox:'55 457 1330 180',name:'Fibroplast'},
 postos:{file:'postos',viewBox:'51 413 1338 275',name:'Brasil Postos'},
 materiais:{file:'materiais',viewBox:'63 419 1314 267',name:'Materiais de Construção'},
 'luke group':{file:'group',viewBox:'37 357 1367 368',name:'Luke Group'},
 concreto:{file:'concreto',viewBox:'102 457 1236 199',name:'Luke Concreto'},
 ervateira:{file:'ervateira',viewBox:'42 392 1356 314',name:'Luke Ervateira'},
};
export function CompanyLogo({company,className=''}:{company:string,className?:string}){
 const family=company.startsWith('posto')?'postos':company.startsWith('materiais')?'materiais':company;
 const mark=marks[family];if(!mark)return null;
 return <svg className={'company-logo '+className} viewBox={mark.viewBox} role="img" aria-label={'Logo '+mark.name}><image href={'/brands/'+mark.file+'.png'} width="1440" height="1080"/></svg>
}
