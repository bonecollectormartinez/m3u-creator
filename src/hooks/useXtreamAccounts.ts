import { useState, useEffect } from "react";
import { XtreamCredentials } from "@/types/xtream";

const STORAGE_KEY = "xtream-accounts";

export function useXtreamAccounts() {
  const [accounts, setAccounts] = useState<XtreamCredentials[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccounts(
          parsed.map((a: XtreamCredentials) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
          }))
        );
      } catch (e) {
        console.error("Error parsing xtream accounts:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveAccounts = (newAccounts: XtreamCredentials[]) => {
    setAccounts(newAccounts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
  };

  const addAccount = (
    name: string,
    serverUrl: string,
    username: string,
    password: string
  ): XtreamCredentials => {
    const newAccount: XtreamCredentials = {
      id: generateId(),
      name,
      serverUrl,
      username,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, updates: Partial<XtreamCredentials>) => {
    const newAccounts = accounts.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
    );
    saveAccounts(newAccounts);
  };

  const deleteAccount = (id: string) => {
    saveAccounts(accounts.filter((a) => a.id !== id));
  };

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
