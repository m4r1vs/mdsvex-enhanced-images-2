import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import enhancedImage from "../src/index.js";
import { type EnhancedImageConfig } from "../src/utils.js";

// Mock unist-util-visit
vi.mock("unist-util-visit", () => ({
  visit: vi.fn(),
}));

import { visit } from "unist-util-visit";
const mockVisit = vi.mocked(visit);

// Test data types
interface TestImageNode {
  type: "image";
  url: string;
  alt?: string | null;
}

interface TestHtmlNode {
  type: "html";
  value: string;
}

interface TestTree {
  type: string;
  children: any[];
}

type VisitorFunction = (node: any) => void;

// Helper function to setup mock visit implementation
function setupMockVisit(
  imageHandler?: (node: TestImageNode) => void,
  htmlHandler?: (node: TestHtmlNode) => void,
) {
  (mockVisit.mockImplementation as any)(
    (tree: any, nodeType: string, visitor: VisitorFunction) => {
      if (nodeType === "image" && imageHandler) {
        imageHandler = imageHandler;
      } else if (nodeType === "html" && htmlHandler) {
        htmlHandler = htmlHandler;
      }
    },
  );
}

describe("enhancedImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a transformer function", () => {
    const plugin = enhancedImage();
    expect(typeof plugin).toBe("function");
  });

  it("should process relative image URLs and transform them to enhanced:img components", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    plugin(tree);

    expect(mockVisit).toHaveBeenCalledTimes(2);
    expect(mockVisit).toHaveBeenNthCalledWith(
      1,
      tree,
      "image",
      expect.any(Function),
    );
    expect(mockVisit).toHaveBeenNthCalledWith(
      2,
      tree,
      "html",
      expect.any(Function),
    );
  });

  it("should transform image nodes with relative URLs", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg?class=my-class&fetchpriority=high&blur=5",
            alt: "Test Image",
          };
          visitor(imageNode);

          // Verify node transformation
          expect((imageNode as any).type).toBe("html");
          expect(imageNode.url).toBe("./test-image.jpg");
          expect((imageNode as any).value).toContain("<enhanced:img");
          expect((imageNode as any).value).toContain('alt="Test Image"');
          expect((imageNode as any).value).toContain('class="my-class"');
          expect((imageNode as any).value).toContain('fetchpriority="high"');
          expect((imageNode as any).value).toMatch(/src=\{_img\w+\}/);
        }
      },
    );

    plugin(tree);
  });

  it("should not process absolute URLs", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "https://example.com/image.jpg",
            alt: "External Image",
          };
          const originalNode = { ...imageNode };
          visitor(imageNode);

          // Node should remain unchanged
          expect(imageNode).toEqual(originalNode);
        }
      },
    );

    plugin(tree);
  });

  it("should handle missing alt text", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg",
            alt: null,
          };
          visitor(imageNode);

          expect((imageNode as any).value).toContain('alt=""');
        }
      },
    );

    plugin(tree);
  });

  it("should inject scripts into existing script tags", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };
    let scriptInjected = false;

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg",
            alt: "Test",
          };
          visitor(imageNode);
        } else if (nodeType === "html") {
          const scriptNode: TestHtmlNode = {
            type: "html",
            value: "<script>\nconsole.log('existing');\n</script>",
          };
          visitor(scriptNode);
          scriptInjected = true;

          // Check that import was injected
          expect(scriptNode.value).toMatch(
            /import _img\w+ from '\.\/test-image\.jpg\?enhanced'/,
          );
          expect(scriptNode.value).toContain("console.log('existing');");
        }
      },
    );

    plugin(tree);
    expect(scriptInjected).toBe(true);
  });

  it("should add script tag when no existing script is found", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg",
            alt: "Test",
          };
          visitor(imageNode);
        }
        // No HTML nodes visited (no existing script)
      },
    );

    plugin(tree);

    // Should add script to tree children
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].type).toBe("html");
    expect((tree.children[0] as TestHtmlNode).value).toContain("<script>");
    expect((tree.children[0] as TestHtmlNode).value).toMatch(
      /import _img\w+ from '\.\/test-image\.jpg\?enhanced'/,
    );
  });

  it("should handle config object with attributes and directives", () => {
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", class: "default-class" },
      imagetoolsDirectives: { width: 800, format: "webp" },
    };
    const plugin = enhancedImage(config);
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg?class=custom-class",
            alt: "Test",
          };
          visitor(imageNode);

          expect((imageNode as any).value).toContain(
            'class="default-class custom-class"',
          );
          expect((imageNode as any).value).toContain('loading="lazy"');
          expect((imageNode as any).value).toMatch(/src=\{_img\w+\}/);
        }
      },
    );

    plugin(tree);
  });

  it("should handle multiple images with unique import names", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };
    const processedNodes: any[] = [];

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode1: TestImageNode = {
            type: "image",
            url: "./image1.jpg",
            alt: "Image 1",
          };
          const imageNode2: TestImageNode = {
            type: "image",
            url: "./image2.jpg",
            alt: "Image 2",
          };

          visitor(imageNode1);
          visitor(imageNode2);

          processedNodes.push(imageNode1, imageNode2);
        }
      },
    );

    plugin(tree);

    // Each image should have an import name
    expect((processedNodes[0] as any).value).toMatch(/src=\{_img\w+\}/);
    expect((processedNodes[1] as any).value).toMatch(/src=\{_img\w+\}/);

    // Extract the import names to verify they're different
    const import1 = (processedNodes[0] as any).value.match(
      /src=\{(_img\w+)\}/,
    )?.[1];
    const import2 = (processedNodes[1] as any).value.match(
      /src=\{(_img\w+)\}/,
    )?.[1];
    expect(import1).toBeDefined();
    expect(import2).toBeDefined();
    expect(import1).not.toBe(import2);
  });

  it("should properly decode URI components in image URLs", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./image%20with%20spaces.jpg",
            alt: "Test",
          };
          visitor(imageNode);

          expect((imageNode as any).value).toContain("<enhanced:img");
        }
      },
    );

    plugin(tree);
  });

  it("should handle script tags with attributes", () => {
    const plugin = enhancedImage();
    const tree: TestTree = { type: "root", children: [] };

    (mockVisit.mockImplementation as any)(
      (tree: any, nodeType: string, visitor: VisitorFunction) => {
        if (nodeType === "image") {
          const imageNode: TestImageNode = {
            type: "image",
            url: "./test-image.jpg",
            alt: "Test",
          };
          visitor(imageNode);
        } else if (nodeType === "html") {
          const scriptNode: TestHtmlNode = {
            type: "html",
            value:
              '<script type="module" defer>\nconsole.log("existing");\n</script>',
          };
          visitor(scriptNode);

          expect(scriptNode.value).toMatch(/import _img\w+/);
          expect(scriptNode.value).toContain('console.log("existing");');
        }
      },
    );

    plugin(tree);
  });
});
