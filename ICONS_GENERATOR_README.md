# Icon Generator Scripts

This project contains two Node.js scripts designed to automate the extraction and generation of reusable SVG React components. These scripts help transition the codebase from using inline, hardcoded `<svg>` tags to standardized, reusable `<IconName />` components, improving code organization and maintainability.

## Scripts Overview

### 1. `generate_icons.cjs`
This was the initial script used to extract the first batch of inline SVGs found primarily in the layout components, such as `GithubOpenMenu.jsx` and `ProfileSidebar.jsx`.

**Generated Icons Include:**
- Layout menu icons (e.g., `MenuIcon`, `CrossIcon`, `HomeIcon`)
- Profile sidebar icons (e.g., `CompanyIcon`, `LocationIcon`, `EmailIcon`, `ReposotoryIcon`)
- Various GitHub feature icons (e.g., `CopilotIcon`, `CodeSpacesIcon`)

### 2. `generate_more_icons.cjs`
This supplementary script was created to address the remaining inline SVGs discovered within the main application pages (`Repositories.jsx`, `Projects.jsx`, `PullRequests.jsx`, `Issues.jsx`, `Discussions.jsx`).

**Generated Icons Include:**
- Empty state illustrations (e.g., `EmptyStateSearchIcon`, `EmptyStateClockIcon`)
- Status indicators for pull requests (e.g., `StatusOpenIcon`, `StatusMergedIcon`)
- Specific page tab icons (e.g., `TabUserIcon`, `TabClockIcon`)
- Utility icons (e.g., `SearchCloseIcon`, `ActivityGraphIcon`)

## How It Works

Both scripts follow a simple, programmatic approach to file generation:

1. **Path Resolution:** The scripts define an absolute path pointing to `src/components/ui/icons/` to ensure files are placed in the correct standardized directory.
2. **Directory Creation:** If the target directory does not exist, the scripts use `fs.mkdirSync` with `{ recursive: true }` to automatically create it.
3. **Icon Definition:** The scripts hold a large configuration object (`icons`) where each key is the desired PascalCase component name (e.g., `ActivityGraphIcon`), and the value is a stringified version of the complete React functional component housing the SVG.
4. **Iterative File Writing:** The scripts iterate through the `icons` object and use `fs.writeFileSync` to create individual `.jsx` files (e.g., `ActivityGraphIcon.jsx`) injecting the React component string.

## Usage

If you need to regenerate the icons or if you add new icons to the scripts, you can run them from the root of the project using Node.js:

```bash
node generate_icons.cjs
node generate_more_icons.cjs
```

## Adding New Icons

To add a new icon dynamically using these scripts:
1. Open either `.cjs` script depending on categorization.
2. Add a new key-value pair to the `icons` object. 
3. The key should be the component name. The value should be a template literal containing the React component and SVG markup. 
4. **Important**: Always verify that the SVG inside the script has its attributes converted to camelCase (e.g., `stroke-width` -> `strokeWidth`, `fill-rule` -> `fillRule`) for React compatibility, and pass `{...props}` to the `<svg>` tag so that classes and styles can be applied gracefully.
5. Re-run the script.

## Goal

By standardizing icons into reusable components located in `src/components/ui/icons`, the project benefits from:
- A cleaner DOM payload and cleaner component files (removing monolithic inline SVGs).
- A single source of truth for icons, making systemic design updates drastically easier to implement.
- Greater standard styling control via Tailwind class injections on the `props` layer.
