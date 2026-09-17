import { LanguageCode, TranslationKeys } from '../types';
import { en } from './en';
import { hi } from './hi';
import { bn } from './bn';
import { ta } from './ta';
import { te } from './te';
import { kn } from './kn';
import { ml } from './ml';
import { mr } from './mr';
import { gu } from './gu';
import { pa } from './pa';
import { or } from './or';
import { as } from './as';
import { ur } from './ur';
import { ne, sa, kok, mai, doi, brx, mni, sat, ks, sd } from './placeholders';

export const translations: Record<LanguageCode, Partial<TranslationKeys>> = {
  en,
  hi,
  bn,
  ta,
  te,
  kn,
  ml,
  mr,
  gu,
  pa,
  or,
  as,
  ur,
  ne,
  sa,
  kok,
  mai,
  doi,
  brx,
  mni,
  sat,
  ks,
  sd,
};
