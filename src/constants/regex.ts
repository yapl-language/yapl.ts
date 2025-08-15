export const EXTENDS_REGEX = /\{%-?\s*extends\s+"([^"]+)"\s*-?%\}/;
export const MIXIN_REGEX =
	/\{%-?\s*mixin\s+((?:"[^"]+"\s*,\s*)*"[^"]+")\s*-?%\}/g;
export const INCLUDE_REGEX =
	/\{%-?\s*include\s+"([^"]+)"(?:\s+with\s+(\{[\s\S]*?\}))?\s*-?%\}/g;
export const BLOCK_REGEX =
	/\{%-?\s*block\s+([a-zA-Z0-9_:-]+)\s*-?%\}([\s\S]*?)\{%-?\s*endblock\s*-?%\}/g;
export const VAR_REGEX =
	/\{\{-?\s*([a-zA-Z0-9_.]+)(?:\s*\|\s*default\((?:"([^"]*)"|'([^']*)')\))?\s*-?\}\}/g;
export const SUPER_REGEX = /\{\{-?\s*super\(\s*\)\s*-?\}\}/g;

// Comments
export const COMMENT_REGEX = /\{#-?[\s\S]*?-#\}|\{#[\s\S]*?#\}/g;

// If-else control structures
export const IF_REGEX =
	/\{%-?\s*if\s+([^%]+?)\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g;

// For loop control structures
export const FOR_REGEX =
	/\{%-?\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^%]+?)\s*-?%\}([\s\S]*?)\{%-?\s*endfor\s*-?%\}/g;
