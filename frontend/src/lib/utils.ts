import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
    }
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }

  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function calculateMatchScore(cvSkills: string[], jobRequirements: string[]): number {
  if (jobRequirements.length === 0) return 0

  const normalizedCVSkills = cvSkills.map(s => s.toLowerCase().trim())
  const normalizedJobReqs = jobRequirements.map(r => r.toLowerCase().trim())

  const matches = normalizedJobReqs.filter(req =>
    normalizedCVSkills.some(skill => skill.includes(req) || req.includes(skill))
  )

  return Math.round((matches.length / normalizedJobReqs.length) * 100)
}
