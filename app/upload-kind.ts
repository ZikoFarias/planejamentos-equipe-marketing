import type {Actor} from './permissions';
import type {ArtworkKind} from './drive-config';
export function uploadArtworkKind(actor:Actor,requested:ArtworkKind='reference'):ArtworkKind{return ['lucio','mateus'].includes(actor.persona)?'reference':['farias','luiz'].includes(actor.persona)?'final':requested;}
