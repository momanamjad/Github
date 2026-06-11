export const buddyTools = [
    {
        name: "createRepo",
        description: "Creates a new repository",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name" }
            },
            required: ["name"]
        }
    },
    {
        name: "deleteRepo",
        description: "Deletes a repository by name",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name to delete" }
            },
            required: ["name"]
        }
    },
    {
        name: "listRepos",
        description: "Lists all repositories",
        parameters: {
            type: "object",
            properties: {}
        }
    },
    {
        name: "starRepo",
        description: "Stars an existing repository by name",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name to star" }
            },
            required: ["name"]
        }
    },
    {
        name: "unstarRepo",
        description: "Unstars a repository by name",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name to unstar" }
            },
            required: ["name"]
        }
    },
    {
        name: "pinRepo",
        description: "Pins a repository to the user overview",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name to pin" }
            },
            required: ["name"]
        }
    },
    {
        name: "unpinRepo",
        description: "Unpins a repository from the user overview",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "The repo name to unpin" }
            },
            required: ["name"]
        }
    },
    {
        name: "updateStatus",
        description: "Updates the user's GitHub profile status",
        parameters: {
            type: "object",
            properties: {
                emoji: { type: "string", description: "An emoji to display" },
                text: { type: "string", description: "A short status text phrase" }
            },
            required: ["emoji", "text"]
        }
    },
    {
        name: "openPage",
        description: "Navigates the user to a specific page within the app. Available paths: / (home), /repositories, /projects, /issues, /pull-requests, /profile/stars, /moman (overview), /new (create repo page), /terminal (terminal page)",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The URL path to navigate to" }
            },
            required: ["path"]
        }
    },
    {
        name: "runTerminalCommand",
        description: "Runs a command in the terminal (PowerShell). Use this to help the user with CLI tasks, git, or exploring files.",
        parameters: {
            type: "object",
            properties: {
                command: { type: "string", description: "The command to run (e.g. 'git status', 'ls -la', 'npm install')" }
            },
            required: ["command"]
        }
    },
    {
        name: "getTerminalOutput",
        description: "Retrieves the current visible content from the terminal to understand the context or results of commands.",
        parameters: {
            type: "object",
            properties: {}
        }
    }
]