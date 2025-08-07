import { describe, it, expect } from "vitest";
import {
  splitObjectByKeys,
  processAttributesAndConfig,
  type EnhancedImageConfig,
  type ProcessedAttributes,
} from "../src/utils.js";

describe("splitObjectByKeys", () => {
  it("should split object by given keys", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const keys = ["a", "c"];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({ a: 1, c: 3 });
    expect(excluded).toEqual({ b: 2, d: 4 });
  });

  it("should return empty included if no keys match", () => {
    const obj = { a: 1, b: 2 };
    const keys = ["c", "d"];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({});
    expect(excluded).toEqual({ a: 1, b: 2 });
  });

  it("should return empty excluded if all keys match", () => {
    const obj = { a: 1, b: 2 };
    const keys = ["a", "b"];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({ a: 1, b: 2 });
    expect(excluded).toEqual({});
  });

  it("should handle empty object", () => {
    const obj = {};
    const keys = ["a", "b"];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({});
    expect(excluded).toEqual({});
  });

  it("should handle empty keys array", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const keys: string[] = [];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({});
    expect(excluded).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should handle null and undefined values", () => {
    const obj = { a: null, b: undefined, c: 0, d: false, e: "" };
    const keys = ["a", "c", "e"];
    const [included, excluded] = splitObjectByKeys(obj, keys);
    expect(included).toEqual({ a: null, c: 0, e: "" });
    expect(excluded).toEqual({ b: undefined, d: false });
  });
});

describe("processAttributesAndConfig", () => {
  it("should correctly parse and combine attributes and directives from URL and config", () => {
    const nodeUrl =
      "./image.jpg?class=img-class;another-class&fetchpriority=high&custom=customValue";
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", decoding: "async", class: "configClass" },
      imagetoolsDirectives: { blur: 3, rotate: 90 },
    };
    const result: ProcessedAttributes = processAttributesAndConfig(
      nodeUrl,
      config,
    );
    expect(result.combinedClassesAttrStr).toBe(
      'class="configClass img-class another-class"',
    );
    expect(result.combinedAttributesStr).toBe(
      'loading="lazy" decoding="async" fetchpriority="high"',
    );
    expect(result.combinedDirectivesUrlParams).toBe(
      "&blur=3&rotate=90&custom=customValue",
    );
  });

  it("Multiple images should correctly be processed (no side-effects, correct parsing)", () => {
    const nodeUrl =
      "./image.jpg?class=img-class;another-class&fetchpriority=high&custom=customValue";
    const nodeUrl2 =
      "./image.jpg?class=img-class&fetchpriority=high&custom=customValue";
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", decoding: "async", class: "configClass" },
      imagetoolsDirectives: { blur: 3, rotate: 90 },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    const result2 = processAttributesAndConfig(nodeUrl2, config);
    expect(result.combinedClassesAttrStr).toBe(
      'class="configClass img-class another-class"',
    );
    expect(result.combinedAttributesStr).toBe(
      'loading="lazy" decoding="async" fetchpriority="high"',
    );
    expect(result.combinedDirectivesUrlParams).toBe(
      "&blur=3&rotate=90&custom=customValue",
    );
    expect(result2.combinedClassesAttrStr).toBe(
      'class="configClass img-class"',
    );
    expect(result2.combinedAttributesStr).toBe(
      'loading="lazy" decoding="async" fetchpriority="high"',
    );
    expect(result2.combinedDirectivesUrlParams).toBe(
      "&blur=3&rotate=90&custom=customValue",
    );
  });

  it("should correctly parse, deduplicate and combine repeated and dubiously expressed css classes ", () => {
    const nodeUrl =
      "./image.jpg?class=img-class;another-class&class=myclass;myclass2&class=myclass3&class=myclass3&fetchpriority=high&custom=customValue";
    const config: EnhancedImageConfig = {
      attributes: {
        loading: "lazy",
        class: " dubiousInConfig myclass",
        decoding: "async",
      },
      imagetoolsDirectives: { blur: 3, rotate: 90 },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe(
      'class="dubiousInConfig myclass img-class another-class myclass2 myclass3"',
    );
    expect(result.combinedAttributesStr).toBe(
      'loading="lazy" decoding="async" fetchpriority="high"',
    );
    expect(result.combinedDirectivesUrlParams).toBe(
      "&blur=3&rotate=90&custom=customValue",
    );
  });

  it("should handle empty config (with url parameters)", () => {
    const nodeUrl = "./image.jpg?class=img-class&fetchpriority=high";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe('class="img-class"');
    expect(result.combinedAttributesStr).toBe('fetchpriority="high"');
    expect(result.combinedDirectivesUrlParams).toBe("");
  });

  it("should handle empty config and empty url parameters)", () => {
    const nodeUrl = "./image.jpg";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe("");
    expect(result.combinedAttributesStr).toBe("");
    expect(result.combinedDirectivesUrlParams).toBe("");
  });

  it("should handle empty config members and empty url parameters)", () => {
    const nodeUrl = "./image.jpg";
    const config: EnhancedImageConfig = {
      attributes: {},
      imagetoolsDirectives: {},
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe("");
    expect(result.combinedAttributesStr).toBe("");
    expect(result.combinedDirectivesUrlParams).toBe("");
  });

  it("should handle empty URL parameters", () => {
    const nodeUrl = "./image.jpg";
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", decoding: "async" },
      imagetoolsDirectives: { blur: 3, rotate: 90 },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe("");
    expect(result.combinedAttributesStr).toBe(
      'loading="lazy" decoding="async"',
    );
    expect(result.combinedDirectivesUrlParams).toBe("&blur=3&rotate=90");
  });

  it("should give precedence to URL parameters over config", () => {
    const nodeUrl = "http://localhost/image.jpg?loading=eager&decoding=sync";
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", decoding: "async" },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedAttributesStr).toBe(
      'loading="eager" decoding="sync"',
    );
  });

  it("should handle malformed URLs gracefully", () => {
    const nodeUrl =
      "./image.jpg?class=test&=invalid&fetchpriority=high&=another-invalid";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe('fetchpriority="high"');
  });

  it("should handle special characters in class names", () => {
    const nodeUrl =
      "./image.jpg?class=test-class_with_underscores;class-with-dashes;class.with.dots";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe(
      'class="test-class_with_underscores class-with-dashes class.with.dots"',
    );
  });

  it("should handle encoded characters in URL parameters", () => {
    const nodeUrl =
      "./image.jpg?class=my%20class&fetchpriority=high&custom=value%26with%26ampersands";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe('class="my class"');
    expect(result.combinedAttributesStr).toBe('fetchpriority="high"');
    expect(result.combinedDirectivesUrlParams).toBe(
      "&custom=value&with&ampersands",
    );
  });

  it("should handle undefined config gracefully", () => {
    const nodeUrl = "./image.jpg?class=test&loading=lazy";
    const result = processAttributesAndConfig(nodeUrl, undefined);
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe('loading="lazy"');
    expect(result.combinedDirectivesUrlParams).toBe("");
  });

  it("should handle null config gracefully", () => {
    const nodeUrl = "./image.jpg?class=test&loading=lazy";
    const result = processAttributesAndConfig(nodeUrl, {});
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe('loading="lazy"');
    expect(result.combinedDirectivesUrlParams).toBe("");
  });

  it("should handle config with undefined attributes", () => {
    const nodeUrl = "./image.jpg?class=test";
    const config: EnhancedImageConfig = {
      attributes: undefined,
      imagetoolsDirectives: { blur: 5 },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe("");
    expect(result.combinedDirectivesUrlParams).toBe("&blur=5");
  });

  it("should handle config with undefined imagetoolsDirectives", () => {
    const nodeUrl = "./image.jpg?class=test&blur=10";
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy" },
      imagetoolsDirectives: undefined,
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe('loading="lazy"');
    expect(result.combinedDirectivesUrlParams).toBe("&blur=10");
  });

  it("should handle numeric values in attributes", () => {
    const nodeUrl = "./image.jpg?width=800&height=600";
    const config: EnhancedImageConfig = {
      attributes: { tabindex: -1 },
      imagetoolsDirectives: { quality: 85 },
    };
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedAttributesStr).toBe('tabindex="-1"');
    expect(result.combinedDirectivesUrlParams).toBe(
      "&quality=85&width=800&height=600",
    );
  });

  it("should handle boolean values in config", () => {
    const config: EnhancedImageConfig = {
      attributes: { hidden: true, disabled: false },
      imagetoolsDirectives: { progressive: true },
    };
    const nodeUrl = "./image.jpg";
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedAttributesStr).toBe('hidden="true" disabled="false"');
    expect(result.combinedDirectivesUrlParams).toBe("&progressive=true");
  });

  it("should handle extremely long class lists", () => {
    const longClassList = Array.from(
      { length: 50 },
      (_, i) => `class-${i}`,
    ).join(";");
    const nodeUrl = `./image.jpg?class=${longClassList}`;
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toContain('class="');
    expect(result.combinedClassesAttrStr.split(" ")).toHaveLength(50); // 50 classes
  });

  it("should handle empty string values in config", () => {
    const config: EnhancedImageConfig = {
      attributes: { loading: "", class: "" },
      imagetoolsDirectives: { format: "" },
    };
    const nodeUrl = "./image.jpg?fetchpriority=high";
    const result = processAttributesAndConfig(nodeUrl, config);
    expect(result.combinedClassesAttrStr).toBe("");
    expect(result.combinedAttributesStr).toBe(
      'loading="" fetchpriority="high"',
    );
    expect(result.combinedDirectivesUrlParams).toBe("&format=");
  });

  it("should preserve order of attributes from config and URL", () => {
    const config: EnhancedImageConfig = {
      attributes: { loading: "lazy", fetchpriority: "low", decoding: "async" },
    };
    const nodeUrl = "./image.jpg?fetchpriority=high&width=800";
    const result = processAttributesAndConfig(nodeUrl, config);
    // URL parameters take precedence and the order may vary
    expect(result.combinedAttributesStr).toContain('loading="lazy"');
    expect(result.combinedAttributesStr).toContain('fetchpriority="high"');
    expect(result.combinedAttributesStr).toContain('decoding="async"');
    expect(result.combinedDirectivesUrlParams).toBe("&width=800");
  });

  it("should handle fragment identifier in URL", () => {
    const nodeUrl = "./image.jpg?class=test&loading=lazy#fragment";
    const result = processAttributesAndConfig(nodeUrl);
    expect(result.combinedClassesAttrStr).toBe('class="test"');
    expect(result.combinedAttributesStr).toBe('loading="lazy"');
  });
});
