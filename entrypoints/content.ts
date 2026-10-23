import copyToClipboard from "@/utils/copy-to-clipboard";
import parseMailto from "@/utils/parse-mailto";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",

  main() {
    document.addEventListener(
      "click",
      async (e) => {
        const target = e.target as Element | null;
        const mailtoLink = target?.closest<HTMLAnchorElement>(
          'a[href^="mailto:" i]',
        );
        if (!mailtoLink) return; // Not a mailto link, ignore

        e.preventDefault();
        e.stopImmediatePropagation();

        const hrefValue = mailtoLink.getAttribute("href") ?? "";
        const address = parseMailto(hrefValue);
        if (!address) return; // Invalid mailto link, ignore

        const copySuccess = await copyToClipboard(address);
        if (copySuccess) {
          showToast(`Copied "${address}" to clipboard`, "success");
        } else {
          showToast(`Failed to copy "${address}" to clipboard`, "error", 5000);
        }
      },
      true, // Use capture phase to intercept before the page's own handlers
    );
  },
});
