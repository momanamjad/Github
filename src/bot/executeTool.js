import { 
    addRepository, deleteRepository, getStoredRepositories,
    starRepository, unstarRepository, 
    pinRepository, unpinRepository,
    updateStoredStatus
} from "../services/storageService";

export function executeTool(toolName, toolArgs) {
    if (toolName === "createRepo") {
        const newRepo = { name: toolArgs.name, description: "" };
        try {
            addRepository(newRepo);
            window.dispatchEvent(new CustomEvent('github_repos_updated'));
            window.dispatchEvent(new CustomEvent('github_navigate', { detail: { path: '/repositories' } }));
            return `Repo "${toolArgs.name}" created successfully. Navigating to repositories...`;
        } catch (error) {
            return `Failed to create repository: ${error.message}`;
        }
    }

    if (toolName === "deleteRepo") {
        const repos = getStoredRepositories();
        const repoToDelete = repos.find(r => r.name === toolArgs.name);
        if (repoToDelete) {
            deleteRepository(repoToDelete.id);
            window.dispatchEvent(new CustomEvent('github_repos_updated'));
            return `Repo "${toolArgs.name}" deleted.`;
        }
        return `Repo "${toolArgs.name}" not found.`;
    }

    if (toolName === "listRepos") {
        const repos = getStoredRepositories();
        return repos.map(r => r.name).join(", ") || "No repos yet.";
    }

    if (toolName === "starRepo") {
        const repos = getStoredRepositories();
        const r = repos.find(r => r.name === toolArgs.name);
        if (!r) return `Repo "${toolArgs.name}" not found.`;
        starRepository(r);
        return `Successfully starred "${toolArgs.name}".`;
    }

    if (toolName === "unstarRepo") {
        const repos = getStoredRepositories();
        const r = repos.find(r => r.name === toolArgs.name);
        if (!r) return `Repo "${toolArgs.name}" not found.`;
        // storage expects 'full_name' for unstarring which is usually owner/name
        const fullName = r.full_name || `${r.owner?.login}/${r.name}`;
        unstarRepository(fullName);
        return `Successfully unstarred "${toolArgs.name}".`;
    }

    if (toolName === "pinRepo") {
        const repos = getStoredRepositories();
        const r = repos.find(r => r.name === toolArgs.name);
        if (!r) return `Repo "${toolArgs.name}" not found.`;
        pinRepository(r);
        return `Successfully pinned "${toolArgs.name}".`;
    }

    if (toolName === "unpinRepo") {
        unpinRepository(toolArgs.name);
        return `Successfully unpinned "${toolArgs.name}".`;
    }

    if (toolName === "updateStatus") {
        updateStoredStatus({
            emoji: toolArgs.emoji,
            text: toolArgs.text,
            isBusy: false
        });
        // Note: updateStoredStatus handles dispatching its own update event!
        return `Status updated to ${toolArgs.emoji} ${toolArgs.text}`;
    }

    if (toolName === "openPage") {
        window.dispatchEvent(new CustomEvent('github_navigate', { detail: { path: toolArgs.path } }));
        return `Navigating to ${toolArgs.path}...`;
    }

    return "Unknown tool.";
}