const MAX_VALUE_LENGTH = 80;

const truncate = (text: string): string => {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine.length > MAX_VALUE_LENGTH ? `${singleLine.slice(0, MAX_VALUE_LENGTH)}…` : singleLine;
};

export const formatNotCopied = (n: NotCopiedInfo): string => {
  const lines: string[] = [];
  if (n.to) lines.push(`${i18n.t('fieldTo')}: ${n.to.join(', ')}`);
  if (n.cc) lines.push(`${i18n.t('fieldCc')}: ${n.cc.join(', ')}`);
  if (n.bcc) lines.push(`${i18n.t('fieldBcc')}: ${n.bcc.join(', ')}`);
  if (n.subject) lines.push(`${i18n.t('fieldSubject')}: ${truncate(n.subject)}`);
  if (n.headers) {
    for (const [name, value] of Object.entries(n.headers)) {
      lines.push(`${name}: ${truncate(value)}`);
    }
  }
  if (n.body) lines.push(`${i18n.t('fieldBody')}: ${truncate(n.body)}`);
  return lines.join('\n');
};
