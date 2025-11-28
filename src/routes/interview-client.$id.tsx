import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getQuestionnaire, submitQuestionnaire, uploadFiles, submitFeedback, type Questionnaire, type QuestionnaireAnswer } from '../services/firebase'
import { useTheme } from '../contexts/ThemeContext'

export const Route = createFileRoute('/interview-client/$id' as never)({
  component: InterviewClient,
})

function InterviewClient() {
  const { id } = Route.useParams()
  const { theme, toggleTheme } = useTheme()
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<Record<string, string[]>>({})
  const [otherText, setOtherText] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File[]>>({})
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const questionsPerPage = 5
  
  // Get images from description blocks
  const imageBlocks = questionnaire?.descriptionBlocks?.filter(block => block.type === 'image') || []
  const textBlocks = questionnaire?.descriptionBlocks?.filter(block => block.type === 'text') || []
  
  // Pagination helpers
  const totalQuestions = questionnaire?.questions.length || 0
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
  const startIndex = currentPage * questionsPerPage
  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions)
  const currentQuestions = questionnaire?.questions.slice(startIndex, endIndex) || []
  
  // Calculate answered questions
  const answeredQuestions = questionnaire?.questions.filter(q => {
    if (q.type === 'file' || q.type === 'audio') {
      return files[q.id] && files[q.id].length > 0
    }
    if (q.type === 'multiple-choice') {
      return multipleChoiceAnswers[q.id] && multipleChoiceAnswers[q.id].length > 0
    }
    return answers[q.id] && answers[q.id].trim() !== ''
  }).length || 0
  
  function nextPage() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
      setTimeout(() => {
        document.getElementById('questionnaire-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }
  
  function prevPage() {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      setTimeout(() => {
        document.getElementById('questionnaire-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }
  
  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % imageBlocks.length)
  }
  
  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + imageBlocks.length) % imageBlocks.length)
  }

  useEffect(() => {
    loadQuestionnaire()
    checkIfAlreadySubmitted()
  }, [id])

  function checkIfAlreadySubmitted() {
    const submitted = localStorage.getItem(`questionnaire_${id}_submitted`)
    if (submitted === 'true') {
      setSubmitted(true)
    }
  }

  async function loadQuestionnaire() {
    try {
      setLoading(true)
      const data = await getQuestionnaire(id)

      if (!data) {
        setError('Questionário não encontrado')
        return
      }

      setQuestionnaire(data)
    } catch (err) {
      setError('Erro ao carregar questionário')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleTextChange(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleFileChange(questionId: string, selectedFiles: FileList | null) {
    if (!selectedFiles) return

    const fileArray = Array.from(selectedFiles)
    setFiles(prev => ({ ...prev, [questionId]: fileArray }))
  }

  function handleSingleChoiceChange(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleMultipleChoiceChange(questionId: string, value: string, checked: boolean) {
    setMultipleChoiceAnswers(prev => {
      const current = prev[questionId] || []
      if (checked) {
        return { ...prev, [questionId]: [...current, value] }
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value) }
      }
    })
  }

  function handleOtherTextChange(questionId: string, value: string) {
    setOtherText(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!questionnaire) return

    // Validate required fields
    const missingRequired = questionnaire.questions
      .filter(q => q.required)
      .filter(q => {
        if (q.type === 'file' || q.type === 'audio') {
          return !files[q.id] || files[q.id].length === 0
        }
        if (q.type === 'multiple-choice') {
          const hasSelection = multipleChoiceAnswers[q.id] && multipleChoiceAnswers[q.id].length > 0
          const hasOther = multipleChoiceAnswers[q.id]?.includes('other') && otherText[q.id]?.trim()
          return !hasSelection || (multipleChoiceAnswers[q.id]?.includes('other') && !hasOther)
        }
        if (q.type === 'single-choice') {
          const hasSelection = answers[q.id]
          const isOther = answers[q.id] === 'other'
          return !hasSelection || (isOther && !otherText[q.id]?.trim())
        }
        return !answers[q.id] || answers[q.id].trim() === ''
      })

    if (missingRequired.length > 0) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Upload files and prepare answers
      const questionnaireAnswers: QuestionnaireAnswer[] = []

      for (const question of questionnaire.questions) {
        if ((question.type === 'file' || question.type === 'audio') && files[question.id]) {
          // Upload files
          const fileUrls = await uploadFiles(files[question.id], id, question.id)
          questionnaireAnswers.push({
            id: crypto.randomUUID(),
            questionId: question.id,
            questionText: question.text,
            answer: `${files[question.id].length} arquivo(s) enviado(s)`,
            fileUrls,
            createdAt: new Date().toISOString()
          })
        } else if (question.type === 'multiple-choice' && multipleChoiceAnswers[question.id]) {
          // Handle multiple choice
          const selectedOptions = multipleChoiceAnswers[question.id].map(opt => {
            if (opt === 'other') {
              return `Outro: ${otherText[question.id] || ''}`
            }
            return opt
          })
          questionnaireAnswers.push({
            id: crypto.randomUUID(),
            questionId: question.id,
            questionText: question.text,
            answer: selectedOptions.join(', '),
            createdAt: new Date().toISOString()
          })
        } else if (question.type === 'single-choice' && answers[question.id]) {
          // Handle single choice
          let answer = answers[question.id]
          if (answer === 'other') {
            answer = `Outro: ${otherText[question.id] || ''}`
          }
          questionnaireAnswers.push({
            id: crypto.randomUUID(),
            questionId: question.id,
            questionText: question.text,
            answer,
            createdAt: new Date().toISOString()
          })
        } else if ((question.type === 'text' || question.type === 'textarea') && answers[question.id]) {
          // Handle text/textarea with optional media
          const answer: QuestionnaireAnswer = {
            id: crypto.randomUUID(),
            questionId: question.id,
            questionText: question.text,
            answer: answers[question.id],
            createdAt: new Date().toISOString()
          }

          // If media is attached, upload it
          if (question.allowMedia && files[question.id] && files[question.id].length > 0) {
            const fileUrls = await uploadFiles(files[question.id], id, question.id)
            answer.fileUrls = fileUrls
          }

          questionnaireAnswers.push(answer)
        } else if (answers[question.id]) {
          questionnaireAnswers.push({
            id: crypto.randomUUID(),
            questionId: question.id,
            questionText: question.text,
            answer: answers[question.id],
            createdAt: new Date().toISOString()
          })
        }
      }

      // Submit answers
      await submitQuestionnaire(id, questionnaireAnswers)

      // Save to localStorage to prevent duplicate submissions
      localStorage.setItem(`questionnaire_${id}_submitted`, 'true')

      // Show feedback modal instead of submitted screen
      setShowFeedbackModal(true)
    } catch (err) {
      setError('Erro ao enviar respostas. Tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFeedbackSubmit() {
    if (feedbackRating === 0) return

    try {
      setSubmittingFeedback(true)
      await submitFeedback(id, feedbackRating, feedbackComment || undefined)
      setFeedbackSubmitted(true)
      
      // After a short delay, show the submitted screen
      setTimeout(() => {
        setShowFeedbackModal(false)
        setSubmitted(true)
      }, 1500)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      // Even if feedback fails, show submitted screen
      setShowFeedbackModal(false)
      setSubmitted(true)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  function skipFeedback() {
    setShowFeedbackModal(false)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with theme toggle */}
        <header className="fixed w-full z-50 bg-background/80 backdrop-blur-lg shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <img
                  src={theme === 'dark' ? "/images/iconWhiteNovo.png" : "/images/iconNovo3.png"}
                  alt="Logo"
                  className="w-10 h-10"
                />
                <span className="text-lg font-bold tracking-tight text-foreground">brig.dev</span>
              </div>

              <button
                onClick={(e) => toggleTheme(e)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando questionário...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !questionnaire) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with theme toggle */}
        <header className="fixed w-full z-50 bg-background/80 backdrop-blur-lg shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <img
                  src={theme === 'dark' ? "/images/iconWhiteNovo.png" : "/images/iconNovo3.png"}
                  alt="Logo"
                  className="w-10 h-10"
                />
                <span className="text-lg font-bold tracking-tight text-foreground">brig.dev</span>
              </div>

              <button
                onClick={(e) => toggleTheme(e)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
            <svg
              className="w-16 h-16 text-destructive mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Erro</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with theme toggle */}
        <header className="fixed w-full z-50 bg-background/80 backdrop-blur-lg shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <img
                  src={theme === 'dark' ? "/images/iconWhiteNovo.png" : "/images/iconNovo3.png"}
                  alt="Logo"
                  className="w-10 h-10"
                />
                <span className="text-lg font-bold tracking-tight text-foreground">brig.dev</span>
              </div>

              <button
                onClick={(e) => toggleTheme(e)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
            <svg
              className="w-16 h-16 text-primary mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Enviado com sucesso!</h2>
            <p className="text-muted-foreground mb-6">Obrigado por responder ao questionário.</p>
            <a
              href="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Voltar para o Site
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <header className="fixed w-full z-50 bg-background/80 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img
                src={theme === 'dark' ? "/images/iconWhiteNovo.png" : "/images/iconNovo3.png"}
                alt="Logo"
                className="w-10 h-10"
              />
              <span className="text-lg font-bold tracking-tight text-foreground">brig.dev</span>
            </div>

            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content with padding for fixed header */}
      <div className="pt-28 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-muted/50 border border-border/50 rounded-xl p-8 shadow-2xl ring-1 ring-white/5">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{questionnaire?.title}</h1>
            <p className="text-muted-foreground mb-4">{questionnaire?.description}</p>
            
            {/* Blocos de conteúdo da descrição */}
            {questionnaire?.descriptionBlocks && questionnaire.descriptionBlocks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                {/* Textos */}
                {textBlocks.map((block) => (
                  <p key={block.id} className="text-foreground whitespace-pre-wrap">{block.content}</p>
                ))}
                
                {/* Carrossel de Imagens */}
                {imageBlocks.length > 0 && (
                  <div className="relative mt-4">
                    {/* Container do Carrossel */}
                    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-muted/50 to-primary/10 shadow-lg">
                      {/* Imagem Principal - Clicável para expandir */}
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="relative w-full aspect-[4/3] sm:aspect-video flex items-center justify-center cursor-zoom-in group"
                      >
                        <img 
                          src={imageBlocks[currentImageIndex]?.content} 
                          alt={`Imagem ${currentImageIndex + 1} de ${imageBlocks.length}`}
                          className="max-w-full max-h-full object-contain"
                        />
                        {/* Ícone de expandir */}
                        <div className="absolute top-3 right-3 p-2 bg-background/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                        {/* Hint para mobile */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 rounded-full text-xs text-muted-foreground sm:hidden">
                          Toque para ampliar
                        </div>
                      </button>
                      
                      {/* Setas de Navegação */}
                      {imageBlocks.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Imagem anterior"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Próxima imagem"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Contador */}
                      {imageBlocks.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium shadow-lg">
                          {currentImageIndex + 1} / {imageBlocks.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Miniaturas */}
                    {imageBlocks.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-1">
                        {imageBlocks.map((block, index) => (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex 
                                ? 'border-primary ring-2 ring-primary/30' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <img 
                              src={block.content} 
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Progress Header */}
          {totalQuestions > 0 && (
            <div className="mb-8 p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="font-medium">Progresso</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold whitespace-nowrap">
                    Página {currentPage + 1}/{totalPages}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    <span className="font-bold text-primary">{answeredQuestions}</span>/{totalQuestions} respondidas
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                  style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                />
              </div>
              
              {/* Page Indicators */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentPage(idx)
                        document.getElementById('questionnaire-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${
                        idx === currentPage
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form id="questionnaire-form" onSubmit={handleSubmit} className="space-y-6 scroll-mt-24">
            {/* Questions Range Info */}
            <div className="text-sm text-muted-foreground mb-4">
              Questões {startIndex + 1} a {endIndex} de {totalQuestions}
            </div>

            {currentQuestions.map((question, idx) => {
              const index = startIndex + idx
              return (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </label>

                {question.type === 'text' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                      required={question.required}
                    />
                    {question.allowMedia && (
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Anexar {question.mediaType === 'audio' ? 'áudio' : 'imagem'} (opcional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(question.id, e.target.files)}
                          accept={question.mediaType === 'audio' ? 'audio/*' : 'image/*'}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {files[question.id] && files[question.id].length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {files[question.id].length} arquivo(s) selecionado(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {question.type === 'textarea' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      required={question.required}
                    />
                    {question.allowMedia && (
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Anexar {question.mediaType === 'audio' ? 'áudio' : 'imagem'} (opcional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(question.id, e.target.files)}
                          accept={question.mediaType === 'audio' ? 'audio/*' : 'image/*'}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {files[question.id] && files[question.id].length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {files[question.id].length} arquivo(s) selecionado(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {question.type === 'single-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleSingleChoiceChange(question.id, e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                          required={question.required}
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}

                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={question.id}
                        value="other"
                        checked={answers[question.id] === 'other'}
                        onChange={(e) => handleSingleChoiceChange(question.id, e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary mt-1"
                        required={question.required}
                      />
                      <div className="flex-1">
                        <span className="block mb-2">Outro:</span>
                        <input
                          type="text"
                          value={otherText[question.id] || ''}
                          onChange={(e) => {
                            handleOtherTextChange(question.id, e.target.value)
                            if (!answers[question.id]) {
                              handleSingleChoiceChange(question.id, 'other')
                            }
                          }}
                          onClick={() => handleSingleChoiceChange(question.id, 'other')}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Especifique..."
                          disabled={answers[question.id] !== 'other'}
                        />
                      </div>
                    </label>
                  </div>
                )}

                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          value={option}
                          checked={multipleChoiceAnswers[question.id]?.includes(option) || false}
                          onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}

                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        value="other"
                        checked={multipleChoiceAnswers[question.id]?.includes('other') || false}
                        onChange={(e) => handleMultipleChoiceChange(question.id, 'other', e.target.checked)}
                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary mt-1"
                      />
                      <div className="flex-1">
                        <span className="block mb-2">Outro:</span>
                        <input
                          type="text"
                          value={otherText[question.id] || ''}
                          onChange={(e) => {
                            handleOtherTextChange(question.id, e.target.value)
                            if (!multipleChoiceAnswers[question.id]?.includes('other')) {
                              handleMultipleChoiceChange(question.id, 'other', true)
                            }
                          }}
                          onClick={() => {
                            if (!multipleChoiceAnswers[question.id]?.includes('other')) {
                              handleMultipleChoiceChange(question.id, 'other', true)
                            }
                          }}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Especifique..."
                          disabled={!multipleChoiceAnswers[question.id]?.includes('other')}
                        />
                      </div>
                    </label>
                  </div>
                )}

                {(question.type === 'file' || question.type === 'audio') && (
                  <div>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(question.id, e.target.files)}
                      accept={question.type === 'audio' ? 'audio/*' : 'image/*,video/*,.pdf,.doc,.docx'}
                      multiple
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      required={question.required}
                    />
                    {files[question.id] && files[question.id].length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {files[question.id].length} arquivo(s) selecionado(s)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )})}

            {/* Navigation Buttons */}
            <div className="pt-8 border-t border-border mt-8">
              {/* Page Info (Mobile) */}
              <div className="flex justify-center mb-4 sm:hidden">
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium whitespace-nowrap">
                  {currentPage + 1} de {totalPages}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    currentPage === 0
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Next or Submit Button */}
                {currentPage < totalPages - 1 ? (
                  <button
                    type="button"
                    onClick={nextPage}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    <span className="hidden sm:inline">Próximo</span>
                    <span className="sm:hidden">Avançar</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="hidden sm:inline">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Enviar Respostas</span>
                        <span className="sm:hidden">Enviar</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
            {feedbackSubmitted ? (
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-primary mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-bold">Obrigado pelo feedback!</h3>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-center mb-2">Como foi sua experiência?</h3>
                <p className="text-muted-foreground text-center text-sm mb-6">
                  Sua opinião nos ajuda a melhorar
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 transition-colors ${
                          star <= feedbackRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Optional Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Comentário (opcional)
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Conte-nos mais sobre sua experiência..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={skipFeedback}
                    className="flex-1 py-3 px-6 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Pular
                  </button>
                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackRating === 0 || submittingFeedback}
                    className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingFeedback ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Expand Modal */}
      {imageModalOpen && imageBlocks.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          {imageBlocks.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
              {currentImageIndex + 1} / {imageBlocks.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {imageBlocks.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Expanded Image */}
          <img
            src={imageBlocks[currentImageIndex]?.content}
            alt={`Imagem ${currentImageIndex + 1} de ${imageBlocks.length}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Thumbnails */}
          {imageBlocks.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-xl overflow-x-auto max-w-[90vw]">
              {imageBlocks.map((block, index) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-white' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={block.content} 
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
