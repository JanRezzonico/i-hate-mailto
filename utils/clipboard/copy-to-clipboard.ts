import type { DecodedMailto } from '@/utils/mailto/types';
import { settings } from '@/utils/settings/settings';
import { formatCopiedContent } from './format-copied-content';
import type { CopyToClipboardResult } from './types';
import { writeToClipboard } from './write-to-clipboard';

const copyToClipboard = async (mailto: DecodedMailto): Promise<CopyToClipboardResult> => {
  const mode = await settings.get('copyMode');
  const { content, notCopied } = formatCopiedContent(mailto, mode);

  if (!(await writeToClipboard(content))) return { success: false };
  return { success: true, notCopied };
};

export default copyToClipboard;
