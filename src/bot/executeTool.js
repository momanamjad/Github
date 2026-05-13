import { 
    addRepository, deleteRepository, getStoredRepositories,
    starRepository, unstarRepository, 
    pinRepository, unpinRepository,
    updateStoredStatus
} from "../services/storageService";

export async function executeTool(toolName, toolArgs) {
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

    if (toolName === "runTerminalCommand") {
        window.dispatchEvent(new CustomEvent('buddy_terminal_command', { detail: { command: toolArgs.command } }));
        // We wait a bit to let the command run before potentially returning.
        // In a real app, we might want to wait for a completion event.
        return `Command "${toolArgs.command}" sent to terminal.`;
    }

    if (toolName === "getTerminalOutput") {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve("Failed to get terminal output (timeout). Make sure you are on the /terminal page.");
            }, 1000);

            window.dispatchEvent(new CustomEvent('buddy_get_output', { 
                detail: { 
                    callback: (output) => {
                        clearTimeout(timeout);
                        resolve(output || "Terminal is empty.");
                    } 
                } 
            }));
        });
    }

    return "Unknown tool.";
}