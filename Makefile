# eferro-picks-site Makefile
# Development and validation commands

.PHONY: help test test-integration test-coverage test-ui lint typecheck build dev validate clean local-setup

# Default target
help:
	@echo "Available targets:"
	@echo "  local-setup   - Set up local development environment"
	@echo "  validate      - Run all pre-commit validations (tests + lint + typecheck)"
	@echo "  test          - Run all unit tests with --run flag"
	@echo "  test-integration - Run integration tests (isolated)"
	@echo "  test-coverage - Run tests with coverage report"
	@echo "  test-ui       - Open visual test interface"
	@echo "  lint          - Run ESLint validation"
	@echo "  typecheck     - Run TypeScript type checking"
	@echo "  build         - Build production bundle"
	@echo "  dev           - Start development server"
	@echo "  clean         - Clean node_modules and reinstall"

# Core validation commands
test:
	@echo "🧪 Running unit tests..."
	npm test -- --run

test-integration:
	@echo "🧪 Running integration tests..."
	npx vitest run --config vitest.integration.config.ts

test-coverage:
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

test-ui:
	@echo "🧪 Opening test UI..."
	npm run test:ui

lint:
	@echo "🔍 Running ESLint..."
	npm run lint

typecheck:
	@echo "📝 Running TypeScript type check..."
	npx tsc --noEmit

# Development commands
build:
	@echo "🏗️ Building production bundle..."
	npm run build

dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Environment setup
local-setup:
	@echo "🔧 Setting up local development environment..."
	npm install
	@echo "🔒 Checking for security vulnerabilities..."
	npm audit fix || echo "⚠️  Manual review of vulnerabilities may be needed"
	@echo "✅ Local setup complete! Run 'make validate' to verify everything works."

# Utility commands
clean:
	@echo "🧹 Cleaning node_modules..."
	rm -rf node_modules package-lock.json
	npm install

# Pre-commit validation protocol
validate:
	@echo "🚦 Running pre-commit validation protocol..."
	@echo ""
	@echo "Step 1/4: Unit Test Validation"
	@$(MAKE) test
	@echo "✅ Unit tests passed!"
	@echo ""
	@echo "Step 2/4: Integration Test Validation"
	@$(MAKE) test-integration
	@echo "✅ Integration tests passed!"
	@echo ""
	@echo "Step 3/4: Linting Validation"
	@$(MAKE) lint
	@echo "✅ Linting passed!"
	@echo ""
	@echo "Step 4/4: Type Check"
	@$(MAKE) typecheck
	@echo "✅ Type check passed!"
	@echo ""
	@echo "🎉 All validations passed! Code is ready to commit."