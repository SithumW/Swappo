import { createAuthClient } from "better-auth/react"
import { config } from "@/config/env"

console.log('[AuthClient] Initializing with baseURL:', config.api.baseUrl);

export const authClient = createAuthClient({
    baseURL: config.api.baseUrl,
    fetchOptions: {
        credentials: "include",
    },
})

// Export specific methods for easy use
export const {
    signIn,
    signUp,
    signOut,
    getSession,
    useSession,
    $Infer,
} = authClient;