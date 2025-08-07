import { visit } from "unist-util-visit";
import type { Node } from "unist";
import type { Image, Html } from "mdast";
import {
  processAttributesAndConfig,
  type EnhancedImageConfig,
} from "./utils.js";

/**
 * Regular expression for matching script tag opening
 * Matches: <script> or <script type="module"> etc.
 */
const RE_SCRIPT_START =
  /<script(?:\s+?[a-zA-z]+(=(?:["']){0,1}[a-zA-Z0-9]+(?:["']){0,1}){0,1})*\s*?>/;

/**
 * Enhanced image plugin for MDSvex
 * Transforms relative image references to enhanced:img components with import statements
 *
 * @param config - Configuration object with attributes and imagetools directives
 * @returns Transformer function for the AST
 */
export default function enhancedImage(
  config: EnhancedImageConfig = {},
): (tree: Node) => void {
  return function transformer(tree: Node): void {
    let scripts = "";

    // Process all image nodes and transform relative URLs
    visit(tree, "image", (node: Image) => {
      if (!node.url.startsWith(".")) {
        return; // Skip non-relative URLs
      }

      // Process attributes and configuration
      const {
        combinedClassesAttrStr,
        combinedAttributesStr,
        combinedDirectivesUrlParams,
      } = processAttributesAndConfig(node.url, config);

      // Clean query parameters from URL (already processed above)
      node.url = node.url.split("?")[0] ?? node.url;

      // Generate unique import identifier
      const importName = `_img${Math.random().toString(36).substring(2, 11)}`;

      // Create import statement for enhanced image
      const importStatement = `import ${importName} from '${decodeURIComponent(
        node.url,
      )}?enhanced${combinedDirectivesUrlParams}';\n`;
      scripts += importStatement;

      // Generate enhanced:img component
      const imageComponent = `<enhanced:img src={${importName}} alt="${
        node.alt ?? ""
      }" ${combinedClassesAttrStr} ${combinedAttributesStr}></enhanced:img>`;

      // Transform node to HTML
      (node as any).type = "html";
      (node as any).value = imageComponent;
    });

    // Inject scripts into existing script tag or create new one
    let scriptFound = false;
    visit(tree, "html", (node: Html) => {
      if (RE_SCRIPT_START.test(node.value)) {
        scriptFound = true;
        node.value = node.value.replace(RE_SCRIPT_START, (script: string) => {
          return `${script}\n${scripts}`;
        });
      }
    });

    // Add script tag if none exists
    if (!scriptFound && scripts) {
      (tree as any).children.push({
        type: "html",
        value: `<script>\n${scripts}</script>`,
      } as Html);
    }
  };
}
