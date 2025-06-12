# eferro's picks

A curated collection of software development talks that I find interesting and valuable.

## Overview

This site showcases a handpicked selection of talks about software development, engineering practices, and technical leadership. The content is managed in Airtable and automatically synchronized with the site.

🌐 **Visit the site**: [eferro's picks](https://eferro.github.io/eferro-picks-site/)

📝 **Author's Blog**: [eferro's random stuff](https://www.eferro.net)

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Data Source**: Airtable
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions
- **Testing**: Vitest + Testing Library (robust coverage for all filters, including Author Filter)

## Architecture

The site follows a simple and efficient architecture:

1. **Data Management**:
   - All talk data is managed in Airtable
   - GitHub Actions syncs data every 6 hours
   - Data is stored as JSON in the `public/data` directory

2. **Frontend**:
   - React components for UI
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Client-side routing with React Router

3. **Deployment**:
   - Hosted on GitHub Pages
   - Automatic builds and deployments via GitHub Actions

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/eferro/eferro-picks-site.git
   cd eferro-picks-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The project uses **Vitest** and **Testing Library** for unit and integration tests. The test suite provides robust coverage for all major features, including:

- UI rendering and interaction for all filters (topics, rating, notes, author, etc.)
- URL parameter updates and state management
- Filtering logic and edge cases

To run the tests locally:

```bash
npm test
```

Tests are run automatically in CI to ensure code quality and prevent regressions. Contributions should include relevant tests for new features or bug fixes.

## Data Updates

The site's content is automatically updated through GitHub Actions:

- **Scheduled Updates**: Every 6 hours
- **Manual Updates**: Available through GitHub Actions UI
- **Force Updates**: Option available in manual triggers

## Environment Variables

The following secrets need to be configured in GitHub repository settings:

- `AIRTABLE_API_KEY`: Your Airtable API key
- `AIRTABLE_DATABASE_ID`: Your Airtable base ID
- `GH_ACTIONS_PAT`: GitHub Personal Access Token for deployments

## Contributing

Feel free to suggest new talks or improvements by opening an issue or pull request.

## License

MIT License. See [LICENSE](LICENSE) for more information.
