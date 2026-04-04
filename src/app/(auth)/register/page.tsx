'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, ArrowRight, Upload, Globe, Check, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

type Step = 1 | 2 | 3 | 4

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const maritalOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const workTypeOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'content writing', label: 'Content Writing' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'product management', label: 'Product Management' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR / Recruitment' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const router = useRouter()

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')

  // Step 2: Your Work & Experience
  const [workType, setWorkType] = useState('')
  const [specialization, setSpecialization] = useState('')

  // Step 3: Professional Profile
  const [profileMode, setProfileMode] = useState<'cv' | 'website'>('website')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Step 4: Account Creation
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Google reCAPTCHA v3 (invisible, score-based)
  const recaptchaLoaded = useRef(false)

  // Honeypot — invisible to humans, bots fill it in
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    if (recaptchaLoaded.current) return
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey) return
    recaptchaLoaded.current = true
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  const getRecaptchaToken = useCallback(async (): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey || !window.grecaptcha) return ''
    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        const token = await window.grecaptcha!.execute(siteKey, { action: 'register' })
        resolve(token)
      })
    })
  }, [])

  function canProceedStep1() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ageNum = parseInt(age);
    return firstName.trim() && lastName.trim() && emailRegex.test(email) && ageNum >= 16 && ageNum <= 65 && sex && maritalStatus
  }

  function canProceedStep2() {
    return !!workType
  }

  function canProceedStep3() {
    if (profileMode === 'cv') return !!cvUrl;
    if (profileMode === 'website') {
      try { const u = new URL(websiteUrl); return ['http:', 'https:'].includes(u.protocol); }
      catch { return false; }
    }
    return false;
  }

  function canProceedStep4() {
    return password && confirmPassword && password === confirmPassword && password.length >= 8 && acceptTerms
  }

  async function handleCvUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('File size must be under 10MB'); return; }
    setIsUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/academy/register/upload-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setCvUrl(data.cv_url)
      setCvFile(file)
    } catch {
      setError('Failed to upload CV. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit() {
    // Honeypot check — if filled, silently reject (bots won't notice)
    if (honeypot) return

    setError('')
    setIsLoading(true)

    try {
      // Get reCAPTCHA v3 token (invisible, no user interaction)
      const recaptchaToken = await getRecaptchaToken()

      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone: phone || undefined,
        age: parseInt(age),
        sex,
        marital_status: maritalStatus,
        cv_url: profileMode === 'cv' ? cvUrl : undefined,
        website_url: profileMode === 'website' ? websiteUrl : undefined,
        work_type: workType || undefined,
        specialization: specialization || undefined,
        recaptcha_token: recaptchaToken,
      })
      router.push(`/register/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">AI Talent Academy</span>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s < step
                    ? 'bg-indigo-600 text-white'
                    : s === step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-8 h-0.5 ${s < step ? 'bg-indigo-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Personal Information</h1>
              <p className="text-gray-600 mb-6">Tell us about yourself.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="register-firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="register-lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="register-age" className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      id="register-age"
                      type="number"
                      min="16"
                      max="65"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="register-sex" className="block text-sm font-medium text-gray-700 mb-1">Sex *</label>
                    <select
                      id="register-sex"
                      required
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {sexOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="register-maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status *
                    </label>
                    <select
                      id="register-maritalStatus"
                      required
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {maritalOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1()}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Your Work & Experience */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Work & Experience</h1>
              <p className="text-gray-600 mb-6">
                Help us personalize your learning experience.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="register-workType" className="block text-sm font-medium text-gray-700 mb-1">
                    What type of work do you do? *
                  </label>
                  <select
                    id="register-workType"
                    required
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select your field</option>
                    {workTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="register-specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    What&apos;s your specialization? (optional)
                  </label>
                  <input
                    id="register-specialization"
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Technical SEO, UI Design, Data Analysis"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    This helps us tailor AI tool suggestions to your specific needs
                  </p>
                </div>

                {workType && (
                  <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-800">Great choice!</p>
                    </div>
                    <p className="text-xs text-indigo-600">
                      We&apos;ll customize your lesson prompts and AI suggestions for {workType}{specialization ? ` (${specialization})` : ''}.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Professional Profile */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Professional Profile</h1>
              <p className="text-gray-600 mb-6">
                Upload your CV/resume or provide a website link.
              </p>

              {/* Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200 mb-6">
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-l-lg bg-white text-gray-600 opacity-50 cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  Upload CV (Coming Soon)
                </button>
                <button
                  onClick={() => setProfileMode('website')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-r-lg transition-colors ${
                    profileMode === 'website'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Website URL
                </button>
              </div>

              {profileMode === 'cv' ? (
                <div>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      cvUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleCvUpload(file)
                    }}
                  >
                    {cvUrl ? (
                      <div>
                        <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">
                          {cvFile?.name || 'CV uploaded'}
                        </p>
                        <button
                          onClick={() => {
                            setCvUrl('')
                            setCvFile(null)
                          }}
                          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Replace file
                        </button>
                      </div>
                    ) : isUploading ? (
                      <div>
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag and drop your CV here, or{' '}
                          <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleCvUpload(file)
                              }}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="register-websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL *
                  </label>
                  <input
                    id="register-websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Account Creation */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h1>
              <p className="text-gray-600 mb-6">Set your password to get started.</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Min 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    id="register-confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords don&apos;t match</p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Honeypot — invisible to humans */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <input
                    type="text"
                    name="website_url_confirm"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedStep4() || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
