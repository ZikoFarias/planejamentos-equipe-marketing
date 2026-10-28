// Public browser identifiers, restricted to the registered origins in Google Cloud.
// Enable only on the external preview and local development; never on Sites.
export const driveConfig = {
  enabled: typeof window!=='undefined'&&['https://planejamentos-marketing-teste-gratis.marketinglukegroup.workers.dev','http://127.0.0.1:5173','http://localhost:5173'].includes(window.location.origin),
  clientId: '1091183989197-gvdika8rt3352m3icn3uqi7vil7gts57.apps.googleusercontent.com',
  apiKey: 'AIzaSyBvw2xcX0oeSNNlQ2hAxi0Ka3hhxblE-Rw',
  projectNumber: '1091183989197',
  rootFolder: '1inVlh9F3GrVw53R6SUIQA2YcoLZhUJ4k',
};
export type ArtworkKind = 'reference' | 'final';
export const artworkLabels: Record<ArtworkKind,string> = {reference:'Referência',final:'Arte finalizada'};
// Suggested starting location only. The person always chooses the destination.
export const driveFolders: Record<string,Record<ArtworkKind,string>> = {
  'luke group': {reference:'1atMYLs-ZQUdSZFMsTebJ1jYMc2aNxixX',final:'1XaVGtFidlEDXTQQ6KcqmMcH_Vv-4kfZV'},
  fibroplast: {reference:'1pc2mDmoVT6dSHjVFslqTcH4jh3TRfgKB',final:'18nXrBO9e3LnpwuPFkIt1ZXVpr7AUj-8y'},
  'posto-ps': {reference:'1RKpprCmTDj_lWXyiuZN6Qbesye7GbwAe',final:'125muVHZfAal2CY_nqq_STu42fsBMrBst'},
  'posto-rv': {reference:'1QSUg3XP7ZN5dnvSLaFAzPRCM4dicuglm',final:'1t2tBVkKDnqWWiMM7m4xYmfMDWbXaACru'},
  'posto-brr': {reference:'1jzDxzktyg1M8kbvW5am9T0PN41_jE1-y',final:'1ZdQwCKSDRgHNOEe3J4ZxAyPGRIM1cvOv'},
  ervateira: {reference:'1_hfZJt6JZ3o0nXGMK03A7Mk-rX_unbWF',final:'18v4uCv_A1xs2dmfdIyztTDdQzl3n-Qfd'},
  'materiais-ps': {reference:'135Z46LZaYvepM6DWZOQgOncGkoEgGhfp',final:'12oWMTb0Ku5SWNw-DFbGKVQDkKEKK23If'},
  'materiais-smo': {reference:'13qbtiQL32NQTdqTnjdYnZPKuc6rGZ4js',final:'1qlt4k0Dti_Oq29mJujxGvZKBnSjj4fMX'},
  concreto: {reference:'1VgzzvDdKwMLd8qNeH3CHAqqaFLttzdEm',final:'1QunSJ4FIgoOm7psZZV9yEeTeCTCnoKgz'},
};
