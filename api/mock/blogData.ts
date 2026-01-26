import { BlogPost } from '../../domain/types';

// Original Posts
import { trends2025 } from '../../content/posts/trends2025';
import { secretSanta } from '../../content/posts/secretSanta';
import { eco } from '../../content/posts/eco';

// Detailed Psychology & Etiquette Series
import { powerDynamics } from '../../content/posts/powerDynamics';
import { badVsNone } from '../../content/posts/badVsNone';
import { honestIgnorance } from '../../content/posts/honestIgnorance';
import { brokenExpectations } from '../../content/posts/brokenExpectations';
import { surpriseMyth } from '../../content/posts/surpriseMyth';
import { dislikedGift } from '../../content/posts/dislikedGift';
import { priceValue } from '../../content/posts/priceValue';
import { attentionTest } from '../../content/posts/attentionTest';
import { universalMyth } from '../../content/posts/universalMyth';
import { giftEQ } from '../../content/posts/giftEQ';
import { betterNothing } from '../../content/posts/betterNothing';

// Batch 2
import { hatedGifts } from '../../content/posts/hatedGifts';
import { cliches } from '../../content/posts/cliches';
import { thoughtlessGifts } from '../../content/posts/thoughtlessGifts';
import { mugMistake } from '../../content/posts/mugMistake';
import { forbiddenGifts } from '../../content/posts/forbiddenGifts';

// Batch 3
import { guiltTop7 } from '../../content/posts/guiltTop7';
import { ruinRelationships } from '../../content/posts/ruinRelationships';
import { certificateTruth } from '../../content/posts/certificateTruth';
import { lastMinuteScream } from '../../content/posts/lastMinuteScream';
import { goodIntentionsBad } from '../../content/posts/goodIntentionsBad';

// Batch 4
import { strangeGifts } from '../../content/posts/strangeGifts';
import { expensiveCheap } from '../../content/posts/expensiveCheap';
import { repetitiveGifts } from '../../content/posts/repetitiveGifts';
import { awkwardGifts } from '../../content/posts/awkwardGifts';
import { worstNewYear } from '../../content/posts/worstNewYear';

// Batch 5
import { worstBirthday } from '../../content/posts/worstBirthday';
import { worstRelationship } from '../../content/posts/worstRelationship';
import { worstCorporate } from '../../content/posts/worstCorporate';
import { funnyGiftsFail } from '../../content/posts/funnyGiftsFail';
import { unusedGifts } from '../../content/posts/unusedGifts';

// Batch 6
import { hasEverything } from '../../content/posts/hasEverything';
import { hardlyKnow } from '../../content/posts/hardlyKnow';
import { wantsNothing } from '../../content/posts/wantsNothing';
import { colleagueGift } from '../../content/posts/colleagueGift';
import { bossGift } from '../../content/posts/bossGift';

// Batch 7
import { introvertGifts } from '../../content/posts/introvertGifts';
import { cozyGifts } from '../../content/posts/cozyGifts';
import { aestheticGifts } from '../../content/posts/aestheticGifts';
import { minimalistGifts } from '../../content/posts/minimalistGifts';
import { hateGifts } from '../../content/posts/hateGifts';

// Batch 8
import { budgetLimited } from '../../content/posts/budgetLimited';
import { under2000 } from '../../content/posts/under2000';
import { lastMinuteChoice } from '../../content/posts/lastMinuteChoice';
import { longDistance } from '../../content/posts/longDistance';
import { differentCity } from '../../content/posts/differentCity';

// Batch 9
import { almostEveryone } from '../../content/posts/almostEveryone';
import { fearOfMistake } from '../../content/posts/fearOfMistake';
import { riskFree } from '../../content/posts/riskFree';
import { noHints } from '../../content/posts/noHints';
import { withHints } from '../../content/posts/withHints';

// Batch 10 (New Year Psychology)
import { nyComplexity } from '../../content/posts/nyComplexity';
import { nyAnxiety } from '../../content/posts/nyAnxiety';
import { nyBanality } from '../../content/posts/nyBanality';
import { nyCandles } from '../../content/posts/nyCandles';
import { nyDisappointment } from '../../content/posts/nyDisappointment';


// Re-export types so we don't break existing imports in components
export type { BlogPost, BlogContentBlock } from '../../domain/types';

export const BLOG_POSTS: BlogPost[] = [
  // Featured / Trends
  trends2025,
  
  // New Hated/Mistakes Series (High engagement topics)
  nyComplexity,
  nyAnxiety,
  nyBanality,
  nyCandles,
  nyDisappointment,
  
  almostEveryone,
  fearOfMistake,
  riskFree,
  noHints,
  withHints,
  
  budgetLimited,
  under2000,
  lastMinuteChoice,
  longDistance,
  differentCity,
  
  introvertGifts,
  cozyGifts,
  aestheticGifts,
  minimalistGifts,
  hateGifts,
  
  hasEverything,
  hardlyKnow,
  wantsNothing,
  colleagueGift,
  bossGift,
  
  worstBirthday,
  worstRelationship,
  worstCorporate,
  funnyGiftsFail,
  unusedGifts,
  
  strangeGifts,
  worstNewYear,
  awkwardGifts,
  expensiveCheap,
  repetitiveGifts,
  
  guiltTop7,
  ruinRelationships,
  lastMinuteScream,
  hatedGifts,
  cliches,
  mugMistake,
  forbiddenGifts,
  thoughtlessGifts,
  certificateTruth,
  goodIntentionsBad,

  // Psychology Series (Ordered logically)
  powerDynamics,
  badVsNone,
  honestIgnorance,
  brokenExpectations,
  surpriseMyth,
  dislikedGift,
  priceValue,
  attentionTest,
  universalMyth,
  giftEQ,
  betterNothing,

  // Other
  secretSanta,
  eco
];

export const getBlogPost = (id: string) => BLOG_POSTS.find(p => p.id === id);