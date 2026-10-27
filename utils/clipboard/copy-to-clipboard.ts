import type { DecodedMailto } from '@/utils/mailto/types';
import { settings } from '@/utils/settings/settings';
import { formatCopiedContent } from './format-copied-content';
import type { CopyToClipboardResult } from './types';
import { writeToClipboard } from './write-to-clipboard';

const copyToClipboard = async (mailto: DecodedMailto): Promise<CopyToClipboardResult> => {
  const { to, cc, bcc } = mailto;
  const hasRecipients = to.length > 0 || cc.length > 0 || bcc.length > 0;
  if (!hasRecipients) return { success: false, reason: 'NO_RECIPIENTS' };

  const mode = await settings.get('copyMode');
  const { content, notCopied } = formatCopiedContent(mailto, mode);

  if (!(await writeToClipboard(content))) return { success: false, reason: 'WRITE_TO_CLIPBOARD_FAILED' };
  return { success: true, notCopied };
};

export default copyToClipboard;
