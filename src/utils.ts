/**
 * Configuration interface for enhanced image processing
 */
export interface EnhancedImageConfig {
  /** HTML attributes to apply to all images */
  attributes?: Record<string, string | number | boolean>;
  /** Imagetools directives to apply to all images */
  imagetoolsDirectives?: Record<string, string | number | boolean>;
}

/**
 * Result of processing image attributes and configuration
 */
export interface ProcessedAttributes {
  /** Combined CSS classes as attribute string */
  combinedClassesAttrStr: string;
  /** Combined HTML attributes as string */
  combinedAttributesStr: string;
  /** Combined imagetools directives as URL parameters */
  combinedDirectivesUrlParams: string;
}

/**
 * HTML attributes that should be treated as element attributes rather than image processing directives
 */
export const HTML_ATTRIBUTES: readonly string[] = [
  "fetchpriority",
  "loading",
  "decoding",
  "class",
] as const;

/**
 * Splits an object into two based on key inclusion in a provided array
 *
 * @param obj - Object to split
 * @param keys - Keys to use for splitting criteria
 * @returns Tuple of [included, excluded] objects
 */
export function splitObjectByKeys<T extends Record<string, any>>(
  obj: T,
  keys: readonly string[],
): [Record<string, any>, Record<string, any>] {
  const included: Record<string, any> = {};
  const excluded: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key)) {
      included[key] = value;
    } else {
      excluded[key] = value;
    }
  }

  return [included, excluded];
}

/**
 * Normalizes CSS class string into array of trimmed class names
 */
function normalizeClasses(
  classValue: string | number | boolean | undefined,
): string[] {
  if (!classValue || String(classValue).trim() === "") return [];

  return String(classValue)
    .trim()
    .split(/\s+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Merges CSS classes from multiple sources, removing duplicates
 */
function mergeClasses(configClasses: string[], queryClasses: string[]): string {
  const allClasses = new Set([...configClasses, ...queryClasses]);
  return allClasses.size > 0
    ? `class="${Array.from(allClasses).join(" ")}"`
    : "";
}

/**
 * Converts object entries to attribute string format
 */
function entriesToAttributeString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(
      ([key, value]) => key !== "class" || (value !== "" && value != null),
    )
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

/**
 * Converts object entries to URL parameter string format
 */
function entriesToUrlParams(obj: Record<string, any>): string {
  const params = Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return params ? `&${params}` : "";
}

/**
 * Processes image URL and configuration to generate combined attributes and directives
 *
 * @param nodeUrl - Image URL potentially containing query parameters
 * @param config - Configuration with default attributes and directives
 * @returns Processed attributes ready for component generation
 */
export function processAttributesAndConfig(
  nodeUrl: string,
  config: EnhancedImageConfig = {},
): ProcessedAttributes {
  // Deep clone config to prevent mutation side effects
  // See: https://github.com/lzinga/mdsvex-enhanced-images/issues/9
  const configCopy: EnhancedImageConfig = structuredClone(config);

  // Parse URL for clean query parameter extraction
  const url = new URL(nodeUrl, "http://localhost");
  const searchParams = new URLSearchParams(url.search);

  // Extract and process CSS classes
  const queryClasses = searchParams
    .getAll("class")
    .flatMap((entry) => entry.split(";"))
    .map((c) => c.trim())
    .filter(Boolean);

  const configClasses = normalizeClasses(configCopy.attributes?.class);
  const combinedClassesAttrStr = mergeClasses(configClasses, queryClasses);

  // Remove processed class parameters
  searchParams.delete("class");
  if (configCopy.attributes?.class) {
    delete configCopy.attributes.class;
  }

  // Split remaining URL parameters into HTML attributes vs image directives
  const urlParams = Object.fromEntries(searchParams);
  const [htmlAttributes, imageDirectives] = splitObjectByKeys(
    urlParams,
    HTML_ATTRIBUTES,
  );

  // Merge configuration with URL parameters (URL takes precedence)
  const combinedAttributes = {
    ...(configCopy.attributes ?? {}),
    ...htmlAttributes,
  };

  const combinedDirectives = {
    ...(configCopy.imagetoolsDirectives ?? {}),
    ...imageDirectives,
  };

  return {
    combinedClassesAttrStr,
    combinedAttributesStr: entriesToAttributeString(combinedAttributes),
    combinedDirectivesUrlParams: entriesToUrlParams(combinedDirectives),
  };
}
