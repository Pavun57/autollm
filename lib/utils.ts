import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combine Tailwind CSS classNames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

// Format time for display
export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

// Truncate text with ellipsis
export function truncate(str: string, length: number) {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length)}...`
}

// Convert milliseconds to readable time
export function formatTimeAgo(timestamp: Date) {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
  
  if (secondsAgo < 60) {
    return "just now"
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  } else {
    return formatDate(timestamp)
  }
}

// Generate a random ID
export function generateId(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const charactersLength = characters.length
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  
  return result
}
