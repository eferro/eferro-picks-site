# AI Agent Configuration

This directory contains configuration rules and guidelines for AI assistants working on the eferro-picks-site project.

## Files

### `rules/base.md`
Core development rules and guidelines extracted from the Cursor-specific configuration. These rules can be used across multiple AI platforms including:

- **Cursor AI**: Reference this file in your Cursor configuration
- **Google Gemini**: Include the content when setting up project context
- **Claude (Anthropic)**: Use as system context or project guidelines
- **OpenAI Codex**: Reference for coding assistance and code generation

## Usage Instructions

### For Cursor
The `.cursor/rules/eferro-picks-development.mdc` file now references the base rules instead of duplicating content. The Cursor-specific file includes:
- Reference to `.agents/rules/base.md` for complete rules
- Cursor-specific tool integration settings
- Quick reminders for critical project rules
- Development command shortcuts

To create similar references in other Cursor rule files:
```markdown
**📋 This file references the comprehensive development rules located at:**
**`.agents/rules/base.md`**
```

### For Claude/ChatGPT/Gemini
Copy and paste the contents of `base.md` as context when starting a new conversation about this project, or reference it when asking for development assistance.

### For API Integration
Include the rules as system context when making API calls to AI services for code assistance.

## Key Principles

The rules emphasize:
- **Test-Driven Development (TDD)**: Always write tests first
- **Centralized Filtering**: All filtering logic goes through `TalksFilter` class
- **TypeScript Best Practices**: Strict typing and proper interfaces
- **Accessibility**: Semantic HTML and ARIA compliance
- **Performance**: Optimized React patterns and useMemo usage

## Maintenance

When updating project conventions or architectural decisions:
1. Update `base.md` with the new rules
2. Sync changes to platform-specific configurations
3. Test the changes with actual AI interactions
4. Document any platform-specific adaptations needed