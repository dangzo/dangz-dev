import { codeGroupType, codeVariantType } from './codeGroupType';
import { legacyPostBodyType } from './legacyPostBodyType';
import { postType } from './postType';
import { postReactionCountType } from './postReactionCountType';
import { reactionType } from './reactionType';
import { tagType } from './tagType';
import { topicType } from './topicType';

export const schemaTypes = [postType, codeGroupType, codeVariantType, legacyPostBodyType, topicType, reactionType, tagType, postReactionCountType];
