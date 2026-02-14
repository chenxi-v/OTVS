import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  sessionToken: string | null
  salt: string | null
  username: string | null
  isInitialized: boolean
}

interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  validateSession: () => Promise<boolean>
  getCurrentUsername: () => string | null
}

type AuthStore = AuthState & AuthActions

const generateSalt = () => {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const computeHash = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      salt: null,
      username: null,
      isInitialized: false,

      login: async (username: string, password: string) => {
        const correctUsername = import.meta.env.VITE_ACCESS_USERNAME
        const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD

        const hasUsername = !!correctUsername && correctUsername.trim() !== ''
        const hasPassword = !!correctPassword && correctPassword.trim() !== ''

        if (!hasUsername && !hasPassword) {
          return true
        }

        if (hasUsername && username !== correctUsername) {
          return false
        }

        if (hasPassword && password !== correctPassword) {
          return false
        }

        const salt = generateSalt()
        const token = await computeHash((correctUsername || '') + (correctPassword || '') + salt)
        set({
          sessionToken: token,
          salt,
          username: username || null,
          isInitialized: true,
        })
        return true
      },

      logout: () => set({ sessionToken: null, salt: null, username: null, isInitialized: true }),

      validateSession: async () => {
        const { sessionToken, salt } = get()
        const correctUsername = import.meta.env.VITE_ACCESS_USERNAME
        const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD

        const hasUsername = !!correctUsername && correctUsername.trim() !== ''
        const hasPassword = !!correctPassword && correctPassword.trim() !== ''

        if (!hasUsername && !hasPassword) {
          return true
        }

        if (!sessionToken || !salt) {
          return false
        }

        const expectedToken = await computeHash((correctUsername || '') + (correctPassword || '') + salt)
        if (sessionToken === expectedToken) {
          return true
        } else {
          set({ sessionToken: null, salt: null, username: null })
          return false
        }
      },

      getCurrentUsername: () => {
        const { username } = get()
        const correctUsername = import.meta.env.VITE_ACCESS_USERNAME
        const hasUsername = !!correctUsername && correctUsername.trim() !== ''

        if (!hasUsername) {
          return null
        }
        return username
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({ sessionToken: state.sessionToken, salt: state.salt, username: state.username }),
    },
  ),
)
