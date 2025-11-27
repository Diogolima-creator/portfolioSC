import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getQuestionnaire, submitQuestionnaire, uploadFiles, type Questionnaire, type QuestionnaireAnswer } from '../services/firebase'
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
            answer,
            createdAt: new Date().toISOString()
          })
        } else if ((question.type === 'text' || question.type === 'textarea') && answers[question.id]) {
          // Handle text/textarea with optional media
          const answer: QuestionnaireAnswer = {
            id: crypto.randomUUID(),
            questionId: question.id,
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
            answer: answers[question.id],
            createdAt: new Date().toISOString()
          })
        }
      }

      // Submit answers
      await submitQuestionnaire(id, questionnaireAnswers)

      // Save to localStorage to prevent duplicate submissions
      localStorage.setItem(`questionnaire_${id}_submitted`, 'true')

      setSubmitted(true)
    } catch (err) {
      setError('Erro ao enviar respostas. Tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
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
          <div className="bg-card border border-border rounded-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{questionnaire?.title}</h1>
            <p className="text-muted-foreground">{questionnaire?.description}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {questionnaire?.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </label>

                {question.type === 'text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleTextChange(question.id, e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Respostas'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
