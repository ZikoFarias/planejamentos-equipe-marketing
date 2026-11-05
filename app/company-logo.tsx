// Original vector paths extracted from the supplied company-logo PDF.
const marks:Record<string,{file:string,name:string,width:number,height:number}>={
  "fibroplast": {
    "file": "fibroplast",
    "name": "Fibroplast",
    "width": 524.6321014404298,
    "height": 72.09900131225587
  },
  "postos": {
    "file": "postos",
    "name": "Brasil Postos",
    "width": 352.33180847167966,
    "height": 73.40500488281248
  },
  "materiais": {
    "file": "materiais",
    "name": "Materiais de Construção",
    "width": 415.2220062255859,
    "height": 84.95999755859373
  },
  "luke group": {
    "file": "group",
    "name": "Luke Group",
    "width": 329.402197265625,
    "height": 89.46896972656259
  },
  "concreto": {
    "file": "concreto",
    "name": "Luke Concreto",
    "width": 391.8515228271484,
    "height": 64.15698852539066
  },
  "ervateira": {
    "file": "ervateira",
    "name": "Luke Ervateira",
    "width": 391.87677612304685,
    "height": 91.49799194335935
  }
};
export function CompanyLogo({company,className='',padding=0}:{company:string,className?:string,padding?:number}){
 const family=company.startsWith('posto')?'postos':company.startsWith('materiais')?'materiais':company;
 const mark=marks[family];
 if(!mark)return null;
 const inset=padding*mark.width/1440;
 const viewBox=[-inset,-inset,mark.width+inset*2,mark.height+inset*2].join(' ');
 return <svg className={'company-logo '+className} viewBox={viewBox} role="img" aria-label={'Logo '+mark.name}><image href={'/brands/'+mark.file+'.svg'} width={mark.width} height={mark.height}/></svg>;
}
