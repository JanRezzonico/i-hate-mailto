import type { DecodedLink } from '@/utils/links/types';
import { formatCopiedContent } from './format-copied-content';
import type { CopyMode, CopyToClipboardResult } from './types';
import { writeToClipboard } from './write-to-clipboard';

const copyToClipboard = async (link: DecodedLink, mode: CopyMode): Promise<CopyToClipboardResult> => {
  const { to, cc, bcc } = link;
  const hasRecipients = to.length > 0 || cc.length > 0 || bcc.length > 0;
  if (!hasRecipients) return { success: false, reason: 'NO_RECIPIENTS' };

  const { content, notCopied } = formatCopiedContent(link, mode);

  if (!(await writeToClipboard(content))) return { success: false, reason: 'WRITE_TO_CLIPBOARD_FAILED' };
  return { success: true, notCopied };
};

export default copyToClipboard;
