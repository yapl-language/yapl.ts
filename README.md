# <img src="https://yapl-language.github.io/assets/yapl-logo.svg" alt="YAPL" width="28" height="28" /> YAPL TypeScript

The official TypeScript implementation of YAPL (Yet Another Prompt Language) — a tiny, composable prompt templating language designed for AI agents.

<!-- existing badges (do not remove) -->

[![codecov](https://codecov.io/github/yapl-language/yapl.ts/graph/badge.svg?token=7dXxZ4CUM1)](https://codecov.io/github/yapl-language/yapl.ts)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/yapl-language/yapl.ts)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/yapl-language/yapl.ts/ci.yml)
![NPM Version](https://img.shields.io/npm/v/@yapl-language/yapl.ts)
![NPM Downloads](https://img.shields.io/npm/dm/@yapl-language/yapl.ts)
![GitHub top language](https://img.shields.io/github/languages/top/yapl-language/yapl.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white)](https://discord.gg/R5CsJHxTeZ)

Quick links: [Website](https://yapl-language.github.io) · [Documentation](https://yapl-language.github.io/documentation) · [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=EinfachAI.yapl) · [NPM Package](https://www.npmjs.com/package/@yapl-language/yapl.ts) · [Discord](https://discord.gg/R5CsJHxTeZ)

## ✨ Features

YAPL brings the power of modern templating to AI prompt engineering:

- **🧩 Template Inheritance** — Build complex prompts by extending base templates
- **🔀 Mixins & Composition** — Compose prompts from reusable components
- **🎯 Dynamic Variables** — Use variables with default values for flexibility
- **🔀 Conditional Logic** — Adapt prompts based on context and user types
- **📦 Modular Includes** — Break large prompts into manageable pieces
- **🌐 Universal** — Works in Node.js and browsers (ESM + CJS)
- **⚡ Fast** — Optimized rendering with smart caching

## 🚀 Installation

```bash
# npm
npm install @yapl-language/yapl.ts

# pnpm
pnpm add @yapl-language/yapl.ts

# yarn
yarn add @yapl-language/yapl.ts
```

## 📝 Quick Start

> 💡 **New to YAPL?** Visit the [website](https://yapl-language.github.io) for an overview and try the [interactive playground](https://yapl-language.github.io#playground) to experiment with templates in your browser. For comprehensive guides, check out the [documentation](https://yapl-language.github.io/documentation).

Create your first YAPL template:

```yapl
{# agent.md.yapl #}
{% extends "base/system.md.yapl" %}
{% mixin "mixins/friendly.md.yapl" %}

{% block persona %}
  You are {{ agent_name | default("a helpful AI assistant") }} specializing in {{ domain }}.
{% endblock %}

{% block guidance %}
  {{ super() }}
  {% if user_level == "beginner" %}
    Use simple language and provide step-by-step explanations.
  {% else %}
    You can use technical terminology and advanced concepts.
  {% endif %}
{% endblock %}
```

Render it with TypeScript:

```typescript
import { NodeYAPL } from "@yapl-language/yapl.ts";

const yapl = new NodeYAPL({ baseDir: "./prompts" });

const result = await yapl.render("agent.md.yapl", {
  agent_name: "CodeBot",
  domain: "software development",
  user_level: "beginner",
});

console.log(result.content);
```

> 📚 **Learn More**: Check out the [Quick Start Guide](https://yapl-language.github.io/documentation/quick-start/) for a step-by-step tutorial, or explore [Basic Examples](https://yapl-language.github.io/documentation/examples/basic/) to see more patterns.

## 🔧 API Reference

### Node.js Usage

```typescript
import { NodeYAPL } from "@yapl-language/yapl.ts";

const yapl = new NodeYAPL({
  baseDir: "./prompts",
  strictPaths: true,
  maxDepth: 10,
  whitespace: {
    trimBlocks: true,
    lstripBlocks: true,
    dedentBlocks: true,
  },
});

// Render a template file
const result = await yapl.render("template.yapl", variables);

// Render a string directly
const result = await yapl.renderString(templateSource, variables);
```

### Browser Usage

```typescript
import { YAPL } from "@yapl-language/yapl.ts";

const yapl = new YAPL({
  baseDir: "/templates",
  loadFile: async (path) => {
    const response = await fetch(path);
    return response.text();
  },
  resolvePath: (templateRef, fromDir, ensureExt) => {
    return new URL(ensureExt(templateRef), fromDir).href;
  },
});

const result = await yapl.renderString(templateSource, variables);
```

### Configuration Options

```typescript
interface YAPLOptions {
  baseDir: string; // Base directory for templates
  cache?: boolean; // Enable template caching (Node.js only)
  strictPaths?: boolean; // Strict path resolution (Node.js only)
  maxDepth?: number; // Maximum include/extend depth (default: 10)
  whitespace?: WhitespaceOptions; // Whitespace control options

  // Browser-specific options
  resolvePath?: (
    templateRef: string,
    fromDir: string,
    ensureExt: (p: string) => string
  ) => string;
  loadFile?: (absolutePath: string) => Promise<string>;
  ensureExtension?: (p: string) => string;
}
```

## 🎯 Language Concepts

> 📖 **Deep Dive**: For detailed explanations and advanced patterns, see the [Template Inheritance](https://yapl-language.github.io/documentation/features/inheritance/), [Mixins](https://yapl-language.github.io/documentation/features/mixins/), [Variables](https://yapl-language.github.io/documentation/features/variables/), and [Conditionals](https://yapl-language.github.io/documentation/features/conditionals/) guides.

### Template Inheritance

```yapl
{# base.yapl #}
{% block header %}
  Default Header
{% endblock %}
{% block content %}{% endblock %}

{# child.yapl #}
{% extends "base.yapl" %}
{% block content %}
  Child Content
{% endblock %}
```

### Mixins for Composition

```yapl
{# mixins/safety.yapl #}
{% block guidelines %}
  {{ super() }}
  - Never provide harmful information
{% endblock %}

{# agent.yapl #}
{% mixin "mixins/safety.yapl" %}
```

### Dynamic Variables

```yapl
Hello {{ name | default("there") }}!
{% if expertise %}
  You specialize in {{ expertise }}.
{% endif %}
```

### Conditional Logic

```yapl
{% if user_type == "developer" %}
  Technical documentation follows...
{% elif user_type == "designer" %}
  Design guidelines follow...
{% else %}
  General information follows...
{% endif %}
```

## 📚 Examples

> 🎯 **More Examples**: Explore [AI Agent Templates](https://yapl-language.github.io/documentation/examples/agents/) and [Complex Workflows](https://yapl-language.github.io/documentation/examples/workflows/) for real-world use cases.

### AI Agent Template

```yapl
{# coding-assistant.yapl #}
{% extends "base/agent.yapl" %}
{% mixin "mixins/helpful.yapl", "mixins/technical.yapl" %}

{% block persona %}
  You are {{ name | default("CodeBot") }}, an expert programming assistant.
{% endblock %}

{% block capabilities %}
  {{ super() }}
  - Write and review code
  - Debug complex issues
  - Explain programming concepts
  - Suggest optimizations
{% endblock %}

{% block guidelines %}
  {{ super() }}
  {% if user_level == "beginner" %}
    - Use simple explanations
    - Provide step-by-step guidance
    - Include plenty of examples
  {% else %}
    - Use technical terminology
    - Focus on best practices
    - Provide concise expert advice
  {% endif %}
{% endblock %}
```

### Multi-Context Prompt

```yapl
{# contextual-assistant.yapl #}
# {{ title | default("AI Assistant") }}

{% if context == "customer_support" %}
  You are a patient, empathetic customer support agent.
  Focus on resolving issues and ensuring customer satisfaction.
{% elseif context == "tutoring" %}
  You are an encouraging tutor who breaks down complex concepts.
  Check for understanding and provide practice opportunities.
{% else %}
  You are a helpful general assistant.
{% endif %}

{% include "components/safety-guidelines.yapl" %}
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Run tests with coverage
pnpm test

# Build the library
pnpm build

# Lint and format
pnpm run lint
pnpm run format

# Type checking
pnpm run typecheck

# Run all checks
pnpm run check
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [YAPL VS Code Extension](https://marketplace.visualstudio.com/items?itemName=EinfachAI.yapl) - Syntax highlighting and language support
- [YAPL Open VSX Extension](https://open-vsx.org/extension/EinfachAI/yapl) - For VSCodium and Code OSS users
- [YAPL Website](https://yapl-language.github.io) - Interactive playground and documentation

## 🐛 Issues & Support

- [GitHub Issues](https://github.com/yapl-language/yapl.ts/issues) - Bug reports and feature requests
- [Discord Community](https://discord.gg/R5CsJHxTeZ) - Get help and discuss YAPL
- [Documentation](https://yapl-language.github.io/documentation) - Comprehensive guides and examples

---

Made with 💖 for the AI community by [Einfach AI](https://einfachai.com)
